# PLAN.md — bashsnippets.xyz course of action (living document)

**Read this first in every session.** It answers "where are we, what is next, and why" so nobody
has to reconstruct it from git log and five dated audits again. Update the status board and the
changelog at the end of every session that ships or decides anything.

Last updated: **2026-09-01 (late evening)**. Owner: Travis. Maintained by Claude Code.

Companion files: `CLAUDE.md` (architecture + rules), `CONTRIBUTING.md` (workflow),
`OWNERSHIP.md` (accounts), `docs/MANUAL-ACTIONS-2026-09-01.md` (human steps with evidence),
`docs/INDEXING-AUDIT-2026-09-01.md` (current evidence base). Everything in `docs/archive/` is history.

---

## 1. The goal and the model

Build search and AI-citation traffic to bashsnippets.xyz and turn it into income from **one owned
product**: the Production Bash Toolkit ($9, Gumroad). No ads, no affiliates — both removed
2026-09-01. Email capture (Buttondown) on every content page is the demand thermometer.

**The constraint is demand, not price or plumbing.** As of 2026-09-01 there has never been a paying
customer at any price (one $0.00 self-test order). GA4 shows 116 sessions in three months, ~27 not
Travis. Google has never served a content page. Bing and Microsoft Copilot are the only channels
with measured, growing signal.

**Kill signal (fires ~2026-10-06):** five weeks of email capture on every content page with zero
signups = demand failure → freeze the site at 1 h/month and move hours to a business with customers.
Secondary: fewer than 15 Gumroad outbound clicks in six weeks across 63 pages. The clock started
2026-09-01, the first day the form actually rendered.

---

## 2. Status board

| # | Item | State | Evidence / where |
|---|---|---|---|
| 1.1–1.3 | Deploy de-monetization, verify live, IndexNow | ✅ 2026-09-01 | MANUAL-ACTIONS §1 |
| 1.4 | Delete dead AdSense env vars in Vercel | ✅ 2026-09-01 | Travis confirmed |
| 1.5 | Close AdSense | ✅ 2026-09-01 | irreversible, intended |
| 1.6 | Affiliate accounts | ✅ decided: leave open, nothing to collect | inbox audit, MANUAL-ACTIONS §1.6 |
| 1.7 | Buttondown live, form rendering on 55 pages | ✅ 2026-09-01 | `NEXT_PUBLIC_BUTTONDOWN_USERNAME=anguishe` |
| 1.8 | Push 5 missing scripts to the script repo | ✅ 2026-09-01 | repo `9fbe0de`, 36/38 scripts (2 excluded by design) |
| 1.9 | GA4 internal-traffic filter | ✅ Active 2026-09-01 | hard break in the GA4 series that day |
| 2.1 | Reprice $9 → $29 | ❌ **KILLED** by Travis 2026-09-01 | $9 stays. Do not reopen. |
| 2.2 | Migrate `bash-scripts-every-sysadmin-needs` JSX → MDX | ⏸ **PARKED**, reconfirmed 2026-09-01 | tidiness only; no traffic or revenue effect |
| 2.3a | Guide: safe bash script template (strict mode + trap ERR) | ✅ 2026-09-01 | `/guides/safe-bash-script-template` |
| 2.3b | Guide: diagnose a hung process | ✅ 2026-09-01 | `/guides/diagnose-a-hung-process` |
| 2.3c | Guide: service watchdog (check + restart) | ✅ 2026-09-01 | `/guides/auto-restart-linux-service` — built on the Aug-6 lightdm incident + today's wpa_supplicant kills |
| 2.3d | Guide: list open ports on Linux (definitive) | ✅ 2026-09-01 | `/guides/open-ports-linux` — opens on the real port-3000 / docker-proxy finding on this box; root output pasted by Travis |
| 2.3e | Per-code ShellCheck pages (SC2086 …) | ⬜ **next** | §4 |
| 2.4 | Three-week re-check against baselines | ⏳ due **2026-09-22** | §3 baselines, MANUAL-ACTIONS §2.4 |
| — | Docs baseline (this file, README, CLAUDE, CONTRIBUTING, OWNERSHIP, archive) | ✅ 2026-09-01 | this commit |
| — | Homepage links all 7 guides (was 4) | ✅ 2026-09-01 | `homeGuides` in `src/app/page.tsx` |
| — | Competitor SERP teardown per head cluster | 🔒 **deferred by Travis** until all fixes + queued content ship | §5 |
| — | Cross-posting (20 queued + 10 drafts) | 🔒 shelved until 2.4 says otherwise | `docs/CROSS-POST-BACKLOG.md` |
| — | YouTube Shorts engine (`~/Projects/bashsnippets-content-engine`) | ⏸ parked by Travis 2026-09-01 | §6 |
| — | Google / GSC work | 🔒 closed until **2026-11-30** | zero earned links gates everything there |

