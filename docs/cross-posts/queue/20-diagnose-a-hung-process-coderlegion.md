<!-- NOT SCHEDULED. Wave 2 #20 - planned Tue 2026-12-01 08:00 CST (14:00Z), same minute as dev.to #20. Excerpt of a real run on this box 2026-09-28 (mkfifo + cat, bash 5.3.9, unprivileged). No strace output used here; the strace placeholder lives in the dev.to/Medium versions only. -->

# My hung process had no file open. It was stuck inside open().

I built the smallest hang I know on my own machine: a named pipe in a scratch directory, and `cat` reading it in the background with nobody ever writing to it. No output, no error, no exit. The reflex is `kill -9` and a rerun. I read `/proc` first, because a killed process takes its reasons with it:

```text
$ mkfifo job.fifo; cat job.fifo > out.log 2>&1 & P=$!
$ cat /proc/$P/wchan; echo
wait_for_partner
$ ps -o stat,wchan:32,cmd -p $P
STAT WCHAN                            CMD
S    wait_for_partner                 cat job.fifo
$ cut -d' ' -f1 /proc/$P/syscall
257
```

`S` means interruptible sleep, so signals still work. `wait_for_partner` is the kernel waiting for a FIFO writer, and syscall 257 is `openat` on x86_64. The fd table held only 0, 1 and 2: `cat` had not opened the pipe yet, it was still inside the open. When I opened the other end from a subshell, the wait moved to `anon_pipe_read` and syscall 0, `read`. Two different bugs, one symptom.

Then I repeated the hang and sent `kill -9`. Exit 137, `/proc/$P` gone, every one of those answers with it. None of the reads above needed root.

The process-state table, the `D`-state case where `kill -9` does nothing, and a capture script to run before any kill are in [the full hung-process diagnosis guide](https://bashsnippets.xyz/guides/diagnose-a-hung-process).
