# SC2034: ShellCheck Flagged a Variable in My Own Repo. It Was Right.

On 2026-07-19 the README of the script repository behind my site said every script in it was ShellCheck-clean. It was not. `shellcheck -S style` across the 31 scripts that day found six with findings, and three of those failed on the same code: SC2034, "appears unused".

Two of them, `bash-functions-arguments.sh` and `find-large-files-linux.sh`, defined `CROSS="✗"` beside `CHECK="✓"` and never printed it. The third was worse. `ssh-key-setup-script.sh` carried `KEY_BITS="4096"  # Only used for RSA keys`, and nothing used it, because the script generates ed25519 keys. Commit `093febd` deleted the three lines. The first two were clutter. The SSH one lied: anyone reading that script would reasonably believe the RSA key size was configurable. I had published a claim about my own code that a linter disproved in under a second.

## The unused variable is rarely the bug

SC2034 is a warning that a variable is assigned in the file and never read in it. The message says "verify use", and that wording matters, because the dead assignment is usually one half of a typo whose other half is live. To show that, I re-ran the page's example on this box today (ShellCheck 0.11.0, bash 5.3.9): a log-pruning script with a one-letter mismatch.

```bash
#!/bin/bash
set -eo pipefail
log_dir="$PWD/logs"
retention_days=30
find "$log_dir" -name '*.log' -mtime +"$retention_day" -delete
echo "pruned old logs"
```

ShellCheck reports the pair. On line 4: `SC2034 (warning): retention_days appears unused. Verify use (or export if used externally).` On line 5: `SC2154 (warning): retention_day is referenced but not assigned (did you mean 'retention_days'?).`

That combination is the tell. An SC2034 on one line and an SC2154 on the next, with a `did you mean` pointing back at it, is a typo, and the fix is to spell the name the same way twice.

Running the broken version shows why it deserves the attention. `$retention_day` expands to nothing, so `find` receives `-mtime +` and refuses with `invalid argument` for the `+` it was handed, exit 1, and both my test files, `new.log` and a 60-day-old `old.log`, still there. That is the lucky outcome. The prune never runs and the disk fills slowly. Written with the common defensive habit `-mtime +${retention_day:-0}`, `find` would have received `-mtime +0` and deleted every log older than today. With `set -u` the script stops instead, and on my run `bash -u before.sh` did exactly that: `retention_day: unbound variable`, exit 1, before `find` ran at all.

After fixing the spelling, `shellcheck after.sh` exited 0, and running it printed `pruned old logs` and left only `new.log`.

## When SC2034 is wrong, and how to say so honestly

ShellCheck sees one file at a time. A `lib.sh` that defines `CHECK` and `CROSS` for the scripts that source it gets flagged on every variable it does not read itself. Two fixes are honest. `export` silences it, and is correct only if a child process reads the variable; exporting to hush the warning leaks it into every command the script runs, which is how a `KEY_BITS` ends up in a subprocess that never asked for it. The other is a file-level `# shellcheck disable=SC2034` after the shebang, with the reason in the comment ("sourced by the deploy scripts") so the next reader knows the variables live elsewhere. `shellcheck -x` on the caller follows the `source` line and sees both sides.

Loop counters you never read are the other common case. `for i in 1 2 3; do echo ping; done` earned `i appears unused` on my run; the same loop with `_` as the variable passed. The convention carries over to `read -r _ second`, which keeps the second field and discards the first without a warning.

To lint for this one rule alone, `shellcheck --include=SC2034 script.sh` does it; a project-wide exception goes in `.shellcheckrc` as `disable=SC2034`, which is rarely the right call.

Before reaching for any disable, search the file for the name once. Most of the time the variable really is dead, and the right fix is deleting the line. That is what I should have done before the README said "clean".

---

The full SC2034 page, with the single-quote case that pairs it with SC2016, the config-file directive, and the flags to include or exclude the rule: https://bashsnippets.xyz/shellcheck/sc2034

The use side of the same typo is the [SC2154 deep dive](https://bashsnippets.xyz/shellcheck/sc2154), and any other code can be pasted into the [ShellCheck Error Decoder](https://bashsnippets.xyz/tools/shellcheck-error-decoder). The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/shellcheck/sc2034

<!-- Medium tags to set in the UI: Bash, Linux, Shell Scripting, DevOps, Programming -->
