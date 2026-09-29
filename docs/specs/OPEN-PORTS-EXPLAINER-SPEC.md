# Open Ports Explainer: build spec

Status: **spec only, for approval.** Nothing is built. Written 2026-09-28 by Claude Code for Travis.
Source research: `docs/research/NEXT-TOOL-RESEARCH-2026-09-28.md` §5 (winner, 35/40).
Skills applied: `content-standards` (tool pipeline), `seo-aeo-geo` (metadata, schema, Quick Answer),
`frontend-design` (tokens, Signal/Noise direction).

Route: `/tools/open-ports-explainer`. Component: `src/components/tools/OpenPortsExplainer.tsx`.
Parser and port table: `src/components/tools/shared/portData.ts` (new). Reuses `useClipboard.ts`,
`bashHighlight.ts`. No backend, no network call, no analytics on the pasted text.

**Earliest ship:** after the snippet batch in `docs/APPROVAL-PACKAGE-2026-09-28.md` is live (the tool
links to `port-listening-but-connection-refused`), and at least two weeks after the ShellCheck-decoder
Show HN (research §5 distribution: not before ~10/13). Proposed build week: 10/19. Proposed live date: Tue 10/27.

---

## 1. Design thinking (frontend-design skill, answered before any code)

1. **Single job:** turn a pasted `ss`/`netstat`/`lsof` listing into one verdict per listener: who
   could reach it, what it probably is, whether it is a known foot-gun, and the next command.
2. **User at this moment:** someone who just ran `ss -tulpn`, is staring at 30 rows, and wants to
   know which one matters. Often after "port seems open but connection refused", or after reading
   that Docker bypasses ufw.
3. **What they remember:** the red row: a database port such as `0.0.0.0:5432`, a Postgres container
   published on every interface. It sits in plain sight in line 20 of the
   listing and nothing in `ss` marks it.
4. **Aesthetic direction:** **Signal/Noise** (security dashboard: high contrast, data-forward, state
   micro-animation). Rows are the data; severity is the only colour that carries meaning.

## 2. Scope and non-goals

In scope: parsing pasted text, classifying each listening socket, explaining it, suggesting the next
local command, a redacted share link, a copyable baseline.

Out of scope, stated in the UI:
- **Not a scanner.** It never connects to anything. It cannot see firewalls, NAT or cloud security
  groups. Every verdict is phrased as *who could reach this socket*, never *is reachable*.
- No per-port landing pages in v1 (research: build only if the tool URL gets ≥50 Bing impressions / 28 d).
- No Windows `netstat -ano` in v1 (different columns, different audience). Detect it and say so.

---

## 3. Input

- One `<textarea>` (monospace, `bg-bg3`), placeholder `$ ss -tulpn`.
- Buttons: **Load example** (the redacted fixture F1 below: this box, real), **Clear**.
- Toggle **Redact addresses** (default ON). It masks non-loopback, non-wildcard IPs in the rendered
  cards and in the share hash. Loopback, wildcard, multicast (`224.0.0.0/4`, `ff00::/8`) and
  link-local scopes stay visible because they carry the verdict and identify nothing.
- Parse on input (debounced 150 ms). No submit button.
- Hard cap 2,000 lines / 400 KB. Above that: "Paste the listeners only: `ss -tulpn` or `ss -ltnp`."

### 3.1 Format detection (first match wins)

| # | Signal in the text | Format |
|---|---|---|
| 1 | a line starting `Netid` + `Local Address:Port` | `ss` with Netid column (`-tulpn`, `-tuln`, `-tuap`) |
| 2 | a line starting `State` + `Local Address:Port` and no `Netid` | `ss` single-protocol (`-ltnp`, `-ltnpe`, `-lunp`) |
| 3 | no header, rows start `LISTEN`/`UNCONN`/`tcp`/`udp` + `users:((` or `ino:` | `ss -H` headerless |
| 4 | `Proto Recv-Q Send-Q Local Address` or `Active Internet connections` | Linux net-tools `netstat` |
| 5 | header `COMMAND  PID  USER  FD  TYPE  DEVICE  SIZE/OFF  NODE  NAME` | `lsof -i` (with or without `-P -n`) |
| 6 | `Proto  Local Address  Foreign Address  State  PID` with `TCP 0.0.0.0:135` style | Windows `netstat -ano`: show "Windows output is not supported yet" |
| — | none | "Could not recognise this output. Paste `ss -tulpn` (Linux)." with the command copy button |

A paste may contain a leading prompt line (`$ ss -tulpn`) or the net-tools preamble
`(Not all processes could be identified, …)`; both are skipped, and the netstat preamble sets
`nonRoot = true` (fixture F4).

---

## 4. Parsing rules

**General:** tokenize on runs of whitespace, never on column offsets. Column widths change with the
longest address, `ss` pads the Process column with trailing spaces, and terminals wrap. Every line
that is not a header, not blank and not parsed goes into an **unparsed list** shown under the results
("Could not read line 14: …") so a parser bug is visible, not silent.

### 4.1 `ss`

Row grammar after the header (tokens):

```
[Netid] State Recv-Q Send-Q Local Peer [Process…] [extended…]
```

- `Netid` present only in format 1 (`tcp`, `udp`, `raw`, `u_str`, …). Keep `tcp`, `udp`, `tcp6`,
  `udp6`; ignore `u_*`, `raw`, `p_*`, `nl` rows silently (count them in the summary as "ignored").
- `State`: `LISTEN` (TCP listener), `UNCONN` (UDP bound socket, the UDP equivalent of listening).
  Rows in `ESTAB`, `TIME-WAIT`, `SYN-SENT`, `CLOSE-WAIT` etc. are **connections, not listeners**:
  collect them into a collapsed "N connections (not listeners)" group, never into cards.
