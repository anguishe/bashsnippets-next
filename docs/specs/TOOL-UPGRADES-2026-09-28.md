# Tool upgrades: making the 12 existing tools competitive (2026-09-28)

Research and proposal only. No component was edited. Written by Claude Code for Travis.

**Method.** Each component in `src/components/tools/` was read for what it does today. The leading
incumbents were checked live on 2026-09-28 (WebFetch/WebSearch, sources at the end). Three
correctness bugs were confirmed by reading the source and, where possible, by a real run on this
box. Features are scored **Impact** (H/M/L: search demand we have measured, linkability, AI-citation
value, funnel fit) and **Effort** (S ≤ 2 h, M ≤ 1 session, L > 1 session). Rank = impact first,
then lower effort.

**The measured demand is thin for most tools.** Only three have any signal on record
(`docs/research/NEXT-TOOL-RESEARCH-2026-09-28.md` §1): the ShellCheck decoder (Bing 28 impressions at
6.21, GA4 2 landings), the cron job builder (GA4 2 landings) and the chmod builder (GA4 1, a Reddit
post with 1.8K views). So the order below favours those three and the cross-cutting fixes that lift
every tool at once.

---

## 0. Fix before any feature work (correctness bugs, verified)

| # | Tool | Bug | Evidence | Effort |
|---|---|---|---|---|
| B1 | `bash-trap-builder` | The default **combined** style generates `trap 'cleanup $? $LINENO INT' INT`. `cleanup` never exits, so after Ctrl-C or TERM the temp file or lock is removed and **the script keeps running**. The "Lock file" preset hits this. | `BashTrapBuilder.tsx` `generateCombined()` (≈L143–172). Real run here: `trap "cleanup …" INT; kill -INT $$; echo "still running after SIGINT"` printed `cleanup ran` then `still running after SIGINT`. | S: in combined style, end the handler with `[[ "$3" != EXIT ]] && exit "$(( 128 + signum ))"` or emit per-signal exits as the per-signal style already does |
| B2 | `bash-trap-builder` | UI text says ERR "only fires while set -e is active". It does not need `set -e`; it fires under the same *conditions* as errexit. The builder also never offers `set -E`, so ERR does not reach functions: the exact failure our own safe-template guide opens on. | `BashTrapBuilder.tsx` ≈L23, L40, L487. Real run here: `bash -c 'trap "echo ERR fired" ERR; false; echo after'` printed `ERR fired`, no `set -e` involved | S |
| B3 | `bash-boilerplate-generator` | With **lock** and **trap** both on, the output has `trap 'rm -f "$LOCKFILE"' EXIT` and later `trap cleanup EXIT INT TERM`. The second **replaces** the first, so the lock file is never removed and the next run says "Already running". The lock is also a check-then-write PID file (racy), and `cleanup` does not exit on INT/TERM (same as B1). | `BashBoilerplateGenerator.tsx` L158–163 and L178 | S–M: one `cleanup` that removes the lock; `flock` instead of the PID file |
| B4 | `path-debugger` | "exists"/"missing" badges look like filesystem checks but are guessed from a path-prefix whitelist; an entry is "missing" only if it contains `nonexistent` or `..`. A browser cannot check the disk. | `PathDebugger.tsx` `classifyEntry()` ≈L20–30 | S: relabel as "can't verify from the browser" and generate a one-line shell check (F-PATH-1) |

These four are the cheapest improvements on the list and the only ones where the current tool can
actively hurt a user. B1 and B3 contradict the site's own guides (`safe-bash-script-template`,
`bash-scripts-that-survive-cron`), which matters for AI citation: a model that reads both will
notice.

## 1. Cross-cutting (one change, all tools)

