# Next free tool: research and recommendation (2026-09-28)

Research only. Nothing built, edited, committed or deployed. Written by Claude Code for Travis.

**Recommendation: build the Open Ports Explainer (`/tools/open-ports-explainer`).** You paste the
output of `ss -tulpn` / `ss -ltnpe` / `netstat -tulpn` / `lsof -i -P -n`, and the tool explains every
listening socket in plain English: who can reach it, what it probably is, whether it is a known
foot-gun, and the next command to run. Everything happens in the browser.
**Runner-up: the Cron → systemd Timer Generator**, which turns a crontab line into a complete
`.service` + `.timer` pair with install commands.

The reasoning in one paragraph: the biggest demand cluster we have measured is open ports. It is **104
of the 396 Bing queries (26 %)** and 135 impressions, and today only the guide plus three snippets serve
it. The open-ports questions on Stack Exchange run to millions of views. **No tool anywhere parses
pasted `ss`/`netstat` output.** Every incumbent is either a man-page article or an *external* port
checker. We already wrote the knowledge the tool needs, from real runs on this box
(`src/content/guides/open-ports-linux.mdx`). The tool turns that prose into something people can use,
link to and cite.

---

## 1. Inventory: what already exists (no duplicates allowed)

Tools are registry-driven. There are 12 entries in `src/lib/tools.ts`, one component each in
`src/components/tools/`, and all of them render through `src/app/tools/[slug]/page.tsx` → `ToolRenderer.tsx`.

| # | Slug | Component | What it does / target intent | Signals in the docs |
|---|---|---|---|---|
| 1 | `bash-exit-code-lookup` | `BashExitCodeLookup.tsx` | exit code 0–255 → meaning, causes, handler | none recorded |
| 2 | `cron-job-builder` | `CronJobBuilder.tsx` | visual cron expression + plain-English schedule | GA4 2 landings (Jun–Sep) |
| 3 | `chmod-permissions-builder` | `ChmodPermissionsBuilder.tsx` | chmod octal/symbolic builder | GA4 1 landing; May r/learnprogramming post 1.8K views |
| 4 | `path-debugger` | `PathDebugger.tsx` | paste `$PATH` → duplicates/empties/order | none |
| 5 | `bash-boilerplate-generator` | `BashBoilerplateGenerator.tsx` | strict-mode script template + traps + argparse | none |
| 6 | `rsync-command-builder` | `RsyncCommandBuilder.tsx` | rsync flags builder | none |
| 7 | `grep-pattern-builder` | `GrepPatternBuilder.tsx` | grep flags + tester (BRE aware) | none |
| 8 | `shellcheck-error-decoder` | `ShellcheckErrorDecoder.tsx` | SC code → explanation + fix; hub for 7 `/shellcheck/<code>` pages | Bing 28 imp @ 6.21 (legacy `.html`); GA4 2; Show HN title drafted (POST-QUEUE §E) |
| 9 | `bash-trap-builder` | `BashTrapBuilder.tsx` | trap/signal handler block | none |
| 10 | `find-command-builder` | `FindCommandBuilder.tsx` | find tests/actions, safe ordering | none |
| 11 | `cron-wrapper-generator` | `CronWrapperGenerator.tsx` | flock + timeout + retry + log + mail wrapper | none |
| 12 | `jq-filter-builder` | `JqFilterBuilder.tsx` | click-through JSON → jq filter + live preview | none |

These are **excluded** as duplicates: cron expression builder, chmod calculator (and umask, which
belongs in the chmod tool if anywhere), find/xargs builder, rsync builder, strict-mode/error-handling
scaffolder, trap builder, ShellCheck explainer, grep tester, jq playground.

**Gaps confirmed by grep across `src/`:** the words `systemd timer`, `OnCalendar` and `.timer` appear in
**zero** tools, guides or snippets. No tool touches networking or ports. No tool takes pasted command
*output* except `path-debugger`.

The older projects add nothing new. `~/Projects/bash-snippets/tools/` holds the six original HTML
versions of tools 1–5 and 8, all ported already. `~/bashsnippets-studio/` is a two-file demo folder
with no tool ideas in it.

## 2. The demand we own: the 396 Bing queries

Source: `docs/PLAN.md` §3, from the full pull on 2026-09-01. The raw export is not in the repo; the
only `Queries.csv` on disk, `~/Downloads/Queries.csv`, is Beach House Moving data. So the clustered
table in PLAN.md is the data of record.