---

## 3. Measured baselines (all read live from the consoles on 2026-09-01)

| Metric | Value | Source |
|---|---|---|
| Bing Site Explorer indexed | 52 (0 errors, 14 excluded) | Bing WMT |
| Bing search, 6 M | 715 impressions / 13 clicks / 396 distinct queries | Bing WMT Search Performance (query table sums to 594 imp) |
| Copilot + partner citations, 6 M | 101–111 (sampled) across 13 pages; cron guide 43, CI guide 10 | Bing WMT AI Performance |
| Top grounding query | "cron jobs serverless timeouts retries gotchas" — 31 citations, 13.08 % share | AI Performance |
| Legacy `.html` share of Bing impressions | 24.6 % — should **fall** as Bing reprocesses the repaired dev.to canonicals | Search Performance → Pages |
| GSC | 1 indexed (homepage), 71 crawled-not-indexed, 26 discovered-not-indexed; 4 queries, all brand | GSC `sc-domain`, authuser=0 |
| GA4, Jun 1 – Sep 1 | 116 sessions (Direct 89, Organic Social 12, Referral 11, Organic Search 3, AI Assistant 1) — **pre-filter** | GA4 535459693 |
| Backlinks | 137, ~100 % self-posted UGC, ~100 % to `/`; zero earned | GSC + Bing |
| Sitemap / llms.txt | 65 URLs / 38 snippets + 12 tools + 9 guides | repo |
| Gumroad | 0 paying customers ever | Gumroad inbox |
| Email signups | 0 (form live since 2026-09-01) | Buttondown |

**Read Bing CTR correctly:** ~0 by nature. `list-open-ports-linux` has 154 impressions at position 7.6
and zero clicks — these are LLM grounding fetches, not humans. Anything this channel earns has to
live in the prose a model carries away. A guide is worth ~7× a snippet on citations.

**New GA4 events to read on 2026-09-22:** `toolkit_cta_view` / `toolkit_cta_click` (tagged `placement`:
snippet | tool | guide | home | snippets-index | tools-index) and `toolkit_purchase_click`. A zero
means no traffic, not a broken CTA — check sessions first.

### What the 396 Bing queries say (full pull 2026-09-01, clustered)

| Cluster | Queries | Impr | Avg pos | Served today by |
|---|---|---|---|---|
| **open ports / ss / netstat** | **104** | **135** | 7.3 | one snippet (`list-open-ports-linux`) |
| strict mode / `set -euo pipefail` / trap ERR | 35 | 60 | 6.1 | guide shipped 2026-09-01 — too new to measure |
| backup / mysql / dated folder | 32 | 46 | 5.4 | 4 snippets (the only cluster with clicks: 3) |
| flock / cron overlap | 23 | 43 | 5.2 | cron guide + flock snippet |
| disk usage threshold alert | 23 | 40 | 5.7 | 2 snippets |
| ShellCheck SC codes (2086, 2046, 2063, 2115, 2154, 2034, 2016) | 17 | 35 | 6.0 | decoder tool only |
| brand / "copy-paste bash library" | 23 | 34 | 4.9 | homepage (6 of the 13 clicks) |
| CI/CD GitHub Actions | 22 | 29 | 5.4 | CI guide |
| service watchdog (check + restart) | 13 | 19 | 5.3 | one snippet (`restart-service-if-stopped`) |
| system info report | 8 | 13 | 4.2 | one snippet |
| SSL cert expiry | 6 | 12 | 5.3 | one snippet |
| kill process by name | 11 | 12 | 7.6 | one snippet |
| hung job / timeout | 7 | 10 | 3.5 | guide shipped 2026-09-01 |
| for loop / read file / glob | 5 | 11 | 5.7 | 2 snippets |
| website uptime check | 5 | 7 | 6.9 | one snippet |

