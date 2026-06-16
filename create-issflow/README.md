# create-issflow

Scaffold the **iStartSoftFlow** AI-coding workflow into any project — Claude Code
only, **no Azure, no Cursor**. Non-destructive: it never overwrites your files.

## Use

```bash
cd my-project
npx create-issflow            # scaffolds .claude/ into the current project
# then open Claude Code — the SessionStart hook fires automatically
/overview                            # bootstrap the project
```

Flags:
- `--dry-run` — print what would happen, write nothing.
- `--force` — overwrite existing kit files (default keeps yours; conflicts are
  written as `<file>.issflow-new` for you to merge).

## What it installs (into `<project>/.claude/`)

- `agents/` — planner · researcher · implementer · test-author · debugger · e2e-runner · synthesizer
- `commands/` — `/overview` `/phase` `/quick` `/replan` `/synthesize` `/store-wisdom` `/log-issue` `/log-decision` `/unstuck`
- `skills/` — caveman · grill-me · karpathy-guidelines · ux-design
- `hooks/` — session-start · pre-compact · subagent-stop (merged into `.claude/settings.json`, existing hooks preserved)
- `istartsoft-flow/METHODOLOGY.md` — the full methodology

It also un-ignores the workflow dirs in `.gitignore` if `.claude/*` was ignored.

## Loop

`design-research → grill → plan → implement → test → deploy`, one vertical slice
per phase. **Phase 0 (infra) is N/A** — infra is managed (Vercel + Supabase).
Planning source of truth stays in iSSM/BMAD; iStartSoftFlow is the execution loop.

## Maintainers

The kit lives in the repo's `.claude/`. After editing it, run `bash build.sh` to
refresh `template/`, then bump `version` and publish.
