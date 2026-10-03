<!-- NOT SCHEDULED. Wave 3 #29 - date TBD, same minute as dev.to #29 (tool page live 2026-09-28; earliest publish 2026-10-10). Canonical /tools/open-ports-explainer. The ss listing is quoted from /guides/open-ports-linux (published 2026-09-01); the card was produced 2026-10-03 by running that listing through the explainer's own parser in a scratch dir. -->

# An empty Process column hid a container on every interface

My dev server came up on 3001 for months because something had 3000. As a normal user, `ss -ltnp 'sport = :3000'` showed two rows, `0.0.0.0:3000` and `[::]:3000`, with nothing under `Process`. I had seen output like that before and moved on.

Run back through the explainer's own parser tonight, the same listing becomes one card:

```text
0.0.0.0:3000  +  [::]:3000
  All interfaces, IPv4 and IPv6 · owner not shown
  dev server / Grafana. Node, Next.js or Rails dev server by default; Grafana and Open WebUI also use 3000.
  WARN A development server reachable from your network. Dev servers are not built to face other machines.
  INFO No owner shown. Run ss -ltnpe to see the systemd unit, which also tells you whether this is a container.
  NOTE Two sockets, one per address family. Either can close without the other.
  next: ss -ltnp 'sport = :3000'
```

The empty column meant "not your socket", not "no process". `ss -ltnpe` printed `cgroup:/system.slice/docker.service`, and `docker ps` named a `docker-proxy` publishing an Open WebUI container. Docker documents that published ports pass through its own iptables chains before `ufw` sees them, so publishing on `127.0.0.1` is the fix, not a firewall rule.

The explainer reads `ss`, `netstat` or `lsof` output, detects which, and redacts LAN and public addresses by default. Each listener gets its reach in words, its owner, flags ranked by severity and the next command to run. Paste yours into the [Open Ports Explainer](https://bashsnippets.xyz/tools/open-ports-explainer).