Dead on arrival, do not write on instinct: "works interactively, fails in cron" (PATH/env) — zero
queries in 396. Note the name collision: "how to install bash-snippets" is a different open-source
project (`alexanderepstein/Bash-Snippets`); those 2 clicks are not ours to keep.

---

## 4. Content queue — in order, with the evidence for each

Write guides in the cron-guide pattern: an operational failure question answered in prose, reasoning
in the text not the code block, cross-linked both ways with the snippets it supersedes. Every guide:
4 files (`src/content/guides/<slug>.mdx`, `src/app/guides/<slug>/page.tsx`, the `guides` array in
`guides/page.tsx`, a line in `scripts/generate-sitemap.mjs`) **plus** `homeGuides` in `src/app/page.tsx`
and `public/llms.txt`. Then `npm run indexnow -- <url>`.

1. ✅ **Service watchdog guide** (2.3c) — shipped 2026-09-01 as `/guides/auto-restart-linux-service`. Was: 13 queries / 19 impressions; "set cron job to check service
   status and restart if not running" sits at position 2.00; "how to monitor a service and restart if
   stopped in linux" at 2.00. Only `restart-service-if-stopped` serves it. Cover: `systemctl is-active`
   vs `is-failed`, why `Restart=on-failure` in the unit beats a cron poller and when it doesn't,
   detecting a hung-but-running service (link the hung-process guide), alert dedup, the flock guard.
2. ✅ **Definitive "list open ports on Linux" guide** (2.3d) — shipped 2026-09-01 as `/guides/open-ports-linux`. Was: **26 % of every query on the property**,
   avg position 7.3, zero clicks, one snippet. Sub-intents present in the data: without `netstat`,
   without root/sudo, with the process/PID, a specific port (`ss -tlnp | grep :80`), export to CSV,
   "what the ports mean", listening vs established, PostgreSQL/localhost-only. This is the largest
   single content opportunity the numbers show.
3. **Per-code ShellCheck pages** (2.3e). 17 queries / 35 impressions across SC2086 (12 imp), SC2046
   (9), SC2063 (3), SC2115 (3), SC2154 (2), SC2034 (1), SC2016 (1). The decoder tool ranks 5–9; a
   page per code with the rule, why it bites in production, before/after fix and "when to disable it"
   is citable prose. Proposed URL shape `/shellcheck/<code>` with the decoder as hub; data source is
   `src/components/tools/shared/shellcheckData.ts`. Start with the 7 that have demand, not all 300.
4. Refresh, not new: `list-open-ports-linux` and `restart-service-if-stopped` get a "Read the full
   guide" block once 1–2 ship; `dateModified` on 16 snippets still reads 2026-06-03.

Parked: the JSX→MDX migration (2.2). Shelved: cross-posting (10 drafts carry `REVIEW: incident
dramatized` markers — Travis vets each war story before any of them post).

---

## 5. Deferred by decision

- **Competitor teardown.** Travis, 2026-09-01: last, after every fix and the queued content ship.
  When it runs: derive the top 10 from live Bing and Google SERPs per head cluster (open ports, strict
  mode, flock/cron, disk threshold, ShellCheck codes, service watchdog), table stakes vs gaps vs what
  we own. Tools: all organic — Bing WMT Keyword Research, autocomplete, and the free-tier Ahrefs
  account reachable from the anguisheh1 Chrome profile.
