# `.issflow/` — portable iStartSoftFlow kit

This directory is the **portable workflow kit** (tool-agnostic). Every
`--tool=` install gets this tree. Host-specific adapters live **outside** it
(`.cursor/`, `CLAUDE.md` + `.claude/` mirror, `GEMINI.md`, …).

**Human entry (repo root):** `AGENTS.md` → indexes this kit.

**Rules SoT:** [`istartsoft-flow/METHODOLOGY.md`](./istartsoft-flow/METHODOLOGY.md)

## Layout

| Path | What |
|------|------|
| `agents/` | Role definitions (isolated workers only where the host supports them) |
| `commands/` | Procedures — Default: `/overview` `/feature` `/quick`; Advanced: `/propose` `/design` `/support` … |
| `skills/` | On-demand cookbooks (ux-design, ui-ux-pro-max, security, support-triage, …) |
| `hooks/` | Lifecycle enforcement scripts |
| `istartsoft-flow/` | METHODOLOGY.md — every hard rule lives here once |
| `templates/` | Proposal / UX pack / architecture / CR / FEATURE / design picker · platforms |
| `models/` | MODEL-MATRIX.md — cross-host model guidance (aliases stay haiku/sonnet/opus) |
| `routing/` | Advisory model router (fail-closed) |
| `scripts/` | Portable helpers (e.g. token-lint.js) |

## Claude Code only

Anthropic’s Claude Code loads commands/agents/skills from **`.claude/`**. When you
install `--tool=claude` (or `all`), the installer also **mirrors** this kit into
`.claude/` plus a root `CLAUDE.md` shim (`@AGENTS.md`). Cursor / Codex / Gemini /
Aider installs do **not** create `.claude/`.

Edit the kit in **`.issflow/`**, then re-run `create-issflow --tool=claude` (with
`--force` if needed) to refresh the Claude mirror. Hooks run from `.issflow/`
(single source); Claude settings point there.

Do **not** duplicate METHODOLOGY rules into other files (anti-drift).
Do **not** put personal rate cards in this kit.

Installer: `npx create-issflow` (omit `--tool` = all adapters).

Local task checkpoints: [runtime/README.md](runtime/README.md).
Host capabilities and smoke checks: [runtime/HOSTS.md](runtime/HOSTS.md).

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
