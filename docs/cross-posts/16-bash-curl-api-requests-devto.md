---
title: "My Nightly Job Reported Success for a Month While It Poisoned Every Price Downstream"
published: true
description: "curl exits 0 on an HTTP 500. My nightly sync saved a gateway's error page as price data for weeks — all green logs. Check the status code yourself."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/bash-curl-api-requests
cover_image: https://bashsnippets.xyz/ogimage.png
---

For a month, the most reliable-looking job on my server was a nightly cron that pulled a price list from a partner's API. curl fetched, the response landed in a file, and the rest of the pipeline built its numbers from that file. Exit code 0, every single night. Then one morning I opened the output and every price in it was zero.

The partner, it turned out, had moved their API behind a new gateway. During their deploys, that gateway answered with a 502 — not a dropped connection, a complete, well-formed HTML error page. My script had been saving that page as if it were data. The parser found no prices inside HTML, defaulted every field to zero, and wrote the file anyway. No alert ever fired, because as far as bash could tell, nothing had failed. curl ran. It exited 0. The log stayed green.

The eventual fix was a handful of lines I had skipped when I first wrote the script. The part I'm not proud of is why I skipped them: the happy path worked on day one, and I called it done.

## The exit code answers a different question than the one you're asking

curl's exit status reports the transport, not the conversation. If DNS resolved, the connection opened, and a complete response came back, then curl's actual job — moving bytes — succeeded, and it exits 0. Whether those bytes were your JSON or a gateway's apology page is an application-level concern, and the exit code carries no application-level news. A 200 and a 500 are the same successful round trip.

That's why `set -euo pipefail` did nothing for me here, even though it sat at the top of the script like it always does. `set -e` aborts on a non-zero exit, and there was never a non-zero exit. The command worked; the request failed; bash only knows about the first of those two events. A script that equates "curl returned" with "the API answered correctly" is trusting somebody else's deploy schedule with its own data integrity.

## Make the status code something bash can see

The repair is to pull the HTTP status into the shell where you can branch on it. curl will hand it over: `-w $'\n%{http_code}'` appends the status code after the body, on its own line. Two parameter expansions then take the response apart:

```bash
response=$(curl -sS --connect-timeout 5 --max-time 30 \
    -w $'\n%{http_code}' "$url")
http_code="${response##*$'\n'}"   # last line: the status code
body="${response%$'\n'*}"         # everything above it: the body
case "$http_code" in
  2*)     printf '%s' "$body" ;;                                    # real data
  429|5*) echo "HTTP $http_code — transient, worth a retry" >&2; exit 1 ;;
  *)      echo "HTTP $http_code — our request is wrong" >&2; exit 1 ;;
esac
```

The expansions are the non-obvious part. `${response##*$'\n'}` deletes the longest match of "anything ending in a newline" from the front, which leaves the final line — the status code. `${response%$'\n'*}` deletes the shortest match of "a newline then anything" from the back, which leaves everything before that last newline — the body, untouched, ready to pipe into jq. One request, no temp files, both halves cleanly separated.

## Not every failure deserves the same response

The case branches encode the decision that matters. A 2xx means the body is real: print it, return success. A 429 or a 5xx is the other side's problem — a rate limiter asking for patience, a server mid-restart — and those tend to clear on their own, so they're worth retrying after a pause; the full version loops with a bounded budget instead of exiting. Everything else in the 4xx range is *your* problem. A 401 or a 404 fails identically on attempt one and attempt fifty, so retrying heals nothing — it delays the real error and buries it under noise. Those should fail immediately and loudly.

The two timeouts are what make this safe under cron. `--connect-timeout 5` caps how long curl waits to establish the connection, so an unreachable host fails in seconds instead of the OS default. `--max-time 30` caps the entire operation, which covers the nastier case: a server that accepts the connection and then stalls mid-transfer. Without that ceiling, a wedged endpoint holds your job open indefinitely — and under cron, a job that never exits is a job whose next scheduled run piles on top of it.

## Why not --fail?

curl ships a blunt version of all this: `--fail` makes it exit 22 on 4xx and 5xx, which trips `set -e`. For a one-liner at a terminal it's a genuine improvement. I stopped reaching for it in unattended scripts for two reasons. It discards the response body on error — when an API answers 400 with `{"error":"missing field x"}`, `--fail` hands you an exit code and deletes the sentence that explains it. And it collapses every HTTP failure into one code, so the script can't tell a retryable 503 from a permanent 404 without capturing the status anyway — at which point the flag has nothing left to add.

## The two mornings

Run my month-long incident through the checked version and it dies on night one. The gateway's 502 lands in the transient branch, the retries exhaust, the function returns non-zero, and cron finally has a failure it can report. I would have known at breakfast the first morning — with the error page sitting in the log, naming the gateway — instead of reverse-engineering the story from a file full of zeros a month later. The distance between those two mornings is one status check the happy path let me skip.

The full wrapper — retry loop with a budget, both timeouts, body on stdout and diagnostics on stderr so the data stays pipeable — is at https://bashsnippets.xyz/snippets/bash-curl-api-requests

Once a clean 2xx body is flowing, the next trap is parsing it with grep instead of [jq](https://bashsnippets.xyz/snippets/bash-parse-json-jq), and when the thing you're calling recovers on its own schedule, [retry with exponential backoff](https://bashsnippets.xyz/snippets/bash-retry-with-backoff) generalizes the retry half of this pattern to any command, not only curl. The rest of the library is at https://bashsnippets.xyz
