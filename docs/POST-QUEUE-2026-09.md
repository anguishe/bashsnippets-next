# BashSnippets — Post Queue, September 2026

Written 2026-09-10. Work top to bottom; the order **is** the posting order. Tick the `[ ]` as you go
and paste the live URL next to it. Body text lives in the linked files, never here.
Platform rules: `docs/CROSS-POST-BACKLOG.md`. House style: `~/.claude/skills/bashsnippets-article/SKILL.md`.

Verified 2026-09-10 against the dev.to API (37 live articles): **none** of the canonicals in this
queue are already taken on dev.to, except where a row says so. dev.to returns
`422 Canonical url has already been taken` on a duplicate, so that check matters.

---

## Recipes (referenced by every row — read once)

**dev.to (D)**
1. <https://dev.to/new> → **⚙ gear icon** (top-right of the editor) → the front-matter fields appear.
   Or toggle the editor to Markdown mode and paste the whole file including the `---` block.
2. Paste the body file. **Delete any `<!-- REVIEW: … -->` line first** — it renders as nothing but ships in the source.
3. Confirm the four fields: title (exact, from the row), tags (4 max, no `#`), **canonical_url = the clean URL from the row** (no `.html`, no trailing slash), cover_image `https://bashsnippets.xyz/ogimage.png`.
4. Publish. View-source the live article and confirm `<link rel="canonical" href="https://bashsnippets.xyz/…">` matches the row exactly.
5. Paste the dev.to URL into the row, tick the box, and tick the matching row in `CROSS-POST-BACKLOG.md`'s tracking table.

**Medium (M)** — 2–3 days after the dev.to post. Import, never paste.
1. <https://medium.com/p/import> → paste the **live bashsnippets.xyz page URL** (the canonical, not the dev.to URL) → Import.
2. In the draft, select-all the imported page text and replace it with the article body from the row's file (drop the YAML block; for the 01–10 rows use the `-medium.md` file, which already has the H1 and closing line).
3. **Title field: type the title without the leading `# `.** Both broken Medium titles (section C) came from pasting the markdown H1 into the title box.
4. Add 5 tags (bash, linux, devops, sysadmin + one topic tag). Publish.
5. Scroll to the bottom of the published post and confirm the *"Originally published at bashsnippets.xyz/…"* line exists. **Missing line = no canonical → unpublish and re-import.**

**CoderLegion (C)** — max **one per week**, excerpt only, deep link only.
1. <https://coderlegion.com> → New post. Paste the `-coderlegion.md` excerpt file (150–250 words, one code fragment at most).
2. The link in the excerpt must be the specific page, never `bashsnippets.xyz/`. Vary the anchor text (page subject, not "BashSnippets").
3. If CoderLegion offers a canonical field on this post type, fill it with the page URL; if not, publish anyway — the deep link is the point.
4. Tick the row; do not post another CoderLegion piece for 7 days.

---

## A. Week 1 — dev.to, one per weekday (Thu 9/11 → Wed 9/17)

| Day | Date | Title (exact) | Body file | canonical_url | Tags | Steps | Done |
|---|---|---|---|---|---|---|---|
| 1 | Thu 9/11 | A One-Line sed Command Renamed Things That Don't Exist and Took Down Staging | `~/distribution-kit/devto-1-sed-find-replace.md` | `https://bashsnippets.xyz/snippets/bash-sed-find-replace` | bash, linux, devops, sysadmin | D1–D5 | [ ] |
| 2 | Fri 9/12 | A Cron Job Died at 02:14 for Eleven Nights and Our Dashboard Never Noticed | `~/distribution-kit/devto-2-trap-cleanup.md` | `https://bashsnippets.xyz/snippets/bash-trap-cleanup` | bash, linux, devops, sysadmin | D1–D5 | [ ] |
| 3 | Mon 9/15 | I Disabled ShellCheck's Most Annoying Warning. Then rm Deleted Two Files I Never Named. | `docs/cross-posts/21-shellcheck-sc2086-devto.md` | `https://bashsnippets.xyz/shellcheck/sc2086` | bash, linux, shellcheck, devops | D1–D5 | [ ] |
| 4 | Tue 9/16 | For Months My Dev Server Came Up on 3001. Tonight I Found Out Who Had 3000. | `docs/cross-posts/22-open-ports-linux-devto.md` | `https://bashsnippets.xyz/guides/open-ports-linux` | bash, linux, security, sysadmin | D1–D5 | [ ] |
| 5 | Wed 9/17 | set -euo pipefail Is Missing a Letter, and It Cost Me Two Hours at 03:00 | `docs/cross-posts/23-safe-bash-script-template-devto.md` | `https://bashsnippets.xyz/guides/safe-bash-script-template` | bash, linux, devops, scripting | D1–D5 | [ ] |

