<!-- Posting cadence rule: max 1 CoderLegion post per week. Check the last CoderLegion publish date before posting this. -->
<!-- Rebuilt 2026-09-20 on a real run (this box: Kali, bash 5.3.9). Prior version opened on a "logged a filling disk for hours while I found out from the outage" incident that never happened. -->

# Every disk-alert script I had piped into a command this machine does not have

The standard bash alerting pattern ends the same way everywhere you read it: pipe the finding into `mail`. So I checked what my own box would actually do with that line.

```
$ type -a mail mailx sendmail
mail not found
mailx not found
sendmail not found
```

Nothing. No MTA, no `mailutils`, no fallback. Any alert script written the usual way would have run its check correctly, found the problem correctly, piped the message into a command that does not exist, and told me nothing.

This fails quieter than it sounds. Under `set -euo pipefail` you at least get a non-zero exit somewhere a cron wrapper might notice. Without it, the pipeline's exit status is the *last* command's, cron mails you nothing because cron's mail also needs an MTA, and the script looks like it ran fine.

Check for the binary before you rely on it, not after an incident. And on a box that *does* have `mail`, exit 0 still only means the message reached a local MTA — on a host with no outbound relay it lands in a spool file under `/var/mail` that nobody reads. Confirm real delivery once by tailing `/var/log/mail.log`. Cron's minimal `PATH` is a second reason to test from inside cron rather than your login shell.

The msmtp relay config and the rate-limiting guard are in the [bash email alert walkthrough](https://bashsnippets.xyz/snippets/bash-send-email-alert).
