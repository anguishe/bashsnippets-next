<!-- NOT SCHEDULED. Wave 3 #31 - date TBD, same minute as dev.to #31 (page live 2026-10-03; earliest publish 2026-10-10). Canonical /snippets/bash-command-not-found. Output run 2026-10-03 in a scratch dir inside `unshare -rm` with a tmpfs on /opt (bash 5.3.15). -->

# bash ran a path that no longer existed, and exited 127

A demo script called `report`, two directories on `PATH`, and one `mv` between them, all on a scratch tmpfs:

```text
$ report
report 2.1: 14 jobs ok
exit=0
$ mv /opt/jobs/bin/report /opt/jobs/newbin/report
$ ls -l /opt/jobs/newbin/report
-rwxrwxr-x 1 root root 42 Oct  3 18:26 /opt/jobs/newbin/report
$ report
session.sh: line 5: /opt/jobs/bin/report: No such file or directory
exit=127
$ type -a report
report is /opt/jobs/newbin/report
$ hash -t report
/opt/jobs/bin/report
$ command -v report
/opt/jobs/bin/report
```

The file is there, on `PATH`, and bash ran the old path anyway. The first time it finds a command through a `PATH` search, it stores the full path in a hash table and skips the search after that. When the file moves, it executes the remembered path and reports `No such file or directory` with exit 127, the same code a typo gets.

The confusing part is the end of that output. `type -a` searches `PATH` fresh and finds the new location. `command -v` reports what bash would run, which is the stale one. `hash -r` clears the table, a new terminal starts empty, and `shopt -s checkhash` makes bash re-search when a hashed path has gone: with it set, the same sequence printed the tool's output and exit 0.

The stale hash is one of six causes behind `command not found`. The others, from a cron `PATH` to a CRLF shebang, each reproduced with a script that names the cause, are in [command not found in bash, six causes](https://bashsnippets.xyz/snippets/bash-command-not-found).
