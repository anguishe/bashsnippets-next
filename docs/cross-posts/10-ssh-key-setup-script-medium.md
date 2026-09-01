<!-- REVIEW: incident dramatized — verify before publishing -->
# ssh-copy-id Exited 0. The Brute-Force Attempts Never Stopped.

The `auth.log` on my $5 droplet was 40 megabytes. I was on the box for an unrelated reason, ran `grep -c "Failed password"` out of idle curiosity, and got back a number north of 31,000 — one week's worth. A few hundred IPs had been guessing passwords against port 22 around the clock.

Here's the thing: I had "secured" that server three weeks earlier. Generated an ed25519 key, watched `ssh-copy-id` report "Number of key(s) added: 1" with a clean exit 0, logged in without a password prompt, and closed the laptop satisfied. Every check I performed passed. None of them measured the thing that mattered, because password authentication was still switched on the whole time, and password auth is what the botnets were attacking. Nothing got in — but my setup evening had done nothing to stop a lucky guess, and I'd been walking around believing it had.

That's the failure worth writing down: not a red error I mishandled, but a wall of green that let me believe a finish line I never crossed.

## Two switches, one gauge

Pull apart what each green light actually asserted. `ssh-copy-id`'s exit code says a line was appended to `~/.ssh/authorized_keys` on the server — a statement about file contents. It even used the password to get there. The passwordless login afterwards says some auth method worked, without saying which. Meanwhile the thing I cared about — is password auth closed? — lives in `/etc/ssh/sshd_config` and doesn't move until you set `PasswordAuthentication no` and restart sshd. Key auth on and password auth off are separate switches. I'd flipped one and read the gauge for the other.

## Where SSH hides its refusals

It gets worse, because SSH's design hides key failures too. Authentication is a negotiated walk down an ordered list — the server offers `publickey,password`, the client tries each in turn. A refused key produces no client-side error at all; the client drops to password and carries on. The single record of the refusal lands in the server's `auth.log`, the file nobody reads during setup.

The most common silent refusal is permissions. sshd's `StrictModes` inspects the remote `~/.ssh`, `authorized_keys`, and your home directory; one group-writable directory — a 775 an rsync left behind, say — and it disregards `authorized_keys` completely, no warning issued. You keep logging in via password fallback and everything feels fine, right up until the day you turn passwords off and discover your key never worked. From your terminal, "key broken but masked by fallback" and "key fine but passwords still exposed" are the same experience: a successful login.

## Four lines, one honest test

```bash
ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)-$(date +%Y%m%d)" -f ~/.ssh/id_ed25519 -N ""
chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_ed25519
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
ssh -o PasswordAuthentication=no user@server   # the key worked — not "something" worked
```

Two details carry the weight. The `-N ""` gives the key an empty passphrase so generation runs non-interactively; put that flag in the wrong position and the script hangs on a prompt, a mistake I've made at one in the morning more often than I'd like on record. And the chmods matter because SSH declines keys with loose permissions — with messaging vague enough that people go hunting for a passphrase problem instead.

The fourth line is the honest test. Stripping password auth out of a single connection collapses the fallback chain, so a success can only mean the key authenticated. If it prompts or refuses, the key is broken — usually server-side permissions — and you've found out while the password route still exists to fix it through.

Only after that test passes does the real lockdown happen: `PasswordAuthentication no` on the server, restart sshd, and verify from a second terminal while the first session stays open. A silently refused key plus a closed password door equals a server you can no longer enter; the open session is your undo button.

## The script that replaced my memory

I eventually stopped typing any of this by hand, because my track record was wrong key types, wrong output paths, and that misplaced `-N`. The full script on the page guards against overwriting an existing pair, enforces the 700/600 permissions every run, prints the public key ready for a cloud provider's control panel, and optionally pushes it out via `ssh-copy-id` — including a loop for multiple servers. The mistakes I used to make live in steps I no longer perform.

The bots still knock on that droplet daily; they knock on every public IPv4 address. But the password method they're built to attack no longer exists there, which is what that first evening was supposed to accomplish. The green lights are finally attached to the right wires.

The full setup script, the permissions walkthrough, and the multi-server variant: https://bashsnippets.xyz/snippets/ssh-key-setup-script — and the file permissions snippet at https://bashsnippets.xyz/snippets/file-permissions-security pairs with it if StrictModes is the part that got you.

Originally published at https://bashsnippets.xyz/snippets/ssh-key-setup-script

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Ssh, Cybersecurity -->
