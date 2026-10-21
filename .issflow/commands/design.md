---
description: Post-proposal DESIGN + ARCHITECTURE gates — produce UX pack and architecture note, stop for human approve before /phase (hard rule 15).
argument-hint: [optional: "ux" | "arch" | "both" · "dry-run"]
---

Caveman ULTRA mode. You are the ORCHESTRATOR.

Purpose: after a **client proposal is signed** (or when the project opts into these
gates), produce build-ready design + architecture artifacts and get human approve
**before** `/phase` runs. Vertical slices still build UX+code together — these gates
lock the *frame* first (model B).

DRY-RUN: if `$ARGUMENTS` contains `dry-run`/`--dry-run`, outline what you'd write
and STOP. Write nothing.

## PRE-FLIGHT
- Read `docs/OVERVIEW.md`, `docs/PLAN.md`, `docs/PROPOSAL.md` (if any), `docs/STATE.md`.
- PLAN must be approved (rule 13). If a proposal exists for quoted work, it should
  be signed off first (`/propose`) — otherwise warn and confirm they want design
  gates without a commercial proposal (internal projects may skip `/propose` and
  still run `/design`, or skip rule 15 entirely when STATE has `design: n/a` and
  `architecture: n/a` set deliberately for non-quoted work).

Target: `$ARGUMENTS` → `ux` | `arch` | `both` (default **both**).

## STEP 1 — UX PACK (if ux|both)
1. Apply `ux-design` skill (authoring mode): wireframe baseline + cookbook direction.
2. Scaffold or update `docs/UX-PACK.md` from `.issflow/templates/UX-PACK-template.md`.
3. Fill flows, screen inventory, tokens/frame, a11y notes from OVERVIEW + PLAN.
4. SHOW me UX-PACK.md. **STOP for approval.**
5. On approve: stamp `> Approval: approved <date> v<n>`; set `design: approved <date>`
   in STATE.md; HISTORY line `design v<n> approved`.
6. On change request: revise and re-show; header stays PENDING.

## STEP 2 — ARCHITECTURE (if arch|both)
1. Dispatch `researcher` (DESIGN) only if open unknowns remain; else use OVERVIEW.
2. Scaffold or update `docs/ARCHITECTURE.md` from
   `.issflow/templates/ARCHITECTURE-template.md`.
3. Apply `code-standards` architecture guidance; security trust boundaries via
   `security` skill when relevant.
4. SHOW me ARCHITECTURE.md. **STOP for approval.**
5. On approve: stamp header; set `architecture: approved <date>` in STATE.md;
   HISTORY line `architecture v<n> approved`. Optionally `/log-decision` for
   material pattern choices.
6. On change request: revise and re-show.

## STEP 3 — HANDOFF
When both required gates are approved (or N/A for internal skip):
- Tell me `/phase` is unblocked for rule 15.
- Reminder: frontend phases still run the `ux-design` CLOSE check (rule 9);
  architecture drift still needs `/log-decision` (rule 8).
