#!/usr/bin/env node
// create-issflow — scaffold the iStartSoftFlow workflow (Claude Code only)
// into the current project. Pure Node, cross-platform, NON-DESTRUCTIVE:
// never overwrites an existing file — on conflict it writes `<file>.issflow-new`.
'use strict';
const fs = require('fs');
const path = require('path');

const TPL = path.join(__dirname, '..', 'template');
const CWD = process.cwd();
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const FORCE = argv.includes('--force');

// Hook wiring merged into .claude/settings.json (repo-relative commands).
const HOOKS = {
  SessionStart: [{ matcher: 'startup|clear|compact', hooks: [{ type: 'command', command: 'bash .claude/hooks/session-start.sh' }] }],
  PreCompact:   [{ matcher: 'auto|manual',           hooks: [{ type: 'command', command: 'bash .claude/hooks/pre-compact.sh' }] }],
  SubagentStop: [{ hooks: [{ type: 'command', command: 'bash .claude/hooks/subagent-stop.sh' }] }],
};

if (!fs.existsSync(path.join(TPL, '.claude'))) {
  console.error('create-issflow: embedded template/ missing. From source run: bash build.sh');
  process.exit(1);
}

const log = (...a) => console.log(...a);
let created = 0, skipped = 0, conflicts = 0;

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// 1. copy template tree (non-destructive)
for (const src of walk(path.join(TPL, '.claude'))) {
  const rel = path.relative(TPL, src);            // e.g. .claude/agents/planner.md
  const dest = path.join(CWD, rel);
  const isHook = rel.includes(`${path.sep}hooks${path.sep}`) && rel.endsWith('.sh');
  const exists = fs.existsSync(dest);
  if (exists && !FORCE) {
    const same = fs.readFileSync(src, 'utf8') === fs.readFileSync(dest, 'utf8');
    if (same) { skipped++; continue; }
    const alt = dest + '.issflow-new';
    conflicts++;
    log(`  ~ conflict, wrote ${path.relative(CWD, alt)} (yours kept)`);
    if (!DRY) { fs.mkdirSync(path.dirname(alt), { recursive: true }); fs.copyFileSync(src, alt); }
    continue;
  }
  created++;
  log(`  + ${rel}${exists ? ' (overwrote, --force)' : ''}`);
  if (!DRY) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    if (isHook) { try { fs.chmodSync(dest, 0o755); } catch (_) {} }
  }
}

// 2. merge settings.json (preserve existing hooks; add ours only if absent)
const sp = path.join(CWD, '.claude', 'settings.json');
let settings = {};
if (fs.existsSync(sp)) { try { settings = JSON.parse(fs.readFileSync(sp, 'utf8')); } catch (_) { console.error('  ! .claude/settings.json is not valid JSON — skipping hook merge'); settings = null; } }
if (settings) {
  settings.hooks = settings.hooks || {};
  const added = [];
  for (const k of Object.keys(HOOKS)) {
    if (!settings.hooks[k]) { settings.hooks[k] = HOOKS[k]; added.push(k); }
  }
  if (added.length) {
    log(`  + .claude/settings.json hooks: ${added.join(', ')}`);
    if (!DRY) { fs.mkdirSync(path.dirname(sp), { recursive: true }); fs.writeFileSync(sp, JSON.stringify(settings, null, 2) + '\n'); }
  } else {
    log('  = .claude/settings.json hooks already present');
  }
}

// 3. ensure .gitignore tracks the workflow dirs if .claude/* is ignored
const gi = path.join(CWD, '.gitignore');
if (fs.existsSync(gi)) {
  const txt = fs.readFileSync(gi, 'utf8');
  if (/^\.claude\/\*\s*$/m.test(txt) && !txt.includes('!.claude/agents/')) {
    const block = '\n# iStartSoftFlow workflow — track as project config\n!.claude/agents/\n!.claude/commands/\n!.claude/skills/\n!.claude/hooks/\n!.claude/istartsoft-flow/\n';
    log('  + .gitignore: un-ignore .claude workflow dirs');
    if (!DRY) fs.appendFileSync(gi, block);
  }
}

log('');
log(`iStartSoftFlow ${DRY ? '(dry-run) ' : ''}done — created ${created}, conflicts ${conflicts}, unchanged ${skipped}.`);
if (conflicts) log('Review *.issflow-new files and merge manually (your originals were untouched).');
log('Open Claude Code — the SessionStart hook fires automatically. Run /overview to bootstrap.');
