# Three Programs Failed in the Same Minute. The Culprit Was a Log File

The process that eventually took my machine down had been behaving perfectly for a week. It was an app I'd started and forgotten about, and the entire time it did exactly what its authors intended: it wrote log lines, steadily, into a directory I never opened. Then, on a Tuesday, my SSD hit zero free bytes — and I learned about it from three other programs at once. A compile died midway. A database refused a write. My editor announced it could no longer autosave.

Here's the detail that cost me the most time: none of those errors mentioned the disk. Each program reported its failure in its own vocabulary, so I chased what looked like three separate bugs before it occurred to me to run `df -h`. Root filesystem, 100%. Even then I had to hunt for where the space had gone, and the answer was a log file that had been growing a little every second for a week while nobody — including its own application — ever looked at it.

That scattering of symptoms isn't bad luck; it's the mechanism. When a filesystem runs out of blocks, the kernel answers every write attempt with `ENOSPC`, and nearly every application translates that into its own unrelated-sounding complaint. The failures land everywhere at once while the actual offender falls silent, because it can't write anymore either. A full disk erases its own fingerprints at the exact moment it starts breaking things, which is why you don't diagnose your way out of this one. You prevent it.

Prevention is a single `find` invocation pointed at any directory that grows without bound:

```bash
LOG_DIR="/var/log/myapp"
DAYS=30

# Preview pass — read this list before letting anything delete
find "$LOG_DIR" -type f -name "*.log" -mtime +"$DAYS" -print
```

Notice that ends in `-print`, not `-delete`. That's deliberate. On any directory you haven't cleaned before, run the preview, read every line of the output, and only then swap `-print` for `-delete` and run it again. Deletion by `find` is immediate and permanent, and one wrong character in the path aims it somewhere you didn't intend.

Two of the flags carry traps worth understanding rather than memorizing.

The first is `-mtime +30`, which does not mean "older than 30 days" the way a person means it. `find` counts age in complete 24-hour periods, and the plus sign means strictly greater than — so a file modified exactly 30 days ago is 30 periods old, fails the "greater than 30" test, and survives until it reaches 31 full days. A retention policy of "keep 30 days" is actually spelled `-mtime +29`. Nothing about a test run reveals this; it shows up a month later as a file that should be gone and isn't.

The second trap is the alternative everyone reaches for first: `find ... | xargs rm`. That pipeline re-splits filenames on whitespace, so a file called `app v2.log` reaches `rm` as two arguments — `app` and `v2.log` — and either one might collide with a file you meant to keep. Keeping the deletion inside `find` via `-delete` skips the pipe and the word splitting entirely. The one rule it demands: `-delete` must be the last expression on the line, because `find` evaluates left to right, and a `-delete` placed before `-name` fires on every file it walks.

Scope is the remaining guardrail. `-type f` restricts matches to plain files, and `LOG_DIR` should name one application's directory — `/var/log/nginx`, `/var/log/myapp` — never `/var/log` itself, where system logs and database files live. A database's transaction log has retention rules of its own, and age-based deletion is not among them.

The last step is the one that would have saved my Tuesday: schedule it. The full script version takes the path and the day count as named variables, and a weekly crontab line runs it with its output appended to a log of its own, so every cleanup leaves evidence. Once that's in place, no directory on the machine can quietly eat the drive over a span of weeks, because nothing gets more than seven days of unsupervised growth.

One unread log file bought me a morning of debugging phantom failures and a genuinely humbling moment in front of `df`. The prevention costs one second a week.

The complete script — multi-directory loop, a variant that also catches rotated `.gz` logs, a before/after disk-usage report, and copy-paste cron schedules — is at https://bashsnippets.xyz/snippets/delete-old-log-files. Pair it with the [disk space warning script](https://bashsnippets.xyz/snippets/disk-space-warning), which alerts before you ever reach 100%; the rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/delete-old-log-files

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Sysadmin, Programming -->
