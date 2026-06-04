# BashSnippets.xyz — SEO Action Plan
**Generated:** 2026-06-03 | **Full report:** FULL-AUDIT-REPORT.md

---

## CRITICAL — Fix Immediately

_None found — site is indexable and not penalized._

---

## HIGH — Fix This Week

### H1 · Add full `generateMetadata()` to homepage
**File:** `src/app/page.tsx`  
**Impact:** Homepage title/description currently fall back to generic root layout values. This is the single most trafficked page.  
**Fix:** Add a proper `generateMetadata()` or `metadata` export with title, description, openGraph, and twitter fields targeting "bash script library" intent.

---

### H2 · Update snippet count from 16 → 17 across 5 locations
**Files:** `src/app/snippets/page.tsx`, `src/app/about/page.tsx`, `public/llms.txt`, hero stats in `src/app/page.tsx`  
**Impact:** Stale counts signal outdated content to crawlers and users; AIO systems may quote incorrect numbers.  
**Fix:** s/16/17/ in all copy strings. Decide on hero stat: use accurate "17" or drop the number entirely.

---

### H3 · Add `find-duplicate-files` to `llms.txt`
**File:** `public/llms.txt`  
**Impact:** AI crawlers (Claude.ai, ChatGPT, Perplexity) use llms.txt as a content map. Newest snippet is invisible.  
**Fix:** Add entry under "All Snippet Pages":
```
- [Find Duplicate Files in Linux](https://bashsnippets.xyz/snippets/find-duplicate-files) — md5sum + awk to find byte-for-byte duplicates across directories
```

---