| # | Feature | Why | Impact | Effort |
|---|---|---|---|---|
| X1 | **Share links in the URL hash** for the 10 tools without one (only `bash-exit-code-lookup` `?code=` and `shellcheck-error-decoder` `#SC2086` have them) | Every incumbent people link to has a permalink: crontab.guru `#…`, explainshell `?cmd=`, regex101, play.jqlang.org, Rynctl. Links are the stated lever for Google (`INDEXING-AUDIT-2026-09-20`: "tools earn links"). A share link is what gets pasted into a Stack Exchange answer or a Slack thread. | **H** | M: a shared `useHashState(schema)` hook in `shared/`, then ~20 lines per tool |
| X2 | **Reverse mode: paste a command → explanation** for chmod, rsync, find, grep | explainshell owns "what does this command do", its man pages are stale by its own README, and no competitor explains an rsync or find line flag by flag *and* lets you edit it. Our builders already hold per-flag explanations; parsing the command back into builder state reuses them. | **H** | M per tool (L for find, whose grammar has operators) |
| X3 | **"Next tool" chaining**: cron builder → wrapper generator → exit-code lookup (124/137) → trap builder, with state carried in the hash | No incumbent has a pipeline. It is also the natural toolkit funnel (`cron-wrapper.sh`, `bashlib.sh`). | M | S once X1 exists |
| X4 | `/` to focus the main input on every tool (only the ShellCheck decoder has it) | parity, keyboard users | L | S |
| X5 | "Download as .sh" on the three generators (boilerplate, trap, cron wrapper) | Rynctl has `.sh` export; saves a copy-paste step for the scripts the toolkit also sells | L–M | S |

## 2. Per tool (ranked features, 2–3 each)

### 2.1 `shellcheck-error-decoder` (the one tool with Bing impressions)

