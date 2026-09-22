<!-- SCHEDULED on CoderLegion 2026-09-21 as https://coderlegion.com/28025 - publishes Tue 2026-10-20 08:00 CDT, same minute as dev.to #10. Editing this file does NOT reach CoderLegion: edit the post there too. -->

# rsync's dangerous flags don't fail. They do a different job and exit 0.

The trap with rsync is that its dangerous flag combinations don't fail — they complete a different operation than the one you intended, and exit 0. `--delete` makes the destination match the source, so a mistyped or freshly moved source directory means rsync removes everything at the destination and reports success. Your cron log shows a clean run while the backup empties itself. A trailing slash changes the meaning too: `/data/` syncs the directory's contents, while `/data` copies the directory itself into the destination — and on a mirror job, that difference decides what gets compared and what gets deleted.

The defense is previewing every destructive sync before running it live:

```bash
rsync -av --delete --dry-run /srv/www/ user@backup:/srv/backup/www/
```

Read the `deleting …` lines it prints; only when that list matches your expectations do you remove `--dry-run`. Note also that excludes take one pattern per flag — `--exclude='*.log' --exclude='.git'` — because a comma-separated list inside a single flag silently matches nothing.

If you'd rather compose the command with those guardrails enforced — a red warning when `--delete` is enabled without a dry run, per-pattern quoted excludes, and a live preview of the finished command — I built a [visual rsync command builder with delete-flag guardrails](https://bashsnippets.xyz/tools/rsync-command-builder) that runs entirely in the browser.
