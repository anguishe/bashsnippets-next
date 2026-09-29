---
title: "I Opened a Port on Purpose to See If My Audit Would Notice. It Exited 3."
published: true
description: "A port list you read once is a photograph. Baseline every listener, diff the next run, and alert on the one that was not there before. A real run with a throwaway server on 8099."
tags: bash, linux, security, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/ports-audit
cover_image: https://bashsnippets.xyz/ogimage.png
---

At 22:21 on a Monday night I started a web server I had no intention of keeping: `python3 -m http.server 8099 --bind 127.0.0.1`. It is the kind of listener that gets left behind on real machines, a quick file share or a debug endpoint someone meant to stop. Then I asked the audit script whether anything had changed since the baseline it took a minute earlier.

```text
$ export STATE_DIR=$PWD/state
$ ./ports-audit.sh >/dev/null 2>&1          # first run: the baseline
$ python3 -m http.server 8099 --bind 127.0.0.1 &
$ ./ports-audit.sh --diff >/dev/null        # report goes to stderr (trimmed below)
NEW:
tcp,127.0.0.1,8099,unknown,python3
GONE:
(none)
exit=3
$ kill $!; ./ports-audit.sh --diff >/dev/null
NEW:
(none)
GONE:
tcp,127.0.0.1,8099,unknown,python3
exit=3
```

One line appeared, one line disappeared, and each time the script exited 3. A run in between with nothing changed printed `no listener changes since the previous run` and exited 0.

I am showing you only those lines, not my baseline. A full list of what a machine listens on is a map of it, and I would not paste mine into a public post any more than I would paste it into a public issue. The useful part of the output is the difference anyway, and it is usually small enough to read in a notification.

## A listing is a photograph

Most of us check open ports the same way: run `ss -tulpn`, scroll, decide it looks fine, close the terminal. That answers "what is listening right now", once. The listener that matters is the one that was not in the picture: the dev server left running on 8099, the container that published a port after a compose change, the shell someone bound last night. None of them announce themselves, and nobody rereads a long socket list every hour looking for the new one.

So the script does not ask you to read the list. It writes every listening TCP and UDP socket as one CSV line, `proto,address,port,service,owner`, and compares it with the previous run:

```bash
[[ -f "$CURRENT" ]] && mv -f "$CURRENT" "$PREVIOUS"
snapshot > "$CURRENT"
added=$(grep -Fxv -f "$PREVIOUS" "$CURRENT" || true)
removed=$(grep -Fxv -f "$CURRENT" "$PREVIOUS" || true)
```

`grep -Fxv -f` is a whole-line set difference: fixed strings, whole lines only, keep what is not in the other file. Run it both ways and you get NEW and GONE. The `|| true` is there because grep exits 1 when it selects nothing, and under `set -euo pipefail` "nothing changed" would otherwise kill the script.

## Why the diff does not cry wolf

A textual diff is only trustworthy if the only thing that can change a line is a real change to a socket. The script exports `LC_ALL=C` and sorts on explicit keys, because cron runs with a minimal environment that drifts, and a list sorted under one locale on Tuesday and another on Wednesday would move every line and alert every hour. Exact duplicate lines collapse, so one socket never counts twice.

The owner column works without root. `ss -p` only names processes you own unless you are root, so the script also asks for `-e`, which adds the owning systemd cgroup and uid for every socket. My throwaway server shows as `python3` because it was mine; a root-owned service shows as `cgroup:` plus its unit name.

GONE is an alert on purpose. A database that stopped listening is an outage, and a "new ports only" audit would never mention it.

## Scheduling it

The exit code is the contract: 0 for no change, 3 for a change, anything else means `ss` or `mkdir` failed under `set -e`. `ALERT_CMD` receives the NEW/GONE report on stdin, only when something changed, so a quiet host sends nothing. From the page:

```text
0 * * * * ALERT_CMD='mail -s "listener change on myhost" you@example.com' /usr/local/sbin/ports-audit.sh --diff >/dev/null
```

`>/dev/null` drops the CSV; stderr still reaches cron's mail.

Before you trust the diff, account for every line in the first baseline. For a one-off listing, the new [Open Ports Explainer](https://bashsnippets.xyz/tools/open-ports-explainer) reads it row by row: paste `ss -tulpn` output and each listener gets its reachability (127.0.0.1 is loopback only, 0.0.0.0 is every IPv4 interface), its owner, a note on the port, flags for things like a database or the Docker API on a wildcard address, and the next command to run. It runs in your browser, sends nothing, and redacts addresses in share links by default.

My 8099 server lived for a couple of seconds and the audit caught it both ways. The same run hourly turns "someone left something listening" from an incident into a line in your mail.

---

Full script with the CSV snapshot, the NEW/GONE diff, the exit-code contract, and the cron setup: https://bashsnippets.xyz/snippets/ports-audit

When the audit names a port you cannot explain, [Kill Process on Port](https://bashsnippets.xyz/snippets/kill-process-on-port) takes it from PID to SIGTERM, and [List All Open Ports on Linux](https://bashsnippets.xyz/snippets/list-open-ports-linux) is the read-it-by-eye version. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 2 #27 - planned Thu 2027-01-07 08:00 CST (14:00Z). Command G run 2026-09-28 22:21 CDT in scratch with STATE_DIR in scratch and http.server bound to 127.0.0.1:8099; only the NEW/GONE lines and exit codes are pasted (hostname line and full CSV withheld per security rule). Script = ~/Projects/bashsnippets/scripts/ports-audit.sh, identical to the page. -->
