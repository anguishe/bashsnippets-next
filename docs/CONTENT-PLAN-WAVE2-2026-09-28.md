# Content plan, wave 2 (cross-posts 15–28), 2026-09-28

Written by Claude for Travis. Nothing here is posted, scheduled, committed or deployed. The queue
README (`docs/cross-posts/queue/README.md`) stays the order of record for 01–14; this file proposes
15–28 and becomes part of it only when Travis approves.

**Reference item for format:** the most recent live post, #03, `docs/cross-posts/queue/03-bash-trap-cleanup-*`
(dev.to live 2026-09-24). Drafts 15 and 16 mirror it: same YAML front matter keys and order, the
`https://bashsnippets.xyz/ogimage.png` cover, the `---` rule then "Full script …" CTA + related links +
"The rest of the library is at https://bashsnippets.xyz", a `-medium.html` rendered by
`scripts/medium-html.mjs`, and a CoderLegion excerpt with a leading HTML comment. They also carry the
`-medium.md` source that items 06–14 have (H1 title, body, "Originally published at", Medium-tags comment).

---

## 1. Inventory

### On-site content (read from the repo 2026-09-28)

| Type | Count | Newest | Where |
|---|---|---|---|
| Snippets | 45 (45 MDX = 45 registry entries) | `bashlib-starter` 2026-09-11; six on 2026-09-10 | `src/content/snippets/`, registry `src/lib/snippets.ts:79–600` |
| Guides | 9 | four on 2026-09-01 (open-ports, safe-template, auto-restart, hung-process) | `src/app/guides/*/page.tsx`, index array `src/app/guides/page.tsx:9–74` |
| Tools | 12 | — | `src/lib/tools.ts:22–488` |
| ShellCheck deep dives | 7 | all 2026-09-01 | `src/lib/shellcheck-pages.ts:46–192` |
| Blog | **none** — there is no `/blog` route (`src/app/` has about, contact, guides, privacy, rss.xml, shellcheck, snippets, starter-kit, terms, tools) | | |

**Drafts / future-dated entries: none.** Every date in the registries is ≤ 2026-09-11.

**How on-site "scheduling" works: it doesn't.** There is no publish-date gate anywhere in `src/`.
- Snippets: `generateStaticParams` at `src/app/snippets/[slug]/page.tsx:106–107` returns `getAllSlugs()`
  (`src/lib/snippets.ts:640–641`), which maps every registry entry, so an entry is live on the next
  deploy regardless of `datePublished`.
- Tools: same pattern, `src/app/tools/[slug]/page.tsx:96`.
- ShellCheck: `dynamicParams = false` at `src/app/shellcheck/[code]/page.tsx:135`, params from the registry at `:137`.
- Guides: static route per guide + hardcoded sitemap lines `scripts/generate-sitemap.mjs:15–23`.
- `datePublished` is used only as metadata and for RSS ordering (`src/app/rss.xml/route.ts:17,27`).

So "scheduling" a new page means **not pushing it until the day you want it live**. Vercel deploys main
on push. A future `datePublished` would still render immediately with a future date in its JSON-LD. Don't do that.

### Cross-post queue status (docs + dev.to public API, read 2026-09-28)

| # | Page | dev.to | Medium | CoderLegion |
|---|---|---|---|---|
| 01 | guides/open-ports-linux | **live** 9/16 | live (fixed 9/21) | live 9/16 (27426) |
| 02 | guides/safe-bash-script-template | **live** 9/22 (API-confirmed) | scheduled 9/22, not re-checked | scheduled 9/22 (28017), not re-checked |
| 03 | snippets/bash-trap-cleanup | **live** 9/24 (API-confirmed) | scheduled 9/24, not re-checked | scheduled 9/24 (28018), not re-checked |
| 04–14 | sc2086 → ssh-key-setup-script | scheduled Tue/Thu 9/29 → 11/3 (ids 4700406–4700422) | scheduled (ids in README) | scheduled 28019–28029 |

