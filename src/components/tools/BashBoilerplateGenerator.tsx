'use client';

import CopyButton from '@/components/CopyButton';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useClipboard } from './shared/useClipboard';

const SNIPPETS: Record<string, string> = {
  disk: 'USAGE=$(df / | awk \'NR==2{print $5}\' | tr -d \'%\'); THRESHOLD=80; [ "$USAGE" -gt "$THRESHOLD" ] && echo "$CROSS Disk usage at ${USAGE}% — above threshold" || echo "$CHECK Disk OK at ${USAGE}%"',
  logs: 'find /var/log -type f -name "*.log" -mtime +30 -exec rm -f {} \\; && echo "$CHECK Logs older than 30 days deleted"',
  uptime: 'URL="https://example.com"; STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$URL"); [ "$STATUS" -eq 200 ] && echo "$CHECK $URL is up ($STATUS)" || echo "$CROSS $URL is DOWN ($STATUS)"',
  backup: 'DEST="/backup/$(date +%Y-%m-%d)"; mkdir -p "$DEST"; tar -czf "$DEST/backup.tar.gz" /your/source && echo "$CHECK Backup created at $DEST"',
  sysinfo: 'echo "Hostname: $(hostname)"; echo "Uptime: $(uptime -p)"; echo "Disk: $(df -h / | awk \'NR==2{print $3"/"$2" ("$5" used")}\')"',
};

const SNIPPET_LABELS: Record<string, string> = {
  disk: 'Disk Space Warning',
  logs: 'Delete Old Logs',
  uptime: 'Check Website Up',
  backup: 'File Backup',
  sysinfo: 'System Info Report',
};

