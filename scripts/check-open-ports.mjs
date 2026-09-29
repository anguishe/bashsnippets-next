// Parser checks for the Open Ports Explainer against the fixtures in scripts/fixtures/open-ports/.
// Usage: node scripts/check-open-ports.mjs   (no test runner in this repo; exits 1 on the first failure)
// f1–f6 are real runs (spec §12) with identifying rows removed; n1–n5 are hand-made negatives.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseListing,
  buildCards,
  isNetwork,
  isFlagged,
  displayAddress,
  encodeShare,
  decodeShare,
  baselineCsv,
} from '../src/components/tools/shared/portData.ts';
import { EXAMPLE_LISTING } from '../src/components/tools/shared/openPortsExample.ts';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'open-ports');
const load = (name) => readFileSync(join(dir, `${name}.txt`), 'utf8');
const run = (name) => {
  const res = parseListing(load(name));
  return { res, cards: buildCards(res.sockets) };
};
const cardAt = (cards, addr) => cards.find((c) => c.sockets.some((s) => displayAddress(s, false) === addr));
const flagIds = (card) => card.flags.map((f) => f.id);
const count = (cards, id) => cards.filter((c) => flagIds(c).includes(id)).length;
let checks = 0;
const check = (fn) => {
  fn();
  checks++;
};

// The example shown on the site is the f1 fixture, byte for byte.
check(() => assert.equal(EXAMPLE_LISTING, load('f1-ss-tulpn')));

// F1: ss -tulpn, not root
check(() => {
  const { res, cards } = run('f1-ss-tulpn');
  assert.equal(res.format, 'ss-netid');
  assert.equal(res.nonRoot, true);
  assert.equal(res.unparsed.length, 0);
  assert.equal(res.dataRows, 30);
  assert.equal(res.sockets.length, 23, '5 + 4 fds merged');
  assert.equal(cards.length, 18, 'IPv4/IPv6 twins paired');
  assert.equal(cards.filter(isNetwork).length, 8);
  assert.equal(count(cards, 'DB_WILDCARD'), 1);
  assert.equal(count(cards, 'DEV_SERVER_WILDCARD'), 2);
  assert.equal(count(cards, 'DOCKER_PUBLISH'), 0, 'no owner, so nothing says Docker');
  assert.equal(cards[0].port, 5432, 'critical card first');
  assert.deepEqual(flagIds(cardAt(cards, '*:3111')).slice(0, 1), ['DEV_SERVER_WILDCARD']);
  assert.ok(flagIds(cardAt(cards, '127.0.0.53%lo:53')).includes('RESOLVED_STUB'));
  assert.ok(flagIds(cardAt(cards, '0.0.0.0:5355')).includes('LLMNR'));
  assert.equal(cardAt(cards, '224.0.0.251:5353').scope, 'multicast');
  assert.equal(cardAt(cards, '224.0.0.251:5353').sockets[0].fds, 4);
  assert.equal(cardAt(cards, '[fe80::db8:1]%wlan0:546').scope, 'linklocal');
  assert.equal(cardAt(cards, '127.0.0.1:9050').info.name, 'Tor SOCKS');
  assert.equal(cardAt(cards, '127.0.0.1:18789').sockets.length, 2, 'loopback pair');
  assert.equal(res.truncatedNames, true, '"next-server (v1" is cut at 15');
});

// F2: ss -ltnpe, not root: owners from the cgroup
check(() => {
  const { res, cards } = run('f2-ss-ltnpe');
  assert.equal(res.format, 'ss-state');
  assert.equal(res.unparsed.length, 0);
  assert.equal(cards.filter((c) => c.owner === null).length, 0, 'every row has uid or cgroup');
  assert.equal(cardAt(cards, '127.0.0.53%lo:53').owner, 'systemd-resolved.service');
  assert.equal(cardAt(cards, '127.0.0.1:9050').owner, 'tor@default.service');
  const helper = cardAt(cards, '127.0.0.1:38077');
  assert.equal(helper.owner, 'containerd.service');
  assert.ok(flagIds(helper).includes('EPHEMERAL'));
  assert.equal(count(cards, 'DOCKER_PUBLISH'), 2);
  assert.ok(flagIds(cardAt(cards, '0.0.0.0:5432')).includes('DB_WILDCARD'));
  assert.equal(cardAt(cards, '[::]:3000').sockets.find((s) => s.address === '::').scope, 'wildcard6', 'v6only:1');
  assert.equal(cardAt(cards, '*:3111').scope, 'wildcardAll', 'v6only:0');
  assert.match(cardAt(cards, '*:3111').owner, /next-server/);
});

// F3: ss -tuln: no process column at all
check(() => {
  const { res, cards } = run('f3-ss-tuln');
  assert.equal(res.noProcessColumn, true);
  assert.equal(res.nonRoot, false);
  assert.equal(cards.length, 18);
  assert.equal(cards.filter((c) => c.owner !== null).length, 0);
});

// F4: netstat -tulpn, not root
check(() => {
  const { res, cards } = run('f4-netstat-tulpn');
  assert.equal(res.format, 'netstat');
  assert.equal(res.nonRoot, true, 'from the preamble');
  assert.equal(res.unparsed.length, 0);
  assert.equal(res.netstatV6, true);
  assert.equal(cards.length, 18);
  const ll = res.sockets.find((s) => s.address === 'fe80::db8:1');
  assert.ok(ll, 'fe80::db8:1:546 split at the last colon');
  assert.equal(ll.port, 546);
  assert.ok(res.sockets.some((s) => s.address === '::' && s.port === 5432), ':::5432 → [::]:5432');
  const mc = res.sockets.find((s) => s.address === '224.0.0.251');
  assert.deepEqual(mc.procs, [{ name: 'chrome', pid: 7889 }], '"7889/chrome --type=" → chrome');
});

