<!-- REVIEW: incident dramatized — verify before publishing -->
---
title: "A Dead $5 VPS Took 9 GB of Client Files — and Every Backup I Had"
published: true
description: "My nightly backup ran clean for 14 months and saved nothing when the disk died. Incremental rsync over SSH: excludes, resume, dry-run, cron."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/rsync-remote-backup
cover_image: https://bashsnippets.xyz/ogimage.png
---

The pager didn't go off, because there was no pager. At 6:41 on a Tuesday morning a client texted me a screenshot of their site timing out, and by 7:15 the provider's ticket queue had confirmed what the unreachable SSH session already implied: the host node behind the $5 VPS had suffered a storage failure, and the virtual disk was gone. Not degraded. Gone.

The site's code was safe in git. The 9 GB of everything else — customer uploads, fourteen months of order attachments, the small SQLite database behind the contact form — existed in exactly two places: on that disk, and in the nightly tarballs my cron job had faithfully written at 2am for fourteen months straight. To `/var/backups`. On the same disk.

I spent the next nine hours rebuilding what I could from sent-mail attachments, a stale sync on a retired laptop, and the Wayback Machine, and recovered maybe 60 percent. The part that still stings: I had spot-checked that backup log a week earlier, seen a clean run and a healthy file size, and felt genuinely good about my setup.

## The exit code measures the copy, not the backup

Here's the mechanism I had wrong. Every one of those 2am runs was correct — the tarball was complete, the exit code was 0, the log said success. None of that made it a backup, because a backup's value isn't a property of the copy; it's a property of how many failure modes the copy shares with the original. Mine shared all of them. Disk failure, hypervisor failure, ransomware, a fat-fingered `rm -rf`, a compromised login — anything capable of destroying the data was equally capable of destroying its "backup," because they were the same physical thing. A copy on the same machine is a convenience for undoing your own mistakes. It protects you from nothing that happens to the machine.

The fix is to put the copy in a different failure domain, and the tool that makes that cheap enough to run every night is rsync over SSH:

```bash
rsync -az --delete --partial \
  -e "ssh -i $HOME/.ssh/id_ed25519" \
  --exclude-from="$HOME/.rsync-excludes" \
  /home/user/projects/ backups@backup-host:/backup/projects/
```

`-a` carries permissions, ownership, timestamps, and symlinks across, so a restore actually restores. `-z` compresses data on the wire. And the reason this can run nightly instead of monthly is the delta algorithm: after the first full push, rsync compares what's already on the far side and sends only what changed, so a 9 GB tree with 40 MB of daily churn syncs in seconds rather than the hour the first run took.

Four things in that short command hide traps worth knowing before you point it at anything you care about.

## The trailing slash is load-bearing

`/home/user/projects/` with the slash means "the contents of projects." Without the slash it means "the directory projects itself," and the destination quietly grows a nested `projects/projects/` — which your restore procedure, written against the path you *intended*, won't find at 3am. One character, two different trees.

## --delete builds a mirror, and a mirror is loyal to your mistakes

`--delete` removes files from the destination that no longer exist on the source. That's what keeps the remote a true mirror instead of a landfill of every file you ever renamed — and it also means a destructive mistake on the source replicates outward on the next run. Delete the wrong directory on Monday, and Tuesday's 2am sync deletes it from your backup too. Two disciplines contain this: run `--dry-run` before the first real run and after any script change, and actually read what it plans to remove; and for data where yesterday's version matters, use the `--link-dest` snapshot variation — dated directories that hardlink unchanged files, so keeping history costs almost no extra disk.

## An interrupted transfer restarts from zero — unless you say otherwise

rsync's default behavior on a dropped connection is to discard the partially transferred file and start that file over on the next run. During the first big push over a residential upstream, that can mean a multi-gigabyte file that never manages to finish. `--partial` keeps the fragment and resumes it, which is the difference between a first sync that converges and one that thrashes for days.

## It will work by hand and fail under cron

The last trap arrives after everything works. You test interactively, it flies, you schedule it with `0 2 * * * /usr/local/bin/rsync-backup.sh >> /var/log/rsync-backup.log 2>&1` — and it dies with `Permission denied (publickey)`. Interactively, ssh found your key through ssh-agent, which lives in your login session. Cron runs with almost no environment and no agent, so the script has to name the key file explicitly via `-e "ssh -i /path/to/key"`. That's why the flag sits in the core command above instead of being left to defaults.

On the Tuesday the VPS died, this script — pointed at a box in a different building, on a different provider — would have turned nine hours of scavenging into one rsync in the opposite direction. The 2am job never needed to be smarter. It needed its output to live somewhere the disaster couldn't reach.

Full hardened script — timestamped logging, the exclude file, bandwidth capping, the cron entry, and the `--link-dest` snapshot variation: https://bashsnippets.xyz/snippets/rsync-remote-backup

The [rsync Command Builder](https://bashsnippets.xyz/tools/rsync-command-builder) composes these flags visually if you'd rather click than memorize, the [SSH key setup script](https://bashsnippets.xyz/snippets/ssh-key-setup-script) covers the passwordless auth this whole thing depends on, and the rest of the library is at https://bashsnippets.xyz