- **Google.** Closed until 2026-11-30. Parity with Bing is worth ~24 clicks/month and both readings
  gate on zero earned links. Do not spend "Request indexing" quota on snippets.
- **A second product, an MCP server, buying a .com, a fifth audit.** Killed 2026-08-31.

---

## 6. Repo family

| Repo / dir | What | State 2026-09-01 |
|---|---|---|
| `~/Projects/bashsnippets-next` (`anguishe/bashsnippets-next`) | the site | live = HEAD, clean |
| `~/Projects/bashsnippets` (`anguishe/bashsnippets`) | public MIT script library | 36 scripts, 0 ahead/0 behind, ShellCheck-clean. `bash-error-handling` (9 teaching blocks) and `kill-a-process` (command reference) deliberately have no script — `NO_REPO_SCRIPT` in `src/lib/snippets.ts`. Open ideas from July, never done: PR into awesome-shell / awesome-sysadmin lists, pin the repo, profile README. |
| `~/Projects/bash-snippets` (`anguishe/anguishe.github.io`) | pre-Next static site | **dead** — Pages 404, CNAME gone. 17 uncommitted June CSS tweaks stashed 2026-09-01 (`git stash list` there). Leave it. |
| `~/Projects/bashsnippets-content-engine` | YouTube Shorts render pipeline (Piper TTS + PIL + ffmpeg), own git repo | Stage C done 2026-08-12, day-01 rendered, dormant. Channel @BashSnippets: 9 subs, 9 Shorts, last upload 2026-05-09. **Parked** until the site's kill signal reads (~2026-10-06). |

---

## 7. Dates to hold

| Date | What |
|---|---|
| **2026-09-22** | 2.4 re-check: Bing indexed / impressions / citations, `.html` share, GSC indexed, GA4 sessions, CTA events by placement. Also: did Bing recrawl the 12 restored pages? |
| **~2026-10-06** | First honest read of the kill signal (5 weeks of email capture). |
| 2026-11-30 | GSC reopens for review. |
| 2027-04-30 | Domain expiry (auto-renew on). |

---

## 8. Standing rules (short form — CLAUDE.md has the spec)

- Price is **$9**. Do not reopen without Travis raising it.
- **No ads, no affiliates**, ever. `ToolkitCTA` via layouts only.
- **Every deploy ends with `npm run indexnow`.** Submit the sitemap, then confirm in Bing WMT → IndexNow.
- Do not spend GSC "Request indexing" quota on snippet pages. Do not click "Validate fix".
- Do not buy a .com and 301. The deficit migrates with you.
- Cross-posting stays shelved until 2.4. Every one of the 10 drafts needs Travis to vet the war story first.
- New guide = 4 files + `homeGuides` + `llms.txt`. The sitemap generator hardcodes guide URLs.
- GSC on Browser 4 is `authuser=0`. Bing WMT and every other console are on the same profile.

---

## 9. Docs map

