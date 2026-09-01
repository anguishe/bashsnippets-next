# BashSnippets — Cross-Post Backlog & Manual Config

Generated 2026-08-31. Source of truth for *posted* = the `canonical_url` field on the 37 live
dev.to articles (dev.to public API, `username=bashsnippets`). Each canonical maps 1:1 to a site page,
so anything in the sitemap with no matching canonical has never been cross-posted.

## Status at a glance

| | |
|---|---|
| Indexable content URLs on site | 43 |
| Already cross-posted | 23 |
| **Never cross-posted (this file)** | **20** |
| dev.to articles live | 37 |
| dev.to canonicals still pointing at legacy URLs | **0** (all repaired 2026-08-31) |
| Drafts written and waiting to post | 10 of 20 (see `docs/cross-posts/`) |
| Medium posts (RSS shows most recent 10) | 10+ |
| CoderLegion | JS-rendered profile, not machine-countable — verify by hand |

---

## ✅ Pre-flight — COMPLETED 2026-08-31

### 1. ~~Fix 18 stale dev.to canonicals~~ — DONE

Ran `scripts/fix-devto-canonicals.mjs` with the `DEVTO_API_KEY` now in `.env.local`.
17 of 18 rewrote cleanly. The 18th (`/tools/` on article 3629119) returned
`422 Canonical url has already been taken` — another article already holds
`https://bashsnippets.xyz/tools`, so that duplicate was self-canonicalized to its own
dev.to URL instead.

**Verified: 0 stale canonicals remain across all 37 articles.** Re-run any time to confirm —
the script is idempotent and prints `ok` per article:

```bash
cd ~/Projects/bashsnippets-next
export $(grep DEVTO_API_KEY .env.local) && node scripts/fix-devto-canonicals.mjs
```

Articles it will rewrite:

