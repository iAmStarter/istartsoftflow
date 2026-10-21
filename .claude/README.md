# `.claude/` — portable iStartSoftFlow kit

This directory is the **portable workflow kit** installed into every project.
Content is **tool-agnostic**. The folder name `.claude/` is a **host convention**
(Claude Code and several other agents load commands/agents/hooks from this path).
It is **not** “Claude-only product branding.”

**Human entry points (repo root):**

| File | Role |
|------|------|
| `AGENTS.md` | Open-standard primary entry — indexes this kit |
| `CLAUDE.md` | Thin shim (`@AGENTS.md`) — only because Claude Code auto-loads that filename |

**Single source of truth for rules:** [`istartsoft-flow/METHODOLOGY.md`](./istartsoft-flow/METHODOLOGY.md)

## Layout

| Path | What |
|------|------|
| `agents/` | Fresh-context workers (planner, researcher, implementer, …) |
| `commands/` | Procedures — Default: `/overview` `/feature` `/quick`; Advanced: `/propose` `/design` `/support` … |
| `skills/` | On-demand cookbooks (ux-design, security, support-triage, …) |
| `hooks/` | Lifecycle enforcement (context, plan gate, feature gate, …) |
| `istartsoft-flow/` | METHODOLOGY.md — every hard rule lives here once |
| `templates/` | Proposal / UX pack / architecture / CR / FEATURE / automation |
| `settings.json` | Host hook wiring (when using Claude Code adapter) |
| `flow-config.json` | Context watchdog + sprint knobs (optional overrides) |

Do **not** duplicate METHODOLOGY rules into other files (anti-drift).
Do **not** put personal rate cards or salary numbers in this kit.

Installer: `npx create-issflow` (omit `--tool` = all adapters).
