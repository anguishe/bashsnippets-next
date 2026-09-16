<!-- Posting cadence rule: maximum 1 CoderLegion post per week. Check the date of the last CoderLegion post before publishing this one. -->

**Catch a filling disk weeks before it becomes an outage**

A disk almost never fails loudly. It fills a percent at a time until writes stop, and at 100% nothing reports "disk full" — the database throws write errors about its own files, apps crash-loop, and logging (a write itself) stops recording at the exact moment you need evidence. You end up debugging five fake problems instead of one real one.

The prevention costs one line on a daily cron:

```bash
df -h | awk 'NR>1 && $5+0 >= 80 {print $0}'
```

`NR>1` skips the header. `$5+0` is the trick: df's Use% column is a string like `82%`, and awk's numeric coercion keeps the leading digits and drops the `%`, so the threshold comparison works without cut or sed. Pipe any output to `mail -s` and you get an email the day a filesystem crosses 80.

Why 80? At 80% a disk growing one percent a day leaves you weeks to investigate with `du -ah | sort -rh | head -20`. At 95% you're deleting files under pressure; at 100% every service on the box misbehaves at once.

This check is #1 in a set of [25 cron-ready bash scripts for sysadmins covering disk monitoring, backups, service watchdogs, SSL expiry, and port audits](https://bashsnippets.xyz/guides/bash-scripts-every-sysadmin-needs).
