<!-- NOT SCHEDULED. Wave 2 #17 - planned Thu 2026-11-12 08:00 CST (14:00Z), same minute as dev.to #17. Opener is the guide's own Aug-6 lightdm incident; is-active loop re-run on this box 2026-09-28 (systemd 261, bash 5.3.9). -->

# Restart=always never fired, because nothing exited

On August 6 my laptop booted to a blank terminal. `lightdm` has `Restart=always`, and `systemctl status` said `active (running)`. Xorg had entered the NVIDIA init about 140 ms before the device nodes existed and hung there for fourteen hours: state `S`, 20 ms of CPU, no error line. A restart policy restarts processes that exit. Mine never exited.

"Down" is three states: crashed, stopped on purpose, or running but not answering. The usual watchdog handles the first and misreads the others. It even misreads a typo. I re-ran this today with a swapped letter in the third name:

```bash
$ for u in cron lightdm crno; do
>   printf '%-8s is-active=%-9s rc=' "$u" "$(systemctl is-active "$u")"
>   systemctl is-active --quiet "$u"; echo $?
> done
cron     is-active=active    rc=0
lightdm  is-active=active    rc=0
crno     is-active=inactive  rc=4
```

Exit 3 is a real unit that is stopped; exit 4 is a unit that does not exist, and both print `inactive`. A watchdog that only checks `is-active` tries to start `crno` every minute, forever. Check `LoadState` first, and for the hung case, probe the service the way a client would, with a timeout.

The three-state table, the start-limit trap and a cron watchdog that alerts once per outage are in [the full guide to auto-restarting a Linux service](https://bashsnippets.xyz/guides/auto-restart-linux-service).
