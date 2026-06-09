# iStartSoftFlow

A reusable, hook-enforced AI-coding workflow for **Claude Code**. Codifies a
`design-research → grill → plan → implement → test → deploy` loop with
vertical-slice phases, agent orchestration, and automatic context hygiene — so the
workflow runs itself instead of being hand-steered every session.

**Claude-only. No Azure. No Cursor.** Infra is assumed managed (Vercel + Supabase),
so there is no infra provisioning phase — Phase 0 is N/A.

> Adapted from the open **anpunkit** workflow by MetheeS (MIT), trimmed to
> Claude-only and de-coupled from Azure/Cursor.

## Install into a project

```bash
cd my-project
npx create-issflow            # non-destructive: never clobbers your files
# then open Claude Code — the SessionStart hook fires automatically
/overview                            # bootstrap the project
```

Flags: `--dry-run` (write nothing), `--force` (overwrite kit files; default keeps
yours and writes conflicts as `<file>.issflow-new`).

## What you get (in `<project>/.claude/`)

| Group | Items |
|-------|-------|
| **agents** | planner · researcher · implementer · test-author · debugger · e2e-runner · synthesizer |
| **commands** | `/overview` `/phase` `/quick` `/replan` `/synthesize` `/store-wisdom` `/log-issue` `/log-decision` `/unstuck` |
| **skills** | caveman · grill-me · karpathy-guidelines |
| **hooks** | session-start · pre-compact · subagent-stop (merged into `.claude/settings.json`) |
| **methodology** | `.claude/istartsoft-flow/METHODOLOGY.md` |

## Core idea

Mandatory steps live in **hooks** (deterministic, cannot be skipped). Thinking
steps live in **subagents + skills** (the model reasons). Putting "read the issue
log" in a hook is why it stops getting skipped.

## The loop

`design-research → grill → plan → implement → test → deploy`, one vertical slice
per phase. Implement AND test a phase before the next; the last phase includes
deployment. **Phase 0 (infra) = N/A** (managed Vercel + Supabase).

Planning source of truth stays in your BMAD/iSSM artifacts; iStartSoftFlow is the
execution loop layered on top.

## Repo layout

```
istartsoftflow/
├── .claude/                       # the kit (source of truth)
│   ├── agents/ commands/ skills/ hooks/
│   ├── istartsoft-flow/METHODOLOGY.md
│   └── settings.json              # hook wiring
└── create-issflow/         # the npx installer
    ├── bin/cli.js                 # pure-Node, non-destructive, cross-platform
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
