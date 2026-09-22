<!-- SCHEDULED on CoderLegion 2026-09-21 as https://coderlegion.com/28022 - publishes Thu 2026-10-08 08:00 CDT, same minute as dev.to #07. Editing this file does NOT reach CoderLegion: edit the post there too. -->
<!-- Rebuilt 2026-09-20 on real runs (GNU findutils 4.11.0, bash 5.3.9). Prior version opened on an SSD-filled-up incident that never happened. -->

# My 30-day log cleanup kept a file that was 30 and a half days old

I set three log files to known ages with `touch -d` — exactly 30 days, 30 days and 12 hours, and 31 days — then ran what I thought was a 30-day retention policy:

```bash
find . -name '*.log' -mtime +30
```

It returned one file: the 31-day-old one. The 30.5-day file stayed. So did the 30-day file.

`-mtime` counts *whole* 24-hour periods and throws away the remainder, and `+30` means strictly greater than 30 of them. A file aged 30 days and 12 hours counts as 30, and 30 is not greater than 30. A real 30-day policy is `-mtime +29`. Re-running with `+29` returned all three, which is what I wanted in the first place.

Two more things that bit during the same session. Piping to `xargs rm` split `app v2.log` on the space — `rm` reported `cannot remove 'ws/app'` and `cannot remove 'v2.log'`, and the file survived. And `-delete` is an action that returns true, so putting it before your filter is catastrophic: `find ord -delete -name '*.log'` removed a file called `keep.txt` and then the directory itself. Preview with `-print`, keep `-delete` last.

The multi-directory loop, the `.gz` variant, and the cron lines are in the [find -mtime log retention walkthrough](https://bashsnippets.xyz/snippets/delete-old-log-files).
