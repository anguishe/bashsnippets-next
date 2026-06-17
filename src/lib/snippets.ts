import {
  loadSnippetFrontmatter,
  type FaqItem,
  type HowToStep,
} from '@/lib/mdx-frontmatter';

const DEFAULT_PUBLISHED_TIME = '2026-05-01';
const DEFAULT_MODIFIED_TIME = '2026-05-22';
const DEFAULT_AUTHOR = 'Anguishe';

export type { FaqItem, HowToStep };

export interface SnippetMeta {
  slug: string;
  title: string;
  metaTitle?: string;
  description: string;
  quickAnswer?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  datePublished: string;
  dateModified: string;
  publishedTime?: string;
  modifiedTime?: string;
  youtubeShortId?: string;
  faq: FaqItem[];
  howToSteps: HowToStep[];
  author: string;
}

export interface SnippetRegistryEntry {
  slug: string;
  title: string;
  metaTitle?: string;
  description: string;
  quickAnswer?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  datePublished: string;
  dateModified: string;
  publishedTime?: string;
  modifiedTime?: string;
  youtubeShortId?: string;
}

export const snippets: SnippetRegistryEntry[] = [
  {
    slug: 'disk-space-warning',
    title: 'Disk Space Warning Script',
    description:
      'Copy a disk space warning bash script using df, thresholds, cron, and email alerts. Monitor Linux servers and prevent full drives.',
    quickAnswer:
      'The df command reports disk space usage for every mounted filesystem as a percentage. This script reads the percentage for a configurable partition (default: /), compares it against a threshold you set, and prints a warning to stdout — plus exits with code 1 — when that threshold is crossed. A full disk stops your web server from writing access logs, prevents your database from flushing transactions, and can corrupt in-progress writes. Without monitoring, the first sign of a full disk is often a crashed service, not an alert. The default threshold of 80% on a 25 GB VPS means you have roughly 5 GB remaining before trouble starts. df ships in coreutils on every Linux distribution and on macOS — nothing to install. Run manually or schedule with cron every hour: 0 * * * * /home/user/diskcheck.sh.',
    tags: ['monitor', 'cron-ready', 'df'],
    difficulty: 'beginner',
    datePublished: '2026-05-01',
    dateModified: '2026-06-03',
    youtubeShortId: 'lj1CKKCbXpI',
  },
  {
    slug: 'automated-file-backup',
    title: 'Automated File Backup',
    description:
      'Accidental deletion or disk failure permanently destroys data with no undo on Linux. Timestamps each cp -r run with a date string so backups never overwrite each other.',
    quickAnswer:
      'The cp command copies files and directories from one location to another. This script wraps cp -r with a date-stamped destination path, creating a new backup folder — like backup_2026-06-03_14-30 — each time it runs, so no backup overwrites a previous one. Without scheduled backups, a single accidental rm -rf or disk failure can permanently destroy days or weeks of work. There is no recycle bin on Linux servers. The script lets you set SOURCE (the folder to back up) and DEST (where backups are stored) at the top, then call it manually or schedule it with cron. A typical hourly backup of a 1 GB project folder completes in under five seconds. cp is part of coreutils on every Linux box and macOS, so there is nothing to install. Schedule with cron: 0 * * * * /home/user/backup.sh.',
    tags: ['backup', 'cron-ready', 'rsync'],
    difficulty: 'beginner',
    datePublished: '2026-05-01',
    dateModified: '2026-06-03',
  },
  {
    slug: 'delete-old-log-files',
    title: 'Delete Old Log Files',
    description:
      'Unmanaged log files silently fill /var/log until disk writes fail and services crash. find -mtime deletes .log files older than N days — preview with -print before removing from production.',
    quickAnswer:
      'The find command with -mtime locates files by age. Running find /var/log -name "*.log" -mtime +30 -delete removes every .log file in /var/log that has not been modified in more than 30 days. Without periodic cleanup, log files accumulate silently until a disk fills and your web server can no longer write access logs, your database stops accepting writes, or your application crashes mid-transaction. On a busy server generating 50 MB of logs per day, a 30-day window means 1.5 GB consumed before any file gets touched. Before running the delete, swap -delete for -print to preview exactly what will be removed — an essential safety step when running on production directories. find ships with findutils on every Linux distribution — no extra packages required. Schedule with cron: 0 3 * * 0 find /var/log -name "*.log" -mtime +30 -delete to run weekly at 3am.',
    tags: ['cleanup', 'find', 'cron-ready'],
    difficulty: 'intermediate',
    datePublished: '2026-04-20',
    dateModified: '2026-06-03',
  },
  {
    slug: 'quick-system-info-report',
    title: 'Quick System Info Report',
    description:
      'Guessing server state during an outage costs response time. One bash script snapshots hostname, uptime, CPU load, RAM, disk usage, and IP address in one run — no extra packages.',
    quickAnswer:
      "This script prints a one-screen health summary of a Linux box: hostname, kernel, uptime, logged-in users, CPU load average, memory used vs free, root-filesystem usage, and the top three processes by memory. Run it the moment a server feels slow or right after you SSH into an unfamiliar machine — it answers 'what is this box and is it healthy?' in under a second without installing anything. It uses only coreutils (uname, uptime, free, df, ps), so it works on a fresh minimal install where tools like htop are absent. Pipe the output to a file with a timestamp to build a cheap baseline you can diff against later when troubleshooting. Schedule it via cron every morning to catch creeping disk or memory pressure before users notice slowdowns. Every tool it calls is part of a base server install, so it runs unchanged on Ubuntu, Debian, Fedora, and CentOS — even a stripped minimal image.",
    tags: ['monitor', 'reporting', 'system'],
    difficulty: 'beginner',
    datePublished: '2026-04-25',
    dateModified: '2026-05-22',
  },
  {
    slug: 'search-files-for-text-grep',
    title: 'Search Files for Text with grep',
    description:
      'Opening files manually to find a pattern across a codebase wastes time. grep -rn searches every file recursively and returns every match with filename and line number.',
    quickAnswer:
      'The grep command searches files for a pattern and prints every matching line with its filename. This script wraps grep -rn — recursive search with line numbers — so you can locate any string across an entire directory tree in a single command. Without grep, tracking down a hardcoded credential, a renamed function, or a specific log message across hundreds of files means opening each file manually. Running grep -rn "TODO" /var/www/html --include="*.php" scans every PHP file under /var/www/html and returns the filename, line number, and the matched line for every result. The -i flag makes the search case-insensitive; --color=auto highlights each match in the terminal output. grep is mandated by POSIX, so it is already on every Linux distribution and macOS — no packages needed. Run directly in your terminal.',
    tags: ['grep', 'search', 'text'],
    difficulty: 'beginner',
    datePublished: '2026-05-01',
    dateModified: '2026-06-03',
  },
  {
    slug: 'check-if-website-is-up',
    title: 'Check If Website Is Up',
    description:
      'Discovering a site is down from a user complaint means hours of lost traffic already gone. curl -s alerts on any non-200 HTTP status code — cron-schedulable for five-minute checks.',
    quickAnswer:
      'The curl command with -o /dev/null -s -w "%{http_code}" fetches a URL silently and returns only the HTTP status code. This script stores that code in STATUS and compares it to 200 — the only code that means the server responded successfully. A site can be technically reachable but returning 500 (server error) or 404 (not found), both of which mean users cannot access your content. Without monitoring, you find out your site is down when a user tells you — often hours or days after the outage started. The --max-time 10 flag prevents the script from hanging indefinitely when a server is completely unreachable. curl comes preinstalled on macOS and nearly every Linux distribution; on a minimal image, apt install curl covers it. Schedule with cron every 5 minutes: */5 * * * * /home/user/uptimecheck.sh.',
    tags: ['monitor', 'curl', 'uptime'],
    difficulty: 'beginner',
    datePublished: '2026-05-05',
    dateModified: '2026-06-03',
  },
  {
    slug: 'bash-error-handling',
    title: 'Bash Error Handling with set -euo pipefail',
    metaTitle: 'Bash Error Handling: set -euo pipefail',
    description:
      'Bash silently continues after failed commands by default — a broken cd followed by rm -rf destroys the wrong directory. set -euo pipefail exits on first failure before damage spreads.',
    quickAnswer:
      'By default bash ignores failed commands and keeps running, which lets a single typo cascade into data loss. Adding set -euo pipefail on the second line of any script changes three behaviours: -e exits immediately when any command returns a non-zero exit code, -u treats unset variables as errors instead of silently substituting an empty string, and -o pipefail makes the whole pipeline fail if any stage fails rather than only checking the last command. The classic disaster this prevents: a script that runs cd /nonexistent (fails, ignored), then rm -rf * (now runs in the wrong directory). With set -e the script stops at the failed cd and rm never executes. Adding trap \'echo "Error on line $LINENO" >&2\' ERR gives you the exact line number on failure. These flags are bash built-ins available since bash 4.0 — standard on Ubuntu, Debian, and Fedora; on macOS use a Homebrew bash rather than the bundled 3.2.',
    tags: ['error-handling', 'best-practices', 'set'],
    difficulty: 'intermediate',
    datePublished: '2026-05-10',
    dateModified: '2026-06-03',
  },
  {
    slug: 'bash-if-else-examples',
    title: 'Bash If/Else Examples',
    description:
      'Comparison operator mistakes in bash scripts cause silent logic failures on unexpected input. Covers if/else, elif, integer and string test operators, file condition checks, and quoting safety.',
    quickAnswer:
      'A bash if statement tests whether a command exits with code 0 (success) or non-zero (failure). The test command — written as [ condition ] — evaluates comparisons and file checks. The full structure is: if [ condition ]; then ... elif [ condition ]; then ... else ... fi. Spaces inside the brackets are mandatory. For integers use -eq (equal), -gt (greater than), -lt (less than). For strings use = and !=. For files use -f (regular file exists), -d (directory exists), -e (either exists). A common mistake is using = for numbers — [ 5 = 10 ] does string comparison and gives unpredictable results with numbers. Always quote variables: [ "$VAR" = "value" ] handles empty strings safely where [ $VAR = "value" ] would cause a syntax error. The test command and if syntax are core bash, so this runs unmodified on every Linux distribution and on macOS.',
    tags: ['conditionals', 'basics', 'if'],
    difficulty: 'beginner',
    datePublished: '2026-05-12',
    dateModified: '2026-06-03',
  },
  {
    slug: 'create-dated-folder',
    title: 'Create a Dated Folder',
    description:
      'Backup directories without timestamps overwrite previous runs and sort unpredictably. date +%Y-%m-%d auto-names folders so ls sorts them chronologically — no packages needed.',
    quickAnswer:
      'The date +%Y-%m-%d command outputs the current date in ISO 8601 format — for example 2026-06-03. Using this as a folder name means directories sort in chronological order automatically when you run ls, since lexicographic order matches date order for YYYY-MM-DD. The two-command workflow is: DATE=$(date +%Y-%m-%d) to capture the date string, then mkdir "$DATE" to create the folder. In a backup context, this creates a new unique folder every day without overwriting previous backups. Adding the hour and minute with date +%Y-%m-%d_%H-%M creates folders like 2026-06-03_14-30 for multiple runs per day. Wrap both commands in a cron job to auto-create a fresh folder at the start of each backup run. date and mkdir are coreutils built-ins present on every Linux distribution and macOS out of the box — no packages required.',
    tags: ['files', 'date', 'mkdir'],
    difficulty: 'beginner',
    datePublished: '2026-05-14',
    dateModified: '2026-06-03',
  },
  {
    slug: 'kill-a-process',
    title: 'Kill a Process with pkill and pgrep',
    description:
      'The ps/grep/copy-PID/kill workflow takes four steps every time you need to stop a process. pkill by name collapses that to one command — pgrep -l previews matches before terminating.',
    quickAnswer:
      'The pkill command terminates processes by name, skipping the four-step workflow of ps aux, grep, copying a PID, and running kill. Before killing anything, run pgrep -l processname to preview exactly which processes match — the -l flag shows both the PID and the process name so you can verify you are targeting the right ones. pkill processname then sends SIGTERM (graceful shutdown) to all matching processes. When a process refuses to stop, pkill -9 processname sends SIGKILL — the kernel terminates it immediately with no cleanup. Use -9 only after a normal pkill has failed, since force-killing databases or web servers can corrupt open files. The -f flag matches the full command string rather than just the binary name, which is how you kill a specific Python script without affecting all Python processes. pgrep and pkill ship in the procps package on Linux and come built into macOS, so both are available without installing anything.',
    tags: ['process', 'pkill', 'pgrep'],
    difficulty: 'intermediate',
    datePublished: '2026-05-16',
    dateModified: '2026-06-03',
  },
  {
    slug: 'file-permissions-security',
    title: 'File Permissions Security Audit',
    description:
      'World-writable files on a web server let any compromised script overwrite your application. find -perm 777 audits them and correct chmod 644/755 patterns restore safe permissions.',
    quickAnswer:
      'Linux file permissions control who can read, write, or execute a file. Each file has three permission groups — owner, group, and other — each with read (4), write (2), and execute (1) bits. The permission 644 means the owner can read and write (6), while group and others can only read (4). The permission 755 adds execute for all, which directories need so users can enter them. World-writable files with permission 777 let any user or process overwrite the file — on a web server this means a compromised PHP script can replace your application files. The audit script uses find with -perm 777 to locate these dangerous files and saves a report. The safe recursive pattern is two find commands: one sets files to 644, another sets directories to 755 — never chmod -R 644 because that removes execute bits from directories and breaks navigation. chmod and find are base utilities on every Linux distribution, so the audit and the fix both run without installing anything.',
    tags: ['chmod', 'security', 'find'],
    difficulty: 'intermediate',
    datePublished: '2026-05-18',
    dateModified: '2026-06-03',
  },
  {
    slug: 'monitor-cpu-ram-usage',
    title: 'Monitor CPU and RAM Usage',
    description:
      'A runaway process consuming 100% CPU goes undetected until the server becomes unresponsive. top -bn1 and free -m measure CPU and RAM in scripts so cron can alert before impact.',
    quickAnswer:
      'The top command in batch mode outputs system metrics non-interactively. Running top -bn1 produces a one-shot snapshot: -b enables batch mode (no terminal control codes), -n1 takes a single sample. The CPU idle percentage on the third line of output reveals load. The free command reports memory in bytes; free -m outputs megabytes. Piping both through awk extracts the specific fields needed for comparison. Without resource monitoring, a runaway process can consume 100% CPU or fill RAM with no warning until the server becomes unresponsive or the OOM killer starts terminating processes. Knowing when CPU stays above 90% for sustained periods distinguishes a traffic spike from a runaway process or a background job that never finished. top and free both come from the procps package that every Linux distribution installs by default. Schedule with cron every 5 minutes to catch problems before users notice: */5 * * * * /home/user/cpucheck.sh.',
    tags: ['monitor', 'system', 'awk'],
    difficulty: 'intermediate',
    datePublished: '2026-05-19',
    dateModified: '2026-06-03',
  },
  {
    slug: 'bash-send-email-alert',
    title: 'Send Email Alerts from Bash',
    description:
      'Monitoring scripts without email alerts mean failures go unnoticed until users report them. Wraps mailx or curl SMTP into a reusable alert function with per-run deduplication to prevent inbox flooding.',
    quickAnswer:
      'The mail command sends email from the command line when a mail transfer agent (MTA) is configured on the system. The pattern is: echo "message body" | mail -s "Subject line" recipient@example.com. This works with any monitoring script — disk checks, uptime monitors, backup confirmations — by piping the alert text into mail and specifying the subject and recipient. On Ubuntu and Debian, install the tools with sudo apt install mailutils. For servers that block outbound SMTP (most cloud VPS providers do), configure msmtp to relay through an external SMTP service like Gmail or SendGrid using an app password. The rate-limiting pattern — a lockfile that prevents duplicate alerts within a cooldown window — stops your inbox from filling up when a problem persists across multiple cron runs. The mail command is the one dependency here: install mailutils on Ubuntu and Debian or mailx on Fedora before the script will send.',
    tags: ['email', 'alert', 'mailx'],
    difficulty: 'intermediate',
    datePublished: '2026-05-20',
    dateModified: '2026-06-03',
  },
  {
    slug: 'mysql-database-backup',
    title: 'MySQL Database Backup Script',
    description:
      'A mistaken DROP TABLE or storage failure permanently destroys database data with no built-in undo. mysqldump with gzip compression and 7-day cron rotation keeps nightly backups under 100 MB.',
    quickAnswer:
      'The mysqldump command exports a MySQL database as SQL statements. Piping the output through gzip compresses the dump by 80 to 90 percent before writing it to disk, so a 500 MB database becomes a 50 to 100 MB file. This script combines mysqldump with a timestamp in the filename so each backup is unique and old ones never get overwritten. The find command with -mtime +7 -delete then removes backup files older than seven days, keeping disk usage bounded. Without automated backups, a single mistaken DROP TABLE or a storage failure permanently destroys your data — there is no undo. Running mysqldump every night at 2am via cron and keeping seven daily backups means you can restore to any point within the past week. Never hardcode the database password in the script file — use ~/.my.cnf so the password is not visible in process listings. mysqldump ships with the MySQL 8.0 and MariaDB 10.6 client packages, so it is already present anywhere those databases are installed.',
    tags: ['mysql', 'backup', 'cron-ready'],
    difficulty: 'intermediate',
    datePublished: '2026-05-21',
    dateModified: '2026-06-03',
  },
  {
    slug: 'ssh-key-setup-script',
    title: 'SSH Key Setup Script',
    description:
      'Password-based SSH is vulnerable to brute-force attacks and credential leaks on any internet-exposed server. Automates ssh-keygen -t ed25519 and ssh-copy-id to enable key-based auth in one run.',
    quickAnswer:
      'SSH key authentication replaces password login with a cryptographic key pair. The private key stays on your machine; the public key goes to the server. The ssh-keygen command generates both: ssh-keygen -t ed25519 -C "your@email.com" creates an Ed25519 key pair, the recommended type in 2026 because it is faster and more secure than RSA 2048. The -N "" flag skips the passphrase prompt for non-interactive generation. Once generated, ssh-copy-id user@server-ip appends your public key to ~/.ssh/authorized_keys on the remote host, enabling passwordless login. The .ssh directory must be chmod 700, the private key must be chmod 600, and the public key must be chmod 644 — SSH refuses to use keys with looser permissions as a security measure. Without key-based auth, every login requires a password that can be brute-forced or leaked. ssh-keygen and ssh-copy-id ship with the OpenSSH client, which is preinstalled on macOS and every mainstream Linux distribution.',
    tags: ['ssh', 'security', 'keys'],
    difficulty: 'intermediate',
    datePublished: '2026-05-22',
    dateModified: '2026-06-03',
  },
  {
    slug: 'find-duplicate-files',
    title: 'Find Duplicate Files in Linux',
    description:
      'Duplicate files accumulate silently in archives and download folders, wasting gigabytes of disk space. md5sum hashes every file and awk prints only the redundant copies — nothing to install.',
    quickAnswer:
      'The md5sum command generates a 32-character hash that uniquely identifies a file by its content. Two files with the same hash are byte-for-byte identical regardless of their names or locations. This script pipes find output through md5sum to hash every file in a directory, sorts the results so identical hashes group together, then uses awk to print only the lines whose hash has been seen before — those are the duplicates. The original copy is never printed, only the redundant ones. Without this workflow, finding duplicates means comparing files manually or relying on GUI tools that may not scan server directories. On a Downloads folder or photo archive that has grown for years, duplicate detection commonly finds gigabytes of recoverable space. md5sum, find, sort, and awk come standard on every Linux distribution; on macOS the hashing command is md5 instead of md5sum.',
    tags: ['files', 'disk', 'find', 'awk'],
    difficulty: 'intermediate',
    datePublished: '2026-06-03',
    dateModified: '2026-06-03',
  },
  {
    slug: 'restart-service-if-stopped',
    title: 'Restart a Service If It Stopped',
    description:
      'A crashed nginx or postgresql stays down for hours without a watchdog to detect and recover it. systemctl is-active in a cron loop detects stopped services and restarts them within 60 seconds.',
    quickAnswer:
      'The systemctl is-active command returns exit code 0 when a service is running and non-zero when it is stopped, failed, or not found. This makes it usable directly in a bash if statement without any output parsing. When the service is down, the script calls systemctl start and checks whether that command succeeded — two levels of verification rather than just attempting a restart and assuming it worked. The log file built with tee -a gives you an audit trail of every outage and recovery. The optional email alert sends different messages for recovery versus critical failure so you know whether the service came back up on its own. Without this watchdog, a crashed nginx or postgresql can stay down for hours until someone notices. Running the script every minute via cron — * * * * * /home/user/service-watchdog.sh — means maximum downtime before auto-recovery is under 60 seconds. Any distribution running systemd — Ubuntu, Debian, Fedora, CentOS, and the rest — ships systemctl, so the watchdog works wherever your services run.',
    tags: ['systemd', 'monitor', 'cron-ready'],
    difficulty: 'intermediate',
    datePublished: '2026-05-22',
    dateModified: '2026-06-03',
  },
  {
    slug: 'find-large-files-linux',
    title: 'Find Large Files in Linux',
    description:
      'Your disk hit 100% and the server stopped. Find the biggest files and directories fast with du and find — excludes virtual filesystems and ranks by size descending.',
    quickAnswer:
      'The du command measures actual disk consumption per directory. When a server hits 100% and services start failing — no new logs, no database writes, no deployments — you need the biggest offenders in seconds, not minutes. This script runs du -ah on a target directory, pipes through sort -rh to rank by size descending, and shows the top 20 largest entries. A second command uses find to locate individual files over 500 MB anywhere on the filesystem while excluding virtual filesystems like /proc and /sys that report false sizes. The combination covers both scenarios: directory bloat (a /var/log that grew to 40 GB) and single massive files (a forgotten database dump or core file). On a typical 25 GB VPS, this identifies 80% of reclaimable space in under 10 seconds. du, find, and sort are base tools present on every Linux distribution, so this runs on a stock server with nothing added.',
    tags: ['disk', 'du', 'find', 'cleanup', 'troubleshooting'],
    difficulty: 'beginner',
    datePublished: '2026-06-06',
    dateModified: '2026-06-06',
  },
  {
    slug: 'kill-process-on-port',
    title: 'Kill Process on Port',
    description:
      'EADDRINUSE means something is squatting on your port. Find the process with lsof or ss, then kill it safely — script handles discovery, confirmation, and SIGTERM-to-SIGKILL escalation.',
    quickAnswer:
      'The EADDRINUSE error means another process already bound the port your application needs. Your dev server, API, or database proxy refuses to start until that port is freed. This script takes a port number as an argument, uses lsof -ti :PORT to find the PID holding it, shows you what the process is before killing it, and sends SIGTERM for a graceful shutdown. If the process ignores SIGTERM after a configurable timeout, it escalates to SIGKILL. The discovery step uses ss -ltnp as a fallback when lsof is unavailable — ss ships with every modern Linux distribution as part of iproute2. Never jump straight to kill -9: SIGTERM lets databases flush buffers, web servers finish active requests, and applications clean up temp files. SIGKILL skips all of that and can leave corrupted state. ss ships with iproute2 on every modern Linux distribution and lsof is a quick install away; on macOS, lsof is built in.',
    tags: ['ports', 'lsof', 'ss', 'kill', 'networking', 'troubleshooting'],
    difficulty: 'beginner',
    datePublished: '2026-06-06',
    dateModified: '2026-06-06',
  },
  {
    slug: 'rsync-remote-backup',
    title: 'Rsync Remote Backup',
    description:
      'A local-only backup dies with the machine. Push an incremental, resumable copy to a remote server with rsync over SSH — script with exclude patterns, dry-run, and cron scheduling.',
    quickAnswer:
      'A backup stored on the same machine as the data it protects is not a backup — it is a copy that dies in the same disk failure, ransomware event, or data center outage. rsync over SSH pushes incremental changes to a remote server, transferring only the bytes that differ since the last run. The flags -avz --delete mean: -a preserves permissions, timestamps, symlinks, and ownership; -v shows progress; -z compresses data in transit; --delete removes files on the destination that no longer exist on the source, keeping an exact mirror. The --partial flag resumes interrupted transfers instead of restarting from zero — critical on large backups over unstable connections. Combined with a cron schedule, this gives you nightly offsite backups with no manual intervention. A first run of 10 GB over a 100 Mbps link takes roughly 15 minutes; subsequent runs transfer only changed blocks, often completing in seconds. rsync ships on macOS and installs from the base repos of every major distribution with a single apt or dnf command.',
    tags: ['rsync', 'backup', 'ssh', 'cron', 'offsite', 'devops'],
    difficulty: 'intermediate',
    datePublished: '2026-06-06',
    dateModified: '2026-06-06',
  },
  {
    slug: 'check-ssl-certificate-expiry',
    title: 'Check SSL Certificate Expiry with Bash',
    description:
      'A bash script that connects to any domain over TLS, reads the certificate, and tells you how many days until it expires — before the site goes dark.',
    quickAnswer:
      "Use openssl s_client to fetch the live certificate from a domain, then openssl x509 -noout -enddate to extract the expiry date, then compare it to today with date arithmetic. The check runs in under a second and requires nothing beyond the openssl package, which ships on every major Linux distribution. Wrap the logic in a function that returns days remaining, set a threshold (30 days is standard for Let's Encrypt's 90-day cycle), and you have a cron-ready alert that fires before your domain goes red in browsers. Particularly important for short-lived certificates: a failed Let's Encrypt renewal silently bricks HTTPS with no outward warning until users see the browser error page. Add -servername to the openssl s_client call on SNI hosts or you may read the default certificate instead of the one for your domain.",
    tags: ['ssl', 'openssl', 'security', 'monitoring', 'cron', 'networking'],
    difficulty: 'intermediate',
    datePublished: '2026-06-06',
    dateModified: '2026-06-06',
  },
  {
    slug: 'list-open-ports-linux',
    title: 'List All Open Ports on Linux',
    description:
      'A bash script that maps every port your server is listening on, along with the process name holding it open — the first step in any security audit.',
    quickAnswer:
      'Run ss -tlnp to list every TCP port your server is actively listening on, the process name attached to it, and whether it is bound to all interfaces (0.0.0.0 — network-reachable) or localhost only (127.0.0.1 — safe). The ss command replaced netstat as the default on modern Linux distributions in 2016; it reads directly from kernel socket tables and returns results faster. The output columns are State, Recv-Q, Send-Q, Local Address:Port, and Process. The Local Address column is the one that matters: 0.0.0.0:PORT or :::PORT means external traffic can reach that service. 127.0.0.1:PORT means it is only accessible from the machine itself. Run with sudo for full process detail — without root, ports held by other users show the port without the owning process name.',
    tags: ['ports', 'networking', 'ss', 'netstat', 'security', 'audit', 'lsof'],
    difficulty: 'beginner',
    datePublished: '2026-06-06',
    dateModified: '2026-06-06',
  },
  {
    slug: 'docker-prune-cleanup',
    title: 'Docker Cleanup Bash Script — Reclaim Disk Space from Docker Garbage',
    description:
      'A bash script that removes stopped containers, unused images, dangling volumes, and build cache from Docker — with a disk-usage report before and after.',
    quickAnswer:
      'Docker accumulates garbage silently: stopped containers from testing, images pulled once and never run again, anonymous volumes left behind by containers that exited weeks ago, and build cache layers from every image rebuild. None of it cleans itself up. Run docker system df first to see the damage — on an active development machine or build server, the reclaimable column is often several gigabytes. The safe pruning order is: containers first (docker container prune -f), then images with a time filter (docker image prune -af --filter until=720h keeps anything used in the last 30 days), then volumes (docker volume prune -f removes only volumes with no attached container), then build cache (docker builder prune -af). Running containers are never touched; their images are pinned regardless of the image prune command.',
    tags: ['docker', 'containers', 'disk', 'cleanup', 'devops', 'pruning'],
    difficulty: 'beginner',
    datePublished: '2026-06-06',
    dateModified: '2026-06-06',
  },
  {
    slug: 'bash-for-loop-examples',
    title: 'Bash For Loop Examples',
    description:
      'A for loop over the output of ls word-splits on filenames with spaces and silently skips files. Loop over a glob, a range, an array, or command output the safe way — with the quoting that stops the loop from doing the wrong thing quietly.',
    quickAnswer:
      'A bash for loop repeats a block of code once per item in a list. The safe forms are: loop a glob directly (for f in *.log) to iterate files, which handles spaces and special characters correctly; loop a brace range (for i in {1..10}) or a C-style counter (for ((i=0; i<10; i++))) for numbers; and loop an array with the quoted expansion (for x in "${items[@]}") so each element stays intact. The form to avoid is for f in $(ls) — command substitution word-splits on whitespace, so a file named report final.txt becomes two loop iterations, report and final.txt, and the real file is never touched. Always quote the loop variable when you use it ("$f"), because the split happens at use, not only at the loop header. Glob over parse, quote on use, and the loop stops surprising you.',
    tags: ['bash', 'loops', 'for', 'scripting', 'beginner'],
    difficulty: 'beginner',
    datePublished: '2026-06-17',
    dateModified: '2026-06-17',
  },
  {
    slug: 'bash-read-file-line-by-line',
    title: 'Read a File Line by Line in Bash',
    description:
      'A while-read loop silently dropped the last server in a monitoring list because the file had no trailing newline — and that was the server that went down. Read a file line by line the correct way: while IFS= read -r line, with the guard that catches the missing final line.',
    quickAnswer:
      'The correct way to read a file line by line in bash is while IFS= read -r line; do ... done < file.txt. Three parts matter. IFS= (empty) stops bash from trimming leading and trailing whitespace from each line. The -r flag stops read from treating backslashes as escape characters, so a path like C:\\\\temp survives intact. And redirecting the file in with < at the done keyword feeds the loop without spawning a subshell, so variables you set inside the loop are still set after it. The trap that bites everyone: if the file\'s last line has no trailing newline, read returns false on that final line and the loop skips it. Guard it with while IFS= read -r line || [[ -n "$line" ]]; do, which processes the leftover line when read hits end-of-file mid-line. Never loop for line in $(cat file) — that word-splits on spaces and reads words, not lines.',
    tags: ['bash', 'read', 'loops', 'files', 'intermediate'],
    difficulty: 'intermediate',
    datePublished: '2026-06-17',
    dateModified: '2026-06-17',
  },
  {
    slug: 'bash-functions-arguments',
    title: 'Bash Functions and Arguments',
    description:
      "A function reused the variable name 'target' without declaring it local, overwrote the caller's variable, and the cleanup step deleted the wrong directory. Write bash functions that take arguments, return values, and don't leak state — with the local keyword that stops a function from clobbering its caller.",
    quickAnswer:
      'A bash function is defined with name() { ...; } and receives arguments as positional parameters: $1, $2, and so on, with $@ for all of them, $# for the count, and $0 still the script name. Two rules prevent the worst bugs. First, declare every variable a function uses with local, because bash variables are global by default — a function that sets target= without local overwrites a target in the caller\'s scope, which is how a cleanup routine ends up deleting the wrong path. Second, return is an exit status, not a value: it only carries 0–255 and wraps around above that, so return 300 hands back 44. To return real data, echo it and capture with command substitution: result=$(my_func arg). Use return only for success or failure. For scripts with flags rather than fixed positions, parse with getopts instead of reading $1 by hand.',
    tags: ['bash', 'functions', 'arguments', 'scripting', 'intermediate'],
    difficulty: 'intermediate',
    datePublished: '2026-06-17',
    dateModified: '2026-06-17',
  },
  {
    slug: 'bash-functions',
    title: 'Bash Functions: Return Values, Local Scope, and Reusable Logic',
    description:
      'A bash function cannot return a string with return — that keyword sets an exit code only. Use echo plus command substitution or namerefs to return data, and local on every variable to stop silent global collisions.',
    quickAnswer:
      "A bash function groups commands under a name so you stop pasting the same block into every script. Define one with name() { commands; } and call it by name with arguments after it: greet alice — inside, $1 is the first argument, $@ is all of them, and $# is the count. Functions don't 'return' values the way other languages do: return only sets an exit status 0–255, so to pass data back you echo it and capture with result=$(myfunc). Declare locals with local var inside the function or you'll silently clobber globals — the bug that bites everyone once. Define functions before you call them; bash reads top to bottom. Works in any bash on Ubuntu, Debian, Fedora, and macOS.",
    tags: ['bash', 'functions', 'scripting', 'local-scope'],
    difficulty: 'intermediate',
    datePublished: '2026-06-10',
    dateModified: '2026-06-10',
  },
  {
    slug: 'bash-arrays',
    title: 'Bash Arrays: Indexed, Associative, Append, and Safe Iteration',
    description:
      'Storing a list as a space-separated string breaks the moment one element contains a space, splitting one item into two. Arrays make the space a non-event — covering indexed and associative arrays, append, length, slicing, and safe iteration.',
    quickAnswer:
      'A bash array stores a list as separate elements instead of a space-joined string, so an element containing a space stays one item. Declare an indexed array with arr=(a b c) and read element i with "${arr[i]}"; always quote and use [@] — "${arr[@]}" expands to each element safely, while [*] joins them into one word. Append with arr+=(new), get the length with ${#arr[@]}, and iterate with for x in "${arr[@]}"; do … done. Associative arrays need declare -A first, then map["key"]=value. The bug this prevents: building FILES="a.txt b c.txt" and looping over $FILES, which splits "b c.txt" into two. Works in bash 4.0+ (Ubuntu 22.04, Debian 12, Fedora 39; macOS needs a Homebrew bash, not the stock 3.2).',
    tags: ['bash', 'arrays', 'associative-arrays', 'scripting'],
    difficulty: 'intermediate',
    datePublished: '2026-06-10',
    dateModified: '2026-06-10',
  },
  {
    slug: 'bash-argument-parsing',
    title: 'Bash Argument Parsing: Positional Args, getopts, and Long Flags',
    description:
      'A script that reads $1 as a value will accept --env as that value and deploy nowhere, silently. Parse arguments properly with positional defaults, getopts for short flags, and a while+case loop for GNU-style long flags.',
    quickAnswer:
      'Parsing arguments lets a script take flags like -v or --output file instead of a positional order nobody remembers. For a few flags, a while [[ $# -gt 0 ]] loop with a case on $1 is the readable choice: match --output) shift; OUT="$1";; then shift again. For standard short flags, getopts "vo:" opt handles bundling, and the trailing colon means -o takes a value in $OPTARG. The mistake that wastes an afternoon: forgetting to shift, so the loop never advances and spins forever. Set defaults before the loop and validate required args after it. getopts is POSIX and works in dash/sh; the long-flag while-case pattern needs bash. Tested on Ubuntu, Debian, Fedora, and macOS.',
    tags: ['bash', 'arguments', 'getopts', 'cli'],
    difficulty: 'intermediate',
    datePublished: '2026-06-10',
    dateModified: '2026-06-10',
  },
  {
    slug: 'bash-string-manipulation',
    title: 'Bash String Manipulation: Substrings, Replace, and Parameter Expansion',
    description:
      'Field-counting with cut -d/ -f3 returns the wrong slice the moment a URL gains an s for https. Parameter expansion matches on pattern boundaries with no subshell — substrings, prefix/suffix stripping, replace, case conversion, and defaults.',
    quickAnswer:
      'Bash does most string work with parameter expansion — no sed or awk needed for the common cases, which keeps scripts fast and dependency-free. Get length with ${#var}; slice with ${var:0:4} (offset, length). Strip a suffix or prefix with ${file%.txt} (shortest trailing match) and ${file##*/} (basename — longest leading path); ${file%/*} gives the directory. Replace with ${var/old/new} for the first match or ${var//old/new} for all. Change case with ${var^^} and ${var,,}. The trap: these are bash features, so a script with #!/bin/sh on Debian (where sh is dash) fails silently — use #!/bin/bash. Works in bash 4+ on Ubuntu, Debian, Fedora, and macOS via Homebrew bash.',
    tags: ['bash', 'strings', 'parameter-expansion', 'scripting'],
    difficulty: 'intermediate',
    datePublished: '2026-06-10',
    dateModified: '2026-06-10',
  },
];

