---
description: Task-based UX/UI review of existing or new products with explicit coverage, browser evidence and bounded authorized repair.
argument-hint: [scope or all] [review | fix]
---

You are the ORCHESTRATOR. Read `.issflow/skills/ux-design/SKILL.md` and its
`references/product-experience.md`. The review covers real jobs and whole flows,
not only contrast, alignment or token compliance.

## Preflight
Default is REVIEW: read-only product inspection, audit artifacts allowed. `fix`
requires user-authorized implementation scope and the normal approved-plan gates.
Do not infer repair permission from "review", "audit" or "find problems". A new
visual direction uses `/redesign` and requires direction approval. Preserve an
existing system without forcing `/overview` or a commercial proposal.

## Inventory and evaluate
1. Record mode, users/jobs, baseline build, routes, flows, roles, components,
   contracts, devices and exclusions using `UX-AUDIT-template.md`.
2. Declare required dimensions per screen/flow before checks: task success,
   information architecture, feedback/recovery, visual hierarchy, accessibility,
   responsive/content, consistency and behavior preservation where applicable.
   JSON dimension IDs: screens use hierarchy, accessibility, responsive, states,
   content, consistency; flows use task-success, navigation, recovery, feedback.
   Add behavior-preservation for redesign. Baseline dimensions cannot be omitted.
3. Review critical journeys first, then shared components and remaining screens.
   Use bounded workers/batches and a shared inventory. Record sampling explicitly.
4. Inspect actual browser behavior where available. Cover success, failure,
   permissions, first use, large content, keyboard, resize, interruption, repeated
   action, cancel/close and Back/Forward. Use safe test fixtures only.
5. Keep observed results separate from source-only deductions and hypotheses.
   Attach screenshot/interaction/command evidence with revision and environment.
   A blocked browser is incomplete coverage, not a reason to fabricate a pass.

## Findings and report
Write `docs/ui-audit-<YYYY-MM-DD>.md` from the audit template and optionally an
adjacent evidence JSON using `UX-EVIDENCE-template.json`. Findings include task
impact, severity, exact location, reproduction, source principle, proposed fix,
confidence and verification. Deduplicate root causes, retain affected route IDs.
Log blockers/majors to ISSUES. Use FIX-FIRST / INCOMPLETE / REVIEWED, never an
unqualified SHIP verdict from an expert review. Validate JSON via
`node .issflow/scripts/ux-evidence.js <report.json>`; this validates bookkeeping only.

## Authorized repair
When authorized, preserve behavior and approved visual direction. Fix bounded
batches, retest failed checks plus critical regressions, and record before/after.
Default maximum two repair passes per issue; report remaining blockers honestly.
New scope, token direction or contract changes require approval before changes.
Return coverage, useful findings, completed fixes, remaining risks and report path.
