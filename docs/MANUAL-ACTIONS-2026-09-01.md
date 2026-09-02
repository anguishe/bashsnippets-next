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

**Inbox audited 2026-09-01 — there is no affiliate income to collect.** Searched
`anguisheh1@gmail.com` four ways:

| Search | Result |
|---|---|
| `from:(impact.com OR impactradius.com OR pxf.io)` | **11 emails, zero earnings.** All program marketing, contract-terms changes, and the May 4 *"Welcome Aboard!"* enrolment. |
| `from:digitalocean.com (referral OR earned OR credit OR payout OR commission)` | **11 emails, zero earnings.** All onboarding and newsletters. |
| `from:(paypal.com OR tipalti.com OR payoneer.com OR wise.com)` + payout subjects | **0 results.** No processor has ever sent this address a payment. |
| broad `payout / you earned / commission earned / deposit` | Only Bugcrowd and unrelated mail. |

So no payout was ever *issued*. One caveat before calling the balance zero: both programs hold
earnings below a payout threshold without emailing anything, so a few dollars could be sitting in
either dashboard silently. Email proves nothing was *sent*; only the dashboards prove nothing is
*owed*. Given the site never ranked on Google and the affiliate boxes sat on pages with 737 total
Bing impressions in six months, a genuine zero is the likely answer.

One unrelated thing the search turned up: **DigitalOcean account credit on the BashSnippets team
expired 2026-08-03** (their "Credit is expiring soon" mail, Jul 3). That was promotional credit
DigitalOcean gave you, not affiliate earnings, and it is already gone.

**No action required.** Neither program obliges you to keep links live. If you want certainty on
the balance rather than the payout, it is one login each.

### 1.7 ✅ Buttondown — LIVE 2026-09-01

**Resolved 2026-09-01.** Account approved, username `anguishe`, and
`NEXT_PUBLIC_BUTTONDOWN_USERNAME=anguishe` set in Vercel.

The value is the **bare username** — the component interpolates it into
`https://buttondown.com/api/emails/embed-subscribe/${USERNAME}`, so a full profile URL builds a
404. Verified both: bare username returns 302, full URL returns 404.

Setting the variable alone changed nothing, exactly as warned — `NEXT_PUBLIC_` vars are inlined at
build time, so the form stayed invisible until the next push forced a rebuild. Verified live after
that build: renders on snippets, tools and guides, with `action="https://buttondown.com/api/emails/embed-subscribe/anguishe"`.

**The kill-signal clock starts 2026-09-01.** The pivot set it at five weeks of email capture on
every content page, zero signups meaning demand failure. Those five weeks begin now, not whenever
the plan was written, because until this build there was no form on any page to sign up on. First
honest read: **~2026-10-06**.

The steps below are kept as the record of what was done:

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

### 1.9 ✅ GA4 — internal traffic filter — DONE, activated 2026-09-01

Flagged in week-1 §5 and still not done. 89 of 116 sessions are Direct with no filter configured,
so an unknown share of your only analytics baseline is you and Vercel previews.

**Menu path verified in the live console 2026-09-01** — the version first written here was wrong
about step 4 (there is no "Data Settings" menu; filters live under *Data collection and
modification*). Property **BashSnippets**, account 393326874, property 535459693. Stream
`bash-snippets`, stream ID **14771755386**, measurement ID **G-6B01TGE8XS**.

#### Your addresses, resolved 2026-09-01

`curl -s ifconfig.me` on this box returns an **IPv6** address, because the machine prefers IPv6 and
that is what reaches Google. You have both, and **you need a condition for each**:

| | Address | Value to enter |
|---|---|---|
| IPv4 | `98.183.50.212` (`curl -s -4 ifconfig.me`) | `98.183.50.212/32` |
| IPv6 | `2600:8807:8783:b900::7428` (`curl -s -6 ifconfig.me`) | `2600:8807:8783:b900::/64` |