function mergeWithFrontmatter(snippet: SnippetRegistryEntry): SnippetMeta {
  const frontmatter = loadSnippetFrontmatter(snippet.slug);

  const datePublished =
    frontmatter.datePublished ?? snippet.datePublished ?? DEFAULT_PUBLISHED_TIME;
  const dateModified =
    frontmatter.dateModified ?? snippet.dateModified ?? DEFAULT_MODIFIED_TIME;

  return {
    ...snippet,
    title: snippet.title,
    metaTitle: snippet.metaTitle,
    description: snippet.description,
    quickAnswer: snippet.quickAnswer ?? frontmatter.quickAnswer,
    tags: frontmatter.tags ?? snippet.tags,
    datePublished,
    dateModified,
    publishedTime:
      snippet.publishedTime ?? datePublished ?? DEFAULT_PUBLISHED_TIME,
    modifiedTime:
      snippet.modifiedTime ?? dateModified ?? DEFAULT_MODIFIED_TIME,
    faq: frontmatter.faq ?? [],
    howToSteps: frontmatter.howToSteps ?? [],
    author: frontmatter.author ?? DEFAULT_AUTHOR,
  };
}

export function getSnippetBySlug(slug: string): SnippetMeta | undefined {
  const snippet = snippets.find((s) => s.slug === slug);
  if (!snippet) {
    return undefined;
  }

  return mergeWithFrontmatter(snippet);
}

