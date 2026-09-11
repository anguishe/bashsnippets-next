---
title: "Before You Run docker system prune, Read the RECLAIMABLE Column. Mine Said 1%."
published: true
description: "docker system df is the damage report: on my machine 15 images, 10.5 GB, 170 MB reclaimable. Where Docker's garbage actually comes from, the prune order that frees it, and the flags that keep what you use."
tags: bash, linux, devops, sysadmin
canonical_url: https://bashsnippets.xyz/snippets/docker-prune-cleanup
cover_image: https://bashsnippets.xyz/ogimage.png
---

The usual advice for a full disk on a Docker host is `docker system prune -a`, and it is usually given before anyone has looked. So I looked first, on my own laptop, which runs a dozen long-lived containers:

```text
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          15        14        10.51GB   170.3MB (1%)
Containers      15        12        74.42MB   94.31kB (0%)
Local Volumes   4         3         1.778GB   40.37MB (2%)
Build Cache     0         0         0B        0B
```

Pruning everything would free about 210 MB of 12.3 GB. Fourteen of the fifteen images are in use, nothing is built on this machine so there is no build cache, and zero images are dangling. Docker is not what is filling this disk, and `prune -a` here would mostly buy a long re-pull the next time a stopped container starts.

That is the whole point of `docker system df`: the RECLAIMABLE column is the damage report, and it answers "will pruning help" before you run anything irreversible. On a box that builds images, it tells a very different story.

## Why du cannot see it, and where the garbage comes from

On a Docker host, `du` sums `/var/lib/docker/overlay2` into a directory of 64-character hex names it can total but not attribute. `docker system df` is the lens that attributes it. And Docker has no garbage collector; four streams pile up as side effects of normal use:

- **Dangling images.** Every rebuild points the tag at the new image and orphans the old one as `<none>:<none>`. A server that builds on every deploy keeps every version it ever shipped.
- **Build cache.** BuildKit keeps every layer of every build to speed up the next one, indefinitely. On build machines this is often the biggest line in the table.
- **Stopped containers.** An exited container keeps its writable layer and, more importantly, pins its image and volumes.
- **Unattached volumes.** Removing a container does not remove its named volumes, and anonymous volumes accumulate quietly.

## The order that frees everything

A stopped container references its image and its volumes, and Docker will not delete anything still referenced — `Exited` containers included. Prune images first and everything held by a stopped container survives; prune volumes first and the attached ones are skipped. Containers first, then images, then volumes, then the build cache:

```bash
docker system df                              # the RECLAIMABLE column is the damage report
docker container prune -f                     # containers first — stopped ones pin images and volumes
docker image prune -af --filter "until=720h"  # unused images, keeping anything created in the last 30 days
docker volume prune -f                        # only volumes with zero attached containers
docker builder prune -af                      # build cache — the biggest line on most build boxes
```

Two flags deserve a slow read. `-a` on the image prune widens "unused" from dangling-only to every image no container references; `--filter "until=720h"` is its seatbelt, so nothing created in the last 30 days is removed. And `docker volume prune` is the one line that can destroy data rather than cache: a database whose container you removed last month lives in exactly the kind of volume it deletes. Read `docker volume ls` before you run it on anything that ever held state.

The discipline is three steps, not one: measure with `docker system df`, prune in reference order, measure again. On my laptop the first step was also the last. On a build server it is the difference between reclaiming gigabytes safely and deleting the one volume you needed.

---

Full script with the confirmation prompt, the before/after disk report, and the cron lines for scheduling it: https://bashsnippets.xyz/snippets/docker-prune-cleanup

The two snippets that would have caught this weeks earlier: [disk space warning](https://bashsnippets.xyz/snippets/disk-space-warning) exits non-zero the day a partition crosses your threshold, and [find large files](https://bashsnippets.xyz/snippets/find-large-files-linux) locates the offender when `df` says full and `du` says fine. The rest of the library is at https://bashsnippets.xyz
