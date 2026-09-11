#!/bin/bash
# Script: check-leaks.sh
# Purpose: A pasted terminal run can publish this machine's MAC, public IP or ISP resolvers to a public repo and a live page — this blocks the commit when a staged file contains any of them.
# Usage: ln -s ../../scripts/check-leaks.sh .git/hooks/pre-commit   (runs on every git commit; bypass once with --no-verify)
set -euo pipefail

CHECK="✓"
CROSS="✗"
LOOKUP_TIMEOUT=3        # seconds; an offline commit skips the public-IP lookup instead of hanging
PUBLIC_IP_SERVICE="https://ifconfig.me"

# Identifiers are read live on every run, so none of them is ever written into a repo.
# Private ranges are dropped: a LAN address or a Docker bridge identifies nothing.
IDS=$(mktemp)
trap 'rm -f "$IDS"' EXIT
{
  cat /sys/class/net/*/address
  ip -6 -o addr show scope global | awk '{ split($4, a, "/"); print a[1]; split(a[1], g, ":"); print g[1] ":" g[2] ":" g[3] ":" g[4] }'
  resolvectl dns 2>/dev/null | sed 's/^[^:]*: *//' | tr ' ' '\n' || true
  curl -4 -s --max-time "$LOOKUP_TIMEOUT" "$PUBLIC_IP_SERVICE" || true; echo
  curl -6 -s --max-time "$LOOKUP_TIMEOUT" "$PUBLIC_IP_SERVICE" || true; echo
} | grep -vE '^$|^00:00:00:00:00:00$|^(10|127)\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^f[cde]' \
  | grep -vE ':{3,}|::$' | sort -u > "$IDS" || true

mapfile -t STAGED < <(git diff --cached --name-only --diff-filter=ACMR)
[[ ${#STAGED[@]} -eq 0 ]] && exit 0

# -I skips binaries; --cached reads the staged version, so an old leak in a touched file blocks too.
if hits=$(git grep --cached -I -n -F -f "$IDS" -- "${STAGED[@]}"); then
  echo "$CROSS commit blocked: staged files contain this machine's MAC, public IP or ISP resolver:" >&2
  printf '%s\n' "$hits" | cut -c1-160 >&2
  echo "  Replace with documentation values: MAC 00:00:5e:00:53:01, IPv4 203.0.113.x / 198.51.100.x, IPv6 2001:db8::/32." >&2
  exit 1
fi
echo "$CHECK leak check: none of $(wc -l < "$IDS") machine identifiers in ${#STAGED[@]} staged files"
