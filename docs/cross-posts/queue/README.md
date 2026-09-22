# Posting queue — the order of record (2026-09-16)

> ✅ **2026-09-21: THE WHOLE QUEUE IS SCHEDULED ON ALL THREE PLATFORMS — nothing is manual.**
> 02–14 publish themselves at 08:00 America/Chicago on the dates below, on dev.to, Medium and
> CoderLegion at the same minute (13:00Z; 11-03 is 14:00Z after DST). #01 is live on all three, and
> its broken Medium copy was fixed 9/21. Verified 9/21: dev.to dashboard shows 13 "Scheduled",
> Medium's Scheduled tab lists 13, CoderLegion 13/13 return 404 logged out. 39 posts, 0 hand steps.

File numbers **are** the posting order. Post #01 today, then Tuesdays and Thursdays through Tue 11/3 (14 posts, needed for the 2026-11-04 read).
How to post each platform: `docs/POST-QUEUE-2026-09.md` → *Recipes* (D = dev.to, M = Medium, C = CoderLegion). Paste the live URL into the Done column.

**Medium: new story + manual canonical. Do NOT use Import any more (changed 2026-09-20).**

The old recipe imported the canonical URL to get the canonical link, then select-all-replaced the
imported body with the rendered `.html` because the import mangles code blocks. Two steps fighting
each other, and the import step is what broke post #01. Medium has a manual canonical field, so the
import is unnecessary:

1. <https://medium.com/new-story> — a blank story, no import.
2. Double-click `NN-…-medium.html` so it opens in a browser → **Ctrl+A, Ctrl+C**.
3. Click into the Medium body → **Ctrl+V**. Headings, code blocks, inline code and links come across
   as real formatting. **Paste the `.html`, never the `.md`** — Medium renders markdown literally
   (`##` and backticks arrive as visible text) and then curls `'quotes'` and turns `--flag` into an
   em-dash, which breaks every command.
4. Type the title into Medium's title box by hand. The `.html` has no title in it, and pasting a
   markdown `# ` heading into that box is what produced both previously broken titles.
5. ⚠ **Set the canonical — this is the whole point and it is the step that can be forgotten.**
   Story settings (the ⋯ menu) → **Advanced settings** → *"This story was originally published
   elsewhere"* → paste the `canonical_url` from this table → **Save canonical link**.
   Without it Medium's copy competes with bashsnippets.xyz instead of feeding it.
6. Add the tags from this table.
7. **Schedule for later** → the same date as the dev.to post, 08:00. Medium publishes within five
   minutes of the time you set, in your local timezone.
8. Verify before moving on: one code block still shows straight `'quotes'` and `--flags`, and the
   canonical is saved. Then paste the Medium URL into the Done column.

**Fix #01 live — ✅ DONE 2026-09-21.** Body replaced with the `.html` render (1 real code block, no raw markdown, `# For Months` line gone), republished; its canonical was **missing** (self-canonical to medium.com) and is now `https://bashsnippets.xyz/guides/open-ports-linux` — confirmed in the live page's `rel=canonical`.

## 02–14 are SCHEDULED on Medium (2026-09-21) — nothing to post by hand

Medium's Scheduled tab lists all thirteen at 13:00 UTC (11-03: 14:00 UTC), each with its canonical
saved in Advanced settings (read back after saving), 5 topics, and exactly one code block. The draft ids
(`medium.com/p/<id>/edit`):

| # | Medium id | # | Medium id | # | Medium id |
|---|---|---|---|---|---|
| 02 | `f8a10854c88f` | 07 | `072b2e3c3b95` | 12 | `64f60236cbdb` |
| 03 | `4deb58975552` | 08 | `805c8514dbec` | 13 | `18832a416979` |
| 04 | `643aaf655042` | 09 | `e3707fdc1fde` | 14 | `6f4fbe434bd5` |
| 05 | `1ec84e4eeab8` | 10 | `e367f8deae5d` | | |
| 06 | `cb1920cb90fa` | 11 | `784d4a06b82b` | | |

