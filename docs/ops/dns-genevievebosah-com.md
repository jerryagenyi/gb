# genevievebosah.com — DNS zone snapshot & cutover record

**Cutover date: 2026-11-09** — apex + `www` moved from Namecheap hosting to Vercel. Edited by Jerry in cPanel → Zone Editor. Verified live the same day (`Server: Vercel`, both hostnames 200 OK, MX unchanged).

## Where everything lives (the ownership map)

| Layer | Provider | Detail |
|---|---|---|
| **Registrar** | **Wild West Domains, LLC** (GoDaddy reseller arm) — *not* Namecheap | Registered 2015-08-20 · **expires 2027-08-20** · fully locked (`clientTransfer/Delete/Renew/UpdateProhibited`). Account login not yet recovered — search email for Wild West/GoDaddy reseller receipts before the 2027 renewal. Namecheap's dashboard showing "EXPIRED Aug 2024 / domain with another registrar" is its stale view — ignore it. |
| **DNS (nameservers)** | **Namecheap hosting** | `dns1.namecheaphosting.com` / `dns2.namecheaphosting.com` — zone edited in **cPanel → Zone Editor**, *not* the Namecheap domain dashboard. **These were NOT changed at cutover and must stay as-is.** |
| **Hosting (old WP + cPanel)** | Namecheap Stellar shared | `server193.web-hosting.com` · IP `198.54.116.9` · cPanel user `resedhdg` · login `https://cpanel.genevievebosah.com:2083` (or `https://server193.web-hosting.com:2083`) |
| **Site (current)** | Vercel project `gb` | `genevievebosah.com` + `www` + `gb-khaki.vercel.app` — all "Valid Configuration", Production |

### cPanel account quirks (discovered 2026-11-09)

- The cPanel account's **Main Domain is `researcherpodcast.com`** (itself expired/registrar-elsewhere). `genevievebosah.com` is an **addon domain** whose document root is **`/public_html`** — the *same* directory as the main domain. That is why the WordPress install in `public_html` answered on genevievebosah.com. The near-empty `/home/resedhdg/genevievebosah.com/` folder is a leftover; WP does not live there.
- Addon domains 2/2 used (`genevievebosah.com`, `africanphdscholarsnetwork.org`). Subdomains 2/30 used.
- **0 of 30 email accounts exist** — MX/SPF/DKIM records are in the zone, but no mailbox (so `hello@genevievebosah.com` likely does not deliver anywhere).

## The only two records changed (2026-11-09)

| Record | TTL | Before (Namecheap hosting) | After (Vercel) |
|---|---|---|---|
| `genevievebosah.com.` **A** | 1200 | `198.54.116.9` | **`216.198.79.1`** ← value from Vercel; supersedes the legacy `76.76.21.21` quoted in older docs |
| `www.genevievebosah.com.` **CNAME** | 1200 | `genevievebosah.com` | **`7a4246585037f484.vercel-dns-017.com`** (project-specific value from `vercel domains inspect`) |

## Full zone snapshot — "after" state (all TTL 1200)

Records **not** listed in the change table above were untouched and still point at the Namecheap hosting:

| Name | Type | Record |
|---|---|---|
| genevievebosah.com. | A | **216.198.79.1** (Vercel) |
| genevievebosah.com. | MX | pri 0 → `mail.genevievebosah.com` |
| genevievebosah.com. | MX | pri 20 → `mx3-hosting.jellyfish.systems` |
| genevievebosah.com. | TXT | `v=spf1 +a +mx +ip4:68.65.123.202 +ip4:198.54.116.9 include:spf.web-hosting.com ~all` |
| default._domainkey.genevievebosah.com. | TXT | DKIM key (`v=DKIM1; k=rsa; p=MIIBIjANBg…` — full value in cPanel Zone Editor; not modified) |
| mail.genevievebosah.com. | A | 198.54.116.9 |
| www.genevievebosah.com. | CNAME | **7a4246585037f484.vercel-dns-017.com** (Vercel) |
| ftp.genevievebosah.com. | CNAME | genevievebosah.com |
| autodiscover.genevievebosah.com. | A | 198.54.116.9 |
| autoconfig.genevievebosah.com. | A | 198.54.116.9 |
| webmail.genevievebosah.com. | A | 198.54.116.9 |
| cpanel.genevievebosah.com. | A | 198.54.116.9 |
| webdisk.genevievebosah.com. | A | 198.54.116.9 |
| whm.genevievebosah.com. | A | 198.54.116.9 |
| cpcontacts.genevievebosah.com. | A | 198.54.116.9 |
| cpcalendars.genevievebosah.com. | A | 198.54.116.9 |
| _autodiscover._tcp | SRV | pri 0, port 443 → `cpanelemaildiscovery.cpanel.net` |
| _caldav._tcp / _carddav._tcp | SRV | port 2079 → `server193.web-hosting.com` (+ TXT `path=/`) |
| _caldavs._tcp / _carddavs._tcp | SRV | port 2080 → `server193.web-hosting.com` (+ TXT `path=/`) |

## Revert procedure — return to Namecheap hosting only

Nameservers never changed, so reverting is two record edits:

1. Log in: `https://cpanel.genevievebosah.com:2083` → **Zone Editor** → manage `genevievebosah.com`
2. Edit `genevievebosah.com.` **A**: `216.198.79.1` → **`198.54.116.9`**
3. Edit `www.genevievebosah.com.` **CNAME**: `7a4246585037f484.vercel-dns-017.com` → **`genevievebosah.com`**
4. Save. Propagation ≈ 30 min (TTL 1200 s = 20 min cache).
5. Verify: `nslookup genevievebosah.com 1.1.1.1` → `198.54.116.9`; `curl -sI https://genevievebosah.com` → `server: LiteSpeed` (old WP).

Do **not** touch MX/TXT/SRV records or the nameservers during a revert.

## Old WordPress — post-cutover state

- No longer reachable via the domain; files still in `/home/resedhdg/public_html`, DB on the same hosting.
- Still manageable via cPanel (`cpanel.genevievebosah.com:2083` → File Manager / phpMyAdmin / Softaculous) and likely via temp URL `http://server193.web-hosting.com/~resedhdg/`.
- Content safety nets:
  - `docs/legacy-wp-export/wp-export.json` — full REST export (2 posts, 15 pages, 97 media URLs, categories, users) taken 2026-11-09, before cutover.
  - **Full account backup taken 2026-11-09:** `backup-11.9.2026_15-08-13_resedhdg.tar.gz` (1.8 GB, gitignored, stored at repo root on Jerry's laptop). Verified: valid gzip; contains `mysql/resedhdg_gene.sql` (WP database) + `mysql/resedhdg_aspn.sql` + full homedir. **Action: copy off-machine** (external drive / VPS) — a single laptop copy is not a backup.
- WP has exactly one user: `admin` (the `geneboska26` login never existed on this install). Password reset possible via cPanel → phpMyAdmin → `wp_users` if the old install is ever needed again.
- Plan (Phase 3): fresh headless WP on `cms.genevievebosah.com`, import the 2 posts from the export — do not resurrect this install.
