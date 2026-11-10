#!/usr/bin/env python3
"""One-off remediation: WP.com images live at genevievebosah.wordpress.com/wp-content/uploads/*
(returned with ?w=&h= query variants; featured_image is a URL, not an ID).
The first import pass only matched *.files.wordpress.com — this script sideloads the
real images, rewrites content, and sets featured media on the affected posts.
Idempotent via the same state file as import_wpcom.py."""
import json, re, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE_FILE = ROOT / 'docs/legacy-wp-export/import-state.json'
WPCOM = 'https://genevievebosah.wordpress.com'
CMS = 'https://cms.genevievebosah.com/wp-json'
AUTH = 'Basic ' + __import__('base64').b64encode(b'gbblog:' + open(ROOT / '.wp-import-secret').read().strip().encode()).decode()

AFFECTED = [76, 157, 73, 174, 246, 259, 267, 293]
UP = r'https://genevievebosah\.wordpress\.com/wp-content/uploads/([^\s"\'?]+?)(?:&#038;|&|\?)[^\s"\']*|https://genevievebosah\.wordpress\.com/wp-content/uploads/([^\s"\'?]+)'

def http(method, url, body=None, ctype='application/json', extra=None, timeout=90):
    h = {'User-Agent': 'gb-import/1.0'}
    if ctype is not None: h['Content-Type'] = ctype
    if 'cms.genevievebosah.com' in url: h['Authorization'] = AUTH
    if extra: h.update(extra)
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read()

def http_json(method, url, body=None, **kw):
    s, raw = http(method, url, json.dumps(body).encode() if body is not None else None, **kw)
    return s, json.loads(raw.decode())

st = json.loads(STATE_FILE.read_text())
st.setdefault('media_ids', {})

def sideload(base_path):
    """base_path: uploads-relative path like 2015/08/img_2475.jpg. Returns (cms_media_id, new_url)."""
    if base_path in st['media_ids']:
        mid, url = st['media_ids'][base_path]
        return mid, url
    s, raw = http('GET', f'{WPCOM}/wp-content/uploads/{base_path}', body=None, ctype=None)
    fname = base_path.rsplit('/', 1)[-1]
    ext = fname.rsplit('.', 1)[-1].lower()
    mime = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif'}[ext]
    s2, resp = http('POST', CMS + '/wp/v2/media', raw, ctype=mime,
                    extra={'Content-Disposition': f'attachment; filename="{fname}"'})
    m = json.loads(resp.decode())
    assert s2 < 400, f'upload {s2} {m}'
    st['media_ids'][base_path] = (m['id'], m['source_url'])
    st['media'].setdefault(base_path, m['source_url'])
    return m['id'], m['source_url']

for pid in AFFECTED:
    s, src = http_json('GET', f'https://public-api.wordpress.com/rest/v1.1/sites/genevievebosah.wordpress.com/posts/{pid}')
    cms_id = st['posts'][str(pid)]['cms_id']
    s2, cur = http_json('GET', CMS + f'/wp/v2/posts/{cms_id}?context=edit')
    content = cur['content']['raw']
    # rewrite every upload-URL variant (with or without query) -> CMS URL
    def repl(m):
        base = m.group(1) or m.group(2)
        try:
            _, new = sideload(base)
            return new
        except Exception as ex:
            print(f'  ! {base}: {ex}'); return m.group(0)
    new_content = re.sub(UP, repl, content)
    put = {'content': new_content}
    feat = src.get('featured_image')
    if feat:
        m = re.search(r'/wp-content/uploads/(.+?)(?:\?|$)', feat)
        if m:
            try:
                mid, _ = sideload(m.group(1))
                put['featured_media'] = mid
            except Exception as ex:
                print(f'  ! featured: {ex}')
    changed = new_content != content or 'featured_media' in put
    if changed:
        s3, r = http_json('POST', CMS + f'/wp/v2/posts/{cms_id}', put)
        ok = s3 < 400
        print(f"#{pid:<4} CMS {cms_id}: content={'rewritten' if new_content != content else 'same'}, "
              f"featured={put.get('featured_media','-')}, PUT={s3}{' ERR '+str(r)[:150] if not ok else ''}")
    else:
        print(f'#{pid:<4} CMS {cms_id}: nothing to change')
    STATE_FILE.write_text(json.dumps(st, indent=2, ensure_ascii=False))
    time.sleep(0.8)

imgs = sum(1 for _ in st['media_ids'])
print(f'done. media sideloaded this pass+cached: {len(st["media_ids"])}')
