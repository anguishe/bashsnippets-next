<!-- POSTED on CoderLegion 2026-09-16 as https://coderlegion.com/27426 -->

# Who owns that port? One ss flag answers it without sudo

For months my dev server started on 3001 because something already held 3000, and I kept stepping around it. When I finally asked, `ss -ltn 'sport = :3000'` showed the port listening on every interface — with an empty Process column, because `ss -p` only names sockets owned by your own user. Without root, it looked like nobody owned it.

One flag closes most of that gap:

```bash
ss -ltnpe 'sport = :3000'
```

`-e` prints the socket's cgroup, and on a systemd machine the end of that path is the unit that opened it. Mine ended in `docker.service`. `docker ps` then named it: a `docker-proxy` publishing a container I had started in the spring and forgotten, reachable from the whole network.

Two things worth carrying away. The host only ever sees Docker's proxy, never the application behind it, so a host-side port list tells you what is exposed, not what is running. And "list open ports" is really three questions: what is listening, who owns it, and whether it is reachable. They need three different commands.

The full write-up covers all three — with and without root, without netstat, inside containers, and an audit script that diffs the listener list between runs: [how to list open ports on Linux with the owning process](https://bashsnippets.xyz/guides/open-ports-linux).