| Cluster | Queries | Impr | Pos | Tool opportunity |
|---|---|---|---|---|
| **open ports / ss / netstat** | **104** | **135** | 7.3 | **none exists anywhere; winner** |
| strict mode / pipefail / trap ERR | 35 | 60 | 6.1 | taken (boilerplate, trap) |
| backup / mysql / dated folder | 32 | 46 | 5.4 | weak tool fit |
| flock / cron overlap | 23 | 43 | 5.2 | taken (cron-wrapper); systemd timer is the adjacent gap |
| disk usage threshold | 23 | 40 | 5.7 | weak tool fit |
| ShellCheck codes | 17 | 35 | 6.0 | taken |
| service watchdog | 13 | 19 | 5.3 | systemd unit generation (runner-up family) |
| kill process by name | 11 | 12 | 7.6 | folds into the ports tool (kill-by-port next step) |

On Copilot, 43 of 111 citations go to `/guides/bash-scripts-that-survive-cron`, and the top grounding
query is "cron jobs serverless timeouts retries gotchas" with 31 citations. That makes scheduling the
runner-up family. PLAN.md also warns: "works interactively, fails in cron" = **zero queries in 396**,
so a crontab linter should not be built on instinct.

## 3. Pain-point evidence from outside the site

**Stack Exchange** (read via the public API on 2026-09-28; view counts):

- *How to know what program is listening on a given port?* (askubuntu): **1,114,892**
- *How can I see what ports are open on my machine?* (askubuntu): **1,001,830**
- *Finding the PID of the process using a specific port?* (unix.SE): **2,230,939**
- *Port seems to be open, but connection refused* (askubuntu): 349,259. This is the classic
  "bound to 127.0.0.1" confusion, which the tool diagnoses from the address column.
- *How to check that a daemon is listening on what interface?* (unix.SE): 123,040
- *has netstat been replaced with a new tool?* (askubuntu): 126,591
- *What is cslistener?* (askubuntu): **112,068**. People paste output, see an `/etc/services` name, and
  have no idea what it is. This is exactly the tool's use case.
- *How to prevent ntpd to listen on 0.0.0.0:123?* (serverfault): 80,180
- *Why does UFW not block the ports that have been exposed using docker?* (serverfault): 4,479. Low on
  SE, but it is a famous r/selfhosted foot-gun, with its own GitHub fix project (chaifeng/ufw-docker)
  and several 2025–26 tutorials.

For comparison, the systemd-timer questions (unix.SE): *Cron vs systemd timers* 97,720 · *systemd timer
every 15 minutes* 128,860 · *Run script every 30 min with systemd* 92,041 · *Does systemd timer skip the
next run if the process hasn't finished?* 16,897. The top general bash/cron questions (script dir, file
exists, list all cron jobs 1.28M, cron env vars 482K) are answer-in-prose questions, not tool-shaped.

**Port-name questions, where the SERP is fragmented.** Searching "port 5355 listening linux what is it"
returns CBT Nuggets, a GitHub issue, the Arch forums and two personal blogs. No authority owns
"what is this listener on my Linux box". The same pattern holds for `127.0.0.53:53` (systemd-resolved
docs, Arch forums, small blogs). A low-authority site with a good answer can get cited here.

## 4. Candidates scored

Scale 1–5, higher is better. For build effort, 5 = cheapest. The funnel column is fit with the $9
toolkit (`backup.sh`, `healthcheck.sh`, `cron-wrapper.sh`, `cleanup.sh`, `bashlib.sh`, `template.sh`).

| Candidate | Pain | Volume | Weak competition | Linkable | Mesh fit | Effort | Funnel | AI cite | **Total /40** |
|---|---|---|---|---|---|---|---|---|---|
| **Open Ports Explainer** (paste ss/netstat/lsof) | 5 | 5 | 5 | 4 | 5 | 4 | 2 | 5 | **35** |
| **Cron → systemd timer + service generator** | 4 | 3 | 3 | 3 | 5 | 4 | 4 | 4 | **30** |
| Crontab auditor (paste whole crontab) | 4 | 3 | 4 | 3 | 3 | 4 | 4 | 3 | 29 |
| journalctl query builder | 4 | 4 | 3 | 2 | 3 | 5 | 2 | 3 | 26 |
| One-liner explainer (explainshell alternative) | 4 | 4 | 3 | 4 | 3 | 1 | 2 | 3 | 24 |
| tar command builder | 3 | 4 | 1 | 1 | 2 | 5 | 1 | 2 | 19 |
| SSH config generator | 3 | 3 | 1 | 1 | 3 | 5 | 1 | 2 | 19 |
| sed/awk tester | 3 | 3 | 2 | 3 | 3 | 2 | 1 | 2 | 19 |
| Parameter-expansion playground | 2 | 2 | 2 | 2 | 4 | 4 | 1 | 2 | 19 |
| AI natural-language → command | 3 | 4 | 1 | 2 | 2 | 1 | 1 | 1 | 15 |

