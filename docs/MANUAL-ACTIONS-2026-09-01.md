# Manual Actions — bashsnippets.xyz — from 2026-09-01

Everything in this file needs a human: a console login, a card on file, or a judgment call.
Code-side work is already committed. Follow the convention in `~/Downloads/MANUAL-ACTIONS-MASTER.md`
— newest actions first, exact steps, no "configure as appropriate".

**Legend:** ⬜ not started · 🔵 blocked on someone else · ✅ done

---

## PHASE 1 — ship the de-monetization

**Done 2026-09-01.** `1a2cf79`, `90374ac` and `1a47e16` are pushed and live; deploy takes ~40–50 s.
Items 1.4 through 1.9 below are still open.

### 1.1 ✅ Deploy — done 2026-09-01

```bash
cd ~/Projects/bashsnippets-next
git log --oneline -1            # expect 1a2cf79 fix(monetization): ...
git push origin main
```

Watch the deploy at https://vercel.com — it is done when the production alias flips.

### 1.2 ✅ Verify live — done 2026-09-01, all checks passed

```bash
# 1. No affiliate links anywhere. Expect 0 for all three.
for u in / /about /tools /starter-kit /guides/bash-scripts-every-sysadmin-needs \
         /snippets/find-large-files-linux /snippets/bash-trap-cleanup; do
  n=$(curl -s "https://bashsnippets.xyz$u" | grep -cE 'm\.do\.co|namecheap\.pxf\.io')
  echo "$u  affiliate-hits=$n"
done

# 2. No ad artifacts. Expect 0.
curl -s https://bashsnippets.xyz/ | grep -cE 'adsbygoogle|ca-pub-'
curl -sI https://bashsnippets.xyz/ads.txt | head -1     # expect 404

# 3. The product path SURVIVED. Expect 1 on each.
for u in /snippets/bash-error-handling /tools/shellcheck-error-decoder \
         /guides/bash-scripts-that-survive-cron; do
  echo "$u  toolkit-cta=$(curl -s "https://bashsnippets.xyz$u" | grep -c 'Get the Toolkit')"
done

# 4. Sitemap unchanged at 61.
curl -s https://bashsnippets.xyz/sitemap.xml | grep -c '<loc>'
```

If (1) or (2) is non-zero, the CDN is still serving a cached page — wait 60 s and re-run before
assuming the commit failed.

### 1.3 ✅ IndexNow — done 2026-09-01, HTTP 200, 61 URLs

Repo convention is to submit the full sitemap after every deploy.

```bash
cd ~/Projects/bashsnippets-next && npm run indexnow
```

Expect HTTP 200. Confirm in **Bing Webmaster Tools → IndexNow**: the batch should appear within a
few minutes, source `Self`. One key covers Bing, Yandex, Seznam and Naver — there is no second key
to submit.

### 1.4 ⬜ Vercel — delete the dead env var

`NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADS_ENABLED` are now read by no code.

1. https://vercel.com → the `bashsnippets-next` project → **Settings → Environment Variables**
2. Delete `NEXT_PUBLIC_ADSENSE_CLIENT` if present (all three environments)
3. Delete `NEXT_PUBLIC_ADS_ENABLED` if present
4. Locally: remove the `NEXT_PUBLIC_ADSENSE_CLIENT=` line from `~/Projects/bashsnippets-next/.env.local`

No redeploy is needed — nothing reads them.

### 1.5 ✅ Google AdSense — closed out 2026-09-01

`ca-pub-5399156622542127` was never approved, and the site now serves no ads. Travis closed the
AdSense account out for bashsnippets on 2026-09-01.

**This is now irreversible in practice** — re-entering AdSense would mean a fresh application and
re-approval, on top of re-adding the loader, the slots and the `ads.txt` this repo deleted. That is
the intended outcome, not a loss: see `CLAUDE.md → Monetization` and the 2026-08-31 pivot decision.

If a Google policy email arrives about `ads.txt` disappearing, ignore it — the file was removed on
purpose and the site is out of the program.

