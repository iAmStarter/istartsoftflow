#!/usr/bin/env node
// SessionStart — Tier A inject (~lean). stdout → agent context.
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

let cfg = {};
try { cfg = JSON.parse(read('.issflow/flow-config.json') || '{}'); } catch (_) {}
const maxStateLines = (cfg.context && cfg.context.injectMaxLines) || 25;
const staleHours = (cfg.delivery && cfg.delivery.staleAfterHours) || 24;

// Resume/compact: keep inject tiny (Pattern 1 — skip heavy bodies)
let source = 'startup';
try {
  const raw = fs.readFileSync(0, 'utf8');
  if (raw) {
    const j = JSON.parse(raw);
    source = j.source || j.hook_event_name || source;
  }
} catch (_) {}
const leanResume = /resume|compact/i.test(String(source));

emit('=== iStartSoftFlow Tier-A (session) ===');
emit('source: ' + source);
emit('git: ' + (sh('git branch --show-current').trim() || 'n/a') +
  ' · dirty ' + sh('git status --short').split('\n').filter((l) => l.trim()).length);
emit('');

const state = read('docs/STATE.md');
if (!state) {
  emit('STATE.md missing → /overview');
} else {
  emit('## STATE (read first)');
  const lines = state.replace(/\n$/, '').split('\n');
  for (const l of lines.slice(0, maxStateLines)) emit(l);
  if (lines.length > maxStateLines) emit(`… (+${lines.length - maxStateLines} more)`);

  // Delivery / WAITING_STALE nudge
  const waitSince = (state.match(/waiting_since:\s*(\S+)/) || [])[1];
  const status = (state.match(/^\s*status:\s*(\S+)/m) || [])[1] || '';
  const waitingFor = (state.match(/waiting_for:\s*(.+)/) || [])[1];
  const nextHuman = (state.match(/next_human_action:\s*(.+)/) || [])[1];
  const agentEta = (state.match(/agent_eta:\s*(\S+)/) || [])[1];
  if (agentEta && agentEta !== 'none') emit('delivery.agent_eta: ' + agentEta + ' · status: ' + status);
  if (/WAITING/i.test(status) || (waitingFor && waitingFor.trim() !== 'none')) {
    emit('WAITING_ON_HUMAN: ' + (waitingFor || status).trim());
    if (nextHuman) emit('next_human_action: ' + nextHuman.trim());
    if (waitSince && waitSince !== 'none') {
      const since = Date.parse(waitSince);
      if (!Number.isNaN(since)) {
        const hours = (Date.now() - since) / 3600000;
        if (hours >= staleHours) emit('WAITING_STALE: human gate older than ' + staleHours + 'h — AI clock paused; not an agent hang.');
      }
    }
  }
}
emit('');

if (!leanResume) {
  const issues = read('docs/ISSUES.md');
  let openCount = 0;
  if (issues) {
    const blocks = [];
    let cur = null;
    for (const l of issues.split('\n')) {
      if (/^### /.test(l)) { if (cur) blocks.push(cur); cur = [l]; }
      else if (cur) cur.push(l);
    }
    if (cur) blocks.push(cur);
    openCount = blocks.filter((b) => b.some((l) => /- \[ \]/.test(l))).length;
  }
  emit('open issues: ' + openCount + ' (grep docs/ISSUES.md — bodies not injected)');
  emit('');
}

emit('## RULES');
emit('- PM-mode: report ETA/stage/DONE|BLOCKED|WAITING|SLIP|HANDOFF — do not pair as junior dev.');
emit('- Plan PENDING → no source edits (rule 13). Design-direction locked before UI propose.');
emit('- Past agent_eta while AGENT_ACTIVE → SLIP report. Waiting human → eta_paused.');
emit('- Assumption budget per phase (flow-config). End phase: /synthesize (keep delivery:) → /clear.');
emit('- Prefer clear+handoff over compact near context gate.');
emit('=== END Tier-A ===');

process.stdout.write(out.join('\n') + '\n');
