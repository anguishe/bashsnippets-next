# A Green Status Board Lied to Us for 61 Hours

I know the outage lasted exactly 61 hours because the partner told us afterward. Their API dropped on a Friday evening and came back Monday afternoon. What I can't forgive is what our side did during those hours: a status board, polling their health endpoint every two minutes, painted green through the entire thing. Around 1,800 checks. Zero of them noticed.

The postmortem was uncomfortable for a specific reason: no single line of the scraper was wrong in a way a reviewer would flag. The damage came from three separate silences stacked on top of each other, and each one is a default behavior, not a typo. If you have a shell script talking to an HTTP API anywhere in your infrastructure, odds are decent you're carrying at least one of them right now.

The first silence lives inside curl. Its exit code describes the transport, not the outcome — if DNS resolved, the connection opened, and a complete response arrived, that's exit 0, even when the response is a 503 maintenance page. So `set -euo pipefail`, the thing everyone reaches for, is inert here: bash was told, truthfully, that every command succeeded. `--fail` seems like the cure until you notice it discards the body and flattens every failing status into exit 22, erasing the one distinction that matters operationally — a 429 is an invitation to wait and retry, while a 404 is a fact about your request that no amount of retrying will change. What you want instead is the status code as data:

```bash
response=$(curl -sS --connect-timeout 5 --max-time 30 -w $'\n%{http_code}' "$API_URL")
http_code="${response##*$'\n'}"   # the last line is the status code
body="${response%$'\n'*}"         # everything above it is the body
[[ "$http_code" == 2* ]] || { echo "HTTP $http_code" >&2; exit 1; }
healthy=$(jq -er '.healthy' <<<"$body")
```

`-w` appends the code on its own line after the body; the two parameter expansions peel it back off. From there, your script gets to hold an opinion about what came back. The timeouts on that line are not decoration either — the short connect timeout makes a dead host fail in seconds, and `--max-time` stops a server that answers the phone and then says nothing from wedging a cron slot indefinitely.

The second silence is the one that actually painted the board green. Our old scraper extracted the status field with `grep`, and grep works on lines — a concept JSON doesn't have. The identical document can be minified onto one line or spread across forty, so every line-based pattern is secretly coupled to a formatting choice the API never guaranteed. When the 503 hit, the body became an HTML error page that contained the word "status" in its markup. The pattern didn't fail — it matched those other bytes, produced something plausible, and the lie propagated. A parser that understands structure inverts this: `jq` addresses fields by path, and its `-e` flag turns a missing or null result into a non-zero exit. Same weekend, same HTML page, with `jq -er` in place: the run dies immediately, at minute two of hour one. Add `-r` so values come out unquoted and comparable, and `//` to give absent keys a real default instead of the string `null`.

The third silence was an absence rather than a bug: when the scrape broke, no channel existed for that fact to reach a person. Monitoring the monitor had felt like paranoia. The cheap fix is a Slack incoming webhook — one POST of a JSON payload to a secret URL — with the two failure points handled deliberately: build the payload via `jq -n --arg` so quotes and newlines inside an error message can't produce invalid JSON, and keep the URL in an environment variable, never in the script. Bind it to an ERR trap and every unhandled failure announces itself, line number included, before the process exits. Worth saying plainly: a webhook fired from inside a job reports only what the job lives to see. A powered-off box posts nothing, which is the argument for pairing this with a dead-man's switch that alerts when an expected ping goes missing.

Rebuilt this way, the scraper turns every failure mode from that weekend into a two-minute page instead of a three-day secret. The fixes were small. The lesson was that "the script ran without errors" and "the thing the script watches is fine" are unrelated statements, and the gap between them is where those 61 hours lived.

The complete hardened version — bounded retries split by transient versus fatal status codes, webhook secret handling, and the cases this pattern deliberately leaves out — is in the full guide on BashSnippets. The curl request layer and the jq Filter Builder, which runs your filter live against a pasted response, are linked from the same page.

Originally published at https://bashsnippets.xyz/guides/shell-scripts-that-talk-to-apis

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Programming, Sysadmin -->
