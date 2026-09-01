# Every chmod 777 You Ever Typed Is Still Out There

There's a debugging move most of us learned early and never fully unlearned: something throws a permission error mid-task, you don't have time to reason about which of nine bits is wrong, so you hit it with `chmod 777` and promise yourself you'll tighten it once things work. I had made that promise more times than I could count. I had kept it, as far as I can tell, zero times.

The day I found out was not the day someone exploited one of those files. It was stranger than that — the day my permissions were too *loose* to log in. Ten minutes at my own desk, feeding a passphrase I'd used that very morning into a prompt that kept spitting it back. Retype. Rejected. Retype character by character. Rejected. The passphrase was correct on every attempt. The private key file had drifted to mode `0644`, and OpenSSH refuses to load a key that the group or the world can read — it treats readable-by-others as compromised-by-default and walks away.

What makes this failure genuinely mean is where it shows up. In the friendly case you get the `UNPROTECTED PRIVATE KEY FILE` warning and fix it in seconds. In the unfriendly case the client skips the key silently, the server sees an auth attempt with nothing behind it, and the error you actually read looks like you fat-fingered your passphrase. You end up interrogating your own memory when `ls -l` had the verdict printed the whole time.

One `chmod 600` fixed the key. But a box that let one mode drift has let others drift, so I went looking — and that's when the old promises surfaced. World-writable files, several of them, each one a `777` I'd slapped on during some forgotten fire and never revisited.

Why does that bit matter so much? Permission checks bucket every process on the system into owner, group, or other. World-writable means the *other* bucket — meaning every account on the machine — can rewrite the file. Follow that to a web server and the implication lands hard: the web server's own service account lives in that bucket. Malicious code running as `www-data` through some vulnerable plugin doesn't need to escalate privileges or crack a password. It scans for files it can write, and your `chmod 777` from eight months ago answers the call. Overwriting application code or dropping a backdoor into an uploads directory requires nothing further.

Finding these files takes one command, and fixing them takes two more:

```bash
find /var/www -type f -perm -o+w 2>/dev/null    # any world-writable file
find /var/www -type f -exec chmod 644 {} \;     # files: rw-r--r--
find /var/www -type d -exec chmod 755 {} \;     # dirs keep x, or nobody gets in
```

Two traps hide in those three lines, and both have bitten real audits.

Trap one is `find`'s permission syntax. Written without a leading dash, `-perm 777` demands an exact match — mode 777 and only mode 777. A file at `666` is every bit as world-writable and sails through that filter unseen. The dash form, `-perm -o+w` (or `-perm -002`), asks a different question: is this particular bit set, whatever the rest of the mode looks like? For a security audit, the mask form is the one you want, because attackers don't care what your other eight bits say either.

Trap two is the recursive fix. `chmod -R 644` over a web root reads like the obvious cleanup and is actually a lockout, because the execute bit means something different on a directory than on a file. On a file it means "this can run." On a directory it means "this can be entered." Recursively forcing 644 strips that bit from every directory in the tree, at which point everything inside becomes unreachable — correct files, correct modes, sealed behind doors nobody is permitted to open. A web server in that state serves 403s for content that exists. Splitting the fix into two `find` passes, files to `644` and directories to `755`, is the entire cure. Keys, credentials, and anything secret go to `600` — the standard my SSH key was being held to all along.

I keep coming back to the fact that nothing in that ten minutes was a malfunction. SSH enforcing key permissions is the platform protecting me from my own filesystem. The malfunction was archaeological: layers of expedient `777`s laid down over months, invisible because nothing had hurt yet. The audit takes seconds to run. The promises, it turns out, were never going to keep themselves.

Originally published at https://bashsnippets.xyz/snippets/file-permissions-security

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Cybersecurity, Sysadmin -->
