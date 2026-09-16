---
title: "I Killed My Report Script Mid-Write. The Output File Never Noticed."
published: true
description: "SIGTERM halfway through a CSV write: exit 143, the temp file gone, yesterday's complete output untouched. The four lines that do it — mktemp, trap EXIT, atomic mv — and the one careful-looking ordering that turns exit 3 into exit 0."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/bash-trap-cleanup
cover_image: https://bashsnippets.xyz/ogimage.png
---

The failure this pattern prevents is a quiet one. A script writes its output straight to the path a consumer reads, dies halfway, and the consumer loads the torn file as though it were complete. Nobody sees an error, because the only process that failed is gone, and everything downstream of it exited 0 on partial data. Meanwhile `/tmp` collects the working files of every run that never reached its cleanup line at the bottom.

I did not want to trust the fix on paper, so I tested it the unfriendly way on my own machine, bash 5.3.9. A small generator writes a CSV, with a `sleep 30` planted between its first and second row to stand in for a slow API. I started it, waited one second, and sent it SIGTERM from outside.

This is the shape it runs in:

```bash
#!/bin/bash
set -euo pipefail
FINAL_PATH="${1:?usage: report.sh /path/to/output.csv}"

TMP_FILE=$(mktemp)             # unique path, created 0600
cleanup() {
  local code=$?                # first line: capture before anything overwrites it
  rm -f "$TMP_FILE"
  exit "$code"
}
trap cleanup EXIT              # registered on the line after mktemp

generate_rows > "$TMP_FILE"    # every write goes to the temp path
mv "$TMP_FILE" "$FINAL_PATH"   # atomic on one filesystem
```

What the kill left behind: exit status 143, which is 128 plus signal 15. The temp path `mktemp` had handed out came back `No such file or directory`, so the trap ran on the way down. And `out.csv` still held the previous run's three complete lines. A consumer reading it at that moment gets yesterday's data, whole. Stale is something monitoring can see. Torn is not.

## Every way out is covered

Walk the exits. The generator fails halfway: `set -e` aborts, the `EXIT` trap removes the partial temp file, the published file is untouched. A signal arrives — Ctrl-C, a shutdown's SIGTERM, my `kill` — and the same trap runs, as the run above shows. The script succeeds: `mv` has already moved the temp file, so `rm -f` finds nothing, complains about nothing, and the status passes through.

`EXIT` is the reason this is four lines instead of twenty. It is a bash pseudo-signal that fires on normal completion, an explicit `exit 1`, a `set -e` abort, and after the handling of a real signal. Trap `INT` or `TERM` separately only when you want signal-specific behaviour, such as logging who killed you.

Two scoping rules each save a confused hour. A trap set inside `$( )` or a `( )` group belongs to that subshell and fires when the subshell exits, so cleanup traps go at the top level. And a second `trap … EXIT` replaces the first — traps do not stack — so when two resources need releasing, a temp file and a background `ssh -L` tunnel for instance, both go in one handler.

## The ordering that launders a failure

The comment on the `local code=$?` line is the part people move. I ran four versions of the handler against a script that ends in `exit 3`, and bash turned out more forgiving than the folklore:

- A trap that removes the file and never calls `exit`: the script exits **3**. Bash keeps the original status.
- A trap ending in a bare `exit`: **3**. Inside an EXIT trap, a bare `exit` reuses the status the script was leaving with.
- Capture first, then `rm -f`, then `exit "$code"`: **3**.
- `rm -f` first, then `local code=$?`, then `exit "$code"`: **0**.

The one version that reports success after a failure is the one that looks most careful. It captures `$?` — after `rm` has succeeded, so it captures rm's zero and exits with it. Cron sees success, alerting sees success, and the cleanup has removed the evidence too. Capture on the first line, clean second, exit last.

## Why mktemp and not /tmp/myscript.$$

A predictable temp path is two bugs. Overlapping runs, retried jobs and helpers can collide on the same name and interleave their writes, which produces exactly the garbage this pattern is meant to prevent. And `/tmp` is world-writable, so a guessable name invites something else on the box to plant a file or a symlink where you are about to write. `mktemp` returns a unique path, created atomically, readable only by you. When a script needs several working files, make one directory with `mktemp -d` and remove it whole in the same handler; every intermediate file inherits the cleanup.

## What trap cannot do, and why the design survives it

`kill -9` cannot be caught. No trap runs, and power loss is no different. That is not an argument against the trap; it is why the rest of the design looks the way it does. Orphans from an uncatchable death land in `/tmp`, where reboot or tmpfiles ageing clears them, rather than in a data directory. And `mv` means even an uncatchable death cannot publish a torn file, because being half-written and being at the published path are never true at the same moment.

One cheap gate is worth adding wherever a consumer trusts your output: before the `mv`, check the temp file's size with `wc -c` against a floor, and exit non-zero instead of publishing an implausibly small result. An upstream that "succeeded" with an empty body then pages a human instead of reaching the dashboard.

A cleanup path you have never executed is a cleanup path you are guessing about. Plant a sleep, kill it from another terminal, and check three things: `/tmp` is clean, the output still holds the old complete file, and the exit code is not zero. It takes about a minute.

---

The complete script, the FAQ on subshell scoping and signal lists, and the line-by-line breakdown: https://bashsnippets.xyz/snippets/bash-trap-cleanup

The same survival kit continues with [bash error handling](https://bashsnippets.xyz/snippets/bash-error-handling), so failures stop the script and the trap has something honest to report, [the timeout command](https://bashsnippets.xyz/snippets/bash-timeout-command), so a hang dies and cleans up instead of blocking forever, and the [Cron Wrapper Generator](https://bashsnippets.xyz/tools/cron-wrapper-generator), which assembles the lot around any command. The rest of the library is at https://bashsnippets.xyz
