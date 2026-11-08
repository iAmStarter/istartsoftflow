# Existing-product UX review and redesign capability

## Scope and baseline

Implemented locally against tree `3f8cc5ba9618e1435fcb3fa8b3b5d8fe5e836a44`, verified
against GitHub main `b9145e686df76e6215be539e4cc301e03484cfd6` on 2026-11-08.
The local checkout commit has the same content tree, not the same merge commit.
Priority is existing-project audit/review/redesign. New-product foundations remain
available, but a full new-project architecture/stack-selection expansion is later.
No npm version bump, publication, PR, push, merge or deployment is included.

## Why change the existing workflow

The prior cookbook emphasized tokens, spacing, contrast and frame compliance.
The whole-product audit inherited that rubric, auto-repaired findings after a
review request, and used a SHIP verdict without explicit untested coverage. The
picker emphasized preset swatches rather than real task compositions. These are
useful visual checks, but not sufficient product UX evaluation.

## Implemented workflow

1. Audit existing users' jobs, current architecture, routes and behavior contracts.
2. Model task journeys, navigation, errors, recovery and interrupted/repeated work.
3. Review visual hierarchy, content, accessibility, responsiveness and consistency.
4. Report evidence-backed findings with severity, scope, sampling and unknowns.
5. For authorized redesign, compare contextual previews and approve a direction.
6. Preserve contracts, implement bounded changes and rerun affected critical paths.

The updated `/ui-audit` defaults to product read-only. `/redesign` is the explicit
existing-product entry and does not force a new stack or commercial proposal.
The UX pack and audit/evidence templates carry stable flow and screen IDs.
The new portable validator derives completeness from required coverage rather
than trusting a hand-written score. It cannot verify artifact contents.

## Visual direction

Distinctiveness is a design process, not a claim that generated work is unique.
Require realistic content, audience/brand rationale, different compositions and
narrow/wide/non-happy-state previews. Minimal luxury is one possible expression,
not a default palette or a mandate for every product. Avoid generic patterns
without a task/context reason. Preserve an existing product's recognizable equity.

## Research and applied decisions

- [Nielsen's usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/):
  use feedback, familiar language, control, recognition, prevention and recovery
  to evaluate tasks rather than just styling. Heuristics are expert guidance.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and
  [target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html):
  upgrade the target to 2.2 AA and correct 44px-as-AA language. SC 2.5.8 uses 24px
  minimum or its exceptions. Include focus obstruction and accessible authentication.
- [WAI evaluation tool limits](https://www.w3.org/WAI/test-evaluate/tools/selecting/):
  automated checks complement manual evaluation, not certify accessibility.
- [GOV.UK moderated usability testing](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing):
  observe relevant people performing realistic tasks. An AI walkthrough does not
  establish actual user satisfaction or validated conversion improvement.

Sources were opened/reviewed on 2026-11-08. The portable skill contains the working
rubric and direct references; no external content executes as instructions.

## Honest limits and next validation

This deliverable is portable agent workflow guidance, templates and a deterministic
evidence validator, not a new autonomous browser engine or a trained design model.
The host must provide browser access and safe test fixtures for runtime verification.
Rendered previews and real browser repair on an example product remain untested
until the user supplies that repository. Do not substitute an invented example as
proof. Independent participant/assistive-technology testing remains necessary.

A separate example-repository trial should measure: inventory completeness,
critical-task findings, preview quality and differentiation, preserved behavior,
repair success, and whether the final report truthfully identifies missed coverage.
