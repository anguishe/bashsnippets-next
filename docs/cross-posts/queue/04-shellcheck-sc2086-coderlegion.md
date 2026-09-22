<!-- SCHEDULED on CoderLegion 2026-09-21 as https://coderlegion.com/28019 - publishes Tue 2026-09-29 08:00 CDT, same minute as dev.to #04. Editing this file does NOT reach CoderLegion: edit the post there too. -->

# ShellCheck rates SC2086 as info. It let rm delete two files I never named.

SC2086 sits at info, ShellCheck's lowest default severity, and fires on every unquoted `$var`, so it is usually the first rule anyone disables. I built the smallest test I could: a directory holding `quarterly`, `report.txt` and `quarterly report.txt`, and a four-line script under `set -euo pipefail`:

```bash
report="quarterly report.txt"
rm $report
```

It deleted `quarterly`. It deleted `report.txt`. It left the one file it was asked to remove, and exited 0. rm was handed two names and both existed, so strict mode had nothing to catch.

Bash expands the unquoted variable, splits the result on whitespace, globs any `*` or `?` against the current directory, and only then builds the argument list. `rm "$report"` is one argument with no globbing, and it deletes the right file.

The same bug hides in other shapes. `[ $name = "root" ]` with an empty `$name` gives `test` two arguments: a complaint on stderr, a false condition, and the script keeps walking. `for f in $files` is not flagged by ShellCheck 0.11.0 at all, and still breaks on the first name with a space.

When you do want the split, such as a flag string read from a config, use an array or a one-line `# shellcheck disable=SC2086` with the reason. A repo-wide `.shellcheckrc` disable covers every future `rm` as well. And `shellcheck --include=SC2086` runs it alone as a CI gate.

Every run, pasted from ShellCheck 0.11.0, is in the [SC2086 deep dive on word splitting and globbing](https://bashsnippets.xyz/shellcheck/sc2086).