dev.to public API: 40 articles; newest 3 are 01–03, which confirms the scheduler is firing. The Medium
and CoderLegion copies of 02 and 03 were not re-read this session (no browser use by rule). Worth a
logged-out spot check by Travis.

**The gap:** after Tue 11/3 nothing is queued on any platform. The 11/04 read counts posts 01–14 only,
so wave 2 doesn't affect the gate. It keeps distribution going through the freeze-or-maintain decision.

### On-site pages with NO cross-post yet (checked against all 40 dev.to canonicals + the queue)

- **Guides (2):** `auto-restart-linux-service`, `diagnose-a-hung-process`.
- **ShellCheck (6):** sc2016, sc2034, sc2046, sc2063, sc2115, sc2154 (only sc2086 is queued).
- **Snippets (20):** kill-process-on-port, find-large-files-linux, rsync-remote-backup, docker-prune-cleanup,
  bash-curl-api-requests, bash-parse-json-jq, ports-audit, service-watchdog, log-retention-cleanup,
  find-ip-address-linux, bash-environment-variables, ssh-run-remote-commands, bash-arrays,
  bash-argument-parsing, bash-string-manipulation, bash-functions, bash-if-else-examples,
  find-duplicate-files, bash-slack-webhook-alerts, bashlib-starter. (`search-files-for-text-grep` has a
  Medium canonical from the 9/21 fix, but no dev.to post of its own.)
- **Tools:** all 12 are covered (9 live on dev.to, rsync/grep/jq queued as 10–12).

All 28 candidate URLs returned HTTP 200 on 2026-09-28.

### Reserve drafts (`docs/cross-posts/reserve/`)

| Reserve | Page | State |
|---|---|---|
| 12 | find-large-files-linux | real-run draft (Aug-28 tumblerd). **Promoted to #16** |
| 13 | kill-process-on-port | real-run draft. **Promoted to #15** |
| 14 | rsync-remote-backup | real-run draft, dev.to + Medium ready → #18 |
| 15 | docker-prune-cleanup | real-run draft, numbers from 9/11 → re-run `docker system df` before use → #21 |
| 16 | bash-curl-api-requests | ⚠ **invented incident** ("partner's price API … for a month"). Rewrite on a real run before use → #23 |
| 17 | bash-parse-json-jq | ⚠ **invented incident** ("a deploy script where I worked … two years"). Rewrite before use (buffer) |

The reserve originals are left in place. The promoted copies in `queue/` are what counts.

---

## 2. Wave 2: 15–28

**Cadence.** Tue/Thu 08:00 America/Chicago. All dates fall after the 11/1 DST change, so every post is
CST, stored as **14:00Z** on dev.to (`published_at: "YYYY-MM-DD 08:00 -0600"`), Medium and CoderLegion.
Skipped: Thanksgiving week (11/24, 11/26) and 12/22–12/31. Fourteen posts end Tue 1/12. The last five
slots before 1/31 (1/14, 1/19, 1/21, 1/26, 1/28) are **buffer** for slips or items 29–33.

**Ordering logic.** Ready drafts go first so the post-11/4 weeks need zero writing. Guides are
interleaved early (a guide earns ~7× a snippet in Copilot citations, PLAN §3). New snippets come last so
they can be built, deployed and IndexNow'd at least a week before their article goes out.

**Freeze mode.** If the 11/04 read says freeze (1 h/month), run only the rows marked **F**. They point
at existing pages and need at most one short re-run. Scheduling is the same ~1-min-per-post
routine, so it fits the freeze budget.

