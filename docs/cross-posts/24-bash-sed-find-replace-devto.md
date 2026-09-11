---
title: "sed 's/port/listen_port/g' Changed Four Lines. I Wanted One."
published: true
description: "A four-line config, one key rename, and GNU sed also rewrote support, transport and report — exit 0, no warning. Why sed matches characters rather than words, the \\b that fixes it, and the one pipe that shows the damage before it is written."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/bash-sed-find-replace
cover_image: https://bashsnippets.xyz/ogimage.png
---

Renaming a config key is the job sed exists for, so I gave it the smallest honest test I could build on my own machine: a four-line YAML file and the rename most people type first. The file held `port: 8080`, `support_email: ops@example.com`, `transport: tcp` and `report_dir: /var/reports`. The command was `sed -i 's/port/listen_port/g' app.yml`.

GNU sed 4.9 returned immediately, exit 0, no output. `-i` edits in place and prints nothing, so there was nothing to read until I opened the file:

```text
listen_port: 8080
suplisten_port_email: ops@example.com
translisten_port: tcp
relisten_port_dir: /var/relisten_ports
```

One line was meant to change. All four did. The email key is now a word no program will look up, the transport key is gone, and `report_dir` points at `/var/relisten_ports`, a directory that does not exist. Nothing failed. sed did what the command said, and the command said something different from what I meant. Across a service tree of forty config files that is not four bad lines; it is every file that happens to contain the letters, and you find out from whatever reads them next.

## sed matches characters, not words

`s/port/listen_port/g` means: wherever the four characters p-o-r-t appear, replace them. Inside `support`. Inside `transport`. Inside `report`, and twice on the `report_dir` line because `reports` carries them again. sed has no idea what a word is unless the pattern tells it.

Three defaults stack into the failure, and none of them is a sed bug. An unanchored pattern that matches more than you pictured. `-i`, so there is no output to review. And a glob like `*.yml` or a `find | xargs` that reaches more files than you have opened. Each one is a default you have to refuse on purpose.

## Fix one: tell sed where the word ends

GNU sed understands `\b` as a word boundary, a zero-width match between a word character and a non-word character. On the same original file, `sed -i 's/\bport\b/listen_port/g' app.yml` changed exactly one line, `listen_port: 8080`, and left the other three alone. In `support`, the `p` of `port` sits right after another word character, so `\b` refuses to match there.

Two details matter before you trust it. Underscore counts as a word character, so `\bport\b` will not touch the `port` inside `db_port` either — usually what you want, occasionally not. And `\b` is a GNU extension: BSD sed on macOS documents `[[:<:]]` and `[[:>:]]` for word start and end instead. A script that has to run on both platforms should not assume either spelling.

## Fix two: read the diff before anything is written

The habit that matters more than any regex is refusing to let the first run be the in-place one. Drop `-i` and pipe sed's output into `diff` against the original: `sed 's/port/listen_port/g' app.yml | diff app.yml -`. On my test file that printed all four lines as changed, `suplisten_port_email` included, while the file on disk stayed intact. The whole disaster, on screen, costing nothing.

`diff` exits 1 when it finds differences, so the check works in a script as well as at a prompt. For more than one file, the shape that holds up is three steps. Build the file list with `grep -rl` first, so sed only ever touches files that contain the pattern and everything else keeps its modification time — build caches and rsync care about that. Show a diff per file. Then require an explicit `--apply` before a single byte is written. The default fails toward reading, not writing. If you forget the flag, the worst outcome is a diff you did not want to see.

## Three more places the same command bites

The replacement side has its own special character. An unescaped `&` in the replacement means "the entire match", so `s/CEO/Smith & Sons/` turns `CEO` into `Smith CEO Sons`. Write `\&` when you mean an ampersand.

The delimiter is yours to choose. `s|/var/www/html|/srv/www|g` is the same command as the version with every slash escaped, and it is the one you can still read under pressure. Pick a character that appears in neither side.

When the pattern comes from a shell variable, it is still a regex. `OLD=staging.internal` matches `stagingXinternal` too, because the dot means any character, and a `|` or `&` inside the value breaks the command outright. For values you control, a delimiter the value cannot contain is enough. For arbitrary input — filenames, anything a user typed — escape the variable first or use a tool that does literal replacement.

And the macOS trap that eventually costs every mixed team an afternoon: GNU `-i` takes an optional suffix, BSD `-i` requires one. On a Mac, `sed -i 's/old/new/g' file` treats the script as the backup suffix and then tries to run the filename as the program. The BSD spelling is `sed -i '' 's/old/new/g' file`.

## Where sed stops

sed works one line at a time, so a plain `s///` never matches across a newline. For multi-line surgery, `awk` or `perl -0pe` are the honest tools. And if the file is JSON or YAML with real structure, stop doing regex on it; a field-aware tool such as `jq` parses instead of pattern-matching, which is the entire reason it exists.

The rename I wanted needed two characters of anchoring and one pipe to `diff`. The version without them exited 0 and rewrote four lines out of four.

---

The full bulk-replace script — `grep -rl` file list, per-file diff, `--apply` gate, GNU/BSD `-i` detection — with the line-by-line breakdown and the FAQ on delimiters and multi-line matches: https://bashsnippets.xyz/snippets/bash-sed-find-replace

For the discovery half of the job, [searching files with grep](https://bashsnippets.xyz/snippets/search-files-for-text-grep) covers finding the text before you replace it, and the [Grep Pattern Builder](https://bashsnippets.xyz/tools/grep-pattern-builder) builds anchored patterns interactively. The rest of the library is at https://bashsnippets.xyz
