#!/usr/bin/env node
// create-issflow — scaffold the iStartSoftFlow agentic-dev workflow into the
// current project. Pure Node, zero deps, cross-platform, NON-DESTRUCTIVE:
// never overwrites an existing file — on conflict it writes `<file>.issflow-new`.
//
// Tool-agnostic: the portable kit lives in `.claude/` and the methodology is the
// single source of truth. `--tool=<name>` writes the right adapter so the same
// kit drives Claude Code, Codex, Cursor, Gemini CLI, Aider, or any AGENTS.md tool.
'use strict';
const fs = require('fs');
const path = require('path');

const TPL = path.join(__dirname, '..', 'template');
const CWD = process.cwd();
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const FORCE = argv.includes('--force');
const HELP = argv.includes('-h') || argv.includes('--help');
const toolArg = (argv.find(a => a.startsWith('--tool=')) || '').split('=')[1];

const TOOLS = {
  claude: 'Claude Code (Anthropic) — full: subagents, lifecycle hooks, skills',
  codex:  'OpenAI Codex CLI — AGENTS.md native; subagents/skills as readable files',
  cursor: 'Cursor — .cursor/rules + commands + hooks; reads .claude/agents natively',
  gemini: 'Google Gemini CLI — GEMINI.md pointer; commands/skills as readable files',
  aider:  'Aider — .aider.conf.yml loads the methodology as conventions',
  all:    'Write every adapter above (mixed-team repo)',
};

let created = 0, skipped = 0, conflicts = 0;
const warnings = [];
const log = (...a) => console.log(...a);

// ---- helpers ----------------------------------------------------------------

function printHelp() {
  log(`create-issflow — scaffold the iStartSoftFlow workflow.

Usage: npx create-issflow [--tool=<name>] [--dry-run] [--force]

Tools (--tool=, interactive prompt if omitted):`);
  for (const [k, v] of Object.entries(TOOLS)) log(`  ${k.padEnd(7)} ${v}`);
  log(`
Flags:
  --dry-run   print what would happen, write nothing
  --force     overwrite existing kit files (default keeps yours -> <file>.issflow-new)
  -h, --help  this message

Every tool installs the portable kit in .claude/ + a root AGENTS.md (the open
standard). The full methodology lives in .claude/istartsoft-flow/METHODOLOGY.md.`);
}

// Resolve the target tool: flag -> interactive (TTY) -> default 'claude'.
function pickTool() {
  if (toolArg) {
    if (!TOOLS[toolArg]) { console.error(`create-issflow: unknown --tool=${toolArg}. One of: ${Object.keys(TOOLS).join(', ')}`); process.exit(1); }
    return toolArg;
  }
  if (process.stdin.isTTY && process.stdout.isTTY && !DRY) {
    const keys = Object.keys(TOOLS);
    process.stdout.write('\nWhich AI coding tool? (the kit is portable — pick your primary)\n');
    keys.forEach((k, i) => process.stdout.write(`  ${i + 1}) ${k} — ${TOOLS[k]}\n`));
    process.stdout.write('> ');
    let line = '';
    try { line = (fs.readFileSync(0, 'utf8').split('\n')[0] || '').trim().toLowerCase(); } catch (_) {}
    const chosen = TOOLS[line] ? line : keys[parseInt(line, 10) - 1];
    if (!chosen) { console.error('create-issflow: no valid choice; defaulting to claude.'); return 'claude'; }
    return chosen;
  }
  return 'claude'; // non-interactive default = back-compatible
}

// write a single file, non-destructive (honors DRY/FORCE).
function writeFile(rel, content, { exec = false } = {}) {
  const dest = path.join(CWD, rel);
  const exists = fs.existsSync(dest);
  if (exists && !FORCE) {
    if (fs.readFileSync(dest, 'utf8') === content) { skipped++; return; }
    const alt = dest + '.issflow-new';
    conflicts++; log(`  ~ conflict, wrote ${path.relative(CWD, alt)} (yours kept)`);
    if (!DRY) { fs.mkdirSync(path.dirname(alt), { recursive: true }); fs.writeFileSync(alt, content); }
    return;
  }
  created++; log(`  + ${rel}${exists ? ' (overwrote, --force)' : ''}`);
  if (!DRY) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
    if (exec) { try { fs.chmodSync(dest, 0o755); } catch (_) {} }
  }
}

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

function copyTemplateCommands(destDir) {
  const cmdDir = path.join(TPL, '.claude', 'commands');
  if (!fs.existsSync(cmdDir)) return;
  for (const f of fs.readdirSync(cmdDir)) writeFile(path.join(destDir, f), fs.readFileSync(path.join(cmdDir, f), 'utf8'));
}

// ---- adapters (keep the methodology single-source — these POINT at it) ------

