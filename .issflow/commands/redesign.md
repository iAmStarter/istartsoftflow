---
description: Review and redesign an existing product while preserving its behavior and producing contextual visual previews before implementation.
argument-hint: [scope] [dry-run]
---

Read `ux-design` plus `references/product-experience.md` and
`references/visual-direction.md`. A redesign is not a fresh-project reset.
Dry-run: describe the proposed work only; write nothing.

1. Inspect the existing stack, routes, components, tokens, roles, data/API contracts,
   tests and approved design. Establish primary user jobs and constraints. Keep
   working functionality and project conventions; do not replace the stack merely
   to obtain a new look. Record proposed functional changes separately.
2. Run `/ui-audit` in review mode for the requested scope. Capture baseline screen
   and flow evidence; inventory contracts including deep links, filters, saved
   data, permissions, validations and analytics. Report unknowns and inaccessible
   coverage, not guessed success.
3. Write a redesign brief with problems, task outcomes, non-goals, preservation
   requirements and proposed scope. Apply ordinary plan approval requirements.
4. Present 2–3 context-driven directions through realistic rendered previews at
   narrow/wide widths plus a meaningful error/empty state. Include an evolution
   option; offer minimal luxury when the brief fits. Avoid generic catalogue-only
   output. Reuse picker chrome but create actual project-specific screen previews.
5. STOP for direction and scope approval before production UI changes. An existing
   approval may be reused only if it explicitly covers the selected direction.
6. Update project DIRECTION, tokens, inventory and UX-PACK with stable screen/flow
   IDs. Update architecture only where the design has an architectural consequence;
   preserve APIs, security and business logic unless separately approved.
7. Implement in small, reversible component/route batches within the approved plan.
   Retest critical behavior and inspect before/after at agreed viewports. Run the
   cookbook, task checks and bounded evidence/repair loop. Do not mark fixes done
   solely from source diffs or attractive screenshots.
8. Deliver change map, evidence-backed coverage, preserved/changed contracts,
   remaining issues and rollout/rollback notes. Unavailable runtime verification
   remains INCOMPLETE. Publication, merge and deployment need their own authority.