| # | Date | Title (working) | canonical_url | dev.to tags | Cluster / evidence | Angle | Needs | F |
|---|---|---|---|---|---|---|---|---|
| 15 | Thu 11/5 | I Killed the Parent Process. Its Child Kept the Port. | https://bashsnippets.xyz/snippets/kill-process-on-port | bash, linux, devops, sysadmin | open ports (104 q, 26 %) + kill process (11 q) | the socket table, not the process table; SIGTERM before SIGKILL; TIME_WAIT | **DRAFTED** (all 4 files); run re-verified 9/28 | F |
| 16 | Tue 11/10 | I Deleted a 44.6 GB File and df Gave Me Back 5 GB. Something Still Had It Open. | https://bashsnippets.xyz/snippets/find-large-files-linux | bash, linux, devops, sysadmin | disk threshold (23 q) | du vs df, `lsof +L1`, `sort -rh` vs `-rn`, /proc excludes | **DRAFTED** (all 4 files); claims re-verified 9/28 | F |
| 17 | Thu 11/12 | Restart=always Did Nothing. The Service Never Exited. | https://bashsnippets.xyz/guides/auto-restart-linux-service | bash, linux, sysadmin, devops | service watchdog (13 q, pos 2.0) | the real Aug-6 lightdm hang: "active (running)" and broken; is-active vs health; Restart= vs cron poller | write from the guide (its opener is real). Re-read `systemctl show lightdm -p Restart` | F |
| 18 | Tue 11/17 | rsync projects and rsync projects/ Make Two Different Backups | https://bashsnippets.xyz/snippets/rsync-remote-backup | bash, linux, devops, sysadmin | backup (32 q, the only cluster with clicks) | trailing slash, --delete, cron password prompt. Differs from #10 (rsync tool, --delete) — keep the slash angle up front | reserve 14 ready; add CoderLegion excerpt + .html | F |
| 19 | Thu 11/19 | SC2115 Is the Warning Between rm -rf "$DIR/" and rm -rf / | https://bashsnippets.xyz/shellcheck/sc2115 | bash, linux, shellcheck, devops | ShellCheck codes (17 q) | empty var → `/`; `${var:?}`; scratch-tree deletion run | real run (cmd A) | F |
| 20 | Tue 12/1 | (from run) — a hung process is evidence; `kill -9` destroys it | https://bashsnippets.xyz/guides/diagnose-a-hung-process | bash, linux, sysadmin, devops | hung job / timeout (7 q, pos 3.5) | wchan, /proc/PID/fd, strace -p before kill | real run (cmd B); the guide's own opener is generic, so the article needs a real hang | F |
| 21 | Thu 12/3 | Before You Run docker system prune, Read the RECLAIMABLE Column. | https://bashsnippets.xyz/snippets/docker-prune-cleanup | bash, docker, devops, linux | disk (23 q) | measure before prune; prune order; keep flags | reserve 15; **re-run** `docker system df` and `docker system df -v` and refresh every number | F |
| 22 | Tue 12/8 | "No space left on device" With 40 % Free: I Ran Out of Inodes | **NEW** https://bashsnippets.xyz/snippets/no-space-left-on-device-inodes | bash, linux, sysadmin, devops | disk (23 q) + web pain point (Linuxize, Gentoo wiki, many 2026 how-tos) | blocks vs inodes, `df -i`, find the dir with a million files; links #16 | **NEW snippet** + real run (cmd C, needs sudo) | |
| 23 | Thu 12/10 | curl Exited 0 on a 404. My Script Believed It. | https://bashsnippets.xyz/snippets/bash-curl-api-requests | bash, linux, devops, sysadmin | API/scripts (guide cited on Copilot) | curl's exit code vs HTTP status; `-f`, `--fail-with-body`, `-w '%{http_code}'` | **rewrite reserve 16 on real run** (cmd D) | |
| 24 | Tue 12/15 | The Journal Was Using N GB of My Disk and I Never Set a Limit | **NEW** https://bashsnippets.xyz/snippets/journalctl-disk-usage-vacuum | bash, linux, sysadmin, devops | disk (23 q) + current search pain (journal vacuum how-tos, 2026) | `--disk-usage`, vacuum by size/time, `SystemMaxUse` drop-in | **NEW snippet** + real run (cmd E, sudo for vacuum) | |
| 25 | Thu 12/17 | SC2034: ShellCheck Flagged a Variable in My Own Repo. It Was Right. | https://bashsnippets.xyz/shellcheck/sc2034 | bash, linux, shellcheck, devops | ShellCheck codes | the page opens on the repo's own July finding (commit `093febd`), which is real | re-run `shellcheck` on the before/after, no new incident needed | F |
| 26 | Tue 1/5 | /bin/bash^M: bad interpreter. The Script Was Fine. Its Line Endings Weren't. | **NEW** https://bashsnippets.xyz/snippets/fix-bad-interpreter-crlf | bash, linux, shellcheck, devops | web pain point (evergreen: LinuxSimply, Baeldung, oneuptime 2026-01) | `cat -A`, `file`, ShellCheck SC1017, `sed -i 's/\r$//'`, `.gitattributes eol=lf` | **NEW snippet** + real run (cmd F, no sudo) | |
| 27 | Thu 1/7 | (from run) — a port that wasn't there yesterday | https://bashsnippets.xyz/snippets/ports-audit | bash, linux, security, sysadmin | open ports (104 q, 26 %) | baseline → diff → alert; the new listener is the alert | real run (cmd G) | |
| 28 | Tue 1/12 | My Cron Job Missed a Night. The systemd Timer Would Have Caught Up. | **NEW** https://bashsnippets.xyz/snippets/systemd-timer-vs-cron | bash, linux, sysadmin, devops | flock/cron overlap (23 q) + cron guide (43 Copilot citations) + 2026 "timer vs cron" demand | `Persistent=true`, journal logging for free, when cron still wins (containers) | **NEW snippet** + real run (cmd H, user timers, no sudo) | |

