# Indexing Audit — bashsnippets.xyz — 2026-08-28

Fourth audit since launch (2026-04-30). Every prior audit found the site technically clean
and said "wait for signals". This one re-verified every technical layer from scratch,
then went looking for what the previous audits could not see. Verdict is unchanged on the
technical side and much sharper on the cause.

## 1. State (GSC `sc-domain:bashsnippets.xyz`, 2026-08-28)

| Bucket | Pages | Validation | Meaning |
|---|---|---|---|
| Indexed | **1** (homepage) | — | Only page Google serves. Ranks #24 for its own brand query "bash snippets". |
| Crawled – currently not indexed | **64** | Failed | Google fetched them (30 current URLs + 34 legacy `.html`/`/bash-scripts/`/category URLs) and declined. |
| Discovered – currently not indexed | **33** | Started | Google knows the URL from the sitemap and has **never fetched it** — includes pages published Jun 10, Jun 17, Jun 22, Jul 8, Aug 9. |
| Page with redirect | 3 | Started | Expected. |

Crawl stats (90 d): 898 requests, **99 % refresh / 1 % discovery**, rate decayed from ~80/day
(late Jun–early Jul) to ~10/day (Aug). Host status "No problems", 88 % 200 / 12 % 301,
106 ms avg response.

Links: 103 external, **100 % to the homepage**, 100 % self-created UGC — coderlegion 39,
dev.to 20, vercel.app (own preview deploys) 15, medium 14, reddit 8. Zero earned links.
Internal links: 0 (artifact of one indexed page).