**What Medium does to a paste (learned 9/21, all handled):**
- A blank line inside a pasted `<pre>` splits the code block in two. The fix is a single space on the
  blank line, with newlines sent as `<br>`. The HTML fed to Medium was built that way; the `.html` files
  here were not changed.
- Prose quotes and apostrophes get curled, and titles too (`sed ‘s/port/…’`). Code is left alone.
  That is typography, not breakage.
- `--` in a **title** becomes ` — ` (hair space, em dash, hair space). #10's `rsync --delete` was
  corrected by hand after the paste and verified after a reload. Re-check that if a title is ever re-pasted.
- Medium inserts `&nbsp;` between a title's last two words (anti-widow). Harmless.
- `Shellcheck` is not an existing topic (it would be created empty), so #04 uses **Shell Scripting**.
- The "Schedule for later" picker uses the browser's timezone (CDT/CST). The Scheduled list shows UTC.

Checked live 2026-09-16 before numbering: dev.to has 37 published posts (newest 2026-07-30), 0 drafts, and none of these canonicals is taken. CoderLegion's newest post is 2026-07-08, 0 drafts.

## 02–14 are SCHEDULED on dev.to (2026-09-20) — nothing to post by hand

All thirteen are queued to publish themselves at **08:00 America/Chicago** on the dates in the
table below. Verified after scheduling: every one returns **404 to an anonymous fetch**, the public
feed still shows #01 as newest, all canonicals point at bashsnippets.xyz, tags intact, 0 unscheduled
leftovers.

**dev.to's API can schedule — it just isn't documented.** The published API reference lists no
`published_at` on create or update, and DEV's editor guide only describes the hexagon button. But
`PUT /api/articles/{id}` with `{"article": {"published": true, "published_at": "2026-09-22 08:00 -0500"}}`
sets **SCHEDULED**, not live. Confirmed empirically before committing to it, by fetching the article
URL with no cookies and getting 404. `scripts/devto-schedule.mjs` does all thirteen; it is idempotent
and re-running it skips anything already on the right date.

⚠ **`published_at` is also parsed out of front matter in `body_markdown`**, which is how this was
first found — but that route leaves the front matter block inside the stored body. The JSON field
needs no body edit, so use the JSON field.

⚠ **dev.to throttles article writes hard** ("Retry later" as a plain-text body, not JSON). The
script spaces writes 8s apart and backs off 35s on a throttle. Don't remove that.

| # | id | publishes | # | id | publishes | # | id | publishes |
|---|---|---|---|---|---|---|---|---|
| 02 | `4700404` | Tue 09-22 | 07 | `4700411` | Thu 10-08 | 12 | `4700417` | Tue 10-27 |
| 03 | `4700405` | Thu 09-24 | 08 | `4700413` | Tue 10-13 | 13 | `4700419` | Thu 10-29 |
| 04 | `4700406` | Tue 09-29 | 09 | `4700414` | Thu 10-15 | 14 | `4700422` | Tue 11-03 |
| 05 | `4700407` | Thu 10-01 | 10 | `4700415` | Tue 10-20 | | | |
| 06 | `4700410` | Tue 10-06 | 11 | `4700416` | Thu 10-22 | | | |

**11-03 is stored as `14:00Z`, not `13:00Z`, and that is correct** — US DST ends 2026-11-01, so
08:00 Chicago is CST (−0600) for the last post and CDT (−0500) for the other twelve.

⚠ **Editing a queue file here no longer reaches dev.to.** The article is scheduled with the body it
already has. A content change means editing the file *and* PUTting the new `body_markdown` to that
id — tell Claude rather than doing one without the other.

**Nothing is manual any more (2026-09-21).** Rows 02–14 are ticked because the *work* is done —
each is scheduled on dev.to, Medium and CoderLegion. They go live on their own on the date shown.