- `Local`: split address and port at the **last** `:`. Forms seen in real output:
  `127.0.0.1:18791`, `0.0.0.0:5355`, `*:3111`, `[::]:3000`, `[::1]:18789`,
  `127.0.0.53%lo:53` (scope suffix `%lo` on an IPv4 address), `[fe80::…]%wlan0:546` (scope after the
  bracket), `224.0.0.251:5353` (multicast). Also accept `[::ffff:127.0.0.1]:X` (v4-mapped) and a
  bare `%iface` on a wildcard (`0.0.0.0%docker0:53`).
- Port may be a service name when `-n` was not used (`0.0.0.0:ssh`, `*:mdns`, `[::]:llmnr`). Map
  names back through a small `/etc/services` subset in `portData.ts` and show the note "you ran
  `ss` without `-n`; ports are shown by name".
- `Process`: `users:(("name",pid=N,fd=N),("name2",pid=M,fd=K))`. Parse every tuple with
  `/\("([^"]*)",pid=(\d+),fd=(\d+)\)/g`. Names are truncated by the kernel to 15 chars
  (`node`, `next-server (v1`): show them as given, with the note "process names are cut
  to 15 characters by the kernel".
- **Empty Process column** on a row that has one elsewhere (fixture F1: `127.0.0.54:53`,
  `0.0.0.0:5355`, `0.0.0.0:3000`) means the socket belongs to another user and `ss` ran without
  root. Flag `NO_OWNER` (info) with the fix `sudo ss -tulpn` or `ss -ltnpe` (§6).
- Extended fields (`-e`), any order, after Process: `uid:969`, `ino:15498`, `sk:6010`,
  `cgroup:/system.slice/systemd-resolved.service`, `v6only:1|0`, and a trailing `<->`. Parse
  `key:value` pairs; ignore unknown keys. From `cgroup:` extract the **unit**: the last path segment
  that ends in `.service` or `.scope`, else the last segment
  (`/system.slice/system-tor.slice/tor@default.service` → `tor@default.service`;
  `…/app.slice/app-org.kde.konsole-5928.scope/tab(6544).scope` → `tab(6544).scope`, shown with the
  parent `app-org.kde.konsole-5928.scope` because a bare `tab(…)` means nothing).
- Owner precedence for the card title: process name → cgroup unit → `uid:N` → "unknown (run with sudo)".

### 4.2 net-tools `netstat -tulpn` / `-tlnp` / `-ulnp`

Columns: `Proto Recv-Q Send-Q Local Foreign [State] [PID/Program name]`.
- `udp`/`udp6` rows have **no State token**. Detect by `Proto` and shift columns.
- IPv6 addresses are **not bracketed**: `:::5432`, `fe80::db8:1:546`. Split at the last `:`.
  `:::PORT` means `[::]:PORT`.
- `PID/Program name`: `1096/node` (truncated to 19 chars in total by netstat), `7889/chrome --type=`
  (the program column includes the start of argv), or `-` (not ours, not root).
- `tcp6` + `:::PORT`: on Linux this socket usually also accepts IPv4 (`v6only=0`) but netstat cannot
  say. Card note: "netstat does not show v6only; `ss -ltne` does".
- The preamble `(Not all processes could be identified …)` → banner "Not run as root: rows marked `-`
  belong to other users."

### 4.3 `lsof -i -P -n`

Columns: `COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME [(STATE)]`.
- `COMMAND` is truncated to 9 chars by default (`+c 0` widens it). Show as given + note.
- `TYPE` `IPv4`/`IPv6` → family. `NODE` `TCP`/`UDP` → protocol.
- `NAME`: `127.0.0.1:18789`, `[::1]:18789`, `*:5353`, `224.0.0.251:5353`. A `NAME` containing `->`
  is a connection → not a listener. TCP listeners carry `(LISTEN)`; UDP sockets carry no state, and
  a UDP `NAME` without `->` is a bound socket (treat like `UNCONN`).
- Without `-P`, ports are names (`*:mdns`); without `-n`, hosts are names (`localhost:18789`). Map
  `localhost` → loopback, anything else → "specific address" with the note to re-run with `-nP`.
- lsof lists one row per file descriptor. Fixture F5 has `UDP *:5353` five times for one PID.

### 4.4 Normalisation and de-duplication

Key = `proto + normalisedAddress + port`. Merge rows with the same key: union of processes, count
of fds, max Recv-Q. Real cases in the fixtures: `node` holds `0.0.0.0:5353` on five fds;
`chrome` holds `224.0.0.251:5353` on four. One card each, "5 sockets".

Do **not** merge `0.0.0.0:3000` with `[::]:3000`. They are two sockets and one can close without
the other. Show them as a **pair** inside one card ("IPv4 + IPv6") when both have the same owner.

---

## 5. Reachability scope (column 1 of every card)

| Address (after normalisation) | Scope label | Colour token |
|---|---|---|
| `127.0.0.0/8`, `::1`, `*%lo` | **Loopback only**: this machine | `--muted` |
| `127.0.0.53`, `127.0.0.54` port 53 | Loopback only (systemd-resolved stub) | `--muted` |
| `0.0.0.0` | **All IPv4 interfaces** | `--amber` |
| `[::]` + `v6only:1` | All IPv6 interfaces | `--amber` |
| `[::]` + `v6only:0`, or `*` | **All interfaces, IPv4 and IPv6** | `--amber` |
| `[::]` with v6only unknown (plain `ss`, netstat, lsof) | All IPv6 interfaces (IPv4 too unless v6only) | `--amber` |
| `fe80::/10` + `%iface` | Link-local on one interface (same network segment only) | `--blue` |
| `224.0.0.0/4`, `ff00::/8` | Multicast group membership (not a listener you can connect to) | `--muted` |
| RFC 1918 / CGNAT `100.64.0.0/10` / tailscale `100.x` / ULA `fd00::/8` | One private interface | `--blue` |
| any other address | One public interface (redacted by default) | `--amber` |

Fixed sentence under every scope: *"Who could reach this socket. Your firewall, NAT and cloud
security groups are invisible to this tool."*

## 6. Verdict logic (flags)

