<!-- REVIEW: incident dramatized — verify before publishing -->
---
title: "My Backups Were Zero Bytes for Three Weeks Because Docker Quietly Ate the Disk"
published: true
description: "Stopped containers, unused images, dangling volumes, build cache — how Docker's invisible garbage filled a 25GB droplet and silently killed my nightly backups."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/docker-prune-cleanup
cover_image: https://bashsnippets.xyz/ogimage.png
---

I went looking for a database dump to seed a dev copy of a client's site and found nineteen of them, one per night, every single file exactly zero bytes. The backup cron on the $5 droplet had been "working" the entire time — the job fired at 3am, a fresh `.sql` file landed in `/backups`, the timestamps marched forward like nothing was wrong. Not one of those files contained a byte of data.

`df -h` explained the what: the 25GB disk was sitting at 100%. `pg_dump` had been dying with `No space left on device` every night since the 9th. The redirect still created its output file — a new directory entry costs next to nothing even on a full disk — so the backup folder kept filling with plausible-looking filenames while every actual write failed. And the errors had nowhere to land, because cron's output was pointed at a log file on the same full partition. The failure was eating its own evidence.

The full disk isn't the part that stings. The part that stings is that pulling this dump was the first restore anyone had attempted since I set the backups up, and they'd been failing the audition nightly, in silence, for three weeks.

Finding the culprit took longer than it should have, because `du` cannot see Docker properly. I totalled `/home`, `/var/log`, `/var/www` — call it 4GB, on a 25GB disk. The rest was hiding under `/var/lib/docker/overlay2`, a directory of 64-character hex names that `du` can sum but can't attribute to anything a human would recognize. The lens that works is `docker system df`, and its RECLAIMABLE column told the whole story: 11GB of images nothing referenced, close to 6GB of build cache, a few hundred megabytes of exited containers. Seventeen gigabytes of a 25GB disk, holding data no running process used.

## Docker never deletes anything

That's the root cause stated plainly: there is no garbage collector. Four separate streams pile up, and every one of them is a side effect of completely normal use.

I rebuilt the site's image on the droplet at every deploy. Each build points the tag at the new image and orphans the previous one as a dangling `<none>:<none>` — so months of deploys had quietly curated a museum of every version the site had ever been. Underneath that, BuildKit caches every layer of every build to make the next build faster, and keeps those layers indefinitely; on any box that builds regularly, cache becomes the single biggest line. Containers that exit don't disappear either — they sit in the `Exited` state holding their filesystem layers until someone removes them. And any `VOLUME` line in a Dockerfile mints an anonymous volume per container, which `docker rm` without `-v` leaves behind: unnamed, unreferenced, invisible, permanent.

## The order of the pruning is load-bearing

The cleanup is four prune commands, but they only collect fully in one order, and the reason is reference counting. A stopped container pins both its image and its volumes — Docker refuses to delete anything that any container still references, `Exited` ones included. Prune images first and everything held by a stopped container survives; prune volumes first and the attached ones get skipped. Containers go first precisely because removing them releases those references, so the next three passes have something to collect.

```bash
docker system df                              # the RECLAIMABLE column is the damage report
docker container prune -f                     # containers first — stopped ones pin images and volumes
docker image prune -af --filter "until=720h"  # unused images, keeping anything used in the last 30 days
docker volume prune -f                        # only volumes with zero attached containers
docker builder prune -af                      # build cache — the biggest line on most build boxes
```

Two flags deserve a close read before this touches a machine you care about. The `-a` on the image prune widens "unused" from dangling-only to any image no container references at all — that's the aggressive setting, and `--filter "until=720h"` is its seatbelt: 720 hours is 30 days, so nothing used in the past month gets touched, and images belonging to running containers are never candidates regardless. The volume prune carries the sharpest edge. It removes only volumes with zero attached containers — a Postgres data volume attached to a stopped-but-preserved container is safe — but a volume whose container you already removed with `docker rm` is precisely what it collects. On a box holding real data, that one step earns a `docker ps -a` beforehand.

## What it bought back

The version on the site wraps those steps in a proper script: a confirmation prompt that lists exactly what's about to be removed, a `--force` flag so cron can run it unattended, and a `docker system df` report printed before and after so every run tells you what it reclaimed. The first run on the droplet handed back a little over 16GB.

It runs monthly from cron now — and so does a disk threshold alert, because the real failure here was never Docker. It was a disk that filled while nothing complained, and a backup that failed nineteen nights in a row with no way to say so. Docker's garbage is invisible to `du`, silent in the logs, and perfectly patient. It waits until the disk is full, then breaks something that has nothing to do with Docker.

Full script with the confirmation prompt, the before/after disk report, and the cron lines for scheduling it: https://bashsnippets.xyz/snippets/docker-prune-cleanup

The two snippets that would have caught this weeks earlier: [disk space warning](https://bashsnippets.xyz/snippets/disk-space-warning) exits non-zero the day a partition crosses your threshold, and [find large files](https://bashsnippets.xyz/snippets/find-large-files-linux) locates the offender when `df` says full and `du` says fine. The rest of the library is at https://bashsnippets.xyz
