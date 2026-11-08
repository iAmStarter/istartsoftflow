'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { validateReport, BASELINE } = require('../.issflow/scripts/ux-evidence');
function fixture() {
  return { version: 1, mode: 'audit', revision: 'abc123/test-build',
    scope: [{ id: 'S-01', kind: 'screen', name: 'Orders' }, { id: 'F-01', kind: 'flow', name: 'Create order' }],
    checks: Object.entries(BASELINE).flatMap(([kind, dimensions]) => dimensions.map((dimension, index) => ({
      id: `${kind}-${index}`, targetId: kind === 'screen' ? 'S-01' : 'F-01', dimension,
      status: 'pass', method: 'browser', evidence: [`evidence/${kind}-${dimension}.png`],
    }))), findings: [] };
}
test('derives coverage without claiming artifact verification', () => {
  const result = validateReport({ ...fixture(), verdict: 'ship', coverage: { completed: 999 } });
  assert.equal(result.verdict, 'reviewed');
  assert.equal(result.coverage.completed, 10);
  assert.match(result.limitation, /does not inspect artifacts/);
});
test('empty or sparse declared scope cannot produce a complete audit', () => {
  assert.equal(validateReport({ ...fixture(), scope: [] }).valid, false);
  const report = fixture(); report.checks = report.checks.slice(0, 1);
  report.scope[0].requiredDimensions = ['hierarchy'];
  assert.equal(validateReport(report).verdict, 'incomplete');
  assert.equal(validateReport(report).coverage.missing.length, 9);
});
test('static and manual inspection cannot claim interactive browser coverage', () => {
  for (const method of ['static', 'manual', 'user-research']) {
    const report = fixture(); report.checks.forEach(check => { check.method = method; });
    const result = validateReport(report);
    assert.equal(result.verdict, 'incomplete');
    assert.equal(result.coverage.runtimeGaps.length, 7);
  }
});
test('automated results distinguish source from rendered environment', () => {
  const report = fixture(); report.checks.forEach(check => { check.method = 'automated'; });
  assert.equal(validateReport(report).valid, false);
  report.checks.forEach(check => { check.environment = 'source'; });
  assert.equal(validateReport(report).verdict, 'incomplete');
  report.checks.forEach(check => { check.environment = 'rendered'; });
  assert.equal(validateReport(report).verdict, 'reviewed');
});
test('no result passes without evidence; incomplete and N/A need explanation', () => {
  for (const status of ['pass', 'fail', 'blocked', 'not-run', 'not-applicable']) {
    const report = fixture(); report.checks[0] = { ...report.checks[0], status, evidence: [] };
    assert.equal(validateReport(report).valid, false);
    if (!['pass', 'fail'].includes(status)) {
      report.checks[0].explanation = 'This scope uses no such interaction.';
      assert.equal(validateReport(report).verdict, status === 'not-applicable' ? 'reviewed' : 'incomplete');
    }
  }
});
test('failed checks and material findings prevent reviewed even when accepted', () => {
  const report = fixture(); report.checks[0].status = 'fail';
  assert.equal(validateReport(report).verdict, 'fix-first');
  report.checks[0].status = 'pass';
  report.findings = [{ id: 'BUG-1', targetId: 'S-01', description: 'Cannot submit', severity: 'major', status: 'open' }];
  assert.equal(validateReport(report).verdict, 'fix-first');
  report.findings[0] = { ...report.findings[0], status: 'accepted', acceptedBy: 'owner', reason: 'Deferred' };
  assert.equal(validateReport(report).verdict, 'fix-first');
  report.findings[0].status = 'fixed';
  assert.equal(validateReport(report).valid, false);
  report.findings[0].retestEvidence = ['evidence/retest.png'];
  assert.equal(validateReport(report).verdict, 'reviewed');
});
test('additional project dimensions cannot be omitted', () => {
  const report = fixture(); report.scope[0].requiredDimensions = ['rtl'];
  assert.equal(validateReport(report).verdict, 'incomplete');
});
test('malformed data, duplicate ids and unknown targets fail closed', () => {
  for (const report of [null, [], {}, { ...fixture(), mode: 'ship' }, { ...fixture(), revision: '' },
    { ...fixture(), checks: [null] }, { ...fixture(), scope: [null] }, { ...fixture(), findings: [null] }]) {
    assert.equal(validateReport(report).valid, false);
  }
  const mutations = [r => r.scope.push(r.scope[0]), r => r.checks.push(r.checks[0]),
    r => { r.checks[0].targetId = 'unknown'; }, r => { r.checks[0].browserVerified = true; },
    r => { r.scope[0].requiredDimensions = '__proto__'; }, r => { r.scope[0].kind = '__proto__'; },
    r => { r.checks[0].status = 'unknown'; }];
  for (const mutate of mutations) { const report = fixture(); mutate(report); assert.equal(validateReport(report).valid, false); }
});
test('CLI is read-only, does not open evidence paths, and returns useful exit codes', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-evidence-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'report.json');
  const cli = path.resolve(__dirname, '../.issflow/scripts/ux-evidence.js');
  const report = fixture(); report.checks[0].evidence = ['https://example.invalid/never-fetch', '$(touch HACKED)', '../../private'];
  fs.writeFileSync(file, JSON.stringify(report));
  const run = () => spawnSync(process.execPath, [cli, file], { cwd: dir, encoding: 'utf8' });
  assert.equal(run().status, 0);
  assert.deepEqual(fs.readdirSync(dir), ['report.json']);
  report.checks = []; fs.writeFileSync(file, JSON.stringify(report)); assert.equal(run().status, 1);
  fs.writeFileSync(file, 'not json'); assert.equal(run().status, 2);
});
test('redesign always requires rendered behavior-preservation checks', () => {
  const report = fixture(); report.mode = 'redesign';
  assert.equal(validateReport(report).coverage.missing.length, 2);
  for (const target of report.scope) report.checks.push({ id: `preserve-${target.id}`, targetId: target.id,
    dimension: 'behavior-preservation', status: 'pass', method: 'static', evidence: ['contract-diff.txt'] });
  assert.equal(validateReport(report).verdict, 'incomplete');
  assert.equal(validateReport(report).coverage.runtimeGaps.length, 2);
  report.checks.filter(check => check.dimension === 'behavior-preservation').forEach(check => { check.method = 'browser'; });
  assert.equal(validateReport(report).verdict, 'reviewed');
});