Evaluated per card, all that apply, sorted by severity. Severity → token: **critical** `--amber` border
+ amber text + left bar (the site has no red token; amber is the warning colour by brand rule),
**warn** `--amber` text only, **info** `--blue`, **ok** `--green`.

| ID | Condition | Severity | Card text (short) | Next command (copy button) | Link |
|---|---|---|---|---|---|
| `DB_WILDCARD` | port ∈ {5432, 3306, 33060, 27017, 6379, 11211, 9200, 9300, 5984, 8086, 26257} **or** port-note says database, and scope is wildcard/public | critical | A database or cache is listening on every interface. | `ss -ltnpe 'sport = :PORT'` | `/snippets/port-listening-but-connection-refused` (bind section) |
| `DOCKER_API` | port 2375 (or 2376) not loopback | critical | Docker's API without TLS on the network is root on this host for anyone who reaches it. | `sudo ss -ltnp 'sport = :2375'` | `/guides/open-ports-linux#containers-what-docker-proxy-hides` |
| `DOCKER_PUBLISH` | owner is `docker-proxy`, or cgroup unit `docker.service`/`containerd.service`, and scope wildcard | warn | A published container port. Docker inserts its own iptables rules, so ufw's INPUT rules do not apply to it. Publish to `127.0.0.1:` if it only needs local access. | `docker ps --format '{{.Names}}\t{{.Ports}}'` | same guide section |
| `SSH_WILDCARD` | port 22 wildcard | info | SSH on every interface is normal for a server. Keys only, no passwords. | `sudo sshd -T \| grep -E 'passwordauth|permitroot'` | `/snippets/ssh-key-setup-script` |
| `DEV_SERVER_WILDCARD` | port ∈ {3000, 3001, 4200, 5000, 5173, 8000, 8080, 8888, 3111} or owner matches `node|next-server|vite|python3|http.server|flask|uvicorn` and scope wildcard | warn | A development server reachable from your network. | `ss -ltnp 'sport = :PORT'` | `/snippets/port-listening-but-connection-refused` |
| `NO_OWNER` | process column empty in `ss`/`-` in netstat and no cgroup/uid | info | Owned by another user and you are not root. | `ss -ltnpe 'sport = :PORT'` (shows the systemd unit without root) | `/guides/open-ports-linux#without-root` |
| `BACKLOG_FULL` | TCP LISTEN and `Recv-Q ≥ Send-Q` and `Send-Q > 0` | warn | The accept queue is full: the service is running but not accepting connections (hung, or overloaded). | `ss -ltn 'sport = :PORT'` twice, 5 s apart | `/guides/diagnose-a-hung-process`, `/guides/auto-restart-linux-service` |
| `LOOPBACK_ONLY` | scope loopback | ok | Only this machine can connect. If another machine gets "Connection refused", this is why. | `./check-bind-address.sh PORT` | `/snippets/port-listening-but-connection-refused` |
| `RESOLVED_STUB` | 53 on `127.0.0.53`/`127.0.0.54` | ok | systemd-resolved's local DNS stub. | `resolvectl status` | — |
| `LLMNR` | 5355 any scope | info | systemd-resolved's LLMNR responder. Disable with `LLMNR=no` in `/etc/systemd/resolved.conf.d/`. | `resolvectl status \| grep -i llmnr` | — |
| `MDNS` | 5353 | info | mDNS / Bonjour (avahi, browsers, Electron apps). Multicast rows are memberships, not listeners. | `ss -lunp 'sport = :5353'` | — |
| `UDP_UNCONN` | UDP row | ok (note only) | `UNCONN` is the normal state of a bound UDP socket. | — | — |
| `V6_SPLIT` | `[::]:P` and `0.0.0.0:P` both present | note | Two sockets, one per family. | — | — |
| `EPHEMERAL` | port in 32768–60999 and loopback | note | In the ephemeral range: usually a helper's control port chosen at startup (fixture: `127.0.0.1:38077` → `containerd.service`). | `ss -ltnpe 'sport = :PORT'` | — |
| `WINDOWS` | format 6 | — | Banner only. | — | — |

**Summary strip** (top, sticky on scroll): `N listeners · M reachable from the network · K flagged ·
J ignored rows`. "Reachable from the network" = scope wildcard, private, public or link-local.

