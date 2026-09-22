<!-- SCHEDULED on CoderLegion 2026-09-21 as https://coderlegion.com/28020 - publishes Thu 2026-10-01 08:00 CDT, same minute as dev.to #05. Editing this file does NOT reach CoderLegion: edit the post there too. -->

# sed 's/port/listen_port/g' rewrote four lines of a four-line config

A four-line YAML file (`port: 8080`, `support_email`, `transport: tcp`, `report_dir: /var/reports`) and the rename most people type first: `sed -i 's/port/listen_port/g' app.yml`. GNU sed 4.9 exited 0 and printed nothing, because `-i` never does. Afterwards the file held `suplisten_port_email`, `translisten_port` and `/var/relisten_ports`. One line was meant to change. All four did.

sed matches characters, not words. The letters p-o-r-t sit inside `support`, `transport` and `report`, and `g` replaced every occurrence. GNU sed's `\b` word boundary fixes the match, and one pipe shows the damage before anything is written:

```bash
sed 's/\bport\b/listen_port/g' app.yml | diff app.yml -
```

Without `-i` the file on disk stays intact, and `diff` prints the lines that would change. It exits 1 when it finds differences, so the same check works inside a script. Only after the diff reads right does `-i` go back on.

Two caveats before trusting `\b`. Underscore counts as a word character, so `db_port` stays untouched. And `\b` is a GNU extension: BSD sed on macOS spells word boundaries `[[:<:]]` and `[[:>:]]`, and its `-i` requires a suffix argument (`sed -i ''`) where GNU's is optional.

The replacement side bites too. An unescaped `&` means the whole match, so `s/CEO/Smith & Sons/` produces `Smith CEO Sons`.

The bulk-replace script, with a `grep -rl` file list, per-file diff and an `--apply` gate that fails toward reading, is on the [sed find-and-replace snippet page](https://bashsnippets.xyz/snippets/bash-sed-find-replace).
