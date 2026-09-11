<!-- REVIEW: incident dramatized — the guide describes the "exit 1, empty log, two-hour incident" generically; the 03:07 page, the nightly export, the full-disk mkdir and the set -x bisect are invented specifics. Verify before publishing. -->
---
title: "set -euo pipefail Is Missing a Letter, and It Cost Me Two Hours at 03:00"
published: true
description: "A strict-mode script died with exit 1 and a log that said nothing — because the ERR trap that should have named the line does not fire inside functions unless you add -E. What each strict-mode flag actually promises, where it goes silent, and the handler that prints the failing command."
tags: bash, linux, devops, scripting
canonical_url: https://bashsnippets.xyz/guides/safe-bash-script-template
cover_image: https://bashsnippets.xyz/ogimage.png
---

The pager went at 03:07 because a nightly export had exited 1. That much the cron wrapper knew. What it could tell me beyond that was nothing: the log held the start banner, four lines of normal progress, and then the wrapper's own "exited 1" footer. No failing command. No line number. The script had `set -euo pipefail` on line 4 and a `trap … ERR` on line 9 whose entire job was to print those two things. Neither had said a word.

I spent the next two hours doing what you do when the diagnostics are missing: bisecting a 200-line script by hand with `set -x`, at three in the morning, on a production box, to find that a `mkdir -p` inside a helper function had failed on a full disk. The disk was the incident. The two hours were the trap's fault. And the part I am least proud of is that the trap had been there for a year, tested on the day I wrote it — by putting `false` on a top-level line, where it worked — and never once tested against a failure inside a function, which is where every real failure lives.

## Three flags, three promises, one missing

`set -euo pipefail` gets pasted as a single incantation. It is three flags making three separate promises, and each has its own list of places where it quietly declines to keep them.

`-e` says exit when a command fails and nobody is checking. Bash defines "checking" generously: the condition of an `if`, anything left of `&&` or `||`, anything under `!` — and, the part that surprises people, everything inside a function that was *called* from one of those positions. A careful helper becomes unguarded the moment somebody wraps it in `if helper; then`, and nothing warns you.

`-u` says an unset variable is an error rather than an empty string — the difference between `rm -rf "$BUILD_DIR/"` and `rm -rf /` when the variable is spelled `BUILDDIR` in one place.

`-o pipefail` says a pipeline fails if any stage fails, not only the last one. Without it, `curl … | jq …` proceeds happily when curl dies and `jq` parses the empty result into something harmless.

None of those is the letter I was missing.

## Why the trap said nothing

`trap … ERR` fires on the same conditions that make `-e` exit, so it looks like the natural place to print a diagnostic. But by default **the ERR trap is not inherited by functions, command substitutions, or subshells**. My failing `mkdir` was one level down, inside a function. Errexit did its job and killed the script. The trap, registered in the top-level shell, never saw a failure that happened in the function's scope. Exit 1, and silence — which is precisely the log entry that tells you nothing at 03:00.

The fix is `-E`, `errtrace`, which makes the ERR trap follow you into functions and subshells. The handler I run now names the command, not only the line, because bash keeps the pieces in `BASH_COMMAND` and `BASH_LINENO`:

```bash
#!/bin/bash
set -Eeuo pipefail
CROSS="✗"

on_err() {
  local code=$?     # first line, before anything else overwrites it
  echo "$CROSS failed: '${BASH_COMMAND}' (line ${BASH_LINENO[0]}, exit ${code})" >&2
}
trap on_err ERR
```

With that at the top, the same full-disk night would have logged `✗ failed: 'mkdir -p /var/export/2026-09' (line 41, exit 1)` and I would have been back in bed by 03:15. `-E` is the flag missing from nearly every strict-mode line on the internet. If you take one thing from this, take the E.

## The other silent spot: local

The second thing I found in that script once I could see it was a line I had written dozens of times: `local out=$(some_command)`. That line never triggers errexit, and no trap fires for it, because `local` is a command in its own right and its exit status — success, it declared the variable — is the one bash sees. The command substitution's failure is discarded before anyone looks. Declare on one line, assign on the next, and the failure is yours again. It is two lines instead of one everywhere you capture output into a local, and it is the bug behind ShellCheck's masked-return-value warning, which is not pedantry.

One caveat so you do not chase a ghost: with `-E` set, a failure inside an explicit `( subshell )` fires the trap twice — once in the subshell, once in the parent as the non-zero status propagates. That is expected. If duplicate alerts matter, guard on a flag or move the work out of the subshell.

## Cleanup on every path, and when to leave it all off

The ERR trap tells you what broke; the EXIT trap is what stops the script leaving a half-written file behind for the next stage to load as if it were complete. It runs on every termination, and the rule that makes or breaks it is the same one as above: capture `$?` on the first line of the handler. Move `local code=$?` below the `rm -f "$TMP_FILE"` and it reports rm's status — zero, forever — and the script exits clean after a failure. That is how a script with strict mode at the top ends up reporting success. Not that I have done that.

Strict mode is also not the right default everywhere. A health checker that runs twenty probes and expects some to fail will spend more `|| true` than logic fighting `-e`. `.bashrc` should never set it, because one failed command would close your terminal. And `grep -q` used as a test returns non-zero as data, not as an error. The guide covers where to leave it off, rather than pretending the flags are free.

## What the log says now

The export script opens with `set -Eeuo pipefail`, both traps registered before any work happens, `$?` captured first in each handler, locals declared and assigned on separate lines. The next night it fails, the log will say which line and which command. That is the whole difference between a script that exits 1 and a script that tells you why.

The full template with every behaviour checked against bash 5.3 — where errexit goes silent, the `nounset` defaults for variables that are only unbound in staging, and the assembled skeleton: https://bashsnippets.xyz/guides/safe-bash-script-template

If you would rather not type it, the [Bash Boilerplate Generator](https://bashsnippets.xyz/tools/bash-boilerplate-generator) emits this shape with your script name filled in, [trap cleanup on exit](https://bashsnippets.xyz/snippets/bash-trap-cleanup) works the mktemp-and-atomic-mv half in full, and the rest of the library is at https://bashsnippets.xyz
