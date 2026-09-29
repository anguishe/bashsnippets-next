<!-- REWRITTEN 2026-09-29 on the real run from the live snippet page (httpbin 502 -> exit 0 + 0-byte file; wrapper 3 tries -> exit 1; 404 one try; 200 -> jq). Same canonical as queue #23 (404 on a local http.server): post ONE of them, not both. -->
---
title: "curl Got a 502, Wrote an Empty File, and Exited 0"
published: true
description: "curl exits 0 on an HTTP 502. A real run: plain curl saves a zero-byte file and reports success; a status-checking wrapper retries three times and exits 1."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/bash-curl-api-requests
cover_image: https://bashsnippets.xyz/ogimage.png
---

I pointed a plain `curl` at an endpoint that answers every request with a 502, the way an API does in the middle of a bad deploy, and saved the result the way a nightly job would:

```text
$ curl -s -o page.html https://httpbin.org/status/502; echo "exit=$?"
exit=0
$ wc -c < page.html
0
```

Exit 0, and a zero-byte file where the data should be. If that line lived in a cron job, the log would say success, the next step would read an empty file, and whatever it built would be quietly wrong until somebody noticed the numbers. Nothing in the script would ever complain, because as far as bash can tell, nothing failed.

## The exit code answers a different question than the one you're asking

curl's exit status reports the transport, not the conversation. If DNS resolved, the connection opened, and a complete response came back, then curl's actual job — moving bytes — succeeded, and it exits 0. Whether those bytes were your JSON or a gateway's apology page is an application-level concern, and the exit code carries no application-level news. A 200 and a 500 are the same successful round trip.

That's why `set -euo pipefail` at the top of a script does nothing here. `set -e` aborts on a non-zero exit, and there was never a non-zero exit. The command worked; the request failed; bash only knows about the first of those two events. A script that equates "curl returned" with "the API answered correctly" is trusting somebody else's deploy schedule with its own data integrity.

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

curl ships a blunt version of all this: `--fail` makes it exit 22 on 4xx and 5xx, which trips `set -e`. For a one-liner at a terminal it's a genuine improvement. I don't reach for it in unattended scripts, for two reasons. It discards the response body on error — when an API answers 400 with `{"error":"missing field x"}`, `--fail` hands you an exit code and deletes the sentence that explains it. And it collapses every HTTP failure into one code, so the script can't tell a retryable 503 from a permanent 404 without capturing the status anyway — at which point the flag has nothing left to add.

## The same endpoint, checked

Here is that 502 again, same box, through the wrapper from the snippet page (the retry loop around the `case` above):

```text
$ ./api-request.sh https://httpbin.org/status/502
✗ 502 (attempt 1/3) — retrying
✗ 502 (attempt 2/3) — retrying
✗ 502 (attempt 3/3) — retrying
✗ gave up after 3 attempts
$ echo $?
1
```

Three tries, about six and a half seconds, and a non-zero exit that cron and the next step can both see. A 404 gets one try, because retrying a wrong URL only repeats the mistake, and a good response goes to stdout with the status on stderr, so the data stays pipeable:

```text
$ ./api-request.sh https://httpbin.org/status/404
✗ 404 — not retryable, this is our request

$ echo $?
1
$ ./api-request.sh https://api.github.com/repos/anguishe/bashsnippets > repo.json
✓ 200 OK
$ jq -r .full_name repo.json
anguishe/bashsnippets
```

The first run is a job that stays green while it writes nothing. The second is a job that fails tonight, loudly, with the status code in the log.

The full wrapper — retry loop with a budget, both timeouts, body on stdout and diagnostics on stderr so the data stays pipeable — is at https://bashsnippets.xyz/snippets/bash-curl-api-requests

Once a clean 2xx body is flowing, the next trap is parsing it with grep instead of [jq](https://bashsnippets.xyz/snippets/bash-parse-json-jq), and when the thing you're calling recovers on its own schedule, [retry with exponential backoff](https://bashsnippets.xyz/snippets/bash-retry-with-backoff) generalizes the retry half of this pattern to any command, not only curl. The rest of the library is at https://bashsnippets.xyz
