---
description: Bootstrap a new project. Runs design-research, double grill, and planning. Run once per project.
---

Caveman ULTRA mode.

Recommended: run from plan mode (Shift+Tab). Planning agents are read-only by
tool grant; plan mode adds a read-only gate on the main session too. Optional.

Goal: stand up a fresh project workspace with a well-grounded plan.

LANGUAGE: detect the user's language and run the WHOLE discovery in it. A Thai user
→ grill, summarise, and write OVERVIEW in **natural Thai** (keep tech terms in
English as a Thai team would). Record the project language in OVERVIEW so downstream
artifacts (PROPOSAL, the rendered proposal.html, docs) follow it. Be equally fluent
in English; just don't default to it when the user speaks Thai.

---

## Steps

### Round 1 — Initial grill

1. Run the `grill-me` skill to interrogate me. Goal: understand initial scope,
   known constraints, unknowns. Asking is encouraged here — planning is where human
   input is cheapest. Do not stop early. Do not write OVERVIEW.md yet.

Store the round-1 answers as working context — do NOT write OVERVIEW.md yet.

---

### Design research

2. Extract DESIGN TOPICS from the round-1 answers. These are things we need
   to verify before planning:
   - Each external service mentioned: what does it support at the relevant tier?
     Quotas, rate limits, known gaps?
   - Auth patterns: any constraints from the chosen auth provider for this scenario?
   - Any other architectural assumption in the round-1 answers worth verifying.

3. Dispatch `researcher` in DESIGN mode with the DESIGN TOPICS list.
   It returns a terse summary + file paths. Read the design-<slug>.md files
   only if needed.

---

### Round 2 — Research-informed re-grill

4. Run `grill-me` again — a second focused pass. Seed it with:
   - The round-1 answers (already established — do not re-ask these)
   - The design-research key findings and new questions raised

   The re-grill asks whatever it needs to build complete understanding — planning is
   interactive in both modes. Do not re-ask what round 1 already established clearly.

---

### Write OVERVIEW.md

5. Write docs/OVERVIEW.md from the COMBINED output of round-1 + design-research
   + round-2. Include:
   - Project purpose and success criteria
   - **Project language** (e.g. th / en / both) — downstream docs + proposal follow it
   - **Autonomy mode** for the dev loop (AUTO default / GUIDED) and the declared
     **stack** (framework, infra, auth, test + E2E runner, planning source)
   - **Architecture pattern** (default Feature-Based) + **code conventions / style
     guide** for the stack's language (`code-standards` skill) + the folder layout
   - **Estimation config** (for `/propose`): unit, rate card, currency, contingency,
     payment milestones
   - Scope and constraints (informed by research findings)
   - External services with confirmed capabilities/limits
   - Known risks / open questions (if any remain)

   OVERVIEW.md is written HERE — after the re-grill, not before.

---

### Foundations sign-off (confirm BEFORE planning)

5b. Before the `planner` runs, present the FOUNDATIONS for explicit human confirmation
— the whole plan is built on these, so lock them first. Show a concise summary and
STOP for sign-off (planning always asks, both modes):
- **Tech stack** — language · framework · infra · auth · datastore · test + E2E runner
- **Auth checklist** (if any login/user): provider · session vs token · social/LINE link · roles — must be answered or explicit `n/a`
- **Surfaces** — default `web-responsive` if unset; also pwa / line-oa / mobile-app as needed
- **Architecture** — the pattern (Feature-Based by default) + the folder layout
- **UX direction** — see STEP 5c Direction Picker when UI is in scope
- **Data & integrations** — core data model + external services + their limits
- **Conventions** — naming idiom (`code-standards`) + autonomy mode (AUTO / GUIDED) — recommend AUTO for PM-mode builds
- **Estimation config** — unit · rate card · currency · contingency (if quoting)
- **Timezone** — for delivery ETA dates (default `Asia/Bangkok` when project language is th)
On any "change X" → revise OVERVIEW.md and re-confirm. Only a signed-off foundation
proceeds to the planner. (This is the planning confirmation gate.)

### Direction Picker (when UI is in scope)

