// Runs the shell lines the PATH debugger generates in a real bash and asserts what they print.
// Usage: node scripts/check-path-debugger.mjs   (no test runner in this repo; exits 1 on failure)
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PATH_CHECK_COMMAND, PATH_SOURCES_COMMAND, buildKeepExisting, shQuote } from '../src/components/tools/shared/pathCheck.ts';

const root = mkdtempSync(join(tmpdir(), 'pathdbg-'));
const present = join(root, 'bin');
const spaced = join(root, "it's a dir");         // a space and a single quote: the quoting worst case
const missing = join(root, 'gone');
mkdirSync(present);
mkdirSync(spaced);

// bash runs by absolute path with a hand-built PATH; every command used is a builtin.
const bash = (script, PATH) => execFileSync('/bin/bash', ['-c', script], { env: { PATH }, encoding: 'utf8' });

try {
  // 1. The check one-liner reports empty, relative and missing entries, including a trailing empty one.
  const out = bash(PATH_CHECK_COMMAND, [present, missing, '', 'rel/bin', spaced, ''].join(':'));
  assert.deepEqual(out.trim().split('\n'), [
    `missing: ${missing}`,
    'empty entry: searches the current directory',
    'relative: rel/bin',
    'empty entry: searches the current directory',
  ]);

  // 2. Silent when every entry exists.
  assert.equal(bash(PATH_CHECK_COMMAND, [present, spaced].join(':')), '');

  // 3. The keep-existing line drops the missing directory, keeps order, survives a quote and a space.
  const keep = buildKeepExisting([spaced, missing, present]);
  assert.equal(bash(`${keep}; printf %s "$PATH"`, '/nowhere'), `${spaced}:${present}`);

  // 4. The cleaned export line round-trips the exact string.
  const exportLine = `export PATH=${shQuote([spaced, present].join(':'))}`;
  assert.equal(bash(`${exportLine}; printf %s "$PATH"`, '/nowhere'), `${spaced}:${present}`);

  // 5. Empty input generates nothing rather than an export that empties PATH.
  assert.equal(buildKeepExisting([]), '');

  // 6. The where-is-it-set grep finds the startup-file line (HOME points at the scratch dir).
  writeFileSync(join(root, '.bashrc'), '# comment\nexport PATH="$HOME/bin:$PATH"\nMYPATH=x\n');
  // grep exits 2 because most of the listed files do not exist; only stdout matters here.
  const found = spawnSync('/bin/bash', ['-c', PATH_SOURCES_COMMAND], {
    env: { PATH: '/usr/bin:/bin', HOME: root },
    encoding: 'utf8',
  }).stdout;
  const own = found.split('\n').filter((l) => l.startsWith(root));
  assert.deepEqual(own, [`${join(root, '.bashrc')}:2:export PATH="$HOME/bin:$PATH"`], 'MYPATH= must not match');

  console.log('✓ path-debugger: 6 checks passed');
} finally {
  rmSync(root, { recursive: true, force: true });
}
