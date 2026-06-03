# BashSnippets.xyz — Full SEO Audit Report
**Date:** 2026-06-03  
**Auditor:** Claude Code (seo-audit skill)  
**Pages crawled:** 28 (complete sitemap coverage)  
**Business type:** Developer Content Publisher — Bash/Linux reference site

---

## Overall SEO Health Score: **62 / 100**

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Technical SEO | 78/100 | 22% | 17.2 |
| Content Quality | 58/100 | 23% | 13.3 |
| On-Page SEO | 61/100 | 20% | 12.2 |
| Schema / Structured Data | 65/100 | 10% | 6.5 |
| Performance (CWV) | 82/100 | 10% | 8.2 |
| AI Search Readiness | 52/100 | 10% | 5.2 |
| Images | 40/100 | 5% | 2.0 |
| **TOTAL** | | **100%** | **64.6 → 62** |

> Score damped by 3 points for the ghost URL in llms.txt (active 404 cited to AI crawlers) and severe thin content on all tool pages.

---

## Executive Summary

BashSnippets.xyz has a **solid technical foundation** — HTTP/2, HSTS, Vercel CDN, clean redirects, proper sitemap, and good schema coverage on snippet pages. Response times are excellent (140–260ms TTFB from CDN edge).

The site's biggest SEO liabilities are concentrated in two areas:

1. **Tool pages are content shells** — ~100 words each, no FAQPage schema, no H2 headings, and no descriptive text beyond a one-liner and an iframe. Google sees thin pages that can't rank organically.
2. **16 of 16 snippet meta descriptions are under 100 characters** — well below the ~150-char target, leaving significant keyword real estate on the table in SERPs.

Fix the tool page content and meta descriptions and the score moves to ~78.

### Top 5 Critical Issues
1. All 6 tool pages are thin content (~100 words) with no FAQ schema — high risk of not ranking
2. Ghost URL (`/snippets/find-duplicate-files`) in llms.txt returns 404 — misleads AI crawlers
3. Homepage canonical (`https://bashsnippets.xyz`) missing trailing slash vs sitemap (`https://bashsnippets.xyz/`) — canonicalization inconsistency
4. No Content-Security-Policy header — missing a key security signal
5. OG image (346KB PNG) is unoptimized — should be WebP/AVIF under 100KB

### Top 5 Quick Wins
1. Fix llms.txt ghost URL — 10 minutes, immediate AI citation improvement
2. Expand meta descriptions to 140-155 chars on all 16 short snippet pages
3. Add trailing slash to homepage canonical in `page.tsx`
4. Add FAQPage schema + 3-4 FAQ questions to all 6 tool page routes
5. Convert og-image.png to WebP and compress to <100KB

---

## Technical SEO — Score: 78/100

### Crawlability ✓
- `robots.txt`: clean — `Allow: /` for all user-agents, sitemap URL declared
- All 28 sitemap pages return HTTP 200
- 404 properly returns 404 (correct error handling)
- No redirect chains detected

### Redirects ✓
- `http://` → `https://` via 308 permanent ✓
- `www.` → non-www via 308 permanent ✓
- Legacy `.html` URLs redirected to clean paths (all 22 redirects in `next.config.ts`) ✓

### Canonical Tags ⚠
- All pages have canonical tags ✓
- **Issue:** Homepage canonical is `https://bashsnippets.xyz` (no trailing slash), but sitemap lists `https://bashsnippets.xyz/` (with trailing slash). Google may treat these as distinct URLs. Set canonical to match sitemap exactly.

### Security Headers ⚠
| Header | Status |
|---|---|
| `Strict-Transport-Security` | ✓ `max-age=63072000` (2yr) |
| `Content-Type` | ✓ `text/html; charset=utf-8` |
| `Content-Security-Policy` | ✗ Missing |
| `X-Frame-Options` | ✗ Missing |
| `X-Content-Type-Options` | ✗ Missing |
| `Permissions-Policy` | ✗ Missing |

> Vercel sets HSTS automatically. The remaining headers require `headers()` in `next.config.ts`. CSP is complex with AdSense — use report-only mode first.

### Sitemap Quality ✓
- XML sitemap present and linked in robots.txt ✓
- 28 URLs — all real pages, no duplicates ✓
- All lastmod dates set (uniform `2026-05-22`) ✓
- `changefreq` and `priority` set appropriately ✓
- **Minor:** Lastmod dates are all identical regardless of actual modification date

