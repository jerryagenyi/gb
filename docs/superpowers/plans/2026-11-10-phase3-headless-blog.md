# Phase 3 — Headless WordPress Blog: Implementation Plan

> **Trigger:** CMS is live and verified (2026-11-10). This plan executes Phase 3 of `2026-10-08-gb-nextjs-site.md`.

**Goal:** `genevievebosah.com` (Vercel) gains `/blog` + `/blog/[slug]` routes fed by WordPress at `cms.genevievebosah.com` via WPGraphQL. Old content (2 self-hosted posts + 27 WordPress.com posts) imported for curation. WP locked to headless-only.

## Verified facts (2026-11-10)

| Item | Finding |
|---|---|
| CMS | `https://cms.genevievebosah.com` — fresh WP, name "Genevieve Bosah Blog", LiteSpeed, valid SSL, docroot `~/cms.genevievebosah.com/` (NOT inside public_html ✓) |
| CMS auth | User `gbblog` = **administrator**; Basic-auth app password works against `/wp-json/wp/v2/*` (verified). App password exposed in chat — **rotate after setup**, store in `~/.secrets/` |
| MCP | OneMCP plugin active; JSON-RPC endpoint `/wp-json/onemcp/v1/mcp` responds (verified `initialize`). Optional: add server block to ZCode MCP config for first-class tools; REST is equivalent |
| Plugins on CMS | Host stack pre-installed: Akismet, BeyondSEO, CookieAdmin(+Pro), Extendify(+Site Assistant), MonsterInsights, Loginizer(+Pro), OneMCP(+Pro). **No WPGraphQL yet** |
| WP.com source | `genevievebosah.wordpress.com` (site ID 57002568) — **public API works, no login needed**: 27 published posts, 2013-08-28 → 2020-04-09. Inventory: `docs/legacy-wp-export/wpcom-inventory.json`. The 4 drafts (per 2026-10-08 plan) need her WP.com login |
| Self-hosted posts | 2 posts (2021) archived in `docs/legacy-wp-export/wp-export.json`. **Their images are only recoverable from the local 1.8GB backup tarball** (old URLs on the apex now 404 — domain points to Vercel) |
| Blog front-end | None yet — `/blog` currently 307-redirects to `/` (by design, reversible) |

## Decisions needed (Genevieve, before Task 3 publish)

1. **Curation:** import all 27 WP.com posts as **drafts first** (recommended) — she reviews and publishes what she wants; or import-all-published.
2. **Dates:** keep original publish dates (recommended) or re-date.
3. **The 4 WP.com drafts:** she exports from WP.com (Tools → Export) if wanted — needs her WP.com login.
4. Old comments/discussion: WP.com comments are not in the public posts API — skip unless she exports them.

## Tasks

### Task 1 — CMS hardening + WPGraphQL
- Trim host plugin bloat (deactivate + delete: Extendify ×2, MonsterInsights, BeyondSEO, CookieAdmin ×2, Hello Dolly) — headless backend needs none of them. Keep: Loginizer(+Pro), OneMCP, Akismet (optional).
- Install + activate **WPGraphQL** (REST `POST /wp/v2/plugins` slug `wp-graphql`, or wp-admin).
- Confirm `POST /graphql` answers `{ posts { nodes { slug } } }`.

### Task 2 — Import the 2 self-hosted posts (2021)
- Extract their images from `backup-11.9.2026_15-08-13_resedhdg.tar.gz` (list referenced `/wp-content/uploads/…` paths in `wp-export.json` post HTML; `tar -xzOf` selective extract).
- Upload images to CMS media library (REST, multipart), rewrite URLs in post HTML → `cms.genevievebosah.com/wp-content/uploads/…`.
- Create posts via REST: original dates/slugs (`on-setting-goals`, `should-you-change-your-accent`), status **draft** for review.

### Task 3 — Import 27 WP.com posts
- Script (Python, one-off in `scripts/`): for each ID in `wpcom-inventory.json`:
  - GET full post (content HTML, categories, date) from public API;
  - sideload every `i/files.wordpress.com` image → CMS media; rewrite srcs;
  - strip WP.com artifacts (polldaddy/carousel shortcodes, jetpack wrappers);
  - map categories (create as needed);
  - POST to CMS as **draft**, original date + original WP.com slug.
- Output: `docs/legacy-wp-export/import-report.md` (post → new CMS ID → images sideloaded → warnings).
- After Genevieve curates: bulk-publish chosen ones (REST, status=publish).

### Task 4 — Headless lock (mu-plugin)
- `~/cms.genevievebosah.com/wp-content/mu-plugins/headless-lock.php`:
  - 307 non-logged-in front-end requests (single posts, pages, archives, feeds) → `https://genevievebosah.com/blog`; keep `/wp-admin`, `/wp-json`, `/graphql` open;
  - disable XML-RPC (`xmlrpc_enabled` filter false); disable embeds;
  - `wp_head` noindex on front-end routes.
- Verify: `curl -sI https://cms.genevievebosah.com/hello-world` → 307; `/graphql` still 200.

### Task 5 — Next.js blog (Vercel)
- Env: `WP_GRAPHQL_URL=https://cms.genevievebosah.com/graphql`, `WP_REVALIDATE_SECRET` (generate, set on Vercel + used by webhook).
- `src/lib/wp.ts` — GraphQL fetch helper with `next: { tags: ['wp'] }`.
- Routes: `/blog` (list: title, date, excerpt) and `/blog/[slug]` (content, `generateStaticParams` + ISR via revalidateTag).
- `/api/revalidate` — POST `{ secret }` → `revalidateTag('wp')`; WP side: OneMCP or a small mu-plugin hooking `transition_post_status` → webhook POST.
- Blog typography in `globals.css` (prose styles for WP HTML: p, h2/h3, img, blockquote, links in site palette).
- **Carry-overs from Phase 1 review (must do):** `RevealObserver` re-run on `usePathname()` change; `data-scroll-behavior="smooth"` on `<html>`; structural fidelity test additions; redirect `/feed`, `/category/*`, `/author/*` leftovers.
- Nav/footer link updates (`site.ts`): add "Blog".

### Task 6 — Redirect cutover + verification
- `legacy-redirects.ts`: `/blog` redirect **removed** (route now real); `/on-setting-goals` + `/should-you-change-your-accent` → `/blog/<slug>`, `permanent: true`; WP.com migration: decide canonical blog post URLs (old WP.com slugs 404 there — optional one-time import announcement post linking them).
- End-to-end: publish a test post in WP → appears on `/blog` within revalidate window → webhook instant; drafts invisible; CMS front-end 307s.
- SEO: submit `/blog` sitemap (add `sitemap.ts`) to Search Console once live.

## Secrets & access register

| Secret | Where it lives | Rotation |
|---|---|---|
| `gbblog` app password | In this chat (needs rotation) → `~/.secrets/gb-wp-blog` (owner writes) | After Phase 3 setup settles |
| `WP_REVALIDATE_SECRET` | Vercel env + WP webhook config | Any time, both sides |
| WP.com login (drafts, optional) | Genevieve only | n/a |
