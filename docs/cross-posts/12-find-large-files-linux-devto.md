<!-- REVIEW: incident dramatized — verify before publishing -->
---
title: "I Deleted a 12 GB Log and the Disk Stayed at 100%"
published: true
description: "A full disk took a client site down at 7am. du found the 12 GB log in seconds — and rm taught me why deleting it freed nothing."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/find-large-files-linux
cover_image: https://bashsnippets.xyz/ogimage.png
---

The email arrived at 7:14 on a Tuesday: "site's down." I SSH'd into the $5 VPS that hosts a client's site and ran `df -h`, which told me everything and nothing: 25G disk, 25G used, 0 available, 100%. nginx had stopped writing logs, the app was returning 500s on anything that touched disk, and the previous night's backup had failed without a word because it had nowhere to land.

`df` had named the emergency and had nothing to say about the cause. That's not a flaw — it's what the tool is. `df` reads the filesystem's own bookkeeping, which is why it answers instantly, and that bookkeeping tracks totals, not culprits. "Which partition is full" and "what filled it" are different questions, and at 7am I only had a tool for the first one.

My first swing at the second question was `du -sh /*`. It churned for two minutes, sprayed permission errors, and announced that /proc held about 128 terabytes. On a 25 GB disk. /proc and /sys are virtual filesystems — their contents are kernel interfaces synthesized at read time, and /proc/kcore in particular reports the size of the kernel's addressable memory, which on a 64-bit machine is 128 TB. A disk scan that doesn't exclude the virtual filesystems produces noise dressed as data, and on a bad morning you will chase it.

With the excludes in place, the real answer took nine seconds: /var/log held 13 GB of the 25, and 12 GB of that was a single nginx access log. A scraper had been hammering the site around the clock for about three weeks, that vhost's log had never made it into logrotate, and a growing log is the quietest failure there is — nothing complains until the disk does.

Then came the ten minutes that made me turn this into a script I keep. I deleted the log. `rm access.log`, then `df -h` — still 100%. Ran it again. Still 100%. I had deleted twelve gigabytes and recovered zero bytes, and I spent those minutes doubting the filesystem instead of my own mental model, which was the part that actually deserved the doubt.

Here's the mechanism. `rm` doesn't delete data; it removes a directory entry pointing at an inode. The blocks come back only when the inode's link count hits zero *and* no process holds the file open. nginx still had an open descriptor on that log and was still writing to it. All my deletion accomplished was making the file invisible while changing nothing about the space it consumed. `systemctl reload nginx` made nginx close and reopen its logs; the instant the last descriptor closed, 12 GB reappeared.

So the rule I keep now: on a log a live service owns, `rm` is the wrong verb. Truncate it in place with `> access.log` — the inode and every open descriptor survive, the length drops to zero, the space returns immediately. And when `df` swears the disk is full while `du` can't find the space, that gap *is* deleted-but-open files; `lsof +L1` lists them by name.

## The two commands that answer "what ate the disk"

```bash
# Ranked: the 20 largest files and directories, biggest first
du -ah / --exclude=/proc --exclude=/sys --exclude=/dev 2>/dev/null \
  | sort -rh | head -n 20

# Individual files over 500 MB, wherever they hide
find / -type f -size +500M -not -path "/proc/*" -not -path "/sys/*" \
  -exec ls -lh {} \; 2>/dev/null
```

The `du` pass is the league table. `-a` includes files, not only directories, so a single monster log surfaces by name instead of hiding inside its parent's total, and `head` holds the output to the twenty entries worth reading.

`sort -rh` is the flag doing quiet load-bearing work. A plain numeric `sort -rn` reads leading digits and stops, so it ranks `500M` above `10G` — 500 beats 10 — and hands you a confidently wrong list. The `-h` variant parses the size suffixes `du` emits, so gigabytes outrank megabytes. One character separates a ranking from a shuffle.

The `find` pass exists because `du` aggregates. A directory can top the chart on the strength of a hundred thousand small files, which is a real problem but a different one. `find -size +500M` cuts across the tree and pulls out individual heavyweights — a forgotten database dump, a core file, a tarball somebody meant to move, my access log.

The full version on the page wraps both passes into one script with the target directory and size threshold as arguments, and carries the variations I actually reach for: a `--max-depth=1` pass for big filesystems where a full walk drags, and a `-mtime -1` pass that answers the sharper question — what grew since yesterday? — which on a disk that filled overnight is most of the investigation.

That Tuesday cost me about forty minutes: two flailing at `du` noise, ten confused by a deletion that freed nothing, the rest on cleanup. The script version costs about ten seconds, and the page includes the `lsof` check to run *before* deleting anything — the step that would have spared me the strangest ten minutes of the morning.

Full script with the exclude patterns, thresholds, and the recent-growth variation: https://bashsnippets.xyz/snippets/find-large-files-linux

Getting the space back is the recovery half. Never seeing 100% again is the [Disk Space Warning](https://bashsnippets.xyz/snippets/disk-space-warning) snippet's job — it alerts at a threshold you pick instead of letting the disk do the alerting — and [Delete Old Log Files](https://bashsnippets.xyz/snippets/delete-old-log-files) keeps the logs from regrowing behind you. The rest of the library is at https://bashsnippets.xyz
