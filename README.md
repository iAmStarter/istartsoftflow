# iStartSoftFlow

A reusable, hook-enforced AI-coding workflow. Codifies a
`design-research → grill → plan → implement → test → deploy` loop with
vertical-slice phases, agent orchestration, and automatic context hygiene — so the
workflow runs itself instead of being hand-steered every session.

**Cross-platform (macOS · Windows · Linux), stack-agnostic and tool-agnostic.**
The installer, the build, and the lifecycle hooks are all pure Node — no
bash/jq/python — so it runs the same everywhere. It pins a *process*, not a *stack*: declare
your stack (language, framework, infra, auth, test + E2E runner, planning source)
once in `docs/OVERVIEW.md` and every rule references *your* stack. If infra is
managed (a PaaS + a managed datastore), Phase 0 (infra) is N/A and phases begin at
the first vertical slice; otherwise Phase 0 provisions it first.

## Install into a project

```bash
cd my-project
npx create-issflow                  # non-destructive: never clobbers your files
#   ↳ prompts for your AI tool, or pass it directly:
npx create-issflow --tool=claude    # claude | codex | cursor | gemini | aider | all
# then open your tool — Claude Code fires the SessionStart hook automatically
/overview                           # bootstrap the project
```

Flags: `--tool=<name>` (skip the prompt) · `--ci` (headless feature lane via GitHub
Actions) · `--docker` (headless feature lane in a container) · `--dry-run` (write
nothing) · `--force` (overwrite kit files; default keeps yours and writes conflicts
as `<file>.issflow-new`).

## Supported tools

One source of truth (`.claude/` + `AGENTS.md`); the installer writes the right
adapter per tool. Claude Code only auto-loads `CLAUDE.md`, so the installer writes
a one-line `CLAUDE.md` that imports `AGENTS.md` (`@AGENTS.md`) — full methodology,
still one source. Unsupported features degrade to model-run rituals — they never
silently vanish.

| Tool | Entry | Commands | Subagents | Lifecycle hooks |
|------|-------|----------|-----------|-----------------|
| **Claude Code** (reference) | `CLAUDE.md` (`@AGENTS.md`) + `.claude/` | `.claude/commands/` | native | SessionStart · PreToolUse · PreCompact · SubagentStop · Stop |
| **Codex CLI** | `AGENTS.md` (native) | read as prompts | reference | model-run |
| **Cursor** | `.cursor/rules/` + `AGENTS.md` | `.cursor/commands/` | reads `.claude/agents/` | `.cursor/hooks.json` |
| **Gemini CLI** | `GEMINI.md` + `AGENTS.md` | read as prompts | reference | model-run |
| **Aider** | `.aider.conf.yml` → `AGENTS.md` | reference | model-run | model-run |
| **Any AGENTS.md tool** | `AGENTS.md` | reference | model-run | model-run |

## What you get (in `<project>/.claude/`)

| Group | Items |
|-------|-------|
| **agents** | planner · researcher · implementer · test-author · debugger · e2e-runner · synthesizer |
| **commands** | `/overview` `/feature` `/goal` `/propose` `/phase` `/sprint` `/ui-audit` `/qa-audit` `/security-audit` `/release` `/uat` `/change-request` `/replan` `/quick` `/synthesize` `/runbook` `/store-wisdom` `/log-issue` `/log-decision` `/unstuck` |
| **skills** | caveman · grill-me · karpathy-guidelines · **ux-design** · **security** (Secure SDLC) · **code-standards** (naming-per-language + architecture) — authored to Anthropic's *Complete Guide to Building Skills* (kebab-case names, `what + when-to-use` descriptions, `references/` progressive disclosure) |
| **hooks** | session-start · context-guard (token-budget watchdog) · plan-gate (rule-13 PLAN-approval enforcement) · pre-compact · subagent-stop · feature-gate (Stop gate for `/feature`, artifact-verified) (Node scripts, wired per tool) |
| **methodology** | `.claude/istartsoft-flow/METHODOLOGY.md` (single source of truth) |

## Core idea

Mandatory steps live in **hooks** (deterministic, cannot be skipped). Thinking
steps live in **subagents + skills** (the model reasons). Putting "read the issue
log" in a hook is why it stops getting skipped. Where a host has no hooks, the
model performs the same ritual by hand.

## The loop

`design-research → grill → plan → implement → test → deploy`, one vertical slice
per phase. Implement AND test a phase before the next; the last phase includes
deployment. Planning source of truth stays in your PRD / architecture / stories
(e.g. BMAD / iSSM); iStartSoftFlow is the execution loop layered on top.

## Sprint layer (optional Scrum wrapper)

Between the PLAN (the product backlog) and the PHASE (the build loop) sits an
optional sprint layer (`/sprint`): consecutive phases are grouped behind one sprint
goal and ship one demoable increment, wrapped in the full ceremony set — planning →
standups → review/demo → retrospective — with burndown + velocity. The hierarchy is
**PLAN → SPRINT → PHASE**; phases run unchanged inside a sprint.

