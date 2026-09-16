# BashSnippets — Action Plan to 2026-11-04
**Generated:** 2026-09-16 | **Full report:** [`AUDIT-2026-09-16.md`](AUDIT-2026-09-16.md) | **Status board:** [`PLAN.md`](PLAN.md)

**The date.** Travis (2026-09-16): monetization moves to **2026-11-04**, the day WoW: Forever launches. By then every income surface should be live and the site should run on light weekly upkeep. This plan fits the time Travis actually has between now and then: the WoW beta runs 9/17 – 10/21 and Super Dad runs daily through 11/12. Claude does the site work. Travis's share is **about 30 min, twice a week**, plus a few one-off 10-minute jobs.

**Honest expectation.** Of these steps, only the sales-page fixes and the posting cadence can move money by 11/04, and even they give a small chance of a first sale, not a reliable income. The site has never had a paying customer, and it has had 2 GA4 users in 28 days. What 11/04 buys is an **honest read**: seven weeks of real distribution into a truthful sales page. The old 10/06 read would have measured a queue that never started.

---

## CRITICAL: fix immediately
### C1 · Make the license wording match the zip (Travis decides which one changes)
**File:** `src/app/starter-kit/page.tsx:44,139,262,333,347`, `public/llms.txt:124`, or `LICENSE.txt` in the zip
**Impact:** the only sales page, plus its FAQ schema that assistants quote, says MIT. The buyer receives a single-buyer, no-redistribution license. That invites a refund or chargeback, and it's the kind of mismatch a Show HN thread finds in minutes.
**Fix, option A (recommended; keeps the kit sellable):** change the page to match the file.
```diff
- 'Yes. Everything ships under the MIT license — unlimited personal and commercial use, no attribution required. The LICENSE file in the ZIP spells out exactly what you are allowed to deploy.',
+ 'Yes. Use it in unlimited personal and commercial projects and ship it inside your own code. The one limit: do not resell or redistribute the kit itself. LICENSE.txt in the ZIP spells it out.',
```
Do the same for the badge lines ("MIT license" → "commercial use license") and `llms.txt:124` ("MIT licensed" → "single-buyer commercial license"). **Option B:** re-license the zip as MIT, which means anyone may redistribute it.

---

## HIGH: this week (by Tue 9/22)
### H1 · Remove the unbacked claims on `/starter-kit`, `/about`, `/snippets`, `llms.txt`
**Files:** `starter-kit/page.tsx:59,296-297,332` · `about/page.tsx:196-197` · `snippets/page.tsx:13,20,29` · `llms.txt:7`
**Impact:** follows the real-runs-only rule. "No suppressions" is false: the zip has 13.
**Fix:**
- "Every file passes ShellCheck with no suppressions" → "Every file passes `shellcheck -x -S style`".
- "Tested on Ubuntu 22.04+, Debian 12, and macOS" → "Tested on Kali Linux (bash 5.3)", unless Travis runs it elsewhere first.
- Recount `bashlib.sh` functions by hand. The grep finds 30, while `ToolkitCTA.tsx:32` and 6 other places say 31. Fix every occurrence to whatever the true count is.

### H2 · Buy button under the price line
**File:** `src/app/starter-kit/page.tsx` (~139)
**Impact:** the only button sits about 858 words down. The warm visitor who arrives from a CTA sees the price and no button.
**Fix:** copy the existing `TrackedOutboundLink` block from `:340` to sit directly under the price line. Point both buttons at `https://anguish0.gumroad.com/l/toolkit?wanted=true`, which opens checkout directly.

### H3 · Make the lead-magnet page sell
**Files:** `src/app/snippets/[slug]/page.tsx:260`, `src/content/snippets/bashlib-starter.mdx:338-340`
**Impact:** every confirmed subscriber lands here. Today the page asks them to subscribe again and never links the toolkit in its prose.
**Fix:** skip `EmailCapture` when `slug === 'bashlib-starter'`, and turn "Production Bash Toolkit" in the FAQ answer into a link to `/starter-kit`.

### H4 · Link the two orphans that serve the biggest Bing clusters
**Files:** `src/content/guides/open-ports-linux.mdx` → `/snippets/ports-audit` · `src/content/guides/auto-restart-linux-service.mdx` → `/snippets/service-watchdog`
**Impact:** open ports is 26% of Bing queries, and the service-watchdog cluster sits at position 2.0. Both scripts have zero inbound content links.
**Fix:** one sentence plus a link in each guide, next to the section the script automates. `npm run indexnow` after deploy.

### H5 · Travis: three one-off jobs, about 10 minutes each
1. Upload `~/Downloads/BashSnippets/Production-Bash-Toolkit.zip` to Gumroad (HANDOFF item 10).
2. Gumroad → the product → turn on **Discover** (marketplace listing), if the account is eligible. It's the only channel where buyers already are. **Fix the license text first (C1).**
3. Read and report: Buttondown subscriber count (minus the test addresses), Gumroad sales, and product views since 9/01.

