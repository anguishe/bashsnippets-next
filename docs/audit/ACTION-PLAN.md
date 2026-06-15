# BashSnippets.xyz — DPOS Action Plan
**Generated:** 2026-06-14 | **Full report:** [FULL-AUDIT-REPORT.md](./FULL-AUDIT-REPORT.md)

Re-sorted fix queue for the findings in the full report. Order respects the DPOS decision hierarchy: **Indexation/Crawlability → Conversion Tracking → Technical SEO → Content/AEO → Entity → Authority → Monetization → Perf/A11y → Infra.** Every fix is surgical (minimum viable change, no orthogonal refactors). IDs map back to the report.

**Reality check before you start:** the site is in good shape (78/100). There is **no Critical/deindexed/build-failing issue.** The wins here are about (a) un-blocking AI search, (b) killing the 6-vs-9 entity contradiction, (c) turning on revenue measurement, and (d) leveling up the older snippets' voice. Then **hold ~30 days** for re-index — do not churn mid-reindex.

---

## CRITICAL — Fix Immediately
_None. Build compiles clean, the indexable set is canonical and 200, no deindexation or security hole found._

---

## HIGH — Fix This Week

### H1 · Stop blocking AI crawlers (un-break the GEO strategy)
**File:** `src/app/robots.ts`
**Impact:** GPTBot (ChatGPT) and CCBot (Common Crawl → most LLM corpora) are currently `Disallow: /`. The project's stated goal is LLM citability; this directive guarantees the opposite. Removing it is the single highest-leverage GEO fix and costs nothing.
**Fix:** delete the GPTBot and CCBot disallow rules (keep Bytespider blocked only if you have a specific reason; it does not feed citable AI search).
```ts
// before
{ userAgent: 'GPTBot', disallow: '/' },
{ userAgent: 'Bytespider', disallow: '/' },
{ userAgent: 'CCBot', disallow: '/' },
// after — allow the engines you want to be cited in
{ userAgent: 'GPTBot', allow: '/' },
{ userAgent: 'CCBot', allow: '/' },
// (optionally keep) { userAgent: 'Bytespider', disallow: '/' },
```

### H2 · Make the tool count agree with itself (9, not 6)
**Files:** `src/app/page.tsx` (175, 264, 290), `src/app/snippets/page.tsx` (159, 213), `src/app/about/page.tsx` (12, 18, 26, 158)
**Impact:** "6 tools" vs the real 9 is an entity-confusion signal for Google and LLMs and undercuts the "9 interactive tools" already correct in `llms.txt` and the `/tools` grid. Derive from data so it never drifts again.
**Fix:** import the registry and interpolate its length; replace every literal.
```tsx
import { tools } from '@/lib/tools';
// "The six browser tools — …"        → `The ${tools.length} browser tools — …`
// "All six tools run entirely …"     → `All ${tools.length} tools run entirely …`
// "See all 6 tools →"                → `See all ${tools.length} tools →`
// snippets/page.tsx stat "6" + "6 browser-based bash tools" → {tools.length}
// about/page.tsx "6 interactive tools" + meta "6 browser tools" → ${tools.length}
```
(Snippet count already uses `snippets.length` — mirror that pattern.)

### H3 · Fix the doubled `/guides` title
**File:** `src/app/guides/page.tsx:29`
**Impact:** live `<title>` is `Bash Guides | BashSnippets.xyz | BashSnippets.xyz` — the template appends a second brand. Pollutes the SERP title and the AI title signal.
**Fix:**
```ts
// before
title: 'Bash Guides | BashSnippets.xyz',
// after (bypass the template once)
title: { absolute: 'Bash Guides | BashSnippets.xyz' },
```

### H4 · Add Quick Answer to the 5 snippets missing it
**File:** `src/lib/snippets.ts` (entries at 325–374: `bash-for-loop-examples`, `bash-functions`, `bash-arrays`, `bash-argument-parsing`, `bash-string-manipulation`)
**Impact:** these 5 render no Quick Answer block, violating CLAUDE.md SEO req #4 and removing the answer-first passage AI/Google extract. They are the only "thin-feeling" pages and a plausible AdSense-review nitpick.
**Fix:** add a 134–167-word `quickAnswer` to each registry entry (same field already present on the other 23), consequence-first, self-contained. Example skeleton for `bash-arrays`:
```ts
quickAnswer:
  'A bash array stores a list as separate elements instead of a space-joined string, so an element containing a space stays one item. Declare an indexed array with arr=(a b c) and read element i with "${arr[i]}"; always quote and use [@] — "${arr[@]}" expands to each element safely, while [*] joins them into one word. Append with arr+=(new), get length with ${#arr[@]}, and iterate with for x in "${arr[@]}"; do … done. Associative arrays need declare -A first, then map["key"]=value. The classic bug this prevents: building FILES="a.txt b c.txt" and looping over $FILES, which splits "b c.txt" into two. Works in bash 4.0+ (Ubuntu 22.04, Debian 12, Fedora 39, macOS via Homebrew bash).',
```
Repeat for the other four with command-specific copy (no shared boilerplate sentence).

