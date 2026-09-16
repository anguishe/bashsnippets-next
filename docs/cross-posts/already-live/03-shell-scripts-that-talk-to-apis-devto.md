---
title: "The Dashboard Stayed Green for the 61 Hours the API Was Down"
published: true
description: "curl exits 0 on a 503. grep matches 'ok' on an error page. Nothing alerts. How a monitoring script lied for a whole weekend, and the three fixes."
tags: bash, linux, devops, tutorial
canonical_url: https://bashsnippets.xyz/guides/shell-scripts-that-talk-to-apis
cover_image: https://bashsnippets.xyz/ogimage.png
---

On a Monday morning a partner mentioned, in passing, that their API had been down since Friday evening. Sixty-one hours. Our status board polled their health endpoint every two minutes — roughly 1,800 checks across that weekend — and rendered green for every single one of them.

The part that stung wasn't the outage. It was that nothing in our scraper was broken in the way a stack trace is broken. Three decisions, each of which would sail through a code review, had stacked into a machine for producing false confidence. And we learned about it from the people we were supposed to be watching — a specific flavor of embarrassment I'd rather not repeat: explaining to the room that the monitor had no monitor.

Here's the actual shape of the problem. An API call from a shell script is three distinct jobs — moving bytes, interpreting them, and escalating when either goes wrong — and every one of them fails silently unless you make it loud.

## curl's definition of success is not yours

The first silence: `curl` exited 0 all weekend, because curl's exit code answers a narrower question than the one you're asking. It reports on the transport. DNS resolved, TCP connected, a complete HTTP response came back — done, exit 0. The response being a `503` maintenance page is, from curl's point of view, the successful delivery of a 503. That's also why `set -euo pipefail` never had a chance to save us: no command failed. Bash saw a clean run.

`--fail` looks like the answer — it flips any 4xx/5xx into exit 22. But it throws away the response body and collapses every failing status into one exit code, destroying the distinction you need most: a `429` deserves a pause and another attempt, while a `404` fails identically on attempt one and attempt fifty. The pattern that keeps everything is to have curl append the status code after the body and split it off yourself:

```bash
response=$(curl -sS --connect-timeout 5 --max-time 30 -w $'\n%{http_code}' "$API_URL")
http_code="${response##*$'\n'}"   # the last line is the status code
body="${response%$'\n'*}"         # everything above it is the body
[[ "$http_code" == 2* ]] || { echo "HTTP $http_code" >&2; exit 1; }
healthy=$(jq -er '.healthy' <<<"$body")
```

The two parameter expansions do the split: `##*$'\n'` strips everything through the final newline, leaving the code; `%$'\n'*` keeps everything before it. Now the status is a value your script branches on instead of a detail it never sees. The pair of timeouts on that curl line pull equal weight — a short connect timeout so a dead host fails in seconds, and a hard `--max-time` so a server that accepts the connection and then goes catatonic can't pin a cron job open until the next run stacks on top of it.

## Line tools cannot be trusted with JSON

The second silence was worse, because it produced a positive wrong answer. The old scraper pulled the status field out with `grep`. When the 503 arrived, the body wasn't the JSON we expected — it was an HTML maintenance page that happened to contain the word "status" somewhere in its markup. The pattern matched those bytes instead, the extracted value looked plausible, and the board stayed green.

That's not bad luck; it's the built-in failure mode of using line-oriented tools on a format that has no meaningful lines. The same JSON document can arrive minified on one line or pretty-printed across forty, and it's identical data — so any `grep` or `sed` pattern you write is bound to one specific layout the API never promised you. And when the layout shifts, the pattern doesn't error. It matches something else.

`jq` reads the document as structure and addresses fields by path, which changes the failure mode from "wrong bytes" to "loud exit." The `-e` flag in the block above is the load-bearing part: it sets jq's exit code from the result, so a missing or null field becomes a real non-zero exit that `set -e` and an error trap can act on. `-r` emits the bare value rather than a quoted JSON string, so string comparisons behave, and the `//` operator supplies a genuine default so an absent key doesn't turn into the literal word `null` wandering through your script. Had the old scraper used `jq -e`, the HTML page would have killed the run on the spot — a failure at minute two instead of a lie for sixty-one hours.

## The monitor needs a way to shout

The third silence wasn't wrong code. It was missing code. When the scrape itself broke, there was no path for that news to reach a human — no alert on the alerter, because that felt paranoid right up until the weekend it wasn't.

A Slack incoming webhook closes that gap with one HTTPS POST of a JSON payload to a secret URL, and there are exactly two ways to fumble it. Malformed JSON — which you prevent by building the payload with `jq -n --arg`, so an error message full of quotes and newlines gets escaped instead of corrupting the document — and a leaked URL, which you prevent by keeping it in the environment and out of the file. Wire the alert into `trap '...' ERR` and, with `set -e` on, every unhandled failure posts to the channel with a line number before the script dies. Nobody has to remember to call it.

One honest caveat: an alert fired from inside the job only covers failures the job survives long enough to report. If the box is off or cron never fires, nothing posts — that's the case for a dead-man's switch like Healthchecks.io alongside, waiting for a ping that stops coming.

The rewritten scraper closes all three gaps. A 503 trips the status branch. An HTML error page trips `jq -e`. Either one lands in Slack inside two minutes. None of the fixes is more than a few lines — the work was noticing that there were three separate silences, each needing its own fix.

The full hardened script — the retry loop with the transient-versus-fatal split, the webhook secret handling, and what this pattern still doesn't cover — is in the guide: https://bashsnippets.xyz/guides/shell-scripts-that-talk-to-apis

The request layer stands alone in [Make API Requests in Bash with curl](https://bashsnippets.xyz/snippets/bash-curl-api-requests), and the [jq Filter Builder](https://bashsnippets.xyz/tools/jq-filter-builder) evaluates a filter live against your real response before you commit it to a script. The rest of the library is at https://bashsnippets.xyz