**Before Day 1 and Day 2 — the two kit files need a trim.** Both front matters are correct
(`canonical_url` verified clean, neither canonical is taken on dev.to), but they were written
2026-08-09, before the Aug 28 audit set the rules. As they stand: kit-1 has **11 code blocks / ~1,900 words**,
kit-2 has **5 code blocks / ~1,800 words**. The rule is one code block and under 40 % overlap with the page.
Cut each down to the single smallest runnable block and ~1,000 words in the dev.to editor before
publishing (leave the files on disk alone if you want the long versions for reference).

**REVIEW markers in Week 1:** 21 and 23 open with a `<!-- REVIEW: incident dramatized -->` line — the
technical runs are from the pages, the "it happened to me" framing is not. Read, decide, delete the line.
22 has none: the port-3000 docker-proxy story is literally in the guide.

**Row 3 note (SC2086):** `shellcheck` is a real dev.to tag with followers; keep it over `sysadmin` here.

---

## B. Weeks 2–3 — backlog drafts 01–10, then Medium, then CoderLegion

### B1. dev.to, one per weekday, backlog order (Thu 9/18 → Wed 10/1)

REVIEW count = `grep -c 'REVIEW:'` in the dev.to file on 2026-09-10. Vet the 1s before their day comes.

| Day | Date | # | Title (exact) | Body file (`docs/cross-posts/`) | canonical_url | Tags | REVIEW | Done |
|---|---|---|---|---|---|---|---|---|
| 6 | Thu 9/18 | 01 | My Own Backup Script Took the Server Down at 11:40 on a Sunday Night | `01-bash-scripts-every-sysadmin-needs-devto.md` | `https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs` | bash, linux, devops, tutorial | **1** | [ ] |
| 7 | Fri 9/19 | 02 | Eleven Services Lost Checkout Because I Ran sed Before find | `02-bash-text-processing-devto.md` | `https://bashsnippets.xyz/guides/bash-text-processing` | bash, linux, devops, tutorial | 0 | [ ] |
| — | — | 03 | **DO NOT POST — already live.** See the note under this table. | `03-shell-scripts-that-talk-to-apis-devto.md` | `https://bashsnippets.xyz/guides/shell-scripts-that-talk-to-apis` | — | 0 | [ ] fix canonical instead |
| 8 | Mon 9/22 | 04 | Nineteen Nights of Exit 0 While rsync Quietly Emptied My Backup | `04-rsync-command-builder-devto.md` | `https://bashsnippets.xyz/tools/rsync-command-builder` | bash, webdev, tools, productivity | **1** | [ ] |
| 9 | Tue 9/23 | 05 | I Trusted an Empty grep for Eleven Days. Now There's an Alias for That | `05-grep-pattern-builder-devto.md` | `https://bashsnippets.xyz/tools/grep-pattern-builder` | bash, webdev, tools, productivity | **1** | [ ] |
| 10 | Wed 9/24 | 06 | Two Quote Characters Silenced My Alerts for Five Weeks — So I Built a jq Filter Builder | `06-jq-filter-builder-devto.md` | `https://bashsnippets.xyz/tools/jq-filter-builder` | bash, webdev, tools, productivity | **1** | [ ] |
| 11 | Thu 9/25 | 07 | A Log File Nobody Read Took My Disk to Zero Bytes on a Tuesday | `07-delete-old-log-files-devto.md` | `https://bashsnippets.xyz/snippets/delete-old-log-files` | bash, linux, devops, sysadmin | 0 | [ ] |
| 12 | Fri 9/26 | 08 | Ten Minutes of Retyping a Passphrase I Knew Cold — the Bug Was Mode 644 | `08-file-permissions-security-devto.md` | `https://bashsnippets.xyz/snippets/file-permissions-security` | bash, linux, devops, sysadmin | 0 | [ ] |
| 13 | Mon 9/29 | 09 | My Disk Monitor Knew for Hours and Told No One | `09-bash-send-email-alert-devto.md` | `https://bashsnippets.xyz/snippets/bash-send-email-alert` | bash, linux, devops, sysadmin | 0 | [ ] |
| 14 | Tue 9/30 | 10 | Every Light Was Green and My VPS Was Still Taking 31,000 Password Guesses a Week | `10-ssh-key-setup-script-devto.md` | `https://bashsnippets.xyz/snippets/ssh-key-setup-script` | bash, linux, devops, sysadmin | **1** | [ ] |

