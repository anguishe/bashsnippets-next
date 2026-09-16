<!-- POSTING CADENCE RULE: maximum 1 CoderLegion post per week. Check the last CoderLegion publish date before posting this — if something went up within the past 7 days, hold it. Excerpt only by design: CoderLegion has no canonical support, so full bodies must never be posted there. -->

A shell script that calls an API can report success while the API is down, because curl's exit code describes the transport, not the HTTP result. A completed exchange is exit 0 — even when the response is a 503 error page — so `set -euo pipefail` sees nothing wrong. The fix is to make the status code something your script reads:

```bash
response=$(curl -sS --max-time 30 -w $'\n%{http_code}' "$url")
code="${response##*$'\n'}"
body="${response%$'\n'*}"
[[ "$code" == 2* ]] || exit 1
```

`-w` appends the status on its own line; the parameter expansions split it from the body. Branch on it: 2xx is success, 429 and 5xx are worth a bounded retry, any other 4xx means the request itself is wrong and repeating it changes nothing.

Second trap: never pull fields out of the body with grep. JSON has no stable line layout, so a pattern that works today can silently match the wrong bytes on an error page tomorrow. Use `jq -er '.field'` — the `-e` turns a missing field into a non-zero exit your error handling can catch.

I watched a monitor built without these checks stay green through a 61-hour outage. The full pattern — retries, Slack alerting on failure, the complete script — is in this guide to [making bash scripts call HTTP APIs reliably](https://bashsnippets.xyz/guides/shell-scripts-that-talk-to-apis).
