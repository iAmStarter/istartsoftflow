# Design log — iStartSoftFlow kit

Architectural rationale. Append-only, newest first. Code/feature work → HISTORY.md;
bugs → ISSUES.md. (See `/log-decision`.)

## 0. Changelog

- 2026-06-26 — **Formalize the PLAN-APPROVAL gate** (hard rule 13): the plan→build
  transition becomes a named, recorded sign-off gate symmetric with the `/propose`
  commercial gate. `/overview` stamps the approval (PLAN.md `> Approval:` header +
  STATE.md `plan:` + HISTORY line); `/phase` and `/sprint` refuse to start on a
  `PENDING` plan; `/replan` reverts to `PENDING` and re-stamps on re-approval; the
  `planner` emits the `PENDING` header. Methodology rule 13 + Autonomy/lifecycle/file-
  contract wording. See §5.2.

- 2026-06-26 — **Add the sprint layer** (`/sprint`): an optional Scrum wrapper between
  PLAN and PHASE. New command `.claude/commands/sprint.md`; methodology, planner, and
  `/phase` CLOSE wired for it; new artifacts `docs/sprints/sprint-<n>.md` +
  `docs/sprints/VELOCITY.md`; `sprint.defaultCapacity` knob in flow-config. See §5.1.

## 5. Decisions

### 5.2 PLAN-APPROVAL gate — formalize the plan→build sign-off

The kit had a rigorous, recorded sign-off for the COMMERCIAL gate (`/propose` STEP 6:
stamp the approved version + date into PROPOSAL.md + STATE.md + a HISTORY line) but the
PLANNING gate — arguably more load-bearing, since the whole AUTO dev loop builds against
the plan — was only loose prose at the end of `/overview` ("stop and show me PLAN.md for
approval"). Nothing recorded it, nothing enforced it: `/phase` would happily run against
an unapproved plan. That asymmetry is the defect this fixes.

**Chosen: a full formal gate (hard rule 13), symmetric with the commercial gate.**
Options weighed: (a) light prose tighten; (b) rule only, no enforcement; (c) **full gate
— named rule + recorded sign-off + hard preconditions.** Chosen (c) per the maintainer's
request. Design moves:

1. **Recorded in three places, like the proposal gate.** Approval stamps the PLAN.md
   `> Approval:` header (`approved <date> v<n>`), STATE.md `plan:`, and a HISTORY line —
   so the sign-off is durable and grep-able, not a chat artifact.
2. **Enforced as a precondition, not just documented.** `/phase` PRE-FLIGHT and `/sprint`
   planning REFUSE to start while the header reads `PENDING`. The marker is the single
   checkable source of truth; commands reference rule 13, they don't restate it
   (anti-drift invariant preserved).
3. **`/replan` re-opens it.** A re-plan reshapes unbuilt scope, so it reverts the header
   to `PENDING` and re-stamps a bumped version on re-approval — the gate tracks plan
   churn instead of going stale after the first sign-off.
4. **Interactive in both modes, by design.** This is a planning gate; AUTO governs only
   the dev loop AFTER it. No new config knob (the proposal gate has none either) — keeps
   it lean.

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