5c. If the product has UI (default yes unless OVERVIEW says none):
1. Copy `.issflow/templates/design/picker.html` → `docs/design/picker.html`.
2. Read `ux-design/references/visual-direction.md`. Create project-specific screen
   previews with realistic content at narrow/wide sizes and a meaningful non-happy
   state. Compare different compositions, not only swatches. Use picker chrome
   to link/show those previews; record if browser rendering could not be verified.
   Fill placeholders (names, swatches, fonts, blurbs, anti-patterns). Prefer
   `ui-ux-pro-max` `--design-system` output; if Python 3 is missing, use the three
   fallback presets as inspiration only, adapted to the brief, never the final identity.
   **Do not freehand redesign the HTML/CSS chrome.**
3. SHOW me the picker path and STOP for choice (A/B/C).
4. On choice: write `docs/design/DIRECTION.md` + `docs/design/tokens.css` from templates;
   set STATE `design-direction: locked <id> <date>`; HISTORY line.
5. Internal skip: only if UI truly out of scope — set `design-direction: n/a`.

### Plan

6. Hand OVERVIEW.md + design-research findings to the `planner` subagent.
   PLAN.md MUST:
   - Start with Phase 0 (infra setup) only if infra is self-managed; with
     managed infra, Phase 0 is N/A and the plan starts at Phase 1.
   - End with a final code phase that contains the deploy task block.
   - Tag each phase `size: S|M|L|XL` and `lane: lite|full` (lite only when no new
     primary UI and not final/security-sensitive).

7. Create docs/STATE.md (keep ≤ ~25 lines at top; include delivery board):
```
# STATE

phase: 0 (pending)
plan: PENDING
design-direction: locked <id> <date> | PENDING | n/a
design: PENDING
architecture: PENDING
surfaces: web-responsive
timezone: Asia/Bangkok
delivery:
  package: bootstrap
  agent_eta: none
  phase_etas: []
  status: WAITING_ON_HUMAN
  waiting_for: plan approve
  waiting_since: <ISO-date>
  stale_after: <ISO-date+24h>
  eta_paused: true
  next_human_action: approve PLAN.md
  slip_reason: none
completed: project bootstrapped — design research done, double grill done
blocker: none
```
(For internal non-quoted work you may set `design: n/a` and `architecture: n/a`
instead of PENDING so rule 15 does not block `/phase`.)
8. Create docs/ISSUES.md with header `# Issues` and `## Archived` section.

9. Create empty docs/HISTORY.md.

10. Create docs/ENDPOINTS.md:
 ```
 # Endpoints — <project name>
 > Maintained by implementer. Updated each phase.
 > Base URL: (populated after deployment phase)
 ```

---

### PLAN-APPROVAL gate (hard rule 13 — always interactive, both modes)

11. The plan is the contract the whole AUTO dev loop builds against, so it ends with a
    human sign-off — the planning twin of the `/propose` commercial gate.

    **Plan-Ready checklist** (must pass before you ask me to approve):
    - Every phase has testable acceptance (no vague “make it good”)
    - No TBD on auth / money / PII / primary surfaces
    - If UI in scope: `design-direction` locked (or n/a) and screen IDs listed or stubbed
    - Phase dependencies clear; size + lane tags present
    - Open risks listed — material open questions block approve

    - SHOW me PLAN.md + Plan-Ready result. **STOP for approval.**
    - On **approval**: record the sign-off in three places —
      1. stamp the PLAN.md header `> Approval: approved <YYYY-MM-DD> v1`;
      2. set `plan: approved <YYYY-MM-DD>` in docs/STATE.md; clear waiting_for / set delivery status AGENT_ACTIVE when build starts;
      3. append `<YYYY-MM-DD> plan v1 approved` to docs/HISTORY.md (date-first, to
         match the other HISTORY lines).
      Only now may `/phase` / `/sprint` run.
    - On **rejection / change**: revise (re-run the `planner`, or `/replan`), bump the
      version, and re-show. The header stays `PENDING` until I approve.

    AUTO governs the development loop that runs AFTER this gate, never the gate itself.

Optional next steps (client / quoted work):
1. `/propose` — proposal + estimate (asks rate in chat; client docs stay totals-only).
   Screen appendix MUST use locked `docs/design/tokens.css` + screen IDs.
2. `/design` — UX pack + architecture approve gates (hard rule 15) before `/phase`.
   Upgrade existing frames — do not re-roll direction if locked.

Internal or personal projects may skip `/propose` and set `design: n/a` /
`architecture: n/a` in STATE, then go to `/phase`.
