---
title: "find -mtime +30 Kept a File That Was 30.5 Days Old. I Checked With touch -d."
published: true
description: "Age-based cleanup with find, tested on backdated files: -mtime +30 means 31 days, -delete placed before -name empties the directory, and xargs rm on a filename with a space deleted two other files. The preview-first retention command that avoids all three."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/delete-old-log-files
cover_image: https://bashsnippets.xyz/ogimage.png
---

Nothing on my Linux machine deletes anything by age unless I tell it to. `~/.cache` alone holds 47 GB right now — 13 GB of pip downloads, 11 GB of uv, 5 GB of browser cache — each one a program doing exactly its job, none of them with a retention policy. Application logs have the same shape: a writer that never stops and no reader. That is how a disk goes from fine to full without a single thing malfunctioning.

The standard fix is an age-based cleanup with `find`. It is also a command that deletes files, so before trusting it with anything real, I tested its three sharp edges on files I backdated with `touch -d`.

## Why a full disk lies to you

The reason prevention beats diagnosis here is what a full disk looks like when it arrives. The moment the filesystem runs out of blocks, every process that tries to write gets `ENOSPC` back from the kernel, and almost no application reports that as "the disk is full". You get a failed save in one program, a crashed build in another and a database complaint in a third, all worded differently, while the process that filled the disk goes quiet because it cannot write either. By the time symptoms appear they point everywhere except the cause.

## Aging files out with find

The tool has shipped with every Linux and macOS box for decades:

```bash
LOG_DIR="/var/log/myapp"
DAYS=30

# Preview pass — read this list before letting anything delete
find "$LOG_DIR" -type f -name "*.log" -mtime +"$DAYS" -print
```

Run that, read the output, and when the list holds exactly what you expect, swap `-print` for `-delete` and run it again. The three runs below are why the preview is not optional.

## Edge one: -mtime +30 does not mean 30 days

I created four logs dated 29 days, exactly 30 days, 30 and a half days, and 31 days back. `find . -name "*.log" -mtime +30 -print` printed one of them: the 31-day file. The 30.5-day file survived.

`find` measures age in whole 24-hour periods and throws the fraction away, so 30.5 days old counts as 30, and the `+` means strictly greater than. `-mtime +29` printed three files: 30, 30.5 and 31 days. If your policy says "keep 30 days", `+29` is the flag that enforces it. The off-by-one is invisible in a quick test and surfaces a month later as "why is that file still there".

## Edge two: -delete goes last, always

On a copy of the same directory I put the predicates in the wrong order: `find . -delete -name "*.log"`. Afterwards the directory had zero entries. Every log, the non-log `keep.txt`, everything.

`find` evaluates its expression strictly left to right, and `-delete` is an action that runs and returns true. Put it first and it executes on every file `find` walks, before `-name` ever gets a vote. There is no warning and no prompt. The fix is order: tests first, `-delete` at the very end.

## Edge three: never pipe filenames to rm

The reflex is `find … | xargs rm`. I made four files — `app v2.log`, `app`, `v2.log` and `keep.txt` — and ran `find . -name "app v2.log" | xargs rm`. When it finished, `app` and `v2.log` were gone. `app v2.log`, the one file the command was aimed at, was still there.

`xargs` split the filename on the space and handed `rm` two arguments, both of which happened to exist. That is the worst possible outcome: the target survives, two innocent files die, and `rm` reports nothing unusual. `-delete` never leaves `find` — no pipe, no word splitting — so it cannot do that. If you genuinely need another command, `-print0 | xargs -0` keeps each name in one piece.

## The blast-radius controls

`-type f` keeps directories and symlinks out of the match. And the path should name one application's log directory — `/var/log/nginx`, `/var/log/myapp` — never `/var/log` wholesale, which holds logs the OS still needs and files that must never be deleted by age. Retention for a database transaction log is a backup problem, not a `find` problem.

## Then take yourself out of the loop

The version that actually prevents a full disk is the one that runs without you: the path and the age limit in named variables, a crontab line running it weekly, and the cleanup's own output appended to a log with a timestamp, so every run leaves a record. Whatever grows without bound gets aged out on a schedule, long before it matters.

Three runs on backdated files took less time than reading this post. Each one would have been an incident on a real directory.

Full script with the multi-directory loop, the `.gz` variant for rotated logs, a before/after disk-usage report and ready-made cron lines: https://bashsnippets.xyz/snippets/delete-old-log-files

Deleting old logs is the recovery; hearing about a filling disk before it hits 100 % is the upgrade — the [disk space warning script](https://bashsnippets.xyz/snippets/disk-space-warning) does that, and when the space thief is not a log at all, [find large files](https://bashsnippets.xyz/snippets/find-large-files-linux) names it. The rest of the library is at https://bashsnippets.xyz
