# Restart=always Did Nothing. The Service Never Exited.

On August 6 my laptop booted to a blank terminal. The display manager, `lightdm`, has `Restart=always` in its unit, and `systemctl status lightdm` said `active (running)`. As far as systemd was concerned, nothing was down.

What had happened was a race. Xorg entered the NVIDIA driver's init routine about 140 ms before the `/dev/nvidia*` device nodes existed, because another GPU service, also `Restart=always` and started one second earlier, was competing for the card. Xorg never came back. Fourteen hours later it was still there in state `S`, one thread, 20 ms of CPU used in total, its log file cut off mid-sentence with no error line.

I had trusted that restart policy without reading what it promises. `Restart=always` restarts a process after it exits. Mine never exited. A cron job checking `systemctl is-active lightdm` every minute would have said "fine" all night. `sudo systemctl restart lightdm` brought the desktop back in three seconds, and the real fix turned out to be ordering, `nvidia-persistenced` so the device nodes exist before anything asks for them, not a restart policy at all.

## "Down" is three different states

The mistake is treating "down" as one condition. It is at least three, and they look identical from a chair across the room. A process that crashed or was killed shows `failed`, and a restart is correct. A service someone stopped on purpose shows `inactive` with `Result=success`, and a restart fights the human doing maintenance. A process that is running but not answering shows `active (running)`, and no restart ever happens, because nobody asked. My August 6 was the third kind, and the standard "restart it if it's down" watchdog only handles the first.

## Read the state before you touch it

Most watchdogs start from `systemctl is-active`. I re-ran it on the same laptop today, systemd 261, with a deliberate typo in the third name:

```bash
$ for u in cron lightdm crno; do
>   printf '%-8s is-active=%-9s rc=' "$u" "$(systemctl is-active "$u")"
>   systemctl is-active --quiet "$u"; echo $?
> done
cron     is-active=active    rc=0
lightdm  is-active=active    rc=0
crno     is-active=inactive  rc=4
```

Exit code 0 is running. Exit code 3 is a real unit that is not running. Exit code 4 is a unit that does not exist, and `is-active` prints the same word, `inactive`, for 3 and 4. A watchdog written as `if ! systemctl is-active --quiet "$SERVICE"` treats the typo as an outage, tries to start `crno` every minute, fails every minute, and alerts every minute until someone reads the message closely enough to spot the swapped letters.

The command a script should use is `systemctl show`, because each field comes back as one clean line with no colour and no localisation. On my lightdm today, `systemctl show lightdm -p Restart,RestartUSec,NRestarts,ActiveState,SubState,Result,StartLimitBurst,StartLimitIntervalUSec` returned `Restart=always`, `RestartUSec=100ms`, `NRestarts=0`, `ActiveState=active`, `SubState=running`, `Result=success`, `StartLimitBurst=5` and `StartLimitIntervalUSec=10s`.

That is `Restart=always`, 100 ms between attempts, zero restarts since boot. `LoadState` separates the typo from the outage. `Result` tells you why a unit is in its state, and `NRestarts` climbing means systemd is already doing the job and your watchdog is late.

The two `StartLimit` fields are the start-limit trap. A unit started more than five times inside ten seconds, which is what a short `RestartSec` does to a daemon that crashes on startup, goes to `failed` with `Result=start-limit-hit`, and from then on `systemctl start` refuses until someone runs `systemctl reset-failed`. A watchdog that does not know this reports "restart failed" forever. One that resets it unconditionally every minute has switched off systemd's crash-loop protection and replaced it with its own crash loop, with an email each cycle. The guide's version resets a bounded number of times per outage, then stops and tells a human.

## When it is running but not answering

That leaves the case I actually had. No state check sees it, because the state is correct: the process exists and is running. The only way to know a service answers is to ask it the way a client would, with a timeout on the question, for example `curl -fsS --max-time 5 http://127.0.0.1/ >/dev/null` for a web server, or `ss -Hltn 'sport = :5432' | grep -q .` for anything that should be listening on a port. A probe without a timeout is one more hung process on the box, and the next cron tick starts another.

When the probe fails on an `active` unit, `systemctl restart` is the treatment, with two costs. Restart is stop plus start, so a process that ignores SIGTERM holds it for `TimeoutStopSec`, 90 seconds by default. And the restart destroys the evidence of what the process was stuck on. A hung process is the only witness to what it was waiting on, so capture its state and its `wchan` before anything is killed.

Fourteen hours of `active (running)` and a restart policy that never fired: the policy was working as documented. I had asked it to cover a failure it cannot see.

---

Full guide, with the three-state table, the `Restart=` values and when each fires, the start-limit trap, and a cron watchdog that probes, honours a maintenance flag and alerts once per outage: https://bashsnippets.xyz/guides/auto-restart-linux-service

The watchdog script on its own is [Service Watchdog](https://bashsnippets.xyz/snippets/service-watchdog), and what to capture before the restart wipes it out is in [Diagnosing a Hung Process](https://bashsnippets.xyz/guides/diagnose-a-hung-process). The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/guides/auto-restart-linux-service

<!-- Medium tags to set in the UI: Linux, DevOps, Sysadmin, Bash, Command Line -->
