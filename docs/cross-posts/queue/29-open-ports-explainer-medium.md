# ss Showed 0.0.0.0:3000 and No Process Name. It Was a Docker Container on Every Interface.

The dev server for my site came up on port 3001 for months. Next.js wants 3000, finds it taken, moves up one, and says nothing worth reading. When I finally asked who had 3000, `ss -ltnp 'sport = :3000'` answered as a normal user with two rows, `0.0.0.0:3000` and `[::]:3000`, both `LISTEN`, and nothing at all under `Process`. That is the opening run of the open-ports guide on the site, published 2026-09-01.

Every IPv4 interface, every IPv6 interface, no name. One more flag, `ss -ltnpe`, printed the socket's cgroup, `cgroup:/system.slice/docker.service`, and one `docker ps` later the owner had a name: a `docker-proxy` publishing an Open WebUI container's port 8080 as host port 3000. It had been there since spring.

The container is not the part that bothers me. I had read output like that before, seen no name, and moved on. Both answers were on screen. The address column said who could reach it, and the empty column said I was not allowed to see the owner. I read neither.

## ss prints facts, not verdicts

The `Local Address` column is the reach. `127.0.0.1` and `[::1]` are this machine only. `0.0.0.0` is every IPv4 address the host has, LAN, VPN and Docker bridge included, and `[::]` is the IPv6 twin. An empty `Process` column without root does not mean "no process". It means the socket belongs to another user, and `ss` only names your own. The `-e` flag prints the owning cgroup instead, which is the systemd unit, and it needs no root.

A published container port has one more twist, and this part is documented Docker behaviour rather than something I tested here: Docker routes published ports through its own iptables chains before the host's `ufw` rules see the packet, so a `ufw deny 3000` does not cover them. Docker's documentation covers it under Docker and ufw. The guide's fix was to publish on loopback, `-p 127.0.0.1:3000:8080`.

None of that is hard once you know it. Holding all of it in your head while reading a long `ss` listing is where it goes wrong, so I built a page that does the reading.

## What the explainer does with a paste

The [Open Ports Explainer](https://bashsnippets.xyz/tools/open-ports-explainer) takes the output of `ss -tulpn`, `ss -ltnpe`, `netstat -tulpn` or `lsof -i -P -n` and works out which one it is on its own. It parses in the browser, never connects to a port, and has **Redact addresses** ticked by default, so LAN and public addresses are masked on screen and in the share link. A **Load example** button fills it with a real `ss -tulpn` listing if you want to see it work first.

Every listener becomes a card: the address, the reach scope in words, the owner (from the `Process` column, or the systemd unit when you ran `ss -e` without root), what usually lives on that port, flags ranked by severity, and the next command to run. A share link carries only the normalised rows in the URL hash, with PIDs dropped, and **Copy baseline CSV** writes the listing in the shape the ports-audit script diffs against.

Tonight I ran the guide's two lines back through the explainer's own parser, the same TypeScript the page runs, with a short Node wrapper that prints each card as text:

```text
0.0.0.0:3000  +  [::]:3000
  All interfaces, IPv4 and IPv6 · owner not shown
  dev server / Grafana. Node, Next.js or Rails dev server by default; Grafana and Open WebUI also use 3000.
  WARN A development server reachable from your network. Dev servers are not built to face other machines.
  INFO No owner shown. Run ss -ltnpe to see the systemd unit, which also tells you whether this is a container.
  NOTE Two sockets, one per address family. Either can close without the other.
  next: ss -ltnp 'sport = :3000'
```

That INFO line is the step I skipped for months. Given the `-e` line instead, the owner column became `docker.service`, a second WARN appeared ("A published container port. Docker's own iptables rules route this traffic to the container before ufw's rules see it"), and the next command changed to `docker ps --format '{{.Names}}\t{{.Ports}}'`.

## A fresh run, nothing real listening

To check the ranking I made three listeners inside a private network namespace (`unshare -rn`, no sudo, gone when the shell exits): Python's `http.server` on `0.0.0.0:3000`, a bare socket on `0.0.0.0:5432` standing in for a database, and one on `127.0.0.1:8099`. As root inside the namespace, `ss -tulpn` named every owner, `users:(("python3",pid=612056,fd=3))` and so on, and printed the rows in the order 8099, 3000, 5432.

The explainer's summary line read `3 listeners (3 sockets) · 2 reachable from the network · 2 flagged`, and the first card was `0.0.0.0:5432`, "All IPv4 interfaces · python3", named PostgreSQL, with one CRITICAL flag: "A database or cache is listening on every interface. Anyone on your network can try to log in to it." Its next command was `ss -ltnpe 'sport = :5432'`.

`ss` printed the database row last. The explainer put it first, because a database on a wildcard address outranks a dev server, and the loopback socket got a green OK. It names a port by its usual tenant, so a Python socket on 5432 reads as PostgreSQL. That is the right guess for a scan, and the reason every card ends with a command that checks the owner.

What it cannot see is your firewall, NAT or cloud security groups, and the page says so under the input box. It tells you who *could* reach a socket from where it is bound; whether a packet gets there is a question for `nc` from another machine.

The months of 3001 would have been one paste. The card said "owner not shown" and handed me the command that names the owner.

---

Paste your own `ss -tulpn` into the Open Ports Explainer: https://bashsnippets.xyz/tools/open-ports-explainer

For the commands behind each verdict, including the `-e` owner trick and what `docker-proxy` hides, the [open ports guide](https://bashsnippets.xyz/guides/open-ports-linux) pairs with it, and the [ports-audit script](https://bashsnippets.xyz/snippets/ports-audit) turns the baseline CSV into a nightly alert. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/tools/open-ports-explainer

<!-- Medium tags to set in the UI: Linux, Cybersecurity, Docker, Bash, DevOps -->
