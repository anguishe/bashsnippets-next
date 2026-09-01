<!-- REVIEW: incident dramatized — verify before publishing -->
# My Backup Job Never Failed Once. I Still Lost 9 GB.

Sixty percent. That's how much of a client's data I clawed back after nine hours of digging through sent-mail attachments, a stale folder on a retired laptop, and the Wayback Machine. The other forty percent — customer uploads, order attachments, a small SQLite database — was gone permanently, and it had been gone from the moment one virtual disk under one $5 VPS failed at 6:41 on a Tuesday morning.

What made it worse was that a backup existed, and it had a flawless record. Every night at 2am for fourteen months, cron built a tarball, logged a success line, and exited 0. I had even spot-checked the log the week before and admired the clean run. The tarballs went to `/var/backups` — the same virtual disk that the provider's storage failure erased. Fourteen months of perfect executions, zero bytes of protection.

That's the trap in local-only backups, and it's worth stating precisely: a backup's worth is not decided by whether the copy is correct. It's decided by how many failure modes the copy shares with the original. Sharing a disk means sharing all of them — hardware death, ransomware, a wrong-path `rm -rf`, a compromised account. The exit code tells you the copy succeeded. It says nothing about whether the copy will exist when you reach for it, and those turn out to be entirely different engineering problems.

So the replacement had one requirement above every other: the copy lives on a machine that can't die in the same event. rsync over SSH makes that cheap enough to do nightly:

```bash
rsync -az --delete --partial \
  -e "ssh -i $HOME/.ssh/id_ed25519" \
  --exclude-from="$HOME/.rsync-excludes" \
  /home/user/projects/ backups@backup-host:/backup/projects/
```

The economics come from the delta algorithm. The first push moves everything; every run after that compares against what the far side already holds and transfers only the changes, so a 9 GB tree with modest daily churn syncs in seconds. `-a` preserves ownership, permissions, timestamps, and symlinks — the difference between a restore and a pile of files with the wrong metadata. `-z` compresses in transit.

That short command also carries four sharp edges, and each one bites in a different way.

The trailing slash on the source is semantic, not cosmetic. `/home/user/projects/` copies the *contents*; drop the slash and rsync copies the directory itself, silently nesting `projects/projects/` on the destination — a tree your restore runbook doesn't expect.

`--delete` is what keeps the remote an exact mirror instead of an ever-growing pile of renamed leftovers, but a mirror reproduces your mistakes as faithfully as your data. Remove the wrong folder locally and the next scheduled run removes it remotely too. Preview with `--dry-run` before trusting it, and when history matters, the `--link-dest` variation keeps dated hardlink snapshots so yesterday's state survives today's error at almost no disk cost.

`--partial` exists because rsync's default on an interrupted transfer is to throw the incomplete file away and begin it again from byte zero next time. Over a residential upstream, a large file can loop like that indefinitely. With the flag, the fragment is kept and resumed, and the first big sync actually converges.

And the failure that waits until you think you're done: the script runs perfectly by hand, then dies under cron with `Permission denied (publickey)`. Nothing about rsync changed — the environment did. Your interactive shell had ssh-agent holding the key; cron has no agent and nearly no environment, so the key path must be spelled out with `-e "ssh -i /path/to/key"`. It's in the command above for exactly that reason.

Measured against that Tuesday: with this pointed at a box on a different provider, recovery would have been one rsync in the reverse direction — minutes, not nine hours, and one hundred percent instead of sixty. The cron job was never the weak part. The geography was.

The full hardened version — timestamped logging, the exclude file, bandwidth limiting for shared connections, the cron entry, and the snapshot variation — lives here, along with a visual rsync Command Builder and the SSH key setup that automated backups depend on.

Originally published at https://bashsnippets.xyz/snippets/rsync-remote-backup

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Backup, Sysadmin -->
