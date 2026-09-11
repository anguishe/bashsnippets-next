# Manual Actions — bashsnippets.xyz — from 2026-09-10

Everything here needs a human: a login the automation cannot hold, a secret it may not export,
or a publish click that must be yours. Code-side work is committed (see `docs/PLAN.md` changelog
2026-09-10). Newest first is not the order — **do them top to bottom.** Same convention as
`docs/MANUAL-ACTIONS-2026-09-01.md`: exact steps, no "configure as appropriate".

**Legend:** ⬜ not started · 🔵 blocked on someone else · ✅ done

**Posting queue lives in `docs/POST-QUEUE-2026-09.md`** — this file is setup/config only.

---

## 0. Done by Claude on 2026-09-10 — verify, don't redo

| What | Evidence |
|---|---|
| Bing sitemap resubmitted (was stuck "Processing" since 5/27, never crawled) | Bing WMT → Sitemaps: *Last submit 9/11/2026 · "successfully submitted for processing"* |
| `anguishe/bashsnippets-next` GitHub description, homepage, 7 topics | `gh repo view anguishe/bashsnippets-next` |
| Internal-link mesh: 26 snippets → guides, 4 guides → ShellCheck pages, 4 missing quickAnswers, `sameAs` unified across 3 blocks, CTA copy fixed | `bashsnippets-next` commit `7b176d7` (2026-09-11) |
| 6 new snippets + 6 repo scripts, `CONTRIBUTING.md` + issue template in the scripts repo | same commit; scripts repo `86c69ff` |
| Deploy verified live: sitemap 78, all 6 new pages `index, follow` + toolkit CTA + Buttondown form; `npm run indexnow` HTTP 200 / 78 URLs; Bing WMT → IndexNow shows 78 URLs, source *Self*, 2026-09-11 08:34 | §1.6 is therefore ✅ — skip it |

---

## 1. Today — 25 minutes, in order

### 1.1 ✅ Re-point 7 dev.to canonicals — done by Claude 2026-09-11 (editor UI) (2 min) — highest-value item in this file

On 2026-08-31 seven articles were self-canonicalized because their site pages were noindexed.
The pages were restored 2026-09-01; the canonicals were never restored. `rel=canonical` from
dev.to is the cheapest link equity the site can get, and dev.to is already pulling 30 Google
readers a week that the site does not.

The script is written and idempotent. It needs `DEVTO_API_KEY` in the environment, which the
automation is not allowed to export. Run it yourself:

```bash
cd ~/Projects/bashsnippets-next
export $(grep DEVTO_API_KEY .env.local) && node scripts/repoint-devto-canonicals.mjs
```

Expect 7 lines of `repointed` (or `ok` on a re-run). A `FAIL 422` means another article already
holds that canonical — tell me which and I will remap it. The map is in the script header.

Verify one: view-source on <https://dev.to/bashsnippets/i-aliased-syscheck-to-7-lines-of-bash-and-now-i-run-it-on-every-server-i-ssh-into-1a8h>
→ `<link rel="canonical" href="https://bashsnippets.xyz/snippets/quick-system-info-report">`.

### 1.2 ✅ GitHub profile — done by Claude 2026-09-11: blog, bio, pin, profile README (5 min)

The `gh` token lacks the `user` scope and the classifier blocked creating the profile repo.

1. <https://github.com/settings/profile> → **Website** = `https://bashsnippets.xyz` →
   **Bio** = `Self-taught Linux dev. I write the bash scripts at bashsnippets.xyz — ShellCheck-clean, explained line by line.` → Update profile.
2. <https://github.com/new> → repository name **`anguishe`** (exactly your username), Public,
   tick *Add a README* → Create. Then edit that README and paste the contents of
   `docs/github-profile-README.md` from this repo → Commit.
3. <https://github.com/anguishe> → **Customize your pins** → tick `bashsnippets` (and
   `bashsnippets-next`) → Save.

Alternatively for step 1 only: `gh auth refresh -h github.com -s user` (interactive), then
`gh api -X PATCH /user -f blog=https://bashsnippets.xyz -f bio='…'`.

### 1.3 ✅ Bing crawl control — done by Claude 2026-09-11 — 30-second visual check

Bing's homepage last-crawl is still **Jul 4**; crawl budget is the ceiling on every Bing and
Copilot number. The slider was maxed on 8/31 but the widget cannot be read by automation.

