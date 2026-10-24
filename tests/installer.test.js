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
  const agents = path.join(root, 'AGENTS.md');
  fs.writeFileSync(agents, '# Custom local rules\n');
  const second = run();
  assert.equal(second.status, 0, second.stderr);
  assert.equal(fs.readFileSync(agents, 'utf8'), '# Custom local rules\n');
  assert.ok(fs.existsSync(agents + '.issflow-new'));
});
