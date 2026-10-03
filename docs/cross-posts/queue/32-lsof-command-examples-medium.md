# I Deleted a 48M Log to Free Space. The Next Write Still Hit 'No space left on device'.


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

`lsof +L1` lists open files with a link count below one, which is the definition of deleted-but-open. `lsof -w +L1 /srv` printed one row: `sleep`, PID 608657, FD `3w`, type `REG`, SIZE/OFF 50331648, NLINK 0, NAME `/srv/app/worker.log (deleted)`, and exited 0. `ls -l /proc/$PID/fd | grep deleted` showed the same file behind descriptor 3. After `: > /proc/$PID/fd/3`, `df -h /srv` read 16M used, 48M available, 25%, and `ps -o pid,stat,cmd -p $PID` still showed `sleep 600` running.

`NLINK 0`, `(deleted)`, 50,331,648 bytes (48M exactly), held open for writing (`3w`) by PID 608657. `/proc/PID/fd/3` is a live handle on the deleted file, so `: > /proc/$PID/fd/3` truncates it in place. `df` dropped by 48M and the process kept running with its descriptor open, now pointing at an empty file. For a service, restarting it is the cleaner fix; truncation is for when you cannot, and it throws away whatever was in the file, so aim it at a runaway log and never at a database.

One thing I did not expect: `lsof` exited 0 here. On a second demo mount holding another deleted file, `lsof -w +L1 data`, run from the parent directory, and `lsof -w +L1 /srv/demo/data` printed the same row. The relative path exited 1, the absolute one 0. Same lsof 4.99.4, same file. Read its output, never its exit status.

## The next time: truncate, and know how the log was opened

The fix for next time is to empty a live log instead of deleting it: `: > /srv/app/worker.log` keeps the inode and every open descriptor, and the space comes back at once. There is a catch that depends on how the writer opened the file, so I ran two writers side by side, one opened with `>>` (`O_APPEND`) and one with `>`, each wrote 16M, I truncated both with `: >`, and each wrote 1M more. `ls -lsh /srv/app` then showed `append.log` with 1.0M allocated and a length of 1.0M, and `plain.log` with 1.0M allocated and a length of 17M.

The append writer started again at the new end of the file: 1.0M on disk, 1.0M long. The other writer kept its own offset, 16M, and wrote its next megabyte there. `plain.log` now claims to be 17M long with only 1.0M allocated, a sparse file whose first 16M is a hole. It costs no disk, but `ls -l` reports 17M, anything that copies it naively gets 16M of zeros, and anyone sizing logs by `ls -l` will chase a problem that is not there. That is why `logrotate`'s `copytruncate` suits append-mode logs (its man page warns it can still lose the lines written between the copy and the truncate), and why for anything else the right move is to make the program reopen its log, usually with `SIGHUP` or a restart.

## The script that does the looking

On a real machine `lsof +L1` prints dozens of rows, and a deleted file shared by many processes appears once per process. The page's `deleted-open-files.sh` groups by inode, skips anything under 1M, sorts biggest first and totals it. On the same demo it printed `✗ 48M /srv/app/worker.log (deleted)`, `held by: sleep[620003] fd 3`, a total of 48M and the two ways to free it, and exited 1. After the truncate it printed `✓ no deleted-but-open files over 1.0M on /srv (as root)` and exited 0, which makes it usable as a check in a disk alert.

The 48M log was never gone. It had lost its name and kept its blocks, and `lsof +L1` was the one command that could see both.

---

lsof for deleted files, ports and busy mounts, with the grouping script: https://bashsnippets.xyz/snippets/lsof-command-examples

To hear about a filling disk before a write fails, the [disk space warning](https://bashsnippets.xyz/snippets/disk-space-warning) script alerts at a threshold you pick, and [Find Large Files on Linux](https://bashsnippets.xyz/snippets/find-large-files-linux) covers what is still on the disk with a name. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/lsof-command-examples

<!-- Medium tags to set in the UI: Linux, Bash, DevOps, Sysadmin, Command Line -->
