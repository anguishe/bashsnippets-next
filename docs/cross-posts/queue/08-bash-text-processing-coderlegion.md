<!-- CoderLegion posting cadence rule: maximum 1 CoderLegion post per week. If another BashSnippets excerpt has gone up this week, hold this one. Excerpt only — never post the full article body here (no canonical support). -->

A recursive `sed -i` renaming an API host once took down checkout on eleven services for me — not because the command failed, but because it succeeded in four files I never opened: health-check URLs, a comment, a sample config, and a deliberately pinned hostname.

Two things went wrong. The dot in `api.internal` is a regex wildcard, so the pattern matched more than the hostname in my head. And `sed -i` overwrites originals with no preview and no undo.

The fix is an order, not a flag. `find` prints the exact file list first — exclusions like `-not -path "*/samples/*"` keep the files that must not change out of reach. `grep -rn` then counts the real matches; if the count surprises you, that surprise is the bug, caught while everything is still read-only. Only then does `sed` run, with `-i.bak` so every file keeps a rollback copy:

```bash
find /etc/myapp -type f -name "*.conf" -not -path "*/samples/*" \
  -exec grep -l "api\.internal" {} + \
  | xargs sed -i.bak 's/api\.internal/api-v2.internal/g'
```

Diff one file against its `.bak` before trusting the run. The [full walkthrough of the find, grep, sed, and awk order — including the awk stage for summarizing logs and the incident-triage pipeline](https://bashsnippets.xyz/guides/bash-text-processing) covers each stage's flags and the traps in each.
