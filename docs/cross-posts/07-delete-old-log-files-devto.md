---
title: "A Log File Nobody Read Took My Disk to Zero Bytes on a Tuesday"
published: true
description: "A week of unread log lines took my disk to zero free bytes and broke three programs at once. find -mtime ages logs out — preview with -print first."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/delete-old-log-files
cover_image: https://bashsnippets.xyz/ogimage.png
---

My SSD ran completely out of space on a Tuesday, and I found out three times inside the same minute. A build died halfway through compiling. A database write threw an error. My editor put up a banner saying it couldn't autosave. Three different programs, three different error messages, and not one of them contained the word "disk."

So I did what the error messages suggested. I re-ran the build. I poked at the database. I burned an embarrassing stretch of time chasing three phantom bugs before I typed `df -h` and saw `/` sitting at exactly 100% — and it took longer still to trace the missing gigabytes to an app I'd left running for a week, appending to a log file in a directory I had never once opened.

The app wasn't malfunctioning. Writing log lines is what it was built to do. The failure was mine: nothing on that machine was ever pruning what the logger produced, so a file nobody read grew a little every second for a week until it swallowed the last free block on the drive.

## Why a full disk lies to you

A full disk is the rare failure that surfaces everywhere except at its source. The moment the filesystem runs out of blocks, every process that attempts a write gets `ENOSPC` back from the kernel — and almost no application reports that as "the disk is full." You get a failed save here, a crashed build there, a database complaint somewhere else, all at once, all worded differently. Meanwhile the actual culprit goes quiet, because it can't write either. The evidence scatters across every innocent program on the box while the guilty one stops leaving fingerprints. That's why the fix for this class of outage is prevention rather than diagnosis: by the time symptoms appear, they're actively misleading.

## Aging logs out with find

The tool for the job has shipped with every Linux and macOS box for decades:

```bash
LOG_DIR="/var/log/myapp"
DAYS=30

# Preview pass — read this list before letting anything delete
find "$LOG_DIR" -type f -name "*.log" -mtime +"$DAYS" -print
```

Run that, read the output, and when the list contains exactly what you expect, swap `-print` for `-delete` and run it again. That preview habit is non-negotiable on a new directory: `-delete` is permanent, and a mistyped path turns a cleanup into an incident.

Three details in that one line deserve explanation, because each is a trap I've either hit or watched someone hit.

**`-delete` beats piping to `rm`.** The reflex is `find ... | xargs rm`, and it works right up until a filename contains a space — at which point `app v2.log` arrives at `rm` as two separate arguments, one of which may match something you wanted to keep. The pipe hands filenames through a layer that re-splits them on whitespace. `-delete` never leaves `find`: no pipe, no word splitting, no quoting archaeology. One caveat — `find` evaluates its expression strictly left to right, so `-delete` goes last. Put it before `-name` and it becomes the first test every file passes, which means it deletes everything it walks.

**`-mtime +30` doesn't mean what you'd say out loud.** `find` measures age in whole 24-hour periods, and the `+` means strictly greater than. A file modified exactly 30 days ago has an age of 30 periods, which is not greater than 30, so it survives — and keeps surviving until it crosses 31 full days. If your retention policy says "keep 30 days," `-mtime +29` is the flag that enforces it. The off-by-one is invisible when you test and only surfaces as "why is that file still there" a month later.

**`-type f` and a narrow `LOG_DIR` are the blast-radius controls.** `-type f` keeps directories and symlinks out of the match. And the path should name one application's log directory — `/var/log/nginx`, `/var/log/myapp` — never `/var/log` wholesale, which holds logs your OS actively needs and database files that must never be deleted by age. Retention for a transaction log is a backup problem, not a `find` problem.

## Then take yourself out of the loop

The version that actually prevents the Tuesday scenario is the one that runs without you. The full script wraps the command in named variables for the path and the age limit, and a crontab line runs it weekly — with the cleanup's own output appended to a log, so every run leaves a record. Whatever grows without bound gets aged out on a schedule, months before it can matter.

That week of quiet appending cost me a morning of confused debugging and one humbling `df`. The command that would have prevented all of it runs in under a second, once a week, forever.

Full script with the multi-directory loop, the `.gz` variant for rotated logs, a before/after disk-usage report, and ready-made cron lines: https://bashsnippets.xyz/snippets/delete-old-log-files

Deleting old logs is the recovery; hearing about a filling disk before it hits 100% is the upgrade — the [disk space warning script](https://bashsnippets.xyz/snippets/disk-space-warning) does that, and when the space thief isn't a log at all, [find large files](https://bashsnippets.xyz/snippets/find-large-files-linux) names it. The rest of the library is at https://bashsnippets.xyz
