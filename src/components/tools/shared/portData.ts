// Open Ports Explainer: parser, port table and verdict rules. Pure TypeScript, no React,
// so scripts/check-open-ports.mjs can run it in node against the fixtures.
// Spec: docs/specs/OPEN-PORTS-EXPLAINER-SPEC.md

export type Proto = 'tcp' | 'udp';
export type Family = 'ipv4' | 'ipv6' | 'any';
export type Format =
  | 'empty'
  | 'ss-netid'
  | 'ss-state'
  | 'ss-headerless'
  | 'netstat'
  | 'lsof'
  | 'windows'
  | 'unknown';

export type Scope =
  | 'loopback'
  | 'wildcard4'
  | 'wildcard6'
  | 'wildcardAll'
  | 'wildcard6Unknown'
  | 'linklocal'
  | 'multicast'
  | 'private'
  | 'public'
  | 'named';

export type Severity = 'critical' | 'warn' | 'info' | 'ok' | 'note';

export interface Proc {
  name: string;
  pid?: number;
}

export interface Socket {
  proto: Proto;
  family: Family;
  address: string; // normalised, no brackets, no %scope ("0.0.0.0", "::", "*", "127.0.0.53")
  iface?: string; // the %scope suffix ("lo", "wlan0")
  port: number | null;
  portName?: string; // set when the listing showed a service name instead of a number
  state: 'LISTEN' | 'UNCONN';
  recvQ: number;
  sendQ: number;
  procs: Proc[];
  uid?: string;
  unit?: string;
  unitParent?: string;
  v6only?: 0 | 1;
  fds: number;
  scope: Scope;
}

export interface Unparsed {
  line: number;
  text: string;
}

export interface ParseResult {
  format: Format;
  nonRoot: boolean; // some rows have an owner and some do not, or the netstat preamble was present
  noProcessColumn: boolean; // ran without -p: no row has an owner of any kind
  portsByName: boolean; // ran without -n
  truncatedNames: boolean; // at least one process name is at the kernel/lsof/netstat truncation limit
  netstatV6: boolean; // netstat [::] rows: v6only is not shown
  hostnames: boolean; // lsof without -n
  dataRows: number;
  sockets: Socket[]; // listeners after the fd merge
  connections: string[];
  unparsed: Unparsed[];
  ignored: number;
}

export interface PortInfo {
  name: string;
  what: string;
  bindAdvice?: string;
  kind: 'database' | 'cache' | 'admin' | 'dev' | 'infra' | 'desktop' | 'proxy' | 'vpn' | 'other';
}

export const MAX_LINES = 2000;
export const MAX_BYTES = 400 * 1024;

// ── Port knowledge: hand-written, Linux-daemon aware. Not an IANA dump. ─────────────────
const P = (name: string, kind: PortInfo['kind'], what: string, bindAdvice?: string): PortInfo => ({
  name,
  kind,
  what,
  bindAdvice,
});

const LOCAL_ONLY = 'If only this machine uses it, bind it to 127.0.0.1.';

