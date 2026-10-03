---
title: "I Moved a Script to Another Directory on PATH. bash Said 'No such file or directory' and Exited 127."
published: true
description: "ls showed the file, type -a showed the file, and bash still ran the old path and exited 127. Its hash table remembered where the command used to be. Six causes behind one exit code, and how to tell them apart."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/bash-command-not-found
cover_image: https://bashsnippets.xyz/ogimage.png
---

One bash process, one small demo script called `report`, and a `mv` between two directories that are both on `PATH`. I set it up in a scratch tmpfs mounted over `/opt` inside `unshare -rm`, with `PATH` starting `/opt/jobs/bin:/opt/jobs/newbin`, and ran it as a script. Inside the namespace I appear as root, which is why `ls` says `root root`:

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
$ hash -r
$ report
report 2.1: 14 jobs ok
exit=0
```

The file exists, it is executable, and its new directory is on `PATH`. bash ran the old path anyway, said `No such file or directory`, and exited 127, the same code a typo gets. I ran the same sequence through an interactive `bash -i` to be sure it was not a script quirk, and got `bash: /opt/jobs/bin/report: No such file or directory`, exit 127.

What makes it hard to trust your own eyes is the middle of that output. `type -a` names the new location. `command -v`, the check most scripts use to ask "is this installed", names the old one.

## bash remembers where it found things

The first time bash runs a command through a `PATH` search, it stores the full path in a hash table, so the next call can skip the search. That is what `hash -t report` prints. When the file moves, bash does not search again; it executes the remembered path, the kernel answers `ENOENT`, and bash reports `No such file or directory` with the stale path in the message.

`type -a` searches `PATH` fresh every time, because its job is to list every match. `command -v` reports what bash *would run*, and bash would run the hashed path. So the two most common "where is it" checks disagree, and the one that agrees with the error is the one that looks wrong.

`hash -r` empties the table. A new terminal starts with an empty one. And there is a shell option made for exactly this:

```text
$ shopt -s checkhash
$ report
report 2.1: 14 jobs ok
exit=0
$ mv /opt/jobs/bin/report /opt/jobs/newbin/report
$ report
report 2.1: 14 jobs ok
exit=0
$ hash -t report
/opt/jobs/newbin/report
```

With `checkhash` set, bash checks that a hashed path still exists before running it, searches `PATH` again when it does not, and updates the table. In the wild this shows up after an upgrade moves a binary between `/usr/local/bin` and `/usr/bin`, or after swapping a pip-installed tool for the distro package, both of which the page describes.

## Six causes, one exit code

`command not found` and its 127 cover more than a stale hash. The page reproduces the rest: a typo, a program installed outside `PATH`, a script in the current directory run without `./`, an alias a script cannot see, a found file whose shebang names a missing interpreter (a CRLF line ending does that), and the cron job whose `PATH` is shorter than your terminal's.

The cron one is worth reproducing, because it never fails while you are watching. Below, a demo tool in a scratch directory on my interactive `PATH`, then the same call with cron's two-directory `PATH`, which `env -i` reproduces without waiting for the schedule. After that, the page's diagnosis script, `why-command-not-found.sh`, run in the namespace with a home directory of its own, shown as `~`, and the same tool in `~/.local/bin`:

```text
$ nightly-sync
nightly-sync 0.4
exit=0
$ env -i PATH=/usr/bin:/bin bash -c 'nightly-sync'
bash: line 1: nightly-sync: command not found
exit=127

$ ./why-command-not-found.sh nightly-sync
✓ nightly-sync resolves to ~/.local/bin/nightly-sync
✗ cron's default PATH (/usr/bin:/bin) will NOT find it: use ~/.local/bin/nightly-sync in the crontab, or set PATH= at its top
  if your terminal still says 'not found' or 'No such file', its hash table is stale: run hash -r
exit=0
$ ./why-command-not-found.sh gti
✗ gti is not on PATH
  did you mean git? (/usr/bin/git)
exit=1
```

It uses `type -P`, which searches `PATH` for files only and ignores aliases and functions, so it sees what any other script would see. It repeats the lookup with `PATH=/usr/bin:/bin` to catch the cron case, reads the first line of the file for a carriage return, checks `./NAME`, looks in the usual places installers put binaries without touching `PATH` (`~/.local/bin`, `~/.cargo/bin`, `/usr/sbin`, `/opt/*/bin`), and tries every adjacent-letter swap of the name, which is how `gti` became `git`. It exits 1 for every cause it finds, so `./why-command-not-found.sh rsync || exit 1` can gate a deploy script.

## The order that separates them

`type -a NAME` for everything bash can see. `hash -t NAME` when the message says `No such file or directory` about a path. `echo "$PATH" | tr : '\n'` when the answer is "nothing". And `env -i PATH=/usr/bin:/bin bash -c NAME` before anything goes in a crontab.

The stale hash is the one cause where everything you check says the tool is fine: `ls` and `type -a` both show it right where it should be. One `hash -r`, or one new terminal, is the whole fix.

---

All six causes reproduced, with the diagnosis script and what each check does: https://bashsnippets.xyz/snippets/bash-command-not-found

If 127 is all a log gives you, the [Bash Exit Code Lookup](https://bashsnippets.xyz/tools/bash-exit-code-lookup) explains it next to 126, and the [Bash $PATH Debugger](https://bashsnippets.xyz/tools/path-debugger) checks a pasted `PATH` for missing directories and duplicates. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 3 #31 - date TBD (page live 2026-10-03; earliest publish 2026-10-10). Outputs: run 2026-10-03 in the session scratchpad (bash 5.3.15, ShellCheck 0.11.0 on the page's script): stale-hash and checkhash runs inside `unshare -rm` with a tmpfs on /opt; the bash -i confirmation; env -i cron-PATH run as the normal user with a scratch bin dir; why-command-not-found.sh copied verbatim from the page MDX and run inside `unshare -rm` with a tmpfs over the home root and a throwaway HOME, output with that home shown as ~. Upgrade/pip moves are stated as the page describes them, not reproduced. -->
