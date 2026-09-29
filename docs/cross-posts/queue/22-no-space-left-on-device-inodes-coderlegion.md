<!-- NOT SCHEDULED. Wave 2 #22 - planned Tue 2026-12-08 08:00 CST (14:00Z), same minute as dev.to #22. Run re-done without root on this box 2026-09-28 (unshare -rm, 50M tmpfs capped at 1,000 inodes, bash 5.3.9); page went live 2026-09-28. -->

# No space left on device, 1% used: out of inodes

Every write on the filesystem failed with `No space left on device`, and `df -h` said 1% used. I reproduced it without root on my own machine: `unshare -rm`, a 50 MB tmpfs capped at 1,000 inodes, 40 log files, then one empty session file per loop until the kernel refused.

```text
repro.sh: line 4: /mnt/app/sessions/sess_957: No space left on device
$ df -h /mnt
Filesystem      Size  Used Avail Use% Mounted on
tmpfs            50M  160K   50M   1% /mnt
$ df -i /mnt
Filesystem     Inodes IUsed IFree IUse% Mounted on
tmpfs            1000  1000     0  100% /mnt
```

`df -h` counts data blocks. Every file, directory and symlink also costs one inode, and ext4 fixes the inode count at `mkfs` time. Empty files use no blocks and still use an inode each, and the kernel reports running out with the same error as a full disk. So the first check is `df -i`, not `du`.

To find the culprit, count entries per directory on that filesystem with `find /mnt -xdev -printf '%h\n' | sort | uniq -c | sort -rn`. Mine put 956 entries in `sessions` on the first line. `find -type f -delete` cleared them (a glob hits the argument limit at real scale), and the write that had failed a minute earlier exited 0. No remount, no restart.

The threshold check that names the fullest directories, plus the cron line, is in the [inode exhaustion script](https://bashsnippets.xyz/snippets/no-space-left-on-device-inodes).
