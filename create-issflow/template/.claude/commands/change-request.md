---
description: Handle a mid-project requirement change — assess impact, re-estimate effort + cost, log the change order, then update the plan + proposal. Run whenever scope changes after the proposal is approved.
argument-hint: [the requested change]
---

Caveman ULTRA mode. You are the ORCHESTRATOR.

A change request is a COMMERCIAL event, not just a re-plan: changing scope changes
cost and timeline. Handle it transparently and fairly. Change: $ARGUMENTS

## PRE-FLIGHT
Read `docs/PROPOSAL.md` (the approved baseline), `docs/PLAN.md`, `docs/STATE.md`,
and `docs/CHANGES.md` (create if missing). No approved proposal yet -> you're still
pre-build; use `/propose` instead.

## STEP 1 — CLASSIFY
Is this an in-scope **clarification** (no cost change) or a real **scope change**
(add / remove / alter)? Clarification -> log it, proceed, no re-price. Scope change
-> continue.

## STEP 2 — IMPACT ANALYSIS
Determine:
- phases affected — **done phases are frozen** (their cost is already spent and
  counts); new / changed phases; cut phases (credit back the un-started effort).
- knock-on effects — architecture, **security (re-threat-model?)**, tests, timeline.
- dispatch `researcher` (DESIGN or IMPL) if the change needs grounding in facts.

## STEP 3 — RE-ESTIMATE (the DELTA only; reasonable + transparent)
- Use the SAME estimation config as PROPOSAL.md (unit, rate card, currency,
  contingency) — consistency is what makes the re-price defensible.
- added effort × rate = added cost; cut effort = credit.
- **net cost Δ** + **new total** vs the approved baseline — as a range + assumptions.
- **timeline Δ**. State what stays the SAME so the client sees the price is fair.

## STEP 4 — LOG the change order to docs/CHANGES.md (append-only)
```
CR-<n> | <date> | <change> | impact: <phases> | effort Δ: <±days> |
cost Δ: <±amount> | new total: <amount> | status: proposed
```

## STEP 5 — APPROVAL GATE
Show me CR-<n> (impact + price delta + new total). **STOP for approval** (commercial
gate — always interactive).
- **Approved** -> set CR status `approved`; bump PROPOSAL.md to a new version (vN+1)
  with the delta folded in; re-render `docs/proposal.html` from it (same template +
  language); then dispatch `/replan` to apply the phase changes to PLAN.md (done
  phases stay frozen). Update STATE.md. NOTE: `/replan` reverts PLAN.md to
  `> Approval: PENDING` and re-runs the PLAN-APPROVAL gate (hard rule 13) — the
  commercial CR sign-off is SEPARATE from the plan sign-off, so `/phase` and
  `/sprint` stay blocked until you also re-approve the revised plan.
- **Rejected** -> set CR status `rejected`; PLAN + PROPOSAL unchanged.

## STEP 6 — RECORD
Append a HISTORY line for the CR. If the change alters architecture, run
`/log-decision`. The CHANGES.md log is the audit trail of every scope/cost change
across the project.
