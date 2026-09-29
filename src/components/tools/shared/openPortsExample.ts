// The "Load example" listing: a real `ss -tulpn` run as a normal user, in its exact column
// layout, with identifying rows removed and generalised (a dev database container on 5432,
// documentation IPv6 addresses). Kept byte-identical to scripts/fixtures/open-ports/f1-ss-tulpn.txt;
// scripts/check-open-ports.mjs fails if the two drift.
export const EXAMPLE_LISTING = `Netid State  Recv-Q Send-Q                     Local Address:Port  Peer Address:PortProcess
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
tcp   LISTEN 0      4096                             0.0.0.0:5432       0.0.0.0:*
tcp   LISTEN 0      511                            127.0.0.1:43347      0.0.0.0:*    users:(("node",pid=1096,fd=24))
tcp   LISTEN 0      4096                       127.0.0.53%lo:53         0.0.0.0:*
tcp   LISTEN 0      4096                           127.0.0.1:9050       0.0.0.0:*
tcp   LISTEN 0      511                                [::1]:18789         [::]:*    users:(("node",pid=1096,fd=23))
tcp   LISTEN 0      4096                                [::]:5355          [::]:*
tcp   LISTEN 0      511                                    *:3111             *:*    users:(("next-server (v1",pid=154558,fd=21))
tcp   LISTEN 0      4096                                [::]:3000          [::]:*
tcp   LISTEN 0      4096                                [::]:5432          [::]:*
`;
