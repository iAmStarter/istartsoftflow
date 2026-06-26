# Design log — iStartSoftFlow kit

Architectural rationale. Append-only, newest first. Code/feature work → HISTORY.md;
bugs → ISSUES.md. (See `/log-decision`.)

## 0. Changelog

- 2026-06-26 — **Add the sprint layer** (`/sprint`): an optional Scrum wrapper between
  PLAN and PHASE. New command `.claude/commands/sprint.md`; methodology, planner, and
  `/phase` CLOSE wired for it; new artifacts `docs/sprints/sprint-<n>.md` +
  `docs/sprints/VELOCITY.md`; `sprint.defaultCapacity` knob in flow-config. See §5.1.

## 5. Decisions

### 5.1 Sprint layer — full Scrum ceremonies, AUTO-facilitated

Options weighed: (a) lightweight phase-grouping only; (b) tag-only metadata, no
command; (c) **full Scrum layer** — planning, standups, review/demo, retro, burndown,
velocity. **Chosen: (c)**, per the maintainer's explicit request, with two design
moves that keep it inside the kit's anti-ceremony philosophy:

1. **AUTO-facilitated, not human-gated.** Sprint planning only SLICES an
   already-approved `PLAN.md` (the requirements gate happened at `/overview`), so the
   ceremonies carry no fresh approval and are safe to auto-run. `/sprint run` drives a
   whole sprint — or every remaining sprint — hands-off, pausing only at the existing
   methodology hard-stops. This resolves the tension between "full Scrum" and the
   kit's "AUTO dev loop, don't interrupt" core: the ceremonies become automation, not
   meetings. The PLAN-approval, commercial, and release gates stay interactive,
   unchanged.
2. **"Daily" standup rebound to per-phase-close.** The AI dev loop has no calendar
   days, so a time-based daily Scrum is meaningless. The standup tick fires once per
   `/phase` CLOSE — the real unit of progress — keeping the inspect cadence without
   inventing a clock. Burndown ticks on the same cadence.

Hierarchy becomes **PLAN (backlog) → SPRINT (committed slice) → PHASE (loop)**. Phases
run unchanged inside a sprint; the layer is opt-in (skip it → drive phases off the PLAN
as before), so no existing project breaks.

## 6. File inventory (delta)

- `+ .claude/commands/sprint.md` — the sprint command (Scrum ceremonies + AUTO driver).
- `+ docs/sprints/sprint-<n>.md`, `+ docs/sprints/VELOCITY.md` — sprint artifacts (runtime).
- `~ .claude/istartsoft-flow/METHODOLOGY.md` — Sprint-layer section, lifecycle, BMAD map,
  procedures, SESSION-OPEN + SPRINT-STANDUP rituals, file contract.
- `~ .claude/agents/planner.md` — emits `[N pts]` + `## Sprint` groupings.
- `~ .claude/commands/phase.md` — CLOSE fires the standup tick when a sprint is active.
- `~ .claude/flow-config.json` — `sprint.defaultCapacity` knob.
