<!-- NOT SCHEDULED. Wave 2 #18 - planned Tue 2026-11-17 08:00 CST (14:00Z), same minute as dev.to #18. Trailing-slash and --delete --dry-run behaviour re-run in scratch on this box 2026-09-28 (rsync 3.5.0). -->

# One slash, two backup layouts: rsync projects vs projects/

Two rsync commands one character apart both exit 0 and put the same file in different places. I ran them side by side in a scratch directory, rsync 3.5.0, with one file at `projects/app/main.sh`:

```bash
$ rsync -a projects backup-a/
$ find backup-a -type f
backup-a/projects/app/main.sh
$ rsync -a projects/ backup-b/
$ find backup-b -type f
backup-b/app/main.sh
```

Without the slash, rsync copies the directory itself. With it, rsync copies the contents. The source's slash decides the layout; the destination's barely matters. Neither result is wrong, and the backup job reports success either way. The mismatch shows up when something reads the backup by path: a restore script looking in `backup/app` while the files sit in `backup/projects/app`.

Add `--delete` and the slash also decides which trees get compared. I moved `main.sh` out of the source and previewed the mirror: `--dry-run` alone printed nothing and exited 0, while `--dry-run -v` showed `deleting app/main.sh`. A dry run without `-v` proves nothing.

For the remote half, use key auth with `ssh -o BatchMode=yes`, so a cron job with no one to type a password fails fast instead of hanging. The hardened script, the cron line and the `--link-dest` snapshot variation are in [the rsync remote backup snippet](https://bashsnippets.xyz/snippets/rsync-remote-backup).
