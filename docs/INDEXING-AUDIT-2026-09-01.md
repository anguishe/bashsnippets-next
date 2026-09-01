# Indexing Audit — bashsnippets.xyz — 2026-09-01

**Purpose: correct the 2026-08-28 audit.** That audit's central factual claim about Bing was
wrong, and the P0 "prune" it prescribed was built on top of it. This document records what the
live consoles actually say today and what to do about it.

Verified in Chrome (Browser 4) signed in as `anguisheh1@gmail.com`:
Bing Webmaster Tools (`https://bashsnippets.xyz/`, the only bashsnippets property in the
Microsoft account, sibling: `beachhousemoving.xyz`), GSC `sc-domain:bashsnippets.xyz`
(authuser=0 — note authuser=1 on this profile is `travisofgilligans@gmail.com` and has **no**
access to the property), GA4 `BashSnippets / 535459693` (account 393326874).

---

## 1. The correction

The 2026-08-28 audit, §1, states:

> **Bing: `site:bashsnippets.xyz` → "There are no results."** Zero pages, homepage included,
> after ~3 months of IndexNow submissions (HTTP 200) and a verified Bing property.
> DuckDuckGo: 0. Two independent engines reached the same verdict.

That is false. Bing Webmaster Tools, read 2026-09-01:

| Bing metric | Value |
|---|---|
| Site Explorer — Indexed | **52** (Error 0, Warning 0, Excluded 14) |
| Search Performance, 6 M (May 26 – Aug 30) | **737 impressions, 14 clicks, 1.9 % CTR** |
| Distinct URLs with impressions | **40** |
| AI Performance (Copilot + partners), 6 M | **111 citations across 13 pages** |
| Sitemap | `sitemap.xml`, submitted 5/27, last crawl **8/29**, Success, 49 URLs |
| Backlinks | 137 |

A `site:` query on bing.com is not an index census — for a low-authority domain it routinely
returns nothing while the property reports thousands of impressions. The audit read a UI signal
that does not mean what it was taken to mean, then used "two independent engines agree" as the
load-bearing evidence for a site-wide quality-classifier diagnosis. One engine agreed. The other
was never asked.

**What survives the correction:** Google's side of §1 is accurate and re-verified below. The
link-profile facts (103 → 137 links, ~100 % self-posted UGC, ~100 % to `/`) are independently
true. Every technical finding in §2 of that audit still holds.

**What does not survive:** "both engines are choosing not to index" — the framing that justified
noindexing 12 pages and cutting the sitemap 61 → 49.

---

## 2. Current state, all three consoles

### Google (GSC, 2026-09-01)

| Bucket | Pages | Δ vs 8/28 |
|---|---|---|
| Indexed | **1** (homepage) | — |
| Crawled – currently not indexed | 71 | +7 |
| Discovered – currently not indexed | 26 | −7 |
| Page with redirect | 3 | — |
| Redirect error | 0 (Passed) | −1 ✅ |

Performance, 90 d: **1 click, 75 impressions**, average position 57.9, across exactly four URLs
— `/` (75 imp), `/about`, `/snippets`, `/tools` (5 imp each). **Zero impressions on any snippet,
tool or guide page.** Google has never served a content page.

### Bing

Top pages by impressions (6 M):

| URL | Imp | Clicks | Avg pos |
|---|---|---|---|
| /snippets/list-open-ports-linux | 154 | 0 | 7.60 |
| /snippets/bash-error-handling | 71 | 0 | 6.42 |
| / | 52 | 5 | 5.54 |
| /snippets/bash-flock-single-instance | 48 | 0 | 5.00 |
| /snippets/disk-space-warning**.html** | 42 | 0 | 5.76 |
| /guides/bash-scripting-for-ci-cd-pipelines | 37 | 1 | 5.30 |
| /tools/shellcheck-error-decoder**.html** | 28 | 0 | 6.21 |
| /snippets/check-ssl-certificate-expiry | 23 | 0 | 4.78 |

Copilot citations (6 M, 111 total): `/guides/bash-scripts-that-survive-cron` **43**,
`/guides/bash-scripting-for-ci-cd-pipelines` 10, `check-if-website-is-up.html` 8,
`automated-file-backup.html` 8, `monitor-cpu-ram-usage.html` 7, `/` 6, `bash-error-handling` 6,
`check-ssl-certificate-expiry` 5, **`create-dated-folder` 5**, **`bash-for-loop-examples` 4**,
`list-open-ports-linux` 4, **`kill-a-process.html` 3**, `bash-flock-single-instance` 2.

