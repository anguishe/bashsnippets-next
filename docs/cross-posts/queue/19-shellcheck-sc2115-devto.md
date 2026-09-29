---
title: "SC2115 Is the Warning Between rm -rf \"$DIR/\" and rm -rf /"
published: true
description: "An empty variable in front of a slash turns rm -rf \"$DIR/\"* into rm -rf /*. set -u does not catch it. ShellCheck SC2115 does, and ${DIR:?} stops the script before rm runs."
tags: bash, linux, shellcheck, devops
canonical_url: https://bashsnippets.xyz/shellcheck/sc2115
cover_image: https://bashsnippets.xyz/ogimage.png
---

My cleanup script printed `cleaned`, exited 0, and deleted every release in the staging tree instead of the one I meant. It ran under `set -euo pipefail`. The line was `rm -rf "$STAGE/$RELEASE/"*`, `RELEASE` came from `${1:-}`, and I had called the script without an argument. The path became `stage//*`, the glob matched `v1.4` and `v1.5`, and both were gone. That run is on the SC2115 page, captured on this machine, and it is the mild version of the bug.

The severe version has an absolute prefix, or no prefix at all. I rebuilt it today in a scratch directory, ShellCheck 0.11.0 and bash 5.3.9, with a two-line script, and never let `rm` near it. The `echo` in front shows the command line `rm` would have received:

```bash
$ printf '#!/bin/bash\nrm -rf "$TARGET/"*\n' > t.sh
$ shellcheck t.sh

In t.sh line 2:
rm -rf "$TARGET/"*
       ^---------^ SC2115 (warning): Use "${var:?}" to ensure this never expands to /* .

For more information:
  https://www.shellcheck.net/wiki/SC2115 -- Use "${var:?}" to ensure this nev...
$ ( cd tree && TARGET= bash -c 'echo rm -rf "$TARGET/"*' )
rm -rf /backup /bin /boot /dev /etc /home /initrd.img /initrd.img.old /lib /lib32 /lib64 /lost+found /media /mnt /opt /proc /root /run /sbin /srv /sys /tmp /usr /var /vmlinuz /vmlinuz.old
```

That is every top-level directory on the machine, handed to `rm -rf` by a script whose author meant "clear out the scratch tree". The quotes are correct. The glob is outside the quotes, where it has to be. Nothing about the line looks wrong unless you ask what happens when `TARGET` is empty.

## Why set -u does not save you

This is the part that surprises people who trust strict mode. `set -u` catches a variable that was never assigned; an empty string is assigned. A `RELEASE=` line in a config file, a `${1:-}` default, a `$(git describe)` that printed nothing: every one of those sets the variable to empty, and `set -u` passes all of them. The same subshell test shows it in one line: `( set -u; TARGET=""; echo "/srv/stage/$TARGET/" )` printed `/srv/stage//` with no complaint.

`set -e` does not help either, because `rm` succeeded. It did exactly what it was asked. Strict mode reports commands that fail, and a catastrophic delete is a command that worked.

## What SC2115 looks for

The rule fires on an `rm -rf` whose path is a variable followed by `/` or `/*`: `"$DIR/"*`, `"$DIR"/*`, `"/$DIR/"`, and nested forms like `"$STAGE/$RELEASE/"*`. It stays quiet on a bare `rm -rf "$DIR"`, and that is not an oversight. With an empty `$DIR`, `rm -rf ""` gets no usable path and fails; there is no slash to turn into the root. That is still a bug, but not the one that empties a server. The slash is what makes the empty variable dangerous, which is why the warning attaches to it.

## The guard that stops the script first

The fix is in the warning's own text: `${var:?}`. It expands normally when the variable has a value and aborts the script, before the command runs, when it is unset or empty. Same scratch directory, the guarded script, run with `TARGET` empty and then with a real path:

```bash
$ printf '#!/bin/bash\nrm -rf "${TARGET:?}/"*\n' > t2.sh
$ shellcheck t2.sh; echo "sc rc=$?"
sc rc=0
$ cd tree
$ TARGET= bash ../t2.sh; echo "exit=$?"
../t2.sh: line 2: TARGET: parameter null or not set
exit=1
$ find . | sort
.
./keep
./keep/a
./keep/b
$ TARGET="$PWD/keep" bash ../t2.sh; echo "exit=$?"
exit=0
$ find . | sort
.
./keep
```

Empty, it stopped on line 2 and touched nothing. With a real path, it emptied exactly `keep` and nothing above it. The colon matters: `${TARGET?}` without it rejects only unset, which puts you back where `set -u` left you. Text after the `:?` becomes the error message, so `"${RELEASE:?release tag required}"` tells whoever is on call at 3 a.m. what they forgot instead of the generic `parameter null or not set`.

`:?` guards against empty. It does not guard against a wrong non-empty value, such as a stray space or a literal `/`. When the path comes from an argument or a config file, also check it sits inside the tree you expect, for example `[[ "$STAGE" == /srv/stage/* ]] || exit 1`, before any `rm -rf` sees it.

If the variable was validated a few lines earlier and you want the warning gone, `# shellcheck disable=SC2115` with the reason works. Adding `:?` on the `rm` line costs nothing, though, and it keeps the guard where the danger is. `shellcheck --include=SC2115` lints for this rule alone, a reasonable CI gate on any repo with `rm -rf` in it.

The staging tree on the page was a test tree, and losing it cost nothing. The `echo` line above is the same mistake with nothing in front of the slash, and that is the one SC2115 exists for.

---

Full deep dive, with the staging-tree run, the table of which `rm -rf` forms trigger SC2115 and which stay clean, and how to disable it honestly: https://bashsnippets.xyz/shellcheck/sc2115

The unquoted form in that table also trips [SC2086](https://bashsnippets.xyz/shellcheck/sc2086), and [Bash Error Handling](https://bashsnippets.xyz/snippets/bash-error-handling) covers the `cd` without `|| exit` that sends a later `rm` into the wrong directory. The rest of the library is at https://bashsnippets.xyz

<!-- NOT SCHEDULED. Wave 2 #19 - planned Thu 2026-11-19 08:00 CST (14:00Z). Staging-tree opener quoted from the live page (run on this box). Plan §3 command A run in scratch on 2026-09-28: shellcheck 0.11.0, bash 5.3.9; the unguarded rm was echoed only, never executed. -->