### Core Web Vitals (Network estimate)
- TTFB: **140–260ms** — Excellent (CDN HIT on Vercel edge, IAD region)
- HTML payload: **62.5KB** — Acceptable (Next.js pre-rendered)
- No LCP image to optimize (canvas/CSS hero, no hero img tag)
- 34 script tags on homepage (27 non-async) — JavaScript bundle load is the main CWV risk
- 3 font preloads set ✓ (IBM Plex Mono, Syne)
- GA4 GTM preloaded ✓ but adds ~50ms to FID/INP

---

## Content Quality — Score: 58/100

### Snippet Pages (16 pages)

| Slug | Words | H2s | Code blocks | Quality |
|---|---|---|---|---|
| disk-space-warning | 1,099 | 7 | 15 | ✓ Good |
| bash-send-email-alert | 1,056 | 8 | 10 | ✓ Good |
| search-files-for-text-grep | 1,058 | 7 | 11 | ✓ Good |
| kill-a-process | 1,047 | 8 | 9 | ✓ Good |
| monitor-cpu-ram-usage | 1,046 | 6 | 4 | ✓ Good |
| delete-old-log-files | 1,011 | 7 | 9 | ✓ Good |
| bash-error-handling | 938 | 7 | 7 | ✓ Good |
| quick-system-info-report | 909 | 6 | 10 | ✓ Good |
| restart-service-if-stopped | 876 | 5 | 3 | ✓ Acceptable |
| check-if-website-is-up | 875 | 6 | 9 | ✓ Good |
| mysql-database-backup | 776 | 6 | 6 | ✓ Acceptable |
| ssh-key-setup-script | 748 | 4 | 2 | ⚠ Needs more code |
| bash-if-else-examples | 630 | 4 | 9 | ⚠ Thin prose |
| create-dated-folder | 650 | 6 | 6 | ⚠ Acceptable |
| file-permissions-security | 597 | 7 | 7 | ⚠ Thin (~600w) |
| automated-file-backup | 538 | 4 | 9 | ✗ Too thin |

**5 snippets are below 700 words** — the minimum threshold for a standalone page to establish topical authority. Google's quality raters will flag these. Target: 800+ words minimum.

### Tool Pages (6 pages) — CRITICAL
All 6 tool pages render ~100 words of visible text content (title + one-line description + iframe). This is extremely thin:
- No how-to text around the tool
- No usage examples
- No FAQs
- No H2/H3 structure
- Functionally invisible to Google for organic ranking

The tool pages will not rank for "cron job builder", "chmod calculator", etc. against established competitors without at minimum 400-600 words of supporting text content per page.

### E-E-A-T Assessment
- **Experience:** Moderate — author is named (Anguishe), claims personal testing on Ubuntu 22.04/macOS Ventura ✓
- **Expertise:** Moderate — code quality is good, `set -euo pipefail` standard is correct ✓
- **Authoritativeness:** Weak — no About page author bio beyond a brief mention, no credentials, no external citations
- **Trustworthiness:** Moderate — privacy policy present, ads.txt correct, contact page present ✓

---

## On-Page SEO — Score: 61/100

### Title Tags

| Issue | Count | Affected Pages |
|---|---|---|
| Too long (>60 chars) | 1 | `bash-error-handling` (61 chars) |
| Too short (<30 chars) | 1 | `/contact` (26 chars) |
| Duplicate brand suffix `– BashSnippets.xyz` | 2 | `/snippets` and `/tools` index pages show `– BashSnippets.xyz – BashSnippets.xyz` |
| Good (30-60 chars) | 24 | — |

**Double brand suffix bug:** `/snippets` title is `"Bash Script Examples – BashSnippets.xyz – BashSnippets.xyz"` (58 chars rendered). The brand is appended twice. Same issue on `/tools`. Fix the `generateMetadata()` call on index pages — the title string already contains "– BashSnippets.xyz" and Next.js is appending it again.

### Meta Descriptions

**16 of 28 pages have descriptions under 100 characters** — the threshold where Google most often rewrites the snippet.

Short descriptions leave keyword density low and give Google reasons to pull alternate text from the page. Target 140-155 characters.

