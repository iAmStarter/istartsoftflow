---
description: Turn approved requirements + tech stack into a client proposal — scope, phase breakdown, effort + cost estimate, timeline, assumptions, and a sign-off gate. Run after /overview, before building.
argument-hint: [optional: rate / budget / constraints · "dry-run" to preview]
---

Caveman ULTRA mode. You are the ORCHESTRATOR.

Purpose: produce `docs/PROPOSAL.md` — WHAT we build, in what phases, how long, how
much, and on what assumptions — for the client to approve BEFORE any build starts.
A proposal is a commercial gate: always interactive (both AUTO and GUIDED).

DRY-RUN: if `$ARGUMENTS` contains `dry-run`/`--dry-run`, do the full analysis but
EXECUTE NOTHING — print the ACTION PLAN (scope, phase breakdown, rough estimate)
and STOP. No PROPOSAL.md / proposal.html is written. (METHODOLOGY → Dry-run.)

## PRE-FLIGHT
Read `docs/OVERVIEW.md` (scope, stack, success criteria) and `docs/PRD.md` if
present (else the PRD in your BMAD/iSSM). No OVERVIEW -> run `/overview` first.

PLAN-APPROVAL CHECK (hard rule 13): the proposal prices the *approved* phases, so
the plan is signed off first (lifecycle: plan → proposal). If `docs/PLAN.md` exists
and its `> Approval:` header still reads `PENDING` (or is missing), STOP and route me
to the `/overview` PLAN-APPROVAL gate before quoting — pricing an unapproved plan
re-prices on every revision.

## STEP 1 — SCOPE
List the deliverables (features / epics) from OVERVIEW / PRD. Mark each
**in-scope** or **out-of-scope** explicitly — naming out-of-scope items now is what
prevents silent scope creep (and grounds change-order re-pricing later).

## STEP 2 — PHASE BREAKDOWN
Derive the vertical-slice phases (or read `docs/PLAN.md` if it exists). Size each:
- complexity: **S | M | L | XL**
- effort: an ideal-days RANGE (e.g. 2–3d), + story points if your team uses them
- risk / unknowns: what could move the estimate

## STEP 3 — ESTIMATE (ask rate · never invent a kit default)
Estimation config is **project-private**. The public kit ships **no** default rate
card and **no** sample salary/rate numbers — rates are confidential.

1. Read estimation fields from OVERVIEW **only if the human already put them there
   for this project** (unit, rate card, currency, contingency, milestones, language).
2. If **rate card** or **contingency** is missing → **ASK once** in chat (commercial
   input, allowed). Do not guess. Do not copy rates from other repos or prior chats
   into kit files.
3. Optional: store the answered rate/contingency in a **project-local** file the
   team keeps private (e.g. `docs/ESTIMATE.local.md` gitignored, or OVERVIEW fields
   that never get published). Never commit personal rate/salary into a public kit
   or template.
4. Configurable fields (ask or read — no invented kit defaults for money):
   - **unit:** ideal-days | hours | story-points | both
   - **rate card:** blended OR per-role (senior / mid / junior…)
   - **currency:** as declared (ask if unset; THB is common for Thai clients)
   - **contingency:** % buffer for unknowns (ask if unset)
   - **payment milestones:** by-phase, split (e.g. 30/40/30), or none
   - **language:** rendered doc language (default = project language)

Compute cost per phase, then a **Total as a RANGE (low–high)** that already folds
in contingency. Show the math **in chat to the human** (rate × effort + contingency).
**Timeline:** phases in dependency order → calendar estimate (note parallelism).

### CLIENT-DOC RULE (hard — commercial privacy)
Client-facing artifacts (`docs/PROPOSAL.md` client sections, `docs/proposal.html`,
and any PDF/print) MUST show **totals and phase costs only**.
**Never** print: hourly/day rates, rate cards, contingency %, “incl. X% buffer”,
salary, or the estimate math. Contingency is already inside the numbers — do not
label it on the client page.

## STEP 4 — ASSUMPTIONS & EXCLUSIONS
List every assumption the estimate rests on (infra provided, third-party/licence
costs excluded, content/design provided, etc.). These are the baseline that
change-orders re-price against.

## STEP 5 — WRITE + RENDER
1. Write `docs/PROPOSAL.md` — the SOURCE OF TRUTH (versioned v1 + date). This is
   what `CHANGES.md` re-prices against. **Client-safe** body (no rate / no
   contingency %):
```
# Proposal — <project>   (v1, <date>)
## Scope        — in-scope: … | out-of-scope: …
## Phases       — table: phase | complexity | effort (range) | cost
## Total        — <low>–<high>   ← totals only; no “incl. X% contingency”
## Timeline     — <estimate>, dependency order
## Assumptions  — …
## Exclusions   — …
## Payment      — milestones (if any)
## Sign-off     — approved by: ___  date: ___  version: v1
```
   If you keep an internal rate memo, put it in a **separate private** file (not
   the client PROPOSAL.md / HTML). PROPOSAL.md itself stays client-safe so it can
   be shared.

2. RENDER a client-facing `docs/proposal.html` from `.claude/templates/proposal.html`:
   copy it, replace every `{{PLACEHOLDER}}`, and fill the CONTENT in the declared
   language (the section labels are already bilingual TH / EN). It must fit ONE A4
   page — be terse (≈ 3–6 phase rows, ≈ 4 assumptions, short scope items); trim before
   it spills to a second page. Fill `{{COMPANY}}` / `{{COMPANY_TAGLINE}}` / `{{LOGO}}`
   from the ISSUING company's brand declared in OVERVIEW (or ask once) — white-label,
   never hardcode the kit's name. Leave `{{TOTAL_NOTE}}` empty or a non-rate line
   (e.g. currency / “ราคารวมทั้งโครงการ”) — **never** a contingency % or rate.
   Print-ready (Ctrl/Cmd-P → A4 → Save as PDF). Keep PROPOSAL.md and proposal.html
   in sync.

## STEP 6 — SIGN-OFF GATE
Show me the proposal. **STOP for approval** (commercial gate — always interactive).
On approval: record the approved version + date in PROPOSAL.md and STATE.md, and
append a HISTORY line `proposal v<n> approved (<total>)`.

**Next (quoted / client work):** before `/phase`, run the **DESIGN + ARCHITECTURE
gates** (METHODOLOGY lifecycle · hard rule 15) — produce `docs/UX-PACK.md` +
`docs/ARCHITECTURE.md`, get human approve, stamp STATE. Building starts only after
proposal sign-off **and** those gates (or explicit skip for internal non-quoted
work). On rejection: revise per feedback and re-show.
