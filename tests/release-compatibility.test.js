'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'issflow-release-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
test('release retains every file shipped in npm 1.11.1',()=>{
 const manifest=require('./released-1.11.1-files.json');
 for(const file of manifest)assert.ok(fs.existsSync(path.join(root,'create-issflow/template/.issflow',file)),file);
});
for(const type of ['module','commonjs'])test(`token lint works in installed ${type} project`,t=>{
 const dir=fixture(t);fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({type}));
 const install=spawnSync(process.execPath,[path.join(root,'create-issflow/bin/cli.js'),'--tool=cursor'],{cwd:dir,encoding:'utf8'});assert.equal(install.status,0,install.stderr);
 fs.mkdirSync(path.join(dir,'docs/design'),{recursive:true});fs.mkdirSync(path.join(dir,'src'));
 fs.writeFileSync(path.join(dir,'docs/design/tokens.css'),':root { --brand: #123456; }');
 const file=path.join(dir,'src/style.css');fs.writeFileSync(file,'.a {color: #123456;}');
 const run=()=>spawnSync(process.execPath,[path.join(dir,'.issflow/scripts/token-lint.js')],{cwd:dir,encoding:'utf8'});
 assert.equal(run().status,0);fs.writeFileSync(file,'.a {color: #abcdef;}');const bad=run();assert.equal(bad.status,1);assert.match(bad.stderr,/BLOCK/);
});
test('session hook preserves waiting ETA and lean resume plus workflow summary',t=>{
 const dir=fixture(t);fs.mkdirSync(path.join(dir,'docs'));
 fs.writeFileSync(path.join(dir,'docs/STATE.md'),'delivery:\n  status: WAITING_ON_HUMAN\n  waiting_since: 2020-01-01T00:00:00Z\n  waiting_for: approved design\n  next_human_action: choose direction\n  agent_eta: none\n');
 fs.writeFileSync(path.join(dir,'docs/ISSUES.md'),'### One\n- [ ] secret long issue body\n');
 require('../.issflow/runtime/workflow').init(path.join(dir,'docs/WORKFLOW.json'),{goal:'G',budget:2,tasks:[{id:'one',title:'One'}]});
 const r=spawnSync(process.execPath,[path.join(root,'.issflow/hooks/session-start.js')],{cwd:dir,input:'{"source":"compact"}',env:{...process.env,CLAUDE_PROJECT_DIR:dir},encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/WAITING_STALE/);assert.match(r.stdout,/Autonomous workflow checkpoint/);assert.doesNotMatch(r.stdout,/secret long issue body|open issues:/);
});
