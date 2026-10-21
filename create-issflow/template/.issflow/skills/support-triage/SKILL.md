---
name: support-triage
description: >
  After-go-live issue triage for software-house support — severity P1–P3,
  warranty vs billable CR, hotfix vs change-request routing. Use with /support,
  production incidents, hypercare, client bug reports, or when classifying
  whether a fix is free warranty work. Keywords: support, hypercare, warranty,
  P1, severity, ticket, hotfix, aftercare, ซัพพอร์ต, รับประกัน.
---

# support-triage — post-release front door

Caveman ULTRA mode. Triage before you code. Wrong commercial lane (free vs
billable) is a process defect.

## Severity

| Level | Meaning | Response shape |
|-------|---------|----------------|
| **P1** | Service down, data loss, active security incident | Drop-everything; runbook; fix or mitigate now |
| **P2** | Major feature broken; workaround exists | Same-day / next business day aim |
| **P3** | Minor, cosmetic, nice-to-have | Queue; batch with other P3s |

## Warranty vs billable

- **Warranty:** defect against **approved** scope inside the support window
  (default 30 days after prod `released` unless PROPOSAL/OVERVIEW says otherwise)
  → log + `/quick` (or larger lane if needed) — **no** proposal bump.
- **Billable:** new scope, enhancement, or outside window → `/change-request`.
- **Unclear:** ask once; do not assume free work.

## Routing checklist

1. Reproduce / capture symptom (prefer client steps).
2. Grep `docs/ISSUES.md` + runbook — known issue?
3. Assign P1–P3 + warranty/billable.
4. Route: support fix · CR · or escalate (infra / vendor).
5. HISTORY line for the triage decision.

Never put personal rate cards into public tickets or client emails from this skill.