### H4 · Add `/about`, `/privacy`, `/contact` to native sitemap
**File:** `src/app/sitemap.ts`  
**Impact:** Three pages not in sitemap = Google won't discover them via sitemap submission. These pages support E-E-A-T signals.  
**Fix:** Add to the returned array:
```ts
{ url: `${SITE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
{ url: `${SITE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
{ url: `${SITE_URL}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
```

---

### H5 · Add `og:type: 'article'` to snippet `generateMetadata()`
**File:** `src/app/snippets/[slug]/page.tsx` (~line 126)  
**Impact:** Facebook, LinkedIn, and Slack unfurls use `og:type article` to display article metadata (dates, author). Currently falls back to `type: 'website'`.  
**Fix:** Add to the `openGraph` object in `generateMetadata()`:
```ts
type: 'article',
publishedTime: snippet.datePublished,
modifiedTime: snippet.dateModified,
authors: [`${SITE_URL}/about`],
```

---

### H6 · Add `.html` redirect for `find-duplicate-files`
**File:** `next.config.ts`  
**Impact:** No legacy redirect for the newest snippet. All others have one.  
**Fix:** Add to the `redirects()` array:
```ts
{
  source: '/snippets/find-duplicate-files.html',
  destination: '/snippets/find-duplicate-files',
  permanent: true,
},
```

---

## MEDIUM — Fix Within a Month

### M1 · Change tool schema from `SoftwareApplication` → `WebApplication`
**File:** `src/app/tools/[slug]/page.tsx` (buildSchemas function, ~line 34)  
**Impact:** CLAUDE.md specifies `WebApplication` for browser tools. `SoftwareApplication` is technically valid but doesn't match the spec.  
**Fix:** `'@type': 'WebApplication'` and add `browserRequirements: 'HTML5, JavaScript'`.

---

### M2 · Use actual `dateModified` in sitemap `lastModified`
**File:** `src/app/sitemap.ts`  
**Impact:** All 28 URLs show the same build timestamp. Real dates help Google prioritize recrawl of changed content.  
**Fix:** For snippet URLs, use `new Date(snippet.dateModified)` from registry. For static pages, use a hardcoded recent date.

---

### M3 · Guard empty `HowTo` schema
**File:** `src/app/snippets/[slug]/page.tsx` (generateSnippetSchema function)  
**Impact:** Snippets with no `howToSteps` emit `{ "@type": "HowTo", "step": [] }` — invalid schema.  
**Fix:** Conditionally include howToSchema only when `snippet.howToSteps.length > 0`:
```ts
const schemas = [articleSchema, breadcrumb];
if (snippet.faq.length > 0) schemas.push(faqSchema);
if (snippet.howToSteps.length > 0) schemas.push(howToSchema);
return schemas.map(s => JSON.stringify(s));
```

---

### M4 · Migrate priority config from `next-sitemap.config.js` to `sitemap.ts`
**Files:** `src/app/sitemap.ts`, `next-sitemap.config.js`  
**Impact:** The live sitemap uses flat priorities (all 0.8). The backup config has better differentiation (tools at 0.9, snippets at 0.8).  
**Fix:** Apply the differentiated priorities from `next-sitemap.config.js` to `sitemap.ts`.

---

### M5 · Update `collectionPageSchema` description to use dynamic count
**File:** `src/app/snippets/page.tsx` (~line 23)  
**Impact:** Schema description hardcodes "16 copy-paste bash scripts". Will be stale with every new addition.  
**Fix:**
```ts
description: `${snippets.length} copy-paste bash scripts with plain-English explanations for Linux and macOS.`,
```

---

### M6 · Add internal links from tools to related snippets
**Files:** Tool component/page files  
**Impact:** Tools and snippets are semantically related but not cross-linked. Missed link equity and user journey.  
**Suggested links:**
- Cron Job Builder → disk-space-warning, automated-file-backup, restart-service-if-stopped
- Chmod Builder → file-permissions-security, ssh-key-setup-script
- Bash Boilerplate Generator → bash-error-handling
- Bash Exit Code Lookup → bash-error-handling, bash-if-else-examples

---

### M7 · Add all 6 tools to llms.txt Interactive Tools section
**File:** `public/llms.txt`  
**Impact:** AI crawlers only see 2 of 6 tools listed. 4 tools are referenced only in "Most important pages" section.  
**Fix:** Add the 4 missing tools (Exit Code Lookup, Cron Builder, Chmod Builder, Path Debugger, ShellCheck Decoder) to the Interactive Tools section.

---

## LOW — Backlog

### L1 · Remove dead HeroCanvasLoader component
**Files:** `src/components/HeroCanvasLoader.tsx`, `src/components/HeroCanvas.tsx`  
**Impact:** These components exist but are never imported in any page. Three.js (large library) included in dependency graph unnecessarily.  
**Check:** Confirm no page uses `<HeroCanvasLoader>` before deleting.

---

### L2 · Remove `host` from `robots.ts`
**File:** `src/app/robots.ts`  
**Fix:** Delete the `host: 'https://bashsnippets.xyz'` line — not a valid `MetadataRoute.Robots` property.

---

### L3 · Improve index page titles
**Files:** `src/app/snippets/page.tsx`, `src/app/tools/page.tsx`  
**Current:**
- "Bash Script Examples | BashSnippets.xyz"
- "Bash Tools | BashSnippets.xyz"

**Consider:**
- "Bash Script Library — 17 Copy-Paste Shell Scripts | BashSnippets.xyz"
- "Free Bash Tools — Cron Builder, Chmod Calculator & More | BashSnippets.xyz"

---

### L4 · Add namecheap AffiliateBox to tools index
**File:** `src/app/tools/page.tsx`  
**Fix:** Add `<AffiliateBox partner="namecheap" className="mt-4" />` after the DigitalOcean box.

---

### L5 · Audit TikTok sameAs signal
**File:** `src/app/page.tsx` (Organization schema)  
**Check:** Is `https://www.tiktok.com/@BashSnippets` an active, content-producing account? If not, remove from sameAs.

---

### L6 · Delete `public/og-image.png` (duplicate file)
Both `og-image.png` and `ogimage.png` exist in `public/`. Code uses `ogimage.png`. The other appears unused.

---

## Estimated Impact by Priority

| Group | Effort | Traffic Impact |
|---|---|---|
| H1–H6 (all HIGH) | ~2 hours total | +15-25% visibility for homepage, better OG previews, AI crawler coverage |
| M1–M7 (MEDIUM) | ~3 hours total | Improved crawl budget efficiency, richer schema, better internal PageRank flow |
| L1–L6 (LOW) | ~1 hour total | Marginal ranking improvement, cleaner codebase |

---

## Post-Fix Checklist

1. `npm run build` — verify no TypeScript errors
2. Submit `find-duplicate-files` to IndexNow (Yandex + Bing)
3. Verify sitemap at `/sitemap.xml` includes `/about`, `/privacy`, `/contact`
4. Test OG tags with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) on a snippet page
5. Validate schema at [schema.org/validator](https://validator.schema.org/) for homepage and one snippet page
6. Check Google Search Console URL Inspection for `find-duplicate-files`
