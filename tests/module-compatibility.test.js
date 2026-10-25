'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { gitBlobSha } = require('../.issflow/hooks/approval-policy');

const cli = path.resolve(__dirname, '../create-issflow/bin/cli.js');

function run(cwd, file, args = [], input) {
  return spawnSync(process.execPath, [file, ...args], {
    cwd,
    encoding: 'utf8',
    input,
    env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
  });
}

function write(root, name, data) {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

function fixture(t, moduleType) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'issflow-' + moduleType + '-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  write(root, 'package.json', JSON.stringify({ private: true, type: moduleType }));
  return root;
}

for (const moduleType of ['module', 'commonjs']) {
  test('portable hooks work in ' + moduleType + ' consumers', (t) => {
    const root = fixture(t, moduleType);
    write(root, 'AGENTS.md', '# Existing custom rules\n');

    const preview = run(root, cli, ['--tool=codex', '--dry-run']);
    assert.equal(preview.status, 0, preview.stderr);
    assert.equal(fs.existsSync(path.join(root, '.issflow')), false);

    const install = run(root, cli, ['--tool=codex']);
    assert.equal(install.status, 0, install.stderr);
    assert.equal(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'), '# Existing custom rules\n');
    assert.ok(fs.existsSync(path.join(root, 'AGENTS.md.issflow-new')));
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, '.issflow/hooks/package.json'), 'utf8')).type, 'commonjs');

    const plan = '# PLAN-ESM — Portable hooks\n\n> Revision: 1\n> Status: PENDING\n';
    write(root, 'docs/ACTIVE-PLAN', 'docs/plans/PLAN-ESM.md\n');
    write(root, 'docs/plans/PLAN-ESM.md', plan);

    const verifier = path.join(root, '.issflow/hooks/verify-approval.js');
    const gate = path.join(root, '.issflow/hooks/plan-gate.js');
    const file = path.join(root, 'src/features/orders/index.ts');

    const pending = run(root, verifier, ['--files', 'src/features/orders/index.ts']);
    assert.equal(pending.status, 1, pending.stderr);
    assert.match(pending.stderr, /BLOCKED:/);
    assert.doesNotMatch(pending.stderr, /require is not defined/);

    const denied = run(root, gate, [], JSON.stringify({
      tool_name: 'Edit', tool_input: { file_path: file },
    }));
    assert.equal(denied.status, 0, denied.stderr);
    assert.match(denied.stdout, /permissionDecision.*deny/);

    write(root, 'docs/approvals/PLAN-ESM.json', JSON.stringify({
      planId: 'PLAN-ESM',
      revision: 1,
      planBlobSha: gitBlobSha(plan),
      approvedBy: 'owner',
      approvedAt: '2026-10-25',
      approvalSource: 'explicit-owner-approval',
      allowedPaths: ['src/features/orders/**'],
    }));
    const approved = run(root, verifier, ['--files', 'src/features/orders/index.ts']);
    assert.equal(approved.status, 0, approved.stderr);
    assert.match(approved.stdout, /Approval verified/);

    const outside = run(root, verifier, ['--files', 'src/features/hr/index.ts']);
    assert.equal(outside.status, 1, outside.stderr);
    assert.match(outside.stderr, /outside approved plan scope/);

    const dockerInstall = run(root, cli, ['--tool=codex', '--docker', '--ci']);
    assert.equal(dockerInstall.status, 0, dockerInstall.stderr);
    assert.ok(fs.existsSync(path.join(root, 'scripts/feature-docker.js')));
    assert.ok(fs.existsSync(path.join(root, '.github/workflows/issflow-feature.yml')));
    const dockerRunner = run(root, path.join(root, 'scripts/feature-docker.js'), ['docs/features/missing/FEATURE.md']);
    assert.equal(dockerRunner.status, 1, dockerRunner.stderr);
    assert.match(dockerRunner.stderr, /Feature doc not found/);
    assert.doesNotMatch(dockerRunner.stderr, /require is not defined|ERR_REQUIRE_ESM/);

    const allAdapters = run(root, cli, ['--tool=all']);
    assert.equal(allAdapters.status, 0, allAdapters.stderr);
    assert.ok(fs.existsSync(path.join(root, '.claude/hooks/package.json')));
    assert.ok(fs.existsSync(path.join(root, '.claude/settings.json')));
    const mirroredGate = run(root, path.join(root, '.claude/hooks/plan-gate.js'), [], JSON.stringify({
      tool_name: 'Edit', tool_input: { file_path: path.join(root, 'src/features/hr/index.ts') },
    }));
    assert.equal(mirroredGate.status, 0, mirroredGate.stderr);
    assert.match(mirroredGate.stdout, /permissionDecision.*deny/);

    const second = run(root, cli, ['--tool=codex']);
    assert.equal(second.status, 0, second.stderr);
    assert.equal(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'), '# Existing custom rules\n');
  });
}

test('generated portable template contains no bytecode caches', () => {
  const root = path.resolve(__dirname, '../create-issflow/template');
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? [file, ...walk(file)] : [file];
  });
  const files = walk(root).map((file) => path.relative(root, file).replaceAll(path.sep, '/'));
  assert.ok(files.includes('.issflow/hooks/package.json'));
  assert.equal(files.some((file) => file.split('/').includes('__pycache__') || /\.(pyc|pyo)$/.test(file)), false);
});