const SNIPPET_LINKS: Record<string, string> = {
  disk: '/snippets/disk-space-warning',
  logs: '/snippets/delete-old-log-files',
  uptime: '/snippets/check-if-website-is-up',
  backup: '/snippets/automated-file-backup',
  sysinfo: '/snippets/quick-system-info-report',
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightScript(raw: string): string {
  return raw
    .split('\n')
    .map((line) => {
      const esc = escapeHtml(line);
      if (/^#!\/bin\/bash/.test(line)) {
        return `<span style="color:#39d353;font-weight:600;">${esc}</span>`;
      }
      if (/^\s*#/.test(line)) {
        if (/^# --- .+ ---$/.test(line) && line !== '# --- your code here ---') {
          return `<span id="injected-snippet-marker" style="color:#8b949e;font-style:italic;">${esc}</span>`;
        }
        return `<span style="color:#8b949e;font-style:italic;">${esc}</span>`;
      }
      const out = esc
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#e3b341;">$1</span>')
        .replace(/(\$\{[A-Za-z_][A-Za-z0-9_]*\}|\$[A-Za-z_][A-Za-z0-9_]*|\$[#@?*])/g, '<span style="color:#39d353;">$1</span>')
        .replace(/\b(if|then|fi|for|do|done|function|return|exit|echo|set)\b/g, '<span style="color:#58a6ff;">$1</span>')
        .replace(/\u2713/g, '<span style="color:#39d353;">✓</span>')
        .replace(/\u2717/g, '<span style="color:#f85149;">✗</span>');
      return out;
    })
    .join('\n');
}

export default function BashBoilerplateGenerator() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [author, setAuthor] = useState('');
  const [shebang, setShebang] = useState(true);
  const [setE, setSetE] = useState(true);
  const [setU, setSetU] = useState(true);
  const [pipefail, setPipefail] = useState(true);
  const [ifs, setIfs] = useState(true);
  const [setX, setSetX] = useState(false);
  const [logFn, setLogFn] = useState(true);
  const [checks, setChecks] = useState(true);
  const [args, setArgs] = useState(false);
  const [lock, setLock] = useState(false);
  const [root, setRoot] = useState(false);
  const [trap, setTrap] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState<string | null>(null);
  const [outputHtml, setOutputHtml] = useState('');
  const [currentRaw, setCurrentRaw] = useState('');
  const [barFilename, setBarFilename] = useState('myscript.sh');
  const [barLines, setBarLines] = useState('0 lines');
  const [previewPulse, setPreviewPulse] = useState(false);
  const [snippetFeedback, setSnippetFeedback] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { copied, copy } = useClipboard();
  const lastRenderedRef = useRef('');

  const generateScript = useCallback(() => {
    const lines: string[] = [];
    const scriptName = name.trim() || 'script.sh';
    const description = desc.trim();
    const authorName = author.trim();

    if (shebang) lines.push('#!/bin/bash');
    lines.push('# ============================================================');
    lines.push(`# Script:      ${scriptName}`);
    lines.push(`# Description: ${description}`);
    lines.push(`# Author:      ${authorName}`);
    lines.push(`# Generated:   ${todayISO()}`);
    lines.push('# Source:      BashSnippets.xyz');
    lines.push('# ============================================================');
    lines.push('');

    let anySet = false;
    if (setE) { lines.push('set -e'); anySet = true; }
    if (setU) { lines.push('set -u'); anySet = true; }
    if (pipefail) { lines.push('set -o pipefail'); anySet = true; }
    if (setX) { lines.push('set -x'); anySet = true; }
    if (ifs) { lines.push("IFS=$'\\n\\t'"); anySet = true; }
    if (anySet) lines.push('');

    if (checks) {
      lines.push('CHECK="✓"');
      lines.push('CROSS="✗"');
    }
    if (logFn) lines.push("log() { echo \"[$(date '+%Y-%m-%d %H:%M:%S')] $*\"; }");

    if (args) {
      lines.push('');
      lines.push('DRY_RUN=0');
      lines.push('usage() {');
      lines.push('  cat <<EOF');
      lines.push(`Usage: ${scriptName} [-h] [-d]`);
      lines.push('  -h    Show this help message');
      lines.push('  -d    Dry-run mode (no changes made)');
      lines.push('EOF');
      lines.push('}');
      lines.push('while getopts "hd" opt; do');
      lines.push('  case "$opt" in');
      lines.push('    h) usage; exit 0 ;;');
      lines.push('    d) DRY_RUN=1 ;;');
      lines.push('    *) usage; exit 1 ;;');
      lines.push('  esac');
      lines.push('done');
    }

    if (lock) {
      lines.push('');
      const lockBase = scriptName.replace(/\.sh$/, '') || 'script';
      lines.push(`LOCKFILE="/tmp/${lockBase}.lock"`);
      lines.push('if [ -e "$LOCKFILE" ] && kill -0 "$(cat "$LOCKFILE")" 2>/dev/null; then');
      lines.push('  echo "Already running (pid $(cat "$LOCKFILE"))"; exit 1');
      lines.push('fi');
      lines.push('echo $$ > "$LOCKFILE"');
      lines.push("trap 'rm -f \"$LOCKFILE\"' EXIT");
    }

    if (root) {
      lines.push('');
      lines.push('if [ "$EUID" -ne 0 ]; then');
      lines.push('  echo "This script must be run as root."; exit 1');
      lines.push('fi');
    }

    if (trap) {
      lines.push('');
      lines.push('cleanup() {');
      lines.push('  echo "Cleaning up..."');
      lines.push('}');
      lines.push('trap cleanup EXIT INT TERM');
    }

    lines.push('');

    if (activeSnippet && SNIPPETS[activeSnippet]) {
      lines.push(`# --- ${SNIPPET_LABELS[activeSnippet]} ---`);
      lines.push(SNIPPETS[activeSnippet]);
      lines.push('');
    }

    lines.push(`log "\${CHECK} ${scriptName} started"`);
    lines.push('# --- your code here ---');
    lines.push('log "${CHECK} Done."');
    lines.push('exit 0');

    const raw = lines.join('\n');
    const changed = lastRenderedRef.current !== '' && lastRenderedRef.current !== raw;
    setCurrentRaw(raw);
    setBarFilename(scriptName);
    setBarLines(`${raw.split('\n').length} line${raw.split('\n').length === 1 ? '' : 's'}`);
    setOutputHtml(highlightScript(raw));
    if (changed) {
      setPreviewPulse(true);
      setTimeout(() => setPreviewPulse(false), 600);
    }
    lastRenderedRef.current = raw;
  }, [activeSnippet, args, author, checks, desc, ifs, lock, logFn, name, pipefail, root, setE, setU, setX, shebang, trap]);

  useEffect(() => {
    generateScript();
  }, [generateScript]);

  const toggleSnippet = useCallback((key: string) => {
    setActiveSnippet((prev) => {
      if (prev === key) return null;
      setSnippetFeedback(true);
      setTimeout(() => setSnippetFeedback(false), 2000);
      return key;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    if (!currentRaw) return;
    const ok = await copy(currentRaw);
    if (ok) setShowToast(true);
  }, [copy, currentRaw]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 2200);
    return () => clearTimeout(t);
  }, [showToast]);

  return (
    <div className="rounded-lg border border-border bg-bg">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full shrink-0 md:w-[340px]">
          <div className="mb-3 overflow-hidden rounded-lg border border-border bg-bg2">
            <div className="border-b border-border bg-bg3 px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">
              {'// script identity'}
            </div>
            <div className="flex flex-col gap-2.5 p-3.5">
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted">Script name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="myscript.sh" className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-[13px] text-text outline-none focus:border-green" />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted">Description</label>
                <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does this script do?" className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-[13px] text-text outline-none focus:border-green" />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted">Author</label>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="optional" className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-[13px] text-text outline-none focus:border-green" />
              </div>
            </div>
          </div>

          <div className="mb-3 overflow-hidden rounded-lg border border-border bg-bg2">
            <div className="border-b border-border bg-bg3 px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">{'// safety & shell'}</div>
            <div className="flex flex-col gap-2 p-3.5 text-[13px] text-text">
              {[
                [shebang, setShebang, '#!/bin/bash'],
                [setE, setSetE, 'set -e (exit on error)'],
                [setU, setSetU, 'set -u (unset var = error)'],
                [pipefail, setPipefail, 'set -o pipefail'],
                [ifs, setIfs, "IFS=$'\\n\\t'"],
                [setX, setSetX, 'set -x (debug)'],
              ].map(([checked, setter, label], i) => (
                <label key={i} className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={checked as boolean} onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)} />
                  <span className="font-mono"><code className="text-green">{String(label).split(' ')[0]}</code> {String(label).includes('(') ? String(label).slice(String(label).indexOf(' ')) : ''}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-3 overflow-hidden rounded-lg border border-border bg-bg2">
            <div className="border-b border-border bg-bg3 px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">{'// features'}</div>
            <div className="flex flex-col gap-2 p-3.5 text-[13px] text-text">
              {[
                [logFn, setLogFn, 'Timestamped log() function'],
                [checks, setChecks, 'CHECK / CROSS variables'],
                [args, setArgs, 'Argument parser (--help, --dry-run)'],
                [lock, setLock, 'Lock file (prevent duplicate runs)'],
                [root, setRoot, 'Require root check'],
                [trap, setTrap, 'Trap on EXIT (cleanup handler)'],
              ].map(([checked, setter, label], i) => (
                <label key={i} className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={checked as boolean} onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)} />
                  <span>{label as string}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-3 overflow-hidden rounded-lg border border-border bg-bg2">
            <div className="border-b border-border bg-bg3 px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">{'// inject a snippet'}</div>
            <div className="flex flex-col gap-2 p-3.5">
              {Object.keys(SNIPPETS).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSnippet(key)}
                    className={`flex-1 rounded-full border px-3 py-1.5 font-mono text-xs ${
                      activeSnippet === key ? 'border-green bg-green-dim text-green' : 'border-border bg-bg2 text-text'
                    }`}
                  >
                    {SNIPPET_LABELS[key]}
                  </button>
                  <Link href={SNIPPET_LINKS[key]} target="_blank" className="shrink-0 text-[11px] text-muted hover:text-text">
                    view →
                  </Link>
                </div>
              ))}
              <div className={`font-mono text-xs text-green transition-opacity ${snippetFeedback ? 'opacity-100' : 'opacity-0'}`}>
                ↓ snippet injected
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleCopy()}
            className="w-full rounded-lg border-none bg-green py-3 font-mono text-sm font-semibold text-[#0d1117]"
          >
            {copied ? '✓ Copied' : '⧉ Copy Script'}
          </button>
        </div>

        <div className={`min-w-0 flex-1 md:sticky md:top-20 ${previewPulse ? 'border-l-[3px] border-l-green' : 'border-l-[3px] border-l-transparent'}`}>
          <div className="flex items-center gap-3 rounded-t-lg border border-b-0 border-border bg-bg3 px-3.5 py-2.5">
            <div className="flex shrink-0 gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="inline-block h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="inline-block h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className={`font-mono text-[13px] ${name.trim() ? 'text-text' : 'text-muted'}`}>{barFilename}</span>
            <span className="ml-auto font-mono text-xs text-muted">{barLines}</span>
          </div>
          <div className="mb-2 flex justify-end px-1 pt-1">
            <CopyButton copied={copied} onClick={() => void handleCopy()} />
          </div>
          <pre
            className="min-h-[400px] overflow-x-auto whitespace-pre rounded-b-lg border border-border bg-bg p-5 font-mono text-[13px] leading-relaxed text-text"
            dangerouslySetInnerHTML={{ __html: outputHtml }}
          />
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-[999] -translate-x-1/2 rounded-md border border-green bg-bg3 px-4 py-2.5 font-mono text-xs text-green">
          Script copied to clipboard
        </div>
      )}
    </div>
  );
}
