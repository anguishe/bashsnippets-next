# BashSnippets.xyz — SEO Action Plan
**Generated:** 2026-06-03 | **Current Score:** 62/100 | **Target:** 78/100

---

## CRITICAL — Fix Immediately

### C1. Fix Ghost URL in llms.txt
**File:** `public/llms.txt`  
**Impact:** AI crawlers (GPTBot, ClaudeBot, Perplexity) fetch llms.txt for citation context. A 404 in the file signals the domain can't be trusted. Removes the site from AI overview candidacy for affected queries.  
**Fix:** Remove or replace the `/snippets/find-duplicate-files` entry. Either delete the line, or create the missing snippet.  
**Effort:** 5 minutes

### C2. Fix Double Brand Suffix in Title Tags
**Files:** `src/app/snippets/page.tsx`, `src/app/tools/page.tsx`  
**Current:** `"Bash Script Examples – BashSnippets.xyz – BashSnippets.xyz"`  
**Impact:** Google may truncate or rewrite titles with duplicate content. Looks unprofessional in SERPs.  
**Fix:** Remove `– BashSnippets.xyz` from the title string in `generateMetadata()` — Next.js appends the template suffix automatically if configured, or the string already contains the brand. Verify how `metadata.title` is set in the root `layout.tsx`.  
**Effort:** 15 minutes

### C3. Expand Tool Pages with Supporting Content
**Files:** `src/app/tools/[slug]/page.tsx` (or per-tool page.tsx if individual)  
**Impact:** All 6 tool pages have ~100 words — too thin to rank. Tools like "cron job builder" and "chmod calculator" are high-volume searches with strong commercial competition.  
**Fix:** Add below each iframe:
- H2: "How to use the [Tool Name]"  
- 3-4 usage steps (100-150 words)
- H2: "Frequently Asked Questions" with 3-4 FAQs  
- Add `FAQPage` JSON-LD schema  
Target: 400-600 words minimum per tool page.  
**Effort:** 2-3 hours (all 6 tools)

---

## HIGH — Fix Within 1 Week

### H1. Fix Homepage Canonical Trailing Slash
**File:** `src/app/page.tsx` in `generateMetadata()`  
**Current:** `canonical: 'https://bashsnippets.xyz'`  
**Fix:** Change to `'https://bashsnippets.xyz/'` to match sitemap  
**Effort:** 2 minutes

### H2. Expand Meta Descriptions on All Short Pages
**Priority order** (shortest first):

| Page | File | Current | Target |
|---|---|---|---|
| `/contact` | `src/app/contact/page.tsx` | 50 chars | 140+ |
| `/about` | `src/app/about/page.tsx` | 69 chars | 140+ |
| `/snippets/ssh-key-setup-script` | `src/content/snippets/ssh-key-setup-script.mdx` or registry | 73 chars | 140+ |
| `/snippets/mysql-database-backup` | registry in `src/lib/snippets.ts` | 77 chars | 140+ |
| `/snippets/bash-send-email-alert` | registry | 77 chars | 140+ |
| `/snippets/kill-a-process` | registry | 79 chars | 140+ |
| `/snippets/file-permissions-security` | registry | 80 chars | 140+ |
| `/snippets/monitor-cpu-ram-usage` | registry | 80 chars | 140+ |
| `/snippets/create-dated-folder` | registry | 82 chars | 140+ |
| `/snippets/restart-service-if-stopped` | registry | 83 chars | 140+ |
| `/snippets/check-if-website-is-up` | registry | 89 chars | 140+ |
| `/snippets/bash-if-else-examples` | registry | 95 chars | 140+ |
| `/tools/cron-job-builder` | `src/lib/tools.ts` | 95 chars | 140+ |
| `/tools/path-debugger` | `src/lib/tools.ts` | 96 chars | 140+ |
| `/tools/chmod-permissions-builder` | `src/lib/tools.ts` | 98 chars | 140+ |
| `/` | `src/app/page.tsx` | 98 chars | 140+ |

Meta descriptions live in `src/lib/snippets.ts` (for snippets) and `src/lib/tools.ts` (for tools) as the `description` field. Each needs to be expanded to 140-155 chars including relevant secondary keywords.  
**Effort:** 1-2 hours (16 descriptions)

### H3. Add FAQ Schema to All 6 Tool Pages
**File:** `src/app/tools/[slug]/page.tsx` (the `buildSchemas()` function)  
Add a `FAQPage` schema block with 3-4 questions per tool. This requires:
1. Adding a `faqs` field to the `ToolMeta` interface in `src/lib/tools.ts`
2. Adding FAQ arrays to each tool in the registry
3. Generating `FAQPage` schema in `buildSchemas()`
4. Rendering a visible FAQ section in the page JSX  
**Effort:** 2 hours

### H4. Fix llms.txt Content Gaps
**File:** `public/llms.txt`  
Beyond removing the ghost URL (C1), add missing entries:
- `/tools/path-debugger` (missing from tools list)
- Remove duplicate `bash-boilerplate-generator` entry
- Fix `/tools/` → `/tools` (remove trailing slash)
- Add hub page entries: `[Homepage](https://bashsnippets.xyz/)`, `[All Snippets](https://bashsnippets.xyz/snippets)`, `[All Tools](https://bashsnippets.xyz/tools)`  
**Effort:** 20 minutes

---

## MEDIUM — Fix Within 1 Month

