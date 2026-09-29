# rsync projects and rsync projects/ Make Two Different Backups

Two rsync commands, one character apart, both exit 0, and they put the same file in two different places. I ran them side by side in a scratch directory on my own machine, rsync 3.5.0, with one file in `projects/app/main.sh` and two empty destinations:

```bash
$ rsync -a projects backup-a/
$ find backup-a -type f
backup-a/projects/app/main.sh
$ rsync -a projects/ backup-b/
$ find backup-b -type f
backup-b/app/main.sh
```

Without the slash, rsync copies the directory `projects` itself, so the files land one level deeper, under `backup-a/projects/`. With the slash, it copies the contents of `projects`, so `app/` sits directly inside `backup-b/`. Neither is wrong. What goes wrong is writing a restore script, a cron entry or a `--delete` mirror against one layout while the backup was made with the other.

## Why nobody notices until restore day

The backup job does not care which layout it made. It reports success either way, the files are all there, and a glance at the destination shows your project name somewhere in the tree. The mismatch surfaces only when something reads the backup by path: the restore that looks in `backup/app` and finds nothing because the files are in `backup/projects/app`, or a second job, written months later with the other habit, that starts a parallel copy beside the first one and doubles the disk use without a single error.

The rule that keeps it straight: the slash is about the source. `projects/` means "what is inside projects". `projects` means "the directory called projects". The destination's trailing slash barely matters; the source's decides the layout. The [rsync command builder](https://bashsnippets.xyz/tools/rsync-command-builder) on the site now spells this out for the exact path you type, saying where the files will land and what dropping or adding the slash would change.

## --delete makes the slash expensive

A mirror uses `--delete`, which removes anything on the destination that no longer exists on the source. That keeps the far side from filling up with every file you ever renamed, and it also means the slash now decides what gets compared, not only where things go. Point a `--delete` run at the wrong level and rsync compares two trees that do not correspond.

It also means a mistake on the source replicates on the next run. In the same scratch directory I moved `main.sh` out of `projects/app/` and previewed the mirror. `rsync -a --delete --dry-run projects/ backup-b/` printed nothing at all and exited 0. The same command with `-v` added showed the one line that mattered: `deleting app/main.sh`. A dry run without `-v` previews nothing, so it proves nothing. The file was still in `backup-b` afterwards, because nothing had actually run.

Two habits contain it: preview any `--delete` run with `--dry-run -v`, and keep dated snapshots on the far side, which the `--link-dest` variant on the snippet page does, so yesterday's copy survives today's mistake.

## The prompt cron cannot answer

The first time I pushed files from this laptop to my MacBook, rsync printed `Permission denied` three times, then `Too many authentication failures`, then `rsync error … (code 255)`. The real cause appeared nowhere in that output: KDE's password helper had intercepted ssh's prompt, failed to draw it, and sent an empty password each time. A cron job has nobody to type a password at all, so a remote backup needs key authentication and should fail fast instead of waiting. The core of the snippet's command is `rsync -az --delete --partial -e "ssh -i $HOME/.ssh/id_ed25519 -o BatchMode=yes" --exclude-from="$HOME/.rsync-excludes" /home/user/projects/ backups@backup-host:/backup/projects/`.

`BatchMode=yes` makes ssh refuse any interactive prompt, so a broken key is an immediate non-zero exit your alerting can see. `-a` carries permissions, ownership, timestamps and symlinks, `-z` compresses on the wire, `--partial` lets an interrupted transfer resume, and `--exclude-from` reads one pattern per line. Note the trailing slash on the source: the files land in `/backup/projects/`, not `/backup/projects/projects/`.

Then do the step that turns a copy into a backup: restore something from it, on purpose, on a day nothing is wrong. That is the moment the slash stops being a detail, and it is much cheaper to find out then than on the day you need the files.

---

Full hardened script, with timestamped logging, the exclude file, bandwidth capping, the cron entry and the `--link-dest` snapshot variation: https://bashsnippets.xyz/snippets/rsync-remote-backup

The [SSH key setup script](https://bashsnippets.xyz/snippets/ssh-key-setup-script) covers the passwordless auth the cron job depends on, and for a second copy on a local disk, [Automated File Backup](https://bashsnippets.xyz/snippets/automated-file-backup) does the timestamped version with cp or rsync. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/rsync-remote-backup

<!-- Medium tags to set in the UI: Linux, Bash, DevOps, Backup, Sysadmin -->