Performance (3 mo): 1 click, 64 impressions, all homepage; queries: "bash snippets" (#24),
"bash script library", "bash libraries", "bash library". Impressions mostly IN/PH/VN/TR.

**Bing: `site:bashsnippets.xyz` → "There are no results."** Zero pages, homepage included,
after ~3 months of IndexNow submissions (HTTP 200) and a verified Bing property. DuckDuckGo: 0.
Two independent engines reached the same verdict.

## 2. Technical layers — all verified clean (do not re-audit these)

Probed live as Googlebot/bingbot UAs and confirmed with Google's own URL Inspection live test.

- HTTP: all 64 sitemap URLs 200; www→apex, http→https, trailing-slash, `.html`, `/bash-scripts/*`,
  retired category pages all single-hop 308. `bashsnippets-next.vercel.app` → 308 to prod;
  other preview hosts behind Vercel SSO (custom domain unprotected, correct).
- DNS: single A `216.198.79.1` (Vercel), no AAAA, no stale host. www CNAME to vercel-dns.
- Transport: gzip, br, identity all decode to identical 101 KB HTML; HTTP/1.1 and HTTP/2 OK.
- `<head>`: self-canonical, `robots index,follow`, unique titles/descriptions, valid JSON-LD
  (Organization, WebSite, TechArticle, BreadcrumbList, FAQPage, HowTo).
- SSR: content is in raw HTML — snippet 1.5 k words, guide 6 k, tool ~700; MDX word counts
  1,091–1,939. Boilerplate share between two snippet pages: 9 %.
- Render (Playwright + GSC live test): 0 JS errors, 1 AdSense warning; consent bar is a
  78 px bottom strip, not an interstitial; Google: "URL is available to Google / Page can be
  indexed", 6/37 resources blocked = only ad/analytics third parties (normal).
- robots.txt valid, sitemap 64 URLs with honest lastmods, GSC sitemap "Success, 64 discovered".
- Manual actions: none. Security issues: none. Vercel: no password/IP protection on prod.
- Domain: registered 2026-04-30 at Namecheap — no prior owner, no history, no penalty carried in.

Conclusion: nothing on the server, in the code, or in the config is stopping indexing.
Google's live test literally says the page can be indexed. Both engines are choosing not to.

## 3. Root cause — site-level quality/trust classification

"Crawled – currently not indexed" on every content page + "Discovered – not indexed" on every
newer page + decaying crawl rate + zero Bing index is the textbook signature of a site that a
quality classifier has bucketed as *scaled, monetization-first content with no real-world
footprint*. No single item below is disqualifying; the **combination on a 4-month-old .xyz with
zero earned links** is.

1. **Monetization before audience.** Every snippet/tool page ships 3 AdSense slots (the
   AdSense script is live sitewide — Google's render shows it firing an ad request to
   `googleads.g.doubleclick.net/pagead/ads?…client=ca-pub-5399156622542127`), 2 affiliate boxes
   ("Affiliate link · we earn a commission" ×4 per page) and a $9 product CTA. Zero visitors.
2. **Uniform template × 64.** Quick Answer → script → explanation → FAQ accordion → affiliate →
   toolkit CTA; 1,100–1,950 words each; TechArticle + FAQPage + HowTo JSON-LD on all; published in
   batches (16 pages dated 06-03, 6 on 06-06, 4 on 06-10, 3 on 06-17, 3 on 06-22 …).
3. **No verifiable author.** Byline "Anguishe", no real name, no photo, no external identity;
   `Person` schema points back at the site.
4. **Link profile looks manufactured.** 103 links, all self-posted on UGC platforms + own
   Vercel previews, all to `/`. Nothing editorial. To a classifier this is a link scheme.
5. **The valuable part is published elsewhere first/also.** The scripts live on GitHub, dev.to
   (37 articles), Medium and CoderLegion (self-canonical, ~30 % text overlap incl. the code).
   Google can satisfy the query without the .xyz host.
6. **Saturated topics.** ~1/3 of pages target the most competitive generic bash queries (for
   loop, if/else, arrays, functions, string manipulation, read file line by line, argument
   parsing) — these are exactly the pages Google refused to even fetch.
7. **Stale canonicals on 19 dev.to articles** point at `.html`/trailing-slash URLs that now 308
   (e.g. `…/snippets/kill-a-process.html`, `…/snippets/`, `…/tools/`). Minor, cheap to fix.

The "validation" that keeps failing is not a test that can be passed by fixing something —
"Validate fix" on *Crawled – currently not indexed* just re-checks whether Google indexed the
sample. It is a thermometer, not a lever. Repeated clicks do nothing.

## 4. Fix plan (impact ÷ effort order)

### P0 — remove the negative signals (code, same day)
- **De-monetize content pages until indexed**: drop the AdSense `<Script>` from `layout.tsx`
  (keep `ads.txt`), remove `<AffiliateBox>` ×2 and `<ToolkitCTA>` from the snippet and tool
  templates. Keep the toolkit CTA on `/`, `/starter-kit` and guides; move affiliates to one
  resources block. Revenue cost today: $0.
- **Schema diet**: remove `HowTo` JSON-LD (no rich result since 2023; boilerplate schema on
  every page is itself a pattern). Keep FAQPage per CLAUDE.md but only where FAQs are real.
- **Prune**: `noindex` + drop from sitemap the ~12 generic-tutorial pages Google refused to
  crawl (`bash-for-loop-examples`, `bash-if-else-examples`, `bash-arrays`, `bash-functions`,
  `bash-functions-arguments`, `bash-string-manipulation`, `bash-read-file-line-by-line`,
  `bash-argument-parsing`, `create-dated-folder`, `quick-system-info-report`,
  `search-files-for-text-grep`, `kill-a-process`) — or merge them into 2–3 reference pages.
  Drop `/contact`, `/privacy`, `/terms` from the sitemap (leave indexable). Aggregate site
  quality is what is being judged; fewer, stronger URLs raise the average.

### P0 — add the positive signal only the owner can add
- **Real author identity** on `/about` and in the byline/`Person` schema: real name, photo,
  2–3 sentence bio, `sameAs` → GitHub (`anguishe`, has commit history), LinkedIn/X. This is
  the single strongest E-E-A-T lever for a one-person site and the one every prior audit
  skipped.

### P1 — off-site (this week)
- Stop mass cross-posting. Fix the 19 dev.to canonicals (dev.to API `canonical_url`) to the
  clean URLs. Stop publishing full scripts on CoderLegion (no canonical support) — excerpt +
  link only.
- Earn 3–5 real links: PR the tools into `awesome-shell` / `awesome-bash` / `awesome-sysadmin`
  (editorial gate = real link); one Show HN for ShellCheck Error Decoder or Cron Wrapper
  Generator; 3–5 genuine answers on Unix.SE / r/bash / r/linuxadmin linking the *tool* that
  answers the question.
- Bing Webmaster Tools: log in, URL-inspect 3 pages — Bing states its reason explicitly.
  Bing is the canary: it will index weeks before Google does.

### P2 — process
- Do **not** click "Validate fix". After deploy: `npm run indexnow`, then Request Indexing for
  the 10 strongest pages (tools + guides) once. Re-check GSC Pages + Bing `site:` in 3 weeks.
- Sitemap: leave the `sitemap.xml/` entry (owner-verified behaviour); note URL Inspection shows
  "No referring sitemaps detected" because the entry redirects — harmless.
- Fallback if nothing moves in 6–8 weeks after all of the above: 301 the site to a
  non-.xyz domain (`.com`/`.dev`/`.sh`). Resets TLD prior only; content signals carry.

## 5. What "guaranteed" can honestly mean
Nobody can guarantee Google indexing. What this plan guarantees is that every signal inside
our control that matches the low-quality pattern is removed, and every signal that a real
site emits is present. Bing indexing is the first measurable milestone; Google typically
follows within 2–6 weeks of Bing on sites that flip.

## 6. Evidence files
GSC exports (2026-08-28) in `~/Downloads/bashsnippets.xyz-{Performance-on-Search,Coverage-Validation,Coverage-Drilldown}-2026-08-28.zip`.
Never-crawled list (33) = sitemap minus Coverage-Drilldown table; matches GSC exactly.
