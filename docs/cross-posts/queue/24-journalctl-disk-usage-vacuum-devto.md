---
title: "The Journal Was Holding 3.4G of My Disk and I Never Set a Limit"
published: true
description: "journalctl --disk-usage said 3.4G with no SystemMaxUse set anywhere. A Wi-Fi driver filled it, and the non-root vacuum I tried exited 0 and freed 0B. What the defaults allow and how to cap it."
tags: bash, linux, sysadmin, devops
canonical_url: https://bashsnippets.xyz/snippets/journalctl-disk-usage-vacuum
cover_image: https://bashsnippets.xyz/ogimage.png
---

My laptop's root filesystem is past 90% full, and one of the things holding it is a log I never configured. On 2026-09-28 I asked the systemd journal how big it was:

```text
$ journalctl --disk-usage
Archived and active journals take up 3.4G in the file system.
$ systemd-analyze cat-config systemd/journald.conf | grep -E "^#?System(MaxUse|KeepFree|MaxFileSize)="
#SystemMaxUse=
#SystemKeepFree=
#SystemMaxFileSize=
```

3.4G, and all three size settings commented out. Nobody sets a size for the journal because nobody knows it needs one, and it does not need one until something starts logging a few hundred thousand lines a day. This box had that something.

## Where 3.4G came from

The journal directory held 98 archived system files of 40 MB each, and from 2026-09-02 to 2026-09-11 they were being written at about nine a day. Counting one of those days by source, from the journal's own entries, gave 747,780 kernel lines, with the next source down (`kded6`) at 2,869. Of those kernel lines, 711,687, about 95%, were the out-of-tree Realtek Wi-Fi driver's scan loop, every message starting with `PHL:`. One driver, one day, three quarters of a million lines.

After 2026-09-12 new journal files slowed to a few a week. The 3.4G stayed. That is the part worth understanding: nothing in journald's defaults gives space back before its own cap, and the cap is bigger than most people assume. `man journald.conf` on this box says `SystemMaxUse=` defaults to 10% of the filesystem and `SystemKeepFree=` to 15%, "but each of the calculated default values is capped to 4G". 10% of this 868G filesystem would be 86G, so the limit in force is 4G. On any disk over 40G, an unconfigured journal is allowed to reach 4G, and a `du -sh /var/log/*` scan that skips binary files will never point at it.

## The vacuum that said it worked

The one-off fix is `journalctl --vacuum-size`. I ran it first as my normal user, which can read the journal because it is in the `adm` group:

```text
$ journalctl --vacuum-size=1G
Vacuuming done, freed 0B of archived journals from /var/log/journal/<machine-id>.
Vacuuming done, freed 0B of archived journals from /var/log/journal.
Vacuuming done, freed 0B of archived journals from /run/log/journal.
exit=0
```

(Machine ID redacted.) Exit 0, three lines that start with "Vacuuming done", and `journalctl --disk-usage` afterwards still said 3.4G. The journal files belong to root and the `systemd-journal` group. Being allowed to read them is not being allowed to delete them, and `journalctl` treats "I could not delete anything" as "there was nothing to delete". A cleanup cron job running as the wrong user would log success every night, forever, while the disk stays full. I would have trusted that log line. That is the uncomfortable part.

There is a second way to get `freed 0B`, even as root: vacuuming only removes archived journal files, never the ones journald is writing right now. `journalctl --rotate` closes and archives the active files first, so the order is rotate, then vacuum, then check `--disk-usage` rather than the vacuum's own report.

The script on the page does exactly that, and refuses rather than pretends: run with `--apply` and without root, it exits 2 with `--apply needs root: re-run with sudo`. The root run on this box, before and after:

```text
$ sudo ./journal-disk-usage.sh 1G --apply; echo "exit=$?"
journal on disk: 3.4G
SystemMaxUse:    not set (default: 10% of the filesystem, capped at 4G)
✗ journal is over 1G
Vacuuming done, freed 0B of archived journals from /var/log/journal.
Vacuuming done, freed 0B of archived journals from /run/log/journal.
Deleted archived journal /var/log/journal/<machine-id>/system@…-0000000007db0f33-….journal (35M).
Deleted archived journal /var/log/journal/<machine-id>/system@…-0000000007dc5c2c-….journal (35M).
  … one line per archived file, each 35M …
Deleted archived journal /var/log/journal/<machine-id>/system@…-0000000008354f77-….journal (35.1M).
Vacuuming done, freed 2.4G of archived journals from /var/log/journal/<machine-id>.
✓ now: Archived and active journals take up 989.6M in the file system.
exit=0
$ journalctl --disk-usage
Archived and active journals take up 989.6M in the file system.
```

Same command, same "Vacuuming done" wording, and this time the files actually went: 2.4G freed, the oldest archives first, 3.4G down to 989.6M, just under the 1G I asked for. The two `freed 0B` lines are the directories with nothing archived in them; the machine-id directory is where the journal lives.

## Making the limit stick

A one-off vacuum only buys time; the same driver would fill it again. The permanent fix is a drop-in, so a package upgrade never overwrites it: create `/etc/systemd/journald.conf.d/size.conf` containing a `[Journal]` header and `SystemMaxUse=1G`, restart `systemd-journald`, and confirm with the same `systemd-analyze cat-config` line from the top of this post. It should now print `SystemMaxUse=1G` without the `#`. If it prints nothing, the file is in the wrong directory or the header is missing. From then on journald enforces the limit itself at every rotation, and a weekly check only has to confirm it is holding.

The journal did exactly what its defaults allowed. I had never told it what I wanted instead.

---

Full script, which reports the journal size and the cap actually in force, exits 1 over your limit and rotates-then-vacuums with sudo and `--apply`, plus the drop-in and cron line: https://bashsnippets.xyz/snippets/journalctl-disk-usage-vacuum

The journal is one of three ways a disk fills without an obvious culprit: [No Space Left on Device With Free Space](https://bashsnippets.xyz/snippets/no-space-left-on-device-inodes) covers running out of inodes instead of blocks, and [Find Large Files on Linux](https://bashsnippets.xyz/snippets/find-large-files-linux) covers the one big file you did not know about. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 2 #24 - planned Tue 2026-12-15 08:00 CST (14:00Z). journalctl --disk-usage (3.4G) and the cat-config grep re-run on this box 2026-09-28 without sudo (systemd 261). Per-day source counts and the non-root vacuum output are quoted from the live page (captured on this box 2026-09-28; machine-id redacted). Root run by Travis 2026-09-29 (3.4G -> 989.6M, 2.4G freed; machine-id and file hashes redacted). Fill it in the dev.to, Medium .md and regenerated .html before scheduling. -->
