# GSC Indexing Playbook — bashsnippets.xyz

Step-by-step manual actions to get pages indexing. Do them in order.
Written 2026-07-29 after full technical audit (see `INDEXING-FIX-CHANGES.txt`).

**The one-line diagnosis:** the site is technically clean; Google crawled all
57 pages and declined to index them ("Crawled - currently not indexed") because
a young .xyz domain with 20 homepage-only backlinks and no content changes
since mid-June hasn't crossed Google's trust threshold. The fix is signals,
not settings — plus a handful of GSC repair actions below.

---

## Phase 0 — Deploy the code fixes (5 min, today)

1. In `Projects/bashsnippets-next`, review the diff:
   ```bash
   git diff && git status
   ```
2. Commit and push to `main` (Vercel auto-deploys):
   ```bash
   git add -A && git commit -m "Add homepage guides section + IndexNow bulk submit" && git push
   ```
3. After deploy completes, verify live:
   ```bash
   curl -s https://bashsnippets.xyz/ | grep -c 'href="/guides/'
   # expect: 4 or more
   ```

## Phase 1 — GSC repair actions (15 min, today)

Open https://search.google.com/search-console (property `bashsnippets.xyz`).

4. **Fix the `/snippets` redirect error** (stale from May 12 crawl):
   1. Left sidebar → **URL Inspection**.
   2. Paste `https://bashsnippets.xyz/snippets` → Enter.
   3. Click **Test live URL** (top right). Expect "URL is available to Google".
   4. Click **Request indexing**.
5. **Restart the stuck validation:**
   1. Sidebar → Indexing → **Pages** → click the **Redirect error** row.
   2. Click **See details** on the validation banner. If a **Start new
      validation** / **Validate fix** button is offered, click it.
6. **Sitemap — KEEP the trailing slash.** GSC shows `sitemap.xml/` and it reads
   Success. On this account, the trailing-slash form crawls instantly while the
   no-slash form silently fails to crawl (tested over several multi-week
   windows). Do NOT "fix" it to `sitemap.xml`. Leave the existing entry as-is;
   only re-submit `sitemap.xml/` (with slash) if it ever drops to a non-Success
   state.
7. **Request indexing for today's priority URLs** (quota is roughly 10–12/day;
   URL Inspection → paste URL → Request indexing, one at a time):
   1. `https://bashsnippets.xyz/guides`
   2. `https://bashsnippets.xyz/tools`
   3. `https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs`
   4. `https://bashsnippets.xyz/guides/bash-scripts-that-survive-cron`
   5. `https://bashsnippets.xyz/guides/bash-text-processing`
   6. `https://bashsnippets.xyz/guides/bash-scripting-for-ci-cd-pipelines`
   7. `https://bashsnippets.xyz/starter-kit`
   8. Your 3 highest-value snippet pages.

## Phase 2 — Bing / IndexNow (10 min, today)

Bing indexes far faster than Google, feeds DuckDuckGo, and powers
ChatGPT/Copilot answers — real traffic while Google warms up. That traffic is
itself a positive signal to Google.

8. Go to https://www.bing.com/webmasters → sign in → **Import from Google
   Search Console** → approve. This imports the site and sitemap.
9. After the Vercel deploy, submit everything to IndexNow from the repo:
   ```bash
   cd ~/Projects/bashsnippets-next && npm run indexnow
   # expect: "IndexNow: HTTP 200 — submitted 57 URLs" (202 also fine)
   ```
10. Make `npm run indexnow` part of every future deploy with new/changed pages
    (replaces the single-URL curl in CLAUDE.md's post-deploy checklist).

## Phase 3 — Daily request-indexing routine (days 2–6, 5 min/day)

11. Each day, URL-Inspect + Request indexing ~10 more URLs until all 57 have
    been requested once. Order: remaining tools first, then snippets. Keep a
    simple checklist; don't re-request the same URL within a week.

## Phase 4 — The actual unblock: freshness + deep links (weeks 1–4)

"Crawled - currently not indexed" clears when Google's quality systems see new
evidence. Validation will keep failing until the signals change. Two levers:

12. **Resume publishing now.** Holding content until indexing resolves is the
    wrong order — a site that hasn't changed since June 22 looks abandoned.
    Target 1–2 new snippets/guides per week, update `dateModified` in the
    registry when you touch a page, and run `npm run indexnow` after each
    deploy. New content also refreshes the sitemap `lastmod`s, which prompts
    recrawls of everything.
13. **Build deep links (links to content pages, not the homepage).** All 20
    current backlinks point at `/`. Priorities, in order of effort-to-impact:
    1. **GitHub README** — `github.com/anguishe/bashsnippets`: add a table
       linking every snippet/tool/guide URL. Crawled constantly; free
       discovery paths even though nofollow.
    2. **dev.to / Medium / CoderLegion articles** — one per flagship snippet
       or tool, each with a canonical/dual link to its exact page (the
       `bashsnippets-article` skill produces these). 5–10 articles over the
       next month, each targeting a different deep URL.
    3. **Reddit answers** (r/bash, r/commandline, r/linuxadmin, r/sysadmin) —
       when a thread asks a question a specific snippet answers, link that
       snippet page directly.
    4. **Show HN** — pick the strongest tool (cron wrapper generator or
       ShellCheck decoder) and post it once. Tools pages are the most
       link-worthy asset the site has.
14. **After ~2 weeks** of steps 12–13, go back to GSC → Pages → "Crawled -
    currently not indexed" → **Validate fix**. Do not click it before then —
    it already failed once and repeated failed validations do nothing.

## Phase 5 — One-time Vercel sanity checks (5 min)

External probes came back clean, but confirm in the dashboard:

15. Vercel → project → **Firewall**: Attack Challenge Mode must be OFF; no
    custom rule challenging or blocking verified bots.
16. Vercel → project → **Settings → Deployment Protection**: Production must
    be unprotected (no password / Vercel Authentication on the prod domain).

## Phase 6 — Monitor (weekly, 5 min)

17. GSC → Indexing → Pages: watch **Indexed** count and the "Crawled -
    currently not indexed" trend. Movement typically shows 2–8 weeks after
    Phase 4 starts, not days.
18. GSC → Performance: impressions rising precedes indexing gains.
19. Bing Webmaster → Site Explorer: expect near-full indexing within days —
    confirms (again) the site itself is fine.

---

## What NOT to worry about

- **3 "Page with redirect"** — legacy `.html`/www URLs redirecting correctly.
  Leave them.
- **"Duplicate, Google chose different canonical" = 0, validation Passed** —
  resolved; canonicals are working.
- **GSC "Internal links: 0"** — an artifact of only the homepage being
  indexed, not a real linking problem. Fixes itself as pages index.
- Re-auditing metadata/schema/robots — verified clean 2026-07-29; churning it
  further won't move indexing.