**Buffer (29+, 1/14 → 1/28):** `argument-list-too-long` (**NEW**, cmd I; web pain point, pairs with
delete-old-log-files); `bash-parse-json-jq` (rewrite reserve 17 on a real run); `find-ip-address-linux`
(largest uncovered autocomplete cluster, but ⚠ highest PII risk. Paste documentation addresses only);
`sc2046`; `service-watchdog`.

**Page-level flag (out of scope, not fixed):** `/snippets/bash-environment-variables` opens on a
"someone set DEPLOY_ENV=production … watched it print staging" story that reads as illustrative, not
as a run from this box. Don't cross-post that page until its opener is checked.

### New on-site snippets needed (4 in the main wave, 1 in buffer)

Each one follows the snippet pipeline (MDX + `src/lib/snippets.ts` entry + `llms.txt` count, script
ShellCheck-clean, `npm run build`, push, `npm run indexnow`), with a **live-by** date one week before
its article:

| Slug | Live by | Article |
|---|---|---|
| no-space-left-on-device-inodes | 12/1 | #22 |
| journalctl-disk-usage-vacuum | 12/8 | #24 |
| fix-bad-interpreter-crlf | 12/29 | #26 |
| systemd-timer-vs-cron | 1/5 | #28 |
| argument-list-too-long | 1/7 | buffer |

Repo coverage check 2026-09-28: no existing content covers `df -i`/inodes, journald vacuum, CRLF/`^M`,
`ARG_MAX`, or systemd timers (`OnCalendar`). None of these duplicates a live page.

---

## 3. Real runs Travis (or Claude, on this box) must do. Output placeholders only, nothing fabricated

Scrub before pasting: MAC, public IP, ISP DNS (`scripts/check-leaks.sh` runs on commit only for
*staged* files, so run it on the article too). Record versions (`bash --version`, tool `--version`).