Why the losers lose:

- **tar and SSH config** are saturated. There are at least 4 tar generators (commandlinux,
  peoplearegeek, tarcommand.com, devtoolsdaily, cmdgenerator) and at least 9 SSH config generators
  (linuxhandbook, linuxconfig, dev-toolbox, devtoollab, ctrlops, sshworkbench, servercompass…).
- **sed/awk:** sandbox.bio already runs real sed/awk/grep in WebAssembly (it was a Show HN). We would
  have to ship WASM to compete.
- **One-liner explainer:** explainshell's man pages are admittedly stale (idank/explainshell
  README), but a replacement needs a man-page parsing pipeline. That is a backend-sized build, and
  Warp and AI chat already absorb this intent.
- **AI generator:** it needs a backend and API spend, ChatGPT itself is the incumbent, and it conflicts
  with the "real runs only" voice.
- **Parameter expansion:** bash-expansion.utils.com exists, and search demand is small.
- **journalctl builder:** real demand (the SE questions are 2.2M + 1.1M views), but inventivehq and
  cmdgenerator already cover it, and it links to only one guide.
- **Crontab auditor:** the gap is real (only CLI linters exist: chkcrontab, cron-lint ×3). But its best
  checks (PATH, `%`) target the intent that scored **0 of 396** queries, and it overlaps two existing
  cron tools. Fold its checks into the runner-up.

## 5. Winner: Open Ports Explainer

### Concept

The route is `/tools/open-ports-explainer`. Working H1: "Open Ports Explainer: paste `ss -tulpn`, see
what is actually exposed". The pitch: *a listener on `0.0.0.0` is reachable from the network whatever
you think your firewall does, and `ss` will not tell you which rows are dangerous.*

### Inputs

