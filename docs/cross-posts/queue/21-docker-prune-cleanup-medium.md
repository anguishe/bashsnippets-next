# Before You Run docker system prune, Read the RECLAIMABLE Column.

The usual advice for a full disk on a Docker host is `docker system prune -a`, and it usually arrives before anyone has looked. So I looked first, on my own laptop, which runs a dozen long-lived containers. Docker 28.5.2, measured on 2026-09-28:

```text
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          15        14        10.51GB   170.3MB (1%)
Containers      15        12        74.49MB   94.31kB (0%)
Local Volumes   4         3         1.838GB   40.37MB (2%)
Build Cache     0         0         0B        0B
```

About 12.4 GB on disk, about 210 MB of it reclaimable. Fourteen of the fifteen images are in use, nothing is built on this machine so there is no build cache, and pruning everything would give back less than 2 % of what Docker holds. Docker is not what is filling this disk. `prune -a` here would mostly buy a long re-pull the next time a stopped container starts, and I would have run it on reflex if I had not read one table first.

That is the job of `docker system df`. The RECLAIMABLE column answers "will pruning help" before you run anything irreversible.

## What -v adds, and what it does not

`docker system df -v` breaks each line down per object. I am not pasting mine, because it is a list of what runs on my laptop, but the counts are the useful part. Zero dangling `<none>:<none>` images. One image with no container at all, 78.6 MB unique. One volume with zero links, 40.37 MB, which matches the volume RECLAIMABLE figure exactly. Three containers in the Exited state, and two images whose only users are those stopped containers: 712 MB between them by `docker image inspect`.

Those 712 MB are the interesting number. An exited container still references its image, and Docker never removes an image any container references, stopped or running. So the image prune cannot touch them while the three stopped containers exist. The image line's 170.3 MB is also larger than the one unused image's 78.6 MB, and `-v` does not break the headline down further, so I treat RECLAIMABLE as Docker's estimate of the current state rather than a receipt.

`du` cannot help with any of this. Pointed at `/var/lib/docker/overlay2`, it totals a directory of 64-character hex names it has no way to attribute. `docker system df` is the lens that does.

## Where the garbage comes from on other boxes

My laptop pulls images and runs them. A machine that builds images tells a different story, because Docker has no garbage collector and four things pile up as side effects of normal use. Every rebuild moves the tag to the new image and orphans the old one as a dangling image, so a server that builds on each deploy keeps every version it ever shipped. BuildKit keeps build cache layers indefinitely, and on a build server that is often the biggest line in the table instead of my `0B`. Stopped containers keep their writable layer and pin their images and volumes. Removing a container does not remove its named volumes.

## The order that frees everything

Because references pin, order matters. Prune images first and everything held by a stopped container survives; prune volumes first and the attached ones are skipped. Containers first, then images, then volumes, then build cache. After `docker system df`, that is `docker container prune -f`, then `docker image prune -af --filter "until=720h"`, then `docker volume prune -f`, then `docker builder prune -af`.

I did not run any of those prunes for this post. The measurement answered the question.

Two flags deserve a slow read. `-a` on the image prune widens "unused" from dangling-only to every image no container references, and `--filter "until=720h"` is its seatbelt, so nothing created in the last 30 days goes. `docker volume prune` is the one line that can destroy data rather than cache: a database whose container you removed last month lives in exactly the kind of volume it deletes. Read `docker volume ls` before running it on anything that ever held state.

The discipline is three steps, not one: measure with `docker system df`, prune in reference order, measure again. On my laptop the first step was also the last. On a build server it is the difference between reclaiming gigabytes safely and deleting the one volume you needed.

---

Full script with the confirmation prompt, the before/after disk report, and the cron lines for scheduling it: https://bashsnippets.xyz/snippets/docker-prune-cleanup

When Docker turns out not to be the culprit, as it was not on my laptop, [find large files](https://bashsnippets.xyz/snippets/find-large-files-linux) locates what is, and [disk space warning](https://bashsnippets.xyz/snippets/disk-space-warning) exits non-zero the day a partition crosses your threshold instead of the day it fills. The rest of the library is at https://bashsnippets.xyz

Originally published at https://bashsnippets.xyz/snippets/docker-prune-cleanup

<!-- Medium tags to set in the UI: Docker, DevOps, Linux, Bash, Containers -->
