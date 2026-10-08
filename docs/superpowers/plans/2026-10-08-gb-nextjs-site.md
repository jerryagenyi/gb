# genevievebosah.com — Next.js on Vercel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Genevieve's approved one-page design (`design/gb.html` + `design/genevievebosah_website_copy.md`) as a Next.js app on Vercel, faithful to the design, with a clean path to a headless WordPress blog later.

**Architecture:** Single-route Next.js App Router site. All copy lives in one typed content module (`src/content/site.ts`) rendered by small section components, so Phase 3 can swap the content source to WPGraphQL without touching markup. The design's CSS is ported verbatim to `globals.css`; fonts move to `next/font`. A fidelity test diffs the rendered page against `design/gb.html` so nothing drifts.

**Tech Stack:** Next.js 16 (App Router, TypeScript, Turbopack), plain CSS (no Tailwind — the design is hand-written CSS), `next/font/google` (Fraunces, Newsreader), Vitest + Testing Library + jsdom, Vercel (Git-connected to `github.com/jerryagenyi/gb`).

**Source of truth:** `design/gb.html` wins over the `.md` where they differ (the HTML already has the LinkedIn URL and `hello@genevievebosah.com`; the `.md` still shows `[PLACEHOLDERS]`). Placeholders are acceptable for v1. No photo in v1. No design changes in v1.

---

## Verified facts (2026-10-08)

| Item | Finding | Impact |
|---|---|---|
| Current site | **Self-hosted WordPress.org 5.3.26** (not WordPress.com). Theme BeTheme; plugins WPBakery, Slider Revolution 6.1.8, LayerSlider 6.10.0, Contact Form 7, Instagram Feed, InboundWP Lite | WP is ~6 years out of date with known-vulnerable sliders. Headless WP is technically possible on the existing hosting, but we are deliberately not doing it yet (Phase 3). |
| Hosting | Namecheap shared hosting (LiteSpeed, IP 198.54.116.9, cPanel) | "Get hosting on Namecheap" for Phase 3 may already be covered — confirm the plan/renewal with Genevieve. |
| Domain | Registrar **Namecheap**, expires **2027-08-20** | — |
| DNS | Nameservers `dns1/dns2.namecheaphosting.com` → zone is edited in **cPanel → Zone Editor**, not the Namecheap domain dashboard | Cutover = edit A/CNAME in cPanel only. **Do not switch nameservers to Vercel** — that would drop email. |
| Email | MX `mail.genevievebosah.com` (pri 0) + `mx3-hosting.jellyfish.systems` (pri 20) — email lives on the Namecheap hosting | MX/mail/TXT records must remain untouched at cutover. Confirm `hello@genevievebosah.com` (used by the design) actually exists. |
| Existing content | 2 posts (`/on-setting-goals/` 2021-12-27, `/should-you-change-your-accent/` 2021-09-20); pages: about, research, research-3, teaching, podcast, connect, contact, contact-genevieve, blog, team, tests, sample-page, home-2, home-3 | Back up before cutover; temporary (302/307) redirects so URLs can be reclaimed by the blog in Phase 3. |
| Design file | `design/gb.html:17` has `--gold:#9a7b३e` (Devanagari digit) — overridden by line 18, harmless | Dropped in the port. Reference file left untouched. |

---

## Phase overview

| Phase | What | Gate |
|---|---|---|
| **0** | Repo bootstrap (git, remote, design files, this plan) | Done in planning session |
| **1** | Next.js port of the design → Vercel (`*.vercel.app`) | Jerry reviews; Genevieve signs off |
| **2** | Domain cutover: genevievebosah.com → Vercel (DNS in cPanel), WP backed up | Genevieve's explicit go-ahead |
| **3** | (Future) Headless WordPress blog: WPGraphQL (+ SCF, Flamingo decision below) | Genevieve decides to blog |
| **4** | (Future) Polish: portrait, motion "spice" | Genevieve's wishes |

---

## File structure (Phase 1)

```
design/                         # reference only — never imported by app code (except the fidelity test)
  gb.html
  genevievebosah_website_copy.md
docs/superpowers/plans/         # this plan
src/
  app/
    layout.tsx                  # <html>, fonts, metadata, RevealObserver
    page.tsx                    # composes sections in design order
    globals.css                 # design CSS, ported verbatim (fonts → CSS vars)
  content/
    site.ts                     # ALL copy + links, typed (Phase 3 swaps this source)
  components/
    RichText.tsx                # renders string | {em} | {strong} segments
    Button.tsx                  # .btn primary/ghost anchor
    RevealObserver.tsx          # client: scroll-reveal (replaces inline <script>)
    sections/
      Nav.tsx  Hero.tsx  Roles.tsx  About.tsx  Work.tsx
      Research.tsx  Speaking.tsx  Connect.tsx  Footer.tsx
  lib/
    legacy-redirects.ts         # old WP URLs → new anchors (temporary redirects)
  test/
    fidelity.test.tsx           # rendered page text/links === design/gb.html
    reveal.test.tsx
    legacy-redirects.test.ts
next.config.ts
vitest.config.mts
.npmrc                          # min-release-age=7, save-exact, ignore-scripts (house rule)
```

---

## Phase 0 — Repo bootstrap ✅ (done in planning session)

- [x] `git init -b main`, remote `origin` → `https://github.com/jerryagenyi/gb.git` (remote was empty)
- [x] Moved design files into `design/`
- [x] `.gitignore`, `README.md`, this plan
- [x] Initial commit pushed to `main`

---

## Phase 1 — Next.js port + Vercel

### Task 1: Scaffold Next.js

The repo root is not empty (`design/`, `docs/`), so scaffold in a temp dir and copy over.

**Files:** Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `src/app/*`, `public/*`, `.npmrc`

- [ ] **Step 1: Write `.npmrc` first** (house supply-chain rule — applies to every install below)

```ini
min-release-age=7
save-exact=true
ignore-scripts=true
```

- [ ] **Step 2: Scaffold into a temp dir**