export function getAllSlugs(): string[] {
  return snippets.map((snippet) => snippet.slug);
}

export function getSnippetsByDifficulty(
  level: SnippetMeta['difficulty'],
): SnippetRegistryEntry[] {
  return snippets.filter((snippet) => snippet.difficulty === level);
}

export function getSnippetsByTag(tag: string): SnippetRegistryEntry[] {
  return snippets.filter((snippet) => snippet.tags.includes(tag));
}

export function getRelatedSnippets(
  currentSlug: string,
  count: number,
): SnippetRegistryEntry[] {
  const current = getSnippetBySlug(currentSlug);
  if (!current) {
    return [];
  }

  const targetCount = Math.min(count, snippets.length - 1);
  const others = snippets.filter((snippet) => snippet.slug !== currentSlug);
  const sameDifficulty = others.filter(
    (snippet) => snippet.difficulty === current.difficulty,
  );
  const otherDifficulty = others.filter(
    (snippet) => snippet.difficulty !== current.difficulty,
  );

  const result: SnippetRegistryEntry[] = [];

  for (const snippet of sameDifficulty) {
    if (result.length >= targetCount) {
      break;
    }
    result.push(snippet);
  }

  for (const snippet of otherDifficulty) {
    if (result.length >= targetCount) {
      break;
    }
    result.push(snippet);
  }

  return result;
}
