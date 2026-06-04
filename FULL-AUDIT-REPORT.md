# BashSnippets.xyz — Full SEO Audit Report
**Date:** 2026-06-03  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Scope:** Full site — 17 snippets, 6 tools, 7 core pages  
**SEO Health Score: 74/100**

---

## Executive Summary

BashSnippets.xyz has a solid technical foundation — correct schema patterns, good breadcrumbs, proper canonicals, fast asset loading — but has accumulated several content-staleness issues from rapid snippet additions, plus a few structural gaps that directly limit rankings.

**Top 5 critical issues:**
1. Homepage `generateMetadata()` is nearly empty — falls back to generic root layout title/description
2. Snippet count is stale across 5 locations — 17 snippets exist but site says "16" everywhere
3. `llms.txt` missing the newest snippet (`find-duplicate-files`) — invisible to AI crawlers
4. Native `sitemap.ts` missing `/about`, `/privacy`, `/contact` — 3 pages Google can't discover via sitemap
5. Snippet pages missing `og:type: 'article'` — OG previews degrade on social/link unfurls

**Top 5 quick wins (< 30 min each):**
1. Add `find-duplicate-files` to `llms.txt`
2. Update all "16" → "17" count references across 4 files
3. Add `/about`, `/privacy`, `/contact` to `sitemap.ts`
4. Add `og:type: 'article'` to snippet `generateMetadata()`
5. Add full `generateMetadata()` to homepage `page.tsx`

---

## Scoring Breakdown

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Technical SEO | 74/100 | 22% | 16.3 |
| Content Quality | 85/100 | 23% | 19.6 |
| On-Page SEO | 68/100 | 20% | 13.6 |
| Schema / Structured Data | 78/100 | 10% | 7.8 |
| Performance (CWV) | 88/100 | 10% | 8.8 |
| AI Search Readiness | 72/100 | 10% | 7.2 |
| Images | 75/100 | 5% | 3.75 |
| **TOTAL** | | | **77.1/100** |

> Performance score is code-review based (no live Lighthouse run). Three.js loads lazily via `requestIdleCallback`, GA4/AdSense defer properly, AVIF/WebP images enabled — score estimate is conservative.

---

## Technical SEO

### Crawlability & Indexability

**PASS** — `robots.ts` returns `allow: '/'` for all agents with correct sitemap reference.

**PASS** — Canonical tags set correctly on all pages via `alternates.canonical`.

**PASS** — 301 permanent redirects configured for all `.html` legacy URLs in `next.config.ts`.

**FAIL (High)** — `find-duplicate-files` has no `.html` redirect. Every other snippet has:
```ts
{ source: '/snippets/<slug>.html', destination: '/snippets/<slug>', permanent: true }
```
`find-duplicate-files` is the only new snippet missing this entry in [next.config.ts](next.config.ts).

**FAIL (Medium)** — Native `sitemap.ts` uses `new Date()` as `lastModified` for every page. All 28 URLs appear equally fresh at every build even when content didn't change. Use actual `dateModified` from registry entries instead:
```ts
// src/app/sitemap.ts — snippet URLs should be:
url: `${SITE_URL}/snippets/${slug}`,
lastModified: new Date(getSnippetBySlug(slug)!.dateModified),
```

**FAIL (Medium)** — `sitemap.ts` omits `/about`, `/privacy`, `/contact`. These three pages exist and are linked from the footer but aren't in the live sitemap. Google won't discover them through sitemap.

**INFO** — `robots.ts` passes a `host` property that `MetadataRoute.Robots` doesn't support in TypeScript types. It's likely silently ignored. Dead field — remove it.

**INFO** — Two sitemap systems coexist: `src/app/sitemap.ts` (native, serves live `/sitemap.xml`) and `next-sitemap.config.js` (writes to `sitemap-backup/`). The backup is never served and doesn't conflict, but it adds maintenance confusion. The `next-sitemap.config.js` actually has *better* priority tuning than `sitemap.ts` — consider migrating that logic to the native version.

### Security Headers

No custom security headers in `next.config.ts`. Vercel adds some defaults, but the following are typically missing without explicit config:

- `X-Frame-Options` / `Content-Security-Policy frame-ancestors`
- `Permissions-Policy`

Not a ranking factor but relevant to trust signals.

---

## Content Quality

### Snippet Content Assessment (Sample Review)

All reviewed snippets follow the content voice guidelines correctly:
- Consequence-first leads ("A full disk stops your web server...")
- No "simply", "just", "easy" hedges
- Senior-to-junior tone
- Real FAQ questions matching search intent

