# grep "error|failed" Found Nothing in a Log That Said 'backup failed'

I wrote a three-line backup log on my own machine: a start line, `tar: /var/www/uploads: Cannot open: Permission denied`, and `backup failed (exit 2)`. Then I ran the check a lot of people keep as a weekly ritual, the one that looks like it asks "did anything go wrong?": `grep "error|failed" backup.log`.

GNU grep 3.12 printed nothing and exited 1. The last line of the log says `failed` in plain text.

`grep -E "error|failed" backup.log` printed that line and exited 0.

Nothing about the first command is malformed, so there is no error message. Exit 1 means "no lines matched", which is exactly what grep returns for a genuinely clean log. A monitoring check wired to that exit code reports all clear on a log full of failures, every single run, and the empty output does not start an investigation. It ends one.

## The pipe that isn't a pipe

grep's default engine is Basic Regular Expressions, and in BRE the pipe is not alternation. It is a literal character. `error|failed` does not mean "error or failed"; it means the twelve-character string `error|failed`, pipe included, which no logger has ever written. The same goes for `+`, `?` and parentheses: in BRE they are ordinary characters unless you backslash-escape them. Alternation the way every other regex engine behaves needs `-E`, Extended Regular Expressions — the mode `egrep` has been shorthand for since long before most of us started typing it.

```bash
# BRE (default): the pipe is a literal character — matches nothing, exits 1
grep "error|failed" backup.log

# ERE: the pipe means OR — the search you actually meant
grep -E "error|failed" backup.log
```

GNU grep also accepts `grep "error\|failed"` in BRE mode — on my machine that matched and exited 0 — but the escaped pipe is a GNU extension that POSIX does not define, so it is a habit that stops working on the systems that do not carry GNU grep. `-E` is the portable spelling.

The deeper trap is in the exit codes. grep exits 0 on a match, 1 on no match and 2 on an actual error; pointed at a file that did not exist, it printed `No such file or directory` and exited 2. An impossible pattern is not an error. "No matching lines" and "you searched for a string that cannot exist" produce identical output: none, with the same status. A false negative is the worst failure a search tool has, because nobody goes looking for a problem that grep has just said is not there.

## The alias is a crutch

The tempting fix is `alias grep='grep -E'` in your shell rc file, and it does make the interactive ritual behave. It also does nothing anywhere that matters. Aliases apply only to interactive shells, so every cron job and script on the same box still runs BRE grep. The alias does not exist on any machine you have not configured, which is most of the machines you will ever SSH into. And it trains your fingers to type patterns that silently degrade the moment it is absent. The durable fix is knowing which engine a grep runs under and what its silence means before you trust it — and writing `-E` into the script itself.

## So the builder shows the engine and the empty result

The [grep Pattern Builder](https://bashsnippets.xyz/tools/grep-pattern-builder) assembles the command live as you type: pattern, path, and an optional comma-separated list of file types that it turns into `--include` flags, so a log search does not wade through binaries. Toggles cover the flags that earn their keep — case-insensitive, recursive, line numbers, invert, count, filenames-only, whole-word, quiet and `-B`/`-A` context lines — and every combination produces a plain-English sentence saying what the command will do before you run it.

The engine picker sits front and centre: BRE, `-E` and `-P`, each with a note about what is literal where. The BRE note says it outright: `+ ? | ( )` are literal unless escaped. The `-P` note warns that Perl-compatible regex is GNU-only and fails on macOS and BSD grep, the portability cousin of the same trap: a `\d` pattern that works on a Debian server errors out on a Mac.

There are guardrails for mistakes people ship. It turns on `-r` when the path looks like a directory, because plain grep pointed at a directory refuses with "Is a directory", and in a script with stderr redirected that refusal is invisible. It drops `-n` when `-c`, `-l` or `-q` is active, because those flags change the output mode and line numbers stop meaning anything.

The panel that makes the ritual trustworthy is the live tester. Paste a few sample lines, including one real failure line from your actual log, and it highlights which lines the current pattern matches, with a count. In BRE mode it treats a bare pipe literally, the way grep does, so `error|failed` against a pasted `backup failed` line highlights nothing: zero out of one, a number that makes you look up. Switch to `-E` and the line lights. The preview runs on JavaScript's regex engine, which is close to ERE and PCRE for everyday patterns — treat it as a check on your pattern, not a replacement for running grep.

One unescaped character turned a failure search into a search for a string that cannot exist, and grep answered that question with perfect accuracy. The command was valid, ran clean, exited 1, and reported nothing wrong.

Build the command and read the explanation before you trust it: https://bashsnippets.xyz/tools/grep-pattern-builder

The [Search Files for Text snippet](https://bashsnippets.xyz/snippets/search-files-for-text-grep) covers the grep patterns worth keeping, [Delete Old Log Files](https://bashsnippets.xyz/snippets/delete-old-log-files) handles the other half of log hygiene, and the rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/tools/grep-pattern-builder

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Programming, Command Line -->
