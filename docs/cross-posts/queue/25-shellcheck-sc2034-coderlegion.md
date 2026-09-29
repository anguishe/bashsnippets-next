<!-- NOT SCHEDULED. Wave 2 #25 - planned Thu 2026-12-17 08:00 CST (14:00Z), same minute as dev.to #25. ShellCheck before/after re-run in scratch on this box 2026-09-28 (ShellCheck 0.11.0, bash 5.3.9); matches the live page. The July repo finding and commit 093febd are quoted from the page (093febd verified 2026-09-28 in anguishe/bashsnippets). -->

# SC2034: my "ShellCheck-clean" repo wasn't

In July the README of my script repository said every script was ShellCheck-clean. Three of them failed on SC2034, "appears unused": two defined `CROSS="✗"` and never printed it, and one carried `KEY_BITS="4096"` in a script that only generates ed25519 keys. That last one was dead code that lied about what the script could do.

SC2034 is more useful than it looks, because an unused variable is usually half of a typo. I re-ran the page's log-pruning example on this box:

```bash
#!/bin/bash
set -eo pipefail
log_dir="$PWD/logs"
retention_days=30
find "$log_dir" -name '*.log' -mtime +"$retention_day" -delete
echo "pruned old logs"
```

ShellCheck 0.11.0 flagged `retention_days` as unused (SC2034) on line 4 and `retention_day` as referenced but not assigned (SC2154, "did you mean 'retention_days'?") on line 5. Run as-is, `find` got `-mtime +` and refused. With the common `${retention_day:-0}` default it would have deleted every log older than today. Spelling the name the same way twice made `shellcheck` exit 0 and the prune remove only the old file.

When the variable really is read elsewhere, as in a sourced library, a file-level `# shellcheck disable=SC2034` with the reason beats an `export` that leaks it into every child process.

The single-quote case, loop variables and the config-file directive are on the [full SC2034 page](https://bashsnippets.xyz/shellcheck/sc2034).
