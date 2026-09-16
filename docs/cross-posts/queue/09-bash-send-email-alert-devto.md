---
title: "My Machine Has No mail Command. That's Where Most Disk Alerts Die."
published: true
description: "A disk check that ends in | mail -s does nothing on a box with no mail agent, and under cron even the error is discarded. Detection vs delivery, what mail's exit 0 actually promises, a real path out through an SMTP relay, and a 24-hour dedupe guard."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/bash-send-email-alert
cover_image: https://bashsnippets.xyz/ogimage.png
---

I recently found that the disk check on my own Linux machine had been printing `WARNING: Disk at 88%` into nothing: cron's journal said `No MTA installed, discarding output` beside every run. So I checked what it would take for that warning to reach me by email. `mail`: not installed. `mailx`: not installed. `sendmail`: not installed. `msmtp`: not installed.

That is normal for a desktop install and common on minimal server images. It also means every monitoring script that ends in `| mail -s "…" you@example.com` is a script whose last line fails. Run it by hand and you would at least see `command not found`. Run it from cron and the error goes the same way as the output: cron tries to mail it to you, has no mail agent to do it with, and discards it. Two layers of silence, and the check itself is working perfectly.

## Detection and delivery are different jobs

The detection logic is the part everybody polishes: read the number, compare it, decide. Telling a person is a separate job, and a monitor that only appends to a log file or prints to stdout has not done it — it has relocated the problem. Somebody still has to poll that output, and that somebody is a person with better things to do at 2am. The fix is to push the news to the place you already check compulsively, which for most of us is an inbox.

The core is small enough to memorize:

```bash
#!/bin/bash
set -euo pipefail

USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$USAGE" -gt 80 ]; then
  printf 'Disk on %s hit %s%% at %s\n' "$(hostname)" "$USAGE" "$(date '+%F %T')" \
    | mail -s "[ALERT] disk space on $(hostname)" you@example.com
fi
```

Read the number, compare it, and when it is over the line, pipe a message into `mail` with a subject that names the machine — because once the same check runs on several hosts, an alert that does not say which server is on fire is a puzzle, not an alert.

## The alert you "sent" that never arrived

Installing `mail` fixes the first layer and exposes the next one. `mail` exiting 0 does not mean your alert reached anyone. It means the message was handed to whatever mail transfer agent lives on the box; delivery is the MTA's problem, and the exit code you can observe stops at the handoff. On a server with no MTA configured for the outside world, that handoff often drops the message into a local mailbox under `/var/mail` — a file on the same machine that no human reads. The script reports success, and the alert sits a few directories away from the log it was supposed to replace.

Cron adds one more trap on top. Jobs run with a minimal `PATH`, so a `mail` that resolves in your login shell can be `command not found` under cron. The test that proves anything is not running the script by hand and receiving an email. It is letting *cron* run it and receiving an email, then reading the MTA's log to see what it actually did.

Real delivery means giving the box a real path out. On Debian or Ubuntu, `mailutils` pulls in an MTA, and the "Internet Site" option covers a machine that is allowed to send directly. Plenty are not — outbound mail from cloud IP ranges gets filtered or spam-binned constantly — so relay through a provider instead: `msmtp` pointed at a Gmail account with an app password is a few lines of config, and `curl` can speak SMTP to a relay on boxes where you would rather not install an MTA at all. Either turns "handed to the MTA" into "accepted by a server whose whole job is delivering".

## The opposite failure: the alert that cries wolf

Once delivery works you meet the inverse problem. A threshold does not trip once; it stays tripped. Disk at 81 % at nine o'clock is still 81 % at ten, and an hourly cron job will mail you the same fact twenty-four times a day until you fix the disk or stop reading, which comes first. An alert channel you have learned to skim is a silent failure with extra steps.

The guard is a dedupe sentinel: on send, touch a marker file; before sending, check the marker's age with `find "$MARKER" -mmin -1440`. I ran that logic three times on my machine. The first call sent. The second, a moment later, was suppressed. Then I backdated the marker 25 hours with `touch -d` and the third call sent again. One email per incident per day; the condition is still measured every hour, only the nagging is suppressed.

## Delivery is the whole difference

The check on my machine had the right threshold and the right schedule-shaped intentions. What it lacked was any route from the machine to me, and nothing in its own output could say so, because its output had nowhere to go either. Before you trust an alert, send one on purpose, from cron, and watch it arrive.

The full script — the alert body with the top disk consumers included, the msmtp config for a Gmail relay, the once-per-24-hours dedupe guard, and the cron traps that make alerts vanish — is here: https://bashsnippets.xyz/snippets/bash-send-email-alert

An email alert is the last guard an unattended job needs, not the first: the [Cron Wrapper Generator](https://bashsnippets.xyz/tools/cron-wrapper-generator) wires alert-on-failure in alongside the lock, timeout and retry it generates, and [Bash Scripts That Survive Cron](https://bashsnippets.xyz/guides/bash-scripts-that-survive-cron) is the full playbook for jobs nobody watches. The rest of the library is at https://bashsnippets.xyz
