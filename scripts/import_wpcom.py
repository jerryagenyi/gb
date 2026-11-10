#!/usr/bin/env python3
"""Import posts from genevievebosah.wordpress.com (public API) into the headless
CMS at cms.genevievebosah.com as DRAFTS, keeping original dates/slugs.

Idempotent: progress tracked in docs/legacy-wp-export/import-state.json — re-run
resumes/skips. Usage:
  python scripts/import_wpcom.py            # import everything pending
  python scripts/import_wpcom.py --limit 2  # dry-run first N posts only
"""
import json, re, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE_FILE = ROOT / 'docs/legacy-wp-export/import-state.json'
INVENTORY = ROOT / 'docs/legacy-wp-export/wpcom-inventory.json'

WPCOM_SITE = 'genevievebosah.wordpress.com'
CMS = 'https://cms.genevievebosah.com/wp-json'
AUTH = 'Basic ' + __import__('base64').b64encode(b'gbblog:' + open(ROOT / '.wp-import-secret').read().strip().encode()).decode()
AUTHOR_ID = 3          # "Genevieve Bosah" (author role)
IMG_W_CAP = 1600       # ask WP.com for at-most-1600px-wide versions

def http(method, url, body=None, ctype='application/json', extra=None, timeout=90):
    h = {'Content-Type': ctype, 'User-Agent': 'gb-import/1.0'}
    if 'cms.genevievebosah.com' in url:
        h['Authorization'] = AUTH
    if extra:
        h.update(extra)
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read()

def http_json(method, url, body=None, **kw):
    s, raw = http(method, url, json.dumps(body).encode() if body is not None else None, **kw)
    return s, json.loads(raw.decode())

FIVE_OH_THREE = {'n': 0}

def cms(method, path, body=None, **kw):
    """CMS call with retry + Imunify360 protection: abort after 3 consecutive 403s."""
    for attempt in range(3):
        try:
            s, data = http_json(method, CMS + path, body, **kw)
            FIVE_OH_THREE['n'] = 0
            return s, data
        except urllib.error.HTTPError as e:
            if e.code == 403:
                FIVE_OH_THREE['n'] += 1
                if FIVE_OH_THREE['n'] >= 3:
                    raise SystemExit('ABORT: 3 consecutive 403s — Imunify360/Loginizer may be blocking us')
                time.sleep(5 * FIVE_OH_THREE['n'])
                continue
            return e.code, json.loads(e.read().decode() or '{}')
        except Exception:
            if attempt == 2:
                raise
            time.sleep(3)
    return s, data

def load_state():
    return json.loads(STATE_FILE.read_text()) if STATE_FILE.exists() else {'posts': {}, 'media': {}, 'terms': {}}

def save_state(st):
    STATE_FILE.write_text(json.dumps(st, indent=2, ensure_ascii=False))

IMG_URL = re.compile(r'https?://(?:[a-z0-9.-]+\.wp\.com/)?genevievebosah\.files\.wordpress\.com/([^\s"\'?)]+)(?:\?[^\s"\']*)?', re.I)

def normalize_imgs(html):
    """Map every WP.com image URL variant -> canonical base URL."""
    return {m.group(0): m.group(1) for m in IMG_URL.finditer(html)}

def sideload(url_base, st):
    """Download WP.com image (width-capped) and upload to CMS media. Returns new URL."""
    if url_base in st['media']:
        return st['media'][url_base]
    src = f'https://{WPCOM_SITE.replace(".", ".")}'  # not used; kept for clarity
    dl = f'https://genevievebosah.files.wordpress.com/{url_base}?w={IMG_W_CAP}'
    s, raw = http('GET', dl, body=None, ctype=None, extra={'Content-Type': None} if False else None)
    if s != 200:
        raise RuntimeError(f'download failed {s}: {dl}')
    fname = url_base.rsplit('/', 1)[-1]
    ext = fname.rsplit('.', 1)[-1].lower()
    mime = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif'}.get(ext, 'application/octet-stream')
    s, m = cms('POST', '/wp/v2/media', raw, ctype=mime,
               extra={'Content-Disposition': f'attachment; filename="{fname}"'})
    if s >= 400:
        raise RuntimeError(f'media upload {s}: {m}')
    st['media'][url_base] = m['source_url']
    return m['source_url']

def term_for(name, st):
    if name in st['terms']:
        return st['terms'][name]
    s, t = cms('POST', '/wp/v2/categories', {'name': name})
    if s >= 400:  # exists already?
        s, ts = cms('GET', '/wp/v2/categories?search=' + urllib.request.quote(name))
        t = next((x for x in ts if x['name'].lower() == name.lower()), None)
        if not t:
            return None
    st['terms'][name] = t['id']
    return t['id']