export const PORTS: Record<string, PortInfo> = {
  'tcp/21': P('FTP', 'infra', 'FTP control channel. Credentials cross the network in clear text.', 'Prefer SFTP over sshd.'),
  'tcp/22': P('SSH', 'admin', 'OpenSSH server (sshd).'),
  'tcp/23': P('Telnet', 'admin', 'Telnet: an unencrypted remote shell.', 'Turn it off and use SSH.'),
  'tcp/25': P('SMTP', 'infra', 'Mail transfer agent (Postfix, Exim). Most desktops only need it on 127.0.0.1.', LOCAL_ONLY),
  'tcp/53': P('DNS', 'infra', 'DNS server. On 127.0.0.53 / 127.0.0.54 it is the systemd-resolved stub.'),
  'udp/53': P('DNS', 'infra', 'DNS server. On 127.0.0.53 / 127.0.0.54 it is the systemd-resolved stub.'),
  'udp/67': P('DHCP server', 'infra', 'DHCP server (dnsmasq, libvirt, a hotspot).'),
  'udp/68': P('DHCP client', 'infra', 'DHCP client socket (NetworkManager, dhclient).'),
  'tcp/80': P('HTTP', 'infra', 'Web server or reverse proxy (nginx, Apache, Caddy).'),
  'tcp/111': P('rpcbind', 'infra', 'rpcbind / portmapper, used by NFS. Rarely needed on a desktop.', 'Stop rpcbind.socket if you do not use NFS.'),
  'udp/111': P('rpcbind', 'infra', 'rpcbind / portmapper, used by NFS.', 'Stop rpcbind.socket if you do not use NFS.'),
  'udp/123': P('NTP', 'infra', 'Time sync (chronyd, ntpd). As a server only if it binds a wildcard address.'),
  'udp/137': P('NetBIOS name', 'infra', 'Samba nmbd name service.'),
  'udp/138': P('NetBIOS datagram', 'infra', 'Samba nmbd datagram service.'),
  'tcp/139': P('NetBIOS session', 'infra', 'Samba smbd (old SMB transport).'),
  'tcp/443': P('HTTPS', 'infra', 'Web server or reverse proxy over TLS.'),
  'tcp/445': P('SMB', 'infra', 'Samba file sharing (smbd).', 'Limit with "interfaces" and "bind interfaces only" in smb.conf.'),
  'udp/500': P('IKE', 'vpn', 'IPsec key exchange (strongSwan, libreswan).'),
  'udp/546': P('DHCPv6 client', 'infra', 'DHCPv6 client, bound to a link-local address on one interface.'),
  'udp/547': P('DHCPv6 server', 'infra', 'DHCPv6 server or relay.'),
  'tcp/631': P('CUPS', 'desktop', 'CUPS print server web UI and IPP.', 'Keep "Listen localhost:631" in cupsd.conf unless you share printers.'),
  'udp/631': P('CUPS browsing', 'desktop', 'cups-browsed printer discovery.'),
  'tcp/873': P('rsync daemon', 'infra', 'rsyncd. Modules without auth users are readable by anyone who reaches it.'),
  'tcp/1080': P('SOCKS', 'proxy', 'SOCKS proxy (ssh -D, dante).', 'An open SOCKS proxy on a wildcard address relays anyone. Bind it to 127.0.0.1.'),
  'udp/1194': P('OpenVPN', 'vpn', 'OpenVPN server.'),
  'tcp/1433': P('SQL Server', 'database', 'Microsoft SQL Server.', LOCAL_ONLY),
  'tcp/1883': P('MQTT', 'infra', 'MQTT broker (Mosquitto) without TLS.', 'Mosquitto 2 listens on loopback only unless a listener is configured.'),
  'tcp/2049': P('NFS', 'infra', 'NFS server.'),
  'tcp/2375': P('Docker API (no TLS)', 'admin', 'Docker Engine API without TLS. Anyone who reaches it controls the host as root.', 'Use the unix socket, or TLS on 2376 with client certificates.'),
  'tcp/2376': P('Docker API (TLS)', 'admin', 'Docker Engine API over TLS. Only safe with client certificate verification.'),
  'tcp/2379': P('etcd', 'database', 'etcd client API (Kubernetes state).', LOCAL_ONLY),
  'tcp/3000': P('dev server / Grafana', 'dev', 'Node, Next.js or Rails dev server by default; Grafana and Open WebUI also use 3000.'),
  'tcp/3001': P('dev server', 'dev', 'A second Node dev server, or Uptime Kuma.'),
  'tcp/3111': P('Next.js dev (custom port)', 'dev', 'A dev server started with an explicit port.'),
  'tcp/3306': P('MySQL / MariaDB', 'database', 'MySQL or MariaDB server.', 'Set bind-address = 127.0.0.1 in the [mysqld] section.'),
  'tcp/3389': P('RDP', 'desktop', 'Remote desktop (xrdp, gnome-remote-desktop).'),
  'tcp/4000': P('dev server', 'dev', 'Phoenix, Jekyll or another dev server.'),
  'tcp/4200': P('Angular dev', 'dev', 'Angular CLI dev server (ng serve).'),
  'tcp/5000': P('Flask / registry', 'dev', 'Flask dev server, or a Docker registry.'),
  'tcp/5173': P('Vite dev', 'dev', 'Vite dev server. Only listens on the network with --host.'),
  'udp/5353': P('mDNS', 'desktop', 'Multicast DNS / Bonjour (avahi-daemon, browsers, Electron and Node apps).'),
  'tcp/5355': P('LLMNR', 'infra', 'systemd-resolved Link-Local Multicast Name Resolution responder.'),
  'udp/5355': P('LLMNR', 'infra', 'systemd-resolved Link-Local Multicast Name Resolution responder.'),
  'tcp/5432': P('PostgreSQL', 'database', 'PostgreSQL server, often a local dev database container.', "Set listen_addresses = 'localhost', or publish the container as -p 127.0.0.1:5432:5432."),
  'tcp/5672': P('RabbitMQ', 'infra', 'RabbitMQ AMQP listener.'),
  'tcp/5900': P('VNC', 'desktop', 'VNC server. Many VNC setups use weak or no passwords.', 'Tunnel it over SSH and bind to 127.0.0.1.'),
  'tcp/5984': P('CouchDB', 'database', 'CouchDB HTTP API.', LOCAL_ONLY),
  'tcp/6379': P('Redis', 'cache', 'Redis. Without requirepass, anyone who reaches it can read and write every key.', 'Keep "bind 127.0.0.1 -::1" and protected-mode yes.'),
  'tcp/6443': P('Kubernetes API', 'admin', 'Kubernetes API server.'),
  'tcp/8000': P('dev server', 'dev', 'Django, uvicorn or python3 -m http.server.'),
  'tcp/8080': P('HTTP alt / proxy', 'dev', 'Dev server, Jenkins, Tomcat or a proxy.'),
  'tcp/8086': P('InfluxDB', 'database', 'InfluxDB HTTP API.', LOCAL_ONLY),
  'tcp/8384': P('Syncthing GUI', 'desktop', 'Syncthing web GUI. Default is 127.0.0.1.'),
  'tcp/8443': P('HTTPS alt', 'infra', 'Alternate HTTPS (UniFi, Kubernetes dashboard, proxies).'),
  'tcp/8888': P('Jupyter / dev', 'dev', 'Jupyter Notebook or a dev proxy. Jupyter runs code for whoever holds the token.'),
  'tcp/9000': P('PHP-FPM / MinIO', 'infra', 'Named cslistener in /etc/services; on Linux it is usually PHP-FPM, MinIO or Portainer.'),
  'tcp/9050': P('Tor SOCKS', 'proxy', 'Tor client SOCKS proxy.'),
  'tcp/9051': P('Tor control', 'proxy', 'Tor control port.'),
  'tcp/9090': P('Prometheus / Cockpit', 'admin', 'Prometheus server or the Cockpit web console.'),
  'tcp/9100': P('node_exporter', 'admin', 'Prometheus node_exporter metrics.'),
  'tcp/9200': P('Elasticsearch', 'database', 'Elasticsearch HTTP API.', 'Set network.host: 127.0.0.1 in elasticsearch.yml.'),
  'tcp/9300': P('Elasticsearch transport', 'database', 'Elasticsearch node-to-node transport.'),
  'tcp/10250': P('kubelet', 'admin', 'Kubernetes kubelet API.'),
  'tcp/11211': P('memcached', 'cache', 'memcached. Has no authentication by default.', 'Run it with -l 127.0.0.1.'),
  'udp/11211': P('memcached UDP', 'cache', 'memcached over UDP, a known DDoS amplifier.', 'Disable UDP with -U 0.'),
  'tcp/11434': P('Ollama', 'dev', 'Ollama API. Default is 127.0.0.1 unless OLLAMA_HOST says otherwise.'),
  'tcp/25565': P('Minecraft', 'other', 'Minecraft Java server.'),
  'tcp/26257': P('CockroachDB', 'database', 'CockroachDB SQL port.', LOCAL_ONLY),
  'tcp/27017': P('MongoDB', 'database', 'MongoDB server.', 'Set net.bindIp: 127.0.0.1 in mongod.conf.'),
  'tcp/33060': P('MySQL X', 'database', 'MySQL X Protocol.', 'Set mysqlx-bind-address = 127.0.0.1.'),
  'udp/41641': P('Tailscale', 'vpn', 'Tailscale WireGuard transport.'),
  'udp/51820': P('WireGuard', 'vpn', 'WireGuard interface listen port.'),
};

