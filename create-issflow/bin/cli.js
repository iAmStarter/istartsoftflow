#!/usr/bin/env node
// create-issflow — scaffold the iStartSoftFlow agentic-dev workflow into the
// current project. Pure Node, zero deps, cross-platform, NON-DESTRUCTIVE:
// never overwrites an existing file — on conflict it writes `<file>.issflow-new`.
//
// Tool-agnostic: the portable kit lives in `.issflow/` and the methodology is the
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
const CI = argv.includes('--ci');
const DOCKER = argv.includes('--docker');
const HELP = argv.includes('-h') || argv.includes('--help');
const toolArg = (argv.find(a => a.startsWith('--tool=')) || '').split('=')[1];

const TOOLS = {
  claude: 'Claude Code (Anthropic) — full: subagents, lifecycle hooks, skills',
  codex:  'OpenAI Codex — AGENTS.md; use native tools only when available',
  cursor: 'Cursor — .cursor/rules + commands + hooks; kit stays in .issflow/ (no .claude/)',
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

Tools (--tool=). Omit --tool to install EVERY adapter (same as --tool=all):`);
  for (const [k, v] of Object.entries(TOOLS)) log(`  ${k.padEnd(7)} ${v}`);
  log(`
Flags:
  --ci        also write .github/workflows/issflow-feature.yml (headless /feature via GitHub Actions)
  --docker    also write Dockerfile.issflow + scripts/feature-docker.js (headless /feature in a container)
  --dry-run   print what would happen, write nothing
  --force     overwrite existing kit files (default keeps yours -> <file>.issflow-new)
  -h, --help  this message

Every tool installs the portable kit in .issflow/ + a root AGENTS.md (open
standard). Methodology: .issflow/istartsoft-flow/METHODOLOGY.md.
Claude Code ONLY (--tool=claude|all) also gets a .claude/ mirror + CLAUDE.md
shim — other tools do not create .claude/.`);
}

// Typo / alias map → canonical TOOLS key
const TOOL_ALIASES = { cusor: 'cursor' };

// Resolve the target tool: --tool= flag → default 'all' when omitted.
function pickTool() {
  if (toolArg) {
    const key = TOOL_ALIASES[toolArg] || toolArg;
    if (!TOOLS[key]) { console.error(`create-issflow: unknown --tool=${toolArg}. One of: ${Object.keys(TOOLS).join(', ')}`); process.exit(1); }
    return key;
  }
  return 'all'; // omit --tool = every adapter
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
  const cmdDir = path.join(TPL, '.issflow', 'commands');
  if (!fs.existsSync(cmdDir)) return;
  for (const f of fs.readdirSync(cmdDir)) writeFile(path.join(destDir, f), fs.readFileSync(path.join(cmdDir, f), 'utf8'));
}

/** Claude Code loads commands/agents/skills from `.claude/`. Mirror the
 *  portable `.issflow/` kit there (Claude adapter only — Cursor never gets this). */
function materializeClaudeMirror() {
  const kitTpl = path.join(TPL, '.issflow');
  for (const src of walk(kitTpl)) {
    const rel = path.relative(kitTpl, src);
    writeFile(path.join('.claude', rel), fs.readFileSync(src, 'utf8'));
  }
}

// ---- adapters (keep the methodology single-source — these POINT at it) ------

function adapterClaude() {
  // Claude Code: needs CLAUDE.md auto-load + native `.claude/` tree for
  // commands/agents/skills discovery. Portable SoT remains `.issflow/`;
  // hooks execute from `.issflow/` (single source).
  const c0 = conflicts;
  writeFile('CLAUDE.md', claudeMd());
  if (conflicts > c0) warnings.push('claude: you already keep a CLAUDE.md — ours was written as CLAUDE.md.issflow-new. Add a line `@AGENTS.md` to your CLAUDE.md so the methodology auto-loads.');
  materializeClaudeMirror();
  const HOOKS = {
    SessionStart: [{ matcher: 'startup|resume|clear|compact', hooks: [{ type: 'command', command: 'node .issflow/hooks/session-start.js' }] }],
    PreToolUse:   [{ matcher: '*',                     hooks: [{ type: 'command', command: 'node .issflow/hooks/context-guard.js' }] },
                   { matcher: 'Edit|Write|MultiEdit|NotebookEdit', hooks: [{ type: 'command', command: 'node .issflow/hooks/plan-gate.js' }] }],
    PreCompact:   [{ matcher: 'auto|manual',           hooks: [{ type: 'command', command: 'node .issflow/hooks/pre-compact.js' }] }],
    SubagentStop: [{ hooks: [{ type: 'command', command: 'node .issflow/hooks/subagent-stop.js' }] }],
    Stop:         [{ hooks: [{ type: 'command', command: 'node .issflow/hooks/feature-gate.js' }] }],
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
  warnings.push('claude: portable SoT is .issflow/ — .claude/ is a host mirror; refresh with create-issflow --tool=claude after kit edits.');
}

function adapterCodex() {
  warnings.push('codex: this installer configures AGENTS.md, not lifecycle hooks or subagent registration. Detect native delegation in the current host; otherwise run roles serially. Run checkpoint and verification commands explicitly.');
}

function adapterCursor() {
  writeFile('.cursor/rules/istartsoftflow.mdc', [
    '---', 'description: iStartSoftFlow workflow — always apply', 'alwaysApply: true', '---', '',
    'Run the **iStartSoftFlow** workflow. The full, single-source methodology is',
    '`.issflow/istartsoft-flow/METHODOLOGY.md` — read it before acting. Roles live in',
    '`.issflow/agents/` (role references, not registered native agents); procedures in `.cursor/commands/`',
    '(mirror of `.issflow/commands/`). Caveman ULTRA mode; apply the `karpathy-guidelines`',
    'and `ux-design` skills. See `AGENTS.md` for the role/command/skill map.', '',
  ].join('\n'));
  writeFile('.cursor/rules/issflow-gates.mdc', [
    '---', 'description: iStartSoftFlow gates — STATE delivery + plan lock', 'alwaysApply: true', '---', '',
    'Before any source Edit/Write:',
    '1. Read `docs/STATE.md` — respect `delivery:` (ETA · WAITING · SLIP · DONE).',
    '2. If PLAN approval is PENDING → do not edit source (rule 13).',
    '3. Past `agent_eta` while AGENT_ACTIVE → report SLIP; do not silent-continue.',
    '4. WAITING_ON_HUMAN / WAITING_STALE → do not pretend the agent is still building.',
    '5. UI work: locked `design-direction` / `docs/design/tokens.css` — no freehand palette.',
    '6. Near context gate → checkpoint with `/synthesize` (keep delivery:); use only reset capabilities the host exposes.',
    '',
    'Talk to the human as PM/SA. Subagents never address the user.',
    '',
  ].join('\n'));
  copyTemplateCommands('.cursor/commands');
  writeFile('.cursor/hooks.json', JSON.stringify({
    version: 1,
    hooks: {
      sessionStart: [{ command: 'node .issflow/hooks/session-start.js' }],
      subagentStop: [{ command: 'node .issflow/hooks/subagent-stop.js' }],
    },
  }, null, 2) + '\n');
  warnings.push('cursor: only sessionStart and subagentStop hooks are configured here; no edit/stop approval enforcement. Verify host hook support. Run checkpoint and verification commands explicitly; role files do not register subagents.');
}

function adapterGemini() {
  writeFile('GEMINI.md', [
    '# GEMINI.md — iStartSoftFlow', '',
    'This repo runs the **iStartSoftFlow** agentic dev workflow. The complete,',
    'tool-agnostic methodology (the single source of truth) lives in',
    '`.issflow/istartsoft-flow/METHODOLOGY.md` — read it before acting. Roles are in',
    '`.issflow/agents/`, procedures in `.issflow/commands/` (run their bodies as prompts),',
    'skills in `.issflow/skills/` (read on demand). See `AGENTS.md` for the full map.', '',
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
    '  - .issflow/istartsoft-flow/METHODOLOGY.md',
    '',
  ].join('\n'));
  warnings.push('aider: hooks + named subagents unsupported — the loop runs as a single-agent, model-driven workflow.');
}

const ADAPTERS = { claude: adapterClaude, codex: adapterCodex, cursor: adapterCursor, gemini: adapterGemini, aider: adapterAider };

const NEXT_STEPS = {
  claude: 'Open Claude Code — CLAUDE.md (@AGENTS.md) loads the methodology and the SessionStart hook fires automatically. Run /overview to bootstrap.',
  codex:  'Open Codex CLI — it reads AGENTS.md. Start by running the /overview procedure (.issflow/commands/overview.md).',
  cursor: 'Open Cursor — the rule applies automatically. Run the /overview command to bootstrap.',
  gemini: 'Open Gemini CLI — it reads GEMINI.md. Run the SESSION-OPEN ritual, then the overview procedure.',
  aider:  'Run aider — it loads AGENTS.md + METHODOLOGY.md. Drive the loop manually (overview -> phase).',
  all:    'Open your tool of choice — AGENTS.md is the shared entry. Run /overview to bootstrap.',
};

function agentsMd() {
  return [
    '# AGENTS.md — iStartSoftFlow', '',
    'This repo runs the **iStartSoftFlow** agentic dev workflow.', '',
    '**Primary entry (this file).** The complete, tool-agnostic methodology — loop,',
    'roles, procedures, rituals, hard rules — lives in ONE place. Read before acting:', '',
    '> **`.issflow/istartsoft-flow/METHODOLOGY.md`** ← single source of truth.', '',
    'The portable kit lives in **`.issflow/`** (commands, agents, hooks, skills,',
    'methodology — see `.issflow/README.md`). Host adapters (`.cursor/`, `CLAUDE.md`,',
    '…) point at it. Do not restate METHODOLOGY rules elsewhere (anti-drift).', '',
    '## The loop', '',
    'design-research → grill ×2 → plan → (propose/design if quoted) → implement →',
    'test → deploy — one VERTICAL SLICE per phase. Phase 0 (infra) only when',
    'infra is self-managed.', '',
    '## Roles — `.issflow/agents/`', '',
    'planner · researcher · implementer · test-author · debugger · e2e-runner · synthesizer', '',
    '## Procedures — `.issflow/commands/` (run as `/name`)', '',
    '**Default:** `/overview` · `/feature` · `/quick`', '',
    '**Advanced:** `/propose` · `/design` · `/support` · `/phase` · `/sprint` · `/goal` ·',
    '`/ui-audit` · `/redesign` · `/qa-audit` · `/security-audit` · `/release` · `/uat` ·',
    '`/change-request` · `/replan` · `/synthesize` · `/runbook` · `/store-wisdom` ·',
    '`/log-issue` · `/log-decision` · `/unstuck`', '',
    '## Skills — `.issflow/skills/` (loaded on demand)', '',
    'caveman · grill-me · karpathy-guidelines · ux-design · ui-ux-pro-max · security ·',
    'code-standards · support-triage', '',
    '## Autonomy', '',
    'Use existing approval for the same scope; ask only for missing approval or material changes.',
    '**AUTO (default)** governs the DEV loop: follow the plan, decide + log + continue,',
    'do NOT stop to ask. Hard-stops only: security · irreversible/outbound actions · a',
    'contradictory spec. Blockers are parked + reported at the phase boundary, not',
    'mid-flow. **GUIDED** asks at each fork in dev too. Declare the mode in',
    '`docs/OVERVIEW.md`. See METHODOLOGY → Autonomy.',
    'Optional durable task state: `.issflow/runtime/workflow.js` (see `.issflow/runtime/README.md`).',
    'This local state helper does not execute agents or schedule future sessions.', '',
    '## Hard-rule index (full text in METHODOLOGY.md)', '',
    '1–12 as in METHODOLOGY · 13 PLAN-APPROVAL · 14 UNDERSTAND-FIRST ·',
    '15 DESIGN + ARCHITECTURE gates (after proposal, before `/phase`; internal may n/a).', '',
    '## Host capability', '',
    'See `.issflow/runtime/HOSTS.md` for actual adapter enforcement and fallbacks.',
    'Cursor gate rules are model-run guidance, not lifecycle enforcement.',
    'Model guidance: `.issflow/models/MODEL-MATRIX.md`; delivery ETA: `docs/STATE.md`.', '',
    '## Your stack', '',
    'Declare your stack (language, framework, infra, auth, test + E2E runner,',
    'planning source) once in `docs/OVERVIEW.md`. Every rule references *your declared',
    'stack* and hardcodes none.', '',
  ].join('\n');
}

function claudeMd() {
  return [
    '# CLAUDE.md — host shim for Claude Code', '',
    '@AGENTS.md', '',
    'Claude Code auto-loads **this filename only**. The import above is the real',
    'entry (`AGENTS.md` → METHODOLOGY). Do NOT restate rules here.', '',
    '## Host wiring', '',
    '- **`.claude/`** is a mirror of `.issflow/` for command/agent/skill discovery.',
    '- **Hooks** run from `.issflow/hooks/` (see `.claude/settings.json`).',
    '- **SessionStart** injects git state + `docs/STATE.md` + open `docs/ISSUES.md`.',
    '- **PreCompact** + **SubagentStop** rituals run automatically.',
    '- Edit the kit in `.issflow/`, then re-run `create-issflow --tool=claude` to refresh the mirror.', '',
  ].join('\n');
}

function flowConfig() {
  return JSON.stringify({
    context: {
      window: 0,
      warnPct: 55,
      gatePct: 70,
      injectMaxLines: 25,
      _note: 'Context-budget watchdog (.issflow/hooks/context-guard.js, PreToolUse hook). '
        + 'window 0 = auto-detect from the model id (200000 for standard models). '
        + 'warnPct soft nudge; gatePct hard block on NEW source Edit/Write. Prefer '
        + '/synthesize + /clear (keep delivery:) over compact near gate. Checkpoint '
        + 'docs/** never gated.',
    },
    delivery: {
      staleAfterHours: 24,
      phaseHours: { S: 2, M: 4, L: 8, XL: 16 },
      assumptionBudgetPerPhase: 3,
      _note: 'Agent-active ETA uses phaseHours by size. Waiting-on-human pauses ETA; '
        + 'after staleAfterHours → WAITING_STALE.',
    },
    sprint: {
      defaultCapacity: 8,
      _note: 'Sprint layer (/sprint). defaultCapacity = points for first sprint.',
    },
  }, null, 2) + '\n';
}

// ---- main -------------------------------------------------------------------

function main() {
  if (HELP) { printHelp(); return; }
  if (!fs.existsSync(path.join(TPL, '.issflow'))) {
    console.error('create-issflow: embedded template/ missing. From source run: npm run build');
    process.exit(1);
  }

  const TOOL = pickTool();
  const targets = TOOL === 'all' ? Object.keys(TOOLS).filter(t => t !== 'all') : [TOOL];

  // 1. portable kit tree (.issflow/) ��� every tool gets it.
  for (const src of walk(path.join(TPL, '.issflow'))) {
    const rel = path.relative(TPL, src);
    writeFile(rel, fs.readFileSync(src, 'utf8'));
  }

  // 1b. integrity: confirm the methodology resolved on disk (load-bearing sentinel).
  const methPath = path.join(CWD, '.issflow', 'istartsoft-flow', 'METHODOLOGY.md');
  const SENTINEL = 'ISTARTSOFTFLOW-AGENTS-SENTINEL-v2.0';
  if (!DRY && (!fs.existsSync(methPath) || !fs.readFileSync(methPath, 'utf8').includes(SENTINEL))) {
    warnings.push(`integrity: ${SENTINEL} not found in installed METHODOLOGY.md — the kit may be incomplete; re-run create-issflow (or npm run build from source).`);
  }

  // 2. AGENTS.md — the open-standard entry point.
  writeFile('AGENTS.md', agentsMd());

  // 3. per-tool adapters
  for (const t of targets) ADAPTERS[t]();

  // 3b. headless feature lane (opt-in): materialize the automation templates.
  const autoDir = path.join(TPL, '.issflow', 'templates', 'automation');
  if (CI) {
    writeFile(path.join('.github', 'workflows', 'issflow-feature.yml'), fs.readFileSync(path.join(autoDir, 'issflow-feature.yml'), 'utf8'));
    writeFile(path.join('.github', 'workflows', 'issflow-goal.yml'), fs.readFileSync(path.join(autoDir, 'issflow-goal.yml'), 'utf8'));
  }
  if (DOCKER) {
    writeFile('Dockerfile.issflow', fs.readFileSync(path.join(autoDir, 'Dockerfile'), 'utf8'));
    writeFile(path.join('scripts', 'feature-docker.js'), fs.readFileSync(path.join(autoDir, 'feature-docker.js'), 'utf8'), { exec: true });
  }

  // 4. .gitignore: track the workflow dirs if .issflow/* is ignored
  const gi = path.join(CWD, '.gitignore');
  if (fs.existsSync(gi)) {
    const txt = fs.readFileSync(gi, 'utf8');
    if (/^\.issflow\/\*\s*$/m.test(txt)) {
      const tracked = ['agents', 'commands', 'skills', 'hooks', 'runtime', 'routing', 'models', 'scripts', 'templates', 'istartsoft-flow'];
      const lines = new Set(txt.split(/\r?\n/).map(line => line.trim()));
      const missing = tracked.map(dir => `!.issflow/${dir}/`).filter(line => !lines.has(line));
      if (missing.length) {
        const block = '\n# iStartSoftFlow workflow — track as project config\n' + missing.join('\n') + '\n';
        log('  + .gitignore: un-ignore missing .issflow workflow dirs');
        if (!DRY) fs.appendFileSync(gi, block);
      }
    }
  }

  log('');
  log(`iStartSoftFlow ${DRY ? '(dry-run) ' : ''}[${TOOL}] done — created ${created}, conflicts ${conflicts}, unchanged ${skipped}.`);
  if (conflicts) log('Review *.issflow-new files and merge manually (your originals were untouched).');
  for (const w of warnings) log(`  ! ${w}`);
  log(NEXT_STEPS[TOOL] || NEXT_STEPS.claude);
  if (!CI && !DOCKER) log('Headless feature lane: re-run with --ci (GitHub Action) and/or --docker (container runner).');
  log('New to the kit? Plain-language guide (EN/TH): https://iamstarter.github.io/istartsoftflow/how-to-use.html');
}

main();