**Expected summary for fixture F1** (this box, `ss -tulpn` without root), computed with a
throwaway reference parse of the fixture, not a hand guess: 38 data rows → 31 sockets after the
fd merge (§4.4) → **22 cards** after pairing IPv4/IPv6 twins with the same port and owner (seven
wildcard pairs, plus `127.0.0.1:18789` / `[::1]:18789`). **12 cards network-scope** (3000, 3111,
5355/tcp, 5432, 5353/udp on 0.0.0.0, 5355/udp, and the two link-local
546 sockets). **24 of 31 sockets have no owner** → one `NO_OWNER` banner, not 24 flags. Flags:
`DB_WILDCARD` ×1 (5432, via the port table's Postgres entry), `DEV_SERVER_WILDCARD` ×2
(3000 by port, `*:3111` by owner `next-server`). `DOCKER_PUBLISH` **cannot fire on F1**: without
`-e` or root there is no owner, so nothing says Docker. It fires on F2 (cgroup
`docker.service`: 3000, 5432) and on F7 (process `docker-proxy`). The card for a
wildcard row with no owner should say so: "run `ss -ltnpe` to see whether this is a container."

## 7. Port knowledge table (`portData.ts`)

~120 hand-written entries, Linux-daemon aware. No IANA dump. Each: `port`, `proto`, `name`,
`what` (one sentence), `bindAdvice` (one sentence or empty), `kind`
(`database | cache | admin | dev | infra | desktop | proxy | vpn | other`). Seed list, prioritising
what the fixtures and the Stack Exchange questions in the research contain:

22 sshd · 25 SMTP · 53 DNS (stub on 127.0.0.53/.54) · 67/68 DHCP · 80/443 web · 111 rpcbind ·
123 NTP · 137–139/445 Samba · 546/547 DHCPv6 client/server (link-local) · 631 CUPS · 1080 SOCKS ·
1883 MQTT · 2049 NFS · 2375/2376 Docker API · 3000 dev servers / Grafana / Open WebUI when
docker-published · 3111 Next.js dev (seen here) · 3306 MySQL · 4000 Phoenix / logflare ·
5000 Flask / registry · 5173 Vite · 5353 mDNS · 5355 LLMNR · 5432 PostgreSQL · 5672 RabbitMQ ·
5900 VNC · 6379 Redis · 6443 Kubernetes API · 8000 / 8080 / 8888 dev + proxies · 8384 Syncthing
GUI · 9000 PHP-FPM / MinIO · 9050/9051 Tor SOCKS/control · 9090 Prometheus / Cockpit ·
9100 node_exporter · 9200/9300 Elasticsearch · 10250 kubelet · 11211 memcached · 11434 Ollama ·
27017 MongoDB · 41641 Tailscale · 51820 WireGuard · 54321–54327 Supabase CLI local stack
(54322 = Postgres, 54323 = Studio, 54324 = Mailpit).

Rule for `cslistener` (9000) and other `/etc/services` names people search for (research: 112K-view
question): the card shows both the services-file name *and* what actually uses that port on Linux.

---

## 8. UI (frontend-design tokens; no new colours)

Layout, top to bottom, left-aligned, `max-w-5xl`:

1. **Terminal prompt header** in the tool shell (existing tool page H1 above it):
   `font-mono text-sm text-muted` → `<span className="text-green">$</span> ss -tulpn` + blinking
   cursor `w-2 h-4 bg-green animate-pulse`. Copy button copies `ss -tulpn`.
2. **Input panel** `bg-bg2 border border-border rounded-[8px] p-4`; textarea `bg-bg3 font-mono
   text-xs text-text`, `min-h-[12rem]`, horizontal scroll, no wrap (`whitespace-pre`). Row of
   controls under it: Load example · Clear · Redact addresses (toggle) · detected format label
   (`font-mono text-xs text-muted uppercase tracking-widest`: `DETECTED: SS -TULPN, NOT ROOT`).
3. **Summary strip** `sticky top-16 z-10 bg-bg/90 backdrop-blur-sm border-b border-border`, mono,
   the four numbers; flagged count in `text-amber` when > 0, `text-green` "0 flagged" otherwise.
   The number changes with a 150 ms `transition-colors` (micro-animation on state, per direction).
4. **Filter row**: All · Network-reachable · Flagged · Loopback (mono pills with **border**, not
   filled badges; active = `border-green text-green`).
5. **Cards**, one per merged listener, sorted: critical → warn → info → ok; within a tier by port.
   `bg-bg2 border border-border rounded-[8px] p-4 hover:border-green transition-colors duration-150
   group relative`. A critical card gets `border-l-4 border-l-amber`. Card grid: 1 column on
   mobile, 2 on `lg`. Card content:
   - Line 1 (`font-mono text-xs text-muted uppercase tracking-widest`): `TCP · IPV4+IPV6 · 2 SOCKETS`.
   - Line 2 (`font-heading text-lg font-bold`): `0.0.0.0:5432` + `[::]:5432`.
   - Line 3: scope label in its token colour + owner (`docker.service`).
   - Line 4: port note ("PostgreSQL") in `text-text text-sm`.
   - Flags: one line each, severity word in mono caps + sentence. No icons, no emoji.
   - Next command: an inline code block with the site's `CodeBlock` look (language label `bash`,
     copy button, `bg-bg3`), highlighted with `bashHighlight.ts`.
   - Links: `text-blue hover:text-green`.
6. **Unparsed lines** (collapsed `<details>`), then **Connections (not listeners)** (collapsed).
7. **Baseline panel**: "Turn this into a nightly diff." Button **Copy baseline** copies the
   normalised CSV (`proto,address,port,owner`, same shape as `ports-audit.sh` output, sorted
   `LC_ALL=C`-style) and links `/snippets/ports-audit` → `/tools/cron-wrapper-generator`.
8. **Share**: "Copy share link" puts the *redacted* normalised rows (not the raw paste) in the URL
   **hash** (`#v1=` + base64url of gzip-less JSON, max ~6 KB); never the query string, so nothing
   reaches the server or Vercel logs. On load, a hash repopulates the results and shows
   "Loaded from a shared link" with a Clear button.

Keyboard: `/` focuses the textarea (same as the ShellCheck decoder), `Esc` clears filters.
Accessibility: every flag has a text severity word (colour is never the only signal); cards are
`<article>` with `aria-labelledby` on the address; the summary is an `aria-live="polite"` region.

Do-not list for this tool (from the skill): no red/purple, no emoji status icons, no filled pill
badges as the only signal, no shadow-only cards, no inline `style={}`.

## 9. Registry entry, metadata and schema

The tool page route (`src/app/tools/[slug]/page.tsx`) already emits `WebApplication` +
`BreadcrumbList` + `FAQPage` from the registry and places `ToolkitCTA placement="tool"` and
`EmailCapture` after the tool. No per-tool route file. Draft registry entry (`src/lib/tools.ts`):

