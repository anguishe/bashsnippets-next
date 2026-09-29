---
title: "curl Exited 0 on a 404. My Script Believed It."
published: true
description: "curl's exit code reports the transport, not the HTTP status. A real run against a local server: exit 0 on a 404 and an HTML error page saved as data, then -f, --fail-with-body and -w."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/bash-curl-api-requests
cover_image: https://bashsnippets.xyz/ogimage.png
---

I asked a server for a file that did not exist and curl told my script everything went fine. No network involved: on my own machine I started Python's built-in web server on loopback, `python3 -m http.server 8097 --bind 127.0.0.1`, and requested a path it had never heard of, the way a script requests an endpoint that got renamed.

```text
$ curl -s -o body.txt http://127.0.0.1:8097/nope; echo "exit=$?"
exit=0
$ wc -c < body.txt
460
$ grep -E 'Error code|Message' body.txt
        <p>Error code: 404</p>
        <p>Message: File not found.</p>
        <p>Error code explanation: 404 - Nothing matches the given URI.</p>
$ bash -c 'set -euo pipefail; curl -s -o body.txt http://127.0.0.1:8097/nope; echo still running, next step reads body.txt'
still running, next step reads body.txt
```

Exit 0, and 460 bytes of HTML error page sitting in the file my next step would have parsed as data. The last line is the one that stung: `set -euo pipefail`, the header I trust to stop a script at the first failure, let it straight through. From bash's point of view nothing had failed. Every step after that would have been working from an error page and exiting 0 as well.

## curl reports the transport, not the answer

curl's exit code answers one question: did I get a response back? DNS resolved, the connection opened, a complete HTTP response arrived. That is success as far as curl is concerned, whether the response was a 200 with your JSON or a 404 with an HTML page. The status code is part of the response, and by default curl does not judge it.

You can see what curl does treat as failure by taking the server away. After I killed the Python process, the same request printed `000` for the status and exited 7: couldn't connect. That is the class of problem the exit code covers. A server that answers with bad news is not in that class.

## Three ways to make the status count

All three below came from the same server and the same missing path, with curl 8.21.0:

```text
$ curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8097/nope
404
$ curl -sf -o body2.txt http://127.0.0.1:8097/nope; echo "exit=$?"
exit=22
$ ls body2.txt
ls: cannot access 'body2.txt': No such file or directory
$ curl -s --fail-with-body http://127.0.0.1:8097/nope | head -3; echo "exit=${PIPESTATUS[0]}"
<!DOCTYPE HTML>
<html lang="en">
    <head>
exit=22
```

`-w '%{http_code}'` prints the status after the transfer, which lets the script branch on it. `-f` (`--fail`) turns any status of 400 or above into exit 22, so `set -e` finally trips. Without `-s` it also says why: `curl: (22) The requested URL returned error: 404`. Its cost is visible above: `body2.txt` was never written. When an API answers a 400 with a JSON body explaining which field it rejected, `-f` throws that explanation away. `--fail-with-body` keeps the exit 22 and keeps the body, which is what I want in a log.

Note the `${PIPESTATUS[0]}` on the last one. Piped into `head`, the pipeline's `$?` belongs to `head`, which exits 0. Checking the wrong element of that pipe would have reproduced the original bug one layer down.

## What the page does with it

For a one-liner, `--fail-with-body` is enough. For a job that runs unattended, the snippet goes one step further: it appends `%{http_code}` to the body with `-w`, splits the last line off as the status, and branches on the class. A 2xx returns the body on stdout. A 429 or 5xx is transient and gets retried a bounded number of times. Any other 4xx means the request itself is wrong, so it fails at once, prints the body to stderr and returns non-zero, because retrying a 404 sends the same broken call again. `--connect-timeout` and `--max-time` go on every call so a dead host cannot hold the job past its cron interval.

The run that started this took a few seconds and showed me the default: a 404, an HTML page in my data file, and exit 0 under the strict-mode header I had been treating as a safety net. curl had reported exactly what it promises to report. I had been reading it as a different answer.

---

Full wrapper with the status split, the retry-on-429/5xx logic and both timeouts: https://bashsnippets.xyz/snippets/bash-curl-api-requests

Once the call returns a real 2xx, [parsing JSON with jq](https://bashsnippets.xyz/snippets/bash-parse-json-jq) reads the fields out of it without regex, and [Slack webhook alerts](https://bashsnippets.xyz/snippets/bash-slack-webhook-alerts) make sure the non-zero exit reaches a human. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 2 #23 - planned Thu 2026-12-10 08:00 CST (14:00Z). Rewritten from scratch on a real run on this box 2026-09-28 (python3 -m http.server 8097 --bind 127.0.0.1, curl 8.21.0, Python 3.14.7, bash 5.3.9). Reserve/16's price-sync story is NOT used (invented). Note: the live page still opens on that same story; flag for Travis. -->
