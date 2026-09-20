# Posting queue — the order of record (2026-09-16)

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

**Fix #01 live:** open the published Medium post → Edit, select the whole body, paste `01-open-ports-linux-medium.html` the same way, remove the `# For Months…` line if it survives, **Save and publish**.

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

**Still manual, and still the thing that decides the 11/04 read:** the Medium companion each
Tue/Thu, and ticking the Done column. #01 went live 9/16 and sat unticked for four days.

| # | Post on | dev.to title (exact) | dev.to file | canonical_url | tags | Medium (same evening, paste the .html) | Why this slot | Done / URL |
|---|---|---|---|---|---|---|---|---|
| 01 | Wed 9/16 (today) | For Months My Dev Server Came Up on 3001. Tonight I Found Out Who Had 3000. | `01-open-ports-linux-devto.md` | `https://bashsnippets.xyz/guides/open-ports-linux` | bash, linux, security, sysadmin | `01-*-medium.html` (tags: Bash, Linux, Security, Sysadmin, Docker) | open ports = 26% of all Bing queries; true port-3000 story | [x] https://dev.to/bashsnippets/for-months-my-dev-server-came-up-on-3001-tonight-i-found-out-who-had-3000-54k1 |
| 02 | Tue 9/22 | set -euo pipefail Is Missing a Letter. My ERR Trap Stayed Silent Until I Added -E. | `02-safe-bash-script-template-devto.md` | `https://bashsnippets.xyz/guides/safe-bash-script-template` | bash, linux, devops, scripting | `02-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Shell Scripting) | strict mode / trap ERR cluster (35 queries); links the free bashlib starter | [ ] |
| 03 | Thu 9/24 | I Killed My Report Script Mid-Write. The Output File Never Noticed. | `03-bash-trap-cleanup-devto.md` | `https://bashsnippets.xyz/snippets/bash-trap-cleanup` | bash, linux, devops, sysadmin | `03-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Shell Scripting) | cleanup-on-exit; links the free bashlib starter | [ ] |
| 04 | Tue 9/29 | SC2086 Is ShellCheck's Lowest-Severity Warning. It Let rm Delete Two Files I Never Named. | `04-shellcheck-sc2086-devto.md` | `https://bashsnippets.xyz/shellcheck/sc2086` | bash, linux, shellcheck, devops | `04-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Shellcheck) | ShellCheck codes cluster; decoder + 7 deep dives | [ ] |
| 05 | Thu 10/1 | sed 's/port/listen_port/g' Changed Four Lines. I Wanted One. | `05-bash-sed-find-replace-devto.md` | `https://bashsnippets.xyz/snippets/bash-sed-find-replace` | bash, linux, devops, sysadmin | `05-*-medium.html` (tags: Bash, Linux, DevOps, Sysadmin, Command Line) | sed find-replace, broad search demand | [ ] |
| 06 | Tue 10/6 | My Disk Check Prints WARNING at 88%. Cron Throws It Away Every Monday. | `06-bash-scripts-every-sysadmin-needs-devto.md` | `https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs` | bash, linux, devops, tutorial | `06-*-medium.html` (tags: Bash, Linux, DevOps, Sysadmin, Server Monitoring) | disk-threshold cluster (23 queries) | [ ] |
| 07 | Thu 10/8 | find -mtime +30 Kept a File That Was 30.5 Days Old. I Checked With touch -d. | `07-delete-old-log-files-devto.md` | `https://bashsnippets.xyz/snippets/delete-old-log-files` | bash, linux, devops, sysadmin | `07-*-medium.html` (tags: Bash, Linux, DevOps, Sysadmin, Programming) | backup/retention cluster, the only one with Bing clicks | [ ] |
| 08 | Tue 10/13 | grep Found 5 Matches for a Hostname I Expected 3 Times. sed Would Have Rewritten All 5. | `08-bash-text-processing-devto.md` | `https://bashsnippets.xyz/guides/bash-text-processing` | bash, linux, devops, tutorial | `08-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Software Engineering) | grep/sed/awk guide | [ ] |
| 09 | Thu 10/15 | My Machine Has No mail Command. That's Where Most Disk Alerts Die. | `09-bash-send-email-alert-devto.md` | `https://bashsnippets.xyz/snippets/bash-send-email-alert` | bash, linux, devops, sysadmin | `09-*-medium.html` (tags: Bash, Linux, DevOps, Sysadmin, Monitoring) | disk alerts that never send | [ ] |
| 10 | Tue 10/20 | I Pointed rsync --delete at a Nearly Empty Directory. It Deleted 3,800 Files and Exited 0. | `10-rsync-command-builder-devto.md` | `https://bashsnippets.xyz/tools/rsync-command-builder` | bash, webdev, tools, productivity | `10-*-medium.html` (tags: Bash, Linux, DevOps, Backup, Command Line) | rsync tool | [ ] |
| 11 | Thu 10/22 | grep "error&#124;failed" Found Nothing in a Log That Said 'backup failed' | `11-grep-pattern-builder-devto.md` | `https://bashsnippets.xyz/tools/grep-pattern-builder` | bash, webdev, tools, productivity | `11-*-medium.html` (tags: Bash, Linux, DevOps, Programming, Command Line) | grep tool (BRE vs ERE) | [ ] |
| 12 | Tue 10/27 | I Tested a jq Alert Against a Down Status. It Printed 'no alert'. | `12-jq-filter-builder-devto.md` | `https://bashsnippets.xyz/tools/jq-filter-builder` | bash, webdev, tools, productivity | `12-*-medium.html` (tags: Bash, DevOps, Programming, Web Development, JSON) | jq tool | [ ] |
| 13 | Thu 10/29 | find -perm 777 Missed a World-Writable File in My Test Tree. -perm -o+w Didn't. | `13-file-permissions-security-devto.md` | `https://bashsnippets.xyz/snippets/file-permissions-security` | bash, linux, devops, sysadmin | `13-*-medium.html` (tags: Bash, Linux, DevOps, Cybersecurity, Sysadmin) | permissions audit | [ ] |
| 14 | Tue 11/3 | One ssh Flag Tells You Whether a Server Still Accepts Passwords | `14-ssh-key-setup-script-devto.md` | `https://bashsnippets.xyz/snippets/ssh-key-setup-script` | bash, linux, devops, sysadmin | `14-*-medium.html` (tags: Bash, Linux, DevOps, Ssh, Cybersecurity) | ssh key setup | [ ] |