### 1.6 ⬜ Affiliate programs — decide, then act

The links are gone from the site. The accounts are not.

| Program | Dashboard | Recommendation |
|---|---|---|
| DigitalOcean (`m.do.co/c/7a196437764c`) | https://www.digitalocean.com/referral-program | Leave the account open. Zero cost, and the referral link still works if you ever put it in a newsletter instead of on-site. |
| Namecheap (`namecheap.pxf.io/…`) | Impact.com dashboard | Same — leave open. |

**No action is strictly required.** Neither program obliges you to keep links live. Do check
whether either has an unpaid balance worth withdrawing before you forget the accounts exist.

### 1.7 ⬜ Buttondown — CONFIRMED: `EmailCapture` is invisible on production

`EmailCapture` is `if (!USERNAME) return null`, and `NEXT_PUBLIC_BUTTONDOWN_USERNAME` is set
neither in `.env.local` nor in Vercel. Checked against production after the 2026-09-01 deploy:
`curl -s https://bashsnippets.xyz/snippets/bash-error-handling | grep -c buttondown` returns **0**.
The form renders nothing.

This is not cosmetic. The kill signal for the whole project is measured in **email signups by
~2026-10-15** — with no form on the page, that clock is not running and the signal cannot fire.

1. https://buttondown.com → sign up / log in → **Settings → Basics** → copy your username
   (the `buttondown.com/<username>` slug, not your email).
2. Vercel → project → **Settings → Environment Variables** → Add:
   - Key `NEXT_PUBLIC_BUTTONDOWN_USERNAME`, Value `<your slug>`, all three environments.
3. Add the same line to local `.env.local`.
4. **Redeploy** — this is a `NEXT_PUBLIC_` var, so it is inlined at build time and will not appear
   until a new build runs. Vercel → Deployments → ⋯ → Redeploy.
5. Verify: reload a snippet page, submit a test address, confirm it lands in Buttondown.

### 1.8 ✅ Push 5 missing scripts to the scripts repo — done 2026-09-01

`getRepoScriptUrl()` is an exclusion list, and five snippets linked to `.sh` files that were never
pushed — they 404'd from live indexable pages the moment `1c6a800` deployed. Stopgapped in
`1a47e16` by adding them to `NO_REPO_SCRIPT`, so the links no longer render. That hides the
symptom; these five snippet pages now have no script link at all.

Missing from `~/Projects/bashsnippets` (which holds 31 of 38):

- `bash-curl-api-requests`
- `bash-parse-json-jq`
- `bash-sed-find-replace`
- `bash-slack-webhook-alerts`
- `bash-trap-cleanup`

**Done** — scripts repo `9fbe0de`, site `1a47e16` reverted in the follow-up commit. All five
extracted from their MDX, given the house `Explained line-by-line` header, ShellCheck-clean at
`-S style`, and run before commit. All five now return 200; `NO_REPO_SCRIPT` is back to the two
deliberate exclusions. README table 31 → 36 rows.

One judgment call worth knowing about: `bash-trap-cleanup.sh` calls `generate_report_rows` on the
site as a stand-in for the reader's own query, which would have died with *command not found* on a
clone — against that repo's README promise of "clone it, read it, run it". Added it as a
clearly-marked stub emitting sample CSV, deliberately sized past the script's own 1024-byte sanity
gate so a plain run demonstrates the publish path rather than the refusal path. The site page is
unchanged; only the repo copy carries the stub.

### 1.9 ⬜ GA4 — internal traffic filter

Flagged in week-1 §5 and still not done. 89 of 116 sessions are Direct with no filter configured,
so an unknown share of your only analytics baseline is you and Vercel previews.

1. https://analytics.google.com → property **BashSnippets (535459693)**
2. **Admin → Data Streams →** the web stream **→ Configure tag settings → Show all → Define internal traffic**
3. **Create** → Rule name `internal`, `traffic_type` value `internal`, match **IP address equals**
   your home IP (`curl -s ifconfig.me` to get it)
