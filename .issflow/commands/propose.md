---
description: Turn approved requirements + tech stack into a client proposal — scope, packages, effort + cost estimate, timeline, assumptions, screen appendix, and a sign-off gate. Run after /overview, before building.
argument-hint: [optional: rate / budget / constraints · "dry-run" to preview]
---

Caveman ULTRA mode. You are the ORCHESTRATOR.

Purpose: produce `docs/PROPOSAL.md` — WHAT we build, in what packages, how long, how
much, and on what assumptions — for the client to approve BEFORE any build starts.
A proposal is a commercial gate: always interactive (both AUTO and GUIDED).

DRY-RUN: if `$ARGUMENTS` contains `dry-run`/`--dry-run`, do the full analysis but
EXECUTE NOTHING — print the ACTION PLAN (scope, phase breakdown, package collapse,
rough estimate) and STOP. No PROPOSAL.md / proposal.html is written.
(METHODOLOGY → Dry-run.)

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

## STEP 2 — PHASE BREAKDOWN (internal)
Derive the vertical-slice phases (or read `docs/PLAN.md` if it exists). Size each:
- complexity: **S | M | L | XL**
- effort: an ideal-days RANGE (e.g. 2–3d), + story points if your team uses them
- risk / unknowns: what could move the estimate

Keep this sizing for the **chat math**. Do **not** dump every PLAN phase onto the
client table — collapse into packages in STEP 5.

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
   or template. If you create `docs/ESTIMATE.local.md`, add it to the project's
   `.gitignore` when it is not already listed.
4. Configurable fields (ask or read — no invented kit defaults for money):
   - **unit:** ideal-days | hours | story-points | both
   - **rate card:** blended OR per-role (senior / mid / junior…)
   - **currency:** as declared (ask if unset; THB is common for Thai clients)
   - **contingency:** % buffer for unknowns (ask if unset)
   - **payment split:** e.g. 30/40/30 — **ASK once; do not guess** a ratio
   - **language:** rendered doc language (default = project language)

Ask these **once each** if unset (commercial input — do not invent kit defaults):

- **Hours columns:** does the client table show estimated hours next to billed
  hours? If yes → columns ประเมิน / คิดเงิน / ยอด. If no / unset → ชุดงาน + ยอด
  only. Hours are effort, not a rate — still never print the rate.
- **Managed hosting / database:** is platform hosting+database **in** the quoted
  total? If **not included**, write clearly on page 1 (out of scope + exclusions)
  that the client pays the provider directly. A one-line exclusion is enough —
  do **not** paste vendor SKU/price tables into the kit or invent list prices.
- **Bank:** include a bank block **only if the human provides** account details
  in this project. No kit default. If none given, omit the column.

Compute cost per phase, then a **Total as a RANGE (low–high)** that already folds
in contingency. Show the math **in chat to the human** (rate × effort + contingency).
**Timeline:** phases in dependency order → calendar estimate (note parallelism).

### CLIENT-DOC RULE (hard — commercial privacy)
Client-facing artifacts (`docs/PROPOSAL.md` client sections, `docs/proposal.html`,
and any PDF/print) MUST show **totals and package costs only**.
**Never** print: hourly/day rates, rate cards, contingency %, “incl. X% buffer”,
salary, or the estimate math. Contingency is already inside the numbers — do not
label it on the client page.

## STEP 4 — ASSUMPTIONS & EXCLUSIONS
List every assumption the estimate rests on (infra provided, third-party/licence
costs excluded, content/design provided, etc.). These are the baseline that
change-orders re-price against.

If hosting/database is not in the quote, the exclusion **must** say the client
pays the provider directly.

## STEP 5 — WRITE + RENDER
Collapse the internal PLAN phases into **3–6 client packages / sprints** that a
non-engineer can read. PLAN may have any number of phases; the sign page does not
list them all.

Payment copy = short **software delivery events** tied to those packages, e.g.
deposit on sign-off then work starts · when the main package is usable · when
production is up within the scope on this quote. **Never** construction wording
(% structure, house handover, site prep / equipment staging).

1. Write `docs/PROPOSAL.md` — the SOURCE OF TRUTH (versioned v1 + date). This is
   what `CHANGES.md` re-prices against. **Client-safe** body (no rate / no
   contingency %):
