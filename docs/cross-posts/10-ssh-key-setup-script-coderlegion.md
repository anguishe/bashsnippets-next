<!-- Posting cadence rule: max 1 CoderLegion post per week. -->
# Passwordless SSH login proves less than you think

Setting up SSH keys has a trap: every success signal can be green while the thing you cared about stays broken. `ssh-copy-id` exiting 0 means a line was appended to `authorized_keys` — nothing more. A passwordless login afterwards means *some* auth method worked, not necessarily your key: SSH walks an ordered method list, and a refused key falls back to password silently, with the refusal logged only server-side. The usual silent killer is permissions — sshd's `StrictModes` ignores `authorized_keys` entirely if `~/.ssh` or your home directory is group-writable.

The core, with the one test that can't lie:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_ed25519
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
ssh -o PasswordAuthentication=no user@server
```

That last line removes the fallback chain, so success means the key itself authenticated. Only then set `PasswordAuthentication no` in `/etc/ssh/sshd_config` and restart sshd — testing from a second terminal while your current session stays open, so a bad key can't lock you out. Until you flip that switch, brute-force bots are still guessing passwords against your box no matter how well the key works.

I keep the whole dance in one script — existing-key guard, permission enforcement, optional multi-server deploy: [full SSH key setup script with ssh-keygen and ssh-copy-id](https://bashsnippets.xyz/snippets/ssh-key-setup-script)