**A. #19 sc2115 (scratch dir, no sudo)**
```bash
d=$(mktemp -d); mkdir -p "$d/tree/keep" && touch "$d/tree/keep/a" "$d/tree/keep/b"
printf '#!/bin/bash\nrm -rf "$TARGET/"*\n' > "$d/t.sh"; shellcheck "$d/t.sh"
( cd "$d/tree" && TARGET= bash -c 'echo rm -rf "$TARGET/"*' )   # echo only: shows the expansion to /*
printf '#!/bin/bash\nrm -rf "${TARGET:?}/"*\n' > "$d/t2.sh"; shellcheck "$d/t2.sh"; TARGET= bash "$d/t2.sh"; echo "exit=$?"
```
OUTPUT PLACEHOLDER. Never run the unguarded `rm` for real; the `echo` shows the expansion.

**B. #20 hung process (no sudo for most; `/proc/PID/stack` needs root)**
```bash
f=$(mktemp -u); mkfifo "$f"; cat "$f" & P=$!
cat /proc/$P/wchan; echo; ls -l /proc/$P/fd; ps -o pid,stat,wchan:32,cmd -p $P
timeout 5 strace -p $P 2>&1 | head    # may need ptrace_scope=0 or sudo
kill $P; rm -f "$f"
```
OUTPUT PLACEHOLDER.

**C. #22 inodes (sudo: Travis runs in his own terminal)**
```bash
df -i /
sudo mkdir -p /mnt/inodetest && sudo mount -t tmpfs -o size=50M,nr_inodes=1000 tmpfs /mnt/inodetest
sudo bash -c 'for i in $(seq 1 1100); do : > /mnt/inodetest/f$i || { echo "failed at $i"; break; }; done'
df -h /mnt/inodetest; df -i /mnt/inodetest
sudo umount /mnt/inodetest
```
OUTPUT PLACEHOLDER.

**D. #23 curl (local server, no network, no sudo)**
```bash
python3 -m http.server 8097 >/dev/null 2>&1 & S=$!; sleep 1
curl -s -o /tmp/body http://127.0.0.1:8097/nope; echo "exit=$?"
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8097/nope
curl -sf -o /tmp/body http://127.0.0.1:8097/nope; echo "exit=$?"
curl -s --fail-with-body http://127.0.0.1:8097/nope | head -3; echo "exit=${PIPESTATUS[0]}"
kill $S; curl --version | head -1
```
OUTPUT PLACEHOLDER.

**E. #24 journald**
```bash
journalctl --disk-usage
systemd-analyze cat-config systemd/journald.conf | grep -E '^(SystemMaxUse|SystemKeepFree|SystemMaxFileSize)'
sudo journalctl --vacuum-time=30d     # Travis decides the retention; this deletes logs
journalctl --disk-usage
```
OUTPUT PLACEHOLDER.

**F. #26 CRLF (scratch, no sudo)**
```bash
d=$(mktemp -d); printf '#!/bin/bash\r\necho ok\r\n' > "$d/crlf.sh"; chmod +x "$d/crlf.sh"
"$d/crlf.sh"; echo "exit=$?"; file "$d/crlf.sh"; cat -A "$d/crlf.sh"; shellcheck "$d/crlf.sh"
sed -i 's/\r$//' "$d/crlf.sh"; "$d/crlf.sh"; echo "exit=$?"
```
OUTPUT PLACEHOLDER.

**G. #27 ports-audit (no sudo; the script from the snippet page)**
```bash
./ports-audit.sh            # first run writes the baseline
python3 -m http.server 8099 >/dev/null 2>&1 & S=$!; sleep 1
./ports-audit.sh; echo "exit=$?"   # should report the new listener
kill $S
```
OUTPUT PLACEHOLDER. Output will list local services. Check for anything identifying before pasting.

**H. #28 systemd timers (user scope, no sudo)**
```bash
systemctl list-timers --all | head -15
systemd-run --user --on-active=20 --unit=bs-demo /bin/bash -c 'date >> /tmp/bs-demo.log'
systemctl --user list-timers bs-demo.timer; sleep 25; journalctl --user -u bs-demo --no-pager | tail -3
```
OUTPUT PLACEHOLDER. A `Persistent=true` catch-up demo needs a real timer across a suspend. Record it only if it actually happens.