```
# Proposal — <project>   (v1, <date>)
## Scope        — in-scope: … | out-of-scope: …
## Packages     — table: package | cost
                — or package | estimated | billed | cost  (only if hours columns requested)
## Total        — <low>–<high>   ← totals only; no “incl. X% contingency”
## Timeline     — <estimate>, dependency order
## Assumptions  — …
## Exclusions   — … (hosting/database: client pays provider, if that was the answer)
## Payment      — software delivery events + the asked split (if any)
## Screens      — docs/proposal.html pages 2–N (or “none — no UI in scope”)
                — not pixel-binding; sign page 1 only; page count must match the HTML
## Sign-off     — approved by: ___  date: ___  version: v1
```
   Point the Screens section at the **real** HTML page range after render
   (page 1 = sign · remaining sheets = screen appendix). Keep PROPOSAL.md and
   `docs/proposal.html` in sync.
   If you keep an internal rate memo, put it in a **separate private** file (not
   the client PROPOSAL.md / HTML). PROPOSAL.md itself stays client-safe so it can
   be shared.

2. RENDER a client-facing `docs/proposal.html` from `.issflow/templates/proposal.html`
   (Claude Code also mirrors this under `.claude/templates/` — same file). Copy it,
   replace every `{{PLACEHOLDER}}`, and fill the CONTENT in the declared language
   (the section labels are already bilingual TH / EN).

   **Page 1 = the only signable A4 sheet.** Be terse (≈ 3–6 package rows, ≈ 4
   assumptions, short scope items). If page 1 overflows A4, **trim the sign-page
   copy first** — never spill the sign block onto page 2. The screen appendix may
   grow extra `.sheet` pages.

   Fill `{{PACKAGE_TABLE}}` with the matching header:
   - default: ชุดงาน / Packages + Cost
   - if hours columns requested: ประเมิน / คิดเงิน / ยอด (and EN equivalents)
   Fill `{{BANK_COL}}` only when the human gave bank details; otherwise leave
   empty so payment takes the full width.
   Fill `{{COMPANY}}` / `{{COMPANY_TAGLINE}}` / `{{LOGO}}` from the ISSUING
   company's brand declared in OVERVIEW (or ask once) — white-label, never
   hardcode the kit's name. Leave `{{TOTAL_NOTE}}` empty or a non-rate line
   (e.g. currency / “ราคารวมทั้งโครงการ”) — **never** a contingency % or rate.
   Set `{{PAGE_FOOTER}}` to the real page count (e.g. sign page 1 of N).

   **Screen appendix (required when UI is in scope)** — same `docs/proposal.html`,
   not a second signable file. After page 1's page-break, emit `.sheet.screens`
   into `{{SCREEN_SHEETS}}`:
   - Build frames from **PLAN + OVERVIEW** modules/capabilities (empty chrome is
     fine). Do **not** wait for UX-PACK (that gate is after sign-off).
   - Cover **every** in-scope module and capability — not a 4–8 frame sampler.
   - Group sheets by package; module bar on each sheet; numbered short captions
     under frames.
   - Label: not pixel-binding. Sign on page 1 only. **No emoji as icons.**
   - Use the template's desk/phone/sidebar/card/table CSS. Do not invent a
     parallel stylesheet.

   Print-ready (Ctrl/Cmd-P → A4 → Save as PDF). Keep PROPOSAL.md and proposal.html
   in sync.

## STEP 6 — SIGN-OFF GATE
Show me the proposal. **STOP for approval** (commercial gate — always interactive).
Do **not** run `/design` or `/phase` yourself.

On approval: record the approved version + date in PROPOSAL.md and STATE.md, and
append a HISTORY line `proposal v<n> approved (<total>)`.

**Next (quoted / client work):** before `/phase`, run the **DESIGN + ARCHITECTURE
gates** (METHODOLOGY lifecycle · hard rule 15) — produce `docs/UX-PACK.md` +
`docs/ARCHITECTURE.md`, get human approve, stamp STATE. Building starts only after
proposal sign-off **and** those gates (or explicit skip for internal non-quoted
work). On rejection: revise per feedback and re-show.
