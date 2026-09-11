# My Disk Check Prints WARNING at 88%. Cron Throws It Away Every Monday.

There is a small disk check in my home directory that I wrote months ago. It reads `/` with `df`, strips the percent sign, and prints `WARNING: Disk at N%` once usage passes 80. A crontab line runs it on Mondays. Today I ran it by hand for the first time in a while, and it answered `WARNING: Disk at 88%`.

Then I went looking for where that warning goes when cron runs it, and the answer was nowhere. The log file sitting next to the script was last written on May 2, and its newest line says `OK: Disk at 30%` — those were manual runs, because the crontab line never redirected anything into it. Cron's own journal filled in the rest. Last Monday it ran the script 54 times between 05:00 and 05:59, because the schedule reads `* 5 * * 1`, every minute of hour five, where I meant once. And beside those runs, the same journal says `No MTA installed, discarding output`. Every warning that check has produced under cron went into a mail system this machine does not have.

Nothing about that is exotic. It is the most common way a monitoring script fails: it runs, it detects the condition, and the channel between it and a person does not exist.

## A full disk never introduces itself

The reason that channel matters is what the failure looks like when it arrives. When a filesystem hits 100 %, nothing says "the disk is full." Every process that needs a write fails in its own vocabulary: the database complains about its own files, the app dies persisting a session, and every error points at the component that surfaced it rather than the cause underneath. One root cause, several convincing disguises.

Logging is a write too, so the logs stop at the moment the disk fills, and the recorded evidence ends right before the incident begins. And ext4 holds back about 5 % of blocks for root, so a root shell keeps working on a disk where every non-root service is starving. The machine feels healthy to the person debugging it.

There is a second trap on the way back down, and this box taught me that one too. On August 28 I deleted a 44.6 GB video file here. `du` dropped by 44 GB; `df` moved by 5. XFCE's thumbnailer daemon, `tumblerd`, had the file open, and the kernel does not release blocks while any process still holds a descriptor on the deleted inode. `pkill -x tumblerd` gave the space back instantly. Judge a cleanup by `df`, never by `du`: `du` counts names that are gone, `df` counts blocks that are actually free.

## The check, done so a person sees it

```bash
# 80% is a calendar item; 100% is an outage
df -h | awk 'NR>1 && $5+0 >= 80 {print $0}'
```

`NR>1` skips df's header row. `$5+0` is the part worth stealing: the Use% column is a string like `82%`, and awk's numeric coercion reads the leading digits and drops the rest, so adding zero turns it into 82 with no `cut` or `sed`. It prints only the filesystems over the line, which means its output *is* the alert.

That is also where mine broke, so check the last hop before you trust any of it. `| mail -s` only works on a machine with a working mail agent; test it once by hand. If there is no mail agent, send the output to a webhook or at least to a log line with a timestamp. And read the schedule field twice: `0 5 * * 1` is once a week, `* 5 * * 1` is sixty times.

That one-liner is the first of the 25 scripts in the guide this post is drawn from, and the shape repeats across all of them: a small check, run on cron, that turns a silent slow failure into a loud early one.

## The other 24 aim the same idea at different failures

The guide groups them into the five ways servers actually go down: disk growth, backup gaps, service crashes, network problems and security drift.

The disk section continues from the warning. `du -ah | sort -rh | head -20` names what grew, and a `find`-based pruner clears the predictable offenders. One flag in it deserves a label: `-mtime +30` does not mean "30 days or older" — the `+` means strictly more than 30 twenty-four-hour periods, and misreading it changes what gets deleted.

The backup section checks the thing a timestamp cannot. A dump that has been failing quietly since a credential rotation is not a backup, it is confidence with a date on it. The guide's mysqldump script checks that the output file is non-empty before it finishes, so a broken backup fails loudly on night one instead of on restore day.

The service section caps undetected downtime: `systemctl is-active --quiet nginx || systemctl restart nginx` on a five-minute cron means a crash costs five minutes. On one condition — log every restart. A watchdog that does not log will re-heal a memory leak every few hours and hide it by suppressing its only symptom.

The SSL check reads the certificate the server is actually presenting over the wire, not the file on disk, which catches the renewed-but-never-reloaded case. And `ss -tlnp` compared against a known baseline turns "unexpected listener on a public port" from a post-incident discovery into a line item.

The closing section wires everything into `/etc/cron.d` with staggered minutes and one shared log, and that log turns out to be the real product: after a week you know your normal. A deviation from a known baseline takes seconds to spot. My own disk check had a threshold and a schedule and no way to reach anyone, which is the gap the cron section exists to close.

All 25 scripts, grouped by failure category, each with its core command and a link to the hardened version with thresholds, alerting and cron lines: https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs

Once they are scheduled, the jobs themselves have to survive running unattended. [Bash Scripts That Survive Cron](https://bashsnippets.xyz/guides/bash-scripts-that-survive-cron) covers the locks, timeouts and retries, and the [Cron Wrapper Generator](https://bashsnippets.xyz/tools/cron-wrapper-generator) wraps those guards around any command you paste in. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Sysadmin, Server Monitoring -->
