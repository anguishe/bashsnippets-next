---
title: "Eleven Services Lost Checkout Because I Ran sed Before find"
published: true
description: "A recursive sed -i that worked flawlessly took checkout down on eleven services. The order is the safety system: find to scope, grep to confirm, sed to transform."
tags: bash, linux, devops, tutorial
canonical_url: https://bashsnippets.xyz/guides/bash-text-processing
cover_image: https://bashsnippets.xyz/ogimage.png
---

The rename was supposed to be a non-event. We were retiring `api.internal` for a new hostname, the old string lived all over a tree of config files, and I did what I'd done dozens of times: a recursive `sed -i` with one substitution. It exited zero. The file I spot-checked looked perfect. By the time the next deploy finished rolling out, checkout was down on eleven services — and I found out from an incident channel somebody else had to open.

The command had behaved flawlessly in four files I never opened. It rewrote health-check URLs that referenced the old host deliberately, because the migration plan needed to watch it. It edited a comment. It rewrote a sample config we ship as documentation. And it changed the one file where the old hostname was pinned on purpose, with a note a few lines up explaining exactly why nobody should touch it. To `sed`, all four were successes: pattern found, substitution made, exit 0.

The rollback ate the rest of the afternoon. The worse part came later, when I realized every one of those four files would have been plainly visible in a file list I never printed. Ten seconds of reading would have bought back four hours.

## Two mechanisms, one outage

The shallow one is regex. In `api.internal`, that dot is not punctuation — it's a wildcard matching any single character, in `grep` and `sed` alike. So the pattern doesn't mean "this hostname"; it means "this substring, with anything in the middle, wherever it appears" — comments, URLs, and sample blocks included. When you mean a literal dot, escape it (`api\.internal`); when you mean a literal string, `grep -F` says so outright. Either way, the pattern in your head is narrower than the one the machine runs.

The deep one is order. `sed -i` writes over the original file the instant the pattern engine is satisfied — no preview, no confirmation, no undo unless you supply one. Text processing on a live tree is a pipeline with a sequence: `find` decides which files may be touched, `grep` shows what will actually change, `sed` or `awk` performs the change, and a diff earns your trust afterward. I had started at step three and pointed it at everything.

## find: print the blast radius before touching it

Every bulk edit begins with a file list, and the default list — "everything under this directory, including whatever I forgot lives there" — is the dangerous one. `find /etc/myapp -type f -name "*.conf"` makes the list explicit, and the exclusions are where the safety lives: `-not -path "*/samples/*"` is the single flag that would have kept my sample config out of the blast. Read the output like a checklist. Anything destructive should only ever receive filenames that appeared on it.

## grep: count the matches you're about to rewrite

Before the edit, run the search: `grep -rn "api\.internal" /etc/myapp --include="*.conf"`. The `-n` gives you line numbers to jump to; `--include` keeps it out of binaries. Then compare the hit count against the number in your head. If grep reports 23 and you expected 9, those extra 14 lines are the outage you were about to write to disk. That surprise, caught at read time instead of write time, is the entire value of the step.

## sed: transform with an undo you didn't have to build

`-i.bak` edits in place and leaves a `.bak` copy of every original — a full rollback for the price of four characters. It's also the portable spelling: GNU sed treats the backup suffix as optional, but BSD and macOS sed require one, so the bare `sed -i 's/old/new/'` that works on your Linux box will swallow your expression as a suffix on a Mac. The tidy-looking flag is the fragile one.

Composed, the fix for my incident looks like this:

```bash
# Scope with find, confirm with grep, transform with a per-file undo
find /etc/myapp -type f -name "*.conf" -not -path "*/samples/*" \
  -exec grep -l "api\.internal" {} + \
  | xargs sed -i.bak 's/api\.internal/api-v2.internal/g'
```

`find` restricts the candidates, `grep -l` narrows them to files that genuinely match, and `sed` touches only those, leaving a `.bak` beside each. (If the tree can hold filenames with spaces, `grep -lZ` piped into `xargs -0` closes the word-splitting gap.) Two more habits worth keeping: the trailing `g` replaces every occurrence on a line rather than silently stopping at the first, and when the text is full of slashes — paths, URLs — switch delimiters (`s|/old/path|/new/path|g`) instead of escaping a fencerow of them. Then diff one file against its `.bak` before believing the run.

## awk: when the question is a column, not a line

`grep` and `sed` think in lines. The moment your question is about a *field* — total bytes served from column 10 of an access log, requests grouped by status code — that's `awk`, which splits every line into `$1` through `$NF` and runs a small program per line. Its `END` block fires once after the last line, which is how a million-line log becomes a single number. Two shapes cover most real questions: accumulate into a running total, or accumulate into a keyed array for a group-by.

Chain all four and you get the command I actually reach for mid-incident: `find` scopes to today's logs, `grep` pulls the error lines, `awk` strips the timestamp fields so identical errors collapse together, and `sort | uniq -c | sort -rn | head` ranks them by frequency. The top line of that output has named the real problem for me faster than any dashboard has.

## The list I didn't print

Eleven services didn't go down because sed is sharp. They went down because I handed a destructive command an implicit file list instead of an explicit one, driven by a pattern looser than I believed. Scope, confirm, transform, verify — in that order, this work is boring. Boring is the goal.

The full guide, with each stage's flags and the incident-triage pipeline in copy-paste form: https://bashsnippets.xyz/guides/bash-text-processing

If you'd rather assemble the flags than memorize them, the [find command builder](https://bashsnippets.xyz/tools/find-command-builder) and [grep pattern builder](https://bashsnippets.xyz/tools/grep-pattern-builder) construct and explain the exact invocation before you run it. The rest of the library is at https://bashsnippets.xyz