Row 11's title shows `&#124;` only because a raw `|` would break the table: the real title is `grep "error|failed" Found Nothing in a Log That Said 'backup failed'`. Copy titles from each file's front matter when in doubt.

## CoderLegion — one excerpt per week, deep link only (recipe C)

**All ten excerpts are now postable (audited 2026-09-20).** Six of them (`06`, `07`, `08`, `09`,
`13`, `14`) were 2026-09-01 drafts that had never been checked against a real run. Three of those
six opened on incidents that **never happened** and have been rebuilt from scratch on real runs from
this box; the other three were clean and are unchanged. Detail in `docs/CODERLEGION-AUDIT-2026-09-20.md`.

⚠ **#01 slipped its 9/16 slot, so everything shifts one week.** The cadence rule is **one per week**
and doubling up on 9/21 would break it, so the queue below simply moves down. **Seven land before
the 11/04 read and three land after — which is fine: the read counts dev.to posts, not these.**
CoderLegion's job here is the deep link, not the deadline.

| Week of | File | Status | Done |
|---|---|---|---|
| Mon 9/21 | `01-open-ports-linux-coderlegion.md` | clean, was the missed 9/16 slot | [ ] |
| Mon 9/28 | `10-rsync-command-builder-coderlegion.md` | clean | [ ] |
| Mon 10/5 | `11-grep-pattern-builder-coderlegion.md` | clean | [ ] |
| Mon 10/12 | `12-jq-filter-builder-coderlegion.md` | clean (third point corrected 2026-09-16 against a real jq 1.8.1 run) | [ ] |
| Mon 10/19 | `06-bash-scripts-every-sysadmin-needs-coderlegion.md` | ✅ audited, no incident claim; `$5+0` awk coercion re-verified | [ ] |
| Mon 10/26 | `07-delete-old-log-files-coderlegion.md` | ♻️ **rebuilt** — opened on an SSD that filled up, which never happened | [ ] |
| Mon 11/2 | `08-bash-text-processing-coderlegion.md` | ♻️ **rebuilt** — opened on "took down checkout on eleven services", which never happened | [ ] |
| Mon 11/9 | `09-bash-send-email-alert-coderlegion.md` | ♻️ **rebuilt** — opened on a disk alert missed during an outage, which never happened | [ ] |
| Mon 11/16 | `13-file-permissions-security-coderlegion.md` | ✅ audited, no incident claim; `-perm 777` vs `-perm -o+w` re-verified | [ ] |
| Mon 11/23 | `14-ssh-key-setup-script-coderlegion.md` | ✅ audited, no incident claim; all claims are documented SSH behaviour | [ ] |

All ten: 205–249 words, exactly one code block, deep link (never the homepage), varied anchor text,
no banned words, and all ten target URLs verified **200** on 2026-09-20.

**CoderLegion has no canonical field on this post type**, which is why these are excerpts and never
the full article body. Never paste a full cross-post here.

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
