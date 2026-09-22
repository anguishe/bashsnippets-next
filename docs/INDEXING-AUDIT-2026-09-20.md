# Google indexing audit — 2026-09-20

**Question:** why won't Google index bashsnippets.xyz, and is buying a .com worth it?
**Short answer:** nothing on the site is broken. Google fetches the pages, is allowed to index
them, and chooses not to, because a 4.5-month-old domain with zero earned links gives it no reason
to. A .com does not change that. **Do not buy one to fix indexing.**

Sources: the four GSC exports dated 2026-09-20 (Coverage, two Drilldowns, Validation), live GSC
(`sc-domain:bashsnippets.xyz`, anguisheh1 Chrome), and a Googlebot-UA crawl of every URL in the
exports plus all 79 sitemap URLs, all run today.

## 1. What GSC says

| Bucket | Pages | Validation |
|---|---|---|
| Indexed | 1 (homepage) — flat since 6/29 | — |
| Crawled – currently not indexed | 69 (68 exported) | Failed (21 Failed, 47 Pending) |
| Discovered – currently not indexed | 43 | Started |
| Page with redirect | 3 | Started |
| Excluded by noindex | 2 | Not started |
| Not indexed total | 62 → 64 (7/24) → 100 (8/10) → 117 (9/14) | |

Search performance, 3 months: 0 clicks, 86 impressions, position 63; 85 of 86 are the homepage.
Manual actions: none. Crawl stats, 90 days: 784 requests (~9/day, ~3 HTML/day), 101 ms average,
89 % 200 / 11 % 301, **99 % refresh, 1 % discovery**, both hosts "No problems".

## 2. The "Crawled – not indexed" 68, fetched today as Googlebot

| What the URL really is | Count | Action |
|---|---|---|
| Live page: 200, self-canonical, `index, follow`, in sitemap | 35 | none possible on-page |
| Legacy `.html` → 308 to the clean URL (single hop) | 24 | none — correct, GSC is stale (most last crawled May) |
| Old category / trailing-slash / `index.html` / `/bash-scripts/*` → 308 | 9 | none — correct |

So 33 of the 68 are not problems at all: they are redirects Google has not recrawled since May–July.
They will move to "Page with redirect" whenever Google gets round to them. The inflated "117 not
indexed" is mostly this plus new pages being discovered (every content push adds to the pile:
+36 on 8/10, +17 on 9/14).

The two "Excluded by noindex" URLs (`/snippets/kill-a-process` and its `.html`) were crawled
2026-08-30, inside the 8/28–9/01 window when the prune was live. **Re-verified today: the page
returns `index, follow`, the `.html` 308s to it.** Stale, will clear on recrawl.

## 3. Re-verification of earlier work (all pass, live, today)

- http→https, www→apex, `.html`→clean: all single 308. `/bash-scripts/` is 2 hops (slash strip, then →`/snippets`); harmless.
- robots.txt allows everything except Bytespider; sitemap declared.
- `sitemap.xml`: 200, valid XML, 79 URLs, **79/79 return 200**, lastmod current. GSC: Success, read 9/16, 79 discovered.
- 8/28 noindex prune: reverted — 0 of the inspected URLs carry noindex or an `X-Robots-Tag`.
- Content is server-rendered: homepage 1,416 words / 37 internal links in raw HTML; cron guide 1,934 words, 8 JSON-LD blocks; open-ports snippet 1,694 words. One `<h1>` each. No `nofollow` on internal links.
- `bashsnippets-next.vercel.app` 308s to the domain — no duplicate host.
- No middleware; no robots/noindex rules in `next.config` / `vercel.json`.
- URL Inspection, `/guides/bash-scripts-that-survive-cron`: crawl allowed, fetch successful, indexing allowed, canonical correct → still "Crawled – currently not indexed". That is a Google *choice*, not an error.

## 4. Root cause

1. **Domain registered 2026-04-30** — under five months old.
2. **Zero earned links.** GSC: 103 external links from 8 sites — coderlegion 39, dev.to 20, vercel.app 15, medium 14, reddit 8, donweb.news 5, linkedin 1, moussouni.dev 1. **All 103 point at `/`.** The vercel.app 15 are two scraper mirrors of the dev.to posts (`nextjs-from-zero`, `tech-for-dev`). Everything else is self-posted, nofollow/UGC. No content page has a single external link.
3. **Crowded topic.** Bash how-tos are covered by Stack Overflow, man pages and a dozen large sites; Google has no need for one more unvouched copy, so it crawls, evaluates, and declines.
4. Symptoms match exactly: crawl demand ~3 HTML/day and falling, 1 % discovery, GSC "Internal links: 0" (Google only counts links from indexed pages and has one), referring page for the cron guide is its dev.to post, not the site.

It is not a technical fault, not a penalty, and not the TLD: Bing indexes 52 pages of this same
domain and Copilot cites it 100+ times; Google itself indexes the homepage and has issued no manual action.

## 5. Should we buy bashsnippets.com?

`bashsnippets.com` is unregistered (whois, today). **Recommendation: do not migrate.**

- Google has said repeatedly that new gTLDs are treated the same as .com. Our own data agrees: the homepage is indexed on .xyz; flockcase.com and itsronimacaroni.com index because they have links and a non-saturated topic, not because of the suffix.
- A 301 to a brand-new .com resets domain age to zero, moves the same 0 earned links, forces a recrawl at ~3 pages/day (weeks), and puts the working Bing/Copilot channel (52 indexed, growing citations) through a migration for nothing.
- Registering it for ~$12/yr purely as a defensive hold, parked, pointing nowhere, is fine and optional. It will not speed up anything.

## 6. Recommended fix (in order of effect)

1. **Get 3–5 real, followed links to content pages, not `/`.** Already drafted in `POST-QUEUE-2026-09.md` §D–G and still unposted: awesome-list PRs (awesome-bash, awesome-shell, awesome-sysadmin), Show HN for a tool (ShellCheck decoder or cron-wrapper generator — tools earn links, articles don't), ShellCheck-wiki / tool-directory listings. This is the only lever that moves Google. Travis posts; Claude drafts.
2. **Deep-link every cross-post.** The 13 scheduled dev.to posts and the Medium/CoderLegion companions should link the specific guide/snippet/tool, never just the homepage (the 9/11 "deep links only" rule — verify it holds in posts 02–14).
3. **Request indexing on 5 pages only**, one time: the three guides with Bing/Copilot proof (`survive-cron`, `ci-cd-pipelines`, `open-ports-linux`), `/tools/shellcheck-error-decoder`, `/shellcheck/sc2086`. Cheap, occasionally works once a link exists; do it *after* step 1 lands, not before.
4. **Leave alone:** "Validate fix" (thermometer), the sitemap slash entry (settled 9/16), redirects, noindex pruning, more content for Google's sake. Keep writing for the Bing/Copilot channel, which is measurably working.
5. **Re-read 2026-11-30** as already planned. Expect: `.html` rows draining into "Page with redirect", noindex bucket → 0. Indexed count moves only if step 1 happened.
