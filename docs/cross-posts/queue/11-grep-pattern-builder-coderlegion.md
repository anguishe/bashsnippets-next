<!-- Posting cadence rule: max 1 CoderLegion post per week. Do not queue this alongside another CoderLegion post in the same week. -->

# Why `grep "error|failed"` finds nothing in a log full of failures

If grep returns empty on a file you know contains matches, suspect the pattern before the file. Default grep uses Basic Regular Expressions (BRE), where `|`, `+`, `?`, and `()` are literal characters unless backslash-escaped. So `grep "error|failed" app.log` searches for the literal twelve-character string `error|failed` — pipe included — which no logger ever writes. Alternation needs Extended Regular Expressions via `-E`:

```bash
grep "error|failed" app.log     # BRE: literal string, matches nothing
grep -E "error|failed" app.log  # ERE: matches either word
```

The dangerous part is the exit behavior. An impossible pattern is not a syntax error, so grep exits 1 — the same code as "no matches in a clean file" — and prints nothing. A wrong question and a healthy log look identical, which is how this bug hides inside monitoring checks and cron pipelines for days.

Two related traps: `-P` (Perl regex, `\d`, lookaheads) is GNU-only and fails on macOS/BSD grep, and bare grep aimed at a directory refuses with "Is a directory" unless `-r` is set.

When I'm unsure what a pattern will match, I assemble the command in this [grep command builder with a live match tester](https://bashsnippets.xyz/tools/grep-pattern-builder) — paste a sample line you know should match, and a zero count tells you the pattern is the bug before the empty result gets believed.
