<!-- REVIEW: incident dramatized — verify before publishing -->
# Five Midnight Emergencies, All of Them One Full Disk

The most useful command I ran that Sunday night was the last one. `df -h` printed `/dev/vda1  25G  25G  0  100% /`, and forty minutes of confusion condensed into a single embarrassing fact: the disk was full, and everything else I'd been chasing was a costume it was wearing.

Rewind to 11:40pm. I'd opened one of my own sites before bed and got a 502. On the $5 VPS behind it, five things appeared to be wrong at once — the app crash-looping, MySQL refusing writes, nginx alive but proxying to nothing, the journal silent, and no backup archive produced since Thursday. Five symptoms, so I debugged five problems, which is precisely the mistake this class of failure is designed to make you commit.

The filler turned out to be my own nightly backup script: a 2am cron job writing a timestamped tar.gz to `/backups`, on the same disk, with no rotation, for ten months. The tool I built to protect the machine starved it. There is a particular flavor of feeling foolish reserved for outages you scheduled yourself.

Here's the mechanism that makes a full disk so expensive to diagnose. Nothing in the failure ever says "disk." Each process that needs a write fails using its own error vocabulary — the database complains about its files, the app about its sessions — so every message blames the messenger. Logging is itself a write, which means the logs stop at the exact moment the incident starts; my evidence trail ended Thursday because that's when the disk actually filled, and the site survived three more days on reads and cache. And because ext4 reserves around 5% of blocks for root, my root SSH session behaved normally on a disk where every non-root service was suffocating. The box lies to the one person investigating it.

The countermeasure costs one cron line:

```bash
# 80% is a calendar item; 100% is a Sunday night
df -h | awk 'NR>1 && $5+0 >= 80 {print $0}'
```

Two details make this worth keeping. `NR>1` drops the header. `$5+0` handles the fact that df's Use% column is a string like `82%` — awk's numeric coercion takes the leading digits and abandons the `%`, so adding zero yields 82 and the comparison works without cut or sed. Schedule it daily, pipe anything it prints to `mail -s`, and a disk creeping up a percent a day announces itself weeks before it can hurt you.

That check opens a list of 25 scripts I keep on every server, organized by the five ways machines actually die: disk growth, backup gaps, service crashes, network trouble, and security drift. A few earn special mention.

On backups: a dump job that has been failing quietly since a credential rotation isn't a backup, it's a false sense of security with a timestamp. The hardened mysqldump version verifies its output file is non-empty before declaring success, converting a restore-day catastrophe into a night-one alert. My tar job now rotates its own archives, for reasons documented above.

On services: `systemctl is-active --quiet nginx || systemctl restart nginx` on a five-minute schedule caps unnoticed downtime at five minutes — provided every restart lands in a log. Skip the log and the watchdog becomes a memory leak's accomplice, curing the symptom every few hours so the disease stays invisible.

On SSL: the expiry check interrogates the certificate the server presents over the network rather than the file on disk, which is how you catch a cert that certbot renewed but nginx never reloaded. On security: `ss -tlnp` diffed against a baseline makes a new listener on a public port a line item instead of a forensic discovery.

The last piece ties them together: everything runs from `/etc/cron.d` on staggered minutes into one shared log, and after a week that log is a baseline. Disk grows half a percent daily; nginx restarts zero times. Against a baseline, an anomaly takes seconds to see. Without one, it takes a forty-minute Sunday night.

The full guide — all 25 scripts with their core commands, configurable thresholds, alerting, and ready-made cron lines — is here: https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs. The companion guide on making the cron jobs themselves bulletproof (locks, timeouts, retries) is [Bash Scripts That Survive Cron](https://bashsnippets.xyz/guides/bash-scripts-that-survive-cron).

Originally published at https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Sysadmin, Server Monitoring -->
