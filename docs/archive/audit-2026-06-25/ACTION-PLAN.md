# BashSnippets — Technical SEO + Indexation Action Plan
**Generated:** 2026-06-25 | **Full report:** FULL-AUDIT-REPORT.md

Same findings, re-sorted by DPOS decision hierarchy (Indexation > Crawlability > Tracking > Technical SEO > Content > Entity > Authority), **not** by Ahrefs count. Each item is surgical. "Fix-at-source" = one change clears many symptoms.

---

## CRITICAL — Fix Immediately
*(none — no live-broken indexation blocker; the two-generations `.html` duplication is already resolved in the repo. The highest-leverage items are HIGH below.)*

---

## HIGH — Fix This Week

### H1 — Reference the logo-bearing Organization in every Article publisher
**Why:** Clears all 33 schema validation errors (one class). Restores Article rich-result eligibility and AI passage citability. (Schema/Entity)
**File(s):** src/app/snippets/[slug]/page.tsx (L46–50); same pattern in the 3 guide pages + 4 category pages.
**Fix (fix-at-source):**
```diff
- publisher: {
-   '@type': 'Organization',
-   name: 'BashSnippets.xyz',
-   url: SITE_URL,
- },
+ publisher: { '@id': 'https://bashsnippets.xyz/#organization' },
```
The `@id` resolves to the Organization in src/app/layout.tsx (L96–116), which already carries `logo`. Per-page; becomes one-change once H2 centralizes the builder.

### H2 — Create a single schema source (`src/config/site.ts` + `src/lib/schema.ts`)
**Why:** JSON-LD is hand-built in 11+ files; without a single source, H1 (and every future schema fix) must be repeated and will drift. (Schema/Entity — DPOS single-source rule)
**File(s):** new src/config/site.ts (apex URL, org name, logo, social), new src/lib/schema.ts (article/breadcrumb/faq/howto/webapp builders); refactor the 11 page files to import them.
**Fix:** Extract the existing inline objects verbatim into typed builder functions; pages call `buildArticleSchema(snippet)` etc. No output change except the H1 publisher reference. fix-at-source.

### H3 — Link the 4 category sub-hubs from the `/snippets` hub + expand homepage links
**Why:** Removes the structural near-orphan risk (8 single-inbound pages) by giving category pages a navigational inbound instead of relying on incidental body links; spreads homepage authority to all 6 sections. (Internal Linking / Crawlability)
**File(s):** src/app/snippets/page.tsx (add a "Browse by category" block), src/app/page.tsx (add `/guides` + `/starter-kit` body links).
**Fix:** Add a category nav block above the difficulty groups:
```tsx
{[
  ['server-monitoring','Server Monitoring'],
  ['backup-and-recovery','Backup & Recovery'],
  ['disk-management','Disk Management'],
  ['linux-security','Linux Security'],
].map(([slug,label]) => (
  <Link key={slug} href={`/snippets/${slug}`}>{label}</Link>
))}
```
Also add an in-content link to guide `bash-text-processing` from a relevant snippet (e.g. search-files-for-text-grep) so it isn't index-only. Per-page edits, but small and one-time.

---

## MEDIUM — Fix Within a Month

### M1 — Add og:url to privacy + terms (clear the 2 OG≠canonical mismatches)
**Why:** Conflicting canonical vs og:url signals. (Canonicalization)
**File(s):** src/app/privacy/page.tsx, src/app/terms/page.tsx.
**Fix:** Add to each `metadata`:
```ts
openGraph: { url: `${SITE_URL}/privacy` }, // and /terms respectively
```
(Or drop the redundant per-page `canonical` — but adding og:url is the lower-risk change.) fix-at-source per page; only 2 pages.

### M2 — Budget meta descriptions to ≤160 chars (49 long)
**Why:** SERP truncation cuts the consequence hook. (Content/Technical SEO)
**File(s):** src/app/snippets/[slug]/page.tsx (L142) + src/app/tools/[slug]/page.tsx (L126) — the clamp point; or add a `metaDescription` field to the registries.
**Fix (fix-at-source, choose one):**
- Add optional `metaDescription` (≤160) to SnippetMeta/ToolMeta; `generateMetadata` uses `metaDescription ?? description`. Keeps the long on-page voice, fixes the tag.
- Or clamp: `description: snippet.description.slice(0,157).trimEnd()+'…'` — faster, lossier.
Worst offenders to hand-write first: cron-wrapper-generator (325), bash-functions-arguments (308), bash-read-file-line-by-line (273).

### M3 — Trim titles to ≤60 incl. the template suffix (18 long)
**Why:** The `%s | BashSnippets.xyz` template adds 19 chars; SERP truncates the keyword tail. (Technical SEO)
**File(s):** src/app/layout.tsx (L31–34 template) + 5 intrinsically-long titles in src/lib/snippets.ts (L315–399).
**Fix:** Shorten the suffix (e.g. `'%s | BashSnippets'`, −4 chars) and trim the 5 long titles (e.g. drop "— Reclaim Disk Space from Docker Garbage"). The template change alone pulls most of the 18 back under 60. fix-at-source (template) + 5 per-entry trims.

---

## LOW — Backlog  *(IndexNow lives here — do LAST, full-URL, after the freeze)*

### L1 — Lengthen the 3 short descriptions
**File(s):** src/lib/snippets.ts L50 (disk-space-warning, 130), L292 (check-ssl-certificate-expiry, 148), L304 (list-open-ports-linux, 147). Extend each to 150–160 with a concrete detail.

### L2 — Confirm the live redirect chain (1) is platform-level, not code
**Action:** `curl -IL` the flagged URL. If `http→https→clean`, no code change — Vercel collapses the HTTP hop. Do not pre-emptively edit next.config.ts.

### L3 — IndexNow submission of the 9 URLs — DO LAST
**Action:** Only after the single clean post-fix push + deploy. Submit all changed URLs in one full-URL IndexNow batch (key file already at public/a7fae2a4…txt), then hold a 10-day edit freeze. Do not submit while schema/metadata defects are still live.

---

## Estimated Impact by Priority
| Group | Effort | Impact |
|---|---|---|
| HIGH (H1–H3) | ~½ day (H2 refactor is the bulk) | Clears 33 schema errors + fixes the crawl-depth/near-orphan structure — the two changes most likely to move "crawled, not indexed" |
| MEDIUM (M1–M3) | ~½ day | Clears 2 OG mismatches + the 67 length failures (49 desc + 18 title) at the source |
| LOW (L1–L3) | ~1 hour + post-deploy | Cosmetic length fixes + verification + the closing IndexNow push |

## Post-Fix Checklist
1. `npm run build` (runs `next build && node scripts/generate-sitemap.mjs`) — zero errors.
2. Rich Results Test + validator.schema.org on one rendered snippet page and one guide page — confirm Article `publisher.logo` now resolves and 0 errors.
3. OG debugger on `/privacy` and `/terms` — confirm og:url == canonical.
4. ONE complete push → Vercel deploy → full-URL IndexNow submit → 10-day edit freeze.
5. GSC: Request Indexing on the 4 category pages + the `bash-text-processing` guide; recrawl in Ahrefs to confirm the 33 schema + 49/18/3 metadata + 2 OG counts drop.
