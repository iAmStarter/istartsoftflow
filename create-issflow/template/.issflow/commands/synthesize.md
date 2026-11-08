---
description: Compress handoff docs, dedup the issue log, prune snapshots. Run before /clear.
---

Caveman ULTRA mode.

Trigger: end of a phase, or any time STATE.md / ISSUES.md feel bloated.

Dispatch the `synthesizer` subagent when supported; otherwise run its checklist
sequentially per METHODOLOGY → Host capabilities and continuity. Preserve every
active/parked lane checkpoint, evidence record, approval digest, and retry budget.

For a normal phase: it rewrites STATE.md, dedups ISSUES.md, prunes snapshots,
appends to HISTORY.md.

For the FINAL phase (no further pending phases): also pass the signal
"FINAL PHASE" so the synthesizer runs the extended pass — updating OVERVIEW.md
and README.md to reflect the verified project state, including any pending
deployment or blocked work. Last phase does not imply completed project.

To determine if this is the final phase, reconcile the approved plan with execution
state. Do not edit approval-hashed plan content to track completion.

When synthesizer confirms durable checkpoints are safe for a context reset, report:
- before/after line counts
- whether the final-pass ran
- next action; under a goal/sprint driver, return control and continue approved work
- reset only if the host supports it and it is needed; otherwise use the checkpoint

If it returns anything unsafe, show me what and stop.
