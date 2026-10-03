<!-- NOT SCHEDULED. Wave 3 #30 - date TBD, same minute as dev.to #30 (page live 2026-09-28; earliest publish 2026-10-10). Canonical /snippets/argument-list-too-long. Output run 2026-10-03 in a scratch dir, inside `unshare -rm` on a tmpfs (bash 5.3.15, GNU findutils 4.11.0). -->

# One file more and rm deleted none of them

A four-line cleanup script, `cd /srv/drop`, `rm *.log`, `echo "cleanup done"`, run on a scratch tmpfs. At 80,290 files it emptied the directory. At 80,291:

```text
$ /srv/cleanup.sh
/srv/cleanup.sh: line 4: /usr/bin/rm: Argument list too long
cleanup done
exit=0
$ ls /srv/drop | wc -l
80291
```

Nothing deleted, `cleanup done` printed, exit 0. A cron log would call that a good night.

`rm` never started. bash expanded the glob fine, then the kernel refused to `exec` a program with that many bytes of arguments. The odd part is that the names came to only 1,445,238 bytes, well under the 2,097,152-byte `ARG_MAX`. The kernel also charges an 8-byte pointer per argument, 642,328 bytes here, and the environment, about 8.5 KB on this box. Together they sit right at the limit, so the line moves with name length and environment size.

`set -euo pipefail` turns it into an honest exit 126, and still deletes nothing. What works is not building the list: `find /srv/drop -maxdepth 1 -type f -name '*.log' -delete` removed all 80,291 in 0.284 seconds. For other actions, `find -exec ... {} +` or `printf '%s\0' *.log | xargs -0` batch the names.

The full fix, with a dry-run script that refuses to report success on an empty match, is on the [Argument list too long page](https://bashsnippets.xyz/snippets/argument-list-too-long).