```bash
cd /c/Users/Username/Documents/github
npx create-next-app@latest gb-scaffold --ts --eslint --app --src-dir --no-tailwind --import-alias "@/*" --use-npm --yes
```

Expected: `Success! Created gb-scaffold`. If it prompts for React Compiler, answer No.

- [ ] **Step 3: Copy scaffold into the repo (excluding its git/node_modules/.gitignore/README)**

```bash
cd /c/Users/Username/Documents/github
rm -rf gb-scaffold/.git gb-scaffold/node_modules gb-scaffold/.gitignore gb-scaffold/README.md
cp -r gb-scaffold/. gb/
rm -rf gb-scaffold
cd gb && npm install
```

- [ ] **Step 4: Verify it builds**

Run: `npm run build`
Expected: `✓ Compiled successfully` and route `/` listed as `○ (Static)`.

- [ ] **Step 5: Record the resolved Next version in the commit message and commit**

```bash
npm ls next
git add -A
git commit -m "chore: scaffold Next.js app (next@<version from npm ls>)"
```

---

### Task 2: Test harness + failing fidelity test

**Files:** Create: `vitest.config.mts`, `src/test/fidelity.test.tsx`; Modify: `package.json` (scripts)

- [ ] **Step 1: Install test deps**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

- [ ] **Step 2: `vitest.config.mts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 3: Add script to `package.json`**

```json
"test": "vitest run"
```

- [ ] **Step 4: Write `src/test/fidelity.test.tsx`**

This compares every text-bearing element and every link in the design file against the rendered page. Same selector on both sides, compared as sorted lists, so any added/missing/changed copy fails.

```tsx
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from '@/app/page';

const TEXT_SELECTOR =
  'h1, h2, h3, h4, h5, p, li, a, .roles-track span, .foot-brand, .pillar-num, .research-tag';

const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();

function designRoot(): ParentNode {
  const html = readFileSync(path.resolve(process.cwd(), 'design/gb.html'), 'utf8');
  return new DOMParser().parseFromString(html, 'text/html').body;
}

const texts = (root: ParentNode) =>
  Array.from(root.querySelectorAll(TEXT_SELECTOR)).map((el) => norm(el.textContent)).sort();

const links = (root: ParentNode) =>
  Array.from(root.querySelectorAll('a')).map((a) => a.getAttribute('href')).sort();

const ids = (root: ParentNode) =>
  Array.from(root.querySelectorAll('[id]')).map((el) => el.id).sort();

describe('page matches design/gb.html', () => {
  it('renders exactly the design copy', () => {
    const { container } = render(<Home />);
    expect(texts(container)).toEqual(texts(designRoot()));
  });

  it('has exactly the design links', () => {
    const { container } = render(<Home />);
    expect(links(container)).toEqual(links(designRoot()));
  });

  it('has the design anchor ids', () => {
    const { container } = render(<Home />);
    expect(ids(container)).toEqual(ids(designRoot()));
  });
});
```

- [ ] **Step 5: Run — expect FAIL**

Run: `npm test`
Expected: 3 failures (scaffold page has different text/links/ids).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "test: add design fidelity test (failing)"
```

---

### Task 3: Global CSS + fonts + layout

**Files:** Replace: `src/app/globals.css`, `src/app/layout.tsx`; Delete: `src/app/page.module.css`, scaffold SVGs in `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`)

- [ ] **Step 1: Replace `src/app/globals.css`** — the design CSS verbatim except: (a) duplicate broken `--gold` line removed, (b) `'Fraunces',serif` → `var(--font-fraunces),serif`, `'Newsreader',Georgia,serif` → `var(--font-newsreader),Georgia,serif`, (c) reveal rules gated on `scripting: enabled` so no-JS visitors still see content, (d) reduced-motion support.

