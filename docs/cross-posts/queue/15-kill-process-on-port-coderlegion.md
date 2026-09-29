<!-- NOT SCHEDULED. Wave 2 #15 - planned Thu 2026-11-05 08:00 CST (14:00Z), same minute as dev.to #15. Promoted from reserve/13 on 2026-09-28; the parent/child port run was re-verified on this box that day. -->

# I killed the process I started. The port stayed taken.

`EADDRINUSE` right after you stopped the server usually has one cause: the process you launched is not the process holding the socket. I reproduced it on my own machine with the wrapper shape `npm run dev` uses, a shell that starts the real server as a child and waits: `bash -c 'python3 -m http.server 8098 & wait'`. `lsof -ti :8098` returned the child's PID, not the parent's. I killed the parent. The child was reparented, kept listening, and `lsof` returned the same PID as if nothing had happened.

The fix is to ask the socket table instead of the process table, and to look before you shoot:

```bash
PID=$(lsof -ti :8098 | head -n 1)
ps -p "$PID" -o comm=
kill "$PID"
sleep 5
kill -0 "$PID" 2>/dev/null && kill -9 "$PID"
```

The `ps -p` line exists because "which PID" is not "safe to kill". On a shared box, the thing on 5432 might be a database mid-migration. Plain `kill` sends SIGTERM, which lets the process flush and close its socket; on my run it was enough, and SIGKILL never fired. If the bind still fails with no PID left, that is TIME_WAIT, and the answer is a minute of patience.

Port validation, the `ss` fallback for boxes without lsof, and the escalation loop are in the [script that frees a port by killing whatever holds it](https://bashsnippets.xyz/snippets/kill-process-on-port).