Incumbents: shellcheck.net (live lint), the ShellCheck wiki (one page per code, with an
**Exceptions** section). Our decoder has 31 codes in `shared/shellcheckData.ts`. Anything else
returns "not found".

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | **Unknown code → graceful fallback**: link to `https://www.shellcheck.net/wiki/SCxxxx` and log nothing. Today a user who pastes SC2155 hits a dead end on our page and leaves for the wiki anyway. | H | S |
| 2 | **Grow to the codes people paste**: add SC1017 (CRLF, needed by the new `fix-bad-interpreter-crlf` snippet), SC2155, SC2164, SC2181, SC2206, SC2207, SC2068, SC2044, SC1091, SC2012. Each verified with ShellCheck 0.11.0 on this box before it goes in, like the existing 31. | H | M |
| 3 | **"When it's safe to disable"** field per code (the wiki's Exceptions), shown with the `# shellcheck disable=` line we already generate | M | S per code |

### 2.2 `cron-job-builder`

Incumbents: crontab.guru (free-text with live validation, next runs, share hash, examples, links to
systemd.guru), crontab-generator.org (multi-select, output handling), cron.help. Ours: five
`<select>` fields with fixed options (you cannot build minute 7 or hour 3 except through the decode
box), next 10 runs, full crontab line with log redirect, `PATH`, `MAILTO`, `flock`.

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | **Free-text fields with per-field validation** (keep the selects as presets), weekday `7` and `JAN`/`MON` names (today `parseField(dow, 0, 6)` rejects 7) | H | M |
| 2 | **Day-of-month + day-of-week OR warning**: "`0 3 1-7 * 1` runs on the 1st–7th **and** every Monday". Quoted from `man 5 crontab`, proven in the new `systemd-timers-vs-cron` guide. crontab.guru does not warn about it. | H (unique, citable) | S |
| 3 | **Export as a systemd timer**: the `.service` + `.timer` pair with `OnCalendar=` and `Persistent=true`, next runs checked against `systemd-analyze calendar` semantics, linking the new guide. This is the runner-up tool from the research folded into an existing page instead of a new one. Also covers the missed-run story (cron skipped 3 of 4 Sundays on this box). | H | M–L |

Also: a share hash (X1). crontab.guru's hash is the reason people link it.

### 2.3 `chmod-permissions-builder`

Incumbents: chmod-calculator.com (octal ↔ symbolic), chmodcommand.com (special bits, `-R`,
`--preserve-root`, symbolic command output, programmatic per-octal pages, `ls -l` preview).

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | **Symbolic in and out**: parse `u+x,g-w` and `rwxr-x---`; output both `chmod 750 f` and `chmod u=rwx,g=rx,o= f` | H | S–M |
| 2 | **"What can this user actually do?"**: owner/group/other plus the parent directory's `x` bit (a file at 644 in a 700 directory is unreadable to others). No incumbent explains the parent-directory rule. | M–H (unique) | M |
| 3 | **Files vs directories + umask**: the `find . -type d -exec chmod 755 {} + ; find . -type f -exec chmod 644 {} +` split (links `find-command-builder`) and a umask → default-mode calculator | M | S |

Programmatic per-octal pages (chmodcommand's play) are deliberately **not** proposed: thin pages
are what the 2026-08-28 prune was about.

### 2.4 `bash-exit-code-lookup`

Incumbents: TLDP ABS exit-codes table, TmuxAI's exit code encyclopedia (55 codes across bash,
coreutils/timeout, curl, systemd, sysexits, signals; a page per code with a quick fix), Komodor for
Docker/Kubernetes 125–127/137/143. Ours: 15 hand-written codes + the 128+n signal rule, handler
snippet, `?code=` share.

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | **Per-command code tables**: `timeout` 124/125/126/127 (our own cron wrapper emits 124 and this tool does not know it), `grep` 1 vs 2, `curl` 6/7/22/28, `rsync` 23/24, `ssh` 255, `systemctl is-active` 3/4 (used in the auto-restart guide), sysexits 64–78. A "which command?" selector. | H | M |
| 2 | **Container context for 137 / 143**: OOMKilled vs `docker stop` vs `kill -9`, and how to tell (`docker inspect --format '{{.State.OOMKilled}}'`, `dmesg`). High-demand codes, and TmuxAI does not cover containers. | M–H | S |
| 3 | **"Quick fix" steps** per code, linking our snippets (127 → `path-debugger`, 126 → `fix-bad-interpreter-crlf` + chmod builder, 124 → `bash-timeout-command`) | M | S |

### 2.5 `jq-filter-builder`

Incumbent: play.jqlang.org (jqplay.org redirects there): real jq in WebAssembly, free-form query,
`-r/-s/-c`, fetch JSON by URL, share links. It lacks click-to-build, plain-English explanations and
the generated `curl … | jq` line, which are ours.

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | **Editable filter box** fed by the click-builder (the builder becomes the on-ramp, not a ceiling), with the live preview | H | M |
| 2 | **Common transforms as buttons**: `length`, `keys`, `map(…)`, `sort_by`, `group_by`, `@csv`/`@tsv` to a file, `-c`, `-s` | M | M |
| 3 | **Exact output via jq-wasm** (the approach play.jqlang uses) so the preview is real jq, not a JS approximation; check the bundle size against the tool page budget first | M | L |

### 2.6 `grep-pattern-builder`

Incumbent: regex101 (real POSIX BRE and ERE flavours, a token-by-token explanation panel,
substitution, unit tests, permalinks). It never emits a grep command with flags; we do.

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | **Pattern explanation panel**: token-by-token in plain English, flavour-aware (BRE `\+` vs ERE `+`). Also warns when a PCRE-only construct (`\d`, lookaround) is used without `-P`, and when `-P` will fail on macOS BSD grep. | H | M |
| 2 | **Missing flags**: `-F`, `-o`, `--exclude-dir`, `-e` for patterns starting with `-`; quote the path | M | S |
| 3 | **ripgrep equivalent** of the built command (`rg` flag mapping, including `-F`, `-g`, `--hidden`) | M | S |

### 2.7 `rsync-command-builder`

Incumbents: Rynctl (trailing-slash explanation, SSH port and key, share links, `.sh` history
export, flag explainer, `--delete` warning), RapidToolSet, cmdgenerator, Rsyncinator (not fetched).
Ours: `-avz`, `--delete`, `--dry-run`, `--partial --progress`, `--bwlimit`, excludes, 3 presets.
Paths are not quoted (a space breaks the command).

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | **Trailing-slash visualiser**: show the resulting tree for `src` vs `src/` side by side. It is the #1 rsync confusion and the angle of wave-2 article #18 (`rsync projects` and `rsync projects/` make two different backups). Rynctl explains it in text; nobody draws it. | H | M |
| 2 | **SSH options + quoting**: `-e 'ssh -p 2222 -i ~/.ssh/key'`, quote every path, `-h`, `--info=progress2`, `--itemize-changes`, `--exclude-from` | M | S |
| 3 | **`--link-dest` snapshot preset**: dated hard-link snapshots, which pairs with `create-dated-folder` and `log-retention-cleanup` and the toolkit's `backup.sh` | M | M |

### 2.8 `find-command-builder`

Incumbents: cmdgenerator.org (`-maxdepth`, `-empty`; copy only), explainshell (explains any
`find` line from man pages, with share links). Ours already explains each token and orders tests
before actions. It still lacks the depth and grouping operators.

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | **Missing tests**: `-maxdepth`/`-mindepth` (needed by the new `argument-list-too-long` fix), `-empty`, `-perm`, `-user`, `-newer`, and quoting the path | H | S–M |
| 2 | **Real `-prune` exclude** (`\( -path ./node_modules -prune \) -o … -print`). Today's `-not -path` still descends, and the tool says so; offering the fix is better than the caveat. | M | M |
| 3 | **Paste a find command → explain + edit** (X2 for find): the explainshell intent, with our safe-ordering warnings | M | L |

### 2.9 `cron-wrapper-generator`

Incumbents: cronic (mail only on failure), runitor (healthchecks.io start/success/fail pings),
healthchecks.io's bash docs (`curl -m 10 --retry 5 …/$?`). Ours: flock, timeout, retry with
backoff, timestamped log, `mailx` alert. The schedule field is not validated.

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | **Heartbeat/webhook alerts**: healthchecks-style start/success/exit-code ping, ntfy or Slack webhook (reusing `bash-slack-webhook-alerts`), not only `mailx`. Most boxes have no MTA: on this one cron has logged `No MTA installed, discarding output` 192 times since 9/01. | H | M |
| 2 | **Validate the schedule** with the cron builder's parser, and show the next runs | M | S |
| 3 | **systemd export**: the same wrapper as `ExecStart=` in a `.service` + `.timer` with `Persistent=true`, `TimeoutStartSec=`, `OnFailure=` (the new guide shows each on this box) | M–H | M |

### 2.10 `bash-trap-builder`

No dedicated trap generator exists elsewhere; the SERP is articles. So correctness matters more
than features here: fix B1 and B2 first.

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | B1 + B2, then a **`set -E` toggle** on by default when ERR is selected | H | S |
| 2 | **`mktemp -d` temp-directory option** (one `rm -rf` instead of per-file) and **re-raise the signal** option (`trap - INT; kill -INT $$`) so the parent shell sees the real signal status | M | S |
| 3 | **Live "what happens when…" panel**: for EXIT / ERR / INT / TERM, list in order which handler lines run and the resulting exit code, from the generated code | M | M |

### 2.11 `bash-boilerplate-generator`

Incumbents: bash3boilerplate (usage-driven argument parsing with long options, leveled stderr
logging, `NO_COLOR`, `__dir`, Bash 3 compatibility), commandlinux's generator (8 modules including
long options, `flock`, dependency check).

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | B3, then **`flock` lock** instead of the PID file | H | S |
| 2 | **Long options** (`--help`, `--dry-run`) via a `while/case` parser, and a **dependency check** (`command -v` for listed tools) | M | M |
| 3 | **`warn`/`die` to stderr + `SCRIPT_DIR`** helper, matching the toolkit's `bashlib.sh` names so the upgrade path is one `source` line | M | S |

