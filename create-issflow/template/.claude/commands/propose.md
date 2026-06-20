---
description: Turn approved requirements + tech stack into a client proposal — scope, phase breakdown, effort + cost estimate, timeline, assumptions, and a sign-off gate. Run after /overview, before building.
argument-hint: [optional: rate / budget / constraints]
---

Caveman ULTRA mode. You are the ORCHESTRATOR.

Purpose: produce `docs/PROPOSAL.md` — WHAT we build, in what phases, how long, how
much, and on what assumptions — for the client to approve BEFORE any build starts.
A proposal is a commercial gate: always interactive (both AUTO and GUIDED).

## PRE-FLIGHT
Read `docs/OVERVIEW.md` (scope, stack, success criteria) and `docs/PRD.md` if
present (else the PRD in your BMAD/iSSM). No OVERVIEW -> run `/overview` first.

## STEP 1 — SCOPE
List the deliverables (features / epics) from OVERVIEW / PRD. Mark each
**in-scope** or **out-of-scope** explicitly — naming out-of-scope items now is what
prevents silent scope creep (and grounds change-order re-pricing later).

## STEP 2 — PHASE BREAKDOWN
Derive the vertical-slice phases (or read `docs/PLAN.md` if it exists). Size each:
- complexity: **S | M | L | XL**
- effort: an ideal-days RANGE (e.g. 2–3d), + story points if your team uses them
- risk / unknowns: what could move the estimate

## STEP 3 — ESTIMATE (reasonable, transparent — no false precision)
- **Rate:** read the declared rate from OVERVIEW or `$ARGUMENTS`. If none, ASK once
  (a commercial/planning input — allowed). Keep the currency as declared.
- **Cost per phase** = effort × rate. **Total** = a RANGE (low–high) with a stated
  contingency buffer (e.g. +10–15% for unknowns). Show the math.
- **Timeline:** phases in dependency order → a calendar estimate (note any parallelism).

## STEP 4 — ASSUMPTIONS & EXCLUSIONS
List every assumption the estimate rests on (infra provided, third-party/licence
costs excluded, content/design provided, etc.). These are the baseline that
change-orders re-price against.

## STEP 5 — WRITE docs/PROPOSAL.md (versioned: v1 + date)
```
# Proposal — <project>   (v1, <date>)
## Scope        — in-scope: … | out-of-scope: …
## Phases       — table: phase | complexity | effort (range) | cost
## Total        — <low>–<high> (incl. <buffer>% contingency)
## Timeline     — <estimate>, dependency order
## Assumptions  — …
## Exclusions   — …
## Payment      — milestones (if any)
## Sign-off     — approved by: ___  date: ___  version: v1
```

## STEP 6 — SIGN-OFF GATE
Show me the proposal. **STOP for approval** (commercial gate — always interactive).
On approval: record the approved version + date in PROPOSAL.md and STATE.md, and
append a HISTORY line `proposal v<n> approved (<total>)`. Building starts only after
sign-off. On rejection: revise per feedback and re-show.
