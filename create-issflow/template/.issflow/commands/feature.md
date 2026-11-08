---
description: Feature lane — one APPROVED Feature doc in, a tested + hardened + documented feature branch out. Near-100% hands-off; humans remain at doc approval, UAT, and merge. Runs interactive or headless (CI / Docker).
argument-hint: [path to Feature doc, e.g. docs/features/<slug>/FEATURE.md · "dry-run"]
---

Caveman ULTRA mode. You are the ORCHESTRATOR. Route work to subagents —
use native isolated workers when available; otherwise use sequential role passes
per METHODOLOGY → Host capabilities and continuity. Only YOU report to the user.
Speak PM-style (ETA / stage / WAITING / DONE).

Before build slices: set STATE `delivery:` agent_eta from phase sizes; update
stage lines; on human gates set WAITING_ON_HUMAN + waiting_since + stale_after.
UI work must respect `docs/design/tokens.css` + inventory when present.

Target doc: $ARGUMENTS  (default: the single `docs/features/*/FEATURE.md` whose
`> Status:` reads `approved, pending` — zero or multiple candidates -> STOP and list them.)

---

## ENTRY MODES (before the pipeline)

- **`/feature new <name>`** — scaffold only. Copy
  `.issflow/templates/FEATURE-template.md` to `docs/features/<kebab-name>/FEATURE.md`,
  fill `<feature name>`, then STOP: the human writes the spec and flips
  `> Approval:` to APPROVED. Never auto-approve; never continue into the pipeline.
- **`/feature from-story <key>`** — planning-stack bridge. If a story MCP is
  connected (e.g. iSSM `load_story`), load the story and transform it into the
  template's sections (story intent -> What & why, ACs -> Acceptance criteria,
  the rest mapped or left as explicit gaps). Write it as `Approval: PENDING` and
  STOP for human review + approval — a story is planning input, not a sign-off.
  No story MCP connected -> say so and fall back to `/feature new`.
- **`/feature <path>`** (or bare `/feature`) — run the pipeline below.

HEADLESS DETECT: env `ISSFLOW_HEADLESS=1` (set by the CI workflow / Docker runner)
means NO human is available this run. Every hard-stop below then degrades to:
write the blocker to `docs/features/<slug>/BLOCKED.md` + mark the gate `parked`
+ return this lane as blocked with a report. A goal driver may continue independent
approved units; a standalone feature run exits. Never guess through a hard-stop.

---

## DRY-RUN CHECK (first)

`$ARGUMENTS` contains `dry-run` -> full analysis, EXECUTE NOTHING. Print the
ACTION PLAN (files · agents · tests/gates · branch · delivery target) then STOP.

---

## 0. INTAKE + PRE-FLIGHT

a. BROWNFIELD CHECK: `docs/OVERVIEW.md` must exist — the feature lane extends an
   EXISTING product. Missing -> STOP; route to `/overview` (greenfield lane).

b. APPROVAL GATE (the ONE human gate at entry): the Feature doc must carry a header
   ```
   > Approval: APPROVED <name> <date>
   > Automation: <none | push | push+pr>
   ```
   Missing/PENDING -> HARD-STOP: a human approves the DOC, not the run (need a doc?
   `/feature new <name>` scaffolds `.issflow/templates/FEATURE-template.md`). Doc approval
   confirms intake *scoped to this doc only*. Also apply METHODOLOGY → Plan-scoped
   approvals: verify the active plan revision/digest and file boundaries before
   implementation. A feature header does not override a missing or invalid plan
   approval. Routine breakdown within the approved plan needs no new confirmation.

