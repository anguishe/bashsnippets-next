---
title: "My Hung Process Had No File Open. It Was Stuck Inside open()."
published: true
description: "A job that never finishes is evidence, and kill -9 erases it. A real FIFO hang read through wchan, /proc/PID/syscall and the fd table before the kill, with no root needed."
tags: bash, linux, sysadmin, devops
canonical_url: https://bashsnippets.xyz/guides/diagnose-a-hung-process
cover_image: https://bashsnippets.xyz/ogimage.png
---

I wanted to watch a hang from the inside before writing about one, so I built the smallest one I know. On my own machine, bash 5.3.9 on a 7.1 kernel, I made a named pipe in a scratch directory and pointed `cat` at it in the background. Nobody was ever going to write to that pipe. The job did what hung jobs do: no output, no error, no exit, nothing in the log.

The reflex is `kill -9` and a rerun. I made myself read `/proc` first, because a killed process takes its reasons with it. This is what four unprivileged commands said, with the permission columns and my scratch path trimmed:

```text
$ mkfifo job.fifo; cat job.fifo > out.log 2>&1 & P=$!
$ cat /proc/$P/wchan; echo
wait_for_partner
$ ps -o stat,wchan:32,cmd -p $P
STAT WCHAN                            CMD
S    wait_for_partner                 cat job.fifo
$ cut -d' ' -f1 /proc/$P/syscall
257
$ ls -l /proc/$P/fd
0 -> /dev/null
1 -> ~/scratch/hang/out.log
2 -> ~/scratch/hang/out.log
```

The fd table was the surprise. I expected an fd pointing at `job.fifo`, and there was nothing there. `cat` had not opened the pipe. It was still inside the call that opens it, and I would have spent a while staring at `lsof` output for a file that was never going to show up.

## What each answer ruled out

`S` is interruptible sleep: the process is waiting, and it will still respond to signals. That rules out the nasty case, `D`, where a process is parked in uninterruptible I/O and `kill -9` returns 0 while the process stays exactly where it is.

`wchan` names the kernel function the process is sleeping in, and `wait_for_partner` is honest about it: opening a named pipe for reading blocks until something opens it for writing. The syscall file agreed. Its first field is the syscall number, and the header on the box turns that into a name: `grep -w 257 /usr/include/x86_64-linux-gnu/asm/unistd_64.h` printed `#define __NR_openat 257`.

Put together: sleeping, interruptible, blocked in `openat` on a FIFO, no fd yet because the open never returned. That is a complete diagnosis of "the producer never showed up", and it came from files my own user can read. Nothing needed root. `/proc/$P/stack`, the one file that would have given the full kernel stack, answered `Permission denied`, as it does for any unprivileged user.

## Watching the wait move

To check I was reading the evidence rather than pattern-matching, I opened the pipe for writing from a subshell (`exec 7>job.fifo`) and read the same files again:

```text
$ cat /proc/$P/wchan; echo
anon_pipe_read
$ cut -d' ' -f1 /proc/$P/syscall
0
$ ls -l /proc/$P/fd/3
fd/3 -> ~/scratch/hang/job.fifo
```

The open completed, fd 3 appeared on the FIFO, and the wait moved: syscall 0 is `read`, and `anon_pipe_read` is the kernel waiting for bytes. Same process, same `S` state, a different question. Before, nobody had opened the other end. Now the other end was open and had sent nothing. When the writer subshell exited and closed its end, `cat` saw end-of-file and exited 0 on its own.

That distinction is the whole value of looking. On a real job the first shape points at a producer that never started; the second at a producer that started and stalled. Different bugs, often in different programs, and from the outside both are a job that does not finish.

## What kill -9 leaves you

I ran the same hang once more and sent `kill -9`. Bash printed `Killed`, `wait` returned 137, and `ls /proc/$P` said `No such file or directory`. That is the entire record: a number that means SIGKILL and nothing about why. No wchan, no syscall, no fd table. On a job holding a lock or halfway through an output file, SIGKILL also skips every trap, so the temp files and the lock stay behind for the next run to trip on. Plain `kill`, which sends SIGTERM, at least lets a cleanup trap run.

## What strace adds

The guide's next step is `strace -p`, which on a hang usually prints one line and stops, and that line is the stuck call. The first time I reached for it, strace was not installed. After `sudo apt install strace` (strace 7.0), I rebuilt the same hang and attached for five seconds, before and after opening the writer end:

```text
$ timeout 5 strace -p $P
strace: Process 3204016 attached
openat(AT_FDCWD, "job.fifo", O_RDONLYstrace: Process 3204016 detached
 <detached ...>
$ ( exec 7>job.fifo; sleep 8 ) &
$ timeout 5 strace -p $P
strace: Process 3204016 attached
read(3strace: Process 3204016 detached
 <detached ...>
```

One unfinished line each time, cut off where the call is still waiting: `openat` on `job.fifo` with no return value, then `read(3` on the fd the open finally produced. It is the same answer `/proc` gave, in words instead of numbers. `timeout` exited 124 both times, which is its own way of saying strace was still waiting when time ran out. No root needed: `/proc/sys/kernel/yama/ptrace_scope` reads `0` here, which allows attaching to my own processes. At `1`, the Ubuntu default, the same command fails with `Operation not permitted` on anything that is not your direct child.

The `/proc` files had already given the answer, which is the order I would keep: strace confirms, it does not go first. Reading four files cost less than a second. The kill would have turned "blocked in openat on a FIFO nobody opened" into "exit 137", and I would have rerun the job and waited for it to hang again.

---

Full guide with the process-state table, the `D`-state trap, the socket-queue diagnosis for network hangs and a `hung-report.sh` that captures all of it before the kill: https://bashsnippets.xyz/guides/diagnose-a-hung-process

Once you know why it hung, [the timeout command](https://bashsnippets.xyz/snippets/bash-timeout-command) bounds the next run so it dies on a deadline instead of waiting for you, and [flock single-instance locking](https://bashsnippets.xyz/snippets/bash-flock-single-instance) stops a stuck run from being joined by the next scheduled one. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 2 #20 - planned Tue 2026-12-01 08:00 CST (14:00Z). Opener is a real run on this box 2026-09-28 (mkfifo + cat, bash 5.3.9, kernel 7.1, unprivileged; ptrace_scope=0). strace section re-run 2026-09-29 with strace 7.0 (same mkfifo repro, unprivileged). -->
