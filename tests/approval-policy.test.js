'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { validate, gitBlobSha } = require('../.issflow/hooks/approval-policy');

function fixture(t, { approved = false, revision = 1, activeFeature = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'issflow-approval-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (file, data) => {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, data);
  };
  const plan = `# PLAN-TEST — Sample\n\n> Revision: ${revision}\n> Status: PENDING\n\n## Scope\nOnly src/features/orders.\n`;
  put('docs/ACTIVE-PLAN', 'docs/plans/PLAN-TEST.md\n');
  put('docs/plans/PLAN-TEST.md', plan);
  if (activeFeature) put('docs/STATE.md', 'feature: orders (active)\n');
  if (approved) {
    put('docs/approvals/PLAN-TEST.json', JSON.stringify({
      planId: 'PLAN-TEST',
      revision,
      planBlobSha: gitBlobSha(plan),
      approvedBy: 'owner',
      approvedAt: '2026-10-25',
      approvalSource: 'owner-reviewed',
      allowedPaths: ['src/features/orders/**', 'tests/**'],
    }));
  }
  return { root, put };
}

test('pending plan blocks source changes', (t) => {
  const { root } = fixture(t);
  assert.equal(validate(root, { changedFiles: ['src/features/orders/index.ts'] }).ok, false);
});

test('approved plan permits only scoped paths', (t) => {
  const { root } = fixture(t, { approved: true });
  assert.equal(validate(root, { changedFiles: ['src/features/orders/index.ts'] }).ok, true);
  assert.match(validate(root, { changedFiles: ['src/features/hr/index.ts'] }).reason, /outside approved/);
});

test('changing an approved plan invalidates the approval', (t) => {
  const { root, put } = fixture(t, { approved: true });
  put('docs/plans/PLAN-TEST.md', '# PLAN-TEST — Changed\n> Revision: 1\n');
  assert.match(validate(root).reason, /changed after approval/);
});

test('approval for a different revision is rejected', (t) => {
  const { root, put } = fixture(t, { approved: true });
  const file = path.join(root, 'docs/approvals/PLAN-TEST.json');
  const approval = JSON.parse(fs.readFileSync(file, 'utf8'));
  approval.revision = 2;
  put('docs/approvals/PLAN-TEST.json', JSON.stringify(approval));
  assert.match(validate(root).reason, /different plan ID or revision/);
});

test('approval for a different plan is rejected', (t) => {
  const { root, put } = fixture(t, { approved: true });
  const file = path.join(root, 'docs/approvals/PLAN-TEST.json');
  const approval = JSON.parse(fs.readFileSync(file, 'utf8'));
  approval.planId = 'PLAN-OTHER';
  put('docs/approvals/PLAN-TEST.json', JSON.stringify(approval));
  assert.match(validate(root).reason, /different plan ID or revision/);
});

test('active feature state does not bypass approval', (t) => {
  const { root } = fixture(t, { activeFeature: true });
  assert.equal(validate(root, { changedFiles: ['src/features/orders/index.ts'] }).ok, false);
});

test('malformed approval metadata blocks changes', (t) => {
  const { root, put } = fixture(t);
  put('docs/approvals/PLAN-TEST.json', '{');
  assert.equal(validate(root).ok, false);
});

test('missing active plan pointer blocks scoped projects', (t) => {
  const { root } = fixture(t);
  fs.unlinkSync(path.join(root, 'docs/ACTIVE-PLAN'));
  assert.match(validate(root).reason, /ACTIVE-PLAN/);
});

test('legacy approved PLAN.md remains supported', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'issflow-legacy-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs/PLAN.md'), '# Plan\n> Approval: approved 2026-10-25 v1\n');
  assert.equal(validate(root).mode, 'legacy');
  fs.writeFileSync(path.join(root, 'docs/PLAN.md'), '# Plan\n> Approval: PENDING\n');
  assert.equal(validate(root).ok, false);
});

test('Claude hook rejects edits while pending', (t) => {
  const { root } = fixture(t, { activeFeature: true });
  const hook = path.join(__dirname, '../.issflow/hooks/plan-gate.js');
  const run = spawnSync(process.execPath, [hook], {
    cwd: root,
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    input: JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: path.join(root, 'src/features/orders/index.ts') } }),
    encoding: 'utf8',
  });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /permissionDecision.*deny/);
});

test('Claude hook blocks approval-record edits', (t) => {
  const { root } = fixture(t, { approved: true });
  const hook = path.join(__dirname, '../.issflow/hooks/plan-gate.js');
  const run = spawnSync(process.execPath, [hook], {
    cwd: root,
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: path.join(root, 'docs/approvals/PLAN-TEST.json') } }),
    encoding: 'utf8',
  });
  assert.match(run.stdout, /permissionDecision.*deny/);
});

test('deleted files cannot bypass approved path boundaries', (t) => {
  const { root } = fixture(t, { approved: true });
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  git('init', '-q');
  git('config', 'user.name', 'Test User');
  git('config', 'user.email', 'test@example.invalid');
  const file = path.join(root, 'src/features/hr/private.ts');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, 'export const privateValue = true;\n');
  git('add', '.');
  git('commit', '-qm', 'test: seed fixture');
  const base = git('rev-parse', 'HEAD');
  fs.unlinkSync(file);
  git('add', '-A');
  git('commit', '-qm', 'test: delete unrelated file');
  const verifier = path.resolve(__dirname, '../.issflow/hooks/verify-approval.js');
  const result = spawnSync(process.execPath, [verifier, '--base', base], {
    cwd: root, encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /outside approved plan scope/);
});