4. **Admin → Data Settings → Data Filters** → the `Internal Traffic` filter → set state from
   *Testing* to **Active**

Note the date you activate it. Sessions before and after are not comparable, and the 3-week
re-check in §2.4 needs to know that.

---

## PHASE 2 — in order

### 2.1 Reprice $9 → $29, add a $79 five-seat tier

Week-1 §3. **Code side is ~15 minutes; the Gumroad side is the part only you can do.**

⚠️ The line numbers in `docs/WEEK-1-TODO.md` §3 are **stale after commit `1a2cf79`** — that commit
deleted lines from `starter-kit/page.tsx` and `page.tsx`. Re-verified 2026-09-01 **after** the strip:

| File | Line | What |
|---|---|---|
| `src/app/starter-kit/page.tsx` | 13 | meta description |
| `src/app/starter-kit/page.tsx` | 20 | schema description |
| `src/app/starter-kit/page.tsx` | 36 | schema description (dupe) |
| `src/app/starter-kit/page.tsx` | 64 | FAQ answer ("One-time $9 purchase") |
| `src/app/starter-kit/page.tsx` | **83** | Offer schema `price: '9.00'` — **not caught by `grep '\$9'`** |
| `src/app/starter-kit/page.tsx` | 139 | visible body copy |
| `src/app/starter-kit/page.tsx` | **344** | CTA button text (was 345) |
| `src/components/Footer.tsx` | 8 | nav label |
| `src/app/page.tsx` | **309** | New & Popular link title (was 313) |
| `src/components/ToolkitCTA.tsx` | **26** | "PAID RESOURCE — $9" badge (was 13) |
| `public/llms.txt` | 100 | "Paid resource ($9, one-time)" |

Re-derive rather than trusting the table:
`grep -rn '\$9\b' src/ public/llms.txt | grep -v bash-text-processing` (that one exclusion is an
awk `$9` field reference in a guide, not a price) plus `grep -n "price:" src/app/starter-kit/page.tsx`.

**Manual — Gumroad, do this BEFORE deploying the code change** so the page and the checkout never
disagree:

1. https://app.gumroad.com → **Products → The Production Bash Toolkit** (`anguish0.gumroad.com/l/toolkit`)
2. **Price** → change `9` to `29` → **Save and publish**
3. Add the team tier. Two options — **use a variant, not a second product**, so the `/l/toolkit`
   URL and its reviews stay in one place:
   - Product → **Variants → Add variant** → name `Five-seat team licence`, price `79`
   - Rename the existing tier to `Single developer`
4. Write the one differing line in the team variant's description: the licence permits use by up to
   five named developers at one organisation. Everything else about the deliverable is identical —
   there is no extra production cost.
5. Then update the 11 code sites, `npm run build && npm run lint`, commit, push, and re-run the
   §1.2 verification with `$29` as the expected string.

**This is a judgment call, not arithmetic** — there is no conversion history at $9 to reprice from.
It reverses in 30 minutes if it is wrong, and at 116 sessions / 3 months the downside is zero.

### 2.2 Migrate `bash-scripts-every-sysadmin-needs` to MDX

The last JSX guide — 1254 lines in `src/app/guides/bash-scripts-every-sysadmin-needs/page.tsx`,
while the other four are 146–189-line wrappers over `src/content/guides/*.mdx`. `CLAUDE.md` already
claims all guides are MDX, so today the doc is wrong.

No manual step. Pure code:

1. Port the body to `src/content/guides/bash-scripts-every-sysadmin-needs.mdx`, matching the
   frontmatter shape of `bash-scripts-that-survive-cron.mdx`.
2. Replace `page.tsx` with the same wrapper the other four use.
3. `npm run build` — the route must stay at the identical URL, and the sitemap must stay at 61.
4. `curl -s https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs | grep -c 'Get the Toolkit'`
   → expect 1. It picks up `ToolkitCTA` and `EmailCapture` from the shared layout for free.

Do this **before** 2.3 — writing new guides against the MDX pipeline is cheaper than writing them
against two pipelines.

