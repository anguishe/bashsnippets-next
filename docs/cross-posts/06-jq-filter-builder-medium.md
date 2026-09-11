# I Tested a jq Alert Against a Down Status. It Printed 'no alert'.

The shape is everywhere in monitoring scripts: curl a status endpoint, pull one field out with jq, compare it, fire an alert on a match. I wrote the smallest honest version of it on my own machine, jq 1.8.1, against a response that said the service was down:

```bash
resp='{"status":"down"}'
status=$(echo "$resp" | jq '.status')
echo "[$status]"                                                 # ["down"]
if [ "$status" = "down" ]; then echo ALERT; else echo "no alert"; fi   # no alert
```

The service was down. The script said `no alert`, and exited 0. The `echo "[$status]"` line shows why: the variable holds `"down"`, quote characters included. jq handed bash a six-character string, bash compared it byte for byte against the four characters in the test, and they never match. Put that in a five-minute cron job and it stays quiet through every outage it exists to report.

Adding two characters, `jq -r`, changed the output to `[down]` and the script to `ALERT`.

## jq speaks JSON, bash speaks bytes

jq's default output format is JSON, and a JSON string includes its own quotes, so printing `"down"` is jq being correct. Bash's `=` has no idea that quotes might be markup; it compares the bytes it was given. `-r` tells jq to emit the string's contents rather than its JSON representation, which is why nearly every value headed into a shell variable, a filename or a test wants it.

That is the first of three ways a jq one-liner fails while looking right. The second: asking for a key the response does not have is not an error. On the same response, `jq -r '.region'` printed `null` and exited 0. In bash that is the literal four-character string `null`, which passes `[ -n ]` checks and walks straight into filenames and log lines. The `//` operator is the guard: `jq -r '.region // "unknown"'` printed `unknown`.

The third is `select()`, and here the folklore is half wrong. Forget the double quotes around a string inside the filter — `select(.name == redis)` — and jq does not quietly match nothing. It refuses to compile, prints `redis/0 is not defined`, and exits 3. That one is loud, and `set -e` will catch it. The silent version is a value that is spelled right but does not exist: `select(.name == "nginx")` against a list with no nginx in it printed nothing and exited 0. So did a case mismatch. Your script then treats that silence however it treats an empty string.

Three traps, and two of them share one property: plausible output, zero exit code.

## Build the filter against the response you already have

The usual way to debug all three is trial and error against the live API: tweak the filter, re-run the curl, squint, repeat, often against a rate-limited endpoint. The [jq Filter Builder](https://bashsnippets.xyz/tools/jq-filter-builder) turns that around, because you already have the JSON.

Paste a real response, or load one of the bundled samples, and it renders the parsed structure as a clickable tree. Click a field and the path is built for you, however deep it is nested. Arrays get the full treatment: switch on per-element iteration, attach a `select()` whose field name comes from a dropdown filled with the keys that actually exist on the elements, so a misspelled key stops being possible, and project one field out of each match. The comparison value is written the way jq reads literals — `true`, `false` and numbers bare, everything else double-quoted for you inside the single-quoted program. The quoting decision is made mechanically.

Below that sit two copyable outputs: the bare filter for a script, and the full `curl -s … | jq` command with your URL in place, `-r` included when you ask for raw output. And a live preview, evaluated in the browser against the JSON you pasted, on every change. Leave `-r` off and the quotes are right there in the preview. When the result is empty, the preview says why — `No elements matched (jq would output nothing)`, `Path not found`, or that a `// empty` default is deliberately producing nothing — so empty output stops being ambiguous.

It runs client-side: nothing is uploaded and no remote jq is invoked, so a response from a production system stays in your browser. Scope, honestly: it builds the extraction patterns that cover most API scripting — nested access, array indexing, iteration with `select()` and projection, `//` defaults, raw output. Reduce, string interpolation and arithmetic still belong to the manual.

The four-line check at the top of this post could not have shipped from the builder. The quotes show up in the preview before the script exists.

Build a filter against your own API response: https://bashsnippets.xyz/tools/jq-filter-builder

The [parse JSON with jq](https://bashsnippets.xyz/snippets/bash-parse-json-jq) snippet covers these patterns in script form with the hardening around them, [curl for API requests](https://bashsnippets.xyz/snippets/bash-curl-api-requests) is the other half of the same pipeline, and the rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/tools/jq-filter-builder

<!-- Medium tags to set in the UI: Bash, DevOps, Programming, Web Development, JSON -->
