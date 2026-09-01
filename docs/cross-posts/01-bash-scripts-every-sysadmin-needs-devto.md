<!-- REVIEW: incident dramatized — verify before publishing -->
---
title: "My Own Backup Script Took the Server Down at 11:40 on a Sunday Night"
published: true
description: "A disk that filled a little every night took my VPS down as five fake emergencies. The 25 cron-ready bash checks that catch this class of failure early."
tags: bash, linux, devops, tutorial
canonical_url: https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs
cover_image: https://bashsnippets.xyz/ogimage.png
---

At 11:40 on a Sunday night, one of my own sites handed me a 502 while I was checking something unrelated before bed. I SSH'd into the $5 VPS behind it and found what looked like five separate emergencies. The app was down and crash-looping on restart. MySQL was refusing writes. nginx was healthy but proxying to a corpse. The journal had gone quiet. And the nightly backup job hadn't produced an archive since Thursday.

I spent the next forty minutes treating those as five problems — reading application logs that ended abruptly on Thursday, restarting services that wouldn't stay up, squinting at MySQL errors that explained nothing. Then I ran `df -h`, mostly out of habit, and the whole night collapsed into one line: `/dev/vda1  25G  25G  0  100% /`.

The thing that filled it was my own backup script. Every night at 2am it wrote a timestamped tar.gz of the web root to `/backups` — on the same disk, with no rotation. Ten months of archives, each a little larger than the last. The script I wrote to protect the machine is what took it down, and I would love to tell you I found that funny at midnight. I did not.

## A full disk never announces itself as a full disk

That's the trap worth understanding, because it's why the diagnosis took forty minutes instead of four. When a filesystem hits 100%, nothing says "the disk is full." Every process that needs a write fails in its own vocabulary: MySQL complains about its own files, the app dies trying to persist a session, and every error message points at the component that surfaced it rather than the cause underneath all of them. One root cause, five convincing disguises.

The cruelest part is that logging is a write too. The moment the disk filled — Thursday, mid-backup — the logs stopped. So the recorded evidence ends right before the incident begins, and the site coasted for three days on reads and cache until the app finally needed to write something and fell over.

One more disorienting detail: `df` reported 100%, yet my SSH session worked and I could save files. ext4 holds back roughly 5% of blocks as a root reserve, so a root shell keeps functioning on a disk where every non-root service — www-data, mysql — is starving. The machine feels healthy to the person debugging it while being dead to everything that matters.

## The check that makes that night impossible

```bash
# 80% is a calendar item; 100% is a Sunday night
df -h | awk 'NR>1 && $5+0 >= 80 {print $0}'
```

`NR>1` skips df's header row. `$5+0` is the part worth stealing: the Use% column is a string, `82%`, and awk's numeric coercion reads the leading digits and discards the rest, so adding zero turns `82%` into 82 — comparable against a threshold with no cut or sed in sight. Pipe any output to `mail -s` on a daily cron and a filling disk becomes a Tuesday-morning chore instead of a weekend emergency, because a disk growing one percent a day gives you weeks of runway between 80 and 100.

That one-liner is #1 of the 25 scripts in the guide this post is drawn from, and the shape repeats across all of them: a small check, run on cron, that converts a silent slow failure into a loud early one.

## The other 24 are the same idea aimed at different failures

The guide groups them into the five ways servers actually go down: disk growth, backup gaps, service crashes, network problems, and security drift.

The disk section continues my Sunday story. Once the warning fires, `du -ah | sort -rh | head -20` names what grew, and a `find`-based pruner clears the predictable offenders. One flag in it deserves a warning label: `-mtime +30` does not mean "30 days or older" — the `+` means *strictly more than* 30 twenty-four-hour periods, and misreading it changes what gets deleted.

The backup section is the exam my 2am tar job failed. A dump that has been silently failing for weeks — credentials rotated, nobody told cron — isn't a backup, it's confidence with a timestamp on it. The guide's mysqldump script checks that the output file is non-empty before it finishes, so a broken backup fails loudly on night one instead of at restore time, which is the only night it truly matters.

The service section caps undetected downtime: `systemctl is-active --quiet nginx || systemctl restart nginx` on a five-minute cron means a 3am crash costs five minutes, not a business morning. With one condition — log every restart. A watchdog that doesn't log will re-heal a memory leak every few hours and hide the disease by suppressing its only symptom.

The SSL check reads the certificate your server is actually presenting over the wire, not the file on disk — which catches the renewed-but-nginx-never-reloaded case that certbot hooks can miss. And `ss -tlnp` compared against a known baseline turns "unexpected listener on a public port" from a post-incident discovery into a Monday-morning line item.

The closing section wires everything into `/etc/cron.d` with staggered minutes and a shared log file, and that log turns out to be the real product: after a week you know your normal — disk grows half a percent a day, nginx restarts zero times. A deviation from a known baseline takes seconds to spot. An isolated mystery at midnight takes forty minutes. Ask me how I know.

All 25 scripts, grouped by failure category, each with its core command and a link to the fully hardened version with thresholds, alerting, and cron lines: https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs

Once they're scheduled, the jobs themselves have to survive running unattended — [Bash Scripts That Survive Cron](https://bashsnippets.xyz/guides/bash-scripts-that-survive-cron) covers the locks, timeouts, and retries that keep them alive, and the [Hardened Cron Wrapper Generator](https://bashsnippets.xyz/tools/cron-wrapper-generator) wraps those guards around any command you paste in. The rest of the library is at https://bashsnippets.xyz