// Service names seen when ss / lsof run without -n. Subset of /etc/services.
const SERVICE_NAMES: Record<string, number> = {
  ftp: 21, ssh: 22, telnet: 23, smtp: 25, domain: 53, bootps: 67, bootpc: 68, http: 80, sunrpc: 111,
  ntp: 123, 'netbios-ns': 137, 'netbios-dgm': 138, 'netbios-ssn': 139, https: 443, 'microsoft-ds': 445,
  isakmp: 500, 'dhcpv6-client': 546, 'dhcpv6-server': 547, ipp: 631, rsync: 873, socks: 1080,
  openvpn: 1194, nfs: 2049, mysql: 3306, 'ms-wbt-server': 3389, postgresql: 5432, mdns: 5353,
  llmnr: 5355, amqp: 5672, 'x11': 6000, redis: 6379, 'http-alt': 8080, webcache: 8080,
  cslistener: 9000, mongodb: 27017, memcache: 11211,
};

export function portInfo(proto: Proto, port: number | null): PortInfo | undefined {
  if (port === null) return undefined;
  return PORTS[`${proto}/${port}`];
}

// ── Address helpers ─────────────────────────────────────────────────────────────────────
const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function v4Octets(a: string): number[] | null {
  const m = IPV4.exec(a);
  return m ? m.slice(1).map(Number) : null;
}

export function classifyScope(address: string, family: Family, iface?: string, v6only?: 0 | 1): Scope {
  if (address === '*') return v6only === 1 ? 'wildcard6' : 'wildcardAll';
  if (iface === 'lo') return 'loopback';
  let a = address.toLowerCase();
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(a);
  if (mapped) a = mapped[1];
  const o = v4Octets(a);
  if (o) {
    if (o[0] === 127) return 'loopback';
    if (a === '0.0.0.0') return 'wildcard4';
    if (o[0] >= 224 && o[0] <= 239) return 'multicast';
    if (o[0] === 10 || (o[0] === 172 && o[1] >= 16 && o[1] <= 31) || (o[0] === 192 && o[1] === 168)) return 'private';
    if (o[0] === 100 && o[1] >= 64 && o[1] <= 127) return 'private';
    if (o[0] === 169 && o[1] === 254) return 'linklocal';
    return 'public';
  }
  if (a.includes(':')) {
    if (a === '::') return v6only === 1 ? 'wildcard6' : v6only === 0 ? 'wildcardAll' : 'wildcard6Unknown';
    if (a === '::1') return 'loopback';
    if (/^fe[89ab]/.test(a)) return 'linklocal';
    if (a.startsWith('ff')) return 'multicast';
    if (/^f[cd]/.test(a)) return 'private';
    return 'public';
  }
  if (a === 'localhost' || a === 'ip6-localhost') return 'loopback';
  return family === 'any' ? 'wildcardAll' : 'named';
}

export const NETWORK_SCOPES: Scope[] = ['wildcard4', 'wildcard6', 'wildcardAll', 'wildcard6Unknown', 'linklocal', 'private', 'public', 'named'];
const WILDCARD_SCOPES: Scope[] = ['wildcard4', 'wildcard6', 'wildcardAll', 'wildcard6Unknown'];

export const SCOPE_LABEL: Record<Scope, string> = {
  loopback: 'Loopback only: this machine',
  wildcard4: 'All IPv4 interfaces',
  wildcard6: 'All IPv6 interfaces',
  wildcardAll: 'All interfaces, IPv4 and IPv6',
  wildcard6Unknown: 'All IPv6 interfaces (IPv4 too unless v6only)',
  linklocal: 'Link-local on one interface (same network segment only)',
  multicast: 'Multicast group membership (not a listener you can connect to)',
  private: 'One private interface',
  public: 'One public interface',
  named: 'One address, given by name (re-run with -n)',
};

// Split "addr:port" at the LAST colon. Handles [v6]:p, [v6]%if:p, v4%if:p, *:p, bare netstat v6.
function splitAddress(token: string): { address: string; iface?: string; port: string } | null {
  let m = /^\[([^\]]+)\](?:%([^:]+))?:([^:]+)$/.exec(token);
  if (m) {
    const [addr, innerIface] = m[1].split('%');
    return { address: addr, iface: m[2] ?? innerIface, port: m[3] };
  }
  const i = token.lastIndexOf(':');
  if (i <= 0 && !token.startsWith(':')) return null;
  const left = token.slice(0, i);
  const port = token.slice(i + 1);
  if (!port) return null;
  m = /^(.*?)%([^%]+)$/.exec(left);
  const address = m ? m[1] : left;
  const iface = m ? m[2] : undefined;
  if (!address) return null;
  return { address, iface, port };
}

