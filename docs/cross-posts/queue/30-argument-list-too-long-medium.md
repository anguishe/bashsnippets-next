# rm *.log Deleted 80,290 Files. At 80,291 It Deleted None and the Script Said 'cleanup done'.


Four lines, the kind of cleanup script that runs from cron every night and nobody reads again. I filled a drop directory with empty `.log` files and ran it twice, one file apart. The directory was a private tmpfs on `/srv` inside `unshare -rm`, so nothing real was touched:

```text
$ cat /srv/cleanup.sh
#!/bin/bash
# nightly: empty the drop directory
cd /srv/drop
rm *.log
echo "cleanup done"

$ ls /srv/drop | wc -l
80290
$ /srv/cleanup.sh
cleanup done
exit=0
$ ls /srv/drop | wc -l
0

$ ls /srv/drop | wc -l
80291
$ /srv/cleanup.sh
/srv/cleanup.sh: line 4: /usr/bin/rm: Argument list too long
cleanup done
exit=0
$ ls /srv/drop | wc -l
80291
```

At 80,290 files the script did its job. One more file and it deleted none of them, then printed `cleanup done` and exited 0. A cron log would show a clean night. The error went to stderr, which in most crontabs goes nowhere a person looks, and the directory would only get further past the line every night after that.

I found the number by bisecting: fill the directory with N files, run the script, count what is left. The part I did not expect is how un-round it is. Nothing about 80,291 looks like a limit.

## rm never started

The error names `rm`, but `rm` never ran. bash expanded `*.log` without complaint, because the shell has no limit on a glob. Then it asked the kernel to execute `/usr/bin/rm` with 80,291 arguments, and `execve` refused with `E2BIG`. bash printed that as `Argument list too long` and set the status to 126, "found it, could not run it". Without `set -e`, the next line ran.

The limit is `ARG_MAX`, and `getconf ARG_MAX` says 2,097,152 bytes on this box. The odd thing is that the names were nowhere near 2 MB. `echo` is a builtin, so it never goes through `exec`, and it printed every name happily: `echo *.log | wc -c` came to 1,445,238 bytes, which is 18 bytes per name, `upload-080291.log` plus a separator.

The rest of the budget goes on things you do not see. The kernel stores an 8-byte pointer for every argument, 642,328 bytes for 80,291 of them. The environment counts too: `xargs --show-limits` reported that my environment variables take up 8,532 bytes. Names, pointers and environment together land right at the 2 MB line, which is why one more 18-byte name tipped it over. It also means the line is not fixed. Longer file names, a longer path in the glob or a bigger environment all move it.

## Strict mode makes it loud, not right

Adding `set -euo pipefail` fixes the lie and not the job. The strict copy, `/srv/cleanup-strict.sh`, printed the same `/usr/bin/rm: Argument list too long` on line 4 and exited 126.

Now the script stops before `cleanup done` and cron sees a failure. All 80,291 files are still there. The command itself has to stop passing the list as arguments.

## Three ways that never build the list

The fix is to let something other than `exec` carry the names. The third copy of the script, still under `set -euo pipefail`, replaces the `rm` line with `find /srv/drop -maxdepth 1 -type f -name '*.log' -delete`, with a comment above it: find unlinks each match itself, so there is no argument list and no `ARG_MAX`. Under `time` it printed `cleanup done`, `real 0m0.284s`, exit 0, and `ls /srv/drop | wc -l` printed 0.

80,291 files in under a third of a second. `find -delete` unlinks each match as it walks the directory, so there is no argument list at all, and `-maxdepth 1` keeps it to the one directory the glob would have matched.

When the action is not a delete, `find ... -exec mv -t /archive {} +` packs as many names into each `mv` as fit and runs it again for the rest. If you want to keep the glob, hand it to a builtin and let `xargs` batch it: `printf '%s\0' *.log | xargs -0 rm --`. On a refilled directory of 80,291 files that left 0, with `xargs` exiting 0. `printf` is a builtin, so the expansion never meets `exec`; the null separators survive names with spaces, and `--` stops a file called `-rf` being read as an option.

One more thing the original script gets wrong shows up on an empty directory: `rm *.log` printed `rm: cannot remove '*.log': No such file or directory`, then `cleanup done`, then exited 0. A glob that matches nothing is passed through literally. The `find` version ran on the same empty directory without a complaint.

## Raising the limit is not the fix

`ulimit -s` raises `ARG_MAX` a little, and the page measured where that stops: `ulimit -s 65536` took it from 2,097,152 to 6,291,456 bytes, not 16 MB, because the kernel caps it. That buys a directory three times the size and the same failure later. Change the command and the file count stops mattering.

My four-line script would have printed `cleanup done` at 80,291 files and at every count above it. `find -delete` does not care how many there are.

---

The page has a script, `bulk-delete-files.sh`, that counts matches without building a list, dry-runs by default, deletes with `find -delete` on `--apply`, and exits 1 when a pattern suddenly matches nothing: https://bashsnippets.xyz/snippets/argument-list-too-long

A directory that big is often also out of inodes, which [No Space Left on Device With Free Space](https://bashsnippets.xyz/snippets/no-space-left-on-device-inodes) covers, and the [find command builder](https://bashsnippets.xyz/tools/find-command-builder) writes the `find` line for other patterns and actions. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/argument-list-too-long

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Sysadmin, Shell Scripting -->