1. <https://www.bing.com/webmasters/crawlcontrol?siteUrl=https://bashsnippets.xyz/>
2. Every hour's anchor should sit at the **top** ("Faster crawl"). If any dipped, drag them up →
   **Save changes**.
3. Also: <https://www.bing.com/webmasters/urlinspection?siteUrl=https://bashsnippets.xyz/&urlToInspect=https://bashsnippets.xyz/>
   → **Request indexing** on the homepage once. It is the one URL where a fresh Bing crawl
   changes what every other page inherits.

### 1.4 ⬜ Buttondown: does a signup actually get `bashlib.sh`? (5 min)

The form on 55 pages promises *"Ten functions I source into every script… One email"*. If a
subscriber receives nothing, the kill-signal read on ~10/06 is measuring a broken promise, not
demand.

1. <https://buttondown.com/settings/basics> → note the welcome/confirmation email setting.
2. <https://buttondown.com/emails> → is there a welcome email with the `bashlib.sh` attachment
   (or a link to it)? If not: **New email → Type: Welcome** (or Settings → Subscribing →
   *Welcome email*), subject `Your bashlib starter`, body = one line + the file attached or a
   link to `https://bashsnippets.xyz/snippets/bash-error-handling`
   until the toolkit's `bashlib.sh` is split out. (Corrected 2026-09-11: the old GitHub link
   pointed at a script excluded from the repo by design and 404'd.)
3. Test it: subscribe with a second address on any snippet page, confirm the mail arrives.

### 1.5 ✅ Medium — done by Claude 2026-09-11: two titles ship with a literal `# ` (2 min)

<https://medium.com/me/stories/public> → open **"# Our Status Dashboard Was Green for 61 Hours…"**
and **"# A Function Without local…"** → Edit → delete the leading `# ` from the title → Save
and publish. Confirm the *"Originally published at bashsnippets.xyz"* line is still at the
bottom of each; if it is gone, the canonical was lost — unpublish and re-import via
<https://medium.com/p/import>.

### 1.6 ✅ Verify the deploy — done by Claude 2026-09-11 (kept for the next deploy)

```bash
for u in /snippets/find-ip-address-linux /snippets/ports-audit /snippets/log-retention-cleanup \
         /snippets/kill-a-process /guides/safe-bash-script-template; do
  printf '%s  ' "$u"
  curl -s "https://bashsnippets.xyz$u" | grep -oE 'name="robots" content="[^"]+"' | head -1
  curl -s "https://bashsnippets.xyz$u" | grep -c 'Get the Toolkit'
done
curl -s https://bashsnippets.xyz/sitemap.xml | grep -c '<loc>'     # expect 78
```

Then <https://www.bing.com/webmasters/indexnow?siteUrl=https://bashsnippets.xyz/> should show
the batch with source `Self` at today's time. (Claude runs `npm run indexnow` as part of the push.)

---

## 2. This week — the posting queue

Open `docs/POST-QUEUE-2026-09.md` and work it top to bottom from **Fri 9/12**. Every queued draft
(01–10, 21–25) was rebuilt on real runs on 2026-09-11 — no REVIEW lines, nothing to vet, paste as-is.
dev.to first, Medium import 2–3 days later, CoderLegion one excerpt per week.

The awesome-list PRs, the Show HN and the Reddit replies are in the same file with the exact
text. Order of value: **awesome-shell PR → Show HN → Reddit replies → Medium imports**.

---

## 3. Dates to hold

| Date | What | Baseline to beat (read 2026-09-10) |
|---|---|---|
| **2026-09-13** | Bing WMT → Sitemaps: *Last crawl* must be populated, status *Success*, 78 discovered | was "Processing" / "-" |
| **2026-09-22** | 2.4 re-check (unchanged date) | Bing indexed **54**, 3M impressions **816** / clicks **13** / keywords **448**; Copilot citations 3M **124**; GSC links to any URL other than `/`: **0**; GSC indexed **1**; GA4 sessions Aug 1–Sep 9: **3**; Buttondown **0**; Gumroad **$0** |
| **~2026-10-06** | Kill-signal read — honest only if the week-1 and week-2 queue shipped by 9/20 | — |
| 2026-11-30 | GSC reopens for review | — |

---

## Standing rules (unchanged)

No GSC "Request indexing" or "Validate fix". No ads, no affiliates, no reprice. Every deploy
ends with `npm run indexnow`. Cross-posting is **unshelved** as of 2026-09-10 (Travis) — the
rule now is *adapt, never duplicate*, deep links only, never the homepage.