function toPort(raw: string): { port: number | null; portName?: string } {
  if (/^\d+$/.test(raw)) return { port: Number(raw) };
  const n = SERVICE_NAMES[raw.toLowerCase()];
  return { port: n ?? null, portName: raw };
}

function familyOf(address: string): Family {
  if (address === '*') return 'any';
  return address.includes(':') ? 'ipv6' : 'ipv4';
}

// ── Format detection ────────────────────────────────────────────────────────────────────
const SS_STATES = /^(LISTEN|UNCONN|ESTAB|SYN-SENT|SYN-RECV|FIN-WAIT-1|FIN-WAIT-2|TIME-WAIT|CLOSE-WAIT|LAST-ACK|CLOSING|CLOSED)$/;
const SS_ROW = /^(?:\S+\s+)?(LISTEN|UNCONN|ESTAB|SYN-SENT|SYN-RECV|FIN-WAIT-1|FIN-WAIT-2|TIME-WAIT|CLOSE-WAIT|LAST-ACK|CLOSING)\s+\d+\s+\d+\s+\S+:\S+\s+\S+/;

export function detectFormat(lines: string[]): Format {
  const body = lines.filter((l) => l.trim() !== '');
  if (body.length === 0) return 'empty';
  for (const l of body) {
    const t = l.trim();
    if (/^Netid\s+State\s/.test(t)) return 'ss-netid';
    if (/^State\s+Recv-Q\s+Send-Q\s/.test(t)) return 'ss-state';
    if (/^Proto\s+Recv-Q\s+Send-Q\s+Local Address/.test(t) || /^Active Internet connections/.test(t)) return 'netstat';
    if (/^COMMAND\s+PID\s+USER\s+FD\s+TYPE/.test(t)) return 'lsof';
    if (/^Proto\s+Local Address\s+Foreign Address\s+State/.test(t)) return 'windows';
    if (/^(TCP|UDP)\s+(\d+\.\d+\.\d+\.\d+|\[[^\]]*\]):\d+\s+\S+/.test(t)) return 'windows';
  }
  if (body.some((l) => SS_ROW.test(l.trim()))) return 'ss-headerless';
  return 'unknown';
}

// ── Row parsers ─────────────────────────────────────────────────────────────────────────
interface RawSocket extends Omit<Socket, 'fds' | 'scope'> {
  hasOwnerField: boolean;
}

type RowResult = { kind: 'listener'; s: RawSocket } | { kind: 'connection'; text: string } | { kind: 'ignored' } | null;

const TUPLE = /\("((?:[^"\\]|\\.)*)",pid=(\d+),fd=(\d+)\)/g;

function lastSegmentUnit(path: string): { unit: string; parent?: string } {
  const segs = path.split('/').filter(Boolean);
  for (let i = segs.length - 1; i >= 0; i--) {
    if (/\.(service|scope)$/.test(segs[i])) {
      const unit = segs[i];
      // a bare "tab(6544).scope" means nothing without the app scope above it
      const parent = /^tab\(/.test(unit) && i > 0 ? segs[i - 1] : undefined;
      return { unit, parent };
    }
  }
  return { unit: segs[segs.length - 1] ?? path };
}

function parseSsRow(line: string, withNetid: boolean | 'auto'): RowResult {
  const tokens: { t: string; end: number }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) && tokens.length < 6) tokens.push({ t: m[0], end: m.index + m[0].length });
  if (tokens.length < 5) return null;
  let i = 0;
  let netid = '';
  const hasNetid = withNetid === 'auto' ? !SS_STATES.test(tokens[0].t) : withNetid;
  if (hasNetid) {
    netid = tokens[0].t;
    i = 1;
  }
  if (tokens.length < i + 5) return null;
  const state = tokens[i].t;
  if (!SS_STATES.test(state)) return null;
  if (netid && !/^(tcp|udp|tcp6|udp6)$/.test(netid)) return { kind: 'ignored' };
  const recvQ = Number(tokens[i + 1].t);
  const sendQ = Number(tokens[i + 2].t);
  if (Number.isNaN(recvQ) || Number.isNaN(sendQ)) return null;
  const local = tokens[i + 3].t;
  const peer = tokens[i + 4].t;
  const rest = line.slice(tokens[i + 4].end);

  if (state !== 'LISTEN' && state !== 'UNCONN') {
    return { kind: 'connection', text: `${netid || 'tcp'} ${local} → ${peer} ${state}` };
  }
  const split = splitAddress(local);
  if (!split) return null;

  const procs: Proc[] = [];
  let lastEnd = -1;
  TUPLE.lastIndex = 0;
  while ((m = TUPLE.exec(rest))) {
    procs.push({ name: m[1], pid: Number(m[2]) });
    lastEnd = m.index + m[0].length;
  }
  const ext = lastEnd >= 0 ? rest.slice(lastEnd + 1) : rest.replace(/users:\(\(.*?\)\)/, '');
  let uid: string | undefined;
  let unit: string | undefined;
  let unitParent: string | undefined;
  let v6only: 0 | 1 | undefined;
  for (const kv of ext.split(/\s+/)) {
    const k = /^([a-z0-9_]+):(.+)$/i.exec(kv);
    if (!k) continue;
    if (k[1] === 'uid') uid = k[2];
    else if (k[1] === 'cgroup') ({ unit, parent: unitParent } = lastSegmentUnit(k[2]));
    else if (k[1] === 'v6only') v6only = k[2] === '1' ? 1 : 0;
  }
  const proto: Proto = netid.startsWith('udp') || (!netid && state === 'UNCONN') ? 'udp' : 'tcp';
  const { port, portName } = toPort(split.port);
  return {
    kind: 'listener',
    s: {
      proto,
      family: familyOf(split.address),
      address: split.address,
      iface: split.iface,
      port,
      portName,
      state: state as 'LISTEN' | 'UNCONN',
      recvQ,
      sendQ,
      procs,
      uid,
      unit,
      unitParent,
      v6only,
      hasOwnerField: procs.length > 0 || !!unit || !!uid,
    },
  };
}