**Do not enter the full IPv6 address.** `ip -6 addr show wlan1` reports it with
`valid_lft 79353sec` — about 22 hours. It is leased, and the interface-identifier half (`::7428`)
can change when that lease renews, at which point a `/128` rule silently stops matching and you are
back to unfiltered data with no warning and nothing visibly broken. The `/64` your ISP delegates
(`2600:8807:8783:b900::`) is the stable half, and a `/64` is one subnet — it will not catch anyone
else.

(Privacy extensions are **off** here — `net.ipv6.conf.wlan1.use_tempaddr = 0` — so this is not
RFC 4941 address rotation. Lease renewal on its own is reason enough to match the prefix.)

Chrome on this machine will usually reach Google over IPv6, so **the IPv6 condition is the one that
will actually fire.** The IPv4 one covers the times v6 is not available.

#### Steps

1. https://analytics.google.com → **Admin** (bottom left) → under **Property settings** expand
   **Data collection and modification** → **Data streams**
2. Click the **bash-snippets** stream → scroll to the **Google tag** panel → **Configure tag
   settings** → **Show more** at the foot of the *Settings* card → **Define internal traffic**
3. **Create** (top right). The form is: *Rule name*, *traffic_type value*, then one
   *Match type* / *Value* row with an **Add condition** button beneath it.
4. **Rule name:** `Travis home`. Leave **traffic_type value** as the prefilled `internal`.
5. First condition — leave match type on its default, **IP address is in range (CIDR notation)**
   (placeholder reads `Example: 192.0.2.0/24`) — and enter:

   ```
   2600:8807:8783:b900::/64
   ```

6. Click **Add condition**, keep the same CIDR match type, and enter:

   ```
   98.183.50.212/32
   ```

7. **Create** (top right; it stays greyed out until the name and both values are filled)
8. Then **Admin → Data collection and modification → Data filters** → open the
   **Internal Traffic** filter → state *Testing* → **Active** → Save

Verified in the console 2026-09-01: **there are no internal traffic rules yet** — the panel reads
*"No rules yet. Click Create to begin."* This creates rather than overwrites.

**Re-check if your ISP hands you a different prefix.** `curl -s -6 ifconfig.me` should keep starting
with `2600:8807:8783:b900`. If it stops doing that, the rule has quietly stopped matching.

**ACTIVATED 2026-09-01.** Verified in the console the same day, not just reported:

- Rule `Travis Home` exists, `traffic_type` = `internal`, with **both** conditions saved on
  *IP address is in range (CIDR notation)* — `2600:8807:8783:b900::/64` and `98.183.50.212/32`.
- **Admin → Data filters → Internal Traffic → Exclude → `Active`.** Not left on *Testing*, which is
  the usual way this silently does nothing.

**2026-09-01 is now a hard break in the GA4 series.** Sessions before and after are not comparable:
everything before includes Travis and Vercel previews, everything after excludes them. The 116
sessions / 3 months baseline is a *pre-filter* number. Expect the post-filter rate to be lower and
do not read the drop as lost traffic — it is the filter working. §2.4 must state which side of
2026-09-01 any figure comes from.

Loose end, not chased: the Google tag panel shows *Tag quality: Needs Attention — 1 issue*. Could
not open the detail (the overlay is not reachable from the accessibility tree). Almost certainly
the same "no data received in 48 hours" condition documented above rather than a distinct fault,
but that is an assumption, not a verified finding. Worth one click next time someone is in there.

> ⚠️ **Read this before you trust any GA4 number.** The stream currently shows the banner *"Data
> collection isn't active for your website."* Checked 2026-09-01: this is **not a broken tag.**
> The gtag script loads on the live site, `G-6B01TGE8XS` resolves in the HTML, and `gtag('js')` /
> `gtag('config')` run unconditionally. GA4 has simply received nothing for 48 hours because
> nobody visited — the Home report for the last 7 days shows **1 active user, 9 events, 1 new
> user**, with a single blip around Aug 26–27 and flat zero after. Google shows that banner
> whenever a property goes 48 hours without a hit.
>
> The consequence for §2.4: `toolkit_cta_view` / `toolkit_cta_click` will have almost no volume to
> read on 2026-09-22. Treat a zero there as "no traffic", not as "the CTA does not convert" —
> those are different findings and only one of them justifies changing the CTA.

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
   → expect 1, the same as before the migration.

