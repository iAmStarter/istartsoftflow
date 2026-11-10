# create-issflow

Scaffold the **iStartSoftFlow** AI-coding workflow into any project. Stack-agnostic
and tool-agnostic. Non-destructive: it never overwrites your files.

## Use

```bash
cd my-project
npx create-issflow                  # omit --tool = install EVERY adapter
npx create-issflow --tool=cursor    # claude | codex | cursor | gemini | aider | all
# then open your tool and run:
/overview                           # bootstrap the project
```

Flags:
- `--tool=<name>` — pick the target tool. **Omit = `all`** (every adapter).
- `--ci` — also write `.github/workflows/issflow-feature.yml` (headless `/feature`
  via GitHub Actions: label an issue `feature:approved` → the lane runs).
- `--docker` — also write `Dockerfile.issflow` + `scripts/feature-docker.js`
  (headless `/feature` in an unprivileged container; the container is the sandbox).
  The image must ship Node ≥ 18 — the kit's hooks are Node scripts; the shipped
  Dockerfile is Node-based and the wrapper preflights `node` before every run.
- `--dry-run` — print what would happen, write nothing.
- `--force` — overwrite existing kit files (default keeps yours; conflicts are
  written as `<file>.issflow-new` for you to merge).
- `-h`, `--help` — usage.

## What it installs

The portable kit (every tool) in `<project>/.issflow/`:

- `agents/` — planner · researcher · implementer · test-author · debugger · e2e-runner · synthesizer
- `commands/` — `/overview` `/feature` `/goal` `/propose` `/phase` `/sprint` `/ui-audit` `/qa-audit` `/security-audit` `/release` `/uat` `/change-request` `/replan` `/quick` `/synthesize` `/runbook` `/store-wisdom` `/log-issue` `/log-decision` `/unstuck`
- `skills/` — caveman · grill-me · karpathy-guidelines · ux-design · ui-ux-pro-max · security · code-standards
- `hooks/` — session-start · context-guard · plan-gate (rule-13 enforcement) · pre-compact · subagent-stop · feature-gate (Stop gate for `/feature`, artifact-verified)
- `istartsoft-flow/METHODOLOGY.md` — the full methodology (single source of truth)

Plus a root **`AGENTS.md`** (open standard — primary entry) and the per-tool adapter:

| Tool | Adds |
|------|------|
| `codex` | nothing extra — `AGENTS.md` is read natively |
| `cursor` | `.cursor/rules/` + `.cursor/commands/` + `.cursor/hooks.json` |
| `gemini` | `GEMINI.md` pointer |
| `aider` | `.aider.conf.yml` that loads the methodology |
| `claude` | thin `CLAUDE.md` (`@AGENTS.md`) + `.claude/` kit mirror + merges hooks into `.claude/settings.json` (hooks run from `.issflow/`) |
| `all` | every adapter above |

It also un-ignores the workflow dirs in `.gitignore` if `.issflow/*` was ignored.

## Loop

`design-research → grill → plan → implement → test → deploy`, one vertical slice
per phase. Stack-agnostic: declare your stack in `docs/OVERVIEW.md`; Phase 0
(infra) is N/A when infra is managed. Planning source of truth stays in your
PRD / architecture / stories (e.g. BMAD / iSSM).

## Maintainers

The kit lives in the repo's `.issflow/`. After editing it, run `npm run build`
(pure Node — cmd / PowerShell / sh) to refresh `template/`, then `npm version patch`
and `npm publish`. `prepublishOnly` rebuilds `template/` on publish automatically.

Everything is cross-platform: the installer and `build.js` are pure Node, and the
lifecycle hooks are Node scripts (`node .issflow/hooks/*.js`) — no bash/jq/python,
so the kit runs the same on macOS, Windows, and Linux.

### Existing-product UX/UI review and redesign

- `/ui-audit [scope]`: review jobs, navigation, flows, recovery, visual hierarchy,
  accessibility and responsive behavior. Product code is read-only by default.
- `/redesign [scope]`: baseline current behavior, compare context-driven visual
  previews, approve direction, then implement and retest without silently changing
  contracts. Minimal luxury is an option when it fits, not a universal template.
- `/ui-audit [scope] fix`: repair only within explicitly authorized plan scope.
- `node .issflow/scripts/ux-evidence.js report.json`: validate declared coverage
  and evidence bookkeeping. Missing runtime checks remain incomplete. This is not
  a browser runner, user-research substitute or accessibility certification.

Use `UX-AUDIT-template.md` and `UX-EVIDENCE-template.json` in `.issflow/templates/`.
New-project foundations remain available through `/overview` and `/design`.

### Native discovery and proportional workflows

Codex and Cursor installs now generate native skills in `.agents/skills` and
host-specific agents in `.codex/agents` (TOML) or `.cursor/agents` (Markdown).
Host defaults select models; Claude model aliases are not copied into other hosts.
Start with `.issflow/istartsoft-flow/CORE.md`; load detailed policy only as needed.
The quick lane uses a concise scope receipt and avoids redundant confirmation of
an already explicit request, while retaining existing approval/digest/path gates.
An owner-controlled approval-recording action is still required where enforced.

Run `npx create-issflow --doctor` in a project for read-only file/version diagnostics.
It does not prove native discovery, hook enforcement or successful agent execution.
Mixed-host installs may expose duplicate shared/Claude skills in Cursor; inspect
its skill selector. No Codex hooks are installed until runtime semantics are verified.
See `.issflow/runtime/HOSTS.md` for verification levels and current integration docs.
