'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'create-issflow/bin/cli.js');
const files = [
  'commands/ui-audit.md', 'commands/redesign.md',
  'skills/ux-design/SKILL.md', 'skills/ux-design/references/product-experience.md',
  'skills/ux-design/references/visual-direction.md', 'templates/UX-AUDIT-template.md',
  'templates/UX-EVIDENCE-template.json', 'scripts/ux-evidence.js', 'scripts/package.json',
];
function run(file, args, cwd) { return spawnSync(process.execPath, [file, ...args], { cwd, encoding: 'utf8' }); }
test('all adapters install UX review/redesign assets in an ESM consumer without claiming completed review', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'issflow-ux-install-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  const preview = run(cli, ['--tool=all', '--dry-run'], dir);
  assert.equal(preview.status, 0, preview.stderr);
  assert.equal(fs.existsSync(path.join(dir, '.issflow')), false);
  const install = run(cli, ['--tool=all'], dir);
  assert.equal(install.status, 0, install.stderr);
  for (const file of files) {
    const installed = path.join(dir, '.issflow', file);
    assert.ok(fs.existsSync(installed), `Missing portable asset: ${file}`);
    assert.equal(fs.readFileSync(installed, 'utf8'), fs.readFileSync(path.join(root, '.issflow', file), 'utf8'), `Stale installer asset: ${file}`);
  }
  for (const command of ['redesign.md', 'ui-audit.md']) {
    for (const adapter of ['.claude/commands', '.cursor/commands']) {
      assert.equal(fs.readFileSync(path.join(dir, adapter, command), 'utf8'), fs.readFileSync(path.join(dir, '.issflow/commands', command), 'utf8'));
    }
  }
  assert.match(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), /\/redesign/);
  const report = path.join(dir, '.issflow/templates/UX-EVIDENCE-template.json');
  const validator = path.join(dir, '.issflow/scripts/ux-evidence.js');
  const result = run(validator, [report], dir);
  assert.equal(result.status, 1, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.valid, true);
  assert.equal(output.verdict, 'incomplete');
  assert.equal(output.coverage.completed, 0);
  assert.ok(output.coverage.counts['not-run'] > 0);
  assert.match(output.limitation, /does not inspect artifacts/);
  fs.writeFileSync(validator, '// project customization\n');
  const reinstall = run(cli, ['--tool=all'], dir);
  assert.equal(reinstall.status, 0, reinstall.stderr);
  assert.equal(fs.readFileSync(validator, 'utf8'), '// project customization\n');
  assert.equal(fs.readFileSync(validator + '.issflow-new', 'utf8'), fs.readFileSync(path.join(root, '.issflow/scripts/ux-evidence.js'), 'utf8'));
});
