# Hosting Estate Map — who owns what, where everything lives

> **Purpose:** one page so nobody is confused about what belongs to what. Written 2026-11-10. Companion doc: `dns-genevievebosah-com.md` (zone snapshot + revert).

```
Namecheap account "geneboska" (registrar + hosting customer)
│
├── Registrar items
│   ├── auxanopradvisory.com   ACTIVE, auto-renew, paid to 2030-06-17 (+ Domain Privacy to 2027)
│   ├── apsn.uk                ACTIVE, auto-renew, paid to 2027-06-17
│   ├── genevievebosah.com     ⚠ REGISTERED ELSEWHERE — Wild West Domains LLC (GoDaddy
│   │                          reseller), paid to 2027-08-20, fully locked. Shows in this
│   │                          Namecheap list ONLY because DNS/hosting is here; Namecheap's
│   │                          "EXPIRED Aug 2024" badge is stale — ignore it.
│   ├── researcherpodcast.com  DROPPED — expired 2023-09-15, deleted by registry.
│   │                          NXDOMAIN + no RDAP record as of 2026-11-10 = unregistered.
│   │                          Re-registerable (~$10/yr) if the podcast returns.
│   └── positiveSSL cert       ACTIVE to 2027-01-02 (hosting-issued, covers hosting subdomains)
│
├── Hosting: Stellar shared plan, ACTIVE, auto-renew to 2027-11-06
│   server193.web-hosting.com · IP 198.54.116.9 · cPanel user resedhdg
│   cPanel login: https://cpanel.genevievebosah.com:2083
│   Webmail:      https://webmail.genevievebosah.com  (⚠ genevievebosah.com/webmail no longer
│                  works — apex points to Vercel)
│   │
│   ├── MAIN DOMAIN:  researcherpodcast.com  → docroot /public_html   (domain dropped; dead)
│   ├── Addon 1:      genevievebosah.com     → docroot /public_html   (SAME dir as main —
│   │                  this is why the old WP "lived in public_html"; now superseded by
│   │                  Vercel; old install pending removal)
│   ├── Addon 2:      africanphdscholarsnetwork.org → /africanphdscholarsnetwork.org (own dir,
│   │                  separate site, separate DB — NOT part of this project)
│   ├── Subdomain:    cms.genevievebosah.com → /cms.genevievebosah.com (NEW headless WP
│   │                  "Genevieve Bosah Blog", admin user `gbblog`; outside public_html ✓)
│   ├── Subdomain:    1 more exists (2/30 used) — identify in cPanel → Subdomains
│   ├── MySQL:        resedhdg_gene (old WP DB), resedhdg_aspn (APSN site DB)
│   └── Email:        0/30 mailboxes; plan: hello@ mailbox + forwarder → geneboska@yahoo.co.uk
│                      (mail data lives in ~/mail — untouched by anything in public_html)
│
└── (separate) old blog source: genevievebosah.wordpress.com — still online, 27 published
    posts 2013–2020 readable via public API; 4 drafts need Genevieve's WP.com login

Vercel project `gb` (Jeremiah's account, Hobby): genevievebosah.com + www + gb-khaki.vercel.app
    → Next.js site from github.com/jerryagenyi/gb (this repo)
```

## WordPress installs (per Softaculous, 2026-11-10)

| Install | Path | DB | Status |
|---|---|---|---|
| genevievebosah.com (OLD) | `/home/resedhdg/public_html` | resedhdg_gene | Serves nothing (domain → Vercel; main domain dropped). WP 7.1.4 auto-updated, search-discouraged. **PENDING REMOVAL** after image extraction from backup |
| africanphdscholarsnetwork.org | `/home/resedhdg/africanphdscholarsnetwork.org` | resedhdg_aspn | Separate project — leave alone |
| cms.genevievebosah.com (NEW) | `/home/resedhdg/cms.genevievebosah.com` | (own) | Headless blog backend; user `gbblog` admin; OneMCP + Loginizer; WPGraphQL being added |

## Old WP removal runbook (approved 2026-11-10, post-Claude-review)

**Verdict: delete it.** It serves nothing (no domain points at it) but is still reachable via direct IP/temp URL, runs under the same cPanel user as the new CMS, and — worst case — if a stranger registers the now-free `researcherpodcast.com` and points it at this server, they'd be shown Genevieve's old site. A "coming soon" page is unnecessary (no real domain resolves there); an empty `index.html` suffices.

**Order matters — do NOT do this until steps 1–3 are done:**

1. Copy `backup-11.9.2026_15-08-13_resedhdg.tar.gz` off this laptop (external drive / VPS). Run `gzip -t` on the copy.
2. Confirm no other site's docroot sits *inside* `public_html` (cPanel → Domains — look for `public_html/<something>` paths; `africanphdscholarsnetwork.org` has its own root, verify).
3. Old-WP uploads already extracted to `C:\Users\Username\gb-wp-archive\` (495MB, full uploads tree + `resedhdg_gene.sql`) — done 2026-11-10. Move that dir next to the backup copy.
4. **Move, don't delete:** in cPanel File Manager, move everything in `public_html/*` to `~/old-wp-2026-11-10/` (outside web root) — EXCEPT keep `.well-known/`, `cgi-bin/`, and `.htaccess`'s cPanel PHP-handler lines. Drop in an empty `index.html`.
5. Remove the Softaculous install record (WordPress Manager → the genevievebosah.com install → Remove) and any cPanel cron jobs pointing at it (cPanel → Cron Jobs).
6. After ~2 weeks with nothing broken: delete `~/old-wp-2026-11-10/`, drop DB `resedhdg_gene` + its user (phpMyAdmin).

Until step 6, the DNS "revert to hosting" procedure in `dns-genevievebosah-com.md` degrades to restore-from-backup.

## Backups

| What | Where | Notes |
|---|---|---|
| Full cPanel account backup (files + all DBs) | `backup-11.9.2026_15-08-13_resedhdg.tar.gz` (1.8GB) at repo root, gitignored | Contains old WP files incl. uploads + `mysql/*.sql`. **Copy off-machine** |
| Old-WP uploads tree + old DB dump | `C:\Users\Username\gb-wp-archive\` (495MB) | Extracted 2026-11-10: full `wp-content/uploads` + `resedhdg_gene.sql` |
| Old WP REST export (2 posts, 15 pages, 97 media URLs) | `docs/legacy-wp-export/wp-export.json` | Taken pre-cutover 2026-11-09 |
| WP.com inventory (27 posts) | `docs/legacy-wp-export/wpcom-inventory.json` | Public API pull 2026-11-10 |
