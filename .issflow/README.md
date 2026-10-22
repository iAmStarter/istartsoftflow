# `.issflow/` — portable iStartSoftFlow kit

This directory is the **portable workflow kit** (tool-agnostic). Every
`--tool=` install gets this tree. Host-specific adapters live **outside** it
(`.cursor/`, `CLAUDE.md` + `.claude/` mirror, `GEMINI.md`, …).

**Human entry (repo root):** `AGENTS.md` → indexes this kit.

**Rules SoT:** [`istartsoft-flow/METHODOLOGY.md`](./istartsoft-flow/METHODOLOGY.md)

## Layout

| Path | What |
|------|------|
| `agents/` | Fresh-context workers (planner, researcher, implementer, …) |
| `commands/` | Procedures — Default: `/overview` `/feature` `/quick`; Advanced: `/propose` `/design` `/support` … |
| `skills/` | On-demand cookbooks (ux-design, ui-ux-pro-max, security, support-triage, …) |
| `hooks/` | Lifecycle enforcement scripts |
| `istartsoft-flow/` | METHODOLOGY.md — every hard rule lives here once |
| `templates/` | Proposal / UX pack / architecture / CR / FEATURE / automation |

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