| # | Post on | dev.to title (exact) | dev.to file | canonical_url | tags | Medium (same evening, paste the .html) | Why this slot | Done / URL |
|---|---|---|---|---|---|---|---|---|
| 01 | Wed 9/16 (today) | For Months My Dev Server Came Up on 3001. Tonight I Found Out Who Had 3000. | `01-open-ports-linux-devto.md` | `https://bashsnippets.xyz/guides/open-ports-linux` | bash, linux, security, sysadmin | `01-*-medium.html` (tags: Bash, Linux, Security, Sysadmin, Docker) | open ports = 26% of all Bing queries; true port-3000 story | [x] https://dev.to/bashsnippets/for-months-my-dev-server-came-up-on-3001-tonight-i-found-out-who-had-3000-54k1 |
| 02 | Tue 9/22 | set -euo pipefail Is Missing a Letter. My ERR Trap Stayed Silent Until I Added -E. | `02-safe-bash-script-template-devto.md` | `https://bashsnippets.xyz/guides/safe-bash-script-template` | bash, linux, devops, scripting | `02-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Shell Scripting) | strict mode / trap ERR cluster (35 queries); links the free bashlib starter | [x] scheduled — dev.to + Medium + CoderLegion |
| 03 | Thu 9/24 | I Killed My Report Script Mid-Write. The Output File Never Noticed. | `03-bash-trap-cleanup-devto.md` | `https://bashsnippets.xyz/snippets/bash-trap-cleanup` | bash, linux, devops, sysadmin | `03-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Shell Scripting) | cleanup-on-exit; links the free bashlib starter | [x] scheduled — dev.to + Medium + CoderLegion |
| 04 | Tue 9/29 | SC2086 Is ShellCheck's Lowest-Severity Warning. It Let rm Delete Two Files I Never Named. | `04-shellcheck-sc2086-devto.md` | `https://bashsnippets.xyz/shellcheck/sc2086` | bash, linux, shellcheck, devops | `04-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Shellcheck) | ShellCheck codes cluster; decoder + 7 deep dives | [x] scheduled — dev.to + Medium + CoderLegion |
| 05 | Thu 10/1 | sed 's/port/listen_port/g' Changed Four Lines. I Wanted One. | `05-bash-sed-find-replace-devto.md` | `https://bashsnippets.xyz/snippets/bash-sed-find-replace` | bash, linux, devops, sysadmin | `05-*-medium.html` (tags: Bash, Linux, DevOps, Sysadmin, Command Line) | sed find-replace, broad search demand | [x] scheduled — dev.to + Medium + CoderLegion |
| 06 | Tue 10/6 | My Disk Check Prints WARNING at 88%. Cron Throws It Away Every Monday. | `06-bash-scripts-every-sysadmin-needs-devto.md` | `https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs` | bash, linux, devops, tutorial | `06-*-medium.html` (tags: Bash, Linux, DevOps, Sysadmin, Server Monitoring) | disk-threshold cluster (23 queries) | [x] scheduled — dev.to + Medium + CoderLegion |
| 07 | Thu 10/8 | find -mtime +30 Kept a File That Was 30.5 Days Old. I Checked With touch -d. | `07-delete-old-log-files-devto.md` | `https://bashsnippets.xyz/snippets/delete-old-log-files` | bash, linux, devops, sysadmin | `07-*-medium.html` (tags: Bash, Linux, DevOps, Sysadmin, Programming) | backup/retention cluster, the only one with Bing clicks | [x] scheduled — dev.to + Medium + CoderLegion |
| 08 | Tue 10/13 | grep Found 5 Matches for a Hostname I Expected 3 Times. sed Would Have Rewritten All 5. | `08-bash-text-processing-devto.md` | `https://bashsnippets.xyz/guides/bash-text-processing` | bash, linux, devops, tutorial | `08-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Software Engineering) | grep/sed/awk guide | [x] scheduled — dev.to + Medium + CoderLegion |
| 09 | Thu 10/15 | My Machine Has No mail Command. That's Where Most Disk Alerts Die. | `09-bash-send-email-alert-devto.md` | `https://bashsnippets.xyz/snippets/bash-send-email-alert` | bash, linux, devops, sysadmin | `09-*-medium.html` (tags: Bash, Linux, DevOps, Sysadmin, Monitoring) | disk alerts that never send | [x] scheduled — dev.to + Medium + CoderLegion |
| 10 | Tue 10/20 | I Pointed rsync --delete at a Nearly Empty Directory. It Deleted 3,800 Files and Exited 0. | `10-rsync-command-builder-devto.md` | `https://bashsnippets.xyz/tools/rsync-command-builder` | bash, webdev, tools, productivity | `10-*-medium.html` (tags: Bash, Linux, DevOps, Backup, Command Line) | rsync tool | [x] scheduled — dev.to + Medium + CoderLegion |
| 11 | Thu 10/22 | grep "error&#124;failed" Found Nothing in a Log That Said 'backup failed' | `11-grep-pattern-builder-devto.md` | `https://bashsnippets.xyz/tools/grep-pattern-builder` | bash, webdev, tools, productivity | `11-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Command Line) | grep tool (BRE vs ERE) | [x] scheduled — dev.to + Medium + CoderLegion |
| 12 | Tue 10/27 | I Tested a jq Alert Against a Down Status. It Printed 'no alert'. | `12-jq-filter-builder-devto.md` | `https://bashsnippets.xyz/tools/jq-filter-builder` | bash, webdev, tools, productivity | `12-*-medium.html` (tags: Bash, DevOps, Programming, Web Development, JSON) | jq tool | [x] scheduled — dev.to + Medium + CoderLegion |
| 13 | Thu 10/29 | find -perm 777 Missed a World-Writable File in My Test Tree. -perm -o+w Didn't. | `13-file-permissions-security-devto.md` | `https://bashsnippets.xyz/snippets/file-permissions-security` | bash, linux, devops, sysadmin | `13-*-medium.html` (tags: Bash, Linux, DevOps, Cybersecurity, Sysadmin) | permissions audit | [x] scheduled — dev.to + Medium + CoderLegion |
| 14 | Tue 11/3 | One ssh Flag Tells You Whether a Server Still Accepts Passwords | `14-ssh-key-setup-script-devto.md` | `https://bashsnippets.xyz/snippets/ssh-key-setup-script` | bash, linux, devops, sysadmin | `14-*-medium.html` (tags: Bash, Linux, DevOps, Ssh, Cybersecurity) | ssh key setup | [x] scheduled — dev.to + Medium + CoderLegion |