### H5 · Wire real AdSense slot IDs (or switch to Auto ads)
**File:** `src/components/AdSlot.tsx:25` (+ call sites `page.tsx:229`, `snippets/[slug]/page.tsx:242,252,314`)
**Impact:** `data-ad-slot` is a placeholder string ("SLOT_ABOVE_CONTENT", "AUTO"), so no display ad serves and `adsbygoogle.push({})` can throw. Display-ad revenue is $0 by construction.
**Fix (option A — manual units):** create the ad units in AdSense, then pass the numeric IDs.
```tsx
// AdSlot stays as-is; replace placeholder strings at call sites with real numeric IDs:
<AdSlot slot="1234567890" />        // not slot="SLOT_ABOVE_CONTENT"
```
**Fix (option B — simpler):** drop manual `<ins>` units and enable AdSense **Auto ads** at the account level; remove `AdSlot` usages so you don't ship broken units during review.
> Also reduce snippet pages from 3 ad slots to ≤2 before re-applying to AdSense (density).

---

## MEDIUM — Fix Within a Month

### M1 · Point the footer "Guides" link at the index
**File:** `src/components/Footer.tsx:7`
**Fix:**
```ts
// before
{ href: '/guides/bash-scripts-every-sysadmin-needs', label: 'Guides' },
// after
{ href: '/guides', label: 'Guides' },
```

### M2 · Humanize the templated-batch snippets (voice)
**Files:** the 13 MDX in `src/content/snippets/` that open with `## The Script` (automated-file-backup, delete-old-log-files, check-if-website-is-up, monitor-cpu-ram-usage, file-permissions-security, mysql-database-backup, bash-send-email-alert, create-dated-folder, bash-error-handling, bash-if-else-examples, disk-space-warning, ssh-key-setup-script, find-duplicate-files)
**Impact:** they read as competent tutorials, not the brand's consequence-first, builder-to-builder voice. Prose is already unique and 950+ words — this is a *lead-in* fix, not a rewrite.
**Fix:** add a 2–4 sentence consequence-first intro **above** `## The Script`, opening mid-incident with a concrete number/timestamp and the human beat (mirror the new batch). E.g. for `mysql-database-backup`:
> *"The night a `DROP TABLE users;` ran against prod instead of staging, the only thing between me and a résumé update was a 2am cron dump. There's no undo on a dropped table — this is the script that has saved me twice."* Then `## The Script`.
Do not restructure the body; just add the intro and (optionally) rename `## The Script` to a question H2.

### M3 · Cross-link snippets → tools and → guides
**Files:** snippet MDX bodies + `src/app/snippets/[slug]/page.tsx` (template)
**Impact:** snippet→snippet linking is strong, but snippet→tool is 1/28 and snippet→guide is 0/28. Closing the loop spreads PageRank and improves topical clustering.
**Fix:** add a contextual tool link in the bodies where natural (e.g. cron snippets → `/tools/cron-job-builder`, chmod → `/tools/chmod-permissions-builder`, grep → `/tools/grep-pattern-builder`). Optionally add a small "Matching tool" block to the snippet template keyed off tags.

### M4 · Reconcile the toolkit funnel (one canonical path)
**Files:** `src/components/ToolkitCTA.tsx:5,23`, `src/app/starter-kit/page.tsx:7,291`
**Impact:** CTAs split between Gumroad-direct and `/starter-kit`; you can't measure the sales page. Gumroad URL is live (200), so the TODO is stale.
**Fix:** point `ToolkitCTA` at `/starter-kit` (internal sales page) and keep the single outbound Gumroad link on `/starter-kit`; delete the stale `{/* TODO: wire Gumroad … */}` comment. Then add the click event in C-tracking (see M5).

### M5 · Add conversion events (affiliate_click = Key Event, tool_use, toolkit_click)
**Files:** `src/components/AffiliateBox.tsx`, `src/components/ToolkitCTA.tsx`, tool components
**Impact:** the revenue actions are untracked; per DPOS you should run no paid traffic until a Key Event fires. Mark `affiliate_click` as a Key Event in GA4 once live.
**Fix:** add a guarded `gtag('event', …)` on click (respects existing Consent Mode).
```tsx
onClick={() => window.gtag?.('event', 'affiliate_click', { partner })}
// ToolkitCTA: 'toolkit_click'; tool pages: 'tool_use' with { tool: slug }
```

### M6 · Align Person/Organization `sameAs` with reality
**Files:** `src/app/about/page.tsx:45–49`, `src/app/layout.tsx:105–109`
**Impact:** schema claims TikTok (not shown on page) and omits GitHub (shown). Mismatched entity signals.
**Fix:** if TikTok is inactive, remove it from both `sameAs` arrays; add the GitHub profile (`github.com/anguishe/...`) that the About page already links. Keep visible links and `sameAs` identical.

### M7 · Correct the stale "iframe" self-description
**File:** `src/app/about/page.tsx:179–180` (and the matching CLAUDE.md line)
**Fix:** reword to reflect that tools are React components rendered via `ToolRenderer` (3 still embed standalone HTML via `ToolEmbed`). One sentence; factual accuracy on the E-E-A-T page.

