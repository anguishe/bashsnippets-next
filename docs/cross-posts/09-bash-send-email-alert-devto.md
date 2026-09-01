---
title: "My Disk Monitor Knew for Hours and Told No One"
published: true
description: "The monitor logged the warning for hours and nobody saw it. Bash email alerts that actually arrive — mail, an SMTP relay, and a dedupe guard."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/bash-send-email-alert
cover_image: https://bashsnippets.xyz/ogimage.png
---

For a couple of months I ran a disk check I was quietly proud of. Cron fired it every hour on a small VPS, it pulled the usage number off `df`, compared it against a threshold, and made the correct call every single run. When the disk finally did fill, I found out the way you never want to: writes started bouncing off a full filesystem, services fell over, and I was SSH'd in at an hour I hadn't planned on.

The postmortem took one grep. Sitting in the script's log file — its only output channel — was a warning line for every hourly run, stretching back through the entire climb. The monitor had seen this coming with hours of runway, recorded that fact in a place no human ever looks, and called it a day. It never failed once. I had built it to keep a diary, and the diary was immaculate.

Reading your own script's log after the outage and finding the warning it faithfully wrote you is a particular flavor of foolish. The script knew. I didn't.

## Detection and delivery are different jobs

The root cause wasn't in the detection logic, which is the part we all polish. It was that detecting a problem and telling a human about it are separate jobs, and I had shipped only one of them. A monitor that appends to a logfile hasn't solved the problem — it has relocated it. Someone still has to poll that file, and that someone is a person with better things to do at 2am. The fix is to make the script push the news to the one place I already check compulsively: my inbox.

The core of it is small enough to memorize:

```bash
#!/bin/bash
set -euo pipefail

USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$USAGE" -gt 80 ]; then
  printf 'Disk on %s hit %s%% at %s\n' "$(hostname)" "$USAGE" "$(date '+%F %T')" \
    | mail -s "[ALERT] disk space on $(hostname)" you@example.com
fi
```

Read the number, compare it, and when it's over the line, pipe a message into `mail` with a subject that names the machine — because once the same check runs on several hosts, an alert that doesn't say *which* server is on fire is a puzzle, not an alert.

## The alert you "sent" that never arrived

Here's the trap that earns this pattern a full page, and it's the same silent-failure shape one level up. `mail` exiting zero does not mean your alert reached anyone. It means the message was handed off to whatever mail transfer agent lives on the box; delivery is the MTA's problem, and the exit code you can observe stops at the handoff. On a fresh server with no MTA configured for the outside world, that handoff frequently drops the message into a local mailbox — root's spool under `/var/mail` — a file on the same machine that no human reads. Your script prints its success line, the alert sits three directories away from the log it was supposed to replace, and you have rebuilt the diary with worse ergonomics.

Cron stacks a second layer on top. Jobs run with a minimal `PATH`, so a `mail` that resolves fine in your login shell can be `command not found` under cron — and if the cron line discards output, even that error evaporates. The test that proves anything is not running the script by hand and receiving an email. It's letting *cron* run it and receiving an email, then tailing `/var/log/mail.log` to see what the MTA actually did.

Real delivery means giving the box a real path out. On Debian or Ubuntu, installing `mailutils` pulls in an MTA, and the "Internet Site" option during setup covers a machine permitted to send directly. Plenty aren't — outbound mail from cloud IPs gets filtered or spam-binned constantly — so relay through a provider instead: `msmtp` pointed at Gmail with an app password is a few lines of config, and `curl` can speak SMTP to a relay on boxes where you'd rather not install an MTA at all. Either upgrades "handed to the MTA" into "accepted by a server whose whole job is delivering."

## The opposite failure: the alert that cries wolf

Once delivery works you meet the inverse problem. A threshold doesn't trip once — it stays tripped. Disk at 81% at nine o'clock is still 81% at ten, and an hourly cron will mail you the identical fact twenty-four times a day until you fix the disk, or until you stop reading, which happens sooner. An alert channel you've learned to skim is a silent failure with extra steps: the one email that matters looks exactly like the twenty-three that don't.

The guard is a dedupe sentinel: on send, touch a marker file; before sending, check the marker's age. Fresher than twenty-four hours, stay quiet; older, alert again. One email per incident per day. The condition still gets measured hourly — only the nagging is suppressed.

## Same script, different ending

The disk on that VPS grows at the same rate it always did. What changed is where the knowledge lands. Now when the threshold trips, the email arrives with the hostname, the timestamp, and the five biggest directories on the disk in the body — everything needed to act before anything falls over. Same detection logic the diary version had. Delivery was the entire difference.

The full script — the alert body with top disk consumers baked in, the msmtp config for a Gmail relay, the once-per-24-hours dedupe guard, and the cron traps that make alerts vanish — is here: https://bashsnippets.xyz/snippets/bash-send-email-alert

An email alert is the last guard an unattended job needs, not the first: the [Hardened Cron Wrapper Generator](https://bashsnippets.xyz/tools/cron-wrapper-generator) wires alert-on-failure in alongside the lock, timeout, and retry it generates, and [Bash Scripts That Survive Cron](https://bashsnippets.xyz/guides/bash-scripts-that-survive-cron) is the full playbook for jobs nobody watches. The rest of the library is at https://bashsnippets.xyz
