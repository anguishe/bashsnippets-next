<!-- NOT SCHEDULED. Wave 2 #23 - planned Thu 2026-12-10 08:00 CST (14:00Z), same minute as dev.to #23. Real run on this box 2026-09-28: python3 -m http.server 8097 --bind 127.0.0.1, curl 8.21.0. Reserve/16's invented price-sync story is not used. -->

# curl exited 0 on a 404, and set -e let it through

I started Python's web server on loopback and asked it for a path that did not exist, the way a script asks for an endpoint that got renamed. No network involved, curl 8.21.0:

```text
$ curl -s -o body.txt http://127.0.0.1:8097/nope; echo "exit=$?"
exit=0
$ wc -c < body.txt
460
$ curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8097/nope
404
$ curl -sf -o body2.txt http://127.0.0.1:8097/nope; echo "exit=$?"
exit=22
```

Exit 0, and 460 bytes of HTML error page in the file the next step would parse. Wrapped in `set -euo pipefail`, the script kept going. curl's exit code reports the transport: the connection opened and a complete response came back, so it succeeded. When I killed the server, the same request exited 7, and that is the class of failure the exit code covers.

`-w '%{http_code}'` hands you the status to branch on. `-f` turns 400 and above into exit 22, but it never wrote `body2.txt`, which throws away the error body an API uses to tell you what it rejected. `--fail-with-body` keeps both: exit 22 and the body. If you pipe it, check `${PIPESTATUS[0]}`, not `$?`, or you are reading the exit code of whatever came after it.

The unattended version splits body from status, retries 429 and 5xx, fails fast on other 4xx and sets both timeouts: [a curl wrapper that fails when the API does](https://bashsnippets.xyz/snippets/bash-curl-api-requests).
