<!-- NOT SCHEDULED. Wave 3 #32 - date TBD, same minute as dev.to #32 (page live 2026-10-03; earliest publish 2026-10-10). Canonical /snippets/lsof-command-examples. Output run 2026-10-03 in a scratch dir inside `unshare -rm` on a 64M tmpfs (lsof 4.99.4, bash 5.3.15). Not the #16 tumblerd story. -->

# The log was deleted. Its 48M was still allocated.

A 64M scratch tmpfs, a worker process holding its log open on file descriptor 3, and the usual reflex when space runs low: `rm` the log. `du` on the directory dropped from 48M to 0. `df` stayed at 48M used. The next 32M write failed with `No space left on device`, and `df` read 100% while `du` found only the 16M that had been written.

`rm` removes a name. The kernel frees the blocks only when no names are left and no process has the file open, and the worker still had it open. `lsof +L1` lists exactly those files:

```text
$ lsof -w +L1 /srv
COMMAND    PID USER FD   TYPE DEVICE SIZE/OFF NLINK NODE NAME
sleep   608657 root 3w   REG   0,78 50331648     0    3 /srv/app/worker.log (deleted)
exit=0
```

`NLINK 0`, `(deleted)`, 48M held for writing by PID 608657. Truncating through the process's own descriptor, `: > /proc/608657/fd/3`, took `df` back to 25% while the process kept running.

Next time, empty a live log with `: > file` instead of deleting it. With an append-mode writer (`>>`) that is clean. A writer that opened with `>` keeps its old offset: in the same test, its log came back as a 17M sparse file with 1.0M on disk.

Finding which process holds a port or a busy mount, plus a script that groups deleted-but-open files and totals them, is on the [lsof command examples page](https://bashsnippets.xyz/snippets/lsof-command-examples).