Row 11's title shows `&#124;` only because a raw `|` would break the table: the real title is `grep "error|failed" Found Nothing in a Log That Said 'backup failed'`. Copy titles from each file's front matter when in doubt.

## CoderLegion — ALL SCHEDULED alongside dev.to (2026-09-21) — nothing to post by hand

Travis, 2026-09-21: CoderLegion goes out **with** each dev.to post, not one a week. All thirteen
excerpts are scheduled natively on CoderLegion for the **same minute** as the dev.to post
(08:00 America/Chicago; the 11-03 one is 14:00Z, same DST rule as dev.to). Verified after
scheduling: each post page shows "This post is scheduled to be posted on … UTC", every one returns
**404 to an anonymous fetch**, none appears in the public feed, exactly one link each (the deep link).

**CoderLegion *does* schedule** — the 9/20 plan had it posted by hand weekly. The new-post form has
**Schedule Post Time** (a `datetime-local` + a GMT-offset picker that defaults to the browser's
−05:00). Workflow, ~1 min each: `coderlegion.com/post` → type the title (no `# `) → paste the body
**without** the title line → 4 space-separated tags → tick *Schedule Post Time* → date + 08:00 →
**Publish** → confirm the banner's UTC time.

**Still no canonical.** The *"The post was published elsewhere before"* box only prints a visible
"Originally published at" link; the page's `rel=canonical` stays on coderlegion.com (checked on
post 21384, 2026-09-21). So these stay excerpts — never paste a full cross-post here — and that
box stays unticked (it would add a second link).