```ts
{
  slug: 'open-ports-explainer',
  component: 'OpenPortsExplainer',
  datePublished: '2026-10-27',   // = the real deploy date
  dateModified: '2026-10-27',
  title: 'Open Ports Explainer: Paste ss -tulpn, See What Is Exposed',
  description:
    'Paste ss -tulpn, netstat or lsof output: every listener explained, with who could reach it, what it is, known foot-guns and the next command. In your browser.',
  quickAnswer:
    'The Open Ports Explainer reads the output of ss -tulpn, ss -ltnpe, netstat -tulpn or lsof -i -P -n and explains every listening socket in plain English. For each one it shows the reachability scope from the Local Address column: 127.0.0.1 and ::1 are loopback only, 0.0.0.0 is every IPv4 interface, [::] or * is every interface, and a specific address is that interface only. It names the owner from the Process column, or from the systemd cgroup when you ran ss -e without root, adds a note for the port (systemd-resolved on 127.0.0.53:53, LLMNR on 5355, mDNS on 5353, Postgres on 5432), and flags the known problems: a database or the Docker API on a wildcard address, a docker-proxy port that ufw does not filter, an empty Process column, and a full accept queue. Each row gets the next command to run. Nothing is sent anywhere, and addresses are redacted in share links by default.',
  category: 'debug',
  howToUse: [
    'Run `ss -tulpn` (or `sudo ss -tulpn` to see every process) and paste the whole output, header included.',
    'Read the summary: listeners, how many are reachable from the network, and how many are flagged.',
    'Open each flagged card and run its next command to confirm what owns the socket.',
    'Copy the baseline CSV and schedule the ports-audit script so a new listener alerts you next time.',
  ],
  faqs: [ /* the five below, same words as the visible FAQ */ ],
  relatedSnippets: ['list-open-ports-linux', 'ports-audit', 'port-listening-but-connection-refused', 'kill-process-on-port'],
}
```

Word counts to verify at build: title ≤ 65 chars (this draft: 58), description ≤ 160 (158),
quickAnswer 134–167 words (draft: 156; recount after edits).

**FAQs** (real questions from the research's Stack Exchange list; answers ≤ 80 words each, final
copy written at build):
1. What is the difference between 0.0.0.0 and 127.0.0.1 in ss output?
2. Why is the Process column empty in ss -tulpn? (not root; `ss -ltnpe` names the unit)
3. What is listening on port 5355 / 127.0.0.53:53 on Linux?
4. Why does ufw not block a Docker published port? (only after reproducing it on this box; if it
   has not been reproduced by build week, drop this FAQ and keep the flag text factual)
5. Does this tool scan my ports or send my output anywhere? (no; parsing is in the browser; share
   links are a URL hash of redacted rows)

**Schema check:** `WebApplication.offers.price = 0` is already emitted by the route; the FAQ JSON-LD
must match the visible FAQ word for word (skill rule). No HowTo schema (deprecated).

**llms.txt** (Interactive Tools section + counts comment, 12 → 13 tools):
`- [Open Ports Explainer](https://bashsnippets.xyz/tools/open-ports-explainer) — Paste ss -tulpn, ss -ltnpe, netstat -tulpn or lsof -i output; every listener gets a reachability scope (loopback, all IPv4, all interfaces, one address), its owner from the process or systemd cgroup, a Linux-aware port note, severity flags (database or Docker API on a wildcard, docker-proxy publish, empty process column, full accept queue) and the next command. Client-side only; share links carry redacted rows in the URL hash.`

## 10. Internal-link map

**Into the tool** (one Callout or sentence each; add in the same deploy as the tool):

| From | Where | Text |
|---|---|---|
| `/guides/open-ports-linux` | after the address-column explanation in "What the numbers mean", and in "Without root" | "Paste your own output into the Open Ports Explainer to get this verdict per row." |
| `/snippets/list-open-ports-linux` | Callout under the first output block (highest-impression page on the site, 154 imp) | same |
| `/snippets/ports-audit` | before "The Script" | "Read a one-off listing first with the Open Ports Explainer." |
| `/snippets/kill-process-on-port` | FAQ "which process" answer | link |
| `/snippets/port-listening-but-connection-refused` (**new, batch 1**) | "How Do I Read the Local Address Column?" section | "The Open Ports Explainer applies this table to every row of a pasted listing." |
| `/snippets/find-ip-address-linux` | where the LAN address is explained | "which listeners use that address" |
| `/guides/auto-restart-linux-service` | backlog / hung section | Recv-Q ≥ Send-Q check |
| `/guides/diagnose-a-hung-process` | ss -tnp section | same |
| `/tools` index | automatic from the registry | — |
| `/tools/shellcheck-error-decoder`, `/tools/cron-wrapper-generator` | "Related tools" if that block exists; else skip | — |

**Out of the tool:** `relatedSnippets` above, plus per-flag links in §6 and the baseline panel
(`/snippets/ports-audit` → `/tools/cron-wrapper-generator`).

**Cross-posts:** wave-2 **#27** (`ports-audit`, "a port that wasn't there yesterday", Thu 1/7)
should link the tool in its body once the tool is live; the tool also gets its own article (research
§5 distribution: "My laptop had a port open to the whole network for months").

## 11. Toolkit CTA placement

- The tool route already renders `ToolkitCTA placement="tool"` **below** the tool and
  `EmailCapture` after it. Do not add another one inside the component.
- The honest funnel (research risk 3: the toolkit has no ports script) is the **baseline panel**:
  tool → `ports-audit` (free) → schedule it → `cron-wrapper-generator` → toolkit (`cron-wrapper.sh`,
  `healthcheck.sh`, `bashlib.sh`). One sentence in the panel may link `/starter-kit`:
  "The Production Bash Toolkit's cron-wrapper.sh adds the lock, timeout and one-alert-per-change
  logging for the nightly run." No price in the component.
- GA4: reuse existing `toolkit_cta_click` with `placement=tool`. Add no new event for the paste
  (privacy promise). Optional: `tool_example_loaded` and `tool_share_copied` with **no payload**.

---

## 12. Test fixtures (real output from this box, 2026-09-28, redacted)

