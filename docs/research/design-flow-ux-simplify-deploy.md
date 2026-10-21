# Design research — flow UX simplify + software-house delivery

**Date:** 2026-10-21  
**Mode:** DESIGN (kit product surface)

## Questions

1. How should default vs advanced commands surface on landing / HOW-TO without cutting capability?
2. How should client commercial docs stay private on rate while still estimating?
3. How to add UX + architecture sign-off without abandoning vertical slices?

## Findings

### Default paths
Research and existing HOW-TO already converge on three situations: `/overview`,
`/feature`, `/quick`. Landing previously buried them below marketing sections.
Elevate in hero + howto; label remaining commands Advanced.

### Commercial privacy
Public kits must not ship personal rate defaults. Industry practice: ask rate at
quote time; client artifacts show lump totals (phase costs + grand total). Hide
contingency % on the client page — fold it into the numbers.

### Post-proposal design (model B)
Classic sequential house stages (UX → Arch → Dev) fight the kit’s vertical-slice
engine. Prefer **gates**: approved UX pack + architecture note before `/phase`,
then slices still build UI+code together with existing rule-9 UX CLOSE checks.

### Support
After-go-live needs triage (severity, warranty vs billable) in front of
`/quick` / `/change-request`. Thin `/support` + `support-triage` skill.

## Implications for PLAN / ship

- Commands: propose, change-request, design, support, phase preflight, release STAGE 8
- Templates: UX-PACK, ARCHITECTURE, CR; proposal.html totals-only
- METHODOLOGY: lifecycle + rule 15 + roles map + Default/Advanced routing
- Surfaces: index / HOW-TO / README / how-to-use.html
- Version: create-issflow 1.8.0; no rate numbers in public docs
