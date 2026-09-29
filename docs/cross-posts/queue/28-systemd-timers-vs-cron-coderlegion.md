<!-- NOT SCHEDULED. Wave 2 #28 - planned Tue 2027-01-12 08:00 CST (14:00Z), same minute as dev.to #28. Canonical is the guide /guides/systemd-timers-vs-cron (live 2026-09-28), which replaced the planned snippet; journal output quoted from the guide's real runs on this box. -->

# Cron skipped 3 of 4 Sundays. The timer skipped none.

My weekly cleanup runs from cron at 03:00 on Sundays. In September the journal shows it ran once. On the other three Sundays the laptop booted at 06:12, 04:24 and 03:23, and cron does not run a job whose minute has already passed. No error, no log line, nothing.

On the same laptop, the stock `e2scrub_all.timer` is scheduled for 03:10 on Sundays with `Persistent=true`. It ran every week:

```text
2026-09-06T03:10:19-05:00 systemd[1]: Starting e2scrub_all.service - Online ext4 Metadata Check for All Filesystems...
2026-09-13T06:13:09-05:00 systemd[1]: Starting e2scrub_all.service - Online ext4 Metadata Check for All Filesystems...
2026-09-20T04:24:37-05:00 systemd[1]: Starting e2scrub_all.service - Online ext4 Metadata Check for All Filesystems...
```

The fourth run, on the 27th, was at 03:24:06, seven seconds after boot. `Persistent=true` stores the last run time on disk; when the timer starts and finds a missed elapse, it runs the service once, immediately.

The same crontab had a second bug: `* 5 * * 1` meant "05:00 Mondays" and ran sixty times each Monday, its warnings discarded because no mail server was installed. A timer sends output to the journal, and `systemd-analyze calendar` shows the next runs before you install one.

Cron still wins where there is no systemd, such as most containers and macOS. The unit files, the conversion table and the overlap tests are in the [systemd timers vs cron guide](https://bashsnippets.xyz/guides/systemd-timers-vs-cron).