| File | Role |
|---|---|
| `docs/PLAN.md` | this file — status, baselines, queue, decisions |
| `CLAUDE.md` | architecture, pipelines, brand + voice, SEO requirements |
| `CONTRIBUTING.md` | practical add-a-snippet / tool / guide workflow |
| `README.md` | repo front page |
| `OWNERSHIP.md` | every account and ID |
| `docs/MANUAL-ACTIONS-2026-09-01.md` | human-only steps with exact instructions and evidence (Phase 1 all closed; 2.4 open) |
| `docs/INDEXING-AUDIT-2026-09-01.md` | the correction of the 8/28 audit; current evidence base |
| `docs/CROSS-POST-BACKLOG.md` + `docs/cross-posts/` | shelved syndication queue and 10 drafts |
| `docs/archive/AUDIT-2026-06-21.md` | June verification audit (grade B) — history |
| `docs/archive/audit-2026-06-25/` | June Ahrefs-era FULL-AUDIT-REPORT + ACTION-PLAN + 7 live HTML snapshots — history |
| `docs/archive/SETUP-GUIDE-2026-06-03.md` | Cursor-era Claude Code setup guide — obsolete |
| `docs/archive/GSC-INDEXING-PLAYBOOK-2026-07-29.md`, `GSC-PRIORITY-URLS-2026-07-29.txt`, `INDEXING-FIX-CHANGES-2026-07-29.txt` | July "request indexing" playbook — **contradicted** by today's standing rules; history |
| `docs/archive/INDEXING-AUDIT-2026-08-28.md` | the audit whose Bing premise was disproven — read only with the banner |
| `docs/archive/PLAN-2026-06-14-sitemap-hardening.md` | executed June plan |
| `docs/archive/WEEK-1-TODO-2026-08-31.md` | the week-1 checklist, fully resolved |
| `~/Downloads/MANUAL-ACTIONS-MASTER.md` | cross-site (3 sites) manual-actions master, outside the repo |

`REPO-STATE.md` was deleted 2026-09-01 (a 38 KB June inventory that claimed 28 snippets / 9 tools / 2
guides against a reality of 38 / 12 / 7). `CLAUDE.md` is the architecture truth; do not regenerate it.

---

## 10. Commit-history notes (carried over from REPO-STATE.md)

Two pushed commits carry messages that do not fully describe themselves. Recorded here rather than
rewritten, because rewriting would have invalidated commit IDs other docs cite.

- **`1569064`** — subject says only "the safe bash script template". It also contains a substantial
  fix to `.claude/skills/content-standards/SKILL.md`, which until then still mandated `<AffiliateBox>`
  and described the retired iframe architecture. Swept in by `add -A`. See `git show 1569064 --stat`.
- **`2640fe5`** — subject reads `docs: GA4 internal traffic filter активated 2026-09-01, verified`.
  The first five characters of "activated" are Cyrillic homoglyphs emitted when the message was
  generated. Cosmetic; contents correct. Travis chose not to force-push over it.

---

## 11. Changelog

- **2026-09-01 (late, 2)** — Shipped 2.3d: `/guides/open-ports-linux` (~3.6k words; every command run here as non-root with the two root blocks pasted by Travis; `ports-audit.sh` ShellCheck-clean, diff/alert path exercised with a real 8099 listener). `list-open-ports-linux` snippet cross-links it. Sitemap 65. Next: 2.3e per-code ShellCheck pages.
- **2026-09-01 (late)** — Shipped 2.3c: `/guides/auto-restart-linux-service` (3.5k words, script ShellCheck-clean and every branch exercised live on this box; opens on the real Aug-6 lightdm/ollama GPU race and today's wpa_supplicant SIGKILLs from the journal). `restart-service-if-stopped` snippet now links to it. Sitemap 64. Next: 2.3d open-ports guide.
- **2026-09-01 (evening)** — Docs baseline: created this file; rewrote `README.md`, `OWNERSHIP.md`,
  `.env.local.example`; fixed stale claims in `CLAUDE.md`, `CONTRIBUTING.md`, both skills, `llms.txt`;
  archived 9 superseded docs to `docs/archive/`; deleted `REPO-STATE.md`, the stale IndexNow key file
  and `src/types/adsense.d.ts`. Homepage now links all 7 guides. Pulled all 396 Bing queries and
  clustered them (§3). Travis decisions recorded: 2.2 stays parked, competitor work last, YouTube
  parked, all three queued content items approved.
- **2026-09-01 (day)** — Reverted the 12-page noindex prune; ToolkitCTA on 55 pages; ads + affiliates
  removed; AdSense closed; Buttondown live; GA4 filter active; 5 scripts pushed; two guides written;
  reprice killed; sitemap 63. Commits `eb8bdf5` … `568003f`.
- **2026-08-31** — Strategy pivot (ads dead, product-first); real author identity; dev.to canonicals
  repaired; 10 cross-post drafts written and shelved.