```css
:root{
  --ink:#1a1714;
  --ink-soft:#4a443d;
  --ink-faint:#8a8178;
  --paper:#f4efe8;
  --paper-warm:#ece5da;
  --gold:#9a7b3e;
  --teal:#2e5a52;
  --plum:#5a3d52;
  --line:#d8cfc2;
  --serif-display:var(--font-fraunces),serif;
  --serif-body:var(--font-newsreader),Georgia,serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  font-family:var(--serif-body);
  background:var(--paper);
  color:var(--ink);
  line-height:1.65;
  font-size:18px;
  -webkit-font-smoothing:antialiased;
}
.wrap{max-width:1080px;margin:0 auto;padding:0 2rem}

/* NAV */
nav{
  position:sticky;top:0;z-index:50;
  background:rgba(244,239,232,.88);
  backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line);
}
.nav-inner{display:flex;justify-content:space-between;align-items:center;max-width:1080px;margin:0 auto;padding:1.1rem 2rem}
.brand{font-family:var(--serif-display);font-weight:500;font-size:20px;letter-spacing:.01em;color:var(--ink);text-decoration:none}
.brand span{color:var(--gold)}
.nav-links{display:flex;gap:2rem;list-style:none}
.nav-links a{font-family:var(--serif-display);font-size:14px;color:var(--ink-soft);text-decoration:none;letter-spacing:.02em;transition:color .2s}
.nav-links a:hover{color:var(--gold)}
@media(max-width:760px){.nav-links{display:none}}

/* HERO */
.hero{padding:6rem 0 4.5rem;border-bottom:1px solid var(--line);position:relative;overflow:hidden}
.hero:before{
  content:"";position:absolute;top:-30%;right:-10%;width:520px;height:520px;
  background:radial-gradient(circle,rgba(154,123,62,.10),transparent 70%);
  border-radius:50%;pointer-events:none;
}
.eyebrow{font-family:var(--serif-display);font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:1.4rem}
.hero h1{
  font-family:var(--serif-display);
  font-weight:400;
  font-size:clamp(2.6rem,6vw,4.6rem);
  line-height:1.04;
  letter-spacing:-.015em;
  margin-bottom:1.6rem;
  max-width:14ch;
}
.hero h1 em{font-style:italic;color:var(--teal)}
.hero-lead{font-size:clamp(1.05rem,2vw,1.3rem);color:var(--ink-soft);max-width:54ch;font-weight:300;margin-bottom:2.4rem}
.hero-cta{display:flex;gap:1rem;flex-wrap:wrap}
.btn{
  font-family:var(--serif-display);font-size:15px;letter-spacing:.01em;
  padding:.85rem 1.7rem;border-radius:2px;text-decoration:none;
  transition:all .25s;cursor:pointer;border:1px solid var(--ink);
}
.btn-primary{background:var(--ink);color:var(--paper)}
.btn-primary:hover{background:var(--teal);border-color:var(--teal)}
.btn-ghost{background:transparent;color:var(--ink)}
.btn-ghost:hover{background:var(--ink);color:var(--paper)}

/* MARQUEE OF ROLES */
.roles{padding:2.2rem 0;border-bottom:1px solid var(--line);overflow:hidden}
.roles-track{display:flex;gap:3rem;align-items:center;font-family:var(--serif-display);font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);white-space:nowrap;flex-wrap:wrap;justify-content:center}
.roles-track span{display:flex;align-items:center;gap:3rem}
.roles-track span:after{content:"✦";color:var(--gold);font-size:11px}

/* SECTIONS */
section{padding:5rem 0;border-bottom:1px solid var(--line)}
.sec-label{font-family:var(--serif-display);font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:1.5rem}
.sec-title{font-family:var(--serif-display);font-weight:400;font-size:clamp(2rem,4vw,3rem);line-height:1.1;letter-spacing:-.01em;margin-bottom:2rem;max-width:20ch}
.sec-title em{font-style:italic;color:var(--teal)}

/* ABOUT */
.about-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:4rem;align-items:start}
@media(max-width:760px){.about-grid{grid-template-columns:1fr;gap:2.5rem}}
.about-body p{margin-bottom:1.3rem;color:var(--ink-soft);font-weight:300;font-size:1.08rem}
.about-body p strong{color:var(--ink);font-weight:500}
.about-side{border-left:2px solid var(--gold);padding-left:1.6rem}
.about-side h4{font-family:var(--serif-display);font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink);margin:1.4rem 0 .4rem}
.about-side h4:first-child{margin-top:0}
.about-side p{font-size:.96rem;color:var(--ink-soft);font-weight:300}

/* PILLARS */
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:1rem}
@media(max-width:760px){.pillars{grid-template-columns:1fr}}
.pillar{background:var(--paper-warm);padding:2rem 1.8rem;border-radius:3px;border-top:3px solid var(--teal);transition:transform .25s}
.pillar:nth-child(2){border-top-color:var(--gold)}
.pillar:nth-child(3){border-top-color:var(--plum)}
.pillar:hover{transform:translateY(-4px)}
.pillar-num{font-family:var(--serif-display);font-size:13px;color:var(--ink-faint);letter-spacing:.1em}
.pillar h3{font-family:var(--serif-display);font-weight:500;font-size:1.4rem;margin:.6rem 0 .8rem;color:var(--ink)}
.pillar p{font-size:1rem;color:var(--ink-soft);font-weight:300}

/* RESEARCH */
.research-list{margin-top:1rem}
.research-item{display:grid;grid-template-columns:auto 1fr;gap:2rem;padding:1.8rem 0;border-top:1px solid var(--line);align-items:baseline}
.research-item:last-child{border-bottom:1px solid var(--line)}
@media(max-width:760px){.research-item{grid-template-columns:1fr;gap:.5rem}}
.research-tag{font-family:var(--serif-display);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);white-space:nowrap}
.research-item h3{font-family:var(--serif-display);font-weight:400;font-size:1.3rem;line-height:1.3;margin-bottom:.4rem;color:var(--ink)}
.research-item h3 em{font-style:italic}
.research-item p{font-size:1rem;color:var(--ink-soft);font-weight:300}

/* SPEAKING */
.speaking{background:var(--ink);color:var(--paper);border:none}
.speaking .sec-label{color:var(--gold)}
.speaking .sec-title{color:var(--paper)}
.speaking .sec-title em{color:#c9a55f}
.speak-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;margin-top:1rem}
@media(max-width:760px){.speak-grid{grid-template-columns:1fr;gap:2rem}}
.speak-body p{color:rgba(244,239,232,.78);font-weight:300;margin-bottom:1.2rem;font-size:1.08rem}
.speak-topics{list-style:none}
.speak-topics li{padding:.7rem 0;border-bottom:1px solid rgba(244,239,232,.15);font-family:var(--serif-display);font-size:1.05rem;color:var(--paper)}
.speak-topics li:before{content:"—";color:var(--gold);margin-right:.8rem}

/* CTA STRIP */
.cta-strip{text-align:center;padding:5.5rem 0}
.cta-strip h2{font-family:var(--serif-display);font-weight:400;font-size:clamp(1.8rem,4vw,2.8rem);margin-bottom:1rem;letter-spacing:-.01em}
.cta-strip h2 em{font-style:italic;color:var(--teal)}
.cta-strip p{color:var(--ink-soft);font-weight:300;max-width:48ch;margin:0 auto 2.2rem;font-size:1.1rem}

/* FOOTER */
footer{background:var(--paper-warm);padding:3.5rem 0 2.5rem;border-top:1px solid var(--line)}
.foot-grid{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:2rem}
.foot-brand{font-family:var(--serif-display);font-size:22px;color:var(--ink)}
.foot-brand span{color:var(--gold)}
.foot-tag{font-size:.95rem;color:var(--ink-soft);font-weight:300;margin-top:.4rem;max-width:30ch}
.foot-links{display:flex;gap:2rem;flex-wrap:wrap}
.foot-col h5{font-family:var(--serif-display);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:.8rem}
.foot-col a{display:block;font-size:.96rem;color:var(--ink-soft);text-decoration:none;margin-bottom:.5rem;transition:color .2s}
.foot-col a:hover{color:var(--gold)}
.foot-bottom{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--line);font-size:.85rem;color:var(--ink-faint);font-weight:300}

/* reveal — hidden state only applies when JS can reveal it */
@media (scripting: enabled){
  .reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
  .reveal.in{opacity:1;transform:none}
}
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto}
  .reveal{transition:none}
}
```