function adapterClaude() {
  const HOOKS = {
    SessionStart: [{ matcher: 'startup|clear|compact', hooks: [{ type: 'command', command: 'node .claude/hooks/session-start.js' }] }],
    PreCompact:   [{ matcher: 'auto|manual',           hooks: [{ type: 'command', command: 'node .claude/hooks/pre-compact.js' }] }],
    SubagentStop: [{ hooks: [{ type: 'command', command: 'node .claude/hooks/subagent-stop.js' }] }],
  };
  const sp = path.join(CWD, '.claude', 'settings.json');
  let settings = {};
  if (fs.existsSync(sp)) { try { settings = JSON.parse(fs.readFileSync(sp, 'utf8')); } catch (_) { warnings.push('.claude/settings.json is not valid JSON — skipped hook merge'); settings = null; } }
  if (!settings) return;
  settings.hooks = settings.hooks || {};
  const added = [];
  for (const k of Object.keys(HOOKS)) if (!settings.hooks[k]) { settings.hooks[k] = HOOKS[k]; added.push(k); }
  if (added.length) { log(`  + .claude/settings.json hooks: ${added.join(', ')}`); if (!DRY) { fs.mkdirSync(path.dirname(sp), { recursive: true }); fs.writeFileSync(sp, JSON.stringify(settings, null, 2) + '\n'); } }
  else log('  = .claude/settings.json hooks already present');
}

function adapterCodex() {
  warnings.push('codex: AGENTS.md is read natively. Lifecycle hooks unsupported (rituals model-run); subagents in .claude/agents/ are read as reference, not isolated contexts.');
}

function adapterCursor() {
  writeFile('.cursor/rules/istartsoftflow.mdc', [
    '---', 'description: iStartSoftFlow workflow — always apply', 'alwaysApply: true', '---', '',
    'Run the **iStartSoftFlow** workflow. The full, single-source methodology is',
    '`.claude/istartsoft-flow/METHODOLOGY.md` — read it before acting. Roles live in',
    '`.claude/agents/` (Cursor reads them natively); procedures in `.cursor/commands/`',
    '(mirror of `.claude/commands/`). Caveman ULTRA mode; apply the `karpathy-guidelines`',
    'and `ux-design` skills. See `AGENTS.md` for the role/command/skill map.', '',
  ].join('\n'));
  copyTemplateCommands('.cursor/commands');
  writeFile('.cursor/hooks.json', JSON.stringify({
    version: 1,
    hooks: {
      sessionStart: [{ command: 'node .claude/hooks/session-start.js' }],
      subagentStop: [{ command: 'node .claude/hooks/subagent-stop.js' }],
    },
  }, null, 2) + '\n');
  warnings.push('cursor: PreCompact has no Cursor equivalent (snapshot ritual degrades to model-run); verify hooks.json against cursor.com/docs/hooks — the schema evolves.');
}

function adapterGemini() {
  writeFile('GEMINI.md', [
    '# GEMINI.md — iStartSoftFlow', '',
    'This repo runs the **iStartSoftFlow** agentic dev workflow. The complete,',
    'tool-agnostic methodology (the single source of truth) lives in',
    '`.claude/istartsoft-flow/METHODOLOGY.md` — read it before acting. Roles are in',
    '`.claude/agents/`, procedures in `.claude/commands/` (run their bodies as prompts),',
    'skills in `.claude/skills/` (read on demand). See `AGENTS.md` for the full map.', '',
    'Lifecycle hooks do not auto-fire in Gemini CLI — run the SESSION-OPEN ritual',
    '(git state, docs/STATE.md, docs/ISSUES.md) yourself at the start of each session.', '',
  ].join('\n'));
  warnings.push('gemini: lifecycle hooks unsupported — SESSION-OPEN / PreCompact rituals are model-run (see GEMINI.md).');
}

function adapterAider() {
  writeFile('.aider.conf.yml', [
    '# iStartSoftFlow — load the methodology as conventions.',
    '# Aider has no lifecycle hooks/subagents; the workflow degrades to model-run rituals.',
    'read:',
    '  - AGENTS.md',
    '  - .claude/istartsoft-flow/METHODOLOGY.md',
    '',
  ].join('\n'));
  warnings.push('aider: hooks + named subagents unsupported — the loop runs as a single-agent, model-driven workflow.');
}

const ADAPTERS = { claude: adapterClaude, codex: adapterCodex, cursor: adapterCursor, gemini: adapterGemini, aider: adapterAider };

