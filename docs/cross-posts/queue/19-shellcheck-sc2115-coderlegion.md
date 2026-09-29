<!-- NOT SCHEDULED. Wave 2 #19 - planned Thu 2026-11-19 08:00 CST (14:00Z), same minute as dev.to #19. Plan §3 command A run in scratch on this box 2026-09-28 (shellcheck 0.11.0, bash 5.3.9); the unguarded rm was echoed only, never executed. -->

# SC2115: the empty variable that turns rm -rf "$DIR/"* into rm -rf /*

`rm -rf "$TARGET/"*` looks correct. The quotes are right and the glob sits outside them, where it has to. I put it in a two-line script in a scratch directory and asked what happens when `TARGET` is empty, with `echo` in front so `rm` never ran: the command line came back as `rm -rf /backup /bin /boot /dev /etc /home ...`, every top-level directory on the machine.

`set -u` does not catch it, because an empty string is set. A `${1:-}` default or a blank config line passes strict mode, and `set -e` stays quiet because `rm` succeeds. ShellCheck 0.11.0 flags the line as SC2115, and the fix is in the warning's text:

```bash
$ printf '#!/bin/bash\nrm -rf "${TARGET:?}/"*\n' > t2.sh
$ shellcheck t2.sh; echo "sc rc=$?"
sc rc=0
$ cd tree
$ TARGET= bash ../t2.sh; echo "exit=$?"
../t2.sh: line 2: TARGET: parameter null or not set
exit=1
```

With `TARGET` empty the script stopped on line 2 and the scratch tree was untouched; with a real path it emptied exactly that directory. Keep the colon: `${TARGET?}` rejects only unset, which is where `set -u` already left you. And `:?` does not catch a wrong non-empty value, so check the path sits inside the tree you expect before any `rm -rf`.

The staging-tree run, and a table of which `rm -rf` forms trigger the warning, are in the [SC2115 deep dive](https://bashsnippets.xyz/shellcheck/sc2115).
