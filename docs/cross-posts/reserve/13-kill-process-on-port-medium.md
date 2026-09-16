# I Killed the Parent Process. Its Child Kept the Port.

`EADDRINUSE` after you are sure you stopped the server has a common cause, and I wanted to watch it happen rather than describe it. On my own machine I started a wrapper the way tools like `npm run dev` do — a shell that launches the real server as a child and waits on it: `bash -c 'python3 -m http.server 8098 & wait'`.

Two processes appeared: the parent `bash` and the child `python3`. `lsof -ti :8098` returned one PID, and it was the child's. I killed the parent, the process I had started and the one most people would find first in `ps`.

The port stayed taken. `lsof -ti :8098` still returned the same PID, now an orphan that had been reparented and was listening as if nothing had happened. Killing the thing you launched does not free a port when the thing you launched is not the thing holding it.

## Ask the socket table, not the process table

The mistake is asking the process table a question that belongs to the socket table. Process names are ambiguous: on a developer machine, `ps aux | grep node` returns a crowd of editor helpers, language servers and the `grep` itself, none of them labelled with a port. The socket table has exactly one answer per listening port, because a bound port belongs to one process until it lets go.

`lsof -ti :PORT` asks that directly. `-i` filters by internet address and `-t` prints only the PID, because it exists to be piped into something. The first thing to pipe it into is not `kill`:

```bash
PID=$(lsof -ti :8098 | head -n 1)
ps -p "$PID" -o comm=                        # look at what it is before you kill it
kill "$PID"                                  # SIGTERM — a request, not an execution
sleep 5
kill -0 "$PID" 2>/dev/null && kill -9 "$PID" # still alive? force it
```

On my run, `ps -p` named the orphan `python3`, and the plain `kill` was enough: one second later `kill -0` found nothing, the port was free, and SIGKILL was never needed.

The `ps -p` line is there because discovery answers "which PID", not "safe to kill". On a laptop it is usually your own crashed dev server. On a shared box, the process on 5432 might be a database someone is migrating. Two seconds of reading the name is cheap.

## Why SIGTERM comes first

Plain `kill` sends SIGTERM, which the process may catch: flush its buffers, finish in-flight requests, remove its pidfile, close the socket properly. `kill -9` sends SIGKILL, which the process never sees; the kernel removes it mid-write if that is where it happened to be. SIGTERM, a pause, and SIGKILL only if something is still alive is the order that loses nothing in the common case and still works in the stubborn one.

When `lsof` is not installed — minimal containers and small VPS images often lack it — `ss -ltnp` gives the same answer from iproute2, which modern distributions ship everywhere. Without root it names only your own processes; its `-e` flag still shows the owning systemd unit for anyone's socket, which is how I once found a forgotten `docker-proxy` squatting on port 3000 of my own laptop.

## When the port is still busy after the kill

Sometimes you kill the right process, `lsof` comes back empty, and the bind still fails. Nothing is holding the port; the kernel is. A closed TCP connection lingers in TIME_WAIT for up to a minute to absorb packets still in flight for the old conversation — on my machine at that moment, `ss -Htan state time-wait | wc -l` counted two. There is no PID to kill. Servers that set `SO_REUSEADDR` on their listening socket can rebind straight away; for those that do not, the fix is to wait a minute, not to reach for a bigger hammer.

The whole failure comes down to asking the right table. The parent is what you remember starting; the socket knows who is actually there.

---

Full script with the port validation, the `ss` fallback, and the SIGTERM→SIGKILL escalation loop: https://bashsnippets.xyz/snippets/kill-process-on-port

When the thing that needs to die has a name instead of a port number, [Kill a Process](https://bashsnippets.xyz/snippets/kill-a-process) covers the pgrep/pkill side, and once the port is free, [Check If Website Is Up](https://bashsnippets.xyz/snippets/check-if-website-is-up) confirms whatever replaced it is actually answering. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/kill-process-on-port

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Programming, Software Engineering -->
