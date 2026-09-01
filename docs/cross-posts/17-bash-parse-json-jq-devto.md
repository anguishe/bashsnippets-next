---
title: "I Haven't Typed a Bare jq Since grep Tagged Every Release 'latest'"
published: true
description: "grep on JSON doesn't error, it lies. How -r, // defaults, and -e separate a jq parse that survives an API reformat from one that breaks silently."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/bash-parse-json-jq
cover_image: https://bashsnippets.xyz/ogimage.png
---

For two years, a deploy script where I worked pulled the release version out of an API response with `grep '"version"' | cut -d'"' -f4`, and for two years it was right. Then one afternoon every image it pushed came out tagged `latest`. Nothing failed. The pipeline stayed green, the registry accepted every push, and we burned an hour interrogating the registry — because the registry was the only thing anyone believed could have changed.

The actual change was upstream. The API had started pretty-printing its responses and moved the version one level deeper, under a `metadata` object. The document also carried a *second* field named `"version"` — a schema version, permanently set to `"latest"` — and once the layout shifted, that one appeared first. `grep` matched it, `cut` counted four quote-delimited fields exactly as instructed, and the pipeline handed back a plausible string with total confidence. Wrong answers that look right are the expensive kind; a loud error would have cost us five minutes instead of an hour of two people blaming an innocent registry.

The habit that came out of that afternoon lives in my `.bashrc`: `alias jqe='jq -er'`. I haven't typed a bare `jq` against an API response since. The alias is two flags, and those two flags — plus one operator — are most of what separates a parse that survives an API reformat from one that quietly starts lying.

## Why line tools can't be trusted with JSON

`grep`, `cut`, `sed`, and `awk` operate on lines, and JSON has no lines it's obliged to keep. A compact `{"a":1,"b":2}` and the same object pretty-printed across six lines are the same document; any line pattern you write is a bet on one specific serialization. The producer is free to reindent, reorder keys, nest a field, or ship a value containing your delimiter, and none of that is a breaking change *to them*. Here's the trap: your pattern doesn't break either. It keeps matching, on different bytes, and returns something. A real parser reads the document into a tree and lets you name the node you want, so the path means the same thing no matter how the bytes happen to be arranged.

## The three that matter: -r, //, and -e

This is the core of the rewrite that replaced the grep pipeline:

```bash
response=$(curl -sS --max-time 30 "$RELEASE_API/latest")

# -e: non-zero exit when the path is missing or null. -r: raw string, no quotes.
if ! version=$(printf '%s' "$response" | jq -er '.metadata.version'); then
    echo "no version in response — refusing to tag" >&2
    exit 1
fi
build=$(printf '%s' "$response" | jq -r '.build_number // 0')
```

Three mechanisms in eight lines.

`-r` exists because jq's default output is JSON, not text. Ask for a string field without it and you get the string *JSON-encoded* — wrapped in its own literal double quotes. The variable holds `"1.2.3"`, seven characters where you expected five, so every downstream comparison against `1.2.3` fails and every filename or image tag built from it grows a pair of quote characters. It's a maddening bug to chase, because `echo` shows you quotes your eye reads as decoration.

`//` exists because real APIs omit optional fields, and jq's answer for a missing key is the four-character string `null`. Feed that to `$(( build + 1 ))` and you crash if you're lucky; string-compare it somewhere and you've minted another confident wrong answer. `.build_number // 0` supplies the fallback inside the expression, so absence becomes a value you chose rather than a token you have to remember to check for.

`-e` covers the failure `set -e` makes you think you're already covered for. By default jq exits 0 whenever the filter *ran*, including when it produced `null` — so the command substitution succeeds, the variable receives `null`, and your carefully strict script marches on. `-e` derives the exit code from the result instead: null or false comes back non-zero, which is what lets the `if !` above catch a 404 body or a rate-limit response at the parse, rather than three commands later when a tag named `null` hits the registry.

For list-shaped responses the same discipline extends by two tokens: `.items[]?` emits one element per line (the `?` staying quiet when the array is absent entirely), and `select(.active == true)` filters before you project the field you want — one clean line per match, ready for a `while IFS= read -r` loop.

## What the fix actually bought

The rewritten script asks for `.metadata.version` by path. The API can pretty-print, compact, reorder, or nest deeper, and that path either resolves to the field it names or exits non-zero and stops the deploy. Both outcomes are honest. The grep pipeline offered a third outcome — succeed while wrong — and the third outcome is the one that costs an hour.

The alias stays, because muscle memory is cheaper than vigilance.

Full script — with the jq install guard, the array iteration, and the select() pattern: https://bashsnippets.xyz/snippets/bash-parse-json-jq

The response you're parsing should be a verified 2xx before jq ever sees it — [making API requests with curl that fail loudly](https://bashsnippets.xyz/snippets/bash-curl-api-requests) covers that half. And when a filter grows past a field or two, the [jq Filter Builder](https://bashsnippets.xyz/tools/jq-filter-builder) lets you paste a real response, click the fields you want, and copy the expression out. The rest of the library is at https://bashsnippets.xyz