It is **AUTO-facilitated**: sprint planning only slices the *already-approved* PLAN
(the requirements gate happened at `/overview`), so `/sprint run` drives a whole
sprint — or every remaining sprint — hands-off (plan → loop `/phase` → a standup tick
per phase close → review + boundary audits → retro → close → next sprint), pausing
only at the real hard-stops (prod deploy, security-sensitive change, contradictory
spec). The "daily" standup is rebound to a per-phase-close tick — the AI dev loop has
no calendar days, so the phase boundary is the real unit of progress. Skip the layer
and drive phases straight off the PLAN exactly as before; it's opt-in.

## Feature lane (near-100% hands-off — `/feature`)

The brownfield lane: one APPROVED Feature doc in, a tested + hardened + documented
feature branch out. Pipeline: spec completion → adversarial doc-review → mini-plan
→ contract surface probe → blind-TDD build loop → review & harden → manual test
plan → docs + token stamp + summary → memory queue → delivery. Humans remain at
exactly three points: approve the doc, run UAT (against the generated
`TEST-PLAN.md`), and merge. A `Stop` hook (`feature-gate.js`) blocks the session
from ending while any gate in `docs/features/<slug>/GATES.md` is unchecked —
enforcement, not a request.

Runs interactive, or **headless** with nobody at the keyboard (`ISSFLOW_HEADLESS=1`
— every hard-stop degrades to a `BLOCKED.md` report + clean exit, never a guess):

```bash
/feature new user-auth        # scaffold the Feature doc from the shipped template
npx create-issflow --ci       # GitHub Action: label an issue `feature:approved` → the lane runs
npx create-issflow --docker   # container runner: Dockerfile.issflow + scripts/feature-docker.js
node scripts/feature-docker.js docs/features/<slug>/FEATURE.md            # one feature
node scripts/feature-docker.js docs/features/<slug>/FEATURE.md --worktree # parallel lanes
```

The Docker lane runs Claude Code inside an unprivileged, ephemeral container with
the repo mounted — the container is the sandbox that makes an unattended run safe.
Merge and production deploy can never be pre-authorized; those stay human.

**Node in the container is load-bearing.** The kit's lifecycle hooks are Node
scripts — in an image without `node` (claude installed as a native binary, or a
non-Node base), claude runs but every hook dies silently and the feature gate is
gone. The shipped `Dockerfile.issflow` is Node-based and checks `node --version`
at build; the runner preflights `node` in the image (including a bring-your-own
`ISSFLOW_IMAGE=<name>`) and refuses to start without it. Custom images: build
`FROM issflow-runner` (or any Node ≥ 18 base) and add your project's toolchain.

## Workflow best practices

Distilled from how teams actually run coding agents well (full sourced notes in
`docs/research/`). The kit already enforces most of these; the rest is how to drive it.

**Context hygiene** — fresh context per task; `/synthesize` then `/clear` between
phases. Delegate noisy side-work (research, logs, debugging) to subagents that
return only a summary. Keep instruction files small — the methodology is read on
demand, not injected every turn.

**Spec-first** — write the acceptance criteria before code; a human approves the
plan at the **PLAN-APPROVAL gate** (hard rule 13: `/overview`, `/replan`) before any
phase or sprint runs. Decompose into thin vertical
slices, never horizontal layers.

**TDD, blind** — `test-author` writes tests from the spec without seeing the
implementation, RED-first on TDD phases. Never edit a test to make it pass — fix
the code. A green mock suite alone never closes a phase.

**Debug discipline** — cap debug attempts at 3 (WARN at 2); on the third, stop and
escalate instead of shotgun-editing. Before debugging anything, grep `docs/ISSUES.md`
and `docs/research/INDEX.md`. Log every resolved error with its root cause.

**Review the diff** — never trust "it works"; read the diff, keep changes small,
run before claiming done. Work on a feature branch, never the default branch.

**Reuse knowledge** — `docs/ISSUES.md` and `docs/DESIGN_LOG.md` are append-only
memory; `/store-wisdom` promotes durable lessons to a shared KB the `researcher`
checks before any web search.

**Security** — least-privilege tools per agent; a human approves destructive or
outbound actions; secrets stay in env/vaults, never in code or prompts; treat
external input as untrusted.

**UI guardrail** — the `ux-design` skill is a cookbook (design tokens, 8pt grid,
WCAG 2.1 AA, state matrix, breakpoints, i18n) plus a wireframe baseline. Generated
UI is validated against the frame; a frontend phase can't close until it passes.

## Repo layout

```
istartsoftflow/
├── .claude/                       # the kit (source of truth)
│   ├── agents/ commands/ skills/ hooks/
│   ├── istartsoft-flow/METHODOLOGY.md
│   └── settings.json              # hook wiring (Claude Code)
├── docs/research/                 # design research behind the kit's choices
├── index.html                     # self-contained landing page (open in a browser)
└── create-issflow/                # the npx installer
    ├── bin/cli.js                 # pure-Node, non-destructive, multi-tool
    ├── build.js                   # pure-Node template builder (cross-platform)
    ├── template/                  # built from .claude by `npm run build`
    └── package.json · README.md
```

## Maintainers / publishing

1. Edit the kit in `.claude/`.
2. `npm run build` in `create-issflow/` to refresh `template/` (pure Node,
   cross-platform — works in cmd / PowerShell / sh).
3. Bump the version (`npm version patch`) and `npm publish` from `create-issflow/`.
   `prepublishOnly` rebuilds `template/` automatically, so it can never ship stale.

## License

MIT — see [LICENSE](./LICENSE).
