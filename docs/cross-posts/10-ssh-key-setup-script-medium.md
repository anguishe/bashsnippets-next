# One ssh Flag Tells You Whether a Server Still Accepts Passwords

Setting up SSH keys produces a row of green lights. `ssh-keygen` prints a fingerprint, `ssh-copy-id` reports `Number of key(s) added: 1` and exits 0, and the next login skips the password prompt. None of those answers the question the setup was for: does this server still accept passwords?

There is a one-flag way to ask. `ssh -o PreferredAuthentications=none user@host` offers no credentials at all, so the server has to refuse, and its refusal lists every method it would have accepted. I pointed it at a Mac on my home network that has Remote Login switched on, from my Kali laptop. The answer was `Permission denied (publickey,password,keyboard-interactive)`. Passwords are open there. The same kind of question put to GitHub's SSH endpoint comes back with `publickey` and nothing else. No login attempt, no guessing, two seconds.

That probe answers what the setup evening's green lights never could, because those lights were measuring something else.

## What the exit 0 actually promised

`ssh-copy-id` succeeding means precisely this: it authenticated to the server — using your password, note — appended your public key to `~/.ssh/authorized_keys`, and exited. Its exit code is a claim about the contents of a file, not about how future logins behave. The passwordless login that follows proves "some authentication method succeeded", nothing sharper. Key auth working and password auth being closed are two independent switches. Flipping the first tells you nothing about the second, and OpenSSH ships with the second on: on this laptop, `/etc/ssh/sshd_config` still has `#PasswordAuthentication yes` commented out, which means the default, which means yes.

## SSH hides its refusals from the side you are watching

Authentication is a negotiation. The server offers an ordered list of methods, the client walks down it, and when one method is refused the client moves quietly to the next. The refusal is recorded once, in the server's auth log, which is the one place nobody looks during setup.

I have watched that negotiation go wrong on my own machine with no useful message at all. `ssh` from this Kali laptop to that same Mac printed `Permission denied` three times, then `Too many authentication failures`. The real cause appeared nowhere in the output: KDE's password helper, `ksshaskpass`, had intercepted the prompt, failed to render it, and handed ssh an empty password each time. On top of that, the client offered every key it had first, and each offer spent one of the server's authentication attempts before the password was ever tried. `SSH_ASKPASS_REQUIRE=never` and `-o PubkeyAuthentication=no` got through. The point is not the KDE bug. It is that from the client side, a broken method and a skipped method look the same.

Keys get refused for reasons with no client-side symptom at all. The classic one is permissions: sshd's `StrictModes` checks the remote `~/.ssh`, `authorized_keys` and your home directory, and if any of them is group-writable it ignores `authorized_keys` entirely. Your login still works through password fallback, so everything looks fine until the day you disable passwords and lock yourself out.

That leaves two invisible states that look identical from your terminal: key auth broken but masked by password fallback, and key auth fine with the password door wide open. In both, you are logged in.

## The core, plus the one test that does not lie

```bash
ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)-$(date +%Y%m%d)" -f ~/.ssh/id_ed25519 -N ""
chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_ed25519
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
ssh -o PasswordAuthentication=no user@server   # proves the KEY works — not "something worked"
```

`-N ""` gives the key an empty passphrase so generation runs without a prompt; leave it out of an automated run and the script sits waiting for input. The chmod lines are not ceremony: SSH refuses a private key other users can read, with a message people reliably misread as a passphrase problem.

The last line is the one that matters. Forcing `PasswordAuthentication=no` for a single connection removes the fallback, so success can only mean the key authenticated. If that command prompts or fails, your key is being refused — usually by server-side permissions — and you find out while the other way in still exists.

Then the actual finish line, on the server: `PasswordAuthentication no` in `/etc/ssh/sshd_config`, reload sshd, and run the `PreferredAuthentications=none` probe again. `password` should be gone from the list. Do it with your current session held open and test from a second terminal, so a silently refused key costs you a fix and not a locked door.

## Why the setup is a script

Because doing it from memory fails in small ways: the wrong key type one time, the wrong output path another, `-N` forgotten so the run hangs. The full version on the page refuses to overwrite an existing key pair, sets directory and key permissions on every run, prints the public half ready to paste into a cloud control panel, and runs `ssh-copy-id` for you when you give it a target, with a loop variant for pushing one key to several servers.

Every public IPv4 address gets probed for SSH passwords around the clock. The green lights from key setup do not tell you whether that matters to your server. One refusal message does.

Full script with the existing-key guard, permission handling and the multi-server loop: https://bashsnippets.xyz/snippets/ssh-key-setup-script

If permissions are the part that has bitten you, [file permissions and security](https://bashsnippets.xyz/snippets/file-permissions-security) covers the modes SSH insists on, [list open ports](https://bashsnippets.xyz/snippets/list-open-ports-linux) shows what else your box is answering on, and the rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/ssh-key-setup-script

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Ssh, Cybersecurity -->
