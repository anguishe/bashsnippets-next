// Checks the jq Filter Builder's in-browser subset against the real jq binary: every typed
// filter must parse, round-trip through buildFilter(), and preview exactly what jq prints.
// Usage: node scripts/check-jq-subset.mjs   (needs jq on PATH; exits 1 on failure)
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const { buildFilter, evaluate, parseFilter } = await import('../src/components/tools/shared/jqSubset.ts');

// The same shapes as the tool's "Array of items" and "GitHub repo" samples.
const ITEMS = {
  count: 3,
  items: [
    { id: 'j-01', name: 'nightly-backup', active: true, priority: 5 },
    { id: 'j-02', name: 'log-rotate', active: false, priority: 2 },
    { id: 'j-03', name: 'cert-renew', active: true, priority: 9 },
  ],
};
const REPO = { full_name: 'cli/cli', 'odd key': 1, owner: { login: 'cli' }, license: null, topics: ['cli', 'go'] };

const CASES = [
  [ITEMS, '.items[] | select(.active == true) | .name', true],
  [ITEMS, '.items[] | select(.priority > 4) | .id', true],
  [ITEMS, '.items[] | select(.name != "log-rotate")', false],
  [ITEMS, '.items[1].name', true],
  [ITEMS, '.items[] | .priority', false],
  [REPO, '.owner.login', true],
  [REPO, '.["odd key"]', false],
  [REPO, '.license // "none"', true],
  [REPO, '.topics[]', true],
  [REPO, '.', false],
];

const jq = (json, filter, raw) =>
  execFileSync('jq', raw ? ['-r', filter] : ['-c', filter], { input: JSON.stringify(json), encoding: 'utf8' })
    .split('\n')
    .filter((l) => l !== '');

let failures = 0;
for (const [json, filter, raw] of CASES) {
  try {
    const state = parseFilter(filter);
    assert.ok(state, 'did not parse');
    // Re-parsing the builder's own output gives the same state: typing and clicking agree.
    assert.deepEqual(parseFilter(buildFilter(state)), state, `round-trip via "${buildFilter(state)}"`);
    const ours = evaluate(json, state, raw).lines;
    assert.deepEqual(ours, jq(json, filter, raw));
    console.log(`ok   ${raw ? '-r ' : '   '}${filter}  →  ${ours.join(' | ')}`);
  } catch (e) {
    failures++;
    console.log(`FAIL ${filter}: ${e.message.split('\n')[0]}`);
  }
}

// Outside the subset: the tool must say so instead of pretending to preview it.
for (const f of ['.items | length', '.items[] | {id, name}', 'map(.id)', '.items[] | select(.priority > 4 and .active)']) {
  assert.equal(parseFilter(f), null, `${f} should be outside the subset`);
}

if (failures) {
  console.log(`${failures} case(s) disagree with jq`);
  process.exit(1);
}
console.log(`all ${CASES.length} typed filters match jq ${execFileSync('jq', ['--version'], { encoding: 'utf8' }).trim()}`);
