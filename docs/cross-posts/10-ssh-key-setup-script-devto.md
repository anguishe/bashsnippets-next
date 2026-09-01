<!-- REVIEW: incident dramatized — verify before publishing -->
---
title: "Every Light Was Green and My VPS Was Still Taking 31,000 Password Guesses a Week"
published: true
description: "ssh-copy-id exited 0 and the passwordless login worked — none of it closed the door botnets were hammering. What SSH key 'success' actually proves."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/ssh-key-setup-script
cover_image: https://bashsnippets.xyz/ogimage.png
---

I set up SSH keys on a $5 droplet one evening — nginx for a small client site, a cron backup, nothing exotic — and every signal I knew to check came back green. `ssh-keygen` produced a clean ed25519 pair. `ssh-copy-id` printed "Number of key(s) added: 1" and exited 0. The next `ssh` dropped me at a prompt without asking for a password. I closed the laptop feeling like a person who takes security seriously.

Three weeks later I was on that box chasing an unrelated log question and noticed `auth.log` was 40MB. `grep -c "Failed password"` came back at a little over 31,000 — for that week. Botnets spread across a few hundred IPs had been guessing passwords against port 22 around the clock, the entire time, because password authentication was still enabled. Nothing got in. But nothing I'd done that evening would have stopped a lucky guess either, and I'd spent three weeks believing otherwise.

The part that stung wasn't the log file. It was realizing I'd treated a passwordless login like a finish line, when it was a screenshot of the wrong scoreboard.

## What that exit 0 actually promised

`ssh-copy-id` succeeding means precisely this: it authenticated to the server — using the password, note — appended your public key to `~/.ssh/authorized_keys`, and exited. Its exit code is a claim about the contents of a file, not about how future logins will behave. The passwordless login that follows proves "some authentication method succeeded," nothing sharper than that. And key auth working versus password auth being closed are two independent switches — flipping the first tells you nothing about the second. My dashboard was green because every gauge on it measured the wrong thing.

## SSH fails silently on the side you're watching

The deeper trap is how SSH authentication is structured. It's a negotiation: the server offers an ordered list of methods — typically `publickey,password` — and your client walks down the list. When your key gets refused, the client doesn't raise an error. It moves quietly to the next method. The refusal is recorded exactly once, in the server's `auth.log`, which is the one place nobody looks while setting up.

And keys get refused for reasons that produce no client-side symptom at all. The classic is permissions: sshd's `StrictModes` checks the remote `~/.ssh`, the `authorized_keys` file, and your home directory, and if any of them is group-writable — say a 775 left behind by an rsync — it ignores `authorized_keys` entirely. Silently. Your login still works, via password fallback, so everything looks fine right up until the day you disable passwords and lock yourself out of your own server.

Which means there are two invisible failure states, and they're indistinguishable from your terminal: key auth broken but masked by password fallback, and key auth fine but the password door still wide open. In both cases you're logged in. In both cases something is wrong.

## The core, plus the one test that doesn't lie

```bash
ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)-$(date +%Y%m%d)" -f ~/.ssh/id_ed25519 -N ""
chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_ed25519
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
ssh -o PasswordAuthentication=no user@server   # proves the KEY works — not "something worked"
```

The `-N ""` is what makes generation non-interactive — misplace that flag and your "automated" run sits waiting on a passphrase prompt, which I have personally done at one in the morning more times than I'll commit to print. The chmod lines aren't ceremony either: SSH refuses a private key other users can read, and the error it gives is one people reliably misread as a passphrase problem.

The last line is the one that changed my habits. Forcing `PasswordAuthentication=no` for a single connection removes the fallback chain, so success now means one thing only: the key authenticated. If that command prompts or fails, your key is being refused — usually by server-side permissions — and you get to fix it while the other way in still exists.

Then the actual finish line, on the server: `PasswordAuthentication no` in `/etc/ssh/sshd_config`, restart sshd. Do it with your current session held open and test from a second terminal, because if the key was being silently refused, you want to learn that while you're still holding a live connection — not after you've locked the only door you can open.

## Why I scripted the whole dance

Because the failure mode of doing it from memory is me: wrong key type one night, wrong output path another, the `-N` flag in the wrong spot. The full version on the page refuses to overwrite an existing key pair, sets directory and key permissions correctly on every run, prints the public half ready to paste into a cloud control panel, and runs `ssh-copy-id` for you when you give it a target — with a loop variant for pushing one key to several servers. The steps I used to get wrong are now steps I don't touch.

The droplet still gets probed daily — every public IPv4 address does. The difference is that `auth.log` no longer records thirty thousand password guesses a week, because there's no password auth left to guess at. That's the outcome the setup evening was supposed to buy, delivered three weeks late.

Full script with the existing-key guard, permission handling, and the multi-server loop: https://bashsnippets.xyz/snippets/ssh-key-setup-script

If the permissions detail is the part that's bitten you before, [file permissions and security](https://bashsnippets.xyz/snippets/file-permissions-security) covers the modes SSH insists on, [list open ports](https://bashsnippets.xyz/snippets/list-open-ports-linux) shows what else your box is answering on, and the rest of the library is at https://bashsnippets.xyz
