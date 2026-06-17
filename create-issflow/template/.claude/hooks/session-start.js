#!/usr/bin/env node
// SessionStart hook. stdout is injected into the agent's context every session.
// Pure Node, cross-platform (macOS / Windows / Linux) — no bash/jq/python needed.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

try { process.chdir(process.env.CLAUDE_PROJECT_DIR || '.'); } catch (_) {}

const out = [];
const emit = (s = '') => out.push(s);
const read = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch (_) { return null; } };
const exists = (f) => fs.existsSync(f);
const sh = (cmd) => { try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (_) { return ''; } };

emit('=== iStartSoftFlow AUTO-CONTEXT (injected by hook, NOT optional) ===');
emit('');

// 1. git state
emit('## Git');
emit('branch: ' + (sh('git branch --show-current').trim() || 'n/a'));
const uncommitted = sh('git status --short').split('\n').filter((l) => l.trim() !== '').length;
emit('uncommitted: ' + uncommitted + ' file(s)');
for (const l of sh('git log --oneline -3').replace(/\n+$/, '').split('\n').filter(Boolean)) emit('  ' + l);
emit('');

// 2. active state
const state = read('docs/STATE.md');
if (state !== null) {
  emit('## STATE.md (current position - READ THIS FIRST)');
  emit(state.replace(/\n$/, ''));
  emit('');
} else {
  emit('## STATE.md missing -> run /overview to bootstrap the project.');
  emit('');
}

// 3. issue log
const issues = read('docs/ISSUES.md');
if (issues !== null) {
  const open = (issues.match(/^- \[ \]/gm) || []).length;
  emit(`## ISSUES.md (${open} open) - check this before debugging anything`);
  let p = false; const picked = [];
  for (const l of issues.split('\n')) { if (/^### /.test(l)) p = true; if (p) picked.push(l); }
  for (const l of picked.slice(0, 100)) emit(l);
  emit('');
}

// 3b. research index
const idx = read('docs/research/INDEX.md');
if (idx !== null) {
  const rows = idx.split('\n').filter((l) => /^[0-9]/.test(l));
  emit(`## research/INDEX.md (${rows.length} prior investigations)`);
  emit('grep this before any new research or debugging.');
  for (const l of rows.slice(-15)) emit('  ' + l);
  emit('');
}

// 3d. shared KB — pull latest + load snapshot
const KB_CONFIG = '.claude/kb-config.json';
let kbActive = false;
if (exists(KB_CONFIG)) {
  let cfg = {}; try { cfg = JSON.parse(read(KB_CONFIG) || '{}'); } catch (_) {}
  let kbPath = cfg.kb_path || '';
  if (kbPath.startsWith('~')) kbPath = path.join(os.homedir(), kbPath.slice(1));
  if (kbPath && exists(kbPath) && fs.statSync(kbPath).isDirectory()) {
    emit('## Shared KB');
    let pulled = true;
    try { execSync(`git -C "${kbPath}" pull --ff-only --quiet`, { stdio: 'ignore' }); } catch (_) { pulled = false; }
    emit(pulled ? 'KB pulled: OK' : 'KB pull skipped (offline or conflict — using local copy)');

    const cut = new Date(); cut.setMonth(cut.getMonth() - 6);
    const cutoff = cut.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const kbIndex = path.join(kbPath, 'INDEX.md');
    if (exists(kbIndex)) {
      const lines = (read(kbIndex) || '').split('\n').filter((l) => l && !l.startsWith('#'));
      const snap = [`# KB snapshot — loaded ${today}`, `# Stale = created date older than ${cutoff}`, ''];
      let stale = 0, total = 0;
      for (const line of lines) {
        if (line.includes('|')) total++;
        const entryDate = (line.split('|')[0] || '').trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(entryDate) && entryDate < cutoff) { snap.push('[STALE] ' + line); stale++; }
        else snap.push(line);
      }
      try { fs.mkdirSync('docs', { recursive: true }); fs.writeFileSync('docs/.kb-snapshot.md', snap.join('\n') + '\n'); } catch (_) {}
      emit(`KB snapshot loaded: ${total} entries (${stale} stale — researcher will re-research these)`);
      emit('Snapshot at docs/.kb-snapshot.md — researcher reads this before web search.');
    } else {
      emit(`KB INDEX.md not found at ${kbPath} — run /store-wisdom to populate it.`);
    }
    emit('');
    kbActive = true;
  } else {
    emit('## Shared KB: configured but path not found (' + (cfg.kb_path || '') + ')');
    emit('Fix kb_path in .claude/kb-config.json (or re-run: npx create-issflow).');
    emit('');
  }
}

// 4. hard rule reminder
emit('## RULES (enforced this session)');
emit('- caveman ULTRA mode is active.');
emit('- before debugging ANY error: grep ISSUES.md AND research/INDEX.md first.');
emit('- debug attempts: WARN at 2; first hard-stop at 3 STOPS and asks you.');
emit('- end of every phase: run /synthesize, then /clear.');
emit('- small obvious change? use /quick, not /phase.');
if (kbActive) {
  emit('- KB active: researcher checks docs/.kb-snapshot.md before web search.');
  emit('- learned something worth keeping? run /store-wisdom.');
}
emit('=== END AUTO-CONTEXT ===');

process.stdout.write(out.join('\n') + '\n');
