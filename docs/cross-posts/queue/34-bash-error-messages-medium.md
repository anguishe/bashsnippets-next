# Bash Said '-eq: unary operator expected'. The Script Still Exited 0.

Four lines of bash, one empty variable, two tests of it. I wrote it on purpose, in a scratch directory, to capture the error for a guide. The output is not what I expected to capture:

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

The first test printed an error. The second printed an answer, and the answer is wrong: `count` is not zero, it is empty. Then the script exited 0, so anything watching the exit code, a cron wrapper or a CI step, saw a clean run.

That is three separate lies from one bug, and only one of them is on stderr. The part I keep coming back to: if I had only written the `[[ ]]` line, the way most modern bash guides tell you to, there would have been no message at all. I would have trusted "queue empty".

## The message names the check, not the cause

`unary operator expected` points at `-eq`. The bug is the variable before it. `$count` is unquoted, and an empty unquoted variable is removed by word splitting before `[` ever runs. So `[` received `-eq 0` instead of `"" -eq 0`, tried to read `-eq` as a one-argument test like `-f`, and gave up with exit status 2. Inside an `if`, status 2 counts as "not true", so the branch was skipped and the script carried on. `[[ ]]` does no word splitting, so it saw an empty operand, and in an arithmetic comparison an empty string evaluates to 0. True.

The fix is to quote it, `[ "$count" -eq 0 ]`, which turns the error into an honest `integer expected`, or to give it a default with `"${count:-0}"` when empty really does mean zero.

That pattern, a message that names the check that failed rather than the reason, holds for almost every bash error I reproduced for the guide. Here is the syntax-error version, from a script missing one semicolon. Running it printed `` missing-then.sh: line 4: syntax error near unexpected token `fi' `` and exited 2. ShellCheck on the same file said `In missing-then.sh line 2` and pointed under `then` with SC1010: "Use semicolon or linefeed before 'then'".

bash blames line 4. The mistake is on line 2, where `then` without a `;` before it became one more argument to `[`. bash parses a whole `if ... fi` block before running it, and it reports the first token that cannot fit, which is the `fi` with no `then` open. The line number is where bash gave up, not where you went wrong. ShellCheck pointed at the right line on the first try.

## Permission denied, after chmod +x

The one that wastes the most time is `Permission denied` when the execute bit is already set. I reproduced it on a tmpfs mounted `noexec`, inside a throwaway mount namespace so nothing real was touched. After `chmod +x backup.sh`, running `./backup.sh` still printed `./backup.sh: Permission denied` and exited 126, and `findmnt -no OPTIONS --target backup.sh` answered `rw,noexec,relatime,uid=1000,gid=1000,inode64`.

`chmod` succeeded, the mode says executable, and the kernel still refused, because the filesystem forbids executing anything on it, root included. Exit 126 means "found it, could not run it". The other causes chmod cannot reach are a parent directory missing its `x` bit and a file owned by someone else, and `namei -l` on the full path shows both in one listing.

## The rest of the nine

The guide covers nine messages, each reproduced on my machine with the output pasted as it came out. `command not found` has six causes behind one exit code, 127, and `type -a` plus a look at cron's two-directory `PATH` separates them. `bad interpreter: No such file or directory` complains about a file that plainly exists, because the shebang ends in a Windows carriage return. `No space left on device` can fire on a filesystem `df -h` reports as 0% used, when the inodes ran out instead of the blocks. `Connection refused` can come from a service that is listening, on `127.0.0.1` only. And `Argument list too long` means `rm` never started, so nothing was deleted.

## The order I read any error in now

The message first, word for word, with the variable parts removed. Then the exit code: 127 not found, 126 found but not executable, 2 usually a syntax or usage error, 128+N killed by signal N. Then `bash -x`, which prints each command after expansion, so you see the `[ -eq 0 ]` bash actually ran instead of the `[ $count -eq 0 ]` you wrote. Then ShellCheck, which flags the unquoted `$count` as SC2086 before the script runs at all.

Then validate the value before you test it. I re-ran the same check under `set -euo pipefail`, and strict mode did nothing: `count=""` is set, so `set -u` stays quiet, and `set -e` ignores a failing command inside an `if` condition by design. The script printed the same error and then `still running`. What stopped it was one line that says what the variable must look like, `[[ $count =~ ^[0-9]+$ ]] || { echo "count is not a number: '$count'" >&2; exit 1; }`, which exited 1 and printed `count is not a number: ''`. A quoted variable makes the error honest. A validated one makes the script stop.

---

Full guide with all nine messages, the one check that tells each one's causes apart, and links to the fix for every case: https://bashsnippets.xyz/guides/bash-error-messages

If an exit code is all you have, the [Bash Exit Code Lookup](https://bashsnippets.xyz/tools/bash-exit-code-lookup) decodes it, and the [ShellCheck Error Decoder](https://bashsnippets.xyz/tools/shellcheck-error-decoder) explains the common SC codes ShellCheck prints. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/guides/bash-error-messages

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Programming, Shell Scripting -->
