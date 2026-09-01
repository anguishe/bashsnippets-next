<!-- REVIEW: incident dramatized — verify before publishing -->
---
title: "Two Quote Characters Silenced My Alerts for Five Weeks — So I Built a jq Filter Builder"
published: true
description: "Build a jq filter by clicking through a real JSON response — the filter, the full curl | jq command, and a live preview before anything runs."
tags: bash, webdev, tools, productivity
canonical_url: https://bashsnippets.xyz/tools/jq-filter-builder
cover_image: https://bashsnippets.xyz/ogimage.png
---

For five weeks, a cron job on my $5 VPS polled a status endpoint every five minutes, pulled `.status` out of the JSON with jq, compared it to `down`, and stayed quiet. Redis on that box fell over twice in that window. The webhook never fired either time. I found out from a client email asking why their contact form had been erroring since Tuesday.

The script read correctly. curl fetched the response, jq extracted the field, an `if` compared it, the alert fired on a match. I ran the pipeline by hand and the variable printed as down. What finally exposed it was `echo "[$status]"` — which printed `["down"]`. The quotes were inside the variable. jq had been handing my comparison a six-character string — quote, d-o-w-n, quote — and bash had been comparing it byte-for-byte against the four characters I typed. Never equal. Never an alert. Exit code zero, so cron reported nothing wrong either.

The fix was two characters, `-r`. The five weeks it took to find them is the part I'd rather not repeat.

## jq speaks JSON, bash speaks bytes

jq's default output format is JSON, and a JSON string includes its own quotes — printing `"down"` is jq being correct, not broken. Bash's `=` has no concept of quotes-as-markup; it compares the bytes it was given. The `-r` flag tells jq to emit the string's contents rather than its JSON representation, which is why nearly every value headed into a shell variable, a filename, or a test wants it.

That's the first of three ways a jq one-liner fails while looking right. The second: asking for a key the response doesn't have isn't an error — jq emits `null`, and by the time it lands in bash it's the literal four-byte string null, which passes `[ -n ]` checks and walks straight into filenames. backup-null.tar.gz is a genre of file I have created personally. The `//` operator is the guard: it substitutes a real fallback when the field is missing or null. The third: `select()` quoting. The filter lives inside single quotes so the shell keeps its hands off it, which means string comparisons inside need double quotes — `select(.name == "redis")`. Wrong quoting doesn't error; select() matches zero elements, outputs nothing, exits zero, and your script interprets the silence however it likes.

Three traps, one shared property: each produces output that looks plausible while being wrong, and none of them raises an exit code.

## The night I stopped hand-writing filters

My debugging method for all three was identical: trial and error against the live API. Tweak the filter, re-run the curl, squint at the output, repeat. The third time I caught myself in that loop after midnight — guessing at quote placement against a rate-limited endpoint — I decided the structure of the response should be doing this work, not my memory of jq syntax. So I built the jq Filter Builder.

You paste in a real JSON response, or load one of the bundled samples, and it renders the parsed structure as a clickable tree. Click any field and the path is built for you — click down into a nested object and the filter tracks every step. The structure is the interface; there is no syntax to recall.

Arrays get the full treatment, because arrays are where extraction filters earn their keep. Select an array and you can toggle per-element iteration, attach a select() whose field name comes from a dropdown populated with the keys that actually exist on the elements — a typo'd key stops being possible — and project one field out of each match. The comparison value is rendered the way jq reads literals: true, false, and numbers bare, everything else double-quoted for you inside the single-quoted program. The exact quoting decision I kept fumbling at midnight is made mechanically.

Below that sit two copyable outputs — the bare filter for a script, and the full `curl -s … | jq` command with your URL already in place — plus the piece that would have saved my five weeks: a live preview, evaluated in the browser against the JSON you pasted. Leave `-r` off and the quotes are right there in the preview, visible before they ever reach a script. And when the result is empty, the preview says why: select() matched no elements, the path doesn't exist in this response, or a `// empty` default is deliberately producing nothing. Empty output stops being ambiguous.

One property worth knowing before you paste anything sensitive: it all runs client-side. Nothing is uploaded and no remote jq binary is invoked, so a response from a real production system stays in your browser.

Scope, honestly: it builds the extraction patterns that cover most API scripting — nested field access, array indexing, iteration with select() and projection, `//` defaults, raw output. It does not attempt the rest of the jq language; reduce, string interpolation, and arithmetic still belong to the manual.

## The failure that can't get past a preview

The line running on that VPS today came out of the builder:

```bash
status=$(curl -s "$STATUS_URL" | jq -r '.dependencies[] | select(.name == "redis") | .ok')
```

The version of me that shipped the quiet alert couldn't ship it from this tool. The missing `-r` shows up as quotes in the preview. The bad select() shows up as "no elements matched" instead of respectable-looking emptiness. The missing key names itself. Five weeks of silence, converted into one glance before anything runs.

Build a filter against your own API response: https://bashsnippets.xyz/tools/jq-filter-builder

The [parse JSON with jq](https://bashsnippets.xyz/snippets/bash-parse-json-jq) snippet covers these patterns in script form with the hardening around them, [curl for API requests](https://bashsnippets.xyz/snippets/bash-curl-api-requests) is the other half of the same pipeline, and the rest of the library is at https://bashsnippets.xyz