**PASS** — All 17 snippets have Quick Answer blocks (registry + MDX frontmatter coverage confirmed).

**PASS** — All snippets have FAQ sections with 3-5 items sourced from frontmatter.

**PASS** — All snippets have HowTo steps in frontmatter.

**FAIL (Medium)** — Snippet count is stale in content copy. `find-duplicate-files` was added 2026-06-03 (today) but count references weren't updated:

| File | Current text | Should be |
|---|---|---|
| `src/app/snippets/page.tsx` metadata | "16 copy-paste bash scripts" | "17 copy-paste bash scripts" |
| `src/app/snippets/page.tsx` body stats | `<span>16</span> scripts` | `17` |
| `src/app/about/page.tsx` | "16 bash scripts" | "17 bash scripts" |
| `src/app/page.tsx` hero stats | "20+ Working Scripts" | Either "17" (accurate) or "20+" (aspirational but misleading) |
| `public/llms.txt` intro | "20+ ready-to-run bash scripts" | "17+ ready-to-run bash scripts" |
| `collectionPageSchema` in snippets/page.tsx | "16 copy-paste bash scripts" | "17 copy-paste bash scripts" |

The hero "20+ Working Scripts" is a stretch goal that overstates the actual 17. Misleading claims erode trust with both users and E-E-A-T evaluators.

### E-E-A-T Assessment

**GOOD** — Author identity consistent: "Anguishe", "Creator of BashSnippets.xyz", Florida-based, self-taught. Mentioned in `about/page.tsx`, author bio on snippet pages, llms.txt.

**GOOD** — Multiple corroborating signals: YouTube channel, dev.to profile, GitHub scripts repo all listed in `about/page.tsx` and Organization sameAs schema.

**CONCERN** — TikTok (@BashSnippets) is in the Organization `sameAs` schema on the homepage. If this account is not active or doesn't have content, remove it — unverified sameAs links can hurt trust signals.

**CONCERN** — No visible publication dates on the snippets index page. Adding dates to snippet cards (or at minimum the most recently added) shows freshness.

---

## On-Page SEO

### Homepage (`/`)

**FAIL (High)** — `src/app/page.tsx` exports metadata with only one field:
```ts
export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};
```
The title, description, og:image, og:type, and twitter:card all fall back to `layout.tsx` defaults. The root layout title is `'BashSnippets.xyz — Free Bash Scripts for Linux & DevOps'` — that's fine for fallback but the homepage deserves its own targeted metadata.

Recommended addition to `src/app/page.tsx`:
```ts
export const metadata: Metadata = {
  title: 'Bash Script Library — Free Copy-Paste Scripts for Linux & DevOps',
  description: 'Free bash scripts for disk monitoring, backups, process management, and more. Tested on Ubuntu 22.04 LTS and macOS. No login required.',
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: 'Bash Script Library — Free Copy-Paste Scripts for Linux & DevOps',
    description: 'Free bash scripts for disk monitoring, backups, process management, and more. 17 scripts, 6 tools, zero logins.',
    url: SITE_URL,
    type: 'website',
    images: [{ url: '/ogimage.png', width: 1200, height: 630 }],
  },
};
```

### Snippet Pages (`/snippets/[slug]`)

**FAIL (High)** — `generateMetadata()` doesn't set `openGraph.type: 'article'`. Falls back to root layout's `type: 'website'`. Fix in `src/app/snippets/[slug]/page.tsx`:
```ts
openGraph: {
  title: snippet.title,
  description: snippet.description,
  url: `${SITE_URL}/snippets/${snippet.slug}`,
  type: 'article',                          // ← add this
  publishedTime: snippet.datePublished,     // ← add this
  modifiedTime: snippet.dateModified,       // ← add this
  authors: [`${SITE_URL}/about`],           // ← add this
  images: [OG_IMAGE],
},
```

**PASS** — Title template correctly appended: "Disk Space Warning Script | BashSnippets.xyz"

**PASS** — Canonical per-page set.

**PASS** — Breadcrumbs rendered visually and in schema.

### Snippets Index (`/snippets`)

**PASS** — CollectionPage + BreadcrumbList schema present.

**FAIL (Medium)** — Title "Bash Script Examples | BashSnippets.xyz" could be more specific and count-driven. Consider: `'Bash Script Library — 17 Copy-Paste Shell Scripts for Linux'`.

**FAIL (Medium)** — `collectionPageSchema` description hardcodes "16 copy-paste bash scripts". Should use dynamic count from `snippets.length`.

### Tools Index (`/tools`)

**PASS** — CollectionPage + BreadcrumbList schema present.

