---
title: "set -euo pipefail Is Missing a Letter. My ERR Trap Stayed Silent Until I Added -E."
published: true
description: "A strict-mode script died with exit 1 and a log that said nothing — because the ERR trap that should have named the line does not fire inside functions unless you add -E. What each strict-mode flag actually promises, where it goes silent, and the handler that prints the failing command."
tags: bash, linux, devops, scripting
canonical_url: https://bashsnippets.xyz/guides/safe-bash-script-template
cover_image: https://bashsnippets.xyz/ogimage.png
---

Here is a nine-line script that does everything the strict-mode articles tell you to. `set -euo pipefail` on line 2. On line 3, an ERR trap whose entire job is to print the failing command and its line number: `trap 'echo "✗ failed: ${BASH_COMMAND} (line ${LINENO})" >&2' ERR`. Then a helper function that runs `mkdir /proc/export`, a directory that cannot be created, standing in for a full disk or a missing mount.

I ran it on my machine, bash 5.3.9. It printed `start`, then mkdir's own complaint, then exited 1. The trap said nothing. No failing command, no line number — the two facts it was registered to report. From a nightly job, that is the log you get: a start banner, one stderr line if you are lucky, and an exit code that tells you something broke but not what.

Then I changed one character, `set -Eeuo pipefail`, and ran it again. Same mkdir error, followed by `✗ failed: mkdir /proc/export (line 5)`, and exit 1. The trap had been fine all along. Nobody had told it to follow the script into the function, and a function is where most real failures happen.

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

With that at the top, a failure anywhere in the script logs the command, the line and the exit status instead of nothing. `-E` is the flag missing from nearly every strict-mode line on the internet. If you take one thing from this, take the E.

## The other silent spot: local

The second silent spot is a line most of us have written dozens of times: `local out=$(some_command)`. On the same box, a function running `local out=$(false)` under `set -euo pipefail` carried on to its next line and the script exited 0. That line never triggers errexit, and no trap fires for it, because `local` is a command in its own right and its exit status — success, it declared the variable — is the one bash sees. The command substitution's failure is discarded before anyone looks. Declare on one line, assign on the next, and the failure is yours again. It is two lines instead of one everywhere you capture output into a local, and it is the bug behind ShellCheck's masked-return-value warning, which is not pedantry.

One caveat so you do not chase a ghost: with `-E` set, a failure inside an explicit `( subshell )` fires the trap twice — once in the subshell, once in the parent as the non-zero status propagates. That is expected. If duplicate alerts matter, guard on a flag or move the work out of the subshell.

## Cleanup on every path, and when to leave it all off

The ERR trap tells you what broke; the EXIT trap is what stops the script leaving a half-written file behind for the next stage to load as if it were complete. It runs on every termination, and the rule that makes or breaks it is the same one as above: capture `$?` on the first line of the handler. Move `local code=$?` below the `rm -f "$TMP_FILE"` and it reports rm's status — zero, forever — and the script exits clean after a failure. That is how a script with strict mode at the top ends up reporting success: I ran that ordering against an `exit 3` on bash 5.3.9 and the script exited 0.

Strict mode is also not the right default everywhere. A health checker that runs twenty probes and expects some to fail will spend more `|| true` than logic fighting `-e`. `.bashrc` should never set it, because one failed command would close your terminal. And `grep -q` used as a test returns non-zero as data, not as an error. The guide covers where to leave it off, rather than pretending the flags are free.

## What the log says now

The template I start from now opens with `set -Eeuo pipefail`, both traps registered before any work happens, `$?` captured first in each handler, locals declared and assigned on separate lines. When it fails, the log says which line and which command. That is the whole difference between a script that exits 1 and a script that tells you why.

The full template with every behaviour checked against bash 5.3 — where errexit goes silent, the `nounset` defaults for variables that are only unbound in staging, and the assembled skeleton: https://bashsnippets.xyz/guides/safe-bash-script-template

If you would rather not type it, the [Bash Boilerplate Generator](https://bashsnippets.xyz/tools/bash-boilerplate-generator) emits this shape with your script name filled in, [trap cleanup on exit](https://bashsnippets.xyz/snippets/bash-trap-cleanup) works the mktemp-and-atomic-mv half in full, and the rest of the library is at https://bashsnippets.xyz