### 2.3 Write 2–3 more guides in the cron-guide pattern

The strongest signal in four audits: `/guides/bash-scripts-that-survive-cron` is **43 of 111**
Copilot citations, 31 of them from one grounding query — *"cron jobs serverless timeouts retries
gotchas"* — at a 13.08 % citation share.

What that guide does that the snippets do not: it answers an **operational failure question** in
prose, with the reasoning in the text rather than in a code block. Read the Bing audit's note —
*"anything this channel is meant to earn has to live in the prose a model carries away, not in a
CTA a reader never loads."*

Candidate queries in the same shape (verify demand before writing, do not just trust this list):

- "why does my bash script work interactively but fail in cron/systemd" — PATH, env, TTY, locale
- "bash script hangs forever in CI — timeouts, retries, and killing the right process group"
- "safely handling secrets in shell scripts" — env vs file vs vault, what leaks into `ps` and logs

**Manual — before writing each one:**

1. Bing Webmaster Tools → **Search Performance → Query** filter — check the phrase actually gets
   impressions on this property.
2. Bing WMT → **AI Performance** — check which existing pages are cited for adjacent queries, so
   the new guide can link to them and vice versa.
3. After publishing: `npm run indexnow -- https://bashsnippets.xyz/guides/<new-slug>`

Then log the piece in `docs/CROSS-POST-BACKLOG.md` — but **do not cross-post it**. Cross-posting
stays shelved (see the 9/01 audit, §5 amendment). Revisit after 2.4.

### 2.4 Re-check on 2026-09-22, against the recorded baselines

Three weeks after the 9/01 revert. This is the only step that tells you whether any of it worked.

| Metric | Baseline 2026-09-01 | Where to read it |
|---|---|---|
| Bing Site Explorer, indexed | 52 | Bing WMT → Site Explorer |
| Bing impressions / clicks, 6 M | 737 / 14 | Bing WMT → Search Performance |
| Copilot citations, 6 M | 111 across 13 pages | Bing WMT → AI Performance |
| Legacy `.html` share of impressions | 24.6 % — **should fall** | Bing WMT → Search Performance → Pages |
| GSC indexed | 1 (homepage only) | GSC → Indexing → Pages |
| GA4 sessions, 3 M | 116 (~27 non-Direct) | GA4 → Reports → Acquisition |
| `toolkit_cta_view` / `_click` by placement | **no baseline — first read** | GA4 → Reports → Engagement → Events |

Sign in as `anguisheh1@gmail.com`. **GSC is `sc-domain:bashsnippets.xyz` at `authuser=0`** —
`authuser=1` on that Chrome profile is `travisofgilligans@gmail.com` and has no access to the
property. Bing property is `https://bashsnippets.xyz/`.

Two specific questions to answer, not just numbers to copy:

- **Did the 12 restored pages get recrawled by Bing?** Site Explorer → filter *URLs with NOINDEX
  tag* should still say *No data available*, and URL Inspection on `/snippets/create-dated-folder`
  should still say *Indexed successfully*.
- **Does the product path convert at all?** `toolkit_cta_view` vs `toolkit_cta_click` vs
  `toolkit_purchase_click`, split by `placement`. If clicks are ~0 across thousands of views, the
  problem is the CTA, not the price — and 2.1 was the wrong lever.

If the `.html` share is still ~25 %, the 308 redirects need a second look; the upstream cause
(18 stale dev.to `canonical_url` values) was already repaired via the dev.to API on 2026-08-31.

---

## Standing rules

- **Do not re-add ads or affiliates.** `CLAUDE.md → Monetization` says so; this is the note that
  explains why. Removed 2026-09-01 in `1a2cf79`.
- **Do not spend GSC "Request indexing" quota on snippet pages.** Google has never served a content
  page from this site. The quota is better spent on tools and guides, or not at all.
- **Every deploy ends with `npm run indexnow`.**
- **Cross-posting stays shelved** until the 2.4 re-check says otherwise.
