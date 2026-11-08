'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'create-issflow/bin/cli.js');
for (const tool of ['claude', 'codex', 'cursor']) {
  for (const type of ['module', 'commonjs']) {
    test(`${tool} installs usable workflow runtime in ${type} project`, () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'issflow-autonomy-'));
      try {
        fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({type}));
        execFileSync(process.execPath, [cli, `--tool=${tool}`, '--dry-run'], {cwd: dir});
        assert.equal(fs.existsSync(path.join(dir, '.issflow')), false);
        execFileSync(process.execPath, [cli, `--tool=${tool}`], {cwd: dir});
        const runtime = path.join(dir, '.issflow/runtime/workflow.js');
        assert.equal(fs.existsSync(runtime), true);
        assert.equal(fs.existsSync(path.join(dir, '.issflow/routing/model-router.js')), true);
        const router=path.join(dir,'.issflow/routing/model-router.js');
        assert.equal(execFileSync(process.execPath,['-e',`console.log(typeof require(${JSON.stringify(router)}).route)`],{cwd:dir,encoding:'utf8'}).trim(),'function');
        assert.equal(execFileSync(process.execPath, ['-e', `console.log(typeof require(${JSON.stringify(runtime)}).status)`], {cwd:dir, encoding:'utf8'}).trim(), 'function');
        if (tool !== 'claude') assert.equal(fs.existsSync(path.join(dir, '.claude')), false);
        else assert.match(JSON.parse(fs.readFileSync(path.join(dir,'.claude/settings.json'),'utf8')).hooks.SessionStart[0].matcher,/resume/);
        const agents = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
        assert.match(agents, /does not execute agents or schedule/);
        if (tool === 'cursor') assert.match(fs.readFileSync(path.join(dir, '.cursor/rules/istartsoftflow.mdc'), 'utf8'), /not registered native agents/);
        fs.writeFileSync(runtime, '// customized\n');
        execFileSync(process.execPath, [cli, `--tool=${tool}`], {cwd:dir});
        assert.equal(fs.readFileSync(runtime, 'utf8'), '// customized\n');
        assert.equal(fs.existsSync(runtime + '.issflow-new'), true);
      } finally { fs.rmSync(dir, {recursive:true, force:true}); }
    });
  }
}
test('session hook reports corrupt checkpoints without clearing them', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'issflow-checkpoint-'));
  try {
    fs.mkdirSync(path.join(dir,'docs'));
    fs.writeFileSync(path.join(dir,'docs/WORKFLOW.json'), '{broken');
    const out=execFileSync(process.execPath,[path.join(root,'.issflow/hooks/session-start.js')],{cwd:dir, env:{...process.env,CLAUDE_PROJECT_DIR:dir},encoding:'utf8'});
    assert.match(out,/Workflow checkpoint unreadable/);
    assert.equal(fs.readFileSync(path.join(dir,'docs/WORKFLOW.json'),'utf8'),'{broken');
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});

test('upgrade adds missing ignore exceptions without duplicating existing ones', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'issflow-ignore-'));
  try {
    const old='.issflow/*\n!.issflow/agents/\n!.issflow/hooks/\n';
    const file=path.join(dir,'.gitignore');fs.writeFileSync(file,old);
    execFileSync(process.execPath,[cli,'--tool=codex','--dry-run'],{cwd:dir});
    assert.equal(fs.readFileSync(file,'utf8'),old);
    execFileSync(process.execPath,[cli,'--tool=codex'],{cwd:dir});
    const after=fs.readFileSync(file,'utf8');
    assert.match(after,/!\.issflow\/runtime\//);assert.match(after,/!\.issflow\/routing\//);
    assert.equal(after.split('!.issflow/agents/').length,2);
    execFileSync(process.execPath,[cli,'--tool=codex'],{cwd:dir});
    assert.equal(fs.readFileSync(file,'utf8'),after);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('session hook bounds large valid checkpoint context', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'issflow-context-'));
  try {
    fs.mkdirSync(path.join(dir,'docs'));
    const workflow=require('../.issflow/runtime/workflow');
    workflow.init(path.join(dir,'docs/WORKFLOW.json'),{goal:'x'.repeat(100000),budget:1000,tasks:Array.from({length:1000},(_,i)=>({id:`task-${i}`,title:'x'.repeat(100)}))});
    const out=execFileSync(process.execPath,[path.join(root,'.issflow/hooks/session-start.js')],{cwd:dir,env:{...process.env,CLAUDE_PROJECT_DIR:dir},encoding:'utf8'});
    assert.match(out,/1000 unfinished/);assert.ok(out.length<10000);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
