---
description: Make a small, obvious change directly — no agent chain, no phase overhead.
argument-hint: [what to change · "dry-run" to preview the edit]
---

Caveman ULTRA mode. Apply `karpathy-guidelines` skill.

Purpose: use the smallest sufficient workflow for a bounded low-risk change.
Read `.issflow/istartsoft-flow/RISK-LANES.md` before choosing this lane.

DRY-RUN: if `$ARGUMENTS` contains `dry-run`/`--dry-run`, describe the exact edit
you'd make (file · lines · the change) and the regression you'd run, then STOP —
change nothing. (METHODOLOGY → Dry-run.)

Use `/quick` when ALL hold:
- change is bounded, local, reversible and fully specified; line count is not a safety test
- no new vertical slice
- no public/API/data contract or material visual-direction change
- no auth/security/permission change, migration, destructive/outbound action or release
- not mid-phase

If any fail -> reclassify before editing; recommend `/feature`, `/phase` or `/redesign` as appropriate.
(Hard rule 10: never route phase-worthy work through `/quick` to dodge the RED gate.)

Steps:
0. UNDERSTAND-FIRST (hard rule 14): inspect the relevant context and classify risk.
   If the direct request already specifies the exact bounded outcome and scope,
   state the intended change briefly and proceed to verification of authorization;
   do not add a redundant confirmation turn. Ask only for missing consequential
   choices or unclear scope. A generic improvement request is not exact consent.
1. Reuse an existing valid scoped approval, or prepare a concise scope receipt
   using `RISK-LANES.md`: goal, exact allowed paths, acceptance/checks and direct
   request provenance. The existing owner-controlled recording mechanism must bind
   that consent to the plan revision/digest; never self-approve. If that mechanism
   is unavailable, stop at the recording boundary and explain the smallest needed
   action. Then verify the approved digest and paths with the existing verifier.
   No shell/tool bypass. grep docs/ISSUES.md for anything related.
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
