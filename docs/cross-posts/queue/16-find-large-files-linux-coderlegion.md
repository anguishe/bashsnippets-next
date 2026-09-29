<!-- NOT SCHEDULED. Wave 2 #16 - planned Tue 2026-11-10 08:00 CST (14:00Z), same minute as dev.to #16. Promoted from reserve/12 on 2026-09-28; the sort -rn/-rh and /proc/kcore claims were re-verified on this box that day. -->

# I deleted 44.6 GB and df moved by 5

On August 28 my laptop sat at 88 % disk. I deleted a 44.6 GB video intermediate I could rebuild any time. `du` on the folder dropped 44 GB. `df` on the filesystem moved 5. XFCE's thumbnailer, `tumblerd`, still had the file open, and a deleted file's blocks come back only when the last descriptor closes. `pkill -x tumblerd` returned the space instantly.

When `du` and `df` disagree, the gap is deleted-but-open files, and `lsof +L1` names them. For the usual case, where something real grew, the order is two commands:

```bash
du -ah / --exclude=/proc --exclude=/sys --exclude=/dev 2>/dev/null \
  | sort -rh | head -n 20
find / -xdev -type f -size +500M -exec ls -lh {} \; 2>/dev/null
```

The `-h` in `sort -rh` is load-bearing. I fed four size lines to both variants: `sort -rn` ranked `850K` above `13G` because it reads leading digits and stops. The excludes matter too: `/proc/kcore` on my laptop reports 128 TiB on an 868 GB disk, and any scan that walks it wastes minutes or reports nonsense.

On a server, when the full file is a log a live service still writes, skip `rm` and truncate in place with `: > access.log`, which keeps every open descriptor valid and frees the space without a restart.

Thresholds, exclude patterns and a recent-growth variation are on the [find large files page](https://bashsnippets.xyz/snippets/find-large-files-linux).
