<!-- Slot #34, scheduled Wed 2026-10-14 08:00 America/Chicago (13:00Z), same minute as dev.to #34. Canonical page /guides/bash-error-messages (live 2026-10-03). Output re-run 2026-10-03 in a scratch dir (bash 5.3.15). -->

# One empty variable, one error, one wrong answer, exit 0

I wrote four lines to capture a bash error for a guide. One empty variable, tested twice:

```text
$ cat queue-check.sh
#!/bin/bash
count=""
if [ $count -eq 0 ]; then echo "queue empty"; fi
if [[ $count -eq 0 ]]; then echo "queue empty ([[ ]])"; fi

$ bash queue-check.sh
queue-check.sh: line 3: [: -eq: unary operator expected
queue empty ([[ ]])
exit=0
```

The message blames `-eq`. The bug is the unquoted `$count` before it: word splitting removed the empty value, so `[` received `-eq 0` and failed with status 2, which an `if` treats as "not true". The `[[ ]]` line does no splitting, read the empty string as 0 in an arithmetic test, and printed a confident wrong answer. Then the script exited 0.

Strict mode does not help here. `count=""` is set, so `set -u` stays quiet, and `set -e` ignores failures inside an `if` condition. What stopped it was validating the value first: `[[ $count =~ ^[0-9]+$ ]] || exit 1`.

Most bash errors work this way. The message names the check that failed, not the cause: a syntax error reported on line 4 for a missing semicolon on line 2, `Permission denied` after `chmod +x` on a `noexec` mount. Nine of them, each reproduced with the check that names the cause, are in [Bash Error Messages, Decoded](https://bashsnippets.xyz/guides/bash-error-messages).
