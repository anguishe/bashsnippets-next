<!-- REVIEW: incident dramatized — verify before publishing -->
# The Alert That Never Fired: Why I Built a jq Filter Builder

The most useful debugging command I ran all spring was `echo "[$status]"`. It printed `["down"]` — and those two inner quote characters explained why a monitoring script on my $5 VPS had spent five weeks watching Redis die without once sending the alert it existed to send.

The script was a five-minute cron job: curl a status endpoint, extract `.status` with jq, compare it to `down`, fire a webhook on a match. Every piece worked in isolation. But jq's default output format is JSON, and a JSON string ships with its quotes attached. My variable held six bytes — quote, d-o-w-n, quote — while my comparison expected four. Bash compares bytes, not meaning, so the test failed on every run, healthy or not, and exited zero while doing it. Cron saw nothing wrong. Neither did I, until a client emailed about a contact form that had been erroring for days. The repair took two characters, `-r`, jq's raw-output flag. Finding those two characters took five weeks, which is the ratio I'm least proud of.

Once I knew the shape of the trap, I started seeing its siblings everywhere. Ask jq for a key the response doesn't contain and it doesn't error — it emits `null`, which arrives in bash as a literal four-character string that passes non-empty checks and ends up baked into filenames. The `//` operator exists for exactly this: a real fallback when the field is missing. Then there's `select()` quoting. Because the whole filter sits inside single quotes to protect it from the shell, string comparisons inside it need double quotes. Misquote one and select() doesn't complain; it matches zero elements, prints nothing, and exits zero. Every one of these failures is silent, plausible-looking, and invisible to error handling.

What they had in common was my debugging method: iterate the filter blind against a live API, one curl round-trip per guess. After one too many midnight sessions of that against a rate-limited endpoint, I built the tool I kept wishing existed — the jq Filter Builder.

The premise: you already have the JSON, so the JSON should drive the filter. Paste a real response (or load a bundled sample) and the tool renders its parsed structure as a clickable tree. Clicking a field writes the path for you, nested however deep the response goes. For arrays — the place extraction filters actually get used — you can switch on per-element iteration, add a select() whose field dropdown is populated from keys that genuinely exist on the elements, and project a single field from each match. Literal values are quoted the way jq reads them: booleans and numbers bare, strings double-quoted inside the single-quoted program. The quoting decision that burned me is no longer a decision.

The output panel gives you the bare filter and the complete `curl -s … | jq` command with your URL in place, both one copy-click away. But the part that retires my old debugging loop is the live preview: the filter is evaluated in the browser, against your pasted JSON, on every change. With `-r` toggled off you can see the quotes sitting in the output before they reach a script. When the result is empty, a note states which of the three causes you hit — no matching elements, a path that doesn't exist, or a deliberate `// empty`. Silence comes labeled.

Worth stating because the JSON you need to dissect is usually real: everything is evaluated client-side. Nothing you paste is uploaded, and no remote jq runs. Also worth stating: the tool covers the common extraction patterns — nested access, array indexing, iteration with select() and projection, defaults, raw output — and leaves the rest of the jq language (reduce, interpolation, arithmetic) to the manual, on purpose.

The filter guarding that VPS today came out of the builder:

```bash
status=$(curl -s "$STATUS_URL" | jq -r '.dependencies[] | select(.name == "redis") | .ok')
```

Every mistake in my five-week outage is visible in this tool before anything executes. That's the whole argument for it: not that clicking is faster than typing, but that a preview turns silent wrongness into something you can see.

Build one against your own API response at the [jq Filter Builder](https://bashsnippets.xyz/tools/jq-filter-builder). The [parse JSON with jq](https://bashsnippets.xyz/snippets/bash-parse-json-jq) snippet has the script-side patterns, and [curl for API requests](https://bashsnippets.xyz/snippets/bash-curl-api-requests) covers the fetch half of the pipeline.

Originally published at https://bashsnippets.xyz/tools/jq-filter-builder

<!-- Medium tags to set in the UI: Bash, DevOps, Programming, Web Development, JSON -->