- A textarea for pasted output. Auto-detect the format: `ss -tulpn`, `ss -ltnpe` (with the `cgroup:`
  column, which is the guide's no-root trick), `ss -tuln` (no process column),
  `netstat -tulpn` / `-tlnp`, `lsof -i -P -n`, and `docker ps` PORTS (optional second box).
- A "Load example" button that uses the **real** output already published in the guide (this box,
  docker-proxy on 0.0.0.0:3000, systemd-resolved, Tor 9050, etc.). That keeps the real-runs-only rule.
- A redaction toggle, **on by default**. It masks non-loopback IPs in the rendered result and in the
  share link. This is required by the terminal-output PII rule.

### Outputs, one card per socket

1. **Reachability scope**, not reachability itself: loopback only (`127.x`, `::1`, `%lo`), a
   specific interface address (LAN / VPN / tailscale range), all IPv4 (`0.0.0.0`), all IPv6 (`[::]`,
   with a note on `v6only`), or dual-stack wildcard (`*`). The wording is fixed as "who *could* reach
   this", and the tool states in plain words that it cannot see your firewall, cloud security group
   or NAT.
2. **Identity:** the process and PID from `users:((...))`, or the systemd unit from `cgroup:`
   (guide §"Without root"), plus a curated port note (~120 entries, not the IANA dump). Examples:
   22 sshd, 53 on 127.0.0.53 systemd-resolved stub, 5355 LLMNR (systemd-resolved, disable with
   `LLMNR=no`), 5353 avahi/mDNS, 631 CUPS, 9050 Tor, 11434 Ollama, 3000/5173/8080 dev servers,
   5432, 3306, 6379, 27017, 9200, 2375 (Docker API, critical if not loopback), ephemeral range
   32768–60999.
3. **Flags**, severity-ranked:
   - database / cache / Docker API on a wildcard address;
   - `docker-proxy` on `0.0.0.0` (published ports skip ufw's INPUT chain; fix
     `-p 127.0.0.1:3000:8080`);
   - an empty process column (you are not root: re-run with `sudo` or use `ss -ltnpe`);
   - `Recv-Q` near `Send-Q` on a LISTEN row (backlog full: the hung-but-active signature, which links
     the service guides);
   - UDP shown as `UNCONN` (normal);
   - a `*:port` socket listed under IPv6 only (normal on Linux).
4. **Next command** per row, as a copy button: `ss -ltnpe 'sport = :PORT'`,
   `fuser -v PORT/tcp`, `systemctl status UNIT`, the bind-to-loopback fix per service, and a link to
   `kill-process-on-port`.
5. **Summary strip:** "N listeners, M reachable from the network, K flagged". There is a **Copy
   baseline** button, whose CTA is to *turn this into a nightly diff* → `ports-audit` snippet →
   schedule it with `cron-wrapper-generator`. That is the funnel path (see Risks).

### Build

Same pattern as `path-debugger`: one client component `OpenPortsExplainer.tsx`, a registry entry,
and a `ToolRenderer` map line. The parser plus the port table live in `shared/portData.ts`. It reuses
`useClipboard.ts` and `bashHighlight.ts`. There is no backend, and the share link is a URL *hash* so
nothing reaches the server. Estimate: 1–2 Claude Code sessions. Quick answer, FAQs and HowTo follow the
`content-standards` skill. Before shipping, re-run every example on this box.

### Target keywords

- Primary: `ss -tulpn explained`, `ss output explained`, `what is listening on port linux`,
  `check open ports linux`, `is my port exposed to the internet linux`, `netstat -tulpn output meaning`.
- Secondary (FAQ / AI-citation targets): `0.0.0.0 vs 127.0.0.1 listening`, `what is 127.0.0.53`,
  `port 5355 linux systemd-resolved`, `what is cslistener`, `docker port bypass ufw`,
  `ss process column empty`, `port open but connection refused`.

### SERP teardown: incumbents and what they miss

| Incumbent | What it does well | What it misses |
|---|---|---|
| Man-page articles (GeeksforGeeks, phoenixNAP, Linuxize, site24x7, Rackspace, youstable, oneuptime) | explain the flags `-t -u -l -p -n` | explain the *command*, never *your output*; no exposure verdict; none mention the `-e` cgroup trick or docker-proxy |
| askubuntu / unix.SE answers (1–2M views) | the right command | static, fragmented across 6+ threads; the "what is this port" follow-up is a new question every time |
| External port checkers (yougetsignal, canyouseeme, nmap online) | real outside-in reachability | need a public IP and a backend, show one port at a time, cannot see loopback or name the process; a different intent |
| Port databases (speedguide, CBT Nuggets "What is port X") | port → protocol trivia | Windows-centric, not Linux-daemon-aware (no systemd-resolved / avahi / Ollama context), ad-heavy |
| explainshell | parses the *command line* | stale man pages (acknowledged in its README); does not read output at all |
| Our own guide (`/guides/open-ports-linux`) | the only source with the `-e` no-root trick + docker-proxy + backlog meaning, all on real runs | prose only; the reader still has to map their own rows by hand |

**The gap:** "paste output → per-row verdict + next command" does not exist. Searches for a paste
analyzer turned up nothing but man-page articles.

### Internal link mesh

- **Into the tool** (one line each, a "Paste your output into the Open Ports Explainer" callout):
  `/guides/open-ports-linux` (after the address-column table and in the ss section),
  `/snippets/list-open-ports-linux` (the highest-impression page on the site, 154 imp),
  `/snippets/ports-audit`, `/snippets/kill-process-on-port`, `/snippets/find-ip-address-linux`
  (for the "which interface is 192.168.x" follow-up), `/guides/auto-restart-linux-service` (backlog
  signature), `/tools` index.
- **Out of the tool** (`relatedSnippets`): `list-open-ports-linux`, `ports-audit`,
  `kill-process-on-port`; the per-flag links go to `/guides/open-ports-linux#…`, `service-watchdog`,
  `ssh-key-setup-script` (for 22 on 0.0.0.0), and `cron-wrapper-generator` (to schedule the audit).
- Update `public/llms.txt` (tools section + counts). The sitemap picks up the registry, then run
  `npm run indexnow`.

### Distribution plan

- **dev.to / Medium / CoderLegion (canonical → tool page).** Angle, from the real run already in the
  guide: *"My laptop had a port open to the whole network for months. `ss` showed it on line one and
  I read straight past it."* That is docker-proxy on `0.0.0.0:3000` publishing Open WebUI. Walk through
  reading the address column, the `-e` trick, and why ufw would not have helped. Claim the ufw bypass
  **only if it is reproduced on this box first** (real-runs rule). Add it as #15 after the scheduled
  queue (which is full Tue/Thu to 11/3), or swap it for a reserve slot. Tags: `linux`, `security`,
  `docker`, `bash`.
- **Show HN.** "Show HN: Paste your `ss -tulpn` output and see what is actually exposed". It runs in
  the browser, needs no signup, and there is a load-example button, which matches Show HN's "something
  people can try" + low-barrier rules. Travis must be in the thread. Space it at least 2 weeks after the
  ShellCheck-decoder Show HN (earliest 9/29) → **no earlier than ~10/13**. Lead with the privacy answer
  (client-side, redaction on by default), because it will be the first question.
- **Reddit** (rules as read 9/11 in `POST-QUEUE-2026-09.md` §F; re-read live before posting):
  - r/linuxadmin allows links that add value beyond the manpage; the per-row verdict does.
  - r/linux4noobs / r/linuxquestions: answer "what are these ports" threads in full in the comment,
    with **no link** on r/linuxquestions.
  - r/selfhosted is the natural home for the docker-proxy/ufw angle, but its rules could not be fetched
    on 9/28, so read them before posting.
  - Never r/sysadmin. On r/commandline, your own words only.
- **Listings:** awesome-sysadmin (Networking/monitoring tools; they need a positive discussion
  link, so post after HN), plus the free-tools directories.

### Success metrics (read 2026-11-30, when GSC reopens; interim 11/04)

- Bing WMT: tool URL indexed ≤ 14 days after IndexNow; **≥ 50 impressions / 28 d** on the tool URL
  by 11/30; open-ports cluster impressions up vs the 135 baseline.
- Copilot (AI Performance): **≥ 5 citations** on the tool URL by 11/30.
- **≥ 1 earned, followed link** to the tool URL (HN, Reddit, awesome-list). This is the lever that
  `INDEXING-AUDIT-2026-09-20.md` says moves Google ("tools earn links, articles don't").
- GA4: ≥ 30 non-direct sessions landing on the tool; ≥ 1 `toolkit_cta_click` with `placement=tool`
  from this URL.
- Kill / no-follow-up signal: 0 Bing impressions after 45 days → do not build per-port pages.

### Risks

1. **False reassurance.** "Loopback only" is safe, but "0.0.0.0" is only *potentially* reachable.
   Firewall, NAT and cloud security groups are invisible. Container ports that are not published live
   in another namespace and never appear. Mitigation: fixed wording ("scope, not reachability"), plus
   a callout linking the guide's "from outside" section.
2. **Parser brittleness.** Column widths vary across `ss` versions, `%iface` scopes, `[::ffff:…]`,
   truncated process names, and netstat locale headers. Mitigation: token-based parsing, a
   per-format fixture set captured on this box, and a visible "could not parse line N" message.
3. **Weak funnel.** The toolkit has no ports script. The honest path is ports tool → `ports-audit`
   (free) → schedule it → cron-wrapper / toolkit. Expect traffic and links, not sales. That is the
   right trade while the stated constraint is demand.
4. **Timing.** It will not change the 11/04 read (5 weeks, Bing lag). It is a traffic and link bet
   that lands after the read.
5. **Pasted identifiers.** Users paste real IPs into share links, hence the redaction default and no
   server round-trip.
6. **Security framing.** Keep it defensive: your own box, your own output. It must not become a
   scanner.

## 6. Runner-up: Cron → systemd Timer Generator (`/tools/systemd-timer-generator`)

- **Concept.** Input a crontab line (or pick a schedule), the command, the user, and options.
  Output: `name.service` + `name.timer` with `OnCalendar=` translated, the plain-English schedule, the
  **next 5 run times** (a JS port of `systemd-analyze calendar` semantics), `Persistent=true` (catch
  missed runs, which cron cannot), `RandomizedDelaySec=`, `TimeoutStartSec=` (replaces `timeout`),
  `OnFailure=` alert unit, `Type=oneshot` (systemd will not start a second copy while one runs, which
  replaces `flock`; the answer to the 16.9K-view "does systemd skip the next run" question), and the
  exact install/verify commands (`daemon-reload`, `enable --now`, `list-timers`, `journalctl -u`).
  It warns where cron and systemd disagree: DOM + DOW is **OR** in cron and **AND** in systemd, and
  `@reboot` becomes `OnBootSec=`.
- **Why it is second.** It has the best AI-citation adjacency on the site: it extends the cron guide
  (43 of 111 Copilot citations, top grounding query) and links `cron-job-builder`,
  `cron-wrapper-generator`, `bash-flock-single-instance`, `bash-timeout-command`,
  `auto-restart-linux-service` and `service-watchdog`. It also has the **best toolkit funnel** (you
  schedule `backup.sh` / `cleanup.sh` / `cron-wrapper.sh`). But at least 6 competitors exist:
  everprostack (cron ↔ OnCalendar only, a good FAQ, no unit files), mig26 converter (0 stars),
  techopt (unit + timer, but cron conversion is a separate tool, and no next-runs / OnFailure / timeout),
  8gwifi, netoz, mysystemd, and CerealKiller97/systemd-generator. Demand is ~100K-view questions,
  not millions. The gap is real but narrower: **nobody combines "one cron line → the full unit pair
  with next-run preview + OnFailure + the semantic warnings"**.
- **When.** Build it second, and ship the missing "cron vs systemd timers" section in the cron guide
  alongside it.

## 7. Sources

Internal:

- `docs/PLAN.md` §2–3 (396-query cluster table, Copilot numbers)
- `docs/INDEXING-AUDIT-2026-09-01.md`
- `docs/INDEXING-AUDIT-2026-09-20.md`
- `docs/POST-QUEUE-2026-09.md` §E–F
- `src/lib/tools.ts`
- `src/components/tools/`
- `src/content/guides/open-ports-linux.mdx`
- `src/app/starter-kit/page.tsx`

Stack Exchange public API, queried 2026-09-28:

- https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=bash&site=stackoverflow
- https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&site=unix
- https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=cron&site=stackoverflow
- https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=systemd&site=unix
- https://api.stackexchange.com/2.3/search/advanced?q=what%20is%20listening%20on%20port&site=askubuntu
- https://api.stackexchange.com/2.3/search/advanced?q=netstat%20listening&site=unix
- https://api.stackexchange.com/2.3/search/advanced?q=systemd%20timer&site=unix
- https://api.stackexchange.com/2.3/search/advanced?q=docker%20ufw&site=serverfault

Competitors, cron / systemd timers:

- https://crontab.guru/
- https://everprostack.com/tools/systemd-crontab-converter/
- https://github.com/mig26-design/systemd-cron-converter
- https://www.techopt.io/tools/linux/systemd-generator
- https://8gwifi.org/systemd-generator.jsp
- https://netoz.au/tools/systemd-generator
- https://mysystemd.talos.sh/
- https://github.com/CerealKiller97/systemd-generator
- https://github.com/lyda/chkcrontab
- https://github.com/wyn-cmd/cron-lint

Competitors, other command tools:

- https://commandlinux.com/free-tools/tar-command-builder
- https://peoplearegeek.com/tools/tar-command-generator/
- https://tarcommand.com/
- https://cmdgenerator.org/
- https://linuxhandbook.com/tools/ssh-config-generator/
- https://linuxconfig.org/ssh-config-generator
- https://www.dev-toolbox.tech/tools/ssh-config-generator
- https://devtoollab.com/tools/ssh-config-generator
- https://sandbox.bio/playgrounds/sed
- https://news.ycombinator.com/item?id=32181011
- https://bash-expansion.utils.com
- https://inventivehq.com/tools/journalctl-builder
- https://github.com/idank/explainshell
- https://aidevhub.io/shell-command-explainer/
- https://github.com/BuilderIO/ai-shell

Open ports, docker and firewall:

- https://github.com/chaifeng/ufw-docker
- https://www.virtua.cloud/learn/en/tutorials/docker-ufw-firewall-fix-vps
- https://dev.to/kovah/be-careful-with-docker-ports-3pih
- https://www.cbtnuggets.com/common-ports/what-is-port-5355
- https://blog.x-way.org/Linux/2025/10/13/Solving-the-mystery-of-systemd-resolved-listening-on-port-5355.html
- https://www.freedesktop.org/software/systemd/man/latest/systemd-resolved.service.html
- https://www.geeksforgeeks.org/linux-unix/ss-command-in-linux/
- https://docs.rackspace.com/docs/checking-listening-ports-with-netstat

cron vs systemd timers:

- https://unix.stackexchange.com/ ("Cron vs systemd timers", 97,720 views, via the API)
- https://trstringer.com/systemd-timer-vs-cronjob/
- https://docs.aws.amazon.com/linux/al2023/ug/cron.html

Community rules:

- https://news.ycombinator.com/showhn.html
- Reddit rules as recorded in `docs/POST-QUEUE-2026-09.md` §F. reddit.com was not fetchable on
  2026-09-28, so re-read live before posting.

Not reachable this session: reddit.com and stackoverflow.com HTML (API used instead), and Google PAA
(no SERP access).
