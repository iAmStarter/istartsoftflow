---
description: Make a small, obvious change directly — no agent chain, no phase overhead.
argument-hint: [what to change · "dry-run" to preview the edit]
---

Caveman ULTRA mode. Apply `karpathy-guidelines` skill.

Purpose: skip the orchestration tax for a 5-line fix.

DRY-RUN: if `$ARGUMENTS` contains `dry-run`/`--dry-run`, describe the exact edit
you'd make (file · lines · the change) and the regression you'd run, then STOP —
change nothing. (METHODOLOGY → Dry-run.)

Use `/quick` when ALL hold:
- change is small (under 30 lines) and obvious
- no new vertical slice
- no external service contract change
- not mid-phase

If any fail -> STOP, tell me, recommend `/phase`.
(Hard rule 10: never route phase-worthy work through `/quick` to dodge the RED gate.)

Steps:
0. UNDERSTAND-FIRST (hard rule 14): brief back in 2–3 lines — the change as you
   understand it · file(s) you'll touch · blast radius — and WAIT for my confirm.
   One cheap turn beats redoing a misunderstood edit. (Already confirmed in this
   conversation? say so and proceed — don't re-ask the same understanding.)
1. Verify applicable plan revision/digest and allowed paths per METHODOLOGY →
   Plan-scoped approvals; intake confirmation alone cannot override that gate.
   grep docs/ISSUES.md for anything related.
1b. If the change touches UI: read `docs/design/tokens.css` + inventory when present.
    Use semantic tokens only — no raw hex/spacing literals in components.
2. Make the change. Smallest diff that works.
3. Run it — lint/typecheck/smoke. Show me result.
4. REGRESSION GUARD: run `scripts/regression.sh` (mock corpus). No corpus in this
   repo? run the project's own test suite instead (or the touched area's tests).
   A break blocks completion, not the first repair attempt: fix within the approved
   scope and rerun the failed check plus regression, using the two-try budget below.
   No agent chain is added.
5. Error you cannot fix in 2 tries -> park this unit with failed hypotheses,
   evidence, and the next action. Recommend `/phase`; do not expand scope or
   reset the budget automatically. Under an approved goal, return the blocker
   to its driver so independent units can continue.
6. Change revealed a bug -> `/log-issue`.
7. ARCHITECTURE SELF-CHECK: touched an agent, hook, command, or workflow rule?
   YES -> `/log-decision`.

No full STATE.md rewrite, synthesize, or /clear needed. If interrupted or blocked,
leave a minimal checkpoint (scope, diff, tests, attempts, next action) per the
methodology Execution contract; preserve existing state. Report done only after
required checks pass, otherwise blocked/not run with evidence.
