---
title: "grep Found 5 Matches for a Hostname I Expected 3 Times. sed Would Have Rewritten All 5."
published: true
description: "A test config tree, one hostname to rename, and an unescaped dot that matched apixinternal and a binary cache. The reflex recursive sed rewrote every one of them and exited 0; find to scope, grep to confirm, sed with .bak edited exactly two files."
tags: bash, linux, devops, tutorial
canonical_url: https://bashsnippets.xyz/guides/bash-text-processing
cover_image: https://bashsnippets.xyz/ogimage.png
---

To see how a routine rename goes wrong, I built a small config tree on my own machine. `conf.d/app.conf` points an upstream at `api.internal:8080`. `conf.d/health.conf` has a health-check URL on the same host. `samples/example.conf` is a sample shipped as documentation and should never change. `conf.d/docs.conf` sets `doc_host = apixinternal.example.com`, a different host that happens to look similar. And `cache.bin` is a binary file that contains the string. The job: move the live config from `api.internal` to `api-v2.internal`.

The reflex is one line: `sed -i "s/api.internal/api-v2.internal/g" $(grep -rl "api.internal" myapp)`. It exited 0. Afterwards the two live files were correct — and `docs.conf` now read `doc_host = api-v2.internal.example.com`, the sample had been rewritten, and the binary cache had been edited in place. Five files touched, two intended, and nothing in the output to say so.

## Two mechanisms, one bad afternoon

The shallow one is regex. In `api.internal` that dot is not punctuation; it is a wildcard matching any single character, in `grep` and `sed` alike. So the pattern does not mean "this hostname", it means "this substring, with anything in the middle, wherever it appears", which is how `apixinternal` matched. When you mean a literal dot, escape it (`api\.internal`); when you mean a literal string, `grep -F` says so outright.

The deep one is order. `sed -i` writes over the original file the instant the pattern matches — no preview, no confirmation, no undo unless you supply one. Text processing on a live tree is a pipeline with a sequence: `find` decides which files may be touched, `grep` shows what will actually change, `sed` or `awk` makes the change, and a diff earns your trust afterwards. The one-liner started at step three and pointed it at everything grep could see.

## grep: count the matches before you rewrite them

The search that should come first is the same one the one-liner hid inside `$( )`. Run on its own, `grep -rn "api.internal" myapp` printed five hits: the two live lines, the sample, the `apixinternal` line in `docs.conf`, and `binary file matches` for the cache. I expected three. That mismatch is the entire value of the step: the extra two lines are the damage, caught at read time instead of write time.

With the dot escaped and the search limited to config files — `grep -rn 'api\.internal' myapp --include="*.conf"` — the count dropped to three: the two live lines and the sample. Closer, and still one file too many.

## find: print the blast radius

Every bulk edit begins with a file list, and the default list, "everything under this directory, including whatever I forgot lives there", is the dangerous one. `find myapp -type f -name "*.conf" -not -path "*/samples/*"` printed three candidates: `app.conf`, `docs.conf` and `health.conf`. The `-not -path` is the single flag that keeps documentation out of a rename. Read that output like a checklist; anything destructive should only ever receive filenames that appeared on it.

## sed: transform with an undo you did not have to build

`-i.bak` edits in place and leaves a `.bak` copy of every original: a full rollback for the price of four characters. It is also the portable spelling. GNU sed treats the backup suffix as optional, but BSD and macOS sed require one, so a bare `sed -i 's/old/new/'` that works on Linux swallows your expression as the suffix on a Mac.

Composed, on a fresh copy of the same tree:

```bash
# Scope with find, confirm with grep, transform with a per-file undo
find myapp -type f -name "*.conf" -not -path "*/samples/*" \
  -exec grep -l 'api\.internal' {} + \
  | xargs sed -i.bak 's/api\.internal/api-v2.internal/g'
```

It edited `app.conf` and `health.conf` and left a `.bak` beside each. `docs.conf` was a candidate from `find` but `grep -l` with the escaped dot never selected it, so `apixinternal.example.com` survived. The sample was never a candidate. The binary cache was never a candidate. Two files changed, the two I meant. (If the tree can hold filenames with spaces, `grep -lZ` into `xargs -0` closes the word-splitting gap.) Then diff one file against its `.bak` before believing the run.

## awk: when the question is a column, not a line

`grep` and `sed` think in lines. The moment your question is about a field — total bytes served from column 10 of an access log, requests grouped by status code — that is `awk`, which splits every line into `$1` through `$NF` and runs a small program per line. Its `END` block fires once after the last line, which is how a million-line log becomes a single number. Chain all four stages and you get the command worth keeping for incidents: `find` scopes to today's logs, `grep` pulls the error lines, `awk` strips the timestamp fields so identical errors collapse together, and `sort | uniq -c | sort -rn | head` ranks them.

## The list worth printing

The unscoped one-liner did nothing wrong by its own rules: pattern found, substitution made, exit 0, five times. The difference between five files and two was an explicit file list, an escaped dot, and one grep read before the write. Scope, confirm, transform, verify. In that order this work is boring, and boring is the goal.

The full guide, with each stage's flags and the incident-triage pipeline in copy-paste form: https://bashsnippets.xyz/guides/bash-text-processing

If you would rather assemble the flags than memorize them, the [find command builder](https://bashsnippets.xyz/tools/find-command-builder) and [grep pattern builder](https://bashsnippets.xyz/tools/grep-pattern-builder) construct and explain the exact invocation before you run it. The rest of the library is at https://bashsnippets.xyz