**I. buffer: ARG_MAX (scratch, no sudo)**
```bash
getconf ARG_MAX; d=$(mktemp -d); cd "$d" && seq -f 'file-%06g.log' 1 200000 | xargs touch
rm ./*.log; echo "exit=$?"
find . -name '*.log' -delete; ls | wc -l; cd - && rmdir "$d"
```
OUTPUT PLACEHOLDER.

---

## 4. Drafted in this session

| File | Source | Verification |
|---|---|---|
| `queue/15-kill-process-on-port-devto.md` | reserve 13 (unchanged body) | parent/child port run re-done 9/28: child `python3` kept 8098 after parent killed; plain `kill` freed it. 732 body words |
| `queue/15-kill-process-on-port-medium.md` / `.html` | reserve 13 Medium; html via `scripts/medium-html.mjs` | 1 code block; Medium tags: Bash, Linux, DevOps, Sysadmin, Command Line |
| `queue/15-kill-process-on-port-coderlegion.md` | new excerpt | 239 words, 1 code block, 1 deep link |
| `queue/16-find-large-files-linux-devto.md` | reserve 12 (unchanged body) | `sort -rn` vs `-rh` order and `/proc/kcore` = 140737471590400 bytes re-checked 9/28. 817 body words |
| `queue/16-find-large-files-linux-medium.md` / `.html` | built from the dev.to body | 1 code block |
| `queue/16-find-large-files-linux-coderlegion.md` | new excerpt | 238 words, 1 code block, 1 deep link |

Gates: no banned words, no IPv4 literals, none of this box's MACs / global IPv6 / resolvers.

## 5. Scheduling recipe when approved (not done)

1. dev.to: add 15/16 to `scripts/devto-drafts.mjs` input and `scripts/devto-schedule.mjs` with
   `published_at` `2026-11-05 08:00 -0600` / `2026-11-10 08:00 -0600`. Check the script globs.
   It was written for 02–14.
2. Medium: new-story recipe from the queue README, schedule 08:00 local, set the canonical in Advanced settings.
3. CoderLegion: paste the excerpt body, Schedule Post Time 08:00 −06:00. Replace the `NOT SCHEDULED` comment with the post id.
4. Add rows 15–16 to the queue README table.

## 6. Blockers and decisions for Travis

- **Approve wave 2** (or a freeze-mode subset) before ~11/2 so #15 can be scheduled ahead of 11/5.
- Four new snippets (+1 buffer) mean site deploys in December/January. Under a freeze verdict, drop rows 22, 24, 26, 28.
- Runs C and E need sudo in Travis's own terminal (Bash here has no tty for sudo).
- Reserve 16/17 carry invented incidents. Rewrite them, don't post them as they are.
- Medium/CoderLegion copies of 02/03 weren't re-checked this session.

Sources for the pain-point research (WebSearch 2026-09-28): [Linuxize: No space left, df shows free](https://linuxize.com/post/fix-no-space-left-on-device/),
[Gentoo wiki: no space left while space available](https://wiki.gentoo.org/wiki/Knowledge_Base:No_space_left_on_device_while_there_is_plenty_of_space_available),
[LinuxSimply: /bin/bash^M bad interpreter](https://linuxsimply.com/bash-scripting-tutorial/error-handling-and-debugging/error-handling/bin-bash-m-bad-interpreter/),
[oneuptime: journal cleanup (2026)](https://oneuptime.com/blog/post/2026-03-02-how-to-clean-up-systemd-journal-logs-on-ubuntu/view),
[cronbuilder.dev: systemd timer vs cron 2026](https://cronbuilder.dev/blog/cron-vs-systemd-timers.html),
[oneuptime: Argument list too long (2026)](https://oneuptime.com/blog/post/2026-01-24-fix-argument-list-too-long/view).
