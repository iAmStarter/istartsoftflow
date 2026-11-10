'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {inspect}=require('../.issflow/scripts/doctor');
test('doctor separates file inventory from executable and live activation',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'iss-doctor-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(p,s='')=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);};
 write('AGENTS.md');write('.agents/skills/ux/SKILL.md');write('.claude/skills/ux/SKILL.md');write('.codex/agents/reviewer.toml');
 const calls=[];const result=inspect(root,{probe:n=>{calls.push(n);return {status:'detected',version:'test-version'};}});
 assert.deepEqual(calls,['codex','cursor','claude']);assert.equal(result.hosts.codex.activation,'not-verified');assert.deepEqual(result.hosts.codex.skills,['ux']);assert.match(result.warnings.join(' '),/overlap/);assert.equal(result.hosts.codex.hookConfig,false);
 assert.equal(fs.existsSync(path.join(root,'.cursor')),false);
});
test('doctor reports missing hosts without claiming capability failure',()=>{
 const result=inspect('/tmp/nonexistent-issflow-doctor',{probe:()=>({status:'unavailable',reason:'ENOENT'})});
 assert.equal(result.hosts.codex.executable.status,'unavailable');assert.equal(result.hosts.codex.activation,'not-verified');assert.ok(result.limitations.length);
});