### 2.12 `path-debugger`

Incumbents are all CLI (pathdebug, justpath, pathvar); no strong web tool. Our own dev.to post
ranks in this SERP.

| Rank | Feature | Impact | Effort |
|---|---|---|---|
| 1 | B4, plus **F-PATH-1: a generated one-liner that checks every entry for real** (`IFS=: read -ra d <<<"$PATH"; for x in "${d[@]}"; do [[ -d $x ]] || echo "missing: $x"; done`) | M | S |
| 2 | **"Where is PATH set?"**: the grep across `~/.bashrc ~/.bash_profile ~/.profile /etc/environment /etc/profile.d/*` that finds the line adding a duplicate | M | S |
| 3 | **Shadowing explainer**: paste `type -a python3` output → which binary wins and why; normalise trailing `/` and `~` before counting duplicates | L–M | S |

---

## 3. Ranked backlog (impact first, then effort)

| Order | Item | Tool(s) | Impact | Effort |
|---|---|---|---|---|
| 1 | B1, B2 | trap builder | H | S |
| 2 | B3 | boilerplate | H | S |
| 3 | ShellCheck unknown-code fallback | decoder | H | S |
| 4 | DOM/DOW OR warning | cron builder | H | S |
| 5 | X1 share-hash hook (then roll out: cron, chmod, rsync, find, jq) | all | H | M |
| 6 | Free-text cron fields + weekday 7 + names | cron builder | H | M |
| 7 | Per-command exit code tables (timeout 124 first) | exit codes | H | M |
| 8 | Symbolic chmod in/out | chmod | H | S–M |
| 9 | find `-maxdepth`/`-empty`/`-perm`/quoting | find | H | S–M |
| 10 | Grow ShellCheck DB (SC1017 first) | decoder | H | M |
| 11 | B4 + real PATH check one-liner | PATH | M | S |
| 12 | Heartbeat/webhook alerts | cron wrapper | H | M |
| 13 | rsync trailing-slash visualiser | rsync | H | M |
| 14 | grep pattern explanation panel | grep | H | M |
| 15 | jq editable filter | jq | H | M |
| 16 | systemd timer export | cron builder, cron wrapper | H | M–L |
| 17 | Everything else in §2 | — | M/L | — |

