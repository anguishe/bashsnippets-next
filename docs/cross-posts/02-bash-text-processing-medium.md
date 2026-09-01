# One sed -i, Four Files I Never Opened, Eleven Services Down

The message that told me checkout was broken came from an incident channel I didn't open. Eleven services, one shared config tree, and a cause I'd finished an hour earlier and already stopped thinking about: a recursive `sed -i` swapping our old API hostname, `api.internal`, for its replacement. The command exited zero. The file I spot-checked was flawless.

The story lived in four files I never looked at. Health-check URLs that pointed at the old host on purpose, so we could watch it through the migration. A comment. A sample config that ships to customers as documentation. And one file where the old hostname was deliberately pinned, a warning note sitting a few lines above the line I rewrote. sed reported success on every one of them, because every one of them *was* a success by its rules: match found, text replaced. The afternoon went to the rollback. The sting went to realizing a plain file listing, printed before the run, would have shown me all four.

Two mistakes had stacked. The first is a regex detail most people know and forget under pressure: the dot in `api.internal` matches any character, not a period, so the pattern was quietly broader than the hostname I meant — and with nothing anchoring it to config keys, it fired in comments and URLs too. Escaping it (`api\.internal`) or using `grep -F` for fixed strings closes that gap.

The second mistake was structural, and it's the one worth internalizing. In-place editing has no read-back step: `sed -i` commits to disk the moment the pattern engine agrees with itself. Whatever preview, confirmation, or undo you want has to come from *around* the command — which is exactly what the classic ordering of the four text tools provides. `find` chooses the files. `grep` previews the change. `sed` (or `awk`) makes it. A diff verifies it. Run them in that order and each step checks the one after it.

## What each step buys you

With `find`, the file list stops being implicit. `find /etc/myapp -type f -name "*.conf" -not -path "*/samples/*"` prints exactly what a change may touch, and that `-not -path` exclusion is the flag that would have spared my sample config. Nothing destructive should see a filename that didn't appear in this output.

With `grep`, the match count stops being a guess. `grep -rn "api\.internal" /etc/myapp --include="*.conf"` shows every hit with its line number. When the count disagrees with your expectation, the disagreement *is* the bug — surfaced while it's still read-only.

With `sed`, the missing undo gets built in. `-i.bak` keeps a backup of each original next to the edited file, and it happens to be the portable form too: BSD and macOS sed require a suffix after `-i`, so GNU-style bare `sed -i` breaks the moment the script leaves Linux. Wired together, the safe version of my rename becomes:

```bash
# Scope with find, confirm with grep, transform with a per-file undo
find /etc/myapp -type f -name "*.conf" -not -path "*/samples/*" \
  -exec grep -l "api\.internal" {} + \
  | xargs sed -i.bak 's/api\.internal/api-v2.internal/g'
```

Only files inside the scoped list *and* containing a genuine match get touched, and each keeps its own rollback. Diff one against its `.bak` before trusting the rest. For trees where filenames may contain spaces, `grep -lZ` into `xargs -0` removes the word-splitting risk in that pipe.

And when the question shifts from "change these lines" to "summarize these columns," the fourth tool takes over. `awk` splits each line into fields and runs a tiny program per line; its `END` block runs once at the end, collapsing a million-line access log into a total or a per-status-code count. Chained after `find` and `grep`, with `sort | uniq -c | sort -rn` to rank duplicates, it's the fastest incident-triage command I know: the most frequent error in today's logs, on the top line, in one pass.

The outage never came back, because the habit changed: no transform runs until the file list and the match count have been read by a human. The full version of this pipeline — every stage's flags, the traps in each, and the log-triage one-liner ready to paste — is the text-processing guide on BashSnippets, and the interactive find and grep builders on the same site assemble the exact invocations if you'd rather not memorize flag soup.

Originally published at https://bashsnippets.xyz/guides/bash-text-processing

<!-- Medium tags to set in the UI: Bash, Linux, DevOps, Programming, Software Engineering -->
