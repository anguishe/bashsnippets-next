# rsync projects and rsync projects/ Make Two Different Backups

A backup is worth exactly as much as the failures it does not share with the original. A nightly tarball written to `/var/backups` on the same disk survives an accidental `rm` and nothing else: the disk dying, the host dying, ransomware and a bad `sudo` all take the copy with the original. The exit code of that job measures the copy, not the backup.

The cheap way to put the copy in a different failure domain is rsync over SSH to another machine. It is also a command with three sharp edges, and I ran each of them on my own machine before trusting it with anything, rsync 3.5.0.

## The trailing slash is load-bearing

In a scratch directory I made `projects/app/main.sh` and an empty `backup/`. `rsync -a projects backup/` produced `backup/projects/app/main.sh`. Emptied, then `rsync -a projects/ backup/` produced `backup/app/main.sh`.

With the slash, rsync copies the contents of `projects`; without it, it copies the directory itself. Both run clean. The difference only shows up at restore time, when the script you wrote against the path you intended looks in `backup/app` and the files are one level deeper, or when a `--delete` mirror compares the wrong trees.

## --delete makes a mirror, and a mirror copies your mistakes

`--delete` removes files from the destination that no longer exist on the source. It keeps the remote a true mirror instead of a landfill of every file you ever renamed, and it also means a mistake on the source replicates outward on the next run. I deleted `main.sh` from the source and ran the mirror with `--dry-run -v`: the only line that mattered was `deleting app/main.sh`. Without `--dry-run`, that would have been gone from the backup too.

Two disciplines contain it: preview destructive runs with `--dry-run -v` (without `-v`, a dry run prints nothing at all), and keep dated snapshots on the far side — the `--link-dest` variant in the full script — so yesterday's copy survives today's mistake.

## The password prompt cron cannot answer

The first time I pushed files from this Kali laptop to my MacBook, rsync printed `Permission denied` three times, then `Too many authentication failures`, then `rsync error … (code 255)`. The real cause appeared nowhere in that output: KDE's password helper had intercepted ssh's prompt, failed to draw it, and sent an empty password each time.

A cron job has no one to type a password at all, so a remote backup needs key authentication, set up once, and it should fail fast rather than hang waiting for input that will never come:

```bash
rsync -az --delete --partial \
  -e "ssh -i $HOME/.ssh/id_ed25519 -o BatchMode=yes" \
  --exclude-from="$HOME/.rsync-excludes" \
  /home/user/projects/ backups@backup-host:/backup/projects/
```

`BatchMode=yes` makes ssh refuse any interactive prompt, so a broken key produces an immediate non-zero exit your alerting can see instead of a job that hangs until the next one overlaps it. `-a` carries permissions, ownership, timestamps and symlinks, so a restore restores. `-z` compresses on the wire. `--partial` keeps a half-transferred file so an interrupted run resumes instead of starting over, and `--exclude-from` reads one pattern per line — a comma-separated list inside a single `--exclude` matches nothing.

The reason this can run every night is the delta algorithm: after the first full copy, rsync compares what is already on the far side and sends only what changed. A large tree with little daily churn syncs in seconds.

Then do the step that turns a copy into a backup: restore something from it, on purpose, on a day nothing is wrong. A backup nobody has ever restored from is still a hypothesis.

---

Full hardened script — timestamped logging, the exclude file, bandwidth capping, the cron entry, and the `--link-dest` snapshot variation: https://bashsnippets.xyz/snippets/rsync-remote-backup

The [rsync Command Builder](https://bashsnippets.xyz/tools/rsync-command-builder) composes these flags visually if you'd rather click than memorize, the [SSH key setup script](https://bashsnippets.xyz/snippets/ssh-key-setup-script) covers the passwordless auth this whole thing depends on, and the rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/rsync-remote-backup

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Backup, Sysadmin -->