**FAIL (Low)** — Title "Bash Tools | BashSnippets.xyz" misses specificity. Consider: `'Free Bash Tools — Cron Builder, Chmod Calculator & More'`.

**FAIL (Low)** — Missing namecheap AffiliateBox. Snippet pages show both; tools index shows only DigitalOcean.

### Tool Pages (`/tools/[slug]`)

**PASS** — FAQPage + BreadcrumbList schema present.

**FAIL (Medium)** — Schema type is `SoftwareApplication` but CLAUDE.md specifies `WebApplication` for browser tools. Change `'@type': 'SoftwareApplication'` → `'@type': 'WebApplication'` in `src/app/tools/[slug]/page.tsx` `buildSchemas()`.

**PASS** — Tool pages have How to Use section, but no `HowTo` JSON-LD schema. Not in spec but would be additive.

### Heading Structure

**PASS** — H1 on every page, H2 for sections, H3 for subsections.

**INFO** — Homepage H2s: "Copy-Paste Scripts That Work" / "Free Browser Tools for Bash" / "Common Questions". These could use target keywords: "Bash Scripts That Work on Linux and macOS" / "Free Bash Browser Tools" / "Common Bash Questions".

### Internal Linking

**CONCERN** — No links from tool pages to related snippets. Opportunities:
- Cron Job Builder → disk-space-warning, automated-file-backup, restart-service-if-stopped (all `cron-ready` tagged)
- Chmod Permissions Builder → file-permissions-security, ssh-key-setup-script
- Bash Boilerplate Generator → bash-error-handling
- Bash Exit Code Lookup → bash-error-handling

---

## Schema / Structured Data

### Homepage

| Schema | Status | Notes |
|---|---|---|
| WebSite | ✓ | Includes SearchAction — good |
| Organization | ✓ | sameAs: YouTube, TikTok, dev.to |
| FAQPage | ✓ | 4 questions — could add 2-3 more |

**CONCERN** — FAQPage on homepage uses `<details>` toggles for the FAQ UI but not the FAQ schema's recommended `mainEntity` pattern for rich results. Actually it does — the `faqSchema` object is correct. ✓

### Snippet Pages

| Schema | Status | Notes |
|---|---|---|
| TechArticle | ✓ | datePublished, dateModified, author, publisher |
| FAQPage | ✓ | Dynamically from MDX frontmatter |
| HowTo | ✓ | Dynamically from MDX frontmatter |
| BreadcrumbList | ✓ | 3-level |

**NOTE** — `HowTo` schema emits an empty `step: []` array for snippets without `howToSteps` in frontmatter. Google ignores empty HowTo but it's cleaner to conditionally omit the schema if `snippet.howToSteps.length === 0`. Looking at the code, `generateSnippetSchema()` always includes `howToSchema` — it should guard against empty steps.

### Tool Pages

| Schema | Status | Notes |
|---|---|---|
| SoftwareApplication | ✗ | Should be WebApplication (CLAUDE.md spec) |
| FAQPage | ✓ | From tools.ts registry |
| BreadcrumbList | ✓ | 3-level |

---

## Performance (Code Review)

**GOOD** — Three.js (`HeroCanvas`) loaded via `dynamic()` with `ssr: false` + `requestIdleCallback` in `HeroCanvasLoader.tsx`. Won't block LCP.

**DEAD CODE** — `HeroCanvasLoader` component is never imported in `src/app/page.tsx` or any other page. The current homepage hero uses a static `<Image>` instead. The component and `HeroCanvas.tsx` appear to be unused. If Three.js canvas was replaced by the static image approach, both files should be deleted to reduce bundle size.

**GOOD** — `next/image` with `priority` on hero image. AVIF/WebP formats enabled.

**GOOD** — GA4 loads `strategy="afterInteractive"`, AdSense loads `strategy="lazyOnload"`. Neither blocks render.

**GOOD** — `compress: true` in `next.config.ts`.

**GOOD** — `next/font/google` used for IBM Plex Mono and Syne — fonts preloaded correctly, no `<link>` FOUT.

**GOOD** — `poweredByHeader: false` — removes `X-Powered-By: Next.js` header (security hygiene).

---

## Images

**PASS** — Hero image (`/hero-section-bs.png`) has empty `alt=""` — correct for decorative images.

**PASS** — Author bio image in snippet pages has meaningful alt: `"BashSnippets logo"`.

**PASS** — OG image (`/ogimage.png`) declared with correct dimensions (1200×630).

**FAIL (Low)** — A single `ogimage.png` is used for ALL pages (homepage, all snippets, all tools). Per-page OG images would significantly improve social share CTR and brand recognition. Consider generating per-snippet OG images using Next.js `opengraph-image.tsx` route convention.

