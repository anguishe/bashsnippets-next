<!-- REVIEW: incident dramatized — verify before publishing -->
---
title: "The Process I Killed at 11pm Wasn't the One Holding the Port"
published: true
description: "EADDRINUSE means something is squatting on your port. Finding the real PID with lsof or ss, confirming it, and escalating SIGTERM to SIGKILL cleanly."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/kill-process-on-port
cover_image: https://bashsnippets.xyz/ogimage.png
---

Sometime past 11 on a Tuesday night I wanted one last look at a client site on my home server before pushing it to Vercel. `npm run dev`, three seconds of build spinner, then: `Error: listen EADDRINUSE: address already in use :::3000`. Which made no sense, because I had killed that dev server an hour earlier. I remembered doing it. I had watched the process disappear from `ps`.

Except the thing I watched disappear was never the thing holding the port. `npm run dev` doesn't bind anything — it's a wrapper that spawns `node` as a child, and the child owns the socket. I had found the `npm` process in the process list, killed it, and called the job done. The orphaned `node` child got reparented and kept listening on 3000 for the next hour, serving nobody, while I worked on other things feeling tidy.

It got worse before it got better. `ps aux | grep node` on that box returns a small crowd — VS Code helper processes, a language server, the grep itself — and I killed two more PIDs that had nothing to do with the port before I stopped guessing. Call it ten minutes of feeling foolish, at an hour when ten minutes costs double.

## Ask the socket, not the process table

The mistake has a name: I was interrogating the process table when the question belonged to the socket table. Process names are ambiguous — five things called `node`, none of them labeled with the port they hold. The socket table has exactly one answer per port, because a bound port belongs to exactly one process. That isn't convention; it's how TCP works. Nothing else can bind until the owner lets go, which is also why no amount of killing lookalike processes will free it.

`lsof -ti :3000` asks the right question directly. The `-i` filters by internet address, and `-t` strips the output to a bare PID — no headers, no columns — because it exists to be piped into something. The first thing to pipe it into is not `kill`. Here's the core, wired together:

```bash
PID=$(lsof -ti :3000 | head -n 1)
ps -p "$PID" -o comm=              # look at what it is before you kill it
kill "$PID"                        # SIGTERM — a request, not an execution
sleep 5
kill -0 "$PID" 2>/dev/null && kill -9 "$PID"   # still alive? force it
```

The `ps -p` line exists because discovery answers "which PID," not "safe to kill." On a laptop it's probably your own crashed dev server. On a shared box, the thing on 5432 might be the Postgres your coworker is mid-migration on. Two seconds of reading the name has saved me from at least one very awkward conversation.

The signal choice is the part people get wrong on reflex. Plain `kill` sends SIGTERM, which the process is allowed to catch and handle — flush write buffers, finish in-flight requests, remove its pidfile, close the socket properly. `kill -9` sends SIGKILL, which never reaches the process at all: the kernel deletes it from the scheduler without notice, mid-write if that's where it happened to be standing. Typing `-9` as a habit is how you end up with a corrupted SQLite file or a lock file that outlives its owner. Escalate only after SIGTERM has had its five seconds — and `kill -0` is how you check, because signal zero sends nothing. It runs the existence-and-permission check and reports through the exit code, a way of asking "are you still there?" without touching anything.

One portability note: minimal Debian containers and stripped-down $5 VPS images frequently ship without `lsof`. The same discovery works with `ss -ltnp` — listening, TCP, numeric, with process info — and `ss` comes with iproute2 on effectively every modern Linux, so it's the fallback worth memorizing.

## The ghost that survives the kill

There's a second trap stacked behind the first. Sometimes you kill the right process, `lsof` comes back empty, and the bind *still* fails. Nothing is squatting on the port anymore; the kernel is. TCP holds a closed socket in TIME_WAIT for up to sixty seconds after its last connection, to absorb straggler packets still in flight for the old conversation. There is no PID to kill because there is no process. Wait a minute and it clears, or set `SO_REUSEADDR` in the application and the bind succeeds immediately. Knowing that fact is the difference between waiting sixty seconds and rebooting the laptop, which is the nuclear option I have genuinely watched people reach for.

## Back to Tuesday

The hardened version of that five-line core now lives on my path as `kill-port.sh`: it validates the port argument, tries `lsof` and falls back to `ss`, prints the process name before acting, sends SIGTERM, polls with `kill -0` for a timeout, and only then escalates to SIGKILL. The night that produced it would have been one command and zero wrong PIDs — it would have named the hour-old orphan, asked it politely to leave, and confirmed the port was free in less time than my first useless grep took to type.

Full script with the port validation, the `ss` fallback, and the SIGTERM→SIGKILL escalation loop: https://bashsnippets.xyz/snippets/kill-process-on-port

When the thing that needs to die has a name instead of a port number, [Kill a Process](https://bashsnippets.xyz/snippets/kill-a-process) covers the pgrep/pkill side, and once the port is free, [Check If Website Is Up](https://bashsnippets.xyz/snippets/check-if-website-is-up) confirms whatever replaced it is actually answering. The rest of the library is at https://bashsnippets.xyz
