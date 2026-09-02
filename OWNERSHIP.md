# BashSnippets.xyz — Ownership & Account Registry

Every external account and service that controls the site. Verified 2026-09-01 unless a row says
otherwise. Update this file whenever an owner, service or credential changes.

**Access rule:** every account below is reachable from the Chrome profile signed in as
`anguisheh1@gmail.com` (the one claude-in-chrome lists as *Browser 4*). If a console comes back
signed out or as a different account, switch Chrome profile — do not create a new account.
`travisofgilligans@gmail.com` is Travis's personal Google account and has **no** access to any
BashSnippets property.

---

## Domain

| Field | Value |
|---|---|
| Domain | bashsnippets.xyz |
| Registrar | Namecheap (`https://ap.www.namecheap.com`) |
| Registered | 2026-04-30 |
| **Expires** | **2027-04-30** (whois, 2026-09-01) |
| Auto-renew | **On** (Travis, 2026-09-01) |
| DNS | Namecheap BasicDNS (`dns1/dns2.registrar-servers.com`) → Vercel |
| Note | The `.xyz` TLD is staying. A 2026-08-28 proposal to 301 to a .com was struck on 2026-09-01 — the deficit would migrate with the site. |

---

## Google

| Service | Account | Property / ID |
|---|---|---|
| Google account | anguisheh1@gmail.com | — |
| GA4 | anguisheh1@gmail.com | property **BashSnippets** `535459693`, account `393326874`, stream `bash-snippets` `14771755386`, measurement ID **G-6B01TGE8XS** |
| GA4 internal-traffic filter | — | rule `Travis Home` (`2600:8807:8783:b900::/64` + `98.183.50.212/32`), filter **Active** since 2026-09-01 — data before that date includes Travis + Vercel previews |
| Search Console | anguisheh1@gmail.com | `sc-domain:bashsnippets.xyz` — on Browser 4 it is **`authuser=0`**; `authuser=1` is the personal account and 403s |
| AdSense | — | **CLOSED 2026-09-01.** `ca-pub-5399156622542127` was never approved. Not coming back; the site runs no ads. |
| YouTube | anguisheh1@gmail.com | channel **@BashSnippets** `UCwNNxhTW37_ja2eRryCXmDA` — 9 Shorts (May 2026), dormant; see `docs/PLAN.md → Parked` |

---

## Microsoft / Bing

| Field | Value |
|---|---|
| Bing Webmaster Tools | Microsoft account **anguisheh1@gmail.com** (verified administrator, User management page) |
| Property | `https://bashsnippets.xyz/` — the only bashsnippets property; sibling property `beachhousemoving.xyz` |
| IndexNow key | `a7fae2a4e86d4822ab3f636599173c8f` — file `public/a7fae2a4e86d4822ab3f636599173c8f.txt`, value in `.env.local` as `INDEXNOW_KEY`. One key covers Bing, Yandex, Seznam, Naver. (A stale second key file was deleted 2026-09-01.) |
| Yandex verification | `public/yandex_da152cf439d92bd4.html` |
| Note | Bing WMT deep links with `?siteUrl=https://bashsnippets.xyz/` work (searchperf, aiperformance, siteexplorer, sitemaps, indexnow, usermgmt, keywordresearch). |

---

## Hosting & code

| Field | Value |
|---|---|
| Vercel user | anguishe |
| Vercel project | `bashsnippets-next`, auto-deploys on push to `main` (~40–50 s) |
| Vercel env vars | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_BUTTONDOWN_USERNAME` (all three environments). Nothing else — the AdSense vars were deleted 2026-09-01. `DEVTO_API_KEY` must **not** live here. |
| GitHub | `anguishe` — `anguishe/bashsnippets-next` (site, private or public per repo settings) and **`anguishe/bashsnippets`** (public MIT script library, 36 scripts, ShellCheck-clean, homepage set to bashsnippets.xyz) |
| Legacy | `anguishe/anguishe.github.io` — the pre-Next static site. GitHub Pages is off (404), CNAME removed. Local clone at `~/Projects/bash-snippets` is dead history. |

---

## Product & email

| Field | Value |
|---|---|
| Gumroad | product **The Production Bash Toolkit**, `https://anguish0.gumroad.com/l/toolkit`, **$9** (locked by Travis 2026-09-01). Login: Travis to confirm (the claude-in-chrome extension has no site permission for app.gumroad.com). |
| Gumroad history | exactly one order ever — $0.00, Travis, 2026-06-08, a self-purchase to test checkout |
| Buttondown | username **`anguishe`** (bare slug; the value of `NEXT_PUBLIC_BUTTONDOWN_USERNAME`). Account approved and live 2026-09-01. Login email: Travis to confirm. |
| Contact email | `anguisheh1@gmail.com` — published in the `/about` Person schema and visible on `/about`, `/contact`, `/terms`, `/privacy`. Replacing it with a domain alias needs an address only Travis can create. |

---

## Syndication profiles (the locked `sameAs` set lives in `src/lib/author.ts`)

| Platform | Handle / URL | Notes |
|---|---|---|
| dev.to | `dev.to/bashsnippets` | 37 articles; all canonicals repaired 2026-08-31. API key = `DEVTO_API_KEY` (local only). |
| Medium | `medium.com/@anguisheh1` | 14+ posts |
| CoderLegion | profile under the BashSnippets name | 39 posts; JS-rendered, not machine-countable |
| GitHub | `github.com/anguishe` | in `sameAs` |
| YouTube | `youtube.com/@BashSnippets` | in `sameAs` |
| Reddit | 8 self-posted links to `/` | no account details recorded |

Cross-posting is **shelved** (see `docs/PLAN.md`). Do not add profiles to `sameAs` without updating `author.ts`.

---

## Affiliate programs (links removed from the site 2026-09-01 — accounts deliberately left open)

| Program | Account | State |
|---|---|---|
| DigitalOcean referral | `m.do.co/c/7a196437764c` | open, zero earnings ever (inbox audit 2026-09-01) |
| Namecheap via Impact | `namecheap.pxf.io/c/7260430/1632743/5618` | open, zero earnings ever |

---

## Recovery & emergency access

| Resource | Value |
|---|---|
| Primary email | anguisheh1@gmail.com |
| Recovery email | **TODO — Travis** (Google Account → Security; not readable by automation) |
| 2FA backup codes | **TODO — Travis**: confirm they exist and are stored offline |
| Registrar account | Namecheap login = Travis (extension has no site permission for namecheap.com) |
