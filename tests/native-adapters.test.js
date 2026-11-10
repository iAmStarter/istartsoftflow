'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const cli = path.resolve(__dirname, '../create-issflow/bin/cli.js');
const source = path.resolve(__dirname, '../create-issflow/template/.issflow');
const read = (dir, file) => fs.readFileSync(path.join(dir, file), 'utf8');
function fixture(t, moduleType) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'issflow-native-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ type: moduleType }));
  return dir;
}
function run(dir, tool, args = []) {
  return spawnSync(process.execPath, [cli, '--tool=' + tool, ...args], { cwd: dir, encoding: 'utf8' });
}
for (const moduleType of ['commonjs', 'module']) {
  for (const host of ['codex', 'cursor', 'all']) {
    test(`${host} native discovery install and upgrade in ${moduleType}`, t => {
      const dir = fixture(t, moduleType);
      const preview = run(dir, host, ['--dry-run']);
      assert.equal(preview.status, 0, preview.stderr);
      assert.deepEqual(fs.readdirSync(dir), ['package.json']);
      const install = run(dir, host);
      assert.equal(install.status, 0, install.stderr);
      for (const skill of fs.readdirSync(path.join(source, 'skills'))) {
        assert.equal(read(dir, `.agents/skills/${skill}/SKILL.md`), read(source, `skills/${skill}/SKILL.md`));
      }
      const roles = fs.readdirSync(path.join(source, 'agents')).filter(f => f.endsWith('.md'));
      for (const role of roles) {
        const name = role.slice(0, -3);
        if (host !== 'cursor') {
          const config = read(dir, `.codex/agents/${name}.toml`);
          assert.match(config, new RegExp('name = "' + name + '"'));
          assert.match(config, /developer_instructions = /);
          assert.doesNotMatch(config, /^(model|tools|sandbox_mode|model_reasoning_effort)\s*=/m);
          // Basic TOML strings emitted by this generator are JSON string compatible.
          const instruction = JSON.parse(config.split('\n').find(l => l.startsWith('developer_instructions = ')).split(' = ').slice(1).join(' = '));
          assert.match(instruction, /not a sandbox/);
          assert.ok(instruction.includes(read(source, `agents/${role}`).split(/\r?\n---\r?\n/)[1].trim()));
        }
        if (host !== 'codex') {
          const config = read(dir, `.cursor/agents/${role}`);
          assert.match(config, /model: inherit/);
          assert.doesNotMatch(config, /^tools:|^model: (sonnet|haiku|opus)$/m);
        }
      }
      if (host === 'all') {
        // Agent precedence is documented by Cursor; test the install shape rather
        // than pretending this unit test launches Cursor's discovery engine.
        assert.match(install.stdout, /Native .cursor\/agents take precedence/);
        assert.match(install.stdout, /duplicate names/);
        assert.ok(fs.existsSync(path.join(dir, '.claude/skills/ux-design/SKILL.md')));
      } else assert.equal(fs.existsSync(path.join(dir, '.claude')), false);
      assert.match(read(dir, 'AGENTS.md'), /CORE.md/);
      const custom = host === 'cursor' ? '.cursor/agents/planner.md' : '.codex/agents/planner.toml';
      fs.writeFileSync(path.join(dir, custom), '# Owner customized agent\n');
      fs.writeFileSync(path.join(dir, '.agents/skills/ux-design/SKILL.md'), '# Owner customized skill\n');
      const upgrade = run(dir, host);
      assert.equal(upgrade.status, 0, upgrade.stderr);
      assert.equal(read(dir, custom), '# Owner customized agent\n');
      assert.ok(fs.existsSync(path.join(dir, custom + '.issflow-new')));
      assert.equal(read(dir, '.agents/skills/ux-design/SKILL.md'), '# Owner customized skill\n');
      assert.ok(fs.existsSync(path.join(dir, '.agents/skills/ux-design/SKILL.md.issflow-new')));
      const forced = run(dir, host, ['--force']);
      assert.equal(forced.status, 0, forced.stderr);
      assert.notEqual(read(dir, custom), '# Owner customized agent\n');
    });
  }
}
test('Claude-only remains native and does not add other host discovery files', t => {
  const dir = fixture(t, 'module');
  const result = run(dir, 'claude');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(dir, '.claude/agents/planner.md')));
  assert.ok(fs.existsSync(path.join(dir, '.claude/skills/ux-design/SKILL.md')));
  assert.equal(fs.existsSync(path.join(dir, '.agents')), false);
  assert.equal(fs.existsSync(path.join(dir, '.codex')), false);
});
