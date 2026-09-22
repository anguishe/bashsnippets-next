<!-- SCHEDULED on CoderLegion 2026-09-21 as https://coderlegion.com/28023 - publishes Tue 2026-10-13 08:00 CDT, same minute as dev.to #08. Editing this file does NOT reach CoderLegion: edit the post there too. -->
<!-- Rebuilt 2026-09-20 on a real run (GNU findutils 4.11.0, GNU sed 4.9). Prior version opened on an "eleven services went down" incident that never happened. -->

# I escaped the dot correctly and sed still rewrote a file marked DO NOT CHANGE

Four config files, one hostname to rename. I knew the dot in `api.internal` is a regex wildcard, so I escaped it. `grep -rn 'api.internal'` unescaped matched a fourth file containing `apiXinternal` — a typo somebody deliberately kept. Escaped, `api\.internal` matched three. Good.

Then I ran the rename, and two of those three should never have changed: a line ending in `# DO NOT CHANGE`, and a commented-out sample. My `-not -path "*/samples/*"` exclusion did nothing, because the file was called `sample.conf` and was not inside a `samples/` directory.

That is the real lesson, and escaping was never the whole answer. The dot is the trap everyone warns about; the trap that actually got me was assuming my exclusion pattern matched what I pictured. The fix is an order, not a flag — make `grep -l` print the file list while everything is still read-only, and read it:

```bash
find /etc/myapp -type f -name "*.conf" -exec grep -l "api\.internal" {} +
```

If that list surprises you, the surprise *is* the bug, and you found it before anything was written. Only then pipe it to `sed -i.bak`, so every file keeps a rollback copy — and diff one against its `.bak` before trusting the run. `sed -i` exits 0 whether it changed four files or none.

The awk summarizing stage and the incident-triage pipeline are in the [find, grep, sed and awk ordering guide](https://bashsnippets.xyz/guides/bash-text-processing).