const NEXT_STEPS = {
  claude: 'Open Claude Code — the SessionStart hook fires automatically. Run /overview to bootstrap.',
  codex:  'Open Codex CLI — it reads AGENTS.md. Start by running the /overview procedure (.claude/commands/overview.md).',
  cursor: 'Open Cursor — the rule applies automatically. Run the /overview command to bootstrap.',
  gemini: 'Open Gemini CLI — it reads GEMINI.md. Run the SESSION-OPEN ritual, then the overview procedure.',
  aider:  'Run aider — it loads AGENTS.md + METHODOLOGY.md. Drive the loop manually (overview -> phase).',
  all:    'Open your tool of choice — AGENTS.md is the shared entry. Run /overview to bootstrap.',
};

function agentsMd() {
  return [
    '# AGENTS.md — iStartSoftFlow', '',
    'This repo runs the **iStartSoftFlow** agentic dev workflow. The complete,',
    'tool-agnostic methodology — the loop, roles, procedures, rituals, and hard',
    'rules — lives in ONE file. Read it before acting:', '',
    '> **`.claude/istartsoft-flow/METHODOLOGY.md`** ← single source of truth.', '',
    'Do not restate its rules elsewhere; this file only indexes it (anti-drift invariant).', '',
    '## The loop', '',
    'design-research → grill ×2 → plan → implement → test → deploy — one VERTICAL',
    'SLICE per phase. Phase 0 (infra) leads only when infra is self-managed.', '',
    '## Roles — `.claude/agents/`', '',
    'planner · researcher · implementer · test-author · debugger · e2e-runner · synthesizer', '',
    '## Procedures — `.claude/commands/` (run as `/name`)', '',
    '/overview · /propose · /phase · /ui-audit · /qa-audit · /change-request · /replan ·',
    '/quick · /synthesize · /store-wisdom · /log-issue · /log-decision · /unstuck', '',
    '## Skills — `.claude/skills/` (loaded on demand)', '',
    'caveman · grill-me · karpathy-guidelines · ux-design · security (Secure SDLC) · code-standards', '',
    '## Autonomy', '',
    'Planning (`/overview` grill + plan approval) always asks — that input is cheap.',
    '**AUTO (default)** governs the DEV loop: follow the plan, decide + log + continue,',
    'do NOT stop to ask. Hard-stops only: security · irreversible/outbound actions · a',
    'contradictory spec. Blockers are parked + reported at the phase boundary, not',
    'mid-flow. **GUIDED** asks at each fork in dev too. Declare the mode in',
    '`docs/OVERVIEW.md`. See METHODOLOGY → Autonomy.', '',
    '## Hard-rule index (full text in METHODOLOGY.md)', '',
    '1 grep ISSUES + research before debugging · 2 debug cap = 3 (AUTO: park + continue) ·',
    '3 log every fix · 4 synthesize + context-reset per phase · 5 phase gate = real suite',
    'green · 6 blind tests (RED-first) · 7 programmatic E2E auth · 8 log-decision on arch',
    'change · 9 UI conforms to the `ux-design` cookbook + wireframe frame · 10 no-rationalization ·',
    '11 Secure SDLC: threat-model → secure coding → SAST/SCA/secrets each phase → pentest',
    'gate + security review before deploy (`security` skill) · 12 code-standards gate:',
    'lint/format clean + naming per language idiom + declared architecture (`code-standards`).', '',
    '## Your stack', '',
    'Declare your stack (language, framework, infra, auth, test + E2E runner,',
    'planning source) once in `docs/OVERVIEW.md`. Every rule references *your declared',
    'stack* and hardcodes none.', '',
  ].join('\n');
}

// ---- main -------------------------------------------------------------------

function main() {
  if (HELP) { printHelp(); return; }
  if (!fs.existsSync(path.join(TPL, '.claude'))) {
    console.error('create-issflow: embedded template/ missing. From source run: npm run build');
    process.exit(1);
  }

  const TOOL = pickTool();
  const targets = TOOL === 'all' ? Object.keys(TOOLS).filter(t => t !== 'all') : [TOOL];

  // 1. portable kit tree (.claude/) — every tool gets it.
  for (const src of walk(path.join(TPL, '.claude'))) {
    const rel = path.relative(TPL, src);
    writeFile(rel, fs.readFileSync(src, 'utf8'));
  }

  // 2. AGENTS.md — the open-standard entry point.
  writeFile('AGENTS.md', agentsMd());

  // 3. per-tool adapters
  for (const t of targets) ADAPTERS[t]();

  // 4. .gitignore: track the workflow dirs if .claude/* is ignored
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
  log(`iStartSoftFlow ${DRY ? '(dry-run) ' : ''}[${TOOL}] done — created ${created}, conflicts ${conflicts}, unchanged ${skipped}.`);
  if (conflicts) log('Review *.issflow-new files and merge manually (your originals were untouched).');
  for (const w of warnings) log(`  ! ${w}`);
  log(NEXT_STEPS[TOOL] || NEXT_STEPS.claude);
}

main();
