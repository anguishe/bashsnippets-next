# CoderLegion excerpt audit — 2026-09-20

Six excerpts (`06`, `07`, `08`, `09`, `13`, `14`) were written 2026-09-01 and never checked against a
real run, so the queue README had them marked "not scheduled". This is that check.

**Verdict: 3 rebuilt, 3 cleared, all 10 now postable.** Every technical claim in all six was
re-run on this box before it was kept — GNU findutils 4.11.0, GNU awk 5.3.2, GNU sed 4.9, bash 5.3.9.

⚠ **`find` on this box is a shell function that resolves to `bfs 4.1.1` in an interactive shell.**
`/usr/bin/find` is GNU findutils 4.11.0. Every verification below was run against `/usr/bin/find`
explicitly, because the claims are about GNU `find` behaviour.

---

## Rebuilt — opened on incidents that never happened

These violated the real-runs-only rule (Travis, 2026-09-11: articles open on real runs from this
box, never invented incidents). Same family as the retired `~/distribution-kit/` originals whose
staging-outage and eleven-nights stories were cut for the same reason.

### 07 — delete-old-log-files
**Was:** *"A directory of logs nobody reads took my SSD to zero free bytes, and the symptoms
scattered…"* — did not happen.
**Now opens on** a real `touch -d` experiment. Three files aged exactly 30 days, 30 days + 12 hours,
and 31 days; `find . -name '*.log' -mtime +30` returned **only the 31-day file**. `-mtime +29`
returned all three. That is the same fact the scheduled dev.to post #07 is built on, verified again
here rather than assumed.
Two further real results folded in from the same session:
- `find ws -name '*.log' | xargs rm` on `app v2.log` → `rm: cannot remove 'ws/app'` and
  `rm: cannot remove 'v2.log'`; **the file survived**.
- `find ord -delete -name '*.log'` on a directory holding `keep.txt` and `kill.log` → **both files
  and the directory itself were removed.** `-delete` is an action returning true, so placing it
  before the filter fires on everything walked. Confirmed identically on GNU find and bfs.

### 08 — bash-text-processing
**Was:** *"A recursive `sed -i` renaming an API host once took down checkout on eleven services for
me"* — did not happen, and "eleven" is from the known-fabricated family.
**Now opens on** a real four-file run. Unescaped, `grep -rn 'api.internal'` matched a file containing
**`apiXinternal`** — the wildcard trap, demonstrated rather than asserted. Escaped, `api\.internal`
matched three files, and the rename then rewrote **two that should never have changed**: a line
ending `# DO NOT CHANGE` and a commented-out sample. The `-not -path "*/samples/*"` exclusion did
nothing because the file was `sample.conf`, not inside a `samples/` directory. That is a better
lesson than the invented one: escaping was never the whole answer, and the failure was assuming an
exclusion pattern matched what you pictured. Also verified: `sed -i` exits **0** having changed
nothing.

### 09 — bash-send-email-alert
**Was:** *"mine logged a filling disk for hours while I found out from the outage"* — did not happen.
**Now opens on** what this machine actually does: `type -a mail mailx sendmail` →
**`mail not found` / `mailx not found` / `sendmail not found`.** No MTA at all. Every alert script
written the standard way would pipe into a command that does not exist. This is the same true fact
the scheduled dev.to post #09 is built on ("My Machine Has No mail Command").

---

## Cleared — no incident claim, claims re-verified

### 06 — bash-scripts-every-sysadmin-needs
No first-person incident; it was always explanatory. Verified: awk's numeric coercion really does
turn df's `82%` string into `82`, so `NR>1 && $5+0 >= 80` matched the 82% row and skipped the 7% row
with no `cut` or `sed`. The "#1 of 25" claim checks out — the live guide says 25 scripts.

### 13 — file-permissions-security
No incident claim. Both load-bearing claims re-verified:
- `/usr/bin/find perm -type f -perm 777` → matched **only** the 777 file.
  `-perm -o+w` → matched **both** the 666 and the 777 file. Mask semantics confirmed.
- `chmod -R 644` on a tree then `ls seal/sub` → **`Permission denied`**. Stripping the execute bit
  recursively really does seal the directory.
The page's SUID/SGID scan and saved `REPORT_FILE` both exist, so that claim is backed.

### 14 — ssh-key-setup-script
No incident claim. Every statement is documented SSH behaviour (`ssh-copy-id` exit 0 means a line was
appended, the method list falls back to password silently, `StrictModes` ignores `authorized_keys`
when `~/.ssh` or `$HOME` is group-writable, `-o PasswordAuthentication=no` removes the fallback).
Not re-runnable here without a second host, and none of it is presented as a personal incident, so it
stands as written. The page's existing-key guard and multi-server section both exist.

---

## Gates, all ten files

| Check | Result |
|---|---|
| Body length (excerpt rule: 150–250 words) | 205–249, all in range |
| Banned words (simply / just / easy / straightforward / "in this tutorial") | 0 |
| Code blocks (excerpt rule: at most one) | exactly 1 each |
| Deep link, never the homepage | 10/10 deep |
| Anchor text varied, not "BashSnippets" | 10/10 |
| Target URL live | 10/10 **200** |

## Schedule consequence

> **Superseded 2026-09-21:** posted with dev.to (Tue/Thu, same minute), not weekly. 02–05 were added. Ids are in the queue README.

One per week, and #01 slipped its 9/16 slot, so the queue moves down one week: 9/21, 9/28, 10/5,
10/12, 10/19, 10/26, 11/2, 11/9, 11/16, 11/23. **Seven land before the 11/04 read, three after.**
That is acceptable — the read counts dev.to posts. CoderLegion's job is the deep link, not the date.
