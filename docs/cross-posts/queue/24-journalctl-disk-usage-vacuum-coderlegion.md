<!-- NOT SCHEDULED. Wave 2 #24 - planned Tue 2026-12-15 08:00 CST (14:00Z), same minute as dev.to #24. journalctl --disk-usage (3.4G) re-run on this box 2026-09-28 without sudo; the non-root vacuum output is quoted from the live page (captured on this box, machine-id redacted). No placeholder in this excerpt; the root before/after lives in the dev.to and Medium versions. -->

# journalctl --vacuum-size exited 0 and freed 0B

`journalctl --disk-usage` on my laptop reported 3.4G, and `systemd-analyze cat-config systemd/journald.conf` showed `SystemMaxUse` commented out. Unset, journald allows itself 10% of the filesystem, capped at 4G. One September day held 747,780 kernel lines, 95% of them from an out-of-tree Wi-Fi driver, and nothing gave the space back.

The one-off fix is a vacuum. I ran it first as my normal user, who can read the journal through the `adm` group:

```text
$ journalctl --vacuum-size=1G
Vacuuming done, freed 0B of archived journals from /var/log/journal/<machine-id>.
Vacuuming done, freed 0B of archived journals from /var/log/journal.
Vacuuming done, freed 0B of archived journals from /run/log/journal.
exit=0
```

Exit 0, and the journal was still 3.4G. The files belong to root and the `systemd-journal` group; reading them is not deleting them, and `journalctl` reports that as success. A cleanup cron job running as the wrong user would log "Vacuuming done" every night while the disk stays full.

Run it with sudo, run `journalctl --rotate` first (vacuuming never touches the active files), and check `--disk-usage` afterwards instead of trusting the vacuum's own output. Then set `SystemMaxUse=1G` in a drop-in under `/etc/systemd/journald.conf.d/` so journald enforces it on its own.

The size check, the rotate-then-vacuum step and the drop-in are in the [journald disk usage script](https://bashsnippets.xyz/snippets/journalctl-disk-usage-vacuum).
