<!-- NOT SCHEDULED. Wave 2 #27 - planned Thu 2027-01-07 08:00 CST (14:00Z), same minute as dev.to #27. Command G run 2026-09-28 22:21 CDT in scratch, http.server bound to 127.0.0.1:8099; only NEW/GONE lines and exit codes pasted, full CSV withheld. -->

# The port that wasn't there an hour ago

Reading `ss -tulpn` once tells you what is listening right now. It does not tell you which listener is new, and the new one is the only one worth an alert: the dev server someone left running, the container that published a port after a compose change. So I tested an audit that diffs instead of lists. It snapshots every listening socket as a CSV line, took a baseline, and then I started a throwaway `python3 -m http.server 8099 --bind 127.0.0.1` and ran it again with `--diff`:

```text
NEW:
tcp,127.0.0.1,8099,unknown,python3
GONE:
(none)
exit=3
```

After I killed the server, the next run printed the same line under GONE and exited 3 again. A run with nothing changed exits 0, so cron or CI can branch on the code without parsing a word.

The diff is a whole-line set difference with `grep -Fxv -f`, run in both directions. It only works because the script pins `LC_ALL=C` and sorts on fixed keys; otherwise a locale change in cron's minimal environment would move every line and alert every hour. Without root it still names owners, using the systemd cgroup that `ss -e` reports for every socket.

The script, the exit-code contract and the hourly cron line with `ALERT_CMD` are on the [ports audit script page](https://bashsnippets.xyz/snippets/ports-audit).