function parseNetstatRow(line: string): RowResult {
  const t = line.trim().split(/\s+/);
  if (t.length < 5 || !/^(tcp|udp|tcp6|udp6|raw|raw6)$/.test(t[0])) return null;
  if (t[0].startsWith('raw')) return { kind: 'ignored' };
  const proto: Proto = t[0].startsWith('udp') ? 'udp' : 'tcp';
  const recvQ = Number(t[1]);
  const sendQ = Number(t[2]);
  if (Number.isNaN(recvQ) || Number.isNaN(sendQ)) return null;
  let state = '';
  let idx = 5;
  if (t[5] && /^[A-Z][A-Z0-9_]+$/.test(t[5])) {
    state = t[5];
    idx = 6;
  }
  const pidProg = t.slice(idx).join(' ');
  if (proto === 'tcp' && state !== 'LISTEN') {
    return { kind: 'connection', text: `${t[0]} ${t[3]} → ${t[4]} ${state || '?'}` };
  }
  if (proto === 'udp' && state && state !== 'CLOSE') {
    return { kind: 'connection', text: `${t[0]} ${t[3]} → ${t[4]} ${state}` };
  }
  const split = splitAddress(t[3]);
  if (!split) return null;
  const procs: Proc[] = [];
  const pm = /^(\d+)\/(\S+)/.exec(pidProg);
  if (pm) procs.push({ name: pm[2], pid: Number(pm[1]) });
  const { port, portName } = toPort(split.port);
  const address = t[0].endsWith('6') && split.address === '' ? '::' : split.address;
  return {
    kind: 'listener',
    s: {
      proto,
      family: t[0].endsWith('6') ? 'ipv6' : familyOf(address),
      address,
      iface: split.iface,
      port,
      portName,
      state: proto === 'tcp' ? 'LISTEN' : 'UNCONN',
      recvQ,
      sendQ,
      procs,
      hasOwnerField: procs.length > 0,
    },
  };
}

function parseLsofRow(line: string): RowResult {
  const t = line.trim().split(/\s+/);
  if (t.length < 8) return null;
  const typeIdx = t.findIndex((x, i) => i >= 3 && /^IPv[46]$/.test(x));
  if (typeIdx < 0) return null;
  const nodeIdx = t.findIndex((x, i) => i > typeIdx && /^(TCP|UDP)$/.test(x));
  if (nodeIdx < 0 || !t[nodeIdx + 1]) return null;
  const proto: Proto = t[nodeIdx] === 'UDP' ? 'udp' : 'tcp';
  const name = t[nodeIdx + 1];
  const stateTok = t[nodeIdx + 2];
  const pid = Number(t[1]);
  if (name.includes('->')) return { kind: 'connection', text: `${proto} ${name.replace('->', ' → ')} ${stateTok ?? ''}`.trim() };
  if (proto === 'tcp' && stateTok !== '(LISTEN)') return { kind: 'connection', text: `${proto} ${name} ${stateTok ?? ''}`.trim() };
  const split = splitAddress(name);
  if (!split) return null;
  const v6 = t[typeIdx] === 'IPv6';
  let address = split.address;
  if (address === '*') address = v6 ? '::' : '0.0.0.0';
  const { port, portName } = toPort(split.port);
  return {
    kind: 'listener',
    s: {
      proto,
      family: v6 ? 'ipv6' : 'ipv4',
      address,
      iface: split.iface,
      port,
      portName,
      state: proto === 'tcp' ? 'LISTEN' : 'UNCONN',
      recvQ: 0,
      sendQ: 0,
      procs: [{ name: t[0], pid: Number.isNaN(pid) ? undefined : pid }],
      uid: t[2],
      hasOwnerField: true,
    },
  };
}

