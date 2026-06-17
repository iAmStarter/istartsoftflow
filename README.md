# iStartSoftFlow

A reusable, hook-enforced AI-coding workflow. Codifies a
`design-research → grill → plan → implement → test → deploy` loop with
vertical-slice phases, agent orchestration, and automatic context hygiene — so the
workflow runs itself instead of being hand-steered every session.

**Stack-agnostic and tool-agnostic.** It pins a *process*, not a *stack*: declare
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

Flags: `--tool=<name>` (skip the prompt) · `--dry-run` (write nothing) · `--force`
(overwrite kit files; default keeps yours and writes conflicts as `<file>.issflow-new`).

## Supported tools

One source of truth (`.claude/` + `AGENTS.md`); the installer writes the right
adapter per tool. Unsupported features degrade to model-run rituals — they never
silently vanish.

| Tool | Entry | Commands | Subagents | Lifecycle hooks |
|------|-------|----------|-----------|-----------------|
| **Claude Code** (reference) | `AGENTS.md` + `.claude/` | `.claude/commands/` | native | SessionStart · PreCompact · SubagentStop |
| **Codex CLI** | `AGENTS.md` (native) | read as prompts | reference | model-run |
| **Cursor** | `.cursor/rules/` + `AGENTS.md` | `.cursor/commands/` | reads `.claude/agents/` | `.cursor/hooks.json` |
| **Gemini CLI** | `GEMINI.md` + `AGENTS.md` | read as prompts | reference | model-run |
| **Aider** | `.aider.conf.yml` → `AGENTS.md` | reference | model-run | model-run |
| **Any AGENTS.md tool** | `AGENTS.md` | reference | model-run | model-run |

## What you get (in `<project>/.claude/`)

| Group | Items |
|-------|-------|
| **agents** | planner · researcher · implementer · test-author · debugger · e2e-runner · synthesizer |
| **commands** | `/overview` `/phase` `/quick` `/replan` `/synthesize` `/store-wisdom` `/log-issue` `/log-decision` `/unstuck` |
| **skills** | caveman · grill-me · karpathy-guidelines · **ux-design** |
| **hooks** | session-start · pre-compact · subagent-stop (wired per tool) |
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

## Workflow best practices

Distilled from how teams actually run coding agents well (full sourced notes in
`docs/research/`). The kit already enforces most of these; the rest is how to drive it.

**Context hygiene** — fresh context per task; `/synthesize` then `/clear` between
phases. Delegate noisy side-work (research, logs, debugging) to subagents that
return only a summary. Keep instruction files small — the methodology is read on
demand, not injected every turn.

**Spec-first** — write the acceptance criteria before code; a human approves the
plan (`/overview`, `/replan`) before implementation. Decompose into thin vertical
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
└── create-issflow/                # the npx installer
    ├── bin/cli.js                 # pure-Node, non-destructive, multi-tool
    ├── template/                  # built from .claude by build.sh
    ├── build.sh · package.json · README.md
```

## Maintainers / publishing

1. Edit the kit in `.claude/`.
2. `bash create-issflow/build.sh` to refresh `template/`.
3. Bump `create-issflow/package.json` version, then `npm publish` from
   `create-issflow/`.

## License

MIT — see [LICENSE](./LICENSE).
