---
title: "For Months My Dev Server Came Up on 3001. Tonight I Found Out Who Had 3000."
published: true
description: "A listener nobody remembered starting held port 3000 on my own machine since spring. One ss flag named the owner without root — and showed why 'list open ports' is three different questions with three different commands."
tags: bash, linux, security, sysadmin
canonical_url: https://bashsnippets.xyz/guides/open-ports-linux
cover_image: https://bashsnippets.xyz/ogimage.png
---

Every time I started the dev server for this site, the terminal said `Port 3000 is in use, trying 3001 instead`, and every time I read it and moved on. Next.js does not complain; it steps up one port and carries on, and so did I, for the better part of a season. There is a particular flavour of embarrassment in being the person who writes about port audits while a mystery listener sits on your own laptop that you have been silently working around since spring.

Tonight I asked. `ss -ltn 'sport = :3000'` came back with two rows — `0.0.0.0:3000` and `[::]:3000`, every interface, both address families — and a `Process` column that was blank. Not because nothing was there. Because I was not root, and `ss -p` only names sockets owned by your own user. Something on my machine was accepting connections from the whole network on 3000, and the tool I reached for shrugged.

## The flag that answers without sudo

The snippet answer is `sudo ss -ltnp`. It works. But I wanted to know what *thing* this was more than I wanted a PID, and there is a flag that answers that for anyone:

```bash
ss -ltnpe 'sport = :3000'
# LISTEN 0 4096 0.0.0.0:3000 0.0.0.0:* ino:20816 sk:2002 cgroup:/system.slice/docker.service <->
```

`-e` prints the socket's owning cgroup, and on a systemd box the cgroup path ends in the unit that created it. Port 3000 belonged to `docker.service`. One `docker ps` later: a `docker-proxy` publishing an Open WebUI container's internal 8080 as host port 3000, started in the spring to try something, never stopped, exposed on every interface the machine has. No root needed to learn that. The kernel knows the cgroup of every socket, and `ss` will tell whoever asks.

## Why the question is three questions

What I took from the evening is that "list open ports" is not one question, and most of the wrong answers online come from answering a different one than the person asked.

*What* is listening, and on which address, is `ss -ltun` and needs no privilege. The address column matters more than the port: `127.0.0.1:9050` is reachable from that machine and nowhere else whatever the firewall says, `0.0.0.0` is the whole network, and `127.0.0.53%lo` is systemd-resolved pinned to loopback. If you have been piping `ss` through `grep`, the built-in filter syntax — `ss -Hltn 'sport = :3000'`, with `-H` dropping the header so the output goes straight into `awk` — is the thing to switch to.

*Who* owns it is the question that needs root for other users' PIDs, and the one where `-e` gets you most of the way for free. `lsof -nP -iTCP -sTCP:LISTEN` reads the same facts from the process side and resolves the user name, which `ss` does not; `fuser 3000/tcp` is the terse one, and it exits 1 in silence when you run it unprivileged against someone else's socket, which looks exactly like "nothing there."

*Whether* it is reachable is a different question again. A port can be listening and unreachable — bound to loopback, or behind a firewall rule — and reachable with nothing of yours listening, when something upstream forwards it. `nc -zv host 3000` asks the socket directly; `Connection refused` means the packet arrived and the kernel said no, while a timeout means a firewall ate it. On a box with no `nc`, bash opens TCP sockets on its own through `/dev/tcp`, and the `timeout 2` in front of that is not optional, because a filtered port will hang the connect for two minutes.

## What docker-proxy hides

My listener was the general case, not a curiosity. When a container publishes a port, Docker starts a small userspace proxy that binds the host port and forwards into the container's network namespace. From the host, `ss` sees the proxy. It never sees the application. So the host-side list answers "which host ports are exposed" and cannot answer "what is behind them" — that is `docker ps` and its `PORTS` column.

It cuts the other way too. A container port that is *not* published does not appear in the host's `ss` output at all; it lives in a different namespace. A host-level audit that ignores this will report a database as not listening while it serves an entire compose stack over an internal bridge. To see those, you enter the namespace with `nsenter`, or run `ss` inside the container if the image has it.

And when there is no `ss`, no `netstat`, nothing at all — a scratch container — the kernel still publishes the socket table as text in `/proc/net/tcp`, hex addresses and all. `0BB8` is 3000. `0A` is `LISTEN`. One line of `awk` reads it, and the `uid` column is right there without root; the PID is the one thing that file cannot give you.

## The diff is the point

Knowing the list tonight is worth less than knowing when it changes. The guide ends in a script that writes one CSV line per listening socket — protocol, address, port, service name, owner — using `-e` so it degrades gracefully without root, and with `--diff` compares against the previous run and exits 3 with a report naming what appeared and what vanished. While testing it I opened a Python `http.server` on 8099 between runs; the third run named it. Had that been in root's crontab in April, the docker-proxy on 3000 would have been a one-line email the night it appeared, not a season of a dev server politely stepping aside.

The full guide — every command run on this box with the output pasted as it came out, the `netstat`-to-`ss` translation table, the `/proc/net/tcp` decoder, and the audit script: https://bashsnippets.xyz/guides/open-ports-linux

Once you have the PID, [Kill a Process on a Port](https://bashsnippets.xyz/snippets/kill-process-on-port) covers the SIGTERM-then-SIGKILL escalation without reaching for `-9` first, the one-script version this guide grew out of is [List All Open Ports on Linux](https://bashsnippets.xyz/snippets/list-open-ports-linux), and the rest of the library is at https://bashsnippets.xyz