c. WORKSPACE: slug = kebab-case of the doc's title. Ensure
   `docs/features/<slug>/FEATURE.md` (move the doc there if given elsewhere).
   On a new run, write `docs/features/<slug>/GATES.md`, all unchecked. On resume,
   reconcile the existing checklist with actual diff/test evidence, approval,
   and saved attempts; do not erase progress or trust stale checkmarks:
   ```
   # GATES — <slug>
   - [ ] spec-complete
   - [ ] adversarial-doc-review
   - [ ] mini-plan
   - [ ] contract-probe
   - [ ] build-green
   - [ ] review-harden
   - [ ] regression-green
   - [ ] test-plan
   - [ ] docs-updated
   - [ ] token-stamp
   - [ ] summary
   - [ ] memory-queued
   ```
   The `Stop` hook (`feature-gate.js`) BLOCKS session end while any gate is
   unchecked — check each box the moment its step truly passes, never earlier.
   Aborting legitimately: set `feature: <slug> (parked — <reason>)` in STATE.md.

d. STATE + BRANCH: `docs/STATE.md` gets `feature: <slug> (active)`. Work on
   branch `feature/<slug>` (create from the default branch if needed). Never the
   default branch.

---

## 1. PREPARATION & SPEC COMPLETION

Dispatch `researcher` (IMPL mode) scoped to the doc: which modules/files the
feature touches, which dependencies + versions are involved, what the doc leaves
unstated. Resolve routine details within approved scope and record assumptions
in execution notes (not an approval-hashed artifact). Material requirement gaps
require approval. Continue without re-confirming routine choices. Check gate
`spec-complete` only when the specification is sufficient.

## 2. ADVERSARIAL DOC-REVIEW (before planning)

Dispatch TWO reviewers in parallel, each told to ATTACK the doc, not summarize it:
- correctness lens: contradictions, missing edge cases, undefined behaviour,
  hidden scope, unstated integrations.
- security lens: does the feature cross a TRUST BOUNDARY (auth, untrusted input,
  data store, money, PII)? If yes, threat-model it now (`security` skill) and fold
  abuse cases into the acceptance criteria as negative cases.

Record findings and derived test cases in execution notes. Do not silently
rewrite approved acceptance criteria; material changes require renewed approval.
Internally CONTRADICTORY spec -> HARD-STOP (methodology hard-stop 3). Merely
incomplete -> fill + log. Check gate `adversarial-doc-review`.

## 3. MINI-PLAN

Dispatch `planner` scoped to the doc -> `docs/features/<slug>/PLAN.md`: 1–3
VERTICAL slices, each with acceptance spec + `[N pts]`. The main `docs/PLAN.md`
is NOT touched — the feature lane is self-contained. If the plan cannot fit the
doc's stated scope (planner needs work the doc never mentions) -> HARD-STOP:
that is scope creep; route to `/change-request`. Check gate `mini-plan`.

## 4. CONTRACT SURFACE PROBE

Before any test is written: enumerate every public surface the feature ADDS or
CHANGES — endpoints, exported functions/classes, CLI commands, events, schemas.
Diff against `docs/ENDPOINTS.md` + the existing types. Write
`docs/features/<slug>/CONTRACTS.md`: exact signatures, request/response shapes,
error shapes. A changed EXISTING contract is a breaking change -> list every
caller + the migration in CONTRACTS.md. This file is what test-author asserts
against. Check gate `contract-probe`.

## 5. BUILD LOOP (per slice — the /phase machinery, feature-scoped)

For each slice in `docs/features/<slug>/PLAN.md`, in order:
- TDD APPLICABILITY per the methodology (default `TDD_PHASE=true`, log the call).
- TDD slice: SCAFFOLD (implementer, stubs from CONTRACTS.md) -> RED (`test-author`,
  BLIND — reads FEATURE.md acceptance criteria + CONTRACTS.md only, never the
  implementation) -> GREEN (`implementer`) -> e2e (`e2e-runner`) when the slice has
  a user-facing flow. Non-TDD slice: IMPLEMENT -> TEST.
- Debug circuit breaker: WARN at 2, cap 3, `/unstuck` once per slice; still stuck
  -> park the slice (BLOCKED in execution state) + continue to the next
  independent slice. Blockers batch-report at the end, never mid-flow.
- Rule 11 (secure coding + SAST/SCA/secrets) and rule 12 (lint/format/naming/
  architecture) apply per slice as in `/phase`.
