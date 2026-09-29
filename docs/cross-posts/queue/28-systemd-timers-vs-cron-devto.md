---
title: "My Cron Job Missed a Night. The systemd Timer Would Have Caught Up."
published: true
description: "A weekly cron job on my laptop ran on 1 of 4 Sundays in September and said nothing. A stock systemd timer on the same Sundays ran all 4, catching up 7 to 57 seconds after boot."
tags: bash, linux, sysadmin, devops
canonical_url: https://bashsnippets.xyz/guides/systemd-timers-vs-cron
cover_image: https://bashsnippets.xyz/ogimage.png
---

My weekly log cleanup is one crontab line, 03:00 every Sunday. In September it ran once. The journal, where cron logs every command it starts, shows it:

```text
0 3 * * 0 ~/cleanlog.sh

$ journalctl -t CRON -o short-iso --since 2026-09-01 -g cleanlog | grep CMD
2026-09-06T03:00:01-05:00 CRON[…]: (travis) CMD (~/cleanlog.sh )
```

One line for four Sundays. `journalctl --list-boots` explained the other three: on the 13th the laptop came up at 06:12, on the 20th at 04:24, and on the 27th at 03:23, twenty-four minutes too late. Cron checks the clock once a minute and runs whatever matches that minute. If the machine is off at 03:00, the 03:00 minute never gets checked, and a weekly job waits a week. There is no error for a run that did not happen, so there was nothing to tell me.

The part that stung was the job sitting ten minutes later on the same schedule. I had never configured it.

## The timer that ran every week

`e2scrub_all.timer` ships with e2fsprogs. Same laptop, same four Sundays, scheduled for 03:10:

```text
$ systemctl cat e2scrub_all.timer
[Timer]
OnCalendar=Sun *-*-* 03:10:00
RandomizedDelaySec=60
Persistent=true

$ journalctl -u e2scrub_all.service -o short-iso --since 2026-09-01 | grep Starting
2026-09-06T03:10:19-05:00 systemd[1]: Starting e2scrub_all.service - Online ext4 Metadata Check for All Filesystems...
2026-09-13T06:13:09-05:00 systemd[1]: Starting e2scrub_all.service - Online ext4 Metadata Check for All Filesystems...
2026-09-20T04:24:37-05:00 systemd[1]: Starting e2scrub_all.service - Online ext4 Metadata Check for All Filesystems...
```

`systemctl show e2scrub_all.timer -p LastTriggerUSec` gave the fourth: `Sun 2026-09-27 03:24:06 CDT`. Four Sundays, four runs. On the 6th it ran on schedule; on the 13th it ran 57 seconds after boot, on the 20th 11 seconds after, on the 27th 7 seconds after.

That is `Persistent=true`. The timer stores the time of its last run on disk, and when it starts (at boot, or when you start it by hand) it compares that with the schedule. If an elapse was missed, the service runs once, immediately. In the guide's test, a demo timer stopped across two scheduled minutes ran a single time when it came back. The same timer without `Persistent=` waited for its next minute, and the missed run was gone, exactly as under cron. It only works with `OnCalendar=`.

## What else my crontab was hiding

Another line from the same crontab, mine, wrong for months: `* 5 * * 1 /home/travis/diskcheck.sh`. I meant "05:00 on Mondays". A `*` in the minute field means every minute, so it ran sixty times between 05:00 and 05:59: 180 runs in September, 60 on each Monday the laptop was awake at five. Every one of them ended with `(CRON) info (No MTA installed, discarding output)`. The script prints a warning above 80% disk. Run by hand, it says `WARNING: Disk at 91%`. Sixty warnings a Monday, delivered to nobody.

A timer cannot lose output that way, because a service's stdout and stderr go to the journal with the unit name attached. And the schedule can be checked before it is installed:

```text
$ systemd-analyze calendar --iterations=4 'Mon *-*-* 05:*:00'
Normalized form: Mon *-*-* 05:*:00
    Next elapse: Mon 2026-10-05 05:00:00 CDT
   Iteration #2: Mon 2026-10-05 05:01:00 CDT
   Iteration #3: Mon 2026-10-05 05:02:00 CDT
```

05:00, 05:01, 05:02. The bug is on screen before it runs once.

## Slow jobs queue, they do not pile up

Under cron, a job still running at the next tick gets a second copy, which is why cron scripts need `flock`. The guide tested a `Type=oneshot` service that runs 75 seconds on a 60-second timer, and the result is not what most write-ups say. No two runs overlapped, and the 21:06:00 tick was not skipped either. It was queued: the second run started at 21:06:15, the instant the first finished, and the third at 21:07:30. A job that is always slower than its schedule runs back to back, one at a time. If you want late work dropped instead, put `flock -n` inside `ExecStart=`.

Failures get the same treatment: `OnFailure=` starts another unit when the job fails, and the stderr, exit status and alert land in one `journalctl` query.

## Where cron still wins

No systemd, no timers: most containers run a single process with no init, Alpine uses `crond`, macOS uses launchd. One crontab line is also easier to read than two unit files, and where a missed run does not matter, that is worth keeping. A good wrapper closes cron's overlap, hang and silent-failure gaps. It does not close the missed-run gap. If the machine sleeps, cron still skips.

On anything that reboots, sleeps or gets switched off, the timer is the better scheduler for one reason: a run the machine was off for is not lost.

---

Full guide with the unit files, the crontab-to-OnCalendar table, the Persistent and overlap tests, and OnFailure alerting: https://bashsnippets.xyz/guides/systemd-timers-vs-cron

If you are staying on cron, [Bash Scripts That Survive Cron](https://bashsnippets.xyz/guides/bash-scripts-that-survive-cron) covers the lock, log and alert it needs, and the [Cron Job Builder](https://bashsnippets.xyz/tools/cron-job-builder) shows the next runs of an expression before you install it. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 2 #28 - planned Tue 2027-01-12 08:00 CST (14:00Z). Canonical changed from the planned /snippets/systemd-timer-vs-cron to the guide /guides/systemd-timers-vs-cron (live 2026-09-28). Every output quoted is from the guide's real journal/systemd runs on this box (systemd 261, 2026-09-28); no new runs for this article. -->