Items 1–4 fit in one session together and fix every place a tool currently contradicts a guide.
Items 5–10 are the "top competitor" set for the three tools with measured demand. Suggested order
relative to the Open Ports Explainer: 1–4 before it (small, protect credibility before a Show HN
sends people to the tools index), 5 alongside it (the new tool needs the same share-hash hook),
the rest after the 11/04 read, and only under a maintain verdict.

## 4. Sources (checked 2026-09-28)

- crontab.guru https://crontab.guru/ · crontab-generator.org https://crontab-generator.org/ · cron.help https://cron.help/
- chmod-calculator.com https://chmod-calculator.com/ · chmodcommand.com https://chmodcommand.com/
- TLDP exit codes https://tldp.org/LDP/abs/html/exitcodes.html · TmuxAI https://tmuxai.dev/exit-codes/ · Komodor https://komodor.com/learn/exit-codes-in-containers-and-kubernetes-the-complete-guide/
- pathdebug https://github.com/d-led/pathdebug · justpath https://github.com/epogrebnyak/justpath · pathvar https://pypi.org/project/pathvar
- bash3boilerplate https://github.com/kvz/bash3boilerplate · commandlinux https://commandlinux.com/free-tools/bash-script-boilerplate-generator
- Rynctl https://rynctl.com/ (RapidToolSet, cmdgenerator rsync, Rsyncinator found but not fetched)
- regex101 https://regex101.com/
- shellcheck.net https://www.shellcheck.net/ · wiki https://www.shellcheck.net/wiki/SC2086
- redsymbol exit traps http://redsymbol.net/articles/bash-exit-traps/
- cmdgenerator find https://cmdgenerator.org/cmd-generators/find/ · explainshell https://explainshell.com/
- cronic https://habilis.net/cronic/ · runitor https://github.com/bdd/runitor · healthchecks.io https://healthchecks.io/docs/bash/
- play.jqlang.org https://play.jqlang.org/ (jqplay.org redirects; jqkungfu not checked)

Unverified: chmod-calculator.com's support for special bits and sharing (not in the fetched page
text); cron.help's timezone handling; the exact number of ShellCheck wiki pages.