**INFO** — `og-image.png` and `ogimage.png` both exist in `public/`. The code references `ogimage.png`. `og-image.png` appears to be an old file — can be deleted.

---

## AI Search Readiness

### llms.txt Assessment

**PASS** — `public/llms.txt` exists with correct format.

**FAIL (High)** — `find-duplicate-files` is NOT listed in the "All Snippet Pages" section. Added 2026-06-03, not propagated to llms.txt.

**FAIL (Medium)** — "Interactive Tools" section only lists 2 of 6 tools:
- ✓ Script Builder (generic link to /tools/)
- ✓ Bash Boilerplate Generator
- ✗ Bash Exit Code Lookup
- ✗ Cron Job Builder
- ✗ Chmod Permissions Builder
- ✗ Path Debugger
- ✗ ShellCheck Error Decoder

The "Most important pages" section at the bottom covers these, but they should also be in the Interactive Tools section for AI crawler context.

**FAIL (Low)** — Intro says "20+ ready-to-run bash scripts" but actual count is 17. Should be "17 ready-to-run bash scripts" or "17+ ready-to-run bash scripts".

### AI Citability

**GOOD** — Quick Answer blocks (150-300 words) are self-contained, factual, and follow the "what it does → why it matters → how to use" pattern that AI models cite as passages.

**GOOD** — Structured tool FAQs with direct-answer patterns ("Exit code 127 means 'command not found.'").

**GOOD** — Technical specificity (OS versions, command flags, exact syntax) improves passage-level citability.

**CONCERN** — No `<meta name="description">` differentiation per-page for tools (they use generic tool description). AI crawlers use meta descriptions for summarization context.

---

## Sitemap Analysis

### Native `sitemap.ts`

Current sitemap generates 28 URLs:
- `/` (homepage)
- `/snippets` (index)
- `/tools` (index)
- 17 snippet pages
- 6 tool pages

**Missing:** `/about`, `/privacy`, `/contact`

**Issue:** All `lastModified: new Date()` — same date for every URL at every build.

**Issue:** Flat priority values — all snippets and tools at `0.8`, both indexes at `0.9`.

### `next-sitemap.config.js` (sitemap-backup/)

This config is better — differentiated priorities and change frequencies:
- `/` → daily, 1.0
- `/tools`, `/snippets` → daily, 0.9
- tool pages → weekly, 0.9
- snippet pages → weekly, 0.8
- utility pages → monthly, 0.5

But it outputs to `sitemap-backup/` and is NOT served live. The priority logic from this config should be migrated into `sitemap.ts`.

---

## Redirect Coverage

| Snippet | .html redirect | Status |
|---|---|---|
| disk-space-warning | ✓ | OK |
| automated-file-backup | ✓ | OK |
| delete-old-log-files | ✓ | OK |
| quick-system-info-report | ✓ | OK |
| search-files-for-text-grep | ✓ | OK |
| check-if-website-is-up | ✓ | OK |
| bash-error-handling | ✓ | OK |
| bash-if-else-examples | ✓ | OK |
| create-dated-folder | ✓ | OK |
| kill-a-process | ✓ | OK |
| file-permissions-security | ✓ | OK |
| monitor-cpu-ram-usage | ✓ | OK |
| bash-send-email-alert | ✓ | OK |
| mysql-database-backup | ✓ | OK |
| ssh-key-setup-script | ✓ | OK |
| restart-service-if-stopped | ✓ | OK |
| **find-duplicate-files** | **✗ MISSING** | Add to next.config.ts |

All 6 tool redirects present. ✓

---

## Appendix: File Reference Map

| Issue | File | Line approx |
|---|---|---|
| Homepage metadata | `src/app/page.tsx` | 12-16 |
| Snippet og:type missing | `src/app/snippets/[slug]/page.tsx` | ~126 |
| SoftwareApplication schema | `src/app/tools/[slug]/page.tsx` | ~34 |
| Sitemap missing pages | `src/app/sitemap.ts` | 15-55 |
| Sitemap flat lastModified | `src/app/sitemap.ts` | 21 |
| Snippet count "16" | `src/app/snippets/page.tsx` | ~14, ~73 |
| Snippet count "16" | `src/app/about/page.tsx` | ~34 |
| find-duplicate-files redirect | `next.config.ts` | ~after line 75 |
| llms.txt find-duplicate-files | `public/llms.txt` | All Snippet Pages section |
| HeroCanvasLoader dead code | `src/components/HeroCanvasLoader.tsx` | entire file |
| robots host property | `src/app/robots.ts` | line 7 |