Pages with shortest descriptions (all need expansion):
- `/contact` — 50 chars: *"Contact BashSnippets by email, YouTube, or dev.to."*
- `/snippets/ssh-key-setup-script` — 73 chars
- `/snippets/kill-a-process` — 79 chars
- `/snippets/bash-send-email-alert` — 77 chars
- `/snippets/mysql-database-backup` — 77 chars

### Heading Structure ✓
- Every page has exactly one `<h1>` ✓
- H1 on snippet pages matches title (good keyword match) ✓
- **Issue:** Snippet pages have only **1 H2** visible (`"Related Snippets"`) — the MDX content headings (`##`) are rendered but the `<code>` blocks inside headings strip the heading structure. Verify H2s render correctly in production HTML — they appeared to be missing from the parsed HTML.

### Internal Linking ⚠
- Homepage links to 8 snippet pages and 3 tool pages (11 of 22 content pages)
- 5 snippet pages (`monitor-cpu-ram-usage`, `bash-send-email-alert`, `mysql-database-backup`, `ssh-key-setup-script`, `restart-service-if-stopped`) are **not linked from the homepage** — they only receive links from the `/snippets` index and related snippets widgets
- No cross-linking between tool pages
- No snippet-to-tool cross-links (e.g., disk-space-warning → cron-job-builder)

---

## Schema & Structured Data — Score: 65/100

### Current Implementation

| Page Type | Schema Present | Valid |
|---|---|---|
| Homepage | WebSite + Organization + FAQPage | ✓ (array format is valid) |
| Snippet pages | TechArticle + HowTo + FAQPage + BreadcrumbList | ✓ |
| Tool pages | WebApplication + Offer + BreadcrumbList | ⚠ Missing FAQPage |
| Index pages (`/snippets`, `/tools`) | CollectionPage + BreadcrumbList | ✓ |
| `/about`, `/privacy`, `/contact` | None | ✗ |

### Issues Found

**1. HowTo schema on snippet pages** — HowTo schema was removed from Google Rich Results in September 2023 and no longer generates rich snippets. The schema isn't harmful (it won't cause a penalty), but it adds ~2KB of markup per page with no benefit. Consider removing or replacing with a more actionable type.

**2. All 6 tool pages missing FAQPage schema** — The CLAUDE.md requirement says FAQ schema is mandatory on tool pages. None of the 6 tool pages have it. This is a gap versus snippet pages which all have it.

**3. Organization schema missing `contactPoint` and `foundingDate`** — Enriching Organization helps E-E-A-T signals for AI knowledge panels.

**4. SearchAction `query-input` uses deprecated string format:**
```json
"query-input": "required name=search_term_string"
```
The current recommended format uses an object:
```json
"query-input": {"@type": "PropertyValueSpecification", "valueRequired": true, "valueName": "search_term_string"}
```

**5. WebSite schema uses non-trailing-slash URL** — `"url": "https://bashsnippets.xyz"` should match canonical `https://bashsnippets.xyz/`.

---

## Performance (CWV) — Score: 82/100

*Note: Field data (CrUX) unavailable — no Google credentials. Scores based on network measurements and HTML analysis.*

| Metric | Estimate | Status |
|---|---|---|
| TTFB | 140–260ms | ✓ Excellent |
| HTML size | 62.5KB | ✓ Good |
| Font preloads | 3 WOFF2 | ✓ Set |
| JS scripts on page | 34 total | ⚠ High |
| Async/deferred scripts | 7 of 34 | ⚠ Low ratio |
| OG image size | 346KB PNG | ✗ Oversized |

### GA4 / Third-Party Script Impact
- GTM script is preloaded (`as=script`) — this is correct for performance
- AdSense (`adsbygoogle`) adds render-blocking if not carefully deferred
- 34 script tags is a Next.js artifact (code-split chunks) — acceptable but worth auditing `_next/static` budget

### OG Image ✗
`og-image.png` is **346KB** — this is not served on the page itself but it slows social preview card generation. Should be compressed to WebP under 100KB at 1200×630.

---

## Images — Score: 40/100

- **No `<img>` tags on any crawled page** — the site uses CSS/Three.js canvas for visuals, and code blocks for content
- No `next/image` usage detected for the OG image
- OG image: 346KB PNG — should be WebP <100KB
- Favicon set is complete (16×16, 32×32, 512×512, apple-touch-icon) ✓
- Score is low primarily because there is no rich visual content (screenshots, diagrams, annotated code) that would help image search and E-E-A-T

---

