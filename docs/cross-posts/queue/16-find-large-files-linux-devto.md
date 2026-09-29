---
title: "I Deleted a 44.6 GB File and df Gave Me Back 5 GB. Something Still Had It Open."
published: true
description: "du said the space was gone; df said it wasn't, because a thumbnailer still held the deleted file open. Finding what ate a disk, ranking it correctly, and getting the space back."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/find-large-files-linux
cover_image: https://bashsnippets.xyz/ogimage.png
---

On August 28 my laptop's disk sat at 88 %, and I went looking for something big to delete. I found it quickly: a 44.6 GB video intermediate, a rotate-to-vertical export I could rebuild from its source at any time. I deleted it. `du` on that folder dropped by 44 GB. `df` on the filesystem moved by 5.

For a few minutes I doubted the filesystem. The real answer was a process. XFCE's thumbnailer daemon, `tumblerd`, had opened the file to generate a preview and never closed it. `pkill -x tumblerd` gave the space back instantly, and the daemon respawns on its own the next time something needs a thumbnail, so killing it cost nothing.

That gap between `du` and `df` is the whole lesson, and it is the one people hit on servers with log files.

## Why deleting a file can free nothing

`rm` does not delete data. It removes a directory entry that points at an inode. The blocks go back to the filesystem only when the inode's link count reaches zero *and* no process still has the file open. While one descriptor is open, the file is invisible to `ls` and `du` and still fully allocated as far as `df` is concerned. `du` counts names that are gone; `df` counts blocks that are actually free. When they disagree, the difference is deleted-but-open files.

`lsof +L1` lists them: open files with a link count below one. Without root it shows only your own processes; on my machine today it shows nothing more alarming than a few of PipeWire's memory-backed buffers. On a server, run it as root and the culprit usually has a name, a PID and a size.

There is a second reason `df` can refuse to move: hard links. Removing one name of a file that has another name frees nothing, because the link count is still above zero. `stat -c %h file` prints the count before you rely on the delete.

And on a server, when the file is a log that a live service is still writing, `rm` is the wrong verb entirely. Truncate it in place with `: > access.log`: the inode and every open descriptor survive, the length drops to zero, and the space comes back without restarting anything.

## Finding what ate the disk

`df` tells you which filesystem is full. It cannot tell you why, because it reads totals from the filesystem's own bookkeeping. The question "what filled it" is two commands:

```bash
# The 20 largest files and directories, biggest first
du -ah / --exclude=/proc --exclude=/sys --exclude=/dev 2>/dev/null \
  | sort -rh | head -n 20

# Individual files over 500 MB, wherever they hide
find / -xdev -type f -size +500M -exec ls -lh {} \; 2>/dev/null
```

Run against my home directory without root, the first one answered in under two minutes: 645 G in total, 430 G of it in one projects folder, and the top of the list was two video projects' raw-footage folders. No mystery left, only decisions about what to keep.

## The one character that reorders the list

`sort -rh` is doing more work than it looks. I fed the same four `du`-style lines to both variants. `sort -rn` returned `850K`, `500M`, `13G`, `10G`: it reads the leading digits and stops, so 850 beats 500 beats 13, and the smallest item is ranked first. `sort -rh` returned `13G`, `10G`, `500M`, `850K`, because `-h` understands the size suffixes `du` prints. One letter separates a ranking from a shuffle, and the wrong one fails quietly on exactly the list you are reading under pressure.

## Why the excludes are not optional

`ls -l /proc/kcore` on my laptop reports a file of 140,737,471,590,400 bytes, which is 128 TiB on a machine with an 868 GB disk. It is not a file; it is the kernel's address space presented as one, and `/proc` and `/sys` are full of synthesized entries like it. Any size scan that walks them either wastes minutes or reports nonsense, and the `find` above adds `-xdev` so it stays on one filesystem and never crosses into them or into network mounts.

The order that works under pressure is `df -h` to find the full filesystem, the ranked `du` to find what grew, `find -size` for the single monster file, and `lsof +L1` the moment `df` and `du` disagree. My 44.6 GB would have taken ten seconds with that last step instead of ten minutes of doubting the filesystem.

---

Full script with the exclude patterns, thresholds, and the recent-growth variation: https://bashsnippets.xyz/snippets/find-large-files-linux

Getting the space back is the recovery half. Never seeing 100 % again is the [Disk Space Warning](https://bashsnippets.xyz/snippets/disk-space-warning) snippet's job — it alerts at a threshold you pick instead of letting the disk do the alerting — and [Delete Old Log Files](https://bashsnippets.xyz/snippets/delete-old-log-files) keeps the logs from regrowing behind you. The rest of the library is at https://bashsnippets.xyz
