---
title: "\"No Space Left on Device\" on a Disk at 1%: I Ran Out of Inodes"
published: true
description: "Every write failed with No space left on device while df -h said 1% used. A real run on a capped tmpfs: the filesystem was out of inodes. df -i, then find the directory holding the files."
tags: bash, linux, sysadmin, devops
canonical_url: https://bashsnippets.xyz/snippets/no-space-left-on-device-inodes
cover_image: https://bashsnippets.xyz/ogimage.png
---

The shell said `No space left on device`. `df -h` said the filesystem was at 1%, with 50M available. Both were telling the truth, and I had set it up that way on purpose, because this is the failure that makes people distrust `df` and start deleting things at random.

I wanted to watch it happen on my own machine without touching a real disk and without root. `unshare -rm` gives an unprivileged user a private mount namespace, and inside it I mounted a 50 MB tmpfs with its inode count capped at 1,000: `mount -t tmpfs -o size=50M,nr_inodes=1000 tmpfs /mnt`. Then I played the part of an application: 40 log files with one line each, and a session directory that gets one empty file per visitor, written in a loop until something refused.

```text
repro.sh: line 4: /mnt/app/sessions/sess_957: No space left on device
sessions created before failure: 956
repro.sh: line 6: /mnt/app/logs/new.log: No space left on device
exit=1
$ df -h /mnt
Filesystem      Size  Used Avail Use% Mounted on
tmpfs            50M  160K   50M   1% /mnt
$ df -i /mnt
Filesystem     Inodes IUsed IFree IUse% Mounted on
tmpfs            1000  1000     0  100% /mnt
```

Session 957 failed, and so did a write to a completely different directory. Once the filesystem is out, nothing on it can create a file, however many blocks are free. On a production box that is the moment the app stops taking logins, the logger stops logging, and whoever is on call opens `df -h`, sees plenty of room, and loses twenty minutes to the wrong theory.

## Blocks and inodes are two separate budgets

`df -h` counts data blocks. A file also needs an inode: the record that holds its owner, mode, timestamps and where its blocks live. Every file, directory and symlink costs exactly one, whether it holds a gigabyte or nothing. ext4 decides how many inodes a filesystem gets once, at `mkfs` time, from a bytes-per-inode ratio, and never adds more in place. When the last one is used, the kernel returns `ENOSPC`, the same error number a full disk returns, so the message cannot tell you which budget ran out.

My 956 session files were empty. They used zero blocks and 956 inodes. That is the whole shape of the problem: something creating small files faster than anything removes them. PHP session stores where the garbage collector never runs, a mail queue behind a dead relay, a cache that writes one file per key, or a cron job that leaves one `mktemp` file behind every minute, which is 525,600 inodes a year.

The first question is always `df -i`. If `IUse%` is at or near 100% while `df -h` is not, you have your answer and you can stop suspecting large files.

## Finding the directory, then getting them back

`du` is the wrong tool here, because it measures size, and these files have none. What you want is a count of entries per directory, staying on the one filesystem:

```bash
find /mnt -xdev -mindepth 1 -printf '%h\n' | sort | uniq -c | sort -rn | head -5
```

`%h` prints each entry's parent directory, so `uniq -c` turns the stream into a per-directory count, and `-xdev` keeps `find` from wandering into other mounts whose files do not spend this filesystem's inodes. On my run the answer was on the first line:

```text
    956 /mnt/app/sessions
     40 /mnt/app/logs
      2 /mnt/app
      1 /mnt
```

I cleared it with `find /mnt/app/sessions -type f -delete`, not `rm sessions/*`. At real-world scale, hundreds of thousands of files, that glob expands past the kernel's argument limit and `rm` never starts. After the delete, `df -i` showed 44 used and 956 free, and the write to `logs/new.log` that had failed a minute earlier exited 0. No remount, no restart: an inode comes back the moment its last link is removed, provided no process still holds the file open. If one does, `lsof +L1` names it.

For contrast, the root filesystem on this same laptop, checked right after: 57,843,712 inodes, 6% used. The disk there is nearly full by blocks and nowhere near full by inodes, which is the healthy shape. Block use and inode use move independently. When inode use runs far ahead of block use, something is making small files and nothing is cleaning up.

The embarrassing part of this failure is how long you can stare at the correct `df -h` output. The fix is a second flag on a command you already ran, and a cron job that checks it before the writes start failing.

---

Full script, which prints block and inode use side by side, exits 1 over a threshold and names the fullest directories, with the cron line and the XFS/btrfs notes: https://bashsnippets.xyz/snippets/no-space-left-on-device-inodes

When the disk really is full of data, [Find Large Files on Linux](https://bashsnippets.xyz/snippets/find-large-files-linux) is the other half of this diagnosis, and [Argument List Too Long](https://bashsnippets.xyz/snippets/argument-list-too-long) covers deleting the files once you have found them. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 2 #22 - planned Tue 2026-12-08 08:00 CST (14:00Z). Run re-done without root on this box 2026-09-28 (unshare -rm, tmpfs nr_inodes=1000, bash 5.3.9); df -h showed 160K/1% on this run (the page's first run showed 0%). No OUTPUT PLACEHOLDER: the sudo variant (plan cmd C) is not needed. -->