### M8 · Add a custom 404 with a CTA
**File:** create `src/app/not-found.tsx`
**Impact:** the default `_not-found` renders within the layout (nav/footer present) but offers no path back into content.
**Fix:** small page with the H1 "Page not found", a one-liner, and links to `/snippets`, `/tools`, and the strongest guide.

---

## LOW — Backlog

### L1 · Make the sitemap generator import from `src/lib` (kill drift)
**File:** `scripts/generate-sitemap.mjs:25–68` — replace the hand-synced inline arrays with a read of the real registries (or generate via `app/sitemap.ts`). Prevents future indexation gaps when a snippet/tool is added but not mirrored here.

### L2 · Remove dead code & orphaned files
- Delete `src/lib/hub-membership.ts` (0 usages) — or wire it into snippet pages as "Part of these collections."
- Remove the 6 orphaned `public/tool-content/*.html` (the React-native tools): `bash-boilerplate-generator`, `bash-exit-code-lookup`, `chmod-permissions-builder`, `cron-job-builder`, `path-debugger`, `shellcheck-error-decoder`. **Keep** `rsync-command-builder`, `bash-trap-builder`, `grep-pattern-builder` (still used by `ToolEmbed`).

### L3 · Add `bash-trap-builder` relatedSnippets
**File:** `src/lib/tools.ts:350–394` — add `relatedSnippets: ['bash-error-handling']` (and a cleanup-related one) so the page renders the Related Snippets section like every other tool.

### L4 · Trim remaining banned words
**Files:** `src/app/snippets/backup-and-recovery/page.tsx:200`, `src/app/guides/bash-scripts-every-sysadmin-needs/page.tsx:383`, `src/content/snippets/search-files-for-text-grep.mdx:68` — replace the 3 contextual "easy" uses (on the project banned list).

### L5 · Add skip-to-content link + verify focus order
**File:** `src/app/layout.tsx:181–186` — add a visually-hidden "Skip to content" anchor before `<Nav/>`; confirm the FAQ terminal and `↑ Back to top` (`snippets/[slug]/page.tsx:320`) are keyboard-focusable/labelled.

### L6 · Add `HowTo` schema to tool pages
**File:** `src/app/tools/[slug]/page.tsx` — emit a `HowTo` from `tool.howToUse` (the visible ordered list) to match content to markup, as snippets already do.

### L7 · Add 1–2 authoritative outbound links on claim-heavy pages
Cite man pages / kernel docs / Let's Encrypt where strong technical claims are made (Ed25519 vs RSA, `ss` vs `netstat`, exit 137 = OOM) for DPOS-P3 citability.

### L8 · Consolidate audit artifacts & refresh CLAUDE.md
Remove/merge the stale root `ACTION-PLAN.md` + `FULL-AUDIT-REPORT.md` and `seo-audit/*` into `docs/audit/`. Fix CLAUDE.md's two stale facts (sitemap mechanism, tool architecture). Add `OWNERSHIP.md`. Confirm Vercel is on a **Pro** (commercial-use-compliant) tier.

### L9 · Drop the Ahrefs analytics script (perf/spec)
**File:** `src/app/layout.tsx:162–166` — optional; removes a third-party origin to align with "GTM/GA only" and shave first-load.

---

## Estimated Impact by Priority

| Group | Effort | Impact |
|---|---|---|
| **H1–H5** | ~3–4 hrs | Un-blocks AI search; removes the entity-count trust defect; fixes SERP title; restores ad revenue path; closes the AEO gap on 5 pages. Highest ROI in the plan. |
| **M1–M8** | ~6–10 hrs | Voice consistency across all 28 snippets (AdSense + ranking confidence), conversion measurement turned on, funnel + entity `sameAs` cleaned, internal-link loop closed. |
| **L1–L9** | ~4–6 hrs | Eliminates drift risk + dead code, hardens a11y/citability, tidies repo/ownership, marginal perf. |

---

## Post-Fix Checklist
1. `npm run build` — exits 0, zero TS/lint errors (also regenerates `public/sitemap.xml`; confirm count unchanged unless you added content).
2. Confirm one canonical URL per resource still holds: spot-check `.html`, trailing-slash, www, http → all 301/308 to clean apex/https/no-slash (regression guard after redirect edits).
3. `sitemap.xml` = exactly the indexable set, all 200 + self-canonical; **submit to GSC + Bing**.
4. IndexNow ping (Yandex/Bing) for changed URLs; **Request Indexing** in GSC on the PROTECT list + the 5 newly-Quick-Answered snippets + `/guides`.
5. Rich Results Test + schema.org validator on one snippet, one tool, one guide, the home, the About; OG debugger on `/guides` (title fix) and home.
6. Verify `robots.txt` live now allows GPTBot/CCBot; verify GA4 receives `affiliate_click` (mark it a **Key Event**).
7. Regenerate `llms.txt` only if counts/pages changed (it is currently the most accurate surface — keep it that way).
8. **Hold changes ~30 days** for Google/Bing to re-index. Do not churn the site mid-reindex.
