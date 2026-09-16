<!-- POSTING CADENCE RULE: maximum 1 CoderLegion post per week. Do not publish this in the same week as any other CoderLegion post. -->

# Old log files will fill your disk — age them out with find -mtime

A directory of logs nobody reads took my SSD to zero free bytes, and the symptoms scattered: every process that tried to write got `ENOSPC` at once, so a build, a database write, and an editor autosave all failed with errors that never mentioned the disk. Prevention is one command:

```bash
find /var/log/myapp -type f -name "*.log" -mtime +30 -print
```

Read the list it prints. When it matches what you expect, swap `-print` for `-delete` and run it again — never skip the preview on a new directory.

Two traps. First, `-mtime +30` counts whole 24-hour periods and `+` means strictly greater, so a file from exactly 30 days ago survives until day 31; a true 30-day policy is `-mtime +29`. Second, prefer `-delete` over piping to `xargs rm` — the pipe re-splits filenames on whitespace, so `app v2.log` reaches `rm` as two arguments. Keep `-delete` last in the expression: `find` evaluates left to right, and placed early it fires on everything it walks.

Point it at one app's directory, never `/var/log` wholesale, and schedule it weekly in cron.

The full version — multi-directory loop, `.gz` variant, before/after disk report, cron lines — is in this [guide to deleting old log files with find -mtime](https://bashsnippets.xyz/snippets/delete-old-log-files).