**Read the CTR correctly.** `list-open-ports-linux` has 154 impressions at position 7.6 and
**zero clicks**. These are largely LLM grounding fetches, not humans browsing. The citation
count is the meaningful number on this channel, not the impression count — and anything this
channel is meant to earn has to live in the prose a model carries away, not in a CTA a reader
never loads.

Citations are **accelerating**: ~0–2/day in June, 3-4-5-5-6-4-2 over Aug 24–30. One grounding
query — "cron jobs serverless timeouts retries gotchas" — accounts for 31 citations at a
13.08 % citation share.

### GA4 (Jun 1 – Sep 1, 116 sessions)

Channels: Direct 89 (76.7 %), Organic Social 12, Referral 11, **Organic Search 3**, AI Assistant 1.

Landing pages: `/` 81 · `(not set)` 12 · `/tools` 6 · **`/snippets/quick-system-info-report` 4**
· `/snippets` 2 · `/snippets/bash-error-handling` 2 · `/tools/cron-job-builder` 2 ·
`/tools/shellcheck-error-decoder` 2 · `/guides` 1 · `/snippets/disk-space-warning.html` 1 ·
`/snippets/list-open-ports-linux` 1 · `/tools/chmod-permissions-builder` 1 ·
`/yandex_da152cf439d92bd4.html` 1.

Week-1 item 5 is done by this document. The number to plan against is **116 sessions / 3 months**,
of which only ~27 are not Direct. No internal-traffic filter is configured, so an unknown share of
the 89 Direct sessions is Travis and Vercel preview traffic. Treat the non-Direct 27 as the real
floor.

---

## 3. What the 12 noindexed pages were actually earning

Deployed and live-verified today: all 12 return HTTP 200 with `<meta name="robots"
content="noindex, follow">`, and `sitemap.xml` is 49 entries with all 12 absent.

| Slug | Bing imp | Bing pos | Copilot cites | GA4 sessions | Google imp |
|---|---|---|---|---|---|
| create-dated-folder | 14 | 4.64 | 5 | 0 | 0 |
| kill-a-process (`.html` 10 + clean 4) | 14 | 6.7 / 7.0 | 3 | 0 | 0 |
| quick-system-info-report (`.html`) | 13 | 3.62 | 0 | **4** | 0 |
| bash-for-loop-examples | 12 | 3.50 | 4 | 0 | 0 |
| bash-read-file-line-by-line | 5 | 9.00 | 0 | 0 | 0 |
| bash-functions-arguments | 1 | 9.00 | 0 | 0 | 0 |
| search-files-for-text-grep | 0 | — | 0 | 0 | 0 |
| bash-if-else-examples | 0 | — | 0 | 0 | 0 |
| bash-functions | 0 | — | 0 | 0 | 0 |
| bash-arrays | 0 | — | 0 | 0 | 0 |
| bash-argument-parsing | 0 | — | 0 | 0 | 0 |
| bash-string-manipulation | 0 | — | 0 | 0 | 0 |

