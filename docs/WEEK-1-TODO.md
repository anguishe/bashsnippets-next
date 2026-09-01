# Week 1 TODO — the one commit that builds the revenue mechanism

Written 2026-08-31. Full reasoning: https://claude.ai/code/artifact/967f9355-3a8e-4d3b-9639-1e8828c3a11b

**Budget: ~5.5 hours. Do it as one commit.** Everything structural is front-loaded here on
purpose — if nothing else in the 13-week plan ever ships, the site is still permanently better.

> **Amended 2026-09-01.** The 2026-08-28 audit's claim that Bing had zero index was wrong — Bing
> shows 52 indexed pages, 737 impressions / 6 M and 111 Copilot citations. See
> `docs/INDEXING-AUDIT-2026-09-01.md`. Two consequences here: **§2 was promoted to first and is
> now done** (it was time-boxed by Bing's recrawl; nothing else was), and **§5 is done**. §1, §3
> and §4 are unchanged, except for two factual corrections to §1 marked below.

---

## Why this exists (the one-paragraph version)

`grep -rl "starter-kit" src/content/snippets/` returns **0 of 38**. `ToolkitCTA` is not in the
`mdxComponents` export list, so it cannot be placed in MDX at all — it lives on three hub pages
only. Meanwhile **14 of 38** snippet pages carry a DigitalOcean affiliate box. Every visitor
arriving mid-incident from a Copilot answer lands on a page that offers them a VPS and nothing
Travis made. Revenue near zero is not a demand failure and not a traffic failure — **the path
does not exist.** Everything else (price, citations, cross-posts) is a multiplier on zero.

---

## 1. Register ToolkitCTA and place it in the detail layouts — 2.0 h ⭐ KEYSTONE

**Do this one first. If you only do one thing, this is it.**

- [ ] Add `ToolkitCTA` to the export object in `src/components/MDXComponents.tsx:39-47`
      (verified 2026-09-01: still `pre, code, h1, h2, h3, AffiliateBox, Callout`). Optional if you
      take the layout route below — it only buys the ability to place the CTA mid-MDX later.
- [ ] Place it in `src/app/snippets/[slug]/page.tsx` detail layout — covers all 38 snippets in one edit
- [ ] ⚠️ **There is no guide layout.** Guides are 5 standalone `page.tsx` files under
      `src/app/guides/<slug>/` with content written as JSX — no `layout.tsx`, no `template.tsx`,
      no dynamic route (see CLAUDE.md → *Content: Guides*). Create
      **`src/app/guides/layout.tsx`**: one new file that wraps the `/guides` index and all 5
      guides. Five per-file insertions is the fallback, not the plan.
- [ ] ⚠️ **Tools were missed.** The 8/28 de-monetization also stripped `ToolkitCTA` from the tool
      template; `src/app/tools/[slug]/page.tsx` has no CTA today, and Bing sends real impressions
      to `shellcheck-error-decoder` (34), `bash-trap-builder` (10), `find-command-builder` (8),
      `bash-boilerplate-generator` (13), `chmod-permissions-builder` (11). One edit, 12 pages.
- [ ] Add a GA4 outbound-click event on the Gumroad link **and** on every CTA render

Do NOT insert it per-MDX-file. One layout edit covers everything and never drifts; 38 insertions
create 38 places to forget.

Current placement, verified 2026-09-01: `ToolkitCTA` renders on `/` (`page.tsx:450`),
`/tools` (`tools/page.tsx:125`) and `/snippets` (`snippets/page.tsx:230`) only — three hub pages,
zero detail pages.

**Verify:** `curl -s https://bashsnippets.xyz/snippets/bash-trap-cleanup | grep -c starter-kit`
returns > 0, and the same for a guide URL.

---

## 2. Reverse all 12 noindex flags — 1.0 h ✅ DONE 2026-09-01

- [x] Delete all 12 `noindex: true` flags in `src/lib/snippets.ts` — count is now 0. The optional
      `noindex?: boolean` field and the sitemap generator's support for it were kept as a lever.
- [x] `npm run build` — passes, `public/sitemap.xml` back to **61 entries** (38 snippets, 12 tools).
      `npm run lint` clean.
- [x] Add the 12 restored URLs back to `public/llms.txt` — done, and while in there: removed 5
      duplicate snippet entries left by the 8/31 rebuild, and corrected the two "26 snippets"
      counts to 38. File now lists 38 unique snippets, no dupes.
- [ ] **Deploy, then IndexNow-ping the 12 URLs** (`npm run indexnow -- <urls>`) — not yet done,
      and this is the half that matters. Bing is the engine that reads it.
- [ ] Bing WMT → URL Submission for the six with measured signal: `create-dated-folder`,
      `bash-for-loop-examples`, `quick-system-info-report`, `kill-a-process`,
      `bash-read-file-line-by-line`, `bash-functions-arguments`.

The 12 slugs: `quick-system-info-report`, `search-files-for-text-grep`, `bash-if-else-examples`,
`create-dated-folder`, `kill-a-process`, `bash-for-loop-examples`, `bash-read-file-line-by-line`,
`bash-functions-arguments`, `bash-functions`, `bash-arrays`, `bash-argument-parsing`,
`bash-string-manipulation`.

**Why all 12, not just the 2 provably cited:** confirmed and quantified on 2026-09-01. Six of the
twelve carry live signal — 59 Bing impressions, 12 Copilot citations, 4 GA4 sessions, 0 clicks,
0 Google impressions between them. Copilot's grounding report is *sampled*, so visible citations
are a floor, not a census. Google-side cost of reversing is provably zero: Google has never served
a single content page, ever. The Aug 28 prune applied Google's editorial logic to a Bing index.

Timing was the real argument, and it held: Bing had **not yet recrawled** any of the 12 when the
revert shipped — Site Explorer's "URLs with NOINDEX tag" filter returned *No data available*, and
URL Inspection still reported *Indexed successfully* for `create-dated-folder` and
`bash-for-loop-examples` on 2026-09-01, four days after the noindex went live.

---

## 3. Reprice $9 → $29 single, add $79 five-seat team — 1.5 h

⚠️ **The price is hardcoded in 11 places, not 4.** All 11 re-verified at these exact lines on
2026-09-01 — the table is correct as written. (`grep '\$9'` also hits
`src/content/guides/bash-text-processing.mdx:62`; that is an awk `$9` field reference, not a price.)
Full list:

| File | Line | What |
|---|---|---|
| `src/app/starter-kit/page.tsx` | 13 | meta description |
| `src/app/starter-kit/page.tsx` | 20 | schema description |
| `src/app/starter-kit/page.tsx` | 36 | schema description (dupe) |
| `src/app/starter-kit/page.tsx` | 64 | FAQ answer ("One-time $9 purchase") |
| `src/app/starter-kit/page.tsx` | 83 | **Offer schema `price: '9.00'`** |
| `src/app/starter-kit/page.tsx` | 139 | visible body copy |
| `src/app/starter-kit/page.tsx` | 345 | CTA button text |
| `src/components/Footer.tsx` | 8 | nav label |
| `src/app/page.tsx` | 313 | New & Popular link title |
| `src/components/ToolkitCTA.tsx` | 13 | "PAID RESOURCE — $9" badge |
| `public/llms.txt` | — | "Paid resource ($9, one-time)" |

- [ ] All 11 above → $29
- [ ] Update the Gumroad listing itself (`https://anguish0.gumroad.com/l/toolkit`, const at `starter-kit/page.tsx:8`)
- [ ] Add the $79 five-seat team tier (identical files, one different licence line, zero production cost)

Reverses in 30 minutes if it's wrong. There is no conversion history at $9 to reprice *from* —
this is a judgment call, not arithmetic, and the downside at current volume is zero.

---

## 4. Delete the dead ad stack — 0.5 h

- [ ] Delete `src/components/AdSlot.tsx`
- [ ] Remove 4 call sites: `src/app/page.tsx:1` (import) + `:282`; `src/app/snippets/[slug]/page.tsx:1` (import) + `:233`, `:243`, `:300`
- [ ] Delete `public/ads.txt`
- [ ] Rewrite the goal line in `CLAUDE.md` — "Traffic goal: Mediavine Journey qualification (10k sessions/mo)" → a product-revenue target

The AdSense loader was already removed from `layout.tsx`, so these units would render empty 90px
boxes if `NEXT_PUBLIC_ADS_ENABLED` were ever flipped. Ads top out around $4–8/month for this
audience even under the most generous assumptions, and AdSense isn't approved.

**Delete because it's dead code, not because it will move the classifier. Expect no indexing effect.**

All five call sites re-verified at the stated lines on 2026-09-01, `public/ads.txt` still present,
and `layout.tsx` confirmed free of the AdSense loader.

---

## 5. Pull GA4 — 0.5 h ✅ DONE 2026-09-01

- [x] GA4 property `G-6B01TGE8XS` (property id 535459693), Jun 1 – Sep 1 2026:

| | |
|---|---|
| Sessions | **116** |
| Channels | Direct 89 (76.7 %) · Organic Social 12 · Referral 11 · **Organic Search 3** · AI Assistant 1 |
| Top landing pages | `/` 81 · `(not set)` 12 · `/tools` 6 · **`/snippets/quick-system-info-report` 4** · `/snippets` 2 · `/snippets/bash-error-handling` 2 · `/tools/cron-job-builder` 2 · `/tools/shellcheck-error-decoder` 2 |

Treat it as a **floor** — a Linux/sysadmin audience blocks analytics heavily. Also note there is
**no internal-traffic filter configured**, so an unknown share of those 89 Direct sessions is
Travis and Vercel preview traffic. Plan against the ~27 non-Direct sessions, not the 116.

Worth adding: a GA4 internal-traffic filter (Admin → Data Streams → Configure tag settings →
Define internal traffic), otherwise every future read of this number is inflated by an unknown
amount.

---

## Before you start

Uncommitted work is sitting in the tree from the 2026-08-31 session (build + lint clean):

- `public/llms.txt` — rebuilt from the live sitemap
- `src/lib/author.ts`, 5 guide `page.tsx`, `src/app/snippets/[slug]/page.tsx`, `src/lib/snippets.ts`
  — author schema drift fix (guides had no `sameAs`; `author.ts` was imported by nothing)
- `docs/CROSS-POST-BACKLOG.md` — stale pre-flight section corrected
- `docs/cross-posts/` — 10 drafted articles (untracked)

Added 2026-09-01 by the revert: `src/lib/snippets.ts` (12 flags removed), `public/sitemap.xml`
(49 → 61), `public/llms.txt` (12 restored, 5 dupes removed, counts fixed),
`docs/INDEXING-AUDIT-2026-09-01.md` (new).

Commit or review these first so the week-1 diff stays readable.

## Explicitly NOT in week 1

Cross-posting (the 20 queued + 10 drafts are **shelved**, not deleted — posting them deepens the
manufactured-link pattern the site was flagged for), any Google/GSC work beyond 2h hygiene, the
MCP server, the second product, a fifth audit.

Two amendments, 2026-09-01:

- **Cross-posting stays shelved, but the reasoning is now weaker than it reads.** The link-profile
  facts are independently true (137 links, ~100 % self-posted UGC, ~100 % to `/`), but "the site was
  flagged for" it was inferred from the same zero-Bing misread. Revisit after 3–4 more weeks of
  Bing data rather than treating it as settled.
- **The 8/28 audit's fallback — "301 the site to a non-.xyz domain if nothing moves in 6–8 weeks" —
  is struck.** Something is moving. A migration would discard 52 indexed pages and 111 Copilot
  citations to reset a TLD prior that was never demonstrated to be the problem.

## Needs Travis personally

`anguisheh1@gmail.com` is published in the `/about` `Person` schema and visible on `/about`,
`/contact`, `/terms`, `/privacy`. Swapping it for a domain alias needs an address only you can create.
