# Design research — SDLC refresh (UI SoT, ETA, session, models)

**Date:** 2026-11-04  
**Mode:** DESIGN (kit product)

## Questions

1. How to stop AI UI drift and keep propose mocks aligned with build?
2. How to make agent finish dates honest (vs waiting on humans)?
3. How to keep sessions token-lean across hosts?
4. How to recommend models per host without hardcoding unverified IDs?

## Findings

### UI SoT + Direction Picker

Industry practice: tokens + component inventory + lint beat prose cookbooks alone.
Agency flow: lock visual direction before hi-fi; upgrade the same frames after quote.
Kit already has `ui-ux-pro-max` + wireframe + proposal desk/phone chrome — gap is
**lock-before-propose** and **deterministic picker HTML** (no freeform agent CSS).

Default surface: `web-responsive`. PWA / LINE OA / mobile get separate packs later.

### ETA / anti-loop

Exit conditions + circuit breakers are required for agent loops. Split clocks:
scope effort (commercial) · agent-active ETA · waiting-on-human. Stale human gates
must surface as `WAITING_STALE`, not “AI never finishes.”

### Session economy

SessionStart should stay ~200–500 tokens (Tier A). Prefer handoff file + `/clear`
over compact when near budget. Synthesizer must preserve `delivery:` block.

### Models

Keep agent frontmatter aliases (`haiku|sonnet|opus|inherit`). Document host mapping
in MODEL-MATRIX. Existing adaptive router stays advisory/fail-closed — MATRIX is
human guidance, not an executable ID hardcode.

## Implications for ship

- P0: picker template, tokens SoT, ETA board, Plan-Ready, session Tier A, phase lite, MATRIX, HOW-TO
- P1: platform packs, dual estimate on propose, token lint, kit landing copy/visual