// F5: lsof -i -P -n
check(() => {
  const { res, cards } = run('f5-lsof');
  assert.equal(res.format, 'lsof');
  assert.equal(res.unparsed.length, 0);
  assert.equal(cards.length, 5);
  assert.equal(res.connections.length, 2);
  assert.equal(cardAt(cards, '0.0.0.0:5353').sockets[0].fds, 5);
  assert.ok(!res.connections.some((c) => /LISTEN/.test(c)));
});

// F6: full accept queue
check(() => {
  const { cards } = run('f6-ss-backlog');
  assert.deepEqual(flagIds(cards[0]).slice(0, 2), ['BACKLOG_FULL', 'LOOPBACK_ONLY']);
});

// F7: sudo ss -tulpn: every row has an owner; Docker publishes to loopback only after the 9/28 fix
check(() => {
  const { res, cards } = run('f7-ss-tulpn-root');
  assert.equal(res.format, 'ss-netid');
  assert.equal(res.nonRoot, false);
  assert.equal(res.unparsed.length, 0);
  assert.equal(res.dataRows, 36);
  assert.equal(cards.length, 21);
  assert.equal(cards.filter((c) => c.owner === null).length, 0, 'root: no NO_OWNER');
  assert.equal(cardAt(cards, '127.0.0.1:3000').owner, 'docker-proxy');
  assert.equal(count(cards, 'DOCKER_PUBLISH'), 0, 'loopback publish is not a warning');
  assert.equal(count(cards, 'DEV_SERVER_WILDCARD'), 3);
  assert.equal(cards.filter(isFlagged).length, 3);
});

// F8: sudo netstat -tulpn: no preamble, names cut at the column
check(() => {
  const { res, cards } = run('f8-netstat-tulpn-root');
  assert.equal(res.format, 'netstat');
  assert.equal(res.nonRoot, false, 'no preamble as root');
  assert.equal(res.unparsed.length, 0);
  assert.equal(cards.length, 21, 'same box, same cards as F7');
  assert.equal(cards.filter((c) => c.owner === null).length, 0);
  assert.equal(cardAt(cards, '127.0.0.1:3000').owner, 'docker-prox');
  assert.equal(res.truncatedNames, true);
});

// netstat's cut name still counts as Docker (hand-made row)
check(() => {
  const listing = 'Active Internet connections (only servers)\n' +
    'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n' +
    'tcp        0      0 0.0.0.0:8095            0.0.0.0:*               LISTEN      4242/docker-prox\n';
  assert.equal(count(buildCards(parseListing(listing).sockets), 'DOCKER_PUBLISH'), 1);
});

// Negatives
check(() => assert.equal(run('n1-empty').res.format, 'empty'));
check(() => assert.equal(run('n2-ps-aux').res.format, 'unknown'));
check(() => assert.equal(run('n3-windows-netstat').res.format, 'windows'));
check(() => {
  const { res } = run('n4-truncated-line');
  assert.equal(res.sockets.length, 1);
  assert.deepEqual(res.unparsed.map((u) => u.line), [3]);
});
check(() => {
  const { res, cards } = run('n5-ss-no-n');
  assert.equal(res.portsByName, true);
  assert.ok(flagIds(cardAt(cards, '0.0.0.0:22')).includes('SSH_WILDCARD'));
});

// Redaction and the share hash: with redaction on, no non-loopback unicast address survives.
check(() => {
  const listing = 'Netid State Recv-Q Send-Q Local Address:Port Peer Address:PortProcess\n' +
    'tcp LISTEN 0 128 192.168.1.20:8080 0.0.0.0:*\n' +
    'tcp LISTEN 0 128 [2001:db8::5]:443 [::]:*\n' +
    'tcp LISTEN 0 128 203.0.113.9:22 0.0.0.0:*\n';
  const res = parseListing(listing);
  const hash = encodeShare(res, true);
  const decoded = decodeShare(`#${hash}`);
  const json = JSON.stringify(decoded);
  for (const leak of ['192.168.1.20', '2001:db8::5', '203.0.113.9']) assert.ok(!json.includes(leak), leak);
  assert.equal(decoded.s.length, 3);
  const cards = buildCards(decoded.s);
  assert.equal(cards.length, 3);
  assert.equal(cards.filter(isNetwork).length, 3, 'scope survives redaction');
  assert.equal(displayAddress(decoded.s[0], true), '192.x.x.x:8080');
  // off: the real address is kept on purpose
  assert.ok(JSON.stringify(decodeShare(`#${encodeShare(res, false)}`)).includes('192.168.1.20'));
});

// Baseline CSV: same columns and order rules as ports-audit.sh
check(() => {
  const csv = baselineCsv(run('f2-ss-ltnpe').res.sockets).trim().split('\n');
  assert.equal(csv.length, 15);
  assert.equal(csv[0], 'tcp,127.0.0.53%lo,53,dns,cgroup:systemd-resolved.service');
  assert.ok(csv.every((l) => l.split(',').length === 5));
});

// Flagged count for the example matches what the summary strip shows
check(() => assert.equal(run('f1-ss-tulpn').cards.filter(isFlagged).length, 3));

console.log(`✓ open-ports parser: ${checks} checks passed`);