- [ ] **Step 2: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Fraunces, Newsreader } from 'next/font/google';
import { RevealObserver } from '@/components/RevealObserver';
import { site } from '@/content/site';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://genevievebosah.com'),
  title: site.meta.title,
  description: site.hero.lead,
  alternates: { canonical: '/' },
  openGraph: {
    title: site.meta.title,
    description: site.hero.lead,
    url: '/',
    siteName: `${site.brand.first} ${site.brand.last}`,
    locale: 'en_GB',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${newsreader.variable}`}>
      <body>
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Delete scaffold leftovers**

```bash
rm -f src/app/page.module.css public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

(Build will fail until Tasks 4–6 exist — commit together at end of Task 6.)

---

### Task 4: Content module + RichText + Button

**Files:** Create: `src/components/RichText.tsx`, `src/components/Button.tsx`, `src/content/site.ts`

- [ ] **Step 1: `src/components/RichText.tsx`**

```tsx
import { Fragment } from 'react';

export type Segment = string | { em: string } | { strong: string };
export type Rich = Segment[];

export function RichText({ value }: { value: Rich }) {
  return (
    <>
      {value.map((s, i) =>
        typeof s === 'string' ? (
          <Fragment key={i}>{s}</Fragment>
        ) : 'em' in s ? (
          <em key={i}>{s.em}</em>
        ) : (
          <strong key={i}>{s.strong}</strong>
        ),
      )}
    </>
  );
}
```

- [ ] **Step 2: `src/components/Button.tsx`**

```tsx
import type { CSSProperties } from 'react';

export type ButtonLink = {
  label: string;
  href: string;
  variant: 'primary' | 'ghost';
};

export function Button({ label, href, variant, style }: ButtonLink & { style?: CSSProperties }) {
  return (
    <a href={href} className={`btn btn-${variant}`} style={style}>
      {label}
    </a>
  );
}
```

- [ ] **Step 3: `src/content/site.ts`** — every string copied from `design/gb.html`. This is the single file Phase 3 replaces with WordPress data.

```ts
import type { ButtonLink } from '@/components/Button';
import type { Rich } from '@/components/RichText';

type NavLink = { label: string; href: string };
type ExternalLink = NavLink & { external?: boolean };

export type SiteContent = {
  meta: { title: string };
  brand: { first: string; last: string };
  nav: NavLink[];
  hero: { eyebrow: string; title: Rich; lead: string; ctas: ButtonLink[] };
  roles: string[];
  about: {
    label: string;
    title: string;
    body: Rich[];
    side: { heading: string; text: string }[];
  };
  work: { label: string; title: Rich; pillars: { num: string; title: string; text: string }[] };
  research: { label: string; title: string; items: { tag: string; title: Rich; text: string }[] };
  speaking: { label: string; title: Rich; body: string[]; cta: ButtonLink; topics: string[] };
  connect: { title: Rich; text: string; ctas: ButtonLink[] };
  footer: {
    tagline: string;
    explore: NavLink[];
    connect: ExternalLink[];
    copyright: string;
  };
};

const EMAIL = 'hello@genevievebosah.com';

export const site: SiteContent = {
  meta: { title: 'Dr Genevieve Bosah — Communication Scholar, Strategist & Speaker' },
  brand: { first: 'Dr Genevieve', last: 'Bosah' },
  nav: [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Research', href: '#research' },
    { label: 'Speaking', href: '#speaking' },
    { label: 'Connect', href: '#connect' },
  ],
  hero: {
    eyebrow: 'Communication Scholar · Strategist · Speaker',
    title: ['I study how stories ', { em: 'shape power' }, ' — and help leaders use that power well.'],
    lead: 'Associate Professor and communication researcher. I work at the intersection of media scholarship, strategic communication, and leadership — helping institutions and individuals communicate with clarity, authority, and strategy.',
    ctas: [
      { label: 'Explore the research', href: '#research', variant: 'primary' },
      { label: 'Invite me to speak', href: '#speaking', variant: 'ghost' },
    ],
  },
  roles: ['PhD, Media & Communication', 'Associate Professor', 'Strategic Communicator', 'Author', 'Speaker'],
  about: {
    label: 'About',
    title: 'A scholar of communication, a builder of leaders.',
    body: [
      ['I am an academic and strategic communicator with more than fifteen years of professional experience across Africa and Europe. My doctoral research examined the field of Nigerian journalism through the lens of Bourdieusian field theory — asking how stories are made, who controls them, and how communication shapes power.'],
      ["Today I lead postgraduate curriculum in a UK university, where I direct a Master's programme in journalism and media communications and hold responsibility for postgraduate quality across the school. My scholarship spans media sociology, strategic public relations in emerging economies, digital divides, and health communication in Sub-Saharan Africa."],
      [
        'Beyond the academy, I work with leaders — through coaching, consulting, and the communities I lead — to help them ',
        { strong: 'think clearly, communicate with authority, and lead with strategy.' },
        ' The academy teaches me the mechanics of communication. The work with leaders teaches me the stakes.',
      ],
      ["I also serve as a minister and lead a women's leadership community, where the same conviction holds: that purpose without clear communication rarely reaches the people it was meant for."],
    ],
    side: [
      { heading: 'Current Roles', text: 'Associate Professor & Head of Postgraduate Curriculum · Programme Leader, MA Journalism & Media Communications' },
      { heading: 'Networks Founded', text: 'African PhD Scholars Network · Blossoms Ladies Network · Auxano Consulting' },
      { heading: 'Research Fields', text: 'Media sociology · Strategic communication · Decolonial communication · Health & development communication' },
      { heading: 'Based In', text: 'United Kingdom · Working across Africa & Europe' },
    ],
  },
  work: {
    label: 'What I Do',
    title: ['Three bodies of work, ', { em: 'one through-line.' }],
    pillars: [
      { num: '01', title: 'Scholarship', text: 'Peer-reviewed research, monographs, and edited volumes on journalism, strategic communication, and the politics of media in emerging economies. Supervision and examination across multiple institutions.' },
      { num: '02', title: 'Strategy & Consulting', text: 'Through Auxano, I advise leaders, founders, and organisations on communication strategy and brand — translating expertise into a clear, compelling, and credible public voice.' },
      { num: '03', title: 'Leadership & Community', text: 'Founder of networks that develop emerging scholars and women leaders — building people, not just programmes, and equipping them to communicate their calling with confidence.' },
    ],
  },
  research: {
    label: 'Research & Writing',
    title: 'Selected work and current projects.',
    items: [
      { tag: 'Monograph', title: [{ em: 'When Passion is Insufficient' }], text: 'A field-theoretical study of Nigerian journalism — examining the structural conditions under which journalists work and the forces that shape what gets reported.' },
      { tag: 'Edited Volumes', title: ['Strategic Public Relations in Emerging Economies'], text: 'Lead editor of a two-volume scholarly collection examining communication practice and theory across developing markets.' },
      { tag: 'Ongoing Research', title: ['Digital Divides & Health Communication in Sub-Saharan Africa'], text: 'A co-authored portfolio investigating access, equity, and communication in digital and health contexts across the continent.' },
      { tag: 'Podcast', title: ['The African PhD Chronicles'], text: 'Conversations with African doctoral scholars on the realities of the research journey — building visibility and community for the next generation.' },
    ],
  },
  speaking: {
    label: 'Speaking',
    title: ['Bring rigour and ', { em: 'clarity' }, ' to your stage.'],
    body: [
      'I speak to academic, professional, and faith audiences on communication, leadership, and the discipline of telling a clear story. Whether a keynote, a workshop, or a panel, I bring the same thing: the rigour of a scholar and the directness of a practitioner.',
      'Recent engagements span universities, conferences, leadership summits, and recruitment events across the UK and Africa.',
    ],
    cta: { label: 'Check availability', href: '#connect', variant: 'primary' },
    topics: [
      'How stories shape power — and who gets to tell them',
      'Communicating with clarity, authority & strategy',
      'Decolonial perspectives on media & communication',
      'Building visibility as an emerging scholar or leader',
      'Strategic communication in emerging economies',
    ],
  },
  connect: {
    title: ["Let's ", { em: 'work together.' }],
    text: 'For research collaboration, speaking enquiries, or strategic communication advisory through Auxano — I would be glad to hear from you.',
    ctas: [
      { label: 'Book a discovery call', href: `mailto:${EMAIL}`, variant: 'primary' },
      { label: 'Read my work', href: '#research', variant: 'ghost' },
    ],
  },
  footer: {
    tagline: 'Communication scholar, strategist, and speaker. Helping leaders communicate with clarity, authority, and strategy.',
    explore: [
      { label: 'About', href: '#about' },
      { label: 'Research', href: '#research' },
      { label: 'Speaking', href: '#speaking' },
    ],
    connect: [
      { label: 'LinkedIn', href: 'https://uk.linkedin.com/in/genevievebosah', external: true },
      { label: 'Instagram', href: 'https://www.instagram.com/drgenebosah/', external: true },
      { label: 'Email', href: `mailto:${EMAIL}` },
    ],
    copyright: '© 2026 Dr Genevieve Bosah. All rights reserved.',
  },
};
```

---

### Task 5: Section components

**Files:** Create all of `src/components/sections/*.tsx`. Markup mirrors `design/gb.html` element-for-element, including where `reveal` sits.

- [ ] **Step 1: `Nav.tsx`**

```tsx
import { site } from '@/content/site';

export function Nav() {
  return (
    <nav>
      <div className="nav-inner">
        <a href="#top" className="brand">
          {site.brand.first} <span>{site.brand.last}</span>
        </a>
        <ul className="nav-links">
          {site.nav.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: `Hero.tsx`**

```tsx
import { Button } from '@/components/Button';
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Hero() {
  const { hero } = site;
  return (
    <header className="hero" id="top">
      <div className="wrap">
        <p className="eyebrow reveal">{hero.eyebrow}</p>
        <h1 className="reveal">
          <RichText value={hero.title} />
        </h1>
        <p className="hero-lead reveal">{hero.lead}</p>
        <div className="hero-cta reveal">
          {hero.ctas.map((c) => (
            <Button key={c.href} {...c} />
          ))}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: `Roles.tsx`**

```tsx
import { site } from '@/content/site';

export function Roles() {
  return (
    <div className="roles">
      <div className="roles-track">
        {site.roles.map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `About.tsx`**

```tsx
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function About() {
  const { about } = site;
  return (
    <section id="about">
      <div className="wrap">
        <p className="sec-label reveal">{about.label}</p>
        <div className="about-grid">
          <div className="about-body reveal">
            <h2 className="sec-title">{about.title}</h2>
            {about.body.map((p, i) => (
              <p key={i}>
                <RichText value={p} />
              </p>
            ))}
          </div>
          <aside className="about-side reveal">
            {about.side.flatMap((s) => [
              <h4 key={`${s.heading}-h`}>{s.heading}</h4>,
              <p key={`${s.heading}-p`}>{s.text}</p>,
            ])}
          </aside>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: `Work.tsx`**

```tsx
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Work() {
  const { work } = site;
  return (
    <section id="work">
      <div className="wrap">
        <p className="sec-label reveal">{work.label}</p>
        <h2 className="sec-title reveal">
          <RichText value={work.title} />
        </h2>
        <div className="pillars">
          {work.pillars.map((p) => (
            <div className="pillar reveal" key={p.num}>
              <span className="pillar-num">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: `Research.tsx`**

```tsx
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Research() {
  const { research } = site;
  return (
    <section id="research">
      <div className="wrap">
        <p className="sec-label reveal">{research.label}</p>
        <h2 className="sec-title reveal">{research.title}</h2>
        <div className="research-list">
          {research.items.map((item) => (
            <div className="research-item reveal" key={item.tag}>
              <span className="research-tag">{item.tag}</span>
              <div>
                <h3>
                  <RichText value={item.title} />
                </h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: `Speaking.tsx`**

```tsx
import { Button } from '@/components/Button';
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Speaking() {
  const { speaking } = site;
  return (
    <section id="speaking" className="speaking">
      <div className="wrap">
        <p className="sec-label reveal">{speaking.label}</p>
        <h2 className="sec-title reveal">
          <RichText value={speaking.title} />
        </h2>
        <div className="speak-grid">
          <div className="speak-body reveal">
            {speaking.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <Button {...speaking.cta} style={{ marginTop: '1rem', display: 'inline-block' }} />
          </div>
          <ul className="speak-topics reveal">
            {speaking.topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: `Connect.tsx`**

```tsx
import { Button } from '@/components/Button';
import { RichText } from '@/components/RichText';
import { site } from '@/content/site';

export function Connect() {
  const { connect } = site;
  return (
    <section className="cta-strip" id="connect">
      <div className="wrap reveal">
        <h2>
          <RichText value={connect.title} />
        </h2>
        <p>{connect.text}</p>
        <div className="hero-cta" style={{ justifyContent: 'center' }}>
          {connect.ctas.map((c) => (
            <Button key={c.href} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: `Footer.tsx`**

```tsx
import { site } from '@/content/site';

export function Footer() {
  const { brand, footer } = site;
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-brand">
              {brand.first} <span>{brand.last}</span>
            </div>
            <p className="foot-tag">{footer.tagline}</p>
          </div>
          <div className="foot-links">
            <div className="foot-col">
              <h5>Explore</h5>
              {footer.explore.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
            <div className="foot-col">
              <h5>Connect</h5>
              {footer.connect.map((l) =>
                l.external ? (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener">
                    {l.label}
                  </a>
                ) : (
                  <a key={l.href} href={l.href}>
                    {l.label}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
        <div className="foot-bottom">{footer.copyright}</div>
      </div>
    </footer>
  );
}
```

---

### Task 6: Compose the page → fidelity test passes

**Files:** Replace: `src/app/page.tsx`

- [ ] **Step 1: `src/app/page.tsx`**

```tsx
import { About } from '@/components/sections/About';
import { Connect } from '@/components/sections/Connect';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { Nav } from '@/components/sections/Nav';
import { Research } from '@/components/sections/Research';
import { Roles } from '@/components/sections/Roles';
import { Speaking } from '@/components/sections/Speaking';
import { Work } from '@/components/sections/Work';

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Roles />
      <About />
      <Work />
      <Research />
      <Speaking />
      <Connect />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Temporary stub so the layout import resolves** — create `src/components/RevealObserver.tsx` returning `null` (real one in Task 7):

```tsx
'use client';

export function RevealObserver() {
  return null;
}
```

- [ ] **Step 3: Run tests — expect PASS**

Run: `npm test`
Expected: `fidelity.test.tsx` 3 passed. If the text diff fails, the assertion output shows the exact mismatching string — fix `site.ts` to match `design/gb.html`, never the reverse.

- [ ] **Step 4: Lint + build**

Run: `npm run lint && npm run build`
Expected: no lint errors; `/` is `○ (Static)`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: port design to Next.js sections with typed content module"
```

---

### Task 7: Scroll-reveal (replaces the inline `<script>`)

**Files:** Replace: `src/components/RevealObserver.tsx`; Create: `src/test/reveal.test.tsx`

- [ ] **Step 1: Write failing test `src/test/reveal.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RevealObserver } from '@/components/RevealObserver';

type IOCallback = (entries: { isIntersecting: boolean; target: Element }[]) => void;

function mockIO() {
  const observed: Element[] = [];
  let cb: IOCallback = () => {};
  const io = vi.fn(function (this: unknown, callback: IOCallback) {
    cb = callback;
    return { observe: (el: Element) => observed.push(el), unobserve: vi.fn(), disconnect: vi.fn() };
  });
  vi.stubGlobal('IntersectionObserver', io);
  return { observed, fire: (el: Element) => cb([{ isIntersecting: true, target: el }]) };
}

const markup = (
  <>
    <p className="reveal">a</p>
    <p className="reveal">b</p>
    <RevealObserver />
  </>
);

afterEach(() => vi.unstubAllGlobals());

describe('RevealObserver', () => {
  it('observes .reveal elements with staggered delays and reveals on intersect', () => {
    const { observed, fire } = mockIO();
    const { container } = render(markup);
    const els = container.querySelectorAll<HTMLElement>('.reveal');
    expect(observed).toHaveLength(2);
    expect(els[1].style.transitionDelay).toBe('70ms');
    fire(els[0]);
    expect(els[0].classList.contains('in')).toBe(true);
    expect(els[1].classList.contains('in')).toBe(false);
  });

  it('reveals everything immediately when reduced motion is preferred', () => {
    mockIO();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { container } = render(markup);
    container.querySelectorAll('.reveal').forEach((el) => expect(el.classList.contains('in')).toBe(true));
  });
});
```

- [ ] **Step 2: Run — expect FAIL** (`npm test` → observed length 0)

- [ ] **Step 3: Implement `src/components/RevealObserver.tsx`**

Same behaviour as the design's script (threshold .12, `(i % 4) * 70ms` stagger), plus reduced-motion and no-IO fallbacks.

```tsx
'use client';

import { useEffect } from 'react';

export function RevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return null;
}
```

- [ ] **Step 4: Run — expect PASS** (`npm test` → all green)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: scroll reveal with reduced-motion and no-JS fallbacks"
```

---

### Task 8: Legacy WordPress URL redirects

Temporary (307) on purpose: in Phase 3 `/blog` and the two post slugs come back, and browsers cache permanent redirects.

**Files:** Create: `src/lib/legacy-redirects.ts`, `src/test/legacy-redirects.test.ts`; Replace: `next.config.ts`

- [ ] **Step 1: Failing test `src/test/legacy-redirects.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { legacyRedirects } from '@/lib/legacy-redirects';

const dest = (source: string) => legacyRedirects.find((r) => r.source === source)?.destination;

describe('legacy WP redirects', () => {
  it('maps old pages to the matching section', () => {
    expect(dest('/about')).toBe('/#about');
    expect(dest('/research')).toBe('/#research');
    expect(dest('/podcast')).toBe('/#research');
    expect(dest('/contact')).toBe('/#connect');
    expect(dest('/connect')).toBe('/#connect');
  });

  it('sends blog URLs home for now', () => {
    expect(dest('/blog')).toBe('/');
    expect(dest('/on-setting-goals')).toBe('/');
    expect(dest('/should-you-change-your-accent')).toBe('/');
  });

  it('never uses permanent redirects (Phase 3 reclaims these URLs)', () => {
    expect(legacyRedirects.every((r) => r.permanent === false)).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL** (module not found)

- [ ] **Step 3: `src/lib/legacy-redirects.ts`** (slugs taken from the live site's `/wp-json/wp/v2/pages` and `/posts`)

```ts
export type LegacyRedirect = { source: string; destination: string; permanent: false };

const to = (destination: string, sources: string[]): LegacyRedirect[] =>
  sources.map((source) => ({ source, destination, permanent: false }));

export const legacyRedirects: LegacyRedirect[] = [
  ...to('/#about', ['/about', '/team', '/teaching']),
  ...to('/#research', ['/research', '/research-3', '/writing', '/podcast']),
  ...to('/#connect', ['/connect', '/contact', '/contact-genevieve']),
  ...to('/', [
    '/blog',
    '/on-setting-goals',
    '/should-you-change-your-accent',
    '/home',
    '/home-2',
    '/home-3',
    '/sample-page',
    '/tests',
  ]),
];
```

- [ ] **Step 4: Replace `next.config.ts`**

```ts
import type { NextConfig } from 'next';
import { legacyRedirects } from './src/lib/legacy-redirects';

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
```

- [ ] **Step 5: Run tests + build — expect PASS**

Run: `npm test && npm run build`

- [ ] **Step 6: Manual check**

Run: `npm run start` then in another shell `curl -sI http://localhost:3000/on-setting-goals/ -L -o /dev/null -w '%{url_effective} %{http_code}\n'`
Expected: `http://localhost:3000/ 200`

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: temporary redirects for legacy WordPress URLs"
```

---

### Task 9: Visual check against the design

- [ ] **Step 1:** `npm run dev`; open `http://localhost:3000` and `design/gb.html` side by side (desktop 1280px and mobile 375px). Check: fonts (Fraunces display / Newsreader body), hero radial glow, ✦ separators, pillar border colours (teal/gold/plum), dark Speaking band, sticky blurred nav, nav hidden ≤760px, reveal animation.
- [ ] **Step 2:** Disable JavaScript in devtools → reload → all content visible.
- [ ] **Step 3:** Enable "prefers-reduced-motion: reduce" emulation → content visible without animation.
- [ ] **Step 4:** Fix any differences (CSS only; content is test-locked), commit `fix: visual parity with design`.

---

### Task 10: Vercel project + Git integration

- [ ] **Step 1: Confirm account**

Run: `vercel whoami` → Expected: `jerryagenyi`

- [ ] **Step 2: Create + link project**

```bash
vercel project add gb
vercel link --yes --project gb
vercel git connect https://github.com/jerryagenyi/gb.git
```

Expected: `.vercel/` created (gitignored); "Connected GitHub repository jerryagenyi/gb". Framework auto-detected as Next.js; production branch `main`.

- [ ] **Step 3: Push → production deploy on `<production .vercel.app URL>`**

```bash
git push origin main
vercel ls gb
```

Expected: newest deployment `● Ready`, Production.

- [ ] **Step 4: Verify live** — open the production URL in the browser pane; repeat Task 9 Step 1 checks; `curl -sI https://<production .vercel.app URL>/blog -o /dev/null -w '%{http_code} %{redirect_url}\n'` → `307 https://<production .vercel.app URL>/`

- [ ] **Step 5:** Share the URL with Genevieve for sign-off. **Phase 1 done.**

---

## Phase 2 — Domain cutover (only after Genevieve's go-ahead)

Ops runbook, not code. DNS lives in **cPanel → Zone Editor** on the Namecheap hosting (nameservers `dns1/dns2.namecheaphosting.com`).

- [ ] **Step 0: Blocked until** Genevieve regains Namecheap/cPanel + WP-admin access (in progress).
- [ ] **Step 1: Back up WordPress** — cPanel → Backup → *Download a Full Account Backup*; plus WP admin → Tools → Export → *All content* (WXR XML — contains the 2 posts, needed in Phase 3). Store both outside the repo.
- [ ] **Step 2: Snapshot the DNS zone** — export/screenshot every record in Zone Editor (A, CNAME, MX, TXT/SPF/DKIM/DMARC, `mail`, `autodiscover`, `cpanel`, `webmail`, `ftp`). Commit nothing secret; keep the snapshot with the backups.
- [ ] **Step 3: Lower TTL** on `@` A and `www` records to 300s; wait for the old TTL to expire (≤24h).
- [ ] **Step 4: Add domains in Vercel**

```bash
vercel domains add genevievebosah.com gb
vercel domains add www.genevievebosah.com gb
vercel domains inspect genevievebosah.com
```

Use the exact A / CNAME values `inspect` prints (Vercel issues project-specific values; historically `A 76.76.21.21` and `CNAME cname.vercel-dns.com`). In the Vercel dashboard set `www` → redirect to apex (or vice-versa — pick apex as canonical to match `metadataBase`).

- [ ] **Step 5: Edit only these two records in cPanel Zone Editor**
  - `genevievebosah.com.` A → Vercel value
  - `www.genevievebosah.com.` CNAME → Vercel value (delete the old `www` A/CNAME first if present)
  - **Leave untouched:** MX, `mail`, `webmail`, `cpanel`, `autodiscover`, all TXT. **Do not change nameservers.**
- [ ] **Step 6: Verify**

```bash
nslookup genevievebosah.com 1.1.1.1
nslookup -type=MX genevievebosah.com 1.1.1.1
curl -sI https://genevievebosah.com | grep -i 'server\|x-vercel'
```

Expected: A = Vercel IP; MX unchanged (`mail.genevievebosah.com`, `mx3-hosting.jellyfish.systems`); `server: Vercel`. `vercel domains inspect` shows valid config + SSL issued.

- [ ] **Step 7: Verify email both ways** — send to and from `hello@genevievebosah.com` (and any other mailbox she uses).
- [ ] **Step 8: Old WordPress** is now unreachable by domain but still on the hosting with vulnerable plugins. Either (a) leave until Phase 3 (it's not publicly routed via the domain, though reachable by IP), or (b) put it into maintenance / remove sliders now. Recommend (b) disable Slider Revolution + LayerSlider at minimum.
- [ ] **Step 9:** Raise TTLs back to default (3600+).

---

## Phase 3 — (Future) Headless WordPress blog

Trigger: Genevieve wants to blog. Not to be started before then.

**Hosting reality check:** she already has Namecheap shared hosting running WordPress.org — confirm plan tier and renewal before buying anything new.

**Shape:**
- WP at **`cms.genevievebosah.com`** (cPanel subdomain + A record on the same hosting; Vercel keeps the apex). Recommend a **fresh WP install** over upgrading 5.3 + BeTheme/WPBakery/sliders; import the 2 posts from the Phase 2 WXR export.
- WP front-end disabled (redirect all non-admin, non-GraphQL requests to `https://genevievebosah.com`), XML-RPC off, application passwords for API auth, auto-updates on.
- Next.js: `src/lib/wp.ts` (GraphQL `fetch` with cache tags), `/blog` + `/blog/[slug]` routes, `/api/revalidate` (secret-checked, `revalidateTag`) called by a WP publish webhook, optional draft preview via `draftMode()`.
- Swap the two post redirects in `legacy-redirects.ts` to `/blog/<slug>` and make them `permanent: true`; remove `/blog` → `/`.
- Env vars on Vercel: `WP_GRAPHQL_URL`, `WP_REVALIDATE_SECRET` (+ preview credentials if previews are wanted).

**Plugins:**

| Plugin | Needed? | Why |
|---|---|---|
| **WPGraphQL** | **Yes** | The API the Next.js app reads posts (and later page content) from. |
| **Secure Custom Fields (SCF)** | **Yes, if** Genevieve should edit the homepage copy (hero, about sidebar, pillars, research items, speaking topics) in WP. **No** for posts alone. | Lets us model `site.ts` as an SCF options page + a "Research item" post type, so `site.ts` becomes a WPGraphQL query with the same `SiteContent` shape. Needs **WPGraphQL for ACF** to expose fields — verify its SCF compatibility at install time. Recommendation: install it; editing her own research list without a developer is the main reason to go headless at all. |
| **Flamingo** | **Probably no.** | Flamingo only stores Contact Form 7 submissions. The design has no form (mailto button). Only needed if we add a CF7-backed contact form submitted via CF7's REST endpoint (`/wp-json/contact-form-7/v1/contact-forms/{id}/feedback`). Simpler alternative if a form is wanted: Next.js server action + transactional email (e.g. Resend) — no WP plugins. Decide when/if a form is added. |
| Contact Form 7 | Only with Flamingo above | — |
| Headless redirect / front-end lock | Yes (small mu-plugin or a maintained "headless mode" plugin) | Stop the WP theme front-end from being indexed/served. |
| Security hardening (e.g. Wordfence or equivalent) | Recommended | Shared hosting + public `/wp-admin`. |

**Carry-overs from the Phase 1 code review (must address when adding routes):**
- `RevealObserver` runs once from the root layout. With client-side navigation to `/blog`, new `.reveal` elements would stay at opacity 0 — re-run the effect on `usePathname()` (or mount per page).
- Next 16 no longer forces `scroll-behavior` during route changes — add `data-scroll-behavior="smooth"` to `<html>` once `<Link>` routes exist.
- Keep `trailingSlash: false`; old WP URLs (`/about/`) take a 308 to the slashless form first.
- Consider redirecting WP leftovers: `/feed`, `/category/*`, `/author/*`, `/?p=N`.
- Known, accepted v1 risk: if the JS bundle fails to load, `.reveal` content stays hidden (same as the original design's script approach).
- Test gaps to close: structural (tag/class/attr) fidelity diff, full redirect-array snapshot, no-IntersectionObserver fallback test.

Write a dedicated implementation plan for this phase when triggered.

---

## Phase 4 — (Future) Polish & "spice", subject to Genevieve's wishes

Backlog, nothing committed:
- Professional portrait in hero (the copy doc suggests "burgundy or conference shot") via `next/image`.
- Fraunces variable-axis motion on headings (opsz/weight on scroll/hover).
- Ink-draw underline on "shape power".
- Academic-style margin notes in About.
- Paper grain texture; card hover warmth.
- Podcast / talk embeds in Speaking; a "Now" section.
- View transitions once there are multiple routes (blog).
- Real publication links/DOIs; booking link; confirm job titles (copy doc checklist items 1–3).
- Decide on linking the Herts research profile (https://researchprofiles.herts.ac.uk/en/persons/genevieve-bosah/) for a full publications list.

---

## Decisions (2026-10-08)

1. `hello@genevievebosah.com` existence unknown — Genevieve is sorting Namecheap/WP logins. Keep as-is for v1.
2. Vercel project name: **`gb`**. SEO is unaffected: the canonical tag (`alternates.canonical` → `https://genevievebosah.com/`) tells search engines the custom domain is the real page, so the `*.vercel.app` alias is never treated as the primary copy.
3. The 2 old 2021 posts may be offline (backed up, redirected home) until Phase 3.
4. Build work happens on branch `feat/nextjs-port` (Vercel preview deploys), merged to `main` after review.
5. **Old WordPress.com site** (no longer in use) still holds **31 posts (27 published, 4 drafts, 2016–2020)**. Phase 3 should export these too (WP.com → Tools → Export) and decide with Genevieve which to republish.
