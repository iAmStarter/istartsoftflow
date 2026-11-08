---
description: Post-proposal DESIGN + ARCHITECTURE gates — upgrade locked direction into UX pack + architecture, stop for human approve before /phase (hard rule 15).
argument-hint: [optional: "ux" | "arch" | "both" · "dry-run"]
---

Caveman ULTRA mode. You are the ORCHESTRATOR.

Purpose: after a **client proposal is signed** (or when the project opts into these
gates), produce build-ready design + architecture artifacts and get human approve
**before** `/phase` runs. Vertical slices still build UX+code together — these gates
lock the *frame* first (model B).

DRY-RUN: if `$ARGUMENTS` contains `dry-run`/`--dry-run`, outline what you'd write
and STOP. Write nothing.

## Existing-product entry
For reviewing an existing product use `/ui-audit`; for changing its UX/UI use
`/redesign`. Do not force an existing project through commercial proposal or fresh
bootstrap. Preserve its stack and behavior contracts unless change is approved.
Read `ux-design/references/visual-direction.md` for contextual preview requirements.

## PRE-FLIGHT
- Read `docs/OVERVIEW.md`, `docs/PLAN.md`, `docs/PROPOSAL.md` (if any), `docs/STATE.md`,
  `docs/design/DIRECTION.md`, `docs/design/tokens.css`.
- PLAN must be approved (rule 13). If a proposal exists for quoted work, it should
  be signed off first (`/propose`) — otherwise warn and confirm they want design
  gates without a commercial proposal (internal projects may skip `/propose` and
  still run `/design`, or skip rule 15 entirely when STATE has `design: n/a` and
  `architecture: n/a` set deliberately for non-quoted work).
- **Direction:** if UI in scope and `design-direction` is not locked → STOP; run
  overview Direction Picker first. If locked → **do not** re-run `ui-ux-pro-max`
  restyle unless the human explicitly asks to change look (then re-approve).

Target: `$ARGUMENTS` → `ux` | `arch` | `both` (default **both**).

## Design scale (pick one; say it out loud)

| Scale | When | Artifact depth |
|-------|------|----------------|
| Spike | Feasibility only | Short answer — no UX-PACK |
| Bounded | Small change to existing UI | Short design in chat or thin UX-PACK + approve |
| Architectural | New product / subsystem / auth boundary / multi-surface | Full UX-PACK(s) + ARCHITECTURE |

## STEP 1 — UX PACK (if ux|both)
1. Scaffold or update `docs/UX-PACK.md` from `.issflow/templates/UX-PACK-template.md`.
2. Fold **locked** DIRECTION + tokens — do not invent a second palette.
3. Apply `ux-design` skill (authoring): wireframe baseline + cookbook. Screen inventory
   must use stable IDs from propose appendix when present.
4. Per primary screen: goal, primary CTA, empty/loading/error, <SM and ≥MD notes.
5. If `surfaces` includes more than web: add `docs/design/<surface>/` notes (PWA /
   line-oa / mobile packs — see templates under `.issflow/templates/design/platforms/`).
6. Update `docs/design/inventory.md` — reuse only listed components.
7. SHOW me UX-PACK.md. **STOP for approval.**
8. On approve: stamp `> Approval: approved <date> v<n>`; set `design: approved <date>`
   in STATE.md; HISTORY line `design v<n> approved`.
9. On change request: revise and re-show; header stays PENDING.
10. Quoted + UI: after approve, **regenerate** `docs/proposal.html` screen sheets from
    the same screen IDs + tokens so the PDF matches what will be built.

## STEP 2 — ARCHITECTURE (if arch|both)
1. Dispatch `researcher` (DESIGN) only if open unknowns remain; else use OVERVIEW.
2. Scaffold or update `docs/ARCHITECTURE.md` from
   `.issflow/templates/ARCHITECTURE-template.md`.
3. Include **Auth decision record** when users/login exist (provider, session model,
   identity linking, roles) — grill briefly if still open.
4. Apply `code-standards` architecture guidance; security trust boundaries via
   `security` skill when relevant.
5. SHOW me ARCHITECTURE.md. **STOP for approval.**
6. On approve: stamp header; set `architecture: approved <date>` in STATE.md;
   HISTORY line `architecture v<n> approved`. Optionally `/log-decision` for
   material pattern choices.
7. On change request: revise and re-show.

## STEP 3 — HANDOFF
When both required gates are approved (or N/A for internal skip):
- Tell me `/phase` is unblocked for rule 15.
- Reminder: frontend phases still run the `ux-design` CLOSE check (rule 9) + task
  check; architecture drift still needs `/log-decision` (rule 8).