def clean(html, st):
    # sideload all referenced images, rewrite every occurrence (src, srcset, data-*)
    for full, base in normalize_imgs(html).items():
        try:
            new = sideload(base, st)
        except Exception as ex:
            print(f'    ! image skip {base}: {ex}')
            continue
        bare = re.escape(full)
        html = re.sub(bare + r'(\?[^\s"\']*)?', new.replace('\\', '\\\\'), html)
    # stale WP.com attrs off remaining tags
    html = re.sub(r'\s(srcset|sizes|data-[\w-]+|id|class)="[^"]*"', '', html)
    # internal post links -> /blog/slug (slug match against inventory)
    def sublink(m):
        slug = m.group(1).strip('/')
        return f'href="/blog/{slug}/"' if slug else m.group(0)
    html = re.sub(r'href="https?://genevievebosah\.wordpress\.com/\d{4}/\d{2}/\d{2}/([^/"]+)/?"', sublink, html)
    # attachment-page links: unwrap to plain image link (media already sideloaded)
    html = re.sub(r'href="https?://genevievebosah\.wordpress\.com/\?attachment_id=\d+"', 'href="#"', html)
    # leftover unrendered shortcodes / jetpack cruft
    html = re.sub(r'\[(?:polldaddy|gallery|caption)[^\]]*\]|\[/caption\]', '', html)
    return html

def strip_entities(t):
    return (t.replace('&#8230;', '…').replace('&#8217;', '’').replace('&#8216;', '‘')
             .replace('&#8220;', '“').replace('&#8221;', '”').replace('&#8211;', '–')
             .replace('&#8212;', '—').replace('&#038;', '&').replace('&#8230', '…'))

def main():
    limit = int(sys.argv[sys.argv.index('--limit') + 1]) if '--limit' in sys.argv else None
    st = load_state()
    inv = json.loads(INVENTORY.read_text())
    pending = [p for p in inv if str(p['ID']) not in st['posts']]
    todo = pending[:limit] if limit else pending
    print(f'{len(inv)} total, {len(pending)} pending, importing {len(todo)}')
    for p in todo:
        pid = p['ID']
        print(f"== {p['date'][:10]} #{pid} {strip_entities(p['title'])!r}")
        s, full = http_json('GET', f'https://public-api.wordpress.com/rest/v1.1/sites/{WPCOM_SITE}/posts/{pid}')
        if s != 200:
            print(f'    ! fetch {s}, skipping'); continue
        try:
            content = clean(full.get('content', ''), st)
        except SystemExit:
            save_state(st); raise
        cats = [term_for(strip_entities(v['name']), st) for k, v in (full.get('categories') or {}).items()] or None
        body = {
            'title': strip_entities(full['title']),
            'slug': full['slug'] or f'post-{pid}',
            'status': 'draft',
            'author': AUTHOR_ID,
            'date_gmt': full['date'].split('+')[0],
            'date': full['date'].split('+')[0],
            'content': content,
            'categories': cats,
        }
        # featured image
        fid = full.get('featured_image')
        if fid:
            try:
                s2, med = http_json('GET', f'https://public-api.wordpress.com/rest/v1.1/sites/{WPCOM_SITE}/media/{fid}')
                if s2 == 200 and med.get('URL'):
                    base = re.match(r'https?://(?:[a-z0-9.-]+\.wp\.com/)?genevievebosah\.files\.wordpress\.com/(.+?)(?:\?.*)?$', med['URL'])
                    if base:
                        new = sideload(base.group(1), st)
                        s3, m2 = cms('GET', '/wp/v2/media?search=' + urllib.request.quote(base.group(1).rsplit('/', 1)[-1].rsplit('.', 1)[0]))
                        match = next((x for x in m2 if x['source_url'] == new), None)
                        if match:
                            body['featured_media'] = match['id']
            except Exception as ex:
                print(f'    ! featured skip: {ex}')
        s4, r = cms('POST', '/wp/v2/posts', body)
        if s4 >= 400:
            print(f'    ! create {s4}: {str(r)[:200]}')
        else:
            st['posts'][str(pid)] = {'cms_id': r['id'], 'slug': r['slug'], 'date_gmt': r.get('date_gmt'), 'cats': cats}
            print(f"    -> CMS post {r['id']} draft {r.get('date_gmt')}")
        save_state(st)
        time.sleep(0.8)
    print(f'done. media sideloaded: {len(st["media"])}, posts imported: {len(st["posts"])}')

if __name__ == '__main__':
    main()
