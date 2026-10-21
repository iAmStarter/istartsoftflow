---
description: Handle a mid-project requirement change — assess impact, re-estimate effort + cost, log the change order, then update the plan + proposal. Run whenever scope changes after the proposal is approved.
argument-hint: [the requested change · "dry-run" to preview impact without logging]
---

Caveman ULTRA mode. You are the ORCHESTRATOR.

A change request is a COMMERCIAL event, not just a re-plan: changing scope changes
cost and timeline. Handle it transparently and fairly. Change: $ARGUMENTS

DRY-RUN: if `$ARGUMENTS` contains `dry-run`/`--dry-run`, do the impact analysis +
re-estimate but EXECUTE NOTHING — print the ACTION PLAN (cost/scope/timeline delta,
files you'd touch) and STOP. No change order is logged, no plan/proposal is edited.
(METHODOLOGY → Dry-run.)

## PRE-FLIGHT
Read `docs/PROPOSAL.md` (the approved baseline), `docs/PLAN.md`, `docs/STATE.md`,
and `docs/CHANGES.md` (create if missing). No approved proposal yet -> you're still
pre-build; use `/propose` instead.

**FEATURE-LANE VARIANT** — the change targets a feature-lane run (STATE has a
`feature: <slug>` line, or `/feature` hard-stopped here on scope creep): the
baseline is the APPROVED `docs/features/<slug>/FEATURE.md`, not the proposal.
Run the same steps against the doc — impact on its slices, effort Δ if the
project prices work — then log the CR and **amend the FEATURE doc** (scope +
acceptance criteria) and reset its header to `> Approval: PENDING`: a changed
doc needs a fresh human approval before the lane re-arms. Skip the PROPOSAL/
plan-replan steps unless the change spills beyond the feature. No proposal in
this project is fine for this variant — the feature doc is the commercial unit.

## STEP 1 — CLASSIFY
Is this an in-scope **clarification** (no cost change) or a real **scope change**
(add / remove / alter)? Clarification -> log it, proceed, no re-price. Scope change
-> continue.

Also classify commercial lane:
- **Warranty / defect** (bug vs approved scope, inside support window) → prefer
  `/support` or `/quick` — not a billable CR unless the client expands scope.
- **Billable CR** → continue below.

## STEP 2 — IMPACT ANALYSIS
Determine:
- phases affected — **done phases are frozen** (their cost is already spent and
  counts); new / changed phases; cut phases (credit back the un-started effort).
- knock-on effects — architecture, **UX pack**, **security (re-threat-model?)**,
  tests, timeline. If UX or arch artifacts change, those gates re-open (rule 15).
- dispatch `researcher` (DESIGN or IMPL) if the change needs grounding in facts.

## STEP 3 — RE-ESTIMATE (the DELTA only)
- Reuse the SAME estimation config used for the approved proposal’s **internal**
  math (unit, rate card, currency, contingency) if still available in a private
  estimate memo or chat-recorded answers.
- If rate / contingency is missing → **ASK once** (same rule as `/propose`). Never
  invent a kit default rate; never commit personal rates into public kit files.
- added effort × rate = added cost; cut effort = credit.
- **net cost Δ** + **new total** vs the approved baseline — as a range.
- Show rate math **in chat to the human only**.
- **timeline Δ**. State what stays the SAME so the client sees the price is fair.

### CLIENT-DOC RULE
Anything the client sees (CR summary, updated PROPOSAL.md / proposal.html) shows
**Δ cost + new total** (and effort/timeline) only — **never** rate, rate card, or
contingency %.

## STEP 4 — LOG the change order
1. Append a one-line summary to `docs/CHANGES.md` (append-only):
```
CR-<n> | <date> | <change> | impact: <phases> | effort Δ: <±days> |
cost Δ: <±amount> | new total: <amount> | status: proposed
```
2. Fill `.issflow/templates/CR-template.md` → `docs/changes/CR-<n>.md` (detail:
   classification, impact, Δ cost, warranty vs billable, status). Keep the detail
   file client-safe on money fields (totals only).

## STEP 5 — APPROVAL GATE
Show me CR-<n> (impact + price delta + new total — no rate). **STOP for approval**
(commercial gate — always interactive).
- **Approved** -> set CR status `approved`; bump PROPOSAL.md to a new version (vN+1)
  with the delta folded in (**totals only**); re-render `docs/proposal.html` from it
  (same `/propose` package rows + screen appendix — do not dump every PLAN phase
  onto the sign table; same template + language; no contingency note / rate); then dispatch `/replan` to
  apply the phase changes to PLAN.md (done phases stay frozen). Update STATE.md.
  NOTE: `/replan` reverts PLAN.md to `> Approval: PENDING` and re-runs the
  PLAN-APPROVAL gate (hard rule 13) — the commercial CR sign-off is SEPARATE from
  the plan sign-off, so `/phase` and `/sprint` stay blocked until you also
  re-approve the revised plan. If UX/arch scope changed, reset `design:` /
  `architecture:` in STATE to PENDING (rule 15) before build resumes.
- **Rejected** -> set CR status `rejected`; PLAN + PROPOSAL unchanged.

## STEP 6 — RECORD
Append a HISTORY line for the CR. If the change alters architecture, run
`/log-decision`. The CHANGES.md log is the audit trail of every scope/cost change
across the project.
