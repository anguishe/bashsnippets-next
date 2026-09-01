<!-- REVIEW: incident dramatized — verify before publishing -->
---
title: "Nineteen Nights of Exit 0 While rsync Quietly Emptied My Backup"
published: true
description: "My nightly rsync mirror deleted 3,800 files and reported success every time. What exit 0 actually promises, and a builder that makes --delete hard to misuse."
tags: bash, webdev, tools, productivity
canonical_url: https://bashsnippets.xyz/tools/rsync-command-builder
cover_image: https://bashsnippets.xyz/ogimage.png
---

For nineteen nights in a row, my backup job deleted my backup and called it a success. The cron entry fired at 2am on a $5 VPS, ran rsync with `--delete` down to the home server, exited 0, pinged the healthcheck, and wrote `✓ backup complete` to the log. Nineteen green checkmarks in the dashboard. Across those same nineteen nights, the destination directory went from roughly 3,800 files to exactly one.

The trigger was a cleanup I was proud of. I'd moved a client site's web root from `/var/www/html` to `/srv/www`, updated the nginx config, confirmed the site served, and closed the laptop feeling organized. The backup script still pointed at `/var/www/html` — which Debian's nginx package keeps around, holding nothing but its default index page. So every night, rsync compared a source containing one file against a destination containing thousands and did precisely what `--delete` instructs: it made them match.

I found out on a Saturday, when the client asked whether I could recover a photo she'd deleted from her site months earlier. The backup — the entire reason I could say yes to questions like that — was a directory containing `index.nginx-debian.html`. I scrolled back through nineteen days of green in the monitoring page and realized every one of those checkmarks had been documenting a deletion. That scroll is the part I would pay money not to repeat.

## Exit 0 doesn't mean what your monitoring thinks it means

The bug wasn't in rsync. It was in what I assumed its exit code promised. rsync reserves non-zero codes for failures on its own terms — an unreachable host, a protocol error, an I/O failure, source files vanishing mid-transfer (code 24), a partial transfer (code 23). Emptying a destination because the source is empty is none of those. It is the requested operation, delivered without incident. My monitoring answered the question "did rsync finish?" and I had labeled that answer "is the data safe?" Those are different questions, and the gap between them was exactly nineteen nights wide.

## rsync's sharp edges fail by succeeding

Once you see that shape, you find it all over the command. A trailing slash on the source means "copy the contents"; no trailing slash means "copy the directory itself," which nests a second `www` inside your destination — and on a `--delete` mirror, changes what gets compared and therefore what gets removed. Both versions run clean. Drop `-a` and rsync stops preserving permissions, symlinks, and timestamps — and because its quick check decides "already transferred" by comparing size and modification time, a destination full of transfer-time mtimes never matches again, so every night quietly becomes a full re-copy of the tree that still exits 0. Hand a comma-separated list to a single `--exclude` and it matches nothing, so `node_modules` rides along on every run. None of these mistakes produce an error. Each one completes a different operation than the one in your head, successfully. You learn which operation at restore time.

## The three seconds that would have saved me

The habit that prevents the whole class of failure is previewing every destructive sync:

```bash
rsync -avz --delete --dry-run -e ssh /srv/www/ travis@backup:/srv/backup/www/
# read every "deleting …" line, then — and only then — remove --dry-run
```

Had that flag been in the script, night one would have printed thousands of `deleting` lines instead of executing them. A wall of deletions in a preview you're reading is unmissable. The same wall in a log nobody opens is a green checkmark.

## So I built the composer I needed that night

The [Rsync Command Builder](https://bashsnippets.xyz/tools/rsync-command-builder) assembles the command in a live preview while you toggle the real options: archive mode, verbose output, compression, resume for unreliable links (`--partial --progress`), SSH transport, a bandwidth cap in KB/s for syncs that share a link with people trying to use it, and exclude patterns — typed comma-separated, emitted as one individually quoted `--exclude` flag per pattern, so the shell never expands your glob and the comma mistake can't happen.

The opinions baked into it are the point. Toggle `--delete` without dry-run and a red warning lands in your face: these deletions are permanent, preview them first. Turn dry-run on and it switches to a green note telling you to drop `--dry-run` only after you've read the output. The Mirror preset ships with dry-run already enabled — mirroring is the one mode where you consciously switch the safety off instead of remembering to switch it on. The whole thing runs in your browser; nothing you type leaves the page.

The version of me with nineteen green checkmarks didn't need a smarter rsync. He needed the command's consequences made visible at composition time, when reading them costs three seconds — not at restore time, when the price was a client's photo. (She eventually found a low-res copy in an old email thread, which is the only reason this story has a tolerable ending.)

Build the command with the guardrails on: https://bashsnippets.xyz/tools/rsync-command-builder

For the script around it — cron scheduling, SSH keys, the hardened version of my nightly job — the [Rsync Remote Backup](https://bashsnippets.xyz/snippets/rsync-remote-backup) snippet pairs with this tool, [Automated File Backup](https://bashsnippets.xyz/snippets/automated-file-backup) covers the local variant, and the rest of the library is at https://bashsnippets.xyz
