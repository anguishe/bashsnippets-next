# find -perm 777 Missed a World-Writable File in My Test Tree. -perm -o+w Didn't.

Most homegrown permission audits start with the search everybody remembers: `find /var/www -type f -perm 777`. I built a three-file scratch tree on my own machine to see what that search actually covers. `index.html` at a normal 644, `w666.txt` at 666, and `w777.sh` at 777 — the classic leftover from a `chmod 777` thrown at an error to make it go away.

`find . -type f -perm 777` found one file: `w777.sh`. It did not find `w666.txt`, which any account on the machine can write to.

`find . -type f -perm -o+w` found both.

That one-character difference is the whole audit. Without a leading dash, `-perm` matches files whose mode is *exactly* the one you typed and nothing else; a world-writable file that is not also executable sits at 666 and is invisible to it. With the dash, `-perm` switches to mask semantics: `-perm -o+w`, or `-perm -002`, matches any file with the other-write bit set, whatever the remaining bits say. Reach for the exact form when you are hunting your own `777` leftovers specifically. Reach for the mask when the question is "what can other people write to", because that question does not care about the other eight bits.

## Why the other-write bit is the one that matters

A Unix permission check sorts every process into owner, group or other, and a world-writable file hands write access to the last bucket: every account on the machine, including the ones you forgot exist. On a web server that includes the account the server itself runs as. A compromised plugin executing as `www-data` needs no root and no stolen password — a world-writable file in the web root is one it can rewrite at will, whether that means defacing a page or planting a backdoor in a cache directory. There is no exploit chain in that story. There is an open write bit and something hostile enough to use it.

## The fix that locks you out

The tempting cleanup after an audit like that is one recursive command: `chmod -R 644` across the whole tree. I ran it on a copy of the scratch tree.

chmod complained before it finished — `cannot access 'site2/index.html': Permission denied`, once per file — because it stripped the directory's execute bit first and then could not get back in to reach the files inside. Afterwards `ls site2` still listed all three names, and `cat site2/index.html` failed with `Permission denied`. The files exist, have sane modes, and cannot be reached.

On a directory, the execute bit does not mean "run this". It means "you may enter and traverse this". Take it away recursively and every directory becomes a wall; on a web server that shows up as a wave of 403s for content that is sitting right there on disk. Files and directories need different modes, which means two passes:

```bash
find /var/www -type f -perm -o+w 2>/dev/null    # any world-writable file
find /var/www -type f -exec chmod 644 {} \;     # files: rw-r--r--
find /var/www -type d -exec chmod 755 {} \;     # dirs keep x, or nobody gets in
```

The first line is the audit, the second and third are the repair. Files go to 644, directories to 755, and nothing is walled off.

## Keys go further, and ssh enforces it

Secrets go down to 600, and for SSH private keys that is not advice — the tools enforce it. I generated a throwaway ed25519 key in the scratch directory, set it to 644, and asked `ssh-keygen -y` to read it. It printed the `WARNING: UNPROTECTED PRIVATE KEY FILE!` banner, `Permissions 0644 for 'testkey' are too open`, then `This private key will be ignored`, and exited 255. At 600 the same command loaded the key without comment.

The ssh client makes the same check when it loads a key during a login. It ignores the key and carries on with whatever other methods it has, so what you see depends on what else was available: the banner followed by a password prompt, or the banner followed by `Permission denied`. Either way the answer is in `ls -l`, four characters wide, and the fix is `chmod 600`.

## Let the scan remember

None of these three runs involved a malfunction. The exact-mode search did exactly what it says, chmod did exactly what it was told, and ssh refusing a readable private key *is* the permission model working. What fails is memory: which `777` did I throw at which error, and did I ever close it? A scan with the mask form of `-perm` answers that in under a second, and a saved report makes the answer comparable from one week to the next.

The full audit script — with the saved report file, the SUID scan for a deeper security pass, and the recommended-modes reference for files, directories, keys and private dirs — is at https://bashsnippets.xyz/snippets/file-permissions-security

If your next move after fixing a key is generating one properly, the [SSH key setup script](https://bashsnippets.xyz/snippets/ssh-key-setup-script) covers that end to end, and when you need a mode you do not have memorized, the [Chmod Permissions Builder](https://bashsnippets.xyz/tools/chmod-permissions-builder) turns checkboxes into the octal value and the exact chmod command. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/file-permissions-security

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Cybersecurity, Sysadmin -->
