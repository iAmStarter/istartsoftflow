const fs=require('fs'),path=require('path'),os=require('os'),{spawnSync}=require('child_process');
if (!process.argv[2]) throw Error('Usage: node scripts/compare-native-installers.js <baseline-checkout> [candidate-checkout]');
const roots={baseline:path.resolve(process.argv[2]),candidate:path.resolve(process.argv[3]||path.join(__dirname,'..'))};
const count=(d,ext)=>{try{return fs.readdirSync(d,{recursive:true}).filter(p=>p.endsWith(ext)).length;}catch{return 0;}};
const results=[];
for(const [variant,root] of Object.entries(roots))for(const host of ['codex','cursor','claude']){
 const target=fs.mkdtempSync(path.join(os.tmpdir(),'issflow-comparison-'));
 fs.writeFileSync(path.join(target,'package.json'),'{"type":"module"}');
 const r=spawnSync(process.execPath,[path.join(root,'create-issflow/bin/cli.js'),`--tool=${host}`],{cwd:target,encoding:'utf8'});
 if(r.status!==0)throw Error(r.stderr);
 const core=path.join(target,'.issflow/istartsoft-flow/CORE.md');
 results.push({variant,host,installExit:r.status,sharedNativeSkills:count(path.join(target,'.agents/skills'),'SKILL.md'),codexNativeRoles:count(path.join(target,'.codex/agents'),'.toml'),cursorNativeRoles:count(path.join(target,'.cursor/agents'),'.md'),claudeNativeRoles:count(path.join(target,'.claude/agents'),'.md'),defaultCoreLines:fs.existsSync(core)?fs.readFileSync(core,'utf8').split('\n').length:null,methodologyLines:fs.readFileSync(path.join(target,'.issflow/istartsoft-flow/METHODOLOGY.md'),'utf8').split('\n').length,liveActivation:'not-tested'});
 fs.rmSync(target,{recursive:true,force:true});
}
console.log(JSON.stringify({kind:'structural-comparison-not-agent-performance',baseline:'76bc3d50d2df98e5f1edabc092833a57df94db76',results,limits:['No quality, latency, token or cost outcome is inferred from file counts.','Installer invocation is real; host discovery/execution was not verified.']},null,2));