02–05 had no excerpt; written 2026-09-21 from the scheduled dev.to bodies, every claim re-run on
this box first (bash 5.3.9, GNU sed 4.9, ShellCheck 0.11.0). Same gates as the audited ten:
205–249 words, one code block, one deep link, varied anchor, no banned words.

⚠ **Editing a queue file no longer reaches CoderLegion** — edit the post on the site too (the post
page has an Edit button while it is still scheduled).

**Where to see them:** nowhere in a list. CoderLegion has no scheduled-posts view. They are not on
the profile, not in Drafts (`/drafts/BashSnippets` is empty), and the API has no "list my posts" call.
Open each one by its link below. While logged in, the page shows "This post is scheduled to be posted
on … UTC" and has an Edit button. Logged out, the same link returns 404.

**API (checked 2026-09-21, `coderlegion.com/api-docs`):** `POST /api/v1/posts` takes `schedule_time`
(`"2026-09-22T08:00"`) and `schedule_utc` (`"-05:00"`), header `X-API-Key`. `PUT /posts/{id}` edits a
post, and `"schedule_time": ""` cancels its schedule. `GET /posts/{id}` returns hidden posts to their
author. The form does the same job, so none of this was needed. Personal keys are documented as
Pro-only (1000/hour); this account is not Pro. `source_url` is a "source credit", not a canonical.

| # | CoderLegion post | publishes (with dev.to) | tags |
|---|---|---|---|
| 01 | [27426](https://coderlegion.com/27426) | ✅ **posted Wed 9/16** (README had it unticked) | bash linux security sysadmin |
| 02 | [28017](https://coderlegion.com/28017) | Tue 09-22 | bash linux devops scripting |
| 03 | [28018](https://coderlegion.com/28018) | Thu 09-24 | bash linux devops sysadmin |
| 04 | [28019](https://coderlegion.com/28019) | Tue 09-29 | bash linux shellcheck devops |
| 05 | [28020](https://coderlegion.com/28020) | Thu 10-01 | bash linux devops sysadmin |
| 06 | [28021](https://coderlegion.com/28021) | Tue 10-06 | bash linux devops sysadmin |
| 07 | [28022](https://coderlegion.com/28022) | Thu 10-08 | bash linux devops sysadmin |
| 08 | [28023](https://coderlegion.com/28023) | Tue 10-13 | bash linux devops sed |
| 09 | [28024](https://coderlegion.com/28024) | Thu 10-15 | bash linux devops sysadmin |
| 10 | [28025](https://coderlegion.com/28025) | Tue 10-20 | bash linux rsync backup |
| 11 | [28026](https://coderlegion.com/28026) | Thu 10-22 | bash linux grep regex |
| 12 | [28027](https://coderlegion.com/28027) | Tue 10-27 | bash jq json devops |
| 13 | [28028](https://coderlegion.com/28028) | Thu 10-29 | bash linux security sysadmin |
| 14 | [28029](https://coderlegion.com/28029) | Tue 11-03 (14:00Z) | bash linux ssh security |

The old weekly plan (one per Monday, 9/21 → 11/23) is retired. Audit record for 06–14:
`docs/CODERLEGION-AUDIT-2026-09-20.md`.

## Renumbering map (old draft number → queue number)

| old | new | | old | new |
|---|---|---|---|---|
| 22 | 01 | | 23 | 02 |
| 25 | 03 | | 21 | 04 |
| 24 | 05 | | 01 | 06 |
| 07 | 07 | | 02 | 08 |
| 09 | 09 | | 04 | 10 |
| 05 | 11 | | 06 | 12 |
| 08 | 13 | | 10 | 14 |

Not in the queue: `../already-live/03-*` (already on dev.to — do not post) and `../reserve/12-17-*` (unscheduled; 16 and 17 unchecked against real runs).