⚠️ **Correction to this item as first written.** It claimed the migration would make the guide
"pick up `ToolkitCTA` and `EmailCapture` from the shared layout for free". That is wrong — checked
against production 2026-09-01, the JSX guide already renders `ToolkitCTA` (1 occurrence, identical
to the migrated guides), because `src/app/guides/layout.tsx` wraps the whole `/guides` route
segment regardless of how each page renders its body. `EmailCapture` is 0 on *every* guide, JSX and
MDX alike, for the unrelated reason in §1.7.

So the real value here is narrower than advertised: one content pipeline instead of two, and a
`CLAUDE.md` that stops describing guides in a way that is false for one of the five. There is **no
functional gain and no revenue-path gain** — weigh it against writing the guides in §2.3, which is
the growth lever. Its cost is not trivial either: 25 `<ScriptEntry>` invocations (several taking
JSX in the `description` prop) and 7 `<SectionDivider>`s must move to `src/components/` and be
registered in `mdxComponents`, then 1254 lines transcribed with real drift risk.

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

**Demand was checked in Bing WMT on 2026-09-01, and it rewrote this list.** 6M: 737 impressions,
14 clicks, **409 keywords**. What the data actually says:

- **Biggest cluster on the property is strict mode + `trap ERR`** — ~34 impressions across 11
  queries, several at position 1.75–3.00: *"bash safe script template set -eeuo pipefail cleanup
  trap examples"*, *"bash trap err set -euo pipefail subshell functions diagnostic handler"*,
  *"how set -eeuo pipefail changes error handling in bash"*, *"bash trap with local variable
  unbound staging"*, *"bash manual trap err pipefail official"*. **✅ Written 2026-09-01 —
  `/guides/safe-bash-script-template`.**
- **The PATH/env candidate is dead.** *"why does my script work interactively but fail in cron"* —
  PATH, environment, TTY, locale — has **zero** query volume here. Not one PATH or env query
  appears in 409. It was a plausible guess and it was wrong; do not write it on instinct.
- **The hung/stuck job — ✅ written 2026-09-01, `/guides/diagnose-a-hung-process`.** *"i need the
  exact cli commands to check for a hung job"* sits at **position 1.00**, with *"chceking if a url
  is unreachable or timed out in bash"* adjacent at 7.33. Kept deliberately clear of the cron
  guide: that one is *prevention* (timeout, flock, retry), this is *diagnosis on the morning it
  already hung*. They cross-link both ways.
- **Also open:** service watchdog — *"set cron job to check service status and restart if not
  running"* (pos 2.00), *"bash script check service status and restart if down"*, *"bash command to
  monitor and restart a service"*, *"bash script to detect service names and restart
  automatically"*. ~10 impressions, and only the `restart-service-if-stopped` snippet serves it.
- Already covered, do not duplicate: the flock/cron-overlap cluster (~31 impressions) belongs to
  the cron guide; the CI cluster belongs to the CI/CD guide.

**Why guides and not more snippets** — AI Performance, same day: 103 citations total, of which
`/guides/bash-scripts-that-survive-cron` has **43** and `/guides/bash-scripting-for-ci-cd-pipelines`
has **10**. Two guides = 53 of 103. Snippets earn 2–8 each. A guide is worth roughly **7x a
snippet** on the citation channel.

⚠️ **`scripts/generate-sitemap.mjs` hardcodes guide URLs.** Snippets and tools are generated from
their registries; guides are a literal list. A new guide is silently absent from the sitemap until
you add a line there. Sitemap is **63** as of the hung-process guide.

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