**Row 03 — the 61-hours story is already on dev.to and Medium.** dev.to article **4266678**
("Our Status Dashboard Was Green for 61 Hours While the API Was Down",
<https://dev.to/bashsnippets/our-status-dashboard-was-green-for-61-hours-while-the-api-was-down-3g4n>)
self-canonicalizes to its own dev.to URL. Posting draft 03 would be a near-duplicate under a new title.
Instead: open that article → ⚙ → set `canonical_url` to `https://bashsnippets.xyz/guides/shell-scripts-that-talk-to-apis`
→ save → view-source to confirm. That gives the guide its dev.to link for free. The Medium copy is the
pasted one with the `# ` title (section C) — it cannot gain a canonical without a re-import, so leave it and fix the title only.

Vet order for the five REVIEW=1 drafts, by posting date: 01 (9/18) → 04 (9/22) → 05 (9/23) → 06 (9/24) → 10 (9/30).

### B2. Medium imports — 2–3 days after each dev.to post (recipe M)

| Target date | Source row | Import this URL | Then paste body from | Done |
|---|---|---|---|---|
| Sun 9/14 | Day 1 | `https://bashsnippets.xyz/snippets/bash-sed-find-replace` | kit-1 body (trimmed version) | [ ] |
| Mon 9/15 | Day 2 | `https://bashsnippets.xyz/snippets/bash-trap-cleanup` | kit-2 body (trimmed version) | [ ] |
| Thu 9/18 | Day 3 | `https://bashsnippets.xyz/shellcheck/sc2086` | `21-…-devto.md` minus YAML | [ ] |
| Fri 9/19 | Day 4 | `https://bashsnippets.xyz/guides/open-ports-linux` | `22-…-devto.md` minus YAML | [ ] |
| Sat 9/20 | Day 5 | `https://bashsnippets.xyz/guides/safe-bash-script-template` | `23-…-devto.md` minus YAML | [ ] |
| Sun 9/21 | Day 6 | `https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs` | `01-…-medium.md` | [ ] |
| Mon 9/22 | Day 7 | `https://bashsnippets.xyz/guides/bash-text-processing` | `02-…-medium.md` | [ ] |
| Thu 9/25 | Day 8 | `https://bashsnippets.xyz/tools/rsync-command-builder` | `04-…-medium.md` | [ ] |
| Fri 9/26 | Day 9 | `https://bashsnippets.xyz/tools/grep-pattern-builder` | `05-…-medium.md` | [ ] |
| Sat 9/27 | Day 10 | `https://bashsnippets.xyz/tools/jq-filter-builder` | `06-…-medium.md` | [ ] |
| Sun 9/28 | Day 11 | `https://bashsnippets.xyz/snippets/delete-old-log-files` | `07-…-medium.md` | [ ] |
| Mon 9/29 | Day 12 | `https://bashsnippets.xyz/snippets/file-permissions-security` | `08-…-medium.md` | [ ] |
| Thu 10/2 | Day 13 | `https://bashsnippets.xyz/snippets/bash-send-email-alert` | `09-…-medium.md` | [ ] |
| Fri 10/3 | Day 14 | `https://bashsnippets.xyz/snippets/ssh-key-setup-script` | `10-…-medium.md` | [ ] |

Medium's own "Originally published at" line is the canonical. The `-medium.md` files end with that
line already; delete the duplicate if Medium adds its own.

### B3. CoderLegion — one tool excerpt per week (recipe C)

| Week of | Excerpt file (`docs/cross-posts/`) | Deep link (must be the only link) | Done |
|---|---|---|---|
| Mon 9/22 | `04-rsync-command-builder-coderlegion.md` | `https://bashsnippets.xyz/tools/rsync-command-builder` | [ ] |
| Mon 9/29 | `05-grep-pattern-builder-coderlegion.md` | `https://bashsnippets.xyz/tools/grep-pattern-builder` | [ ] |
| Mon 10/6 | `06-jq-filter-builder-coderlegion.md` | `https://bashsnippets.xyz/tools/jq-filter-builder` | [ ] |

No CoderLegion post for the guides or the Week-1 pieces — 39 of our 103 external links are already
CoderLegion→homepage, and the tools are the ones worth a deep link.

---

## C. Medium fix — two titles start with a literal `# `

Confirmed from the RSS feed on 2026-09-10 (`medium.com/feed/@anguisheh1`):

| Broken title as published | Post URL |
|---|---|
| `# Our Status Dashboard Was Green for 61 Hours While the API Was Down` | <https://medium.com/@anguisheh1/our-status-dashboard-was-green-for-61-hours-while-the-api-was-down-ae3d60edad95> |
| `# A Function Without local Overwrote My Variable and rm -rf Deleted the Wrong Directory` | <https://medium.com/@anguisheh1/a-function-without-local-overwrote-my-variable-and-rm-rf-deleted-the-wrong-directory-9ceeb71bab6c> |

Steps, per post:
1. Open the post URL while logged in as `@anguisheh1` → click the **⋯** (top-right) → **Edit story**.
2. Click into the title (the first, largest line) → delete the leading `# ` → the title should read as the sentence only.
3. Check the first body paragraph did not also get an H1 pasted in; if the body starts with the title again, delete that duplicate line.
4. **Save and publish** (top-right) → confirm the page tab title no longer starts with `#`. The URL slug does not change.
5. `[ ]` 61-hours fixed · `[ ]` Function-without-local fixed

---

## D. awesome-list PRs

All three CONTRIBUTING files fetched 2026-09-10 from `raw.githubusercontent.com` (`master` for all three;
awesome-bash's file is lowercase `contributing.md`). Repo facts used below: `anguishe/bashsnippets`,
MIT, created 2026-05-05 (128 days old), **2 stars**.

### D1. alebcay/awesome-shell — two PRs (tools)

**Rules that apply:** self-promotion is explicitly allowed. **"GitHub projects must have at least 50 stars"** —
the two tools are web pages, not GitHub projects, so the rule does not literally cover them, but the
maintainer may apply it in spirit. Scope accepts "CLI apps", "shell extensions", and "guides or tutorials";
a browser tool is none of those by name. **Honest odds: medium-low.** The list's *Shell Script Development*
section already carries `shellcheck`, which is the argument for placement. One PR per addition
(the linked sindresorhus guide asks for that). Entries in this list use `* ` bullets and mostly **no trailing period**.

PR 1 — title: `Add ShellCheck Error Decoder`
Section: `## Shell Script Development`, inserted directly after the `shellcheck` line (keeps the s-block alphabetical):
```
* [ShellCheck Error Decoder](https://bashsnippets.xyz/tools/shellcheck-error-decoder) - Paste any SCxxxx code for the rule name, a plain-English explanation and a before/after fix; companion to shellcheck
```
PR 2 — title: `Add Cron Wrapper Generator`
Section: `## Shell Script Development`, alphabetical position after `bash-language-server` / before the d-entries:
```
* [Cron Wrapper Generator](https://bashsnippets.xyz/tools/cron-wrapper-generator) - Generates a hardened cron wrapper script composing flock, timeout and exponential-backoff retry with logging and email-on-failure
```
PR body (both, adjust the name):
```
Adds <name> to Shell Script Development.

What it is: a free, no-login browser tool at bashsnippets.xyz. <one sentence from the entry>.
Every script it emits is ShellCheck-clean and follows set -euo pipefail.
Why here: it sits next to shellcheck in workflow — you run shellcheck, paste the code it prints.
Disclosure: I built it. Per CONTRIBUTING, self-authored entries are acceptable; it is not a GitHub
project, so the 50-star rule does not apply, but say the word if you would rather it did.
```
`[ ]` PR 1 opened · `[ ]` PR 2 opened

### D2. awesome-lists/awesome-bash — the script repo (BLOCKED) → website entry instead

**Rules that apply — read these first:**
- *Source code resources must be older than 90 days* → repo is 128 days old, **passes**.
- *Source code resources must have more than 50 stars* → repo has **2**. **This blocks the repo entry outright.**
- *Non-source resources* must include, in the PR, **at least one link to a positive discussion** (Reddit, HN, or Lobsters) showing community backing.
- PR title **must** be `Add ITEM_NAME`; one PR per suggestion; format `- [ITEM](LINK) - Description.` with capital and full stop; add alphabetically or at the bottom.

**What to do:** do not open the repo PR until the repo passes 50 stars. Submit the *site* as a
non-source resource under `## Website` (currently Bash One-Liners and commandlinefu — the right company),
**after** the Show HN in section E has run, and link the HN thread as the discussion. The May 7
r/learnprogramming chmod post (1.8K views) is a weaker second link; include both if HN is quiet.

PR title: `Add BashSnippets`
Section: `## Website`, alphabetical → second line, between Bash One-Liners and commandlinefu:
```
- [BashSnippets](https://bashsnippets.xyz) - Tested, ShellCheck-clean bash scripts for backups, monitoring and cron, each explained line by line, plus browser tools such as a ShellCheck error decoder.
```
The entry to hold in reserve for when the repo clears 50 stars (`## Shell Script Development`, alphabetical near `bash3boilerplate`):
```
- [bashsnippets](https://github.com/anguishe/bashsnippets) - Tested, ShellCheck-clean bash scripts for real Linux boxes and cron jobs, each explained line by line.
```
PR body:
```
Adds BashSnippets to Website.

Free library of tested bash scripts (backups, disk, services, cron, security) with each line
explained, and a set of browser tools (ShellCheck error decoder, cron wrapper generator, chmod builder).
No login, no paywall. Scripts are MIT on GitHub (anguishe/bashsnippets) — that repo is under the
50-star line, so this PR is for the site as a non-source resource.
Community discussion: <HN thread URL> · <reddit thread URL>
Disclosure: I run the site.
```
`[ ]` opened (after Show HN) · `[ ]` repo entry (when ≥ 50 stars)

### D3. kahun/awesome-sysadmin — the script repo

**Rules that apply:** FLOSS only → MIT **passes**. Format `[RESOURCE](LINK) - DESCRIPTION.` — description
**under 80 characters**, ends with a full stop. Alphabetical within the category. One commit per category.
PR title in the imperative. PR description must name the application, the category, and link the source.
No star or age minimum. **Honest note:** this list looks unmaintained (entries still point at Dotdeb,
Rackspace's blog, `admin.com`); expect the PR to sit. The active successor is `awesome-foss/awesome-sysadmin`,
which forbids adding anything without a FLOSS license (fine) and prefers software over resources — worth a
second PR there with the same entry if this one stalls.

There is no scripts category; the fit is `# Resources → ## Websites`. Two candidate entries — use one:

PR title: `Add bashsnippets`
Entry linking the repo (what the brief asked for), alphabetical → first line, before Digital Ocean Tutorials:
```
* [bashsnippets](https://github.com/anguishe/bashsnippets) - Tested bash scripts for backups, monitoring and cron, explained line by line.
```
(description = 77 chars). If the reviewer objects to a GitHub link under Websites, swap in the site URL with the same description.
PR body:
```
Add bashsnippets under Resources → Websites.

Application: bashsnippets — 36 tested, ShellCheck-clean bash scripts for sysadmin tasks
(backups, disk-space alerts, service watchdogs, cron hardening, permissions audits).
Category: Resources / Websites.
Source: https://github.com/anguishe/bashsnippets (MIT). Each script is explained line by line at
https://bashsnippets.xyz.
Disclosure: I am the author.
```
`[ ]` opened

---

## E. Show HN

- **URL:** `https://bashsnippets.xyz/tools/shellcheck-error-decoder`
- **Title (79 chars):** `Show HN: ShellCheck Error Decoder – plain-English fix for any SC code, no login`
- Submit at <https://news.ycombinator.com/submit> — URL field only, **leave the text field empty** (HN's Show rules: the description goes in a comment, not the text box). Post Tue–Thu, 08:00–10:00 US Eastern. Use a personal account with history, not a brand account.

First comment (post it within a minute of submitting):
```
I built this after the fourth time I pasted "SC2086" into a search box and landed on the wiki page that
tells you what the rule is but not what to type instead. Paste any ShellCheck code and it gives you the
rule name, a plain-English explanation of what actually breaks, and a before/after fix you can copy; for
the seven codes people search most (2086, 2046, 2034…) there is a longer write-up with real ShellCheck
0.11.0 output. It runs entirely in the browser — no login, no upload, nothing sent anywhere. Next is
letting you paste a whole shellcheck report and decode every line at once, and a CLI shim that does the
same from a terminal. Happy to answer anything about how it was built or the rules it gets wrong.
```

**HN rules that matter:** no marketing language or superlatives in the title ("free", "best", "revolutionary" get flagged; "no login" is a fact, fine). Do not ask anyone to upvote, ever — voting rings are detected and kill the post. Reply to **every** comment, including the hostile ones, within the first two hours; the reply is the content. Do not repost if it sinks; wait a month and HN allows one re-try. Keep the $9 toolkit out of the comment unless asked.
`[ ]` submitted · thread URL: ______

---

## F. Reddit participation kit

Account: `u/Status_Income_8269` (display name BashSnippets). Track record: the May 7 r/learnprogramming
chmod-builder post reached 1.8K views — that format (problem → one command → link to the *specific* page) is
the one to repeat. Rule for every reply: the answer must be complete without clicking; the link is the long version.

**`about.json` returned HTTP 403 for all five subreddits from this box on 2026-09-10** (Reddit blocks
unauthenticated scripted fetches), so the rules below are the commonly known ones — **open each sidebar in
the browser once and correct this table.** Reddit-wide baseline: **10:1** — ten genuine comments for every
one that links to something you own; automod on the bigger subs removes links from low-karma accounts.

| Subreddit | Known posture on links to your own site |
|---|---|
| r/bash | On-topic own-content posts tolerated if substantive; link-only posts removed. Best sub for the SC2086 and strict-mode pieces. |
| r/commandline | Own tools are posted routinely; disclose that it is yours; cross-platform audience so lead with the command, not the site. |
| r/linuxadmin | "No blogspam / no self-promotion" rule; answer fully in the comment, link only as a footnote. |
| r/sysadmin | Strictest — vendor/self-promo rule enforced by users as much as mods; **comment-only, no links** until the account has history there. |
| r/linuxquestions | Help sub; a link is fine when it is the answer, never as the whole answer. |

Reply templates (paste, then edit the first line to quote their actual error):

**1. "How do I see what's listening on a port?"**
```
The blank Process column means you are not root — ss only names your own sockets. You do not need sudo
to find the owner, though:

    ss -ltnpe 'sport = :3000'

The `-e` prints the cgroup, and the last path segment is the systemd unit (docker.service, nginx.service…).
Root gets you the PID; the unit is usually the more useful fact. Longer version with the without-root,
without-netstat and inside-docker cases: https://bashsnippets.xyz/guides/open-ports-linux
```

**2. "Cron job runs manually but not in cron"**
```
Nine times out of ten it is the environment: cron runs with a near-empty PATH and no ~/.bashrc, so a
command that resolves in your shell does not resolve there. Capture what cron actually sees:

    * * * * * env > /tmp/cron-env.txt 2>&1

then diff it against `env` in your terminal, and use absolute paths in the job. The full checklist —
PATH, %, locking, timeouts — is here: https://bashsnippets.xyz/guides/bash-scripts-that-survive-cron
```

**3. "ShellCheck says SC2086, what do I do?"**
```
Put double quotes around the variable: `rm "$file"` instead of `rm $file`. Without them bash splits the
value on spaces and expands any * in it before rm runs — `rm $file` with file="quarterly report.txt"
deletes `quarterly` and `report.txt` and exits 0. If the split is on purpose (a string of flags), use an
array instead: `opts=(-r -n); grep "${opts[@]}" …`. Why it fires inside [ ] but not [[ ]], and how to
disable it for one line: https://bashsnippets.xyz/shellcheck/sc2086
```

**4. "My backup script deletes nothing / deletes everything"**
```
Both symptoms usually come from the same find line. `find $DIR -delete -mtime +7` deletes everything
because -delete runs before the filter; with an unset $DIR under `set -u` it deletes nothing and dies.
Filter first, preview before you trust it:

    find "$BACKUP_DIR" -name '*.tar.gz' -mtime +7 -print      # look, then swap -print for -delete

The builder that orders the predicates for you and shows the dry run: https://bashsnippets.xyz/tools/find-command-builder
```

**5. "How do I auto-restart a service when it dies?"**
```
If it is a systemd unit, do not write a loop — tell systemd:

    sudo systemctl edit myservice   # add: [Service] Restart=on-failure  RestartSec=5

then `daemon-reload` and `restart`. The catch is the hung-but-active case, where the process is alive and
the port is dead, which Restart= never sees; that needs a health probe. Both halves, with the watchdog
script for the second: https://bashsnippets.xyz/guides/auto-restart-linux-service
```

`[ ]` sidebars verified · `[ ]` first 10 non-link comments posted · `[ ]` template 1 used · `[ ]` 2 · `[ ]` 3 · `[ ]` 4 · `[ ]` 5

---

## G. Listings (ShellCheck Error Decoder)

Entry URLs are the submission pages as of 2026-09-10 — confirm in the browser, these move.

| Site | Submit at | Tagline (1 line) | Description (2 sentences) | Category | Done |
|---|---|---|---|---|---|
| Product Hunt | <https://www.producthunt.com/posts/new> | Paste any ShellCheck code, get the fix in plain English | Paste an SCxxxx code and get the rule name, what actually breaks, and a before/after fix you can copy. Runs in the browser, no login, with deep-dive pages for the seven most-searched codes. | Developer Tools (topics: Developer Tools, Open Source, Productivity) | [ ] |
| AlternativeTo | <https://alternativeto.net/manage-item/> → add app → then "suggest as alternative" on the **ShellCheck** page | ShellCheck's warnings, decoded and fixed | Explains any ShellCheck error code in plain English with a copyable before/after fix. Complements shellcheck.net: that tells you the code, this tells you what to change. | Development → Code Analysis; platform Online; license Free | [ ] |
| DevHunt | <https://devhunt.org> → sign in with GitHub → **Submit tool** | Decode any ShellCheck error into a fix | Free browser tool that turns an SC error code into a rule name, an explanation of the failure, and a before/after fix. No account, nothing uploaded, ShellCheck-clean output. | Developer Tools | [ ] |
| Uneed | <https://www.uneed.best/submit-a-tool> | ShellCheck codes explained, with the fix | Paste an SC error code from shellcheck and get the plain-English reason plus a corrected line to copy. Free, no signup, runs client-side. | Developer Tools (free listing queue; skip the paid fast-track) | [ ] |

---

## After anything goes live

The article platforms need nothing else. The **canonical page** it points at should already be in
`public/llms.txt` and IndexNow (`npm run indexnow -- <url>`); if it is a page that shipped since the last
deploy, run that. Record each live URL here and in `CROSS-POST-BACKLOG.md`'s tracking table, then a one-line
entry in `docs/PLAN.md` when a week's batch is done.
