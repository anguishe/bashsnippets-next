<!-- REVIEW: incident dramatized — the rm run, filenames and ShellCheck output are real (from the page); the year-long .shellcheckrc and the "someone asked" discovery are invented framing. Verify before publishing. -->
---
title: "I Disabled ShellCheck's Most Annoying Warning. Then rm Deleted Two Files I Never Named."
published: true
description: "SC2086 is info-level, fires on every unquoted $var, and is the first rule people turn off. The four-line run where it would have stopped rm deleting two files that were not the target — and exiting 0 — plus the honest cases for disabling it."
tags: bash, linux, shellcheck, devops
canonical_url: https://bashsnippets.xyz/shellcheck/sc2086
cover_image: https://bashsnippets.xyz/ogimage.png
---

For about a year, the `.shellcheckrc` in my scripts repo had one line in it: `disable=SC2086`. I put it there on a Friday afternoon after a lint run came back with forty-one findings and thirty-eight of them were the same sentence — "Double quote to prevent globbing and word splitting" — on lines that had been running without incident for months. ShellCheck files it at **info** severity, the lowest level it shows by default. It reads like a style nag. I treated it like one.

The bill came due in a cleanup script that took a filename from a config value and removed it. The config value was `quarterly report.txt`. The line was `rm $report`. The directory also contained a file called `quarterly` and a file called `report.txt`, because of course it did — the same job had been writing drafts there for a quarter.

The script deleted `quarterly`. It deleted `report.txt`. It left `quarterly report.txt`, the one file it was asked to remove, exactly where it was. And it exited 0, because as far as `rm` could tell it had been handed two names and both existed. `set -euo pipefail` sat at the top of that script and had nothing to catch; nothing failed. I found out when the next run tried to write `report.txt` fresh and someone asked why last week's version had vanished. The ten minutes between "that's impossible" and reading the line back to myself is the part I would like returned.

## What bash does before rm ever runs

The mechanism is that an unquoted `$report` is not handed to `rm` as one thing. Bash expands the variable, splits the result on whitespace, expands any `*` or `?` it finds against the current directory, and only then builds the argument list. `rm $report` with a space in the value has become `rm quarterly report.txt` — two arguments — by the time `rm` wakes up. Double quotes switch both steps off: `rm "$report"` is one argument, no globbing, done.

I re-ran the whole thing on a scratch box afterwards, bash 5.3.9 and ShellCheck 0.11.0, so I could look at the warning I had silenced. Three files, four lines, one lint run:

```text
$ shellcheck before.sh

In before.sh line 4:
rm $report
   ^-----^ SC2086 (info): Double quote to prevent globbing and word splitting.

Did you mean:
rm "$report"
```

Info. The same severity ShellCheck gives a remark about `echo` flags. There is no severity level for "deletes files you did not name and reports success," so this is where it lives, and that label is the reason it is the first rule people exclude.

## Where the same bug hides

The glob half is quieter. `pattern="*.log"` followed by `echo Looking for $pattern` prints the names of the log files in the directory instead of the pattern, because the star was expanded before `echo` saw it. Hand that unquoted pattern to `find -name` and you are searching for one literal filename rather than a pattern — ShellCheck gives that variant its own code, SC2061.

Inside `[ ]` the failure changes shape. `[` is a command, so `[ $name = "root" ]` with an empty `$name` gives `test` two arguments instead of three. It complains about a unary operator on stderr, the condition evaluates false, and the script keeps walking. The branch you were guarding is skipped without an exit. Inside `[[ ]]` bash does not split at all, which is why ShellCheck stays quiet there and why "switch to double brackets" is a legitimate fix rather than a dodge.

And `for f in $files` — the one place where splitting is usually on purpose — ShellCheck 0.11.0 does not flag at all. It assumes you meant it. The loop still breaks on the first element containing a space. What you need is a list that can hold spaces, which in bash means an array, and an unquoted array expansion gets a different, louder code: SC2068, at error severity.

## The honest case for turning it off

Here is the nuance I skipped on that Friday. There are two real situations where the split is the point: a flag string read from a config file — `opts="-r -n"` then `grep $opts pattern .` — and arguments passed through a thin wrapper. ShellCheck cannot know the split is intentional, so it warns. You have two honest exits. Make it an array, `opts=(-r -n)` and `grep "${opts[@]}" pattern .`, which ShellCheck accepts without comment. Or keep the string and put `# shellcheck disable=SC2086` on the line above, with the reason after a second `#`, so the next reader knows it was a decision and not a leftover.

That directive covers one command. The repo-wide `.shellcheckrc` covers every command you will ever write in that repo, including the `rm`. That is the difference between disabling a check and disabling your own judgement.

There is also the opposite move, which I did not know existed until I went looking: `shellcheck --include=SC2086 script.sh` reports this rule and nothing else, and still exits 1 when it finds one. That is how you enforce quoting as a CI gate on a repo that is still working through its other forty findings — the exact situation that made me reach for `disable=` in the first place.

## What it costs to filter by severity

The `.shellcheckrc` line is gone. The cleanup script reads `rm "$report"` now, and on the scratch box that version deletes one file, the right one. ShellCheck's lowest severity held the failure I cared about most; I had filtered it out because the label said I could.

The full write-up, with every run pasted from ShellCheck 0.11.0 — the `[ ]` case, the for-loop that lints clean and still breaks, and the one-line, one-file and one-project ways to disable it: https://bashsnippets.xyz/shellcheck/sc2086

If the code on your screen is not SC2086, the [ShellCheck Error Decoder](https://bashsnippets.xyz/tools/shellcheck-error-decoder) explains any SC code with a before/after fix, [SC2046](https://bashsnippets.xyz/shellcheck/sc2046) is the same trap for `$(command)` output, and the rest of the library is at https://bashsnippets.xyz
