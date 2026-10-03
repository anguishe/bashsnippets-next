---
title: "I Deleted a 48M Log to Free Space. The Next Write Still Hit 'No space left on device'."
published: true
description: "rm took a 48M log out of du and left it in df, and the next 32M write ran out of space with du showing 16M. lsof +L1 named the process still holding the deleted file, and one redirect gave the space back."
tags: bash, linux, sysadmin, devops
canonical_url: https://bashsnippets.xyz/snippets/lsof-command-examples
cover_image: https://bashsnippets.xyz/ogimage.png
---

A 64M filesystem, a worker that appends to a log and keeps it open the way a daemon does, and the reflex everyone has when a disk fills up: delete the log. I built it on a tmpfs mounted on `/srv` inside `unshare -rm`, a private mount namespace with no sudo, where I show up as root. The worker is a bash process that writes 48M to `worker.log` through file descriptor 3 and then turns into `sleep`, still holding the descriptor:

```text
$ df -h /srv
Filesystem      Size  Used Avail Use% Mounted on
tmpfs            64M   48M   16M  75% /srv
$ du -sh /srv/app
48M	/srv/app
$ rm /srv/app/worker.log
$ du -sh /srv/app
0	/srv/app
$ df -h /srv
Filesystem      Size  Used Avail Use% Mounted on
tmpfs            64M   48M   16M  75% /srv
$ head -c 32M /dev/zero > /srv/app/export.bin
head: error writing 'standard output': No space left on device
exit=1
$ du -sh /srv/app
16M	/srv/app
$ df -h /srv
Filesystem      Size  Used Avail Use% Mounted on
tmpfs            64M   64M     0 100% /srv
```

`du` went to zero the moment the log was gone. `df` did not move. Then a 32M write failed at 16M, and the filesystem reported itself 100% full while `du` could only find the 16M half-file from the write that failed.

Every check you would normally run after a cleanup says the cleanup worked. `ls` shows no log. `du` shows almost nothing. Only `df`, the one number that matters to the next write, disagrees, and it does not say why.

## rm removes a name, not the data

A file is an inode, and a directory entry is a name pointing at it. `rm` removes the name. The kernel frees the blocks only when the inode has no names left *and* no process has it open. The worker still had descriptor 3 open, so 48M stayed allocated to a file nobody can see. `du` walks names, so it stopped counting the moment the name went. `df` asks the filesystem how many blocks are in use, so it kept counting.

`lsof +L1` lists open files with a link count below one, which is the definition of deleted-but-open:

```text
$ lsof -w +L1 /srv
COMMAND    PID USER FD   TYPE DEVICE SIZE/OFF NLINK NODE NAME
sleep   608657 root 3w   REG   0,78 50331648     0    3 /srv/app/worker.log (deleted)
exit=0
$ ls -l /proc/$PID/fd | grep deleted
l-wx------ 1 root root 64 Oct  3 18:18 3 -> /srv/app/worker.log (deleted)
$ : > /proc/$PID/fd/3
$ df -h /srv
Filesystem      Size  Used Avail Use% Mounted on
tmpfs            64M   16M   48M  25% /srv
$ ps -o pid,stat,cmd -p $PID
    PID STAT CMD
 608657 S    sleep 600
```

`NLINK 0`, `(deleted)`, 50,331,648 bytes (48M exactly), held open for writing (`3w`) by PID 608657. `/proc/PID/fd/3` is a live handle on the deleted file, so `: > /proc/$PID/fd/3` truncates it in place. `df` dropped by 48M and the process kept running with its descriptor open, now pointing at an empty file. For a service, restarting it is the cleaner fix; truncation is for when you cannot, and it throws away whatever was in the file, so aim it at a runaway log and never at a database.

One thing I did not expect: `lsof` exited 0 here. On a second demo mount holding another deleted file, `lsof -w +L1 data`, run from the parent directory, and `lsof -w +L1 /srv/demo/data` printed the same row. The relative path exited 1, the absolute one 0. Same lsof 4.99.4, same file. Read its output, never its exit status.

## The next time: truncate, and know how the log was opened

The fix for next time is to empty a live log instead of deleting it: `: > /srv/app/worker.log` keeps the inode and every open descriptor, and the space comes back at once. There is a catch that depends on how the writer opened the file, so I ran two writers side by side, one opened with `>>` (`O_APPEND`) and one with `>`, each wrote 16M, I truncated both, and each wrote 1M more:

```text
$ : > /srv/app/append.log; : > /srv/app/plain.log
$ ls -lsh /srv/app
total 2.0M
1.0M -rw-rw-r-- 1 root root 1.0M Oct  3 18:18 append.log
1.0M -rw-rw-r-- 1 root root  17M Oct  3 18:18 plain.log
```

The append writer started again at the new end of the file: 1.0M on disk, 1.0M long. The other writer kept its own offset, 16M, and wrote its next megabyte there. `plain.log` now claims to be 17M long with only 1.0M allocated, a sparse file whose first 16M is a hole. It costs no disk, but `ls -l` reports 17M, anything that copies it naively gets 16M of zeros, and anyone sizing logs by `ls -l` will chase a problem that is not there. That is why `logrotate`'s `copytruncate` suits append-mode logs (its man page warns it can still lose the lines written between the copy and the truncate), and why for anything else the right move is to make the program reopen its log, usually with `SIGHUP` or a restart.

## The script that does the looking

On a real machine `lsof +L1` prints dozens of rows, and a deleted file shared by many processes appears once per process. The page's `deleted-open-files.sh` groups by inode, skips anything under 1M, sorts biggest first and totals it. On the same demo it printed `✗ 48M /srv/app/worker.log (deleted)`, `held by: sleep[620003] fd 3`, a total of 48M and the two ways to free it, and exited 1. After the truncate it printed `✓ no deleted-but-open files over 1.0M on /srv (as root)` and exited 0, which makes it usable as a check in a disk alert.

The 48M log was never gone. It had lost its name and kept its blocks, and `lsof +L1` was the one command that could see both.

---

lsof for deleted files, ports and busy mounts, with the grouping script: https://bashsnippets.xyz/snippets/lsof-command-examples

To hear about a filling disk before a write fails, the [disk space warning](https://bashsnippets.xyz/snippets/disk-space-warning) script alerts at a threshold you pick, and [Find Large Files on Linux](https://bashsnippets.xyz/snippets/find-large-files-linux) covers what is still on the disk with a name. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 3 #32 - date TBD (page live 2026-10-03; earliest publish 2026-10-10). Outputs: all run 2026-10-03 in the session scratchpad inside `unshare -rm` with a 64M tmpfs on /srv (lsof 4.99.4, bash 5.3.15, coreutils df/du, kernel 7.1.5): the rm/df/du/ENOSPC run, lsof +L1 and /proc truncate, the relative-vs-absolute lsof exit-status check, the O_APPEND vs plain truncation run, and the page's deleted-open-files.sh copied verbatim from the MDX (ShellCheck 0.11.0 clean). Distinct from #16: no tumblerd story or 44.6 GB numbers. -->
