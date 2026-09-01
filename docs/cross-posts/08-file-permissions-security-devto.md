---
title: "Ten Minutes of Retyping a Passphrase I Knew Cold — the Bug Was Mode 644"
published: true
description: "An SSH key at mode 644 locked me out of my own box. The find -perm audit that catches world-writable files, and the chmod fix that doesn't break directories."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/file-permissions-security
cover_image: https://bashsnippets.xyz/ogimage.png
---

I lost ten minutes at my own desk to a passphrase I already knew. The key had worked that same morning. Now every attempt bounced — retype, rejected, retype slower, rejected — until I was auditing my keyboard layout, my caps lock, and my memory, in that order. None of them were the problem. At some point the private key file had picked up mode `0644`, and `ssh` had quietly decided it wanted nothing to do with it.

That refusal is deliberate. OpenSSH checks the mode on a private key before using it, and a key the group or the world can read gets treated as already burned — the client declines to load it at all. The trap is how the decision surfaces. Sometimes you get the loud `UNPROTECTED PRIVATE KEY FILE` banner and you know in two seconds. In other setups the key is skipped without ceremony, and what reaches you looks exactly like a failed authentication. So you debug the human layer — fingers, memory, the possibility that you are losing it — while the actual answer sits in the output of `ls -l`, four characters wide. That gap between where the failure is and where it appears to be is what the ten minutes bought me.

Repairing the key took one `chmod 600`. What kept me at the desk was the follow-up question: if I'd let one file's permissions drift, what else had drifted? So I scanned the box, and the scan came back with world-writable files I recognized — each one a `chmod 777` I'd thrown at some past problem to shut an error up, fully intending to tighten it afterward. Afterward had not arrived for a single one of them.

On my single-user machine the honest blast radius was small. On anything shared, it is not, and the reason deserves precision. A Unix permission check sorts every process into owner, group, or other, and a world-writable file hands write access to that last bucket — every account on the machine, including the ones you forgot exist. On a web server, that includes the account the web server itself runs as. A compromised plugin executing as `www-data` needs no root and no stolen password: a `777` file in the web root is one it can rewrite at will, whether that means defacing a page or planting a PHP backdoor in a cache directory. There is no exploit chain in that story. There is an open write bit and something hostile enough to use it.

The audit that catches this before it becomes that story is three lines of `find` you already have installed:

```bash
find /var/www -type f -perm -o+w 2>/dev/null    # any world-writable file
find /var/www -type f -exec chmod 644 {} \;     # files: rw-r--r--
find /var/www -type d -exec chmod 755 {} \;     # dirs keep x, or nobody gets in
```

The first line carries a subtlety that quietly ruins a lot of homegrown audits. `find -perm 777` — no leading dash — matches files whose mode is *exactly* 777 and nothing else. A file sitting at `666` is world-writable, non-executable, and invisible to that search. The leading dash switches `find` into mask semantics: `-perm -o+w` (equivalently `-perm -002`) matches any file with the other-write bit set, regardless of what the remaining bits say. Reach for the exact form when you're hunting your own `chmod 777` leftovers specifically; reach for the mask when the question is "what can other people write to," because that question does not care about the other eight bits.

The second and third lines exist as a pair because the tempting one-liner — `chmod -R 644` across the whole tree — is a self-inflicted lockout. On a directory, the execute bit doesn't mean "run this"; it means "you may enter and traverse this." Strip it recursively and every directory below the root becomes a wall: the files inside still exist, still have sane modes, and are completely unreachable, which on a web server materializes as a wave of 403s for content that is sitting right there on disk. Two `find` passes — files to `644`, directories to `755` — tighten everything without walling anything off. Keys and secrets go further, down to `600`, which is precisely what `ssh` had been demanding of mine the whole time.

Here's the uncomfortable part of the afternoon: nothing malfunctioned. The permission model did its job — `ssh` refusing a readable private key *is* the system working. What failed was me, scattering `777`s around like windows left open and trusting my memory of which ones I'd closed. Ten minutes of lost time was a cheap tuition for that lesson; on a box where anything else runs code, the price is set by whoever finds the open window first. The scan remembers so my memory doesn't have to.

The full audit script — with the saved report file, the SUID scan for a deeper security pass, and the recommended-modes reference for files, directories, keys, and private dirs — is at https://bashsnippets.xyz/snippets/file-permissions-security

If your next move after rescuing a key is generating one properly, the [SSH key setup script](https://bashsnippets.xyz/snippets/ssh-key-setup-script) covers that end to end, and when you need a mode you don't have memorized, the [Chmod Permissions Builder](https://bashsnippets.xyz/tools/chmod-permissions-builder) turns checkboxes into the octal value and the exact chmod command. The rest of the library is at https://bashsnippets.xyz
