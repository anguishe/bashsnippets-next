<!-- POSTING CADENCE RULE: maximum 1 CoderLegion post per week. Do not publish this within 7 days of the previous CoderLegion post. -->

# Finding the world-writable files on your server before someone else does

A world-writable file can be rewritten by every account on the machine — including the service account your web server runs as. Code executing as `www-data` through a compromised plugin doesn't need root: any `chmod 777` you left behind during past debugging is a file it can overwrite or replace outright.

Two details break most homegrown audits. First, `find -perm 777` (no dash) matches mode 777 *exactly* — a `666` file is equally world-writable and slips through. The dash form uses mask semantics and catches every file with the other-write bit set. Second, never fix findings with `chmod -R 644`: on directories, the execute bit means "may be entered," and stripping it recursively seals off the whole tree. Split the fix by type instead:

```bash
find /var/www -type f -perm -o+w 2>/dev/null
find /var/www -type f -exec chmod 644 {} \;
find /var/www -type d -exec chmod 755 {} \;
```

SSH keys and secrets go tighter, to `600` — OpenSSH refuses group- or world-readable private keys outright.

I keep the longer version as a script with a saved report file, a SUID scan, and a recommended-modes reference: [full file-permissions security audit script](https://bashsnippets.xyz/snippets/file-permissions-security).
