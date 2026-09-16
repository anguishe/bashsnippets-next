# I Pointed rsync --delete at a Nearly Empty Directory. It Deleted 3,800 Files and Exited 0.

The rsync accident that ends backups is not an error. It is rsync doing exactly what it was told, successfully, to the wrong directory. I wanted to see how quiet that is, so I rebuilt it in a scratch directory on my own machine with rsync 3.5.0.

The destination held 3,800 files, standing in for a nightly mirror. The source held one file, `index.nginx-debian.html` — what Debian's nginx package leaves behind in `/var/www/html` after you move a site's web root somewhere else and forget that the backup script still points at the old path. Then the mirror command anyone would have in that script: `rsync -a --delete src/ dst/`.

It exited 0. Afterwards the destination held one file: `index.nginx-debian.html`. Three thousand eight hundred files gone, in a run that any cron wrapper, healthcheck ping or `✓ backup complete` log line would have recorded as a success. Run that nightly and every green checkmark in the dashboard is a record of the deletion.

## Exit 0 doesn't mean what your monitoring thinks

The bug is not in rsync. It is in what we assume its exit code promises. rsync reserves non-zero codes for failures on its own terms: an unreachable host, a protocol error, an I/O failure, source files vanishing mid-transfer (code 24), a partial transfer (code 23). Making a destination match a near-empty source is none of those. It is the requested operation, delivered without incident. A monitor that checks the exit code answers "did rsync finish?" and most of us have labelled that answer "is the data safe?" Those are different questions.

## rsync's sharp edges fail by succeeding

Once you see that shape, you find it all over the command. A trailing slash on the source means "copy the contents"; no trailing slash means "copy the directory itself", which nests a second directory inside your destination and, on a `--delete` mirror, changes what gets compared and therefore what gets removed. Both versions run clean. Drop `-a` and rsync stops preserving permissions, symlinks and timestamps, and because its quick check decides "already transferred" by size and modification time, a destination full of transfer-time mtimes never matches again, so every run quietly becomes a full re-copy that still exits 0. Hand a comma-separated list to a single `--exclude` and it is treated as one pattern with a comma in it, so it matches nothing and `node_modules` rides along every night. None of these produce an error. Each completes a different operation from the one in your head.

## The flag that shows the damage first

The habit that prevents the whole class is previewing every destructive sync. Same scratch directories, same command, with `--dry-run` and `-v`:

```text
$ rsync -a --delete --dry-run -v src/ dst/
sending incremental file list
deleting photo-999.jpg
deleting photo-998.jpg
deleting photo-997.jpg
…
```

Thousands of `deleting` lines, and afterwards the destination still held all 3,800 files. A wall of deletions in a preview you are reading is impossible to miss. The same wall executed in a log nobody opens is a green checkmark.

One detail the documentation does not shout: the `-v` is not optional. I ran `--dry-run` without it against a second scratch directory and it printed nothing at all and exited 0. A dry run you cannot see is not a preview. Use `-v`, or `--itemize-changes` if you want one line per file with a change code.

## So the builder makes the preview the default

The [Rsync Command Builder](https://bashsnippets.xyz/tools/rsync-command-builder) assembles the command in a live preview while you toggle the real options: archive mode, verbose output, compression, resume for unreliable links (`--partial --progress`), SSH transport, a bandwidth cap for syncs that share a link with people trying to use it, and exclude patterns. You type the excludes comma-separated and it emits one individually quoted `--exclude` flag per pattern, so the shell never expands your glob and the comma mistake cannot happen.

The opinions built into it are the point. Turn on `--delete` without dry-run and a red warning appears: those deletions are permanent, preview them first. Turn dry-run on and it switches to a green note telling you to remove `--dry-run` only after you have read the output. The Mirror preset ships with dry-run already enabled — mirroring is the one mode where you switch the safety off on purpose instead of remembering to switch it on. The whole thing runs in your browser; nothing you type leaves the page.

The scratch run took a fraction of a second to delete 3,800 files and report success. The preview took the same fraction of a second to list every one of them. The only difference was a flag.

Build the command with the guardrails on: https://bashsnippets.xyz/tools/rsync-command-builder

For the script around it — cron scheduling, SSH keys, a hardened nightly job — the [Rsync Remote Backup](https://bashsnippets.xyz/snippets/rsync-remote-backup) snippet pairs with this tool, [Automated File Backup](https://bashsnippets.xyz/snippets/automated-file-backup) covers the local variant, and the rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/tools/rsync-command-builder

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Backup, Command Line -->