### H6 · Travis: restart posting at two a week
**Impact:** 0 of 4 due posts shipped. This is the whole demand test.
**Fix:** the queue below replaces the dates in `POST-QUEUE-2026-09.md` §A/§B1. Bodies, titles, canonicals and tags are unchanged, and every draft is already paste-ready and built on real runs. **Tue + Thu evenings, about 15 min each** (dev.to post, then the Medium import from §B2 the same evening). HN daily comments become optional. Show HN stays a single shot, earliest Tue 9/29, and only if Travis has a free evening.

**Superseded 2026-09-16 (later the same day):** the order was re-set from the Bing cluster demand and the files renumbered 01–14 in posting order. The table of record is `docs/cross-posts/queue/README.md`: #01 open ports posted Wed 9/16, then Tue + Thu through Tue 11/3.

Plus once, any evening before 10/21: the two awesome-shell PRs (§D1, about 20 min). That's the cheapest shot at a first earned link, and it isn't blocked by the 50-star rule.

---

## MEDIUM: before 2026-10-21 (beta ends)
### M1 · Bring titles and descriptions inside Bing's limits
**Files:** the title template (layout / `generateMetadata` in the snippet, tool, guide and ShellCheck routes), plus registry descriptions
**Impact:** 34/79 titles are over 65 characters and 68/79 descriptions over 160, on the only channel with measured traffic.
**Fix:** drop the ` | BashSnippets.xyz` suffix when the full title would pass 65 characters (fixes 15 in one change). Trim descriptions to 150–160 characters, keeping the answer-first wording. Rebuild, then `npm run indexnow` for all 79.

### M2 · Purchase tracking you can trust
**Files:** `src/components/TrackedOutboundLink.tsx:26`, `src/lib/track.ts:5`
**Fix:** `rel="noopener"` (drop `noreferrer`) on the Gumroad link, so Gumroad attributes the source. Check `toolkit_purchase_click` in GA4 DebugView once. If it's consent-gated, treat **Gumroad's own view and sale counts as the metric of record** for 11/04.

### M3 · Low-effort cleanups (one commit)
- `public/llms.txt:12`: 44 → 45.
- `src/app/snippets/page.tsx:84`: remove the dead `#advanced` jump link.
- `check-if-website-is-up`: `myapp.com` → `example.com`.
- `src/lib/author.ts`: the 4 `sameAs` → the 8 used in `layout.tsx:122-131`.
- `scripts/generate-sitemap.mjs`: update the hardcoded guide `lastmod` dates to the real 9/11 changes.

---

## LOW: backlog (after 11/04, only if the read says continue)
### L1 · Gumroad seller name "Anguishe Security" → "BashSnippets"
Travis, in Gumroad settings. This is an identity decision, so ask first.
### L2 · Stale doc lines
HANDOFF HEAD hash, CLAUDE.md:114 count, `guides/layout.tsx:6` comment, `EmailCapture.tsx:9` dead doc reference, and the `/about` iframe paragraph.
### L3 · Deferred by decision, unchanged
GitHub Sponsors (2 stars, so it would earn nothing), a productized script-hardening service (trades hours; revisit only if a buyer asks), YouTube Shorts, the JSX→MDX migration, and the competitor teardown.

---

## The 2026-11-04 read (replaces the ~10/06 kill signal)
Read on **Wed 11/04** from Buttondown and Gumroad directly, not GA4. The thresholds below are proposed; Travis can change them.

| Result | Meaning | Mode from 11/05 |
|---|---|---|
| ≥ 1 real sale **or** ≥ 5 real signups, with ≥ 10 of the 14 posts shipped | Demand exists | **Maintain:** about 45 min/week (below) |
| 0 sales **and** < 5 signups, with ≥ 10 posts shipped | Demand failure, measured honestly | **Freeze:** 1 h/month. The site stays up and Copilot citations keep accruing for free |
| < 10 posts shipped | The test never ran | **Freeze.** Treat it as a time answer, not a demand answer. Reopen only if Travis decides to run the queue |

**Weekly upkeep in Maintain mode (about 45 min, one sitting):** check Buttondown and Gumroad counts, post one new real-run article if one is drafted, answer comments, and every Monday `npm run indexnow` if anything deployed. Monthly: Bing WMT impressions and Copilot citations against the 9/10 baselines.

---

## Estimated Impact by Priority
| Group | Effort | Impact |
|---|---|---|
| C1, H1–H4 (Claude) | ~2 h, one deploy | A sales page that tells the truth and sells to warm readers; no traffic change by itself |
| H5–H6 (Travis) | ~30 min one-off + ~30 min/week | The whole demand test; the only item that brings readers |
| M1–M3 (Claude) | ~3 h | Better Bing snippet display and CTR on the one channel with signal; tracking you can read |
| L1–L3 | — | Only after the 11/04 read |

---

## Post-Fix Checklist
1. `npm run build && npm run lint`: zero errors. Revert the byte-identical `public/sitemap.xml` rewrite if git shows it.
2. The pre-commit leak guard passes (never `--no-verify`).
3. Push to `main` (Vercel deploys), then curl `/starter-kit`: no "MIT", no "no suppressions", buy button above the fold.
4. `npm run indexnow`, then confirm in Bing WMT → IndexNow.
5. Update `PLAN.md` §2 status rows and §11 changelog.
