---
description: After-go-live support triage — severity, warranty vs billable CR, hotfix via /quick or route to /change-request. Use for bugs and issues in hypercare / warranty.
argument-hint: [symptom or ticket summary · "dry-run"]
---

Caveman ULTRA mode. You are the ORCHESTRATOR.

Purpose: handle production / post-release issues like a small software house —
triage first, then fix under warranty or open a billable CR. Issue: $ARGUMENTS

DRY-RUN: if `$ARGUMENTS` contains `dry-run`/`--dry-run`, print the triage plan and
STOP. Log and fix nothing.

Apply the `support-triage` skill.

## PRE-FLIGHT
Read `docs/PROPOSAL.md` (warranty / support assumptions if any), `docs/STATE.md`,
`docs/ISSUES.md`, `docs/RUNBOOK.md` (if present), and recent HISTORY release lines.
No live release yet → say so; may still log the issue for pre-prod.

## STEP 1 — TRIAGE
Brief-back (rule 14) then classify:

| Field | Values |
|-------|--------|
| Severity | **P1** (down / data loss / security) · **P2** (major feature broken, workaround) · **P3** (minor / cosmetic) |
| Type | defect vs approved scope · clarification · **new scope** |
| Commercial | **warranty** (in support window, defect) · **billable** (out of window or new scope) · **unclear** (ask) |

Default warranty window if unset in PROPOSAL/OVERVIEW: **30 days** after production
promote (`released` HISTORY line). Ask once if the human wants a different window.

## STEP 2 — ROUTE
- **Warranty defect** → `/log-issue` (severity in title/symptom) → fix with `/quick`
  (or `/phase` / `/feature` if phase-worthy — do not dodge TDD via quick for large
  work, rule 10). P1: prioritize; note runbook updates via `/runbook` if ops-related.
- **Billable / new scope** → `/change-request` (do not silently build free work).
- **Unclear** → STOP and ask warranty vs billable before coding.

## STEP 3 — CLOSE THE LOOP
- Confirm ISSUES entry + HISTORY note `support P<n>: <title> → <route>`.
- If fixed under warranty: mark issue resolved; no PROPOSAL bump.
- Reminder: release STAGE 8 hypercare keeps ISSUES live; `/support` is the front door.
