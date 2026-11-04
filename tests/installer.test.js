'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('installer preserves existing files and stages conflicts', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'issflow-installer-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cli = path.resolve(__dirname, '../create-issflow/bin/cli.js');
  const run = () => spawnSync(process.execPath, [cli, '--tool=codex'], {
    cwd: root,
    encoding: 'utf8',
  });
  const first = run();
  assert.equal(first.status, 0, first.stderr);
  assert.ok(fs.existsSync(path.join(root, '.issflow/hooks/approval-policy.js')));
  assert.ok(fs.existsSync(path.join(root, '.issflow/templates/PLAN-SCOPED.md')));
  assert.ok(fs.existsSync(path.join(root, '.issflow/models/MODEL-MATRIX.md')));
  assert.ok(fs.existsSync(path.join(root, '.issflow/templates/design/picker.html')));
  assert.ok(fs.existsSync(path.join(root, '.issflow/scripts/token-lint.js')));
  const agents = path.join(root, 'AGENTS.md');
  fs.writeFileSync(agents, '# Custom local rules\n');
  const second = run();
  assert.equal(second.status, 0, second.stderr);
  assert.equal(fs.readFileSync(agents, 'utf8'), '# Custom local rules\n');
  assert.ok(fs.existsSync(agents + '.issflow-new'));
});

test('cursor adapter writes gates rule + sessionStart hook', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'issflow-cursor-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cli = path.resolve(__dirname, '../create-issflow/bin/cli.js');
  const r = spawnSync(process.execPath, [cli, '--tool=cursor'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr);
  const gates = fs.readFileSync(path.join(root, '.cursor/rules/issflow-gates.mdc'), 'utf8');
  assert.match(gates, /delivery:/);
  assert.match(gates, /WAITING_STALE|agent_eta/);
  const hooks = JSON.parse(fs.readFileSync(path.join(root, '.cursor/hooks.json'), 'utf8'));
  assert.ok(hooks.hooks.sessionStart);
  const agents = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
  assert.match(agents, /Host capability/);
});

test('token-lint skips when no tokens.css', () => {
  const script = path.resolve(__dirname, '../scripts/token-lint.js');
  const r = spawnSync(process.execPath, [script], {
    cwd: fs.mkdtempSync(path.join(os.tmpdir(), 'issflow-lint-')),
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /skip/);
});
