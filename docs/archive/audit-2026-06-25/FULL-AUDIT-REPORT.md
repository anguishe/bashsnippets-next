# BashSnippets — Technical SEO + Indexation Audit Report
**Date:** 2026-06-25 | **Auditor:** Claude Code (Opus 4.8) | **Source:** Ahrefs Site Audit 25 Jun 2026 + repo read
**Scope:** ~32 snippet pages, ~11 tools, 4 guides, 4 snippet-category pages, 9 static routes (home, snippets, tools, guides, starter-kit, about, contact, privacy, terms) | **Health Score: 62/100** *(code-review-only — no live recrawl performed)*

## Executive Summary
Yes — these issues plausibly explain "Crawled – currently not indexed," but **not** for the reason assumed. The two-generations (`.html` vs clean URL) problem is **resolved in the current repo**: nothing generates `.html` (`pageExtensions: ['ts','tsx','mdx']`, no static export, no `.html` in `public/` except search-engine verification stubs), and all 41 legacy `.html` paths are single-hop `permanent: true` (301) redirects to clean URLs in [next.config.ts](next.config.ts#L28-L205). Internal links in MDX and components already point at clean URLs. So the Ahrefs 25 Jun crawl's redirect/HTTP cluster is largely **stale or external-origin**, not a live repo defect. The three things actually costing indexation today are: (1) every Article page emits schema Google rejects (missing `publisher.logo`), suppressing rich results and AI citability; (2) the `/snippets` hub never links its 4 category sub-hubs and the homepage links only 2 of 6 sections, starving crawl depth; (3) metadata is authored with no length budget, so titles+descriptions fail length checks site-wide.

**Root causes (collapsed from the 173 tracked issues):**
1. **Article schema built inline per-page with no `publisher.logo` and no single source** → explains: Structured data validation error (33).
2. **Metadata authored without a length budget; title template adds `" | BashSnippets.xyz"` (+19 chars)** → explains: Meta description too long (49), Title too long (18), Meta description too short (3).
3. **Hub/spoke internal linking is incomplete: `/snippets` index doesn't link the 4 category pages; homepage links only `/snippets` + `/tools`** → explains: Only one dofollow incoming internal link (8).
4. **Two static pages (privacy, terms) set `canonical` but omit a per-page `openGraph` block, so og:url inherits the layout's apex URL** → explains: Open Graph URL not matching canonical (2).
5. **Legacy `.html` generation retired, but external/cached links still resolve through 301s** → explains: Redirect chain (1), HTTP→HTTPS (2), 3XX redirect (3) — mostly stale-crawl residue; repo already fixes the in-code path.

**Top 5 critical/high issues:**
1. TechArticle/Article `publisher` missing required `logo` on every snippet/guide/category page (33 schema errors). HIGH.
2. `/snippets` hub does not link the 4 category sub-hubs; homepage links only 2 of 6 nav sections (near-orphans / crawl-depth). HIGH.
3. No single schema source — JSON-LD duplicated across 11+ page files (any fix must be made N times). HIGH (maintainability of the above).
4. Meta descriptions exceed 160 chars site-wide (40 in registries alone, 49 live). MEDIUM, fix-at-source.
5. Titles exceed 60 chars once the template suffix is applied (18). MEDIUM, fix-at-source.

**Top 5 quick wins (<30 min each):**
1. Add `openGraph` block (or remove redundant per-page `canonical` and let layout cover it) on privacy + terms → clears 2 OG mismatches.
2. Change inline `publisher` to `{ '@id': 'https://bashsnippets.xyz/#organization' }` in [snippets/[slug]/page.tsx](src/app/snippets/[slug]/page.tsx#L46-L50) → clears the 33-error class in one builder.
3. Add 4 category-page links to the `/snippets` index → removes the structural near-orphan risk on the sub-hubs.
4. Lengthen 3 short descriptions: `disk-space-warning` (130), `check-ssl-certificate-expiry` (148), `list-open-ports-linux` (147).
5. Add `/guides` + `/starter-kit` links to the homepage body.

## Scoring Breakdown
| Category | Score | Weight | Weighted |
|---|---|---|---|
| Indexation/Crawlability | 70 | 30% | 21.0 |
| Internal Linking | 55 | 20% | 11.0 |
| Metadata | 50 | 15% | 7.5 |
| Schema/Entity | 55 | 20% | 11.0 |
| Redirects/Canonicalization | 75 | 15% | 11.25 |
| **TOTAL** | | | **62/100** |
> Code-review-only score. No live crawl/Rich-Results run was performed; schema-validity findings are read from the JSON-LD builders, not a live validator.

---

## Issue 1 — Page has only one dofollow incoming internal link (8) — INDEXABLE
**FAIL (High).**
**Finding:** Global Nav ([Nav.tsx](src/components/Nav.tsx#L7-L14)) and Footer ([Footer.tsx](src/components/Footer.tsx#L3-L13)) link Home, Snippets, Tools, Guides, Toolkit, About, Contact, Privacy, Terms on every page — so those 9 are well-linked. The fragile pages are the ones **outside** nav/footer:
- The **4 category pages** (`/snippets/server-monitoring`, `/backup-and-recovery`, `/disk-management`, `/linux-security`) are **not linked from Nav, Footer, or the `/snippets` index** ([snippets/page.tsx](src/app/snippets/page.tsx#L184-L228) groups by difficulty, never by category). Their only inbound links are incidental in-MDX cross-links: `backup-and-recovery` has just 3 (all from snippet bodies), and a single MDX edit could drop one to near-orphan status.
- The **homepage** ([page.tsx](src/app/page.tsx)) links only `/snippets` and `/tools` in its body — not `/guides`, `/starter-kit`, or category hubs — so the top-authority page passes equity to 2 of 6 sections.
- Guide `bash-text-processing` receives **only** the `/guides` index link (no in-content inbound), versus siblings that get 3–5.
**Why it matters:** Indexation > Crawlability (hierarchy L1/L2). Sub-hubs reachable only through body prose get shallow, intermittent crawl equity — the classic "crawled, not indexed" profile for category pages.
**Tag:** [REPO CONFIRMS] the structural gap (hub→sub-hub link missing). [CANNOT TELL FROM REPO] the exact 8 URLs Ahrefs flagged — that is a live link-graph count and may include pages whose only inbound is a single body link at crawl time.
**Fix direction:** Add a "Browse by category" block on `/snippets` linking all 4 category pages; add `/guides` + `/starter-kit` to the homepage body; ensure each category page links back to `/snippets` and to 2+ sibling snippets.

## Issue 2 — Redirect chain (1)
**CONCERN (Medium).**
**Finding:** [next.config.ts](next.config.ts#L28-L205) defines 41 redirects, every one a **single-hop** `permanent: true` (301) from `*.html` → clean URL. No destination is itself a source — **no chain exists in code**. A chain on the live site is most plausibly platform/edge-level: an external `http://…​.html` link forced through `http→https` (hop 1) and then `.html→clean` (hop 2).
**Why it matters:** Crawlability — each hop wastes crawl budget on an indexation-starved site.
**Tag:** [CANNOT TELL FROM REPO] — the single chain is not reproducible from the Next config; needs a live `curl -IL` on the offending URL.
**Fix direction:** Identify the chained URL via live trace; if it is `http→https→clean`, it self-resolves once the HTTP hop is collapsed at the edge (Vercel forces HTTPS automatically). No code change likely required.

## Issue 3 — HTTP to HTTPS redirect (2)
**PASS (repo) / CONCERN (live).**
**Finding:** No internal link, canonical, sitemap entry, or schema URL uses `http://`. Sitemap ([scripts/generate-sitemap.mjs](scripts/generate-sitemap.mjs)) hardcodes `https://bashsnippets.xyz`; canonicals and OG URLs are all `https`. HSTS preload is set ([next.config.ts](next.config.ts#L20-L23)).
**Tag:** [REPO ALREADY FIXES] — the 2 are external inbound links or cached `http://` references hitting the standard HTTPS upgrade, not an in-code defect (stale crawl).
**Fix direction:** None in repo. Optionally request HSTS preload-list inclusion to push the upgrade browser-side.

## Issue 4 — 3XX redirect (3)
**PASS (repo) / INFO (live).**
**Finding:** The 41 `.html→clean` 301s are intentional, single-hop, and `permanent`. Internal links across `src/app` and `src/content` all target clean URLs (grep: zero internal `.html` page links; the only `.html` strings are external man-page citations and the Google verification file).
**Tag:** [REPO ALREADY FIXES] — the 3 flagged 3XX hits are external/old-sitemap references to `.html` URLs resolving correctly. Expected to fall off after recrawl.
**Fix direction:** None. Confirm no old sitemap variant is still submitted in GSC/Bing.

## Issue 5 — Meta description too long (49)
**FAIL (Medium) — fix at source, not 49 edits.**
**Finding:** Descriptions are authored 160–325 chars with no clamp. Measured from the registries: **40 of 44** descriptions exceed 160 chars ([snippets.ts](src/lib/snippets.ts), [tools.ts](src/lib/tools.ts)). Worst offenders: `bash-functions-arguments` (308), `cron-wrapper-generator` (325), `bash-read-file-line-by-line` (273), `bash-string-manipulation` (240). The remaining ~9 over-long come from guide/static descriptions. Root cause: the consequence-first content voice ("lead with what breaks") naturally produces 200+ char descriptions, and `generateMetadata` passes `snippet.description` straight through with no truncation ([snippets/[slug]/page.tsx](src/app/snippets/[slug]/page.tsx#L142), [tools/[slug]/page.tsx](src/app/tools/[slug]/page.tsx#L126)).
**Why it matters:** Technical SEO / Content. Google truncates the SERP snippet; the consequence hook is often cut mid-sentence.
**Tag:** [REPO CONFIRMS].
**Fix direction:** Either add a `metaDescription` field (≤160) separate from the long on-page `description`, or clamp in one place in `generateMetadata`. Single decision, applied at the registry/builder boundary.

## Issue 6 — Title too long (18)
**FAIL (Medium) — systematic (template suffix).**
**Finding:** The root layout title template is `'%s | BashSnippets.xyz'` ([layout.tsx](src/app/layout.tsx#L31-L34)) — `" | BashSnippets.xyz"` adds **19 chars** to every page title. Registry titles measure: 5 already exceed 60 chars before the suffix (e.g. `Docker Cleanup Bash Script — Reclaim Disk Space from Docker Garbage` = 67); but **40 of 45** titles sit at 30–50 chars, and a 42–50 char title becomes **61–69 chars** once the suffix is appended. That conversion is the systematic source of the 18 over-long titles.
**Why it matters:** Technical SEO — SERP title truncation; the brand suffix eats the keyword tail.
**Tag:** [REPO CONFIRMS].
**Fix direction:** Shorten the suffix (e.g. drop `.xyz`, or use a separator-only `%s` on long-titled pages via `title.absolute`), and trim the 5 intrinsically-long titles. The 5 longest titles all live in [snippets.ts](src/lib/snippets.ts#L315-L399).

## Issue 7 — Meta description too short (3)
**FAIL (Low) — exact match.**
**Finding:** Exactly 3 registry descriptions fall under 150 chars: `disk-space-warning` (130) [snippets.ts](src/lib/snippets.ts#L50-L51), `check-ssl-certificate-expiry` (148) [snippets.ts](src/lib/snippets.ts#L292-L293), `list-open-ports-linux` (147) [snippets.ts](src/lib/snippets.ts#L304-L305). This matches the Ahrefs count of 3 precisely.
**Tag:** [REPO CONFIRMS].
**Fix direction:** Extend each to 150–160 chars with a concrete detail (default threshold, the 30-day cert window, the `0.0.0.0` vs `127.0.0.1` distinction).

## Issue 8 — Open Graph URL not matching canonical (2)
**FAIL (Medium) — exact match, root cause identified.**
**Finding:** `privacy` and `terms` are the only two pages that set `alternates.canonical` but provide **no per-page `openGraph` block** (grep: `privacy/page canonical=1 openGraph=0`, `terms/page canonical=1 openGraph=0`). With no page-level og:url, Next falls back to the layout default `openGraph.url: 'https://bashsnippets.xyz'` ([layout.tsx](src/app/layout.tsx#L49)) — the apex. Result: canonical=`/privacy` but og:url=`/`. Every other page sets both together and matches.
**Why it matters:** Canonicalization — conflicting URL signals to crawlers and social/AI scrapers.
**Tag:** [REPO CONFIRMS].
**Fix direction:** Add an `openGraph: { url: '<canonical>' }` to both pages (or drop the redundant per-page canonical since the layout `metadataBase` + route already imply it). One-line fix each.

## Issue 9 — Structured data has schema.org validation error (33)
**FAIL (High) — one broken builder, not 33 bugs.**
**Finding:** Every `TechArticle`/Article block sets `publisher` as an inline `Organization` with `name` + `url` but **no `logo`** — Google's Article spec requires `publisher.logo` (an `ImageObject`). This pattern is duplicated across all snippet pages ([snippets/[slug]/page.tsx](src/app/snippets/[slug]/page.tsx#L46-L50)) and the guide/category pages (grep confirmed `TechArticle` + logo-less `publisher` in 11 page files, e.g. [guides/bash-text-processing/page.tsx](src/app/guides/bash-text-processing/page.tsx#L55-L58)). The snippet `[slug]` template alone renders ~32 pages, each emitting one defective Article block → ≈33, matching the Ahrefs count. The correct `Organization` (with `logo`) **does** exist, but only in the layout's separate Organization node ([layout.tsx](src/app/layout.tsx#L96-L116)); the Article publishers don't reference it. Compounding this: **there is no single schema source** (`src/lib/schema.ts` / `src/config/site.ts` are absent) — JSON-LD is hand-built in 11+ files, so the same fix must be repeated unless centralized.
**Affected @types:** `TechArticle` (primary). `WebApplication`, `BreadcrumbList`, `FAQPage`, `HowTo` blocks read as schema.org-valid.
**Why it matters:** Schema/Entity (hierarchy) — broken Article schema suppresses rich results **and** passage-level AI citability (Perplexity/ChatGPT/Claude), the stated reason FAQPage is retained.
**Tag:** [REPO CONFIRMS] the `publisher.logo` omission and the absence of a single source. [CANNOT TELL FROM REPO] that `publisher.logo` is the *exact* field Ahrefs counts vs. another Article-required field — confirm against validator.schema.org on one rendered page.
**Fix direction:** Replace each inline `publisher` with `{ '@id': 'https://bashsnippets.xyz/#organization' }` (referencing the logo-bearing Organization in the layout), then lift all JSON-LD builders into a single `src/lib/schema.ts` fed by a `src/config/site.ts` so the publisher/logo is defined once. Fix-at-source: one builder clears the whole class.

## Issue 10 — Pages to submit to IndexNow (9)
**NOTE / LOW — do last.**
**Finding:** The IndexNow key file exists at `public/a7fae2a4e86d4822ab3f636599173c8f.txt` (content matches the key in CLAUDE.md). There is **no deploy-time auto-ping hook** in the repo — submission is the manual `curl` documented in CLAUDE.md's post-deploy checklist.
**Tag:** [REPO CONFIRMS] key present, no automation.
**Fix direction:** Per DPOS doctrine, defer. Submit the 9 URLs **after** the single clean post-fix push, as one full-URL IndexNow batch, then freeze. Do **not** submit now (would re-ping pages that still carry the schema/metadata defects).

## Issue 11 — Meta description changed (2) / Title tag changed (1)
**INFO.** Ahrefs change-tracking notices, not defects. No action.

---

## Appendix: File Reference Map
| Issue | File | ~Line |
|---|---|---|
| 1 Near-orphans (hub gap) | src/app/snippets/page.tsx | 184–228 |
| 1 Homepage links only 2 sections | src/app/page.tsx | body |
| 1 Nav / Footer global links | src/components/Nav.tsx / Footer.tsx | 7–14 / 3–13 |
| 2/3/4 Redirects (41 × 301) | next.config.ts | 28–205 |
| 3 HTTPS-only sitemap | scripts/generate-sitemap.mjs | 4 |
| 5 Long descriptions (40/44) | src/lib/snippets.ts, src/lib/tools.ts | array entries |
| 5 Description passthrough | src/app/snippets/[slug]/page.tsx | 142 |
| 6 Title template (+19 chars) | src/app/layout.tsx | 31–34 |
| 6 5 intrinsically-long titles | src/lib/snippets.ts | 315–399 |
| 7 Short descriptions (3) | src/lib/snippets.ts | 50, 292, 304 |
| 8 OG≠canonical (no og block) | src/app/privacy/page.tsx, src/app/terms/page.tsx | metadata |
| 8 Layout default og:url=apex | src/app/layout.tsx | 49 |
| 9 Article publisher missing logo | src/app/snippets/[slug]/page.tsx | 46–50 |
| 9 Logo-bearing Organization | src/app/layout.tsx | 96–116 |
| 9 No central schema source | (absent) src/lib/schema.ts, src/config/site.ts | — |
| 10 IndexNow key file | public/a7fae2a4e86d4822ab3f636599173c8f.txt | — |
