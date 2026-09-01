<!-- REVIEW: incident dramatized — verify before publishing -->
# The Backup Dashboard Was Green. The Backup Was Gone.

The Saturday this story surfaced, a client emailed to ask whether I could recover a photo she'd deleted from her site months back. This is the exact scenario the nightly backup exists for, so I said yes before checking. Then I opened the mirror directory on my home server and found one file in it: `index.nginx-debian.html`. Not a corrupted backup. Not a failed one. A perfectly synchronized copy of the wrong thing.

Rewind nineteen nights. I'd spent an evening tidying the $5 VPS that serves her site — moved the web root from `/var/www/html` to `/srv/www`, pointed nginx at the new path, verified the pages loaded, closed the laptop. One thing kept the old path: the backup script. And `/var/www/html` didn't vanish when the site moved out, because Debian's nginx package keeps it around with a single default index page inside.

So every night at 2am, rsync ran with `--delete`, compared a source holding one file against a destination holding close to 3,800, and did what mirroring means: made the destination match. Then it exited 0. The healthcheck pinged green. The log gained another `✓ backup complete`. Nineteen consecutive successes, each one a deletion event, none of them distinguishable from health in any dashboard I had.

What I had to sit with afterward is that nothing malfunctioned. rsync's exit code reports on the operation it was handed — non-zero is reserved for its own failures: unreachable hosts, I/O errors, files vanishing mid-transfer, partial copies. "The source is a directory you abandoned last month" is not a condition rsync can detect. Making a full destination match a near-empty source is a legitimate mirror, completed cleanly. Exit 0 answers "did the sync finish?" — I had wired it up to answer "is the data safe?", and by that Saturday the two answers had diverged by a few thousand files.

rsync carries a whole family of these traps, and they share a signature: the wrong invocation doesn't error, it succeeds at something else. Leave the trailing slash off the source and you copy the directory itself rather than its contents, nesting `www/www` at the destination — which, on a `--delete` run, also shifts what gets compared and deleted. Skip `-a` and permissions, symlinks, and timestamps silently stop being preserved; worse, rsync's quick check identifies unchanged files by size plus modification time, so a destination stamped with transfer-time mtimes never matches again and every subsequent run re-copies the entire tree — still exiting 0. Feed one `--exclude` a comma-separated list of patterns and it matches nothing at all. Every one of these runs clean and lies dormant until the day you need the restore.

The countermeasure costs one flag:

```bash
rsync -avz --delete --dry-run -e ssh /srv/www/ travis@backup:/srv/backup/www/
```

`--dry-run` prints what the transfer would do — including every `deleting …` line — and touches nothing. On night one, that would have been thousands of deletion lines scrolling past my eyes instead of executing behind my back. You cannot miss a wall of deletions you are forced to read. You can miss anything in a log nobody opens.

That failure is the reason the [Rsync Command Builder](https://bashsnippets.xyz/tools/rsync-command-builder) exists. You give it a source and a destination, toggle the real flags — archive, verbose, compress, resume over unstable links, SSH transport, a KB/s bandwidth cap, comma-separated excludes that come out as individually quoted `--exclude` flags — and watch the finished command assemble itself in a live preview. Its opinions are the useful part: enabling `--delete` without dry-run triggers a red warning that these deletions are unrecoverable, and enabling both flips it to a green note that says remove `--dry-run` only after reading the preview. The Mirror preset arrives with dry-run already on, so destructive mirroring starts safe and you opt out of the safety deliberately. Everything runs client-side in the browser.

The photo, in the end, turned up as a low-res attachment in an old email thread — more luck than a backup strategy should ever require. The dashboard had told me the truth all along: rsync finished, every night. I was the one who decided that meant something it didn't.

Compose your next sync with the sharp edges visible: https://bashsnippets.xyz/tools/rsync-command-builder — and if you're scripting the full nightly job, the [Rsync Remote Backup](https://bashsnippets.xyz/snippets/rsync-remote-backup) snippet covers the cron scheduling and SSH key setup around it.

Originally published at https://bashsnippets.xyz/tools/rsync-command-builder

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Backup, Command Line -->