| dev.to article | current canonical | becomes |
|---|---|---|
| A For Loop Skipped Every File With a Space and Called the  | `/snippets/` | `/snippets` |
| The Simplest Automated Backup That Actually Works (6 Lines | `/snippets/automated-file-backup.html` | `/snippets/automated-file-backup` |
| set -euo pipefail — the Line That Would Have Saved Me from | `/snippets/bash-error-handling.html` | `/snippets/bash-error-handling` |
| My site went down for a few hours yesterday and my users k | `/snippets/check-if-website-is-up.html` | `/snippets/check-if-website-is-up` |
| I Alias This One-Liner to 'mktoday' and Use It Every Singl | `/snippets/create-dated-folder.html` | `/snippets/create-dated-folder` |
| I built a couple bash scripts this week after my server cr | `/snippets/disk-space-warning.html` | `/snippets/disk-space-warning` |
| I was killing Ollama processes the hard way for months. A  | `/snippets/kill-a-process.html` | `/snippets/kill-a-process` |
| Your Server Is at 97% CPU Right Now. Would You Know? | `/snippets/monitor-cpu-ram-usage.html` | `/snippets/monitor-cpu-ram-usage` |
| I Lost a Client's Database on a $5 VPS. Here's the 12-Line | `/snippets/mysql-database-backup.html` | `/snippets/mysql-database-backup` |
| I Aliased 'syscheck' to 7 Lines of Bash and Now I Run It o | `/snippets/quick-system-info-report.html` | `/snippets/quick-system-info-report` |
| My Nginx Died at 2 AM and Nobody Noticed for 6 Hours. Now  | `/snippets/restart-service-if-stopped.html` | `/snippets/restart-service-if-stopped` |
| I Built a Free Tools Directory for Linux Users Who Are Tir | `/tools/` | `/tools` |
| Every bash script I write starts with the same 20 lines. S | `/tools/bash-boilerplate-generator.html` | `/tools/bash-boilerplate-generator` |
| Stop Googling "what is exit code 127" There's a better way | `/tools/bash-exit-code-lookup.html` | `/tools/bash-exit-code-lookup` |
| Stop Guessing 'chmod' I Built a Free Visual Permissions Bu | `/tools/chmod-permissions-builder.html` | `/tools/chmod-permissions-builder` |
| I got tired of deploying broken cronjobs, so I built a too | `/tools/cron-job-builder.html` | `/tools/cron-job-builder` |
| The Bash $PATH Debugger I Run Whenever I Get "Command Not  | `/tools/path-debugger.html` | `/tools/path-debugger` |
| I Got Tired of Googling ShellCheck Errors. So I Built a De | `/tools/shellcheck-error-decoder.html` | `/tools/shellcheck-error-decoder` |

### 2. ~~6 dev.to articles canonicalize to pages we NOINDEXED~~ — ALREADY RESOLVED

Checked live 2026-08-31: all six already self-canonicalize to their own dev.to URLs, so
recommendation **(a)** was effectively in place before this file was written. No action taken,
none needed. Original analysis kept below for the record.

| dev.to article | canonical → noindexed page |
|---|---|
| A for Loop Skipped 23 Files and Called It a Successful Bac | `/snippets/bash-for-loop-examples` |
| A Function Without local Overwrote My Variable and rm -rf  | `/snippets/bash-functions-arguments` |
| The Alert Never Fired Because the Loop Skipped the Last Li | `/snippets/bash-read-file-line-by-line` |
| I Alias This One-Liner to 'mktoday' and Use It Every Singl | `/snippets/create-dated-folder` |
| I was killing Ollama processes the hard way for months. A  | `/snippets/kill-a-process` |
| I Aliased 'syscheck' to 7 Lines of Bash and Now I Run It o | `/snippets/quick-system-info-report` |

**Pick one per row:**
- **(a)** Remove the canonical entirely → the dev.to version becomes the indexable original. Best for the
  generic-tutorial topics we deliberately gave up on (for-loop, read-file-line-by-line, functions-arguments).
- **(b)** Re-point the canonical at a related page that is still indexable.
- **(c)** Un-noindex the page — only if you intend to invest in making it genuinely better than the SERP.

Recommendation: **(a)** for all of them. We pruned those pages precisely because we were not going to win
those queries from a 4-month-old .xyz; dev.to has the domain authority to rank them and it still links back.

---

## The 20 unposted pieces

Ordered by priority: guides (highest authority, longest) → tools (most linkable) → snippets.

### Guides — post these first (3)

#### 1. 25 Bash Scripts Every Linux Sysadmin Needs | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs
- **Canonical to set:** `https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs`
- **Meta description (reuse as the dev.to intro):**
  > The 25 bash scripts that prevent the most common server failures — disk full, SSL expiry, failed services, insecure permissions. Copy-paste ready, cron-schedulable, no installs required.
- **Suggested tags:** `bash, linux, devops, tutorial`
- **Source content:** `~/Projects/bashsnippets-next/src/app/guides/bash-scripts-every-sysadmin-needs/page.tsx`
  (this guide is pure JSX — there is **no** `.mdx` file for it, unlike guides 2 and 3)
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 2. Bash Text Processing: find, grep, sed, and awk for Logs and Config Files | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/guides/bash-text-processing
- **Canonical to set:** `https://bashsnippets.xyz/guides/bash-text-processing`
- **Meta description (reuse as the dev.to intro):**
  > The four commands that turn an unreadable log or a tree of config files into an answer — find to locate, grep to search, sed to transform, awk to summarize. The order matters, and the gotchas are the reason most one-liners do the wrong thing quietly.
- **Suggested tags:** `bash, linux, devops, tutorial`
- **Source content:** `~/Projects/bashsnippets-next/src/content/guides/bash-text-processing.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 3. Shell Scripts That Talk to APIs | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/guides/shell-scripts-that-talk-to-apis
- **Canonical to set:** `https://bashsnippets.xyz/guides/shell-scripts-that-talk-to-apis`
- **Meta description (reuse as the dev.to intro):**
  > The reliable pattern for calling an HTTP API from bash: make curl fail when the API fails, parse the response with jq instead of regex, and alert to Slack when it breaks — with a full fetch → parse → alert script.
- **Suggested tags:** `bash, linux, devops, tutorial`
- **Source content:** `~/Projects/bashsnippets-next/src/content/guides/shell-scripts-that-talk-to-apis.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

### Tools — best link magnets (3)

#### 4. Rsync Command Builder | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/tools/rsync-command-builder
- **Canonical to set:** `https://bashsnippets.xyz/tools/rsync-command-builder`
- **Meta description (reuse as the dev.to intro):**
  > A wrong rsync flag silently overwrites destination files or skips critical data with no error output. Build rsync commands visually — toggle archive, compress, delete, dry-run, SSH, and exclude patterns with a live preview.
- **Suggested tags:** `bash, webdev, tools, productivity`
- **Source content:** `~/Projects/bashsnippets-next/src/lib/tools.ts`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 5. grep Pattern Builder | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/tools/grep-pattern-builder
- **Canonical to set:** `https://bashsnippets.xyz/tools/grep-pattern-builder`
- **Meta description (reuse as the dev.to intro):**
  > A wrong grep flag silently matches the wrong files or swallows error output with no warning. Build the exact grep command you need — recursive, case-insensitive, with context lines — and get a plain-English explanation for every output.
- **Suggested tags:** `bash, webdev, tools, productivity`
- **Source content:** `~/Projects/bashsnippets-next/src/lib/tools.ts`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 6. jq Filter Builder | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/tools/jq-filter-builder
- **Canonical to set:** `https://bashsnippets.xyz/tools/jq-filter-builder`
- **Meta description (reuse as the dev.to intro):**
  > Build jq filters by clicking through a real JSON response. Generates the filter and the full curl … | jq command, with a live preview evaluated against your JSON in the browser.
- **Suggested tags:** `bash, webdev, tools, productivity`
- **Source content:** `~/Projects/bashsnippets-next/src/lib/tools.ts`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

### Snippets (14)

#### 7. Delete Old Log Files | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/delete-old-log-files
- **Canonical to set:** `https://bashsnippets.xyz/snippets/delete-old-log-files`
- **Meta description (reuse as the dev.to intro):**
  > Unmanaged log files silently fill /var/log until disk writes fail and services crash. find -mtime deletes .log files older than N days — preview with -print before removing from production.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/delete-old-log-files.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 8. File Permissions Security Audit | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/file-permissions-security
- **Canonical to set:** `https://bashsnippets.xyz/snippets/file-permissions-security`
- **Meta description (reuse as the dev.to intro):**
  > World-writable files on a web server let any compromised script overwrite your application. find -perm 777 audits them and correct chmod 644/755 patterns restore safe permissions.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/file-permissions-security.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 9. Send Email Alerts from Bash | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/bash-send-email-alert
- **Canonical to set:** `https://bashsnippets.xyz/snippets/bash-send-email-alert`
- **Meta description (reuse as the dev.to intro):**
  > Monitoring scripts without email alerts mean failures go unnoticed until users report them. Wraps mailx or curl SMTP into a reusable alert function with per-run deduplication to prevent inbox flooding.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/bash-send-email-alert.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 10. SSH Key Setup Script | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/ssh-key-setup-script
- **Canonical to set:** `https://bashsnippets.xyz/snippets/ssh-key-setup-script`
- **Meta description (reuse as the dev.to intro):**
  > Password-based SSH is vulnerable to brute-force attacks and credential leaks on any internet-exposed server. Automates ssh-keygen -t ed25519 and ssh-copy-id to enable key-based auth in one run.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/ssh-key-setup-script.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 11. Find Duplicate Files in Linux | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/find-duplicate-files
- **Canonical to set:** `https://bashsnippets.xyz/snippets/find-duplicate-files`
- **Meta description (reuse as the dev.to intro):**
  > Duplicate files accumulate silently in archives and download folders, wasting gigabytes of disk space. md5sum hashes every file and awk prints only the redundant copies — nothing to install.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/find-duplicate-files.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 12. Find Large Files in Linux | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/find-large-files-linux
- **Canonical to set:** `https://bashsnippets.xyz/snippets/find-large-files-linux`
- **Meta description (reuse as the dev.to intro):**
  > Your disk hit 100% and the server stopped. Find the biggest files and directories fast with du and find — excludes virtual filesystems and ranks by size descending.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/find-large-files-linux.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 13. Kill Process on Port | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/kill-process-on-port
- **Canonical to set:** `https://bashsnippets.xyz/snippets/kill-process-on-port`
- **Meta description (reuse as the dev.to intro):**
  > EADDRINUSE means something is squatting on your port. Find the process with lsof or ss, then kill it safely — script handles discovery, confirmation, and SIGTERM-to-SIGKILL escalation.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/kill-process-on-port.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 14. Rsync Remote Backup | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/rsync-remote-backup
- **Canonical to set:** `https://bashsnippets.xyz/snippets/rsync-remote-backup`
- **Meta description (reuse as the dev.to intro):**
  > A local-only backup dies with the machine. Push an incremental, resumable copy to a remote server with rsync over SSH — script with exclude patterns, dry-run, and cron scheduling.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/rsync-remote-backup.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 15. Docker Cleanup Bash Script — Reclaim Disk Space from Docker Garbage | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/docker-prune-cleanup
- **Canonical to set:** `https://bashsnippets.xyz/snippets/docker-prune-cleanup`
- **Meta description (reuse as the dev.to intro):**
  > A bash script that removes stopped containers, unused images, dangling volumes, and build cache from Docker — with a disk-usage report before and after.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/docker-prune-cleanup.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 16. Make API Requests in Bash with curl (That Actually Fail When the API Does) | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/bash-curl-api-requests
- **Canonical to set:** `https://bashsnippets.xyz/snippets/bash-curl-api-requests`
- **Meta description (reuse as the dev.to intro):**
  > A curl wrapper for bash that checks HTTP status, times out, and retries transient errors — because plain curl exits 0 on an HTTP 500 and silently poisons everything downstream.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/bash-curl-api-requests.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 17. Parse JSON in Bash with jq (Stop Using grep and cut on API Responses) | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/bash-parse-json-jq
- **Canonical to set:** `https://bashsnippets.xyz/snippets/bash-parse-json-jq`
- **Meta description (reuse as the dev.to intro):**
  > How to read fields out of a JSON API response with jq — and why -r, // defaults, and -e are the three things that separate a reliable parse from one that breaks the next time the API reformats.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/bash-parse-json-jq.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 18. Send Slack Alerts from Bash with Incoming Webhooks (So Cron Jobs Stop Failing Silently) | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/bash-slack-webhook-alerts
- **Canonical to set:** `https://bashsnippets.xyz/snippets/bash-slack-webhook-alerts`
- **Meta description (reuse as the dev.to intro):**
  > Post failure alerts to Slack from a bash script with a curl one-liner, a jq-built payload, and a trap on ERR — so a broken backup tells you the night it breaks instead of the day you need it.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/bash-slack-webhook-alerts.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 19. Find and Replace in Files with sed (Without Corrupting Half Your Tree) | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/bash-sed-find-replace
- **Canonical to set:** `https://bashsnippets.xyz/snippets/bash-sed-find-replace`
- **Meta description (reuse as the dev.to intro):**
  > How to find and replace text in files with sed — in-place edits, GNU vs macOS -i, word boundaries, capture groups, and a safe bulk-replace script with a dry run.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/bash-sed-find-replace.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

#### 20. Bash trap: Clean Up Temp Files on Exit (Even When the Script Dies) | BashSnippets.xyz

- **Live page:** https://bashsnippets.xyz/snippets/bash-trap-cleanup
- **Canonical to set:** `https://bashsnippets.xyz/snippets/bash-trap-cleanup`
- **Meta description (reuse as the dev.to intro):**
  > A script that dies mid-run leaves temp litter and half-written files behind. Use trap on EXIT with mktemp and an atomic mv so every path out of the script cleans up after itself.
- **Suggested tags:** `bash, linux, devops, sysadmin`
- **Source content:** `~/Projects/bashsnippets-next/src/content/snippets/bash-trap-cleanup.mdx`
- **Post to:** dev.to ✅ · CoderLegion (excerpt + link only) · Medium ✅

---

## Manual config — step by step, per platform

The **order matters**: publish on dev.to first (it sets the canonical and gets crawled fastest),
then Medium, then CoderLegion last. Never publish the same body on all three the same day —
space them 2–3 days apart so the cluster does not look like a scheduled syndication burst.

### Platform A — dev.to (primary)

dev.to is the only one of the three with a real canonical field and a working API. It is also
where 20 of our 103 external links come from, so it is the one that actually feeds the site.

**Per article:**

1. Go to <https://dev.to/new>.
2. Click **⚙ (gear icon)** top-right of the editor → this reveals the front-matter fields.
   If you prefer raw front matter, toggle the editor to Markdown mode and paste:
   ```yaml
   ---
   title: <use the article title, NOT the page <title> verbatim — see "Titles" below>
   published: true
   description: <the meta description from this file, trimmed to ~150 chars>
   tags: <4 tags max, comma separated, from the "Suggested tags" line>
   canonical_url: <the exact "Canonical to set" URL from this file>
   cover_image:
   ---
   ```
3. **`canonical_url` is the single most important field.** Set it before you hit publish.
   Setting it after publication works, but dev.to may already have been crawled with no canonical.
   - It must be the clean URL: **no `.html`, no trailing slash.**
   - Verify after publishing: view-source on the dev.to article and confirm
     `<link rel="canonical" href="https://bashsnippets.xyz/...">` matches exactly.
4. **Tags:** dev.to allows 4. Use `bash` + `linux` on every post, then 2 topic-specific.
   Do not invent tags — an unused tag gets zero distribution.
5. **Body — do NOT paste the page verbatim.** Per the Aug 28 audit, ~30 % text overlap
   (including the full script) is one of the six signals that got the site classified as
   scaled syndication. Target **under 40 % overlap**:
   - Open with the war story / consequence (the `bashsnippets-article` skill's house style:
     consequence-first, first-person).
   - Include **at most one** code block — the smallest runnable core, not the hardened version.
   - Cut the FAQ, the Quick Answer box, and the compatibility table entirely.
   - Close with a dual-link CTA: one link to the page, one to a related tool.
6. Publish. Then **copy the dev.to URL** into the tracking table at the bottom of this file.

**Titles:** the on-page `<title>` is keyword-shaped for Google. dev.to rewards curiosity.
Rewrite it. Compare a real pair from our own history:
- Page: *"Bash Trap Cleanup"* → dev.to: *"find . -delete Ran Before the Filter and Emptied the Whole Tree"*
That second one is why that article earned a referring link that GSC now shows.

**Automation available:** `scripts/fix-devto-canonicals.mjs` proves the API works with a
`DEVTO_API_KEY`. The same key can `POST /api/articles` to publish. Worth wiring up once
the backlog is under control — not before, because each article still needs a hand-written body.

---

### Platform B — Medium

Medium has **no canonical field in the normal editor.** The only supported way to set one is
the **Import** flow, which sets `rel="canonical"` back to the source automatically.

**Always import. Never paste.**

1. Go to <https://medium.com/p/import>.
2. Paste the **live bashsnippets.xyz URL** from this file.
3. Click **Import**. Medium fetches the page and creates a draft with the canonical already
   pointing at our URL.
4. Edit the draft down — same 40 % rule as dev.to. Delete the FAQ accordion and the affiliate
   block (they import as junk text).
5. Add 5 tags. Publish.
6. Confirm: the published Medium post shows a small *"Originally published at bashsnippets.xyz"*
   line at the bottom. **If that line is missing, the canonical did not take — unpublish and re-import.**

Account: `medium.com/@anguisheh1` (this is the handle in the site's `sameAs`).

---

### Platform C — CoderLegion

⚠️ **CoderLegion does not support canonical tags at all.** The Aug 28 audit's P1 item was
explicit: *"Stop publishing full scripts on CoderLegion (no canonical support) — excerpt + link only."*

39 of our 103 external links are self-posted CoderLegion posts, all to the homepage. That
concentration is part of why the link profile reads as manufactured.

**New rules for CoderLegion:**

1. Post **excerpt only** — 150–250 words max. Enough to be a real answer, not a duplicate.
2. **Never** paste the full script. One short illustrative fragment at most.
3. Link **deep**, never to the homepage. Every CoderLegion post from now on links to the
   specific page in this file — that is how we fix "100 % of links point at `/`".
4. Vary the anchor text. Not "BashSnippets" every time — use the page's actual subject.
5. Cap it at **one post per week.** We are trying to look like a person, not a feed.

Profile: `coderlegion.com/user/BashSnippets`

---

## Higher-value than any of the above

The audit ranked these above cross-posting, and none of them are done. Cross-posting to
platforms we already saturate has diminishing returns; these three do not:

1. **Real author identity** on `/about` + `Person` schema — real name, photo, 2–3 sentence bio,
   `sameAs` → GitHub / LinkedIn. Still shows byline "Anguishe" with a github-only `sameAs`.
   The audit calls this *"the single strongest E-E-A-T lever for a one-person site."*
2. **Earn 3–5 editorial links** — PR the tools into `awesome-shell` / `awesome-bash` /
   `awesome-sysadmin`; one Show HN for ShellCheck Error Decoder or Cron Wrapper Generator;
   3–5 genuine Unix.SE / r/bash answers linking the *tool that answers the question*.
   Currently **zero** earned links — 100 % self-created UGC.
3. **Bing Webmaster Tools for bashsnippets** — not in the Microsoft account that holds
   beachhousemoving.xyz. Find which account owns it (or add it) and URL-inspect 3 pages.
   Bing states its reason explicitly and flips weeks before Google does.

---

## Tracking table — fill in as you post

| # | Page | dev.to | Medium | CoderLegion |
|---|---|---|---|---|
| 1 | `/guides/bash-scripts-every-sysadmin-needs` | ☐ | ☐ | ☐ |
| 2 | `/guides/bash-text-processing` | ☐ | ☐ | ☐ |
| 3 | `/guides/shell-scripts-that-talk-to-apis` | ☐ | ☐ | ☐ |
| 4 | `/tools/rsync-command-builder` | ☐ | ☐ | ☐ |
| 5 | `/tools/grep-pattern-builder` | ☐ | ☐ | ☐ |
| 6 | `/tools/jq-filter-builder` | ☐ | ☐ | ☐ |
| 7 | `/snippets/delete-old-log-files` | ☐ | ☐ | ☐ |
| 8 | `/snippets/file-permissions-security` | ☐ | ☐ | ☐ |
| 9 | `/snippets/bash-send-email-alert` | ☐ | ☐ | ☐ |
| 10 | `/snippets/ssh-key-setup-script` | ☐ | ☐ | ☐ |
| 11 | `/snippets/find-duplicate-files` | ☐ | ☐ | ☐ |
| 12 | `/snippets/find-large-files-linux` | ☐ | ☐ | ☐ |
| 13 | `/snippets/kill-process-on-port` | ☐ | ☐ | ☐ |
| 14 | `/snippets/rsync-remote-backup` | ☐ | ☐ | ☐ |
| 15 | `/snippets/docker-prune-cleanup` | ☐ | ☐ | ☐ |
| 16 | `/snippets/bash-curl-api-requests` | ☐ | ☐ | ☐ |
| 17 | `/snippets/bash-parse-json-jq` | ☐ | ☐ | ☐ |
| 18 | `/snippets/bash-slack-webhook-alerts` | ☐ | ☐ | ☐ |
| 19 | `/snippets/bash-sed-find-replace` | ☐ | ☐ | ☐ |
| 20 | `/snippets/bash-trap-cleanup` | ☐ | ☐ | ☐ |
