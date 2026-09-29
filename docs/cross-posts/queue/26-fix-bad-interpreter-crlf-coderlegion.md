<!-- NOT SCHEDULED. Wave 2 #26 - planned Tue 2027-01-05 08:00 CST (14:00Z), same minute as dev.to #26. Page live 2026-09-28; the CRLF runs (./crlf.sh exit 126, bash sourced.sh exit 0, sed fix) were re-run in scratch on this box that day, bash 5.3.9, ShellCheck 0.11.0. -->

# A CRLF script can exit 0 with strict mode off

`/bin/bash^M: bad interpreter` is the loud version of this bug: a script saved with Windows line endings has a carriage return after `#!/bin/bash`, so the kernel goes looking for a program with an invisible character in its name and fails with exit 126. `file script.sh` confirms it with "with CRLF line terminators", and ShellCheck flags every line as SC1017.

The quiet version is worse. I wrote a three-line CRLF file, `set -e`, `cd /tmp`, `echo done`, and ran it the way cron lines and CI steps often do, through bash directly, so the shebang is never read:

```text
$ bash sourced.sh
sourced.sh: line 1: set: -: invalid option
set: usage: set [-abefhkmnptuvxBCEHPT] [-o option-name] [--] [-] [arg ...]
sourced.sh: line 2: cd: $'/tmp\r': No such file or directory
done
exit=0
```

`set -e` plus a carriage return is an invalid option, so errexit never turned on. The `cd` failed, the script kept going, printed `done`, and exited 0. Anything wrapping it logs a success.

The fix is `sed -i 's/\r$//' script.sh`, which strips a carriage return only at the end of each line. Keeping it fixed is a `.gitattributes` line, `*.sh text eol=lf`, plus `git add --renormalize .` so the next Windows checkout does not put the bytes back.

The directory-wide finder with a dry run that exits 1 as a CI gate is in the [CRLF line-ending fix for bash scripts](https://bashsnippets.xyz/snippets/fix-bad-interpreter-crlf).