// ── Main parse ──────────────────────────────────────────────────────────────────────────
function isSkippable(t: string): boolean {
  return (
    /^[$#]\s/.test(t) || // pasted prompt line
    /^Netid\s+State/.test(t) ||
    /^State\s+Recv-Q/.test(t) ||
    /^Proto\s+Recv-Q/.test(t) ||
    /^COMMAND\s+PID/.test(t) ||
    /^Active Internet connections/.test(t)
  );
}

export function parseListing(text: string): ParseResult {
  const lines = text.replace(/\r/g, '').split('\n').slice(0, MAX_LINES);
  const format = detectFormat(lines);
  const res: ParseResult = {
    format,
    nonRoot: false,
    noProcessColumn: false,
    portsByName: false,
    truncatedNames: false,
    netstatV6: false,
    hostnames: false,
    dataRows: 0,
    sockets: [],
    connections: [],
    unparsed: [],
    ignored: 0,
  };
  if (format === 'empty' || format === 'unknown' || format === 'windows') return res;

  const raw: RawSocket[] = [];
  let inUnixSection = false;
  lines.forEach((line, n) => {
    const t = line.trimEnd();
    const trimmed = t.trim();
    if (trimmed === '') return;
    if (format === 'netstat') {
      if (/^\(Not all processes could be identified/.test(trimmed)) {
        res.nonRoot = true;
        return;
      }
      if (/will not be shown, you would have to be root/.test(trimmed)) return;
      if (/^Active UNIX domain sockets/.test(trimmed)) inUnixSection = true;
      if (inUnixSection) {
        res.ignored++;
        return;
      }
    }
    if (isSkippable(trimmed)) return;
    let r: RowResult;
    if (format === 'netstat') r = parseNetstatRow(t);
    else if (format === 'lsof') r = parseLsofRow(t);
    else r = parseSsRow(trimmed, format === 'ss-netid' ? true : format === 'ss-state' ? false : 'auto');
    if (r === null) {
      res.unparsed.push({ line: n + 1, text: trimmed.slice(0, 200) });
      return;
    }
    res.dataRows++;
    if (r.kind === 'ignored') res.ignored++;
    else if (r.kind === 'connection') res.connections.push(r.text);
    else raw.push(r.s);
  });

  // Owner visibility: which of the three situations produced this listing
  const withOwner = raw.filter((s) => s.hasOwnerField).length;
  if (format !== 'netstat' && format !== 'lsof') {
    if (raw.length > 0 && withOwner === 0) res.noProcessColumn = true;
    else if (withOwner < raw.length) res.nonRoot = true;
  } else if (format === 'netstat') {
    if (!lines.some((l) => /PID\/Program name/.test(l))) res.noProcessColumn = true;
  }

  // Merge sockets that are the same listener on several fds (§4.4)
  const merged = new Map<string, Socket>();
  for (const s of raw) {
    const key = `${s.proto}|${s.address}|${s.iface ?? ''}|${s.port ?? s.portName}`;
    const prev = merged.get(key);
    if (prev) {
      prev.fds++;
      prev.recvQ = Math.max(prev.recvQ, s.recvQ);
      for (const p of s.procs) {
        if (!prev.procs.some((q) => q.name === p.name && q.pid === p.pid)) prev.procs.push(p);
      }
      prev.unit = prev.unit ?? s.unit;
      prev.uid = prev.uid ?? s.uid;
      continue;
    }
    const { hasOwnerField: _unused, ...rest } = s;
    void _unused;
    merged.set(key, { ...rest, fds: 1, scope: classifyScope(s.address, s.family, s.iface, s.v6only) });
  }
  res.sockets = [...merged.values()];

  res.portsByName = res.sockets.some((s) => s.portName !== undefined);
  res.hostnames = format === 'lsof' && res.sockets.some((s) => s.scope === 'named');
  res.netstatV6 = format === 'netstat' && res.sockets.some((s) => s.address === '::');
  const limit = format === 'lsof' ? 9 : format === 'netstat' ? 14 : 15;
  res.truncatedNames = res.sockets.some((s) => s.procs.some((p) => p.name.length >= limit));
  return res;
}

// ── Cards and verdicts ──────────────────────────────────────────────────────────────────
export interface Flag {
  id: string;
  severity: Severity;
  text: string;
  command?: string;
  link?: { href: string; label: string };
}

export interface Card {
  id: string;
  proto: Proto;
  port: number | null;
  portLabel: string;
  sockets: Socket[];
  scope: Scope;
  owner: string | null;
  info?: PortInfo;
  flags: Flag[];
  command: string;
  severity: Severity | null; // highest of critical / warn / info / ok, or null
}

export function ownerLabel(s: Socket): string | null {
  if (s.procs.length > 0) return [...new Set(s.procs.map((p) => p.name))].join(', ');
  if (s.unit) return s.unitParent ? `${s.unitParent} › ${s.unit}` : s.unit;
  if (s.uid) return `uid:${s.uid}`;
  return null;
}

const SEV_RANK: Record<Severity, number> = { critical: 0, warn: 1, info: 2, ok: 3, note: 4 };
const DB_PORTS = new Set([5432, 3306, 33060, 27017, 6379, 11211, 9200, 9300, 5984, 8086, 26257, 1433, 2379]);
const DEV_PORTS = new Set([3000, 3001, 4000, 4200, 5000, 5173, 8000, 8080, 8888, 3111]);
const DEV_OWNER = /node|next-server|vite|python3?|http\.server|flask|uvicorn|gunicorn|ruby|rails|php/i;

const LINK_BIND = { href: '/snippets/port-listening-but-connection-refused', label: 'Bind address fix' };
const LINK_DOCKER = { href: '/guides/open-ports-linux#containers-what-docker-proxy-hides', label: 'What docker-proxy hides' };
const LINK_NOROOT = { href: '/guides/open-ports-linux#without-root', label: 'Owners without root' };

function portFilter(port: number | null): string {
  return port === null ? '' : ` 'sport = :${port}'`;
}

// Pair IPv4/IPv6 twins with the same port and owner: 0.0.0.0 + [::], 127.0.0.1 + [::1].
function pairKey(s: Socket): string | null {
  const own = ownerLabel(s) ?? '';
  if (s.address === '0.0.0.0' || (s.address === '::' && s.family === 'ipv6')) return `${s.proto}|${s.port}|${own}|wild`;
  if (s.address === '127.0.0.1' || s.address === '::1') return `${s.proto}|${s.port}|${own}|lo`;
  return null;
}

function cardScope(sockets: Socket[]): Scope {
  if (sockets.length === 2) {
    const scopes = sockets.map((s) => s.scope);
    if (scopes.includes('wildcard4')) {
      const v6 = scopes.find((x) => x !== 'wildcard4');
      // with v6only:1 the pair together covers both families
      return v6 === 'wildcard6' || v6 === 'wildcardAll' || v6 === 'wildcard6Unknown' ? 'wildcardAll' : 'wildcard4';
    }
  }
  return sockets[0].scope;
}

export function buildCards(sockets: Socket[]): Card[] {
  const groups: Socket[][] = [];
  const byPair = new Map<string, Socket[]>();
  for (const s of sockets) {
    const k = pairKey(s);
    if (k) {
      const g = byPair.get(k);
      if (g && g.length === 1 && g[0].family !== s.family) {
        g.push(s);
        continue;
      }
      if (!g) {
        const ng = [s];
        byPair.set(k, ng);
        groups.push(ng);
        continue;
      }
    }
    groups.push([s]);
  }

  const cards = groups.map((g, i): Card => {
    const first = g[0];
    const scope = cardScope(g);
    const owner = ownerLabel(first);
    const port = first.port;
    const proto = first.proto;
    const info = portInfo(proto, port);
    const flags: Flag[] = [];
    const wildcard = WILDCARD_SCOPES.includes(scope);
    const exposed = wildcard || scope === 'public' || scope === 'named';
    const units = g.map((s) => s.unit ?? '');
    const isDocker =
      g.some((s) => s.procs.some((p) => p.name === 'docker-proxy')) ||
      units.some((u) => u === 'docker.service' || u === 'containerd.service');
    const filter = portFilter(port);
    const listFlag = proto === 'udp' ? '-lunp' : '-ltnp';

    if (port !== null && exposed && (DB_PORTS.has(port) || info?.kind === 'database' || info?.kind === 'cache')) {
      flags.push({
        id: 'DB_WILDCARD',
        severity: 'critical',
        text: 'A database or cache is listening on every interface. Anyone on your network can try to log in to it.',
        command: `ss -ltnpe${filter}`,
        link: LINK_BIND,
      });
    }
    if ((port === 2375 || port === 2376) && scope !== 'loopback') {
      flags.push({
        id: 'DOCKER_API',
        severity: 'critical',
        text: "Docker's API on the network is root on this host for anyone who reaches it.",
        command: `sudo ss -ltnp${filter}`,
        link: LINK_DOCKER,
      });
    }
    if (isDocker && wildcard) {
      flags.push({
        id: 'DOCKER_PUBLISH',
        severity: 'warn',
        text: "A published container port. Docker's own iptables rules route this traffic to the container before ufw's rules see it (Docker's documentation covers this under Docker and ufw). Publish it as -p 127.0.0.1:HOST:CONTAINER if it only needs local access.",
        command: "docker ps --format '{{.Names}}\\t{{.Ports}}'",
        link: LINK_DOCKER,
      });
    }
    if (port === 22 && wildcard) {
      flags.push({
        id: 'SSH_WILDCARD',
        severity: 'info',
        text: 'SSH on every interface is normal for a server. Keys only, no passwords.',
        command: "sudo sshd -T | grep -Ei 'passwordauthentication|permitrootlogin'",
        link: { href: '/snippets/ssh-key-setup-script', label: 'SSH key setup' },
      });
    }
    const devOwner = owner !== null && DEV_OWNER.test(owner);
    if (proto === 'tcp' && wildcard && port !== null && (DEV_PORTS.has(port) || devOwner) && !flags.some((f) => f.id === 'DB_WILDCARD')) {
      flags.push({
        id: 'DEV_SERVER_WILDCARD',
        severity: 'warn',
        text: 'A development server reachable from your network. Dev servers are not built to face other machines.',
        command: `ss ${listFlag}${filter}`,
        link: LINK_BIND,
      });
    }
    if (proto === 'tcp' && g.some((s) => s.state === 'LISTEN' && s.sendQ > 0 && s.recvQ >= s.sendQ)) {
      flags.push({
        id: 'BACKLOG_FULL',
        severity: 'warn',
        text: 'The accept queue is full: the service is running but not accepting connections (hung, or overloaded). Run the command twice, 5 s apart; a full queue both times is not a spike.',
        command: `ss -ltn${filter}`,
        link: { href: '/guides/diagnose-a-hung-process', label: 'Diagnose a hung process' },
      });
    }
    if (port === 53 && g.every((s) => s.address === '127.0.0.53' || s.address === '127.0.0.54')) {
      flags.push({ id: 'RESOLVED_STUB', severity: 'ok', text: "systemd-resolved's local DNS stub.", command: 'resolvectl status' });
    } else if (scope === 'loopback') {
      flags.push({
        id: 'LOOPBACK_ONLY',
        severity: 'ok',
        text: 'Only this machine can connect. If another machine gets "Connection refused", this is why.',
        command: port !== null ? `./check-bind-address.sh ${port}` : undefined,
        link: LINK_BIND,
      });
    }
    if (port === 5355) {
      flags.push({
        id: 'LLMNR',
        severity: 'info',
        text: "systemd-resolved's LLMNR responder. Disable it with LLMNR=no in a drop-in under /etc/systemd/resolved.conf.d/.",
        command: 'resolvectl status | grep -i llmnr',
      });
    }
    if (port === 5353) {
      flags.push({
        id: 'MDNS',
        severity: 'info',
        text: 'mDNS / Bonjour (avahi, browsers, Electron and Node apps). Multicast rows are memberships, not listeners.',
        command: "ss -lunp 'sport = :5353'",
      });
    }
    if (port !== null && scope === 'loopback' && port >= 32768 && port <= 60999) {
      flags.push({
        id: 'EPHEMERAL',
        severity: 'note',
        text: "In the ephemeral range: usually a helper's control port chosen at startup.",
        command: `ss -ltnpe${filter}`,
      });
    }
    if (g.length === 2) flags.push({ id: 'V6_SPLIT', severity: 'note', text: 'Two sockets, one per address family. Either can close without the other.' });
    if (proto === 'udp') flags.push({ id: 'UDP_UNCONN', severity: 'note', text: 'UNCONN is the normal state of a bound UDP socket.' });
    if (g.some((s) => s.address === '::' && s.v6only === undefined) && g.length === 1) {
      flags.push({ id: 'V6ONLY_UNKNOWN', severity: 'note', text: 'This output does not show v6only, so whether IPv4 also reaches this socket is unknown. ss -ltne shows it.' });
    }
    if (owner === null && NETWORK_SCOPES.includes(scope)) {
      flags.push({
        id: 'NO_OWNER',
        severity: 'info',
        text: 'No owner shown. Run ss -ltnpe to see the systemd unit, which also tells you whether this is a container.',
        command: `ss -ltnpe${filter}`,
        link: LINK_NOROOT,
      });
    }

    flags.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);
    const top = flags.find((f) => f.severity !== 'note');
    const command =
      flags.find((f) => f.command && f.severity !== 'note')?.command ??
      flags.find((f) => f.command)?.command ??
      (owner === null ? `ss -ltnpe${filter}` : `ss ${listFlag}${filter}`);
    return {
      id: `c${i}`,
      proto,
      port,
      portLabel: port !== null ? String(port) : first.portName ?? '?',
      sockets: g,
      scope,
      owner,
      info,
      flags,
      command,
      severity: top ? top.severity : null,
    };
  });

  cards.sort((a, b) => {
    const ra = a.severity ? SEV_RANK[a.severity] : 5;
    const rb = b.severity ? SEV_RANK[b.severity] : 5;
    if (ra !== rb) return ra - rb;
    return (a.port ?? 99999) - (b.port ?? 99999) || a.proto.localeCompare(b.proto);
  });
  return cards;
}

export function isFlagged(c: Card): boolean {
  return c.severity === 'critical' || c.severity === 'warn';
}

export function isNetwork(c: Card): boolean {
  return NETWORK_SCOPES.includes(c.scope);
}

// ── Display, redaction, baseline, share ─────────────────────────────────────────────────
// Masks addresses that could identify a machine or network. Loopback, wildcard and
// multicast carry the verdict and identify nothing, so they stay visible.
export function maskAddress(s: Socket, redact: boolean): string {
  let a = s.address;
  if (/(^|\.)x(\.|$)|redacted/.test(a)) return a; // already masked (a row loaded from a share link)
  if (redact) {
    if (s.scope === 'private' || s.scope === 'public') {
      const o = v4Octets(a);
      if (o) a = s.scope === 'private' ? `${o[0]}.x.x.x` : 'x.x.x.x';
      else a = s.scope === 'private' ? 'fdxx::(redacted)' : '(redacted IPv6)';
    } else if (s.scope === 'linklocal') {
      a = a.includes(':') ? 'fe80::(redacted)' : '169.254.x.x';
    } else if (s.scope === 'named') {
      a = '(redacted host)';
    }
  }
  return a;
}

export function displayAddress(s: Socket, redact: boolean): string {
  const a = maskAddress(s, redact);
  const withIface = s.iface ? `%${s.iface}` : '';
  const port = s.port !== null ? String(s.port) : s.portName ?? '?';
  if (a.includes(':')) return `[${a}]${withIface}:${port}`;
  return `${a}${withIface}:${port}`;
}

// Same shape as ports-audit.sh: proto,address,port,service,owner, sorted by proto, port, address, owner.
export function baselineCsv(sockets: Socket[]): string {
  const rows = sockets.map((s) => {
    const addr = s.address.includes(':') ? `[${s.address}]` : s.address;
    const a = s.iface ? `${addr}%${s.iface}` : addr;
    const svc = portInfo(s.proto, s.port)?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? 'unknown';
    const owner = s.procs[0]?.name ?? (s.unit ? `cgroup:${s.unit}` : s.uid ? `uid:${s.uid}` : '?');
    return { proto: s.proto, a, port: s.port ?? 0, line: `${s.proto},${a},${s.port ?? s.portName},${svc},${owner}` };
  });
  const cmp = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0); // byte order, like LC_ALL=C
  rows.sort((x, y) => cmp(x.proto, y.proto) || x.port - y.port || cmp(x.a, y.a) || cmp(x.line, y.line));
  return [...new Set(rows.map((r) => r.line))].join('\n') + '\n';
}

