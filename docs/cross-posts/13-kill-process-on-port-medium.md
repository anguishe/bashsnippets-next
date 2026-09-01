# The Port Was Busy, the Process Was Dead, and Neither of Those Was True

`Error: listen EADDRINUSE: address already in use :::3000` is a strange thing to read about a dev server you killed an hour ago. I read it a little past 11 on a Tuesday, on my home server, trying to preview a client site before pushing it to Vercel — and my first instinct was to distrust the error, because I distinctly remembered killing that process. I had watched it drop out of `ps`.

The error was right and my memory was wrong, in a specific way worth understanding. What I had killed was `npm`. What was listening on port 3000 was `node`. `npm run dev` never binds a port itself; it spawns a child that does, and when I killed the parent, the child was orphaned, reparented, and left listening — for an hour, to no one. So I did what tired people do: `ps aux | grep node`, which on my machine turns up VS Code helpers, a language server, and the grep itself. Two more wrong PIDs died before I admitted I was guessing.

## Stop grepping ps. Interrogate the port.

A port has a property the process table doesn't: exactly one owner. TCP allows one process to hold a bound port, full stop, which means the question "who has 3000?" always has a single, unambiguous answer — you're only stuck if you ask it somewhere ambiguous. The socket table is where the real answer lives, and `lsof` reads it directly.

`lsof -ti :3000` returns nothing but the owner's PID: `-i` filters by internet address, `-t` drops headers and columns so the output pipes cleanly. On boxes without `lsof` — minimal containers and stripped VPS images ship without it constantly — `ss -ltnp` from iproute2 gives the same discovery, and `ss` is present on essentially any modern Linux.

But discovery tells you *which* PID, not whether killing it is a good idea. On your laptop the squatter is probably your own crashed server; on a shared machine it might be somebody's database. So the sequence I actually run looks like this:

```bash
PID=$(lsof -ti :3000 | head -n 1)
ps -p "$PID" -o comm=              # look at what it is before you kill it
kill "$PID"                        # SIGTERM — a request, not an execution
sleep 5
kill -0 "$PID" 2>/dev/null && kill -9 "$PID"   # still alive? force it
```

The signal order matters more than most people give it credit for. SIGTERM — what plain `kill` sends — is deliverable: the process can catch it, flush its buffers, finish requests in flight, remove lock files, and close the socket the polite way. SIGKILL never arrives at the process at all. The kernel erases it from the scheduler wherever it stands, including halfway through a write, which is how a reflexive `kill -9` habit produces corrupted state that surfaces days later. The `-9` belongs at the *end* of the sequence, after a grace period, and `kill -0` is the polling mechanism: signal zero transmits nothing, but the call still performs its existence check and answers through the exit code.

## When there is no process at all

The stack has one more layer, and it's the one that breaks people's mental model completely: kill the right process, watch `lsof` return empty, and the bind can *still* fail. At that point nothing owns the port — the kernel is holding the closed socket in TIME_WAIT, for up to sixty seconds, so that packets still in flight from the old connection have somewhere to die quietly. There is no PID because there is no process. You wait, or your application sets `SO_REUSEADDR` and binds through it. I have watched a developer reboot a laptop over this. Sixty seconds of patience was the entire fix.

## What Tuesday turned into

That night ended as these nights should: as a script. The version I keep on my path validates the port argument, tries `lsof` and falls back to `ss`, prints the process name before touching anything, sends SIGTERM, polls for five seconds, and escalates to SIGKILL only if the polite request was ignored. Every wrong guess I made at 11pm is a step it refuses to let me repeat — it would have named the orphan on the first try.

The full hardened script, with the validation, the fallback, and the escalation loop, is here: https://bashsnippets.xyz/snippets/kill-process-on-port

Related, if the target has a name rather than a port: [Kill a Process](https://bashsnippets.xyz/snippets/kill-a-process). And once the port is yours again, [Check If Website Is Up](https://bashsnippets.xyz/snippets/check-if-website-is-up) verifies the replacement is answering. The rest of the library lives at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/kill-process-on-port

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Programming, Software Engineering -->