### M1. Expand Thin Snippet Content
Pages under 700 words need expansion. Priority:

| Snippet | Words | Needed | Suggested additions |
|---|---|---|---|
| `automated-file-backup` | 538 | +262 | Add rsync variant, Windows WSL section, retention policy examples |
| `file-permissions-security` | 597 | +203 | Add ACL examples, sticky bit explanation, real-world incident example |
| `bash-if-else-examples` | 630 | +170 | Add nested if examples, case statement section |
| `create-dated-folder` | 650 | +150 | Add weekly/monthly folder patterns, cleanup automation |
| `ssh-key-setup-script` | 748 | +52 | Add more code examples (currently only 2 code blocks — lowest of any snippet) |

### M2. Add Security Headers via next.config.ts
Add the following headers to the `headers()` function:
```ts
{
  key: 'X-Content-Type-Options',
  value: 'nosniff',
},
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN',  // careful: tool iframes must still work
},
{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()',
},
```
> Note: CSP with AdSense is complex. Start with `Content-Security-Policy-Report-Only` to test before enforcing.  
**Effort:** 30 minutes

### M3. Fix SearchAction Schema Format
**File:** `src/app/page.tsx` (or wherever WebSite schema is generated)  
Update `query-input` from deprecated string format to object format:
```json
"query-input": {
  "@type": "PropertyValueSpecification",
  "valueRequired": true,
  "valueName": "search_term_string"
}
```
**Effort:** 10 minutes

### M4. Add Cross-Linking: Snippets ↔ Tools
High-value cross-links that don't currently exist:
- `disk-space-warning` → link to `cron-job-builder` ("schedule this with our Cron Job Builder")
- `automated-file-backup` → link to `cron-job-builder`
- `bash-error-handling` → link to `bash-boilerplate-generator`
- `file-permissions-security` → link to `chmod-permissions-builder`
- Any snippet using exit codes → link to `bash-exit-code-lookup`

Add these as inline text links within MDX content or as a "Related Tools" component.  
**Effort:** 1 hour

### M5. Link Homepage to All Snippet Pages
5 snippet pages are not linked from the homepage:
- `monitor-cpu-ram-usage`
- `bash-send-email-alert`  
- `mysql-database-backup`
- `ssh-key-setup-script`
- `restart-service-if-stopped`

Add these to the homepage snippet grid.  
**Effort:** 30 minutes

### M6. Optimize OG Image
**File:** `public/og-image.png` (346KB)  
Convert to WebP at 1200×630. Target: under 100KB.  
```bash
cwebp -q 80 public/og-image.png -o public/og-image.webp
```
Update all references to `og-image.png` → `og-image.webp` in metadata.  
**Effort:** 15 minutes

### M7. Fix /bash-error-handling Title Length
**File:** `src/lib/snippets.ts` (title field)  
Current: `"Bash Error Handling with set -euo pipefail – BashSnippets.xyz"` = 61 chars  
Suggestion: `"Bash Error Handling: set -euo pipefail – BashSnippets.xyz"` = 59 chars  
**Effort:** 2 minutes

### M8. Enrich About Page with Author Bio + Schema
**File:** `src/app/about/page.tsx`  
Add:
- Structured author bio (name, background, testing credentials)
- `Person` schema for the author
- `WebPage` schema with `author` property
This directly improves E-E-A-T signals that Google's quality raters assess.  
**Effort:** 1 hour

---

## LOW — Backlog

### L1. Remove or Replace HowTo Schema on Snippet Pages
HowTo rich results were retired by Google in September 2023. The schema adds ~2KB/page with no benefit. Remove from `generateSnippetSchema()` in `src/app/snippets/[slug]/page.tsx` or replace with a more useful type.

### L2. Add `foundingDate` and `contactPoint` to Organization Schema
Enriches knowledge panel signals. Add to homepage Organization schema.

### L3. Add `datePublished`/`dateModified` to llms.txt Entries
The llms.txt spec supports metadata fields. Adding dates helps AI crawlers determine freshness.

### L4. Add Per-Snippet OG Images
Currently all pages share the same `og-image.png`. Per-page OG images (e.g., showing the script title over a terminal) increase social CTR significantly. Consider using `@vercel/og` for dynamic generation.

### L5. Add Search Functionality
The OpenSearch XML and SearchAction schema reference `?q={searchTerms}` but the `/snippets?q=` URL doesn't appear to implement search filtering. Either implement client-side search or remove the SearchAction.

### L6. Begin Link Acquisition
For a new domain with zero backlinks, even 5-10 contextual links produce measurable DA improvement. Suggested channels:
- Write dev.to articles that reference BashSnippets pages
- Answer Stack Overflow/ServerFault questions with links to relevant snippets
- Submit to GitHub awesome-bash lists
- Reference tools in Reddit r/bash, r/sysadmin when relevant

---

## Estimated Score Impact

| Fix | Est. Score Gain |
|---|---|
| C1 (ghost URL) | +2 |
| C2 (double title) | +1 |
| C3 (tool page content + FAQ) | +6 |
| H1 (canonical slash) | +1 |
| H2 (meta descriptions) | +4 |
| H3 (tool FAQ schema) | +3 |
| H4 (llms.txt cleanup) | +2 |
| M1 (thin content expansion) | +3 |
| M2-M8 (medium priority) | +4 |
| **Total potential gain** | **+26 → score ~88** |