export interface SharePayload {
  f: Format;
  n: boolean; // nonRoot
  p: boolean; // noProcessColumn
  s: Socket[];
}

function b64urlEncode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(text: string): string {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export const SHARE_MAX = 6000;

// Only the normalised rows go in the hash, never the raw paste. With redaction on, the
// masked address replaces the real one before encoding; pids are dropped either way.
export function encodeShare(res: ParseResult, redact: boolean): string | null {
  const s = res.sockets.map((x) => ({
    ...x,
    address: maskAddress(x, redact),
    procs: x.procs.map((p) => ({ name: p.name })),
  }));
  const payload: SharePayload = { f: res.format, n: res.nonRoot, p: res.noProcessColumn, s };
  const out = `v1=${b64urlEncode(JSON.stringify(payload))}`;
  return out.length > SHARE_MAX ? null : out;
}

export function decodeShare(hash: string): SharePayload | null {
  const m = /^#?v1=([A-Za-z0-9_-]+)$/.exec(hash);
  if (!m) return null;
  try {
    const p = JSON.parse(b64urlDecode(m[1])) as SharePayload;
    if (!Array.isArray(p.s)) return null;
    return p;
  } catch {
    return null;
  }
}

export const FORMAT_LABEL: Record<Format, string> = {
  empty: '',
  'ss-netid': 'ss -tulpn',
  'ss-state': 'ss -ltnp',
  'ss-headerless': 'ss -H',
  netstat: 'netstat -tulpn',
  lsof: 'lsof -i',
  windows: 'Windows netstat',
  unknown: 'unrecognised',
};