- `implementer` updates `docs/ENDPOINTS.md` as surfaces land.

All slices done + full feature suite green -> check gate `build-green`.
If required slices remain blocked, keep this gate unchecked. Independent review,
documentation, and test-plan preparation may continue, but delivery and done status
remain blocked. Checkpoint evidence, attempts, and next actions after each step.

## 6. REVIEW & HARDEN (adversarial + self-review)

- Dispatch TWO reviewers against the full feature diff: correctness lens +
  security lens. CONFIRMED findings -> fix loop, capped at 2 rounds; leftovers
  are logged in ISSUES.md, severity-tagged; any HIGH leftover -> HARD-STOP.
- Self-review: reread the diff against FEATURE.md acceptance criteria — every
  criterion maps to a test; every assumption still holds.
- Run the regression corpus (`scripts/regression.sh`) + the full real suite.
  No regression corpus in this repo (fresh brownfield install)? -> run the
  project's OWN full test suite (the test command declared in OVERVIEW.md, or
  the repo's obvious one — package.json test script, make test, pytest, …) and
  note "corpus: n/a (brownfield)" in the summary. NOTHING runnable at all ->
  that is a hard-stop: a feature cannot be verified green on a repo with no
  tests; say so instead of pretending.
  Green -> check gates `review-harden` + `regression-green`.

## 7. MANUAL TEST PLAN

Write `docs/features/<slug>/TEST-PLAN.md` — an all-case scenario sheet a human
tester can run without reading code: happy paths, negative cases, edge cases,
per-scenario steps + expected results, in the project language (OVERVIEW). Same
format `/uat` consumes, so the sheet plugs straight into the UAT cycle.
Check gate `test-plan`.

## 8. DOCS + STAMPS + MEMORY

a. Documentation update: `docs/ENDPOINTS.md` final pass; README/docs deltas the
   feature makes stale. Check gate `docs-updated`.
b. Token stamp — append to FEATURE.md:
   ```
   ## Token stamp
   context: <observed value or unavailable> · subagents: <actual n> · slices: <n> · debug rounds: <n>
   ```
   Check gate `token-stamp`.
c. Summary — append to FEATURE.md `## Summary`: what shipped, assumptions made,
   parked blockers, contract changes. One line to `docs/HISTORY.md`.
   Check gate `summary`.
d. Memory update — append wisdom candidates (resolved issues, reusable findings)
   to `docs/WISDOM-QUEUE.md`. The QUEUE is local + automatic; pushing to the
   shared KB stays human (`/store-wisdom` reads the queue). Check gate `memory-queued`.

Only when every required gate is verified: STATE.md -> `feature: <slug> (done)`.
Otherwise preserve parked/pending status and report exactly what remains unverified.

## 9. DELIVERY

Only deliver after required gates pass. Commit the feature branch only when
allowed by the user's scope (clear message per slice or one squashed commit).
A no-commit/no-push instruction overrides delivery defaults. An Automation header
must reflect actual human consent, never an agent-authored permission upgrade.
Then by the doc's `> Automation:` header:
- `none` (default) -> STOP here. Show the human: branch name, summary, TEST-PLAN
  path. Push is theirs (methodology hard-stop 1).
- `push` -> push `feature/<slug>` (`git push -u origin feature/<slug>`). No PR.
- `push+pr` -> push + open a PR to the default branch. PR body = FEATURE.md
  Summary + link to TEST-PLAN.md. NEVER merge. NEVER deploy. Merge and prod
  stay human, always.

Final report (interactive: to the user · headless: as the run's closing output):
gates table · parked blockers · assumptions · branch/PR · "next: run /uat with
docs/features/<slug>/TEST-PLAN.md".

---

## What stays human (by design — do not automate these away)

1. Writing + APPROVING the Feature doc (entry gate).
2. Any hard-stop: contradictory spec · scope creep · HIGH security finding.
3. UAT against TEST-PLAN.md, and the merge.
4. Production deploy — never in this lane; that is `/release`.
