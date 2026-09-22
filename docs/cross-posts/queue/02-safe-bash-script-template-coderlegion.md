<!-- SCHEDULED on CoderLegion 2026-09-21 as https://coderlegion.com/28017 - publishes Tue 2026-09-22 08:00 CDT, same minute as dev.to #02. Editing this file does NOT reach CoderLegion: edit the post there too. -->

# My ERR trap stayed silent until I added one letter to set -euo pipefail

A nine-line script, `set -euo pipefail` on line 2 and an ERR trap on line 3 whose only job is to print the failing command and its line number. A helper function then runs `mkdir /proc/export`, a directory that cannot be created. On bash 5.3.9 it printed mkdir's own complaint and exited 1. The trap said nothing: no command, no line, the two facts it was registered to report.

By default the ERR trap is not inherited by functions, command substitutions or subshells. Errexit killed the script from inside the function; the trap, registered at the top level, never saw the failure. One letter fixes it:

```bash
set -Eeuo pipefail
trap 'echo "✗ failed: ${BASH_COMMAND} (line ${LINENO})" >&2' ERR
```

`-E` (errtrace) makes the trap follow the script into functions. Same run, same mkdir error, now followed by `✗ failed: mkdir /proc/export (line 5)`.

Two more silent spots from the same session. `local out=$(false)` inside a function carried on to the next line and the script exited 0, because `local` succeeded and its status is the one bash checks. Declare on one line, assign on the next. And in an EXIT handler, capture `$?` on the first line: moved below an `rm -f`, it reports rm's zero, and a script ending in `exit 3` exits 0.

Where errexit goes silent, `nounset` defaults and the assembled skeleton with both traps are in the [strict-mode bash script template, checked against bash 5.3](https://bashsnippets.xyz/guides/safe-bash-script-template).
