'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('landing page exposes every shipped command and accurate skill count',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const commands=fs.readdirSync(path.join(root,'.issflow/commands')).filter(f=>f.endsWith('.md'));
 assert.ok(html.includes(`${commands.length} commands`));
 for(const command of commands)assert.ok(html.includes('/'+command.slice(0,-3)),command);
 const skills=fs.readdirSync(path.join(root,'.issflow/skills')).filter(f=>fs.existsSync(path.join(root,'.issflow/skills',f,'SKILL.md')));
 assert.ok(html.includes(`${skills.length} skills`));
 assert.match(html,/does not include an autonomous browser/);
 assert.match(html,/does not authenticate screenshots or certify usability or accessibility/);
});
