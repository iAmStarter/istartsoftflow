# Product experience review and design

Use with the cookbook, not instead of it. Start with the user's job, not a visual
style. This is an expert evaluation until actual participants test it. Never call
an agent walkthrough user research or claim that an automated score proves usability.

## 1. Understand and bound
Record mode: new product, audit/review (read-only product), or redesign. Read the
existing router, product documentation, components, tokens, tests and analytics
provided by the owner. Identify primary users, jobs, context, devices, language,
constraints and measurable outcomes. Label assumed personas and hypotheses; do
not invent interviews, conversion lifts or customer evidence. Ask only questions
that change a material decision. List exclusions and inaccessible roles/routes.

For existing products, baseline routes, deep links, query state, permissions,
validation, API/data contracts, analytics, saved data and keyboard behavior before
changing UI. A redesign preserves these contracts unless a separate behavior
change is approved. Capture before screenshots and critical-path tests where
possible. Missing tests are a risk, not proof there is nothing to preserve.

## 2. Model tasks and information architecture
Give flows and screens stable IDs. For each critical job, map entry → decision →
action → feedback → next step/recovery, including cross-screen and off-screen
steps. Review navigation labels, grouping, search/filter/sort, findability, current
location, recognition versus recall, progressive disclosure and novice/expert use.
Check that the primary action is discoverable and reflects the user's goal.

Walk through success, first use, empty data, large/long data, partial results,
loading, slow/offline service, validation failure, denied access, session expiry,
interruption/resume, duplicate submission, cancel/close, undo and Back/Forward.
Verify what is persisted, lost or repeated. Avoid hidden fees, manipulative defaults,
misleading urgency and obstructive cancellation. Error copy explains the problem,
preserves valid input and offers a concrete recovery action.

## 3. Visual hierarchy and brand
Read `visual-direction.md`. Evaluate hierarchy, reading order, grouping, density,
alignment, typography, imagery, affordances and consistency in service of the task.
An 8pt grid or familiar component library is a project convention, not a universal
usability law. Preserve the approved system; document justified optical exceptions.
Screens with different jobs may need different compositions, not identical cards.

## 4. Inclusive interaction
Target WCAG 2.2 AA, with criterion-specific evidence and applicable exceptions.
Check semantics/name/role/value, keyboard-only completion, focus order and return,
focus not hidden by sticky UI, modal escape, skip links, announcements and errors.
Check 200% text resize and reflow at 320 CSS px (including zoom), long translations,
text spacing, portrait/landscape, touch/coarse pointer and reduced motion.
Text contrast is normally 4.5:1, large text 3:1; meaningful non-text contrast 3:1.
SC 2.5.8 uses 24×24 CSS px minimum targets OR its spacing/other exceptions;
44×44 is the enhanced AAA target and a useful touch design preference, not AA.
Include accessible authentication, redundant-entry avoidance, non-drag alternatives
and consistent help where applicable. Screen reader/assistive-technology checks
require actual manual evidence; axe or screenshots alone cannot establish these.

## 5. Browser verification and bounded repair
Inventory the full declared scope; prioritize critical flows and shared patterns.
Use an authorized local/test environment and safe fixtures. Do not perform real
payments, destructive actions or send messages merely to test a flow. Assign
bounded route/flow batches to workers; share stable IDs, build, viewport and rubric.
A shared component can be reviewed once, but verify integration in each critical
context. Sampling must list sampled and unsampled routes; never label it exhaustive.

For each check record target, dimension, method, expected/actual behavior, result,
build/revision, browser, viewport, role and evidence artifact path. Screenshots
support appearance, not successful interactions; retain action/DOM/test evidence
for behavior. Record exact automated commands and results. Browser unavailable,
login blocked or missing fixtures means blocked/not-run, never pass by inference.
Deduplicate findings by root cause and enumerate affected screens separately.

If implementation is authorized, fix in bounded batches (default two repair passes
per finding), rerun the failed checks and affected critical flows, capture after
evidence, and stop with remaining issues when the budget or capability is exhausted.
Reproduce before fixing. Do not weaken tests or remove functionality to get green.
Regression coverage includes repeated actions, interruption, dismissal and history.

## 6. Report honestly
Use `UX-AUDIT-template.md` and optional `UX-EVIDENCE-template.json`. Required
coverage is explicit per target. Every finding has task impact, reproduction,
severity, source principle, evidence, fix and retest outcome. BLOCKER means a
critical task cannot be completed or serious accessibility/data risk; MAJOR means
material friction or broken behavior; MINOR means limited polish. Prioritize by
impact, frequency, affected users and confidence, not aesthetic preference alone.

Report FIX-FIRST for open blocker/major issues, INCOMPLETE for untested required
coverage, or REVIEWED for completed declared scope. REVIEWED is not a release
approval, WCAG certification or proof of user satisfaction. Include independent
user-testing needs and unknowns; no blended score may hide a critical defect.
Validate the structured report with `node .issflow/scripts/ux-evidence.js <report.json>`.
The validator checks evidence bookkeeping, not screenshot authenticity or UX quality.

## Primary references (reviewed 2026-11-08)
- Nielsen's heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
  Task feedback, familiar language, user control, prevention and recovery provide
  a heuristic lens, not a substitute for observing real users.
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI target-size explanation: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- WAI evaluation limits: https://www.w3.org/WAI/test-evaluate/tools/selecting/
- GOV.UK moderated usability testing: https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing
  Test realistic tasks with relevant participants, observe their behavior, and
  distinguish findings from opinions about visual preference.

## Structured evidence fields
`UX-EVIDENCE-template.json` starts as not-run and intentionally cannot pass.
Use version 1, mode audit/redesign/new, the actual revision/build, and a scope of
screen/flow IDs with names. Checks have unique IDs, targetId, dimension, status,
method and evidence references for pass/fail. blocked/not-run/not-applicable need
an explanation. One consolidated result per target/dimension prevents conflicting
passes hiding failures. Baseline dimensions are required; requiredDimensions adds
project-specific checks. Redesign additionally requires behavior-preservation.

Methods: browser, manual, automated, static or user-research. Automated checks must
state environment: rendered or source. Interactive dimensions need rendered checks
to complete; static/manual observations remain useful but are not browser proof.
Use additional dimension IDs for specific manual assistive-technology checks.
Findings use unique ID, targetId, severity, status and description. A fixed finding
needs retestEvidence; accepted needs acceptedBy and reason. Accepted material risk
still prevents REVIEWED. Preserve expected/actual, browser/viewport/role and detailed
steps in the Markdown report or linked evidence. No arbitrary path or URL in an
evidence reference is opened by the validator.
