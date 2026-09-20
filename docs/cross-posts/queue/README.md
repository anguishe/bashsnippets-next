# Posting queue — the order of record (2026-09-16)

File numbers **are** the posting order. Post #01 today, then Tuesdays and Thursdays through Tue 11/3 (14 posts, needed for the 2026-11-04 read).
How to post each platform: `docs/POST-QUEUE-2026-09.md` → *Recipes* (D = dev.to, M = Medium, C = CoderLegion). Paste the live URL into the Done column.

**Medium: paste the `.html`, never the `.md`.** Medium does not read markdown on paste: `##`, backticks and code fences arrive as literal text, and its smart punctuation then turns `'quotes'` into curly quotes and `--diff` into "— diff", which breaks every command. Post #01 went up that way on 2026-09-16.
1. Medium → Import the canonical URL (recipe M step 1), open the draft.
2. Double-click `NN-…-medium.html` so it opens in the browser → **Ctrl+A, Ctrl+C**.
3. In the Medium draft, select the whole body (click in it, Ctrl+A) → **Ctrl+V**. Headings, code blocks, inline code and links come across as formatting. The title is not in the file — type it into Medium's title box (no `# `).
4. Before publishing, check one command in a code block: straight `'quotes'` and `--flags` must survive. Then add the tags from this table and publish.
5. After editing any `-medium.md` or `-devto.md`, rebuild the pages: `node scripts/medium-html.mjs`.

**Fix #01 live:** open the published Medium post → Edit, select the whole body, paste `01-open-ports-linux-medium.html` the same way, remove the `# For Months…` line if it survives, **Save and publish**.

Checked live 2026-09-16 before numbering: dev.to has 37 published posts (newest 2026-07-30), 0 drafts, and none of these canonicals is taken. CoderLegion's newest post is 2026-07-08, 0 drafts.

## 02–14 are already sitting on dev.to as DRAFTS (created 2026-09-20)

`scripts/devto-drafts.mjs` pushed every remaining queue file to dev.to as an **unpublished draft**,
with the title, 4 tags, `canonical_url`, description and cover image already set from the file's front
matter. Verified on the account: 13 drafts, 0 published, bodies intact (no front-matter leak, code
fences balanced).

**So the Tue/Thu job is no longer "paste a file and set four fields". It is "open the draft, pick a
date".** dev.to's API cannot schedule — `published_at` is not a create field — but **its editor can**,
so the whole queue can be scheduled in one sitting and then survives a busy October.
Steps: `docs/MANUAL-ACTIONS-2026-09-20.txt` §1.

| # | draft id | # | draft id | # | draft id |
|---|---|---|---|---|---|
| 02 | `4700404` | 07 | `4700411` | 12 | `4700417` |
| 03 | `4700405` | 08 | `4700413` | 13 | `4700419` |
| 04 | `4700406` | 09 | `4700414` | 14 | `4700422` |
| 05 | `4700407` | 10 | `4700415` | | |
| 06 | `4700410` | 11 | `4700416` | | |

Drafts are listed at <https://dev.to/dashboard> (newest first). **Re-running the script is safe** — it
skips any queue file whose canonical is already on the account, published or draft.

⚠ **Editing a draft's body on dev.to does not change the file here, and vice versa.** If a queue file
is edited after 2026-09-20, delete that draft on dev.to and re-run the script for it.

**Ticking is still manual and it matters:** #01 went up on 9/16 and sat unticked for four days, so the
file could not answer "what has shipped" — which is the exact number the 11/04 read turns on. Paste the
live URL into the Done column the same evening.

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

| Week of | File | Done |
|---|---|---|
| Wed 9/16 (with #01) | `01-open-ports-linux-coderlegion.md` | [ ] ⚠ **missed — post it Mon 9/21 together with the rsync excerpt** |
| Mon 9/21 | `10-rsync-command-builder-coderlegion.md` | [ ] |
| Mon 9/28 | `11-grep-pattern-builder-coderlegion.md` | [ ] |
| Mon 10/5 | `12-jq-filter-builder-coderlegion.md` (third point corrected 2026-09-16 against a real jq 1.8.1 run) | [ ] |

The other `-coderlegion.md` files (06, 07, 08, 09, 13, 14) are 2026-09-01 versions that were never rebuilt on real runs. They are not scheduled; check one against a real run before posting it.
Do not paste a leading `# ` into any title box (CoderLegion and Medium both kept it last time).

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