**Totals: 59 Bing impressions (8.0 % of the site's 737), 12 Copilot citations (10.8 % of 111),
4 GA4 sessions, 0 clicks, 0 Google impressions.** Six of the twelve have measurable signal; six
have none. `quick-system-info-report` is the site's **top content landing page in GA4**.

Be honest about the magnitude: 59 impressions over six months is not traffic. The case for
reverting is not "we are bleeding visitors" — it is that the stated reason for the cut was a
misread console, the measured Google-side cost of undoing it is exactly zero, and the pages are
cited by the one channel that is currently growing.

### The window is still open

- Site Explorer → filter **"URLs with NOINDEX tag"** → **"No data available."** Bing has not
  recrawled any of the 12 since the 8/28 deploy.
- URL Inspection, 2026-09-01: `/snippets/create-dated-folder` → **"Indexed successfully — URL
  can appear on Bing."** Same for `/snippets/bash-for-loop-examples`.

Bing crawled the trimmed 49-URL sitemap on **8/29**, so the 12 are now sitemap-orphaned and
queued to drop on next fetch. Reverting today costs nothing and loses nothing. Reverting in three
weeks means re-earning positions 3.5–4.6 from scratch.

---

## 4. Recommendation

**Revert the noindex + sitemap prune. Keep everything else from 8/28.**

| 8/28 change | Verdict | Why |
|---|---|---|
| `noindex` on 12 pages, sitemap 61 → 49 | **REVERT — all 12** | Premise disproven. Google cost provably 0. 6 of 12 have live Bing/Copilot signal; restoring the other 6 costs nothing and Copilot grounding is sampled, so visible citations are a floor. |
| AdSense loader removed from `layout.tsx` | Keep removed | Independently correct — ads are dead for this audience and AdSense was never approved. |
| `AffiliateBox`/`ToolkitCTA` stripped from snippet + tool templates | **Partially reverse** — this is Week-1 item 1 | It overshot: `ToolkitCTA` is still absent from `MDXComponents.tsx`, so there is no product path on any of the 38 snippet pages. Restore the toolkit CTA; leave affiliates out. |
| `HowTo` JSON-LD removed | Keep removed | No rich result since 2023. Neutral either way. |
| Real author identity (Travis) | Keep | Genuine E-E-A-T improvement, unaffected by the Bing error. |
| Cross-posting shelved | Keep shelved **for now** | The link-profile facts are independently true. But note this decision also descends from the disproven premise — revisit once Bing/Copilot growth is confirmed over another 3–4 weeks. |

### Do, in order

1. **Delete the 12 `noindex: true` flags** in `src/lib/snippets.ts`; `npm run build` (sitemap
   returns to 61); add the 12 URLs back to `public/llms.txt`; deploy.
2. **`npm run indexnow -- <the 12 URLs>`** immediately after deploy. Bing is the engine that
   reads it.
3. **Bing WMT → URL Submission** for the 6 with signal, prioritising `create-dated-folder`,
   `bash-for-loop-examples`, `quick-system-info-report`, `kill-a-process`.
4. **Do not spend GSC "Request indexing" quota on these 12.** Google has never indexed a content
   page; the quota is better spent on tools and guides — or not at all.
5. **Re-check in 3 weeks:** Bing Site Explorer indexed count (baseline 52), AI Performance
   citations (baseline 111 / 6 M), Bing impressions (baseline 737 / 6 M).

### Two findings the 8/28 audit dismissed that are worth acting on

- **Legacy `.html` URLs are carrying live equity.** ~181 of 737 Bing impressions (24.6 %) and
  5 of 14 clicks are attributed to `.html` URLs that 308-redirect — `disk-space-warning.html` 42,
  `shellcheck-error-decoder.html` 28, `check-if-website-is-up.html` 22,
  `restart-service-if-stopped.html` 22, `mysql-database-backup.html` 2 imp / **2 clicks**. Bing
  has not consolidated them. **No action needed** — the upstream cause (18 stale dev.to
  `canonical_url` values pointing at `.html` URLs) was already repaired via the dev.to API on
  2026-08-31; Bing simply has not reprocessed yet. Track it: this 24.6 % should fall as Bing
  recrawls. If it is still ~25 % in a month, the redirects need a second look.
- **The cron guide is the whole GEO story.** `/guides/bash-scripts-that-survive-cron` alone is
  43 of 111 Copilot citations, driven by one grounding query about serverless cron timeouts and
  retries. That is a repeatable content pattern, not luck. It is the strongest signal in any of
  the four audits about what to write next.

---

## 5. Effect on the Week-1 plan

The Week-1 TODO (2026-08-31) already prescribes the revert as item 2 with the correct reasoning,
so it needs no rewrite — this document is its evidence base. Ordering changes:

- **Item 2 (reverse the 12 noindex flags) moves to first.** It is time-boxed by Bing's recrawl;
  items 1, 3 and 4 are not. Do item 2, deploy, IndexNow, then go back to item 1.
- **Item 5 (pull GA4) is complete** — §2 above.
- Items 1, 3, 4 are unchanged.

The Week-1 premise — "revenue near zero is not a traffic failure, the path does not exist" — is
unaffected and still correct. 116 sessions in three months would not monetise at any price. But
the 8/28 audit's fallback ("301 the whole site to a non-.xyz domain if nothing moves in 6–8
weeks") should be **struck**: something is moving, on Bing and in Copilot, and a domain migration
would throw away the 52-page index and 111 citations that actually exist.

---

## 6. Evidence

All figures read live from the consoles on 2026-09-01. Bing property
`https://bashsnippets.xyz/`; GSC `sc-domain:bashsnippets.xyz` at authuser=0; GA4 property
535459693. Live-site checks: `curl` confirmed `noindex, follow` on all 12 slugs and
`grep -c "<loc>" sitemap.xml` = 49 with 0 occurrences of `create-dated-folder`.
