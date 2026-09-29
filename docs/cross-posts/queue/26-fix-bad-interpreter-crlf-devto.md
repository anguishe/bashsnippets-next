---
title: "/bin/bash^M: bad interpreter. The Script Was Fine. Its Line Endings Weren't."
published: true
description: "A CRLF script fails loudly as ./script.sh and quietly as bash script.sh: set -e becomes an invalid option, strict mode never turns on, and the script exits 0."
tags: bash, linux, shellcheck, devops
canonical_url: https://bashsnippets.xyz/snippets/fix-bad-interpreter-crlf
cover_image: https://bashsnippets.xyz/ogimage.png
---

Two lines, `#!/bin/bash` and `echo ok`. I wrote them on my own Kali box with `printf '#!/bin/bash\r\necho ok\r\n'`, so every line ended the way a Windows editor ends it, made the file executable and ran it:

```text
$ ./crlf.sh
bash: ./crlf.sh: /bin/bash^M: bad interpreter: No such file or directory
exit=126
```

That is the error people meet after a script has passed through a Windows editor, a web form, a chat paste or a git checkout with `core.autocrlf=true`. Nothing in the script is wrong. There is one extra byte at the end of every line, and most editors will not show it to you.

The loud failure is the good one. The run that bothered me came when I fed the same kind of file to bash the other way, and it reported success.

## What the kernel actually reads

The extra byte is a carriage return, `\r`, printed as `^M`. It sits in front of each newline. When you run `./crlf.sh`, the kernel reads the shebang up to the newline and gets `/bin/bash` followed by a carriage return: a program name with an invisible character on the end. No such file exists, exec fails, and bash reports 126. With `#!/usr/bin/env bash` the message changes to `env: 'bash\r': No such file or directory`.
You can confirm it three ways without opening an editor. `file crlf.sh` says it outright: `Bourne-Again shell script, ASCII text executable, with CRLF line terminators`. `cat -A crlf.sh` prints every line ending as `^M$`. And ShellCheck (0.11.0 here) flags every line with SC1017, "Literal carriage return", as an error, which means a ShellCheck step in CI or a pre-commit hook stops the file before it reaches a server.

## The run that exits 0

Here is the version that worries me. A three-line file, `set -e`, `cd /tmp`, `echo done`, saved with CRLF endings and run as `bash sourced.sh`, the way a lot of cron lines and CI steps call scripts:

```text
$ bash sourced.sh
sourced.sh: line 1: set: -: invalid option
set: usage: set [-abefhkmnptuvxBCEHPT] [-o option-name] [--] [-] [arg ...]
sourced.sh: line 2: cd: $'/tmp\r': No such file or directory
done
exit=0
```

`bash file` never reads the shebang, so there is no "bad interpreter" to warn you. Bash reads each line with its carriage return still attached. `set -e` arrives as `set` with the option `-e` plus a carriage return, which is not a valid option, so bash prints a usage line and errexit never turns on. Line two asks `cd` for a directory named `/tmp` plus a carriage return. That fails, and because errexit is off, the script carries on, prints `done`, and exits 0.

In a real deploy script, the line after that `cd` runs in whatever directory the script started in. Whatever wraps the script sees exit 0 and logs a success. The strict-mode line you trusted to stop exactly this was sitting at the top of the file, and it was never parsed as what you wrote. Blank lines fail the same way, as a command named `$'\r'`, which is where the other error people search for comes from: `$'\r': command not found`.

## The fix, and keeping it fixed

```bash
file crlf.sh                   # "with CRLF line terminators" means this problem
sed -i 's/\r$//' crlf.sh       # strip a carriage return only at end of line, in place
./crlf.sh                      # prints ok, exit=0

# stop git reintroducing CRLF, whatever each developer's core.autocrlf says
printf '*.sh text eol=lf\n' > .gitattributes
git add .gitattributes && git add --renormalize .
```

On my run, after the `sed`, `file` reported plain `ASCII text executable` and the script printed `ok` with exit 0. The `\r$` anchor matters: it removes a carriage return only where a line ends. `tr -d '\r'` removes them everywhere and needs a second file; `dos2unix` does the same job as the `sed` if it happens to be installed.

Fixing the files once does not survive the next Windows checkout with `core.autocrlf=true`. The `.gitattributes` rule overrides each developer's local setting, and `--renormalize` rewrites what is already committed. After it, `git ls-files --eol` shows `i/lf` for the index; the working copy stays CRLF until a fresh checkout, so commit the attribute file and the renormalized scripts together.

The page's `crlf-check.sh` does the detection for a whole directory: a dry run lists every file with CRLF endings and exits 1, so it works as a gate, and `--apply` converts them. It catches `sourced.sh` too, the file with no shebang that would have run with strict mode off.

`set -e` is only as strong as the line it lives on. A single invisible byte on that line turns it into a usage message and lets everything below it run unprotected.

---

Full script with the dry-run CRLF finder, the `--apply` mode, and the git renormalize walkthrough: https://bashsnippets.xyz/snippets/fix-bad-interpreter-crlf

If you want to know what strict mode is supposed to catch once it is actually on, [Bash Error Handling](https://bashsnippets.xyz/snippets/bash-error-handling) covers it, and the [safe bash script template](https://bashsnippets.xyz/guides/safe-bash-script-template) is the file I start every new script from. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 2 #26 - planned Tue 2027-01-05 08:00 CST (14:00Z). Page live 2026-09-28; command F (./crlf.sh exit 126, file, cat -A, shellcheck SC1017, sed fix) and the CRLF sourced.sh run (exit 0) re-run in scratch on this box 2026-09-28, bash 5.3.9, file 5.47, ShellCheck 0.11.0. -->