## AI Search Readiness (GEO) — Score: 52/100

### llms.txt Status ⚠

Present at `/llms.txt` — good. But has multiple issues:

| Issue | Impact |
|---|---|
| Ghost URL `/snippets/find-duplicate-files` — returns 404 | AI crawlers follow and get 404; may distrust the file |
| Duplicate entry for `bash-boilerplate-generator` (listed twice) | Minor — confuses parsers |
| `/tools/` listed (no trailing slash → redirects) | Minor |
| `/` and `/snippets` and `/tools` index pages not listed | Missing hub pages from AI context |
| `/tools/path-debugger` missing | Content gap |

**The 404 ghost URL is the most urgent fix.** AI systems that fetch llms.txt for citation context may conclude the file is inaccurate and deprioritize the domain.

### Structural Citability
- Snippet pages have well-structured `<h2>` and code blocks — good for passage-level AI citation
- FAQ answers are short and declarative — well-suited for AI overview answers ✓
- Quick Answer blocks present on snippet pages ✓
- Tool pages have no citable prose — AI cannot reference them for anything

### Brand Authority Signals
- YouTube channel referenced in Organization schema (`@BashSnippets`) ✓
- TikTok and dev.to sameAs present ✓
- No Wikipedia, GitHub, or Stack Overflow presence referenced
- No citation from external authoritative sources detected (no backlinks in Common Crawl for this domain yet — site is new)

### AI Crawler Access
- No blocking of GPTBot, ClaudeBot, or Googlebot-Extended in robots.txt ✓
- llms.txt correctly placed at root ✓
- No authentication or JS-gate blocking content ✓

---

## Backlinks — Data Limited

Common Crawl does not yet have index entries for `bashsnippets.xyz` in tested indexes (CC-MAIN-2025-30 through CC-MAIN-2026-21). This indicates:
- The domain is **new** (launched ~May 2026 per content dates)
- Zero measured referring domains — all organic visibility is driven by content quality alone
- No Google API credentials configured — cannot verify GSC impressions or indexed page count

**Recommendation:** Begin link acquisition. Even 5-10 contextual links from dev.to articles, GitHub README references, or Stack Overflow answers (where relevant) would materially move the authority needle for a new domain.

---

## Appendix: Page-Level Issue Summary

| Page | Issues |
|---|---|
| `/` | Canonical missing trailing slash; meta desc 98 chars (short); Homepage missing Organization schema |
| `/snippets` | Title has double brand suffix |
| `/tools` | Title has double brand suffix |
| `/snippets/automated-file-backup` | 538 words (thin); desc 96 chars |
| `/snippets/delete-old-log-files` | desc 91 chars |
| `/snippets/quick-system-info-report` | desc 86 chars |
| `/snippets/search-files-for-text-grep` | desc 91 chars |
| `/snippets/check-if-website-is-up` | desc 89 chars |
| `/snippets/bash-error-handling` | title 61 chars (1 over limit) |
| `/snippets/bash-if-else-examples` | desc 95 chars; 630 words (borderline thin) |
| `/snippets/create-dated-folder` | desc 82 chars; 650 words |
| `/snippets/kill-a-process` | desc 79 chars |
| `/snippets/file-permissions-security` | desc 80 chars; 597 words (thin) |
| `/snippets/monitor-cpu-ram-usage` | desc 80 chars |
| `/snippets/bash-send-email-alert` | desc 77 chars |
| `/snippets/mysql-database-backup` | desc 77 chars |
| `/snippets/ssh-key-setup-script` | desc 73 chars; 748 words; only 2 code blocks |
| `/snippets/restart-service-if-stopped` | desc 83 chars; only 3 code blocks |
| `/tools/bash-exit-code-lookup` | ~107 words; no FAQ schema |
| `/tools/cron-job-builder` | ~98 words; no FAQ schema; desc 95 chars |
| `/tools/chmod-permissions-builder` | ~100 words; no FAQ schema; desc 98 chars |
| `/tools/path-debugger` | ~99 words; no FAQ schema; desc 96 chars; not in llms.txt |
| `/tools/bash-boilerplate-generator` | ~99 words; no FAQ schema |
| `/tools/shellcheck-error-decoder` | ~98 words; no FAQ schema |
| `/about` | No schema; desc 69 chars |
| `/contact` | Title 26 chars (short); desc 50 chars |
| `/privacy` | desc 73 chars |