Captured on Kali (kernel 7.1.5, iproute2 7.1.0, net-tools 2.10, lsof 4.99.4) as the unprivileged
user. Redactions: link-local IPv6 addresses → `fe80::db8:1` (wlan0) / `fe80::db8:2` (eth0);
global IPv6 (this box's address and remote peers) → `2001:db8::/32` documentation addresses. No
IPv4 in these captures is non-loopback, non-wildcard or non-multicast. Nothing else changed:
column spacing and truncation are as the tools printed them; trailing spaces are trimmed.

Store each fixture as `src/components/tools/shared/__fixtures__/<id>.txt` **or** as template
strings in a test file, and assert the expected results below. The repo has no test runner; the
build session should add a tiny `node --test` script under `scripts/` (not shipped) or verify by
loading each fixture in the dev server and comparing counts.

### F1: `ss -tulpn` (not root) — the "Load example" fixture

```text
Netid State  Recv-Q Send-Q                     Local Address:Port  Peer Address:PortProcess
udp   UNCONN 0      0                             127.0.0.54:53         0.0.0.0:*
udp   UNCONN 0      0                          127.0.0.53%lo:53         0.0.0.0:*
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*    users:(("node",pid=1096,fd=31))
udp   UNCONN 0      0                            224.0.0.251:5353       0.0.0.0:*    users:(("chrome",pid=7889,fd=77))
udp   UNCONN 0      0                            224.0.0.251:5353       0.0.0.0:*    users:(("chrome",pid=7889,fd=76))
udp   UNCONN 0      0                            224.0.0.251:5353       0.0.0.0:*    users:(("chrome",pid=7889,fd=75))
udp   UNCONN 0      0                            224.0.0.251:5353       0.0.0.0:*    users:(("chrome",pid=7889,fd=74))
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*    users:(("node",pid=1096,fd=33))
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*    users:(("node",pid=1096,fd=29))
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*    users:(("node",pid=1096,fd=27))
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*    users:(("node",pid=1096,fd=25))
udp   UNCONN 0      0                                0.0.0.0:5355       0.0.0.0:*
udp   UNCONN 0      0      [fe80::db8:1]%wlan0:546           [::]:*
udp   UNCONN 0      0       [fe80::db8:2]%eth0:546           [::]:*
udp   UNCONN 0      0                                   [::]:5355          [::]:*
tcp   LISTEN 0      4096                          127.0.0.54:53         0.0.0.0:*
tcp   LISTEN 0      511                            127.0.0.1:18791      0.0.0.0:*    users:(("node",pid=1096,fd=34))
tcp   LISTEN 0      511                            127.0.0.1:18789      0.0.0.0:*    users:(("node",pid=1096,fd=22))
tcp   LISTEN 0      4096                             0.0.0.0:5355       0.0.0.0:*
tcp   LISTEN 0      4096                             0.0.0.0:3000       0.0.0.0:*
tcp   LISTEN 0      4096                           127.0.0.1:38077      0.0.0.0:*
tcp   LISTEN 0      4096                             0.0.0.0:5432      0.0.0.0:*
tcp   LISTEN 0      511                            127.0.0.1:43347      0.0.0.0:*    users:(("node",pid=1096,fd=24))
tcp   LISTEN 0      4096                       127.0.0.53%lo:53         0.0.0.0:*
tcp   LISTEN 0      4096                           127.0.0.1:9050       0.0.0.0:*
tcp   LISTEN 0      511                                [::1]:18789         [::]:*    users:(("node",pid=1096,fd=23))
tcp   LISTEN 0      4096                                [::]:5355          [::]:*
tcp   LISTEN 0      511                                    *:3111             *:*    users:(("next-server (v1",pid=154558,fd=21))
tcp   LISTEN 0      4096                                [::]:3000          [::]:*
tcp   LISTEN 0      4096                                [::]:5432         [::]:*
```

Expected: format 1, `nonRoot` inferred (some rows without `users:`), 38 data rows, 22 cards (§6).
Must flag the `0.0.0.0:5432` + `[::]:5432` pair as `DB_WILDCARD` (via the port table; no
`DOCKER_PUBLISH` without an owner); `*:3111` as `DEV_SERVER_WILDCARD`; `127.0.0.1:9050`
note Tor; `0.0.0.0:5355`/`[::]:5355` LLMNR; `127.0.0.53%lo:53` + `127.0.0.54:53` resolved stub;
`224.0.0.251:5353` multicast membership; `[fe80::db8:1]%wlan0:546` link-local DHCPv6 client.

### F2: `ss -ltnpe` (not root) — the no-root owner trick

```text
State  Recv-Q Send-Q Local Address:Port  Peer Address:PortProcess
LISTEN 0      4096      127.0.0.54:53         0.0.0.0:*    uid:969 ino:15498 sk:6010 cgroup:/system.slice/systemd-resolved.service <->
LISTEN 0      511        127.0.0.1:18791      0.0.0.0:*    users:(("node",pid=1096,fd=34)) uid:1000 ino:40755 sk:6011 cgroup:/user.slice/user-1000.slice/user@1000.service/app.slice/nodey.service <->
LISTEN 0      511        127.0.0.1:18789      0.0.0.0:*    users:(("node",pid=1096,fd=22)) uid:1000 ino:23929 sk:6012 cgroup:/user.slice/user-1000.slice/user@1000.service/app.slice/nodey.service <->
LISTEN 0      4096         0.0.0.0:5355       0.0.0.0:*    uid:969 ino:15483 sk:6013 cgroup:/system.slice/systemd-resolved.service <->
LISTEN 0      4096         0.0.0.0:3000       0.0.0.0:*    ino:21691 sk:2004 cgroup:/system.slice/docker.service <->
LISTEN 0      4096       127.0.0.1:38077      0.0.0.0:*    ino:6591 sk:6014 cgroup:/system.slice/containerd.service <->
LISTEN 0      4096         0.0.0.0:5432      0.0.0.0:*    ino:24786 sk:6016 cgroup:/system.slice/docker.service <->
LISTEN 0      511        127.0.0.1:43347      0.0.0.0:*    users:(("node",pid=1096,fd=24)) uid:1000 ino:23931 sk:601a cgroup:/user.slice/user-1000.slice/user@1000.service/app.slice/nodey.service <->
LISTEN 0      4096   127.0.0.53%lo:53         0.0.0.0:*    uid:969 ino:15496 sk:601b cgroup:/system.slice/systemd-resolved.service <->
LISTEN 0      4096       127.0.0.1:9050       0.0.0.0:*    ino:7895 sk:601c cgroup:/system.slice/system-tor.slice/tor@default.service <->
LISTEN 0      511            [::1]:18789         [::]:*    users:(("node",pid=1096,fd=23)) uid:1000 ino:23930 sk:601d cgroup:/user.slice/user-1000.slice/user@1000.service/app.slice/nodey.service v6only:1 <->
LISTEN 0      4096            [::]:5355          [::]:*    uid:969 ino:15491 sk:601e cgroup:/system.slice/systemd-resolved.service v6only:1 <->
LISTEN 0      511                *:3111             *:*    users:(("next-server (v1",pid=154558,fd=21)) uid:1000 ino:584839 sk:601f cgroup:/user.slice/user-1000.slice/user@1000.service/app.slice/app-org.kde.konsole-5928.scope/tab(6544).scope v6only:0 <->
LISTEN 0      4096            [::]:3000          [::]:*    ino:21692 sk:2005 cgroup:/system.slice/docker.service v6only:1 <->
LISTEN 0      4096            [::]:5432         [::]:*    ino:24787 sk:6021 cgroup:/system.slice/docker.service v6only:1 <->
```

Expected: format 2. Owners resolved from `cgroup:` for every row without `users:`
(`systemd-resolved.service`, `docker.service`, `containerd.service`, `tor@default.service`).
`v6only:1` on `[::]:3000` → scope "All IPv6 interfaces"; `v6only:0` on `*:3111` → "All interfaces,
IPv4 and IPv6". `127.0.0.1:38077` → `EPHEMERAL` + owner `containerd.service`.

### F3: `ss -tuln` (no process column)

```text
Netid State  Recv-Q Send-Q                     Local Address:Port  Peer Address:Port
udp   UNCONN 0      0                             127.0.0.54:53         0.0.0.0:*
udp   UNCONN 0      0                          127.0.0.53%lo:53         0.0.0.0:*
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*
udp   UNCONN 0      0                            224.0.0.251:5353       0.0.0.0:*
udp   UNCONN 0      0                            224.0.0.251:5353       0.0.0.0:*
udp   UNCONN 0      0                            224.0.0.251:5353       0.0.0.0:*
udp   UNCONN 0      0                            224.0.0.251:5353       0.0.0.0:*
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*
udp   UNCONN 0      0                                0.0.0.0:5353       0.0.0.0:*
udp   UNCONN 0      0                                0.0.0.0:5355       0.0.0.0:*
udp   UNCONN 0      0      [fe80::db8:1]%wlan0:546           [::]:*
udp   UNCONN 0      0       [fe80::db8:2]%eth0:546           [::]:*
udp   UNCONN 0      0                                   [::]:5355          [::]:*
tcp   LISTEN 0      4096                          127.0.0.54:53         0.0.0.0:*
tcp   LISTEN 0      511                            127.0.0.1:18791      0.0.0.0:*
tcp   LISTEN 0      511                            127.0.0.1:18789      0.0.0.0:*
tcp   LISTEN 0      4096                             0.0.0.0:5355       0.0.0.0:*
tcp   LISTEN 0      4096                             0.0.0.0:3000       0.0.0.0:*
tcp   LISTEN 0      4096                           127.0.0.1:38077      0.0.0.0:*
tcp   LISTEN 0      4096                             0.0.0.0:5432      0.0.0.0:*
tcp   LISTEN 0      511                            127.0.0.1:43347      0.0.0.0:*
tcp   LISTEN 0      4096                       127.0.0.53%lo:53         0.0.0.0:*
tcp   LISTEN 0      4096                           127.0.0.1:9050       0.0.0.0:*
tcp   LISTEN 0      511                                [::1]:18789         [::]:*
tcp   LISTEN 0      4096                                [::]:5355          [::]:*
tcp   LISTEN 0      511                                    *:3111             *:*
tcp   LISTEN 0      4096                                [::]:3000          [::]:*
tcp   LISTEN 0      4096                                [::]:5432         [::]:*
```

Expected: same cards as F1, all owners "unknown"; a single banner "You ran ss without -p. Add -p
(and sudo) or use `ss -ltnpe`" instead of one `NO_OWNER` flag per card.

### F4: `netstat -tulpn` (net-tools, not root)

```text
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.0.54:53           0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:18791         0.0.0.0:*               LISTEN      1096/node
tcp        0      0 127.0.0.1:18789         0.0.0.0:*               LISTEN      1096/node
tcp        0      0 0.0.0.0:5355            0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:38077         0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:5432           0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:43347         0.0.0.0:*               LISTEN      1096/node
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:9050          0.0.0.0:*               LISTEN      -
tcp6       0      0 ::1:18789               :::*                    LISTEN      1096/node
tcp6       0      0 :::5355                 :::*                    LISTEN      -
tcp6       0      0 :::3111                 :::*                    LISTEN      154558/next-server
tcp6       0      0 :::3000                 :::*                    LISTEN      -
tcp6       0      0 :::5432                :::*                    LISTEN      -
udp        0      0 127.0.0.54:53           0.0.0.0:*                           -
udp        0      0 127.0.0.53:53           0.0.0.0:*                           -
udp        0      0 0.0.0.0:5353            0.0.0.0:*                           1096/node
udp        0      0 224.0.0.251:5353        0.0.0.0:*                           7889/chrome --type=
udp        0      0 224.0.0.251:5353        0.0.0.0:*                           7889/chrome --type=
udp        0      0 224.0.0.251:5353        0.0.0.0:*                           7889/chrome --type=
udp        0      0 224.0.0.251:5353        0.0.0.0:*                           7889/chrome --type=
udp        0      0 0.0.0.0:5353            0.0.0.0:*                           1096/node
udp        0      0 0.0.0.0:5353            0.0.0.0:*                           1096/node
udp        0      0 0.0.0.0:5353            0.0.0.0:*                           1096/node
udp        0      0 0.0.0.0:5353            0.0.0.0:*                           1096/node
udp        0      0 0.0.0.0:5355            0.0.0.0:*                           -
udp6       0      0 fe80::db8:1:546         :::*                                -
udp6       0      0 fe80::db8:2:546         :::*                                -
udp6       0      0 :::5355                 :::*                                -
```

Expected: format 4, `nonRoot = true` from the preamble. `udp` rows parsed without a State column.
`:::5432` → `[::]:5432`. `fe80::db8:1:546` → address `fe80::db8:1`, port 546 (split at the last
colon, no brackets). `7889/chrome --type=` → owner `chrome`, pid 7889.

### F5: `lsof -i -P -n` (listeners + UDP, plus two connected rows)

```text
COMMAND       PID   USER  FD   TYPE  DEVICE SIZE/OFF NODE NAME
node        1096 angsec  22u  IPv4   23929      0t0  TCP 127.0.0.1:18789 (LISTEN)
node        1096 angsec  23u  IPv6   23930      0t0  TCP [::1]:18789 (LISTEN)
node        1096 angsec  24u  IPv4   23931      0t0  TCP 127.0.0.1:43347 (LISTEN)
node        1096 angsec  25u  IPv4   20373      0t0  UDP *:5353
node        1096 angsec  27u  IPv4   20374      0t0  UDP *:5353
node        1096 angsec  29u  IPv4   20375      0t0  UDP *:5353
node        1096 angsec  31u  IPv4  409971      0t0  UDP *:5353
node        1096 angsec  33u  IPv4   40736      0t0  UDP *:5353
node        1096 angsec  34u  IPv4   40755      0t0  TCP 127.0.0.1:18791 (LISTEN)
chrome       7889 angsec  74u  IPv4  115090      0t0  UDP 224.0.0.251:5353
chrome       7889 angsec  75u  IPv4  115092      0t0  UDP 224.0.0.251:5353
chrome       7889 angsec  76u  IPv4  115094      0t0  UDP 224.0.0.251:5353
chrome       7889 angsec  77u  IPv4  115096      0t0  UDP 224.0.0.251:5353
node        1096 angsec  32u  IPv6   28830      0t0  TCP [2001:db8::1]:52962->[2001:db8::2]:443 (ESTABLISHED)
node        1096 angsec  35u  IPv6 7467797      0t0  TCP [2001:db8::1]:37840->[2001:db8::3]:443 (ESTABLISHED)
```

Expected: format 5. 11 listener/bound rows → 5 cards (18789 IPv4 and IPv6 as a pair, 43347, 18791,
`*:5353` ×5 fds merged, `224.0.0.251:5353` ×4 fds merged). The two `->` rows go to "Connections
(not listeners)". `COMMAND` truncation note shown.

### F6: `ss -ltnp` with a full accept queue (synthetic listener, real kernel output)

A Python listener on `127.0.0.1:8096` with `listen(2)` that never calls `accept()`, and five
clients connecting:

```text
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
LISTEN 3      2          127.0.0.1:8096      0.0.0.0:*    users:(("python3",pid=2619658,fd=3))
```

Expected: `BACKLOG_FULL` (Recv-Q 3 ≥ Send-Q 2), plus `LOOPBACK_ONLY`.

### Fixtures still to capture (TRAVIS-RUNS, need root)

- **F7: `sudo ss -tulpn`** → `scripts/fixtures/open-ports/f7-ss-tulpn-root.txt` (captured 9/28 22:51,
  after the Docker `ip=127.0.0.1` fix). Every row has `users:`; `docker-proxy` owns `127.0.0.1:3000`
  (loopback, so no `DOCKER_PUBLISH`). 36 rows → 21 cards, 0 `NO_OWNER`.
- **F8: `sudo netstat -tulpn`** → `f8-netstat-tulpn-root.txt`. No preamble, a program on every row,
  names cut at the column (`docker-prox`, `localsend_a`), so the parser matches `docker-prox*`.
  Same 21 cards as F7.
- Redactions for F7/F8 on top of the F1 rules: the Supabase CLI rows (5432x, since stopped) and the
  firewalled Ollama row are dropped; the gateway process is shown as `node`.
- **F9 (optional): ufw + docker publish**: only if Travis wants the FAQ #4 claim. See the approval
  package TRAVIS-RUNS for the exact commands. OUTPUT PLACEHOLDER.

Negative fixtures (hand-made, clearly labelled as such in the test file, not shown on the site):
empty paste; a paste of `ps aux` (→ unrecognised); Windows `netstat -ano` header (→ format 6
banner); a truncated line mid-row (→ unparsed list); `ss` without `-n` (`0.0.0.0:ssh`, `*:mdns`).

## 13. Acceptance checklist (build session)

- [ ] F1–F6 parse with zero unparsed lines; card counts and flags match §12 (update the hand counts
      in §6 if the parser disagrees, and say why in the commit).
- [ ] Redaction ON by default; the share hash contains no non-loopback unicast address with it ON.
- [ ] No network request fires on paste (DevTools Network tab empty after paste and share).
- [ ] Keyboard `/` and `Esc`; screen reader announces the summary change.
- [ ] Registry entry: title ≤ 65, description ≤ 160, quickAnswer 134–167 words; FAQ JSON-LD equals
      visible FAQ.
- [ ] `npm run build && npm run lint` green; `/tools/open-ports-explainer` in `sitemap.xml`
      (from the registry, no manual line).
- [ ] llms.txt line + counts; inbound links from §10 in the same deploy; `npm run indexnow`.
- [ ] "Load example" text is F1 exactly (real run, redacted), never an invented listing.

## 14. Estimate

1–2 Claude Code sessions: parser + port table (~450 lines TS), component (~500 lines, the size of
`JqFilterBuilder.tsx`), registry + FAQ copy, the §10 inbound links, fixtures. Travis: F7/F8 root
captures (2 min), pick the Show HN date.
