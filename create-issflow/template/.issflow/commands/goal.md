---
description: Goal layer — declare an OUTCOME, then let the kit drive lanes toward it until done, blocked, or budget spent. Goal-driven (stops on the outcome), not just time-driven like an interval loop.
argument-hint: [set "<outcome>" · run [id] · status · done <id> · drop <id> · "dry-run"]
---

Caveman ULTRA mode. You are the ORCHESTRATOR. Goals live in `docs/GOALS.md`.

A GOAL is bigger than one task: "clear the approved feature queue", "get the
release candidate green", "close every open HIGH issue". The goal layer picks
the next actionable unit, routes it through the RIGHT lane (METHODOLOGY → Lane
routing), and repeats — with the same gates every lane already enforces.

DRY-RUN: with `dry-run`, `/goal run` prints the pick-order + lanes it would fire
and STOPS. `/goal set` always stops at the confirmation gate anyway.

---

## /goal set "<outcome>"

1. UNDERSTAND-FIRST gate (hard rule 14) — BRIEF-BACK before writing anything:
   - the outcome as YOU understand it, restated in one paragraph
   - **Done when** — a measurable finish line (else the loop never terminates)
   - scope / out-of-scope · assumptions · which lanes will likely fire
   - **Budget** — max units per run (features/phases/quick fixes) so a runaway
     goal cannot burn the wallet
   STOP for explicit confirmation. Correction -> re-brief. Never skip this.
2. On confirm, append to `docs/GOALS.md`:
   ```
   ## G<n> — <outcome> [active]
   > Done when: <measurable condition>
   > Budget: <max units per run / other caps>
   > Approved: <name> <date>
   ```
   The `Approved:` line is what arms HEADLESS goal runs (same doctrine as the
   feature lane: recorded consent, scoped to this goal).

## /goal run [id]   (default: the single active goal)

LOOP — repeat until a stop condition:
1. PICK the next actionable unit, in this order:
   a. an in-progress, unblocked unit in STATE (finish what is started)
   b. an APPROVED, pending `docs/features/*/FEATURE.md` that advances the goal
   c. the next pending PLAN phase that advances the goal (plan must be approved — rule 13)
   d. an open ISSUES.md item inside the goal's scope (route `/quick` or `/feature`)
   Select only units with verified dependencies and applicable plan approval.
   Skip parked units and their dependents; do not re-pick them without new evidence.
   Nothing actionable -> report + checkpoint + stop.
2. ROUTE it through the lane-routing table (`/feature` · `/phase` · `/quick`).
   The lane runs with ALL its own gates — the goal layer never bypasses one.
3. TICK: record status + evidence under the goal. Use `[x]` only for verified done;
   record blocked/pending/not-run explicitly. Each attempted unit consumes budget,
   including a parked unit. Persist remaining budget and retry counts; resuming
   the same run does not reset them. Update STATE with the exact next action.
4. CHECK "Done when". Met -> mark `[done]`, STATE `goal: G<n> (done)`, final
   report (units shipped · parked blockers · budget used). Not met -> loop.

STOP conditions (whichever first): verified Done-when met · budget spent ·
no independent approved unit actionable · a run-wide safety/approval blocker.
A lane hard-stop parks that unit and its dependents; record its blocker (headless:
`BLOCKED.md`), then continue independent authorized units within budget.
On resume, reconcile checkpoints, approvals, and the worktree per the methodology.
A blocked required unit prevents claiming the goal complete.
Every stop produces ONE consolidated report — never a silent end.

## /goal status · /goal done <id> · /goal drop <id>

Show goals + progress ticks · administratively close (record the human request,
not fabricated passing evidence) · abandon
(log why). Both edits keep the history lines — GOALS.md is append-style memory.

---

## Recurrence (running a goal on a schedule)

`/goal run` is one pass: it works until done/blocked/budget. To keep pressure on
a long goal, re-fire the pass on a schedule — host-level, not kit-level:
- **Claude hosts with a verified `/loop` capability**: `/loop 30m /goal run` — the host's interval loop
  re-invokes the pass; the goal layer supplies the state + finish line that a
  bare interval loop lacks (it stops itself when Done-when is met).
- **CI (headless)**: `create-issflow --ci` also installs
  `.github/workflows/issflow-goal.yml` — a cron-ready workflow that runs
  `/goal run` with `ISSFLOW_HEADLESS=1` (schedule commented out by default;
  uncomment to arm). The `Approved:` line in GOALS.md is the recorded consent.
- **Docker**: `node scripts/feature-docker.js` per feature stays the unit
  runner; a goal pass inside a container is `claude -p "/goal run"` on the
  same image (cron it with the scheduler you already have).
