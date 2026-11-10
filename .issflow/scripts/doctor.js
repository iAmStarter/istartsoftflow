#!/usr/bin/env node
'use strict';
// Read-only structural inspection. Host versions do not prove skill/hook activation.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
function inspect(root, options = {}) {
  root = path.resolve(root);
  const exists = rel => { try { return fs.statSync(path.join(root, rel)).isFile(); } catch { return false; } };
  const directories = rel => { try { return fs.readdirSync(path.join(root, rel), {withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).sort(); } catch { return []; } };
  const files = (rel, ext) => { try { return fs.readdirSync(path.join(root, rel)).filter(x=>x.endsWith(ext)).sort(); } catch { return []; } };
  const probe = options.probe || (name => {
    const r = spawnSync(name, ['--version'], {encoding:'utf8',timeout:3000,windowsHide:true,shell:false});
    return r.error || r.status !== 0 ? {status:'unavailable',reason:r.error?.code || `exit ${r.status}`} : {status:'detected',version:r.stdout.trim().slice(0,300)};
  });
  const sharedSkills = directories('.agents/skills').filter(n=>exists(`.agents/skills/${n}/SKILL.md`));
  const claudeSkills = directories('.claude/skills').filter(n=>exists(`.claude/skills/${n}/SKILL.md`));
  const hosts = {
    codex: {entry:exists('AGENTS.md'),skills:sharedSkills,agents:files('.codex/agents','.toml'),hookConfig:exists('.codex/hooks.json')},
    cursor: {entry:exists('.cursor/rules/istartsoftflow.mdc'),skills:sharedSkills,agents:files('.cursor/agents','.md'),hookConfig:exists('.cursor/hooks.json')},
    claude: {entry:exists('CLAUDE.md'),skills:claudeSkills,agents:files('.claude/agents','.md'),hookConfig:exists('.claude/settings.json')},
  };
  for (const [name,host] of Object.entries(hosts)) {
    host.executable = probe(name);
    host.activation = 'not-verified';
  }
  const warnings = [];
  if (!exists('.issflow/istartsoft-flow/CORE.md')) warnings.push('Concise CORE.md is missing: install/update the kit.');
  const collisions = sharedSkills.filter(n=>claudeSkills.includes(n));
  if(collisions.length) warnings.push(`Shared and Claude skill names overlap (${collisions.join(', ')}). Cursor compatibility discovery may expose duplicates; verify in the live host.`);
  for(const [name,host] of Object.entries(hosts)) if(host.entry && !host.skills.length) warnings.push(`${name}: entry exists but no expected native skills were found.`);
  return {version:1,root,hosts,warnings,limitations:['File presence and executable version are not proof of host discovery, hook trust or enforcement.','No agent sessions, browser tests, network requests or source edits are performed.','Existing user configuration is never changed.'],next:['Start the chosen host in a disposable project and inspect discovered skills and agents.','Run an authorized tiny change, a denied-scope edit, and interrupted/resumed task.','Record exact host version and results; leave unavailable checks not-run.']};
}
if(require.main===module){try{if(process.argv.length>3)throw Error('Usage: node .issflow/scripts/doctor.js [project-root]');console.log(JSON.stringify(inspect(process.argv[2]||process.cwd()),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={inspect};
