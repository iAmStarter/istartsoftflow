---
description: Run one phase end-to-end. TDD phases run SCAFFOLD -> RED -> GREEN; non-TDD phases run IMPLEMENT -> TEST. Supports --lite. ETA + stuck/SLIP reporting required.
argument-hint: [phase number · "lite" · "dry-run"]
---


Caveman ULTRA mode. You are the ORCHESTRATOR. Route work to subagents —
use native isolated workers when available; otherwise use sequential role passes
per METHODOLOGY → Host capabilities and continuity.
Speak to the human as **PM** (status / ETA / blockers).

Note: subagents cannot talk to the user. Only YOU can.

Target phase: $ARGUMENTS (default: next ready phase in the approved plan,
reconciled with execution state; do not rely on stale status in a hashed plan).
LANE: if args contain `lite` OR PLAN phase has `lane: lite` → LITE mode.
  LITE forbidden when: final phase · new primary UI flow · auth/money/PII surface.
  LITE still requires ETA + DoD + (if any UI touch) task check happy path.

---

## DRY-RUN CHECK (first — before PRE-FLIGHT)

If `$ARGUMENTS` contains `dry-run` or `--dry-run`: do the full analysis but EXECUTE
NOTHING. Print the ACTION PLAN — files you'd create/change · agents you'd dispatch ·
tests/gates you'd run · deploy target · cost/scope/risk impact — then STOP. Write,
run, commit, deploy nothing. (METHODOLOGY → Dry-run.)

---

## 0. PRE-FLIGHT

a. PLAN-APPROVAL CHECK: apply METHODOLOGY → Plan-scoped approvals first: verify
   ACTIVE-PLAN, exact revision/digest and allowed paths when present. A legacy
   docs/PLAN.md `> Approval:` header is fallback only, never an override.
   Still `PENDING` (or no header) -> STOP. The plan is not signed off; no phase may
   start. Route me to the `/overview` PLAN-APPROVAL gate (or `/replan` then re-approve).
   Approved -> continue.

a2. DESIGN + ARCHITECTURE GATES (hard rule 15): Read `docs/STATE.md` for `design:`
    and `architecture:`.
    - Quoted / client work (approved `docs/PROPOSAL.md` exists): both must read
      `approved <date>` (or explicit `n/a` only if the human waived the gate in
      writing). Still PENDING / missing -> STOP. Route me to `/design`.
    - Internal / no proposal: if STATE has `design: n/a` and `architecture: n/a`,
      continue; if fields are missing, treat as n/a once (set them) unless OVERVIEW
      opted into the gates.
    Approved / n/a -> continue.

b. INFRA CHECK (phases > 0): Read the declared infra in docs/OVERVIEW.md.
   - Managed infra -> confirm it is reachable; no provisioning step is needed.
   - Self-managed infra -> confirm Phase 0 (infra) ran and is healthy.
   Surface infra + auth status before any work. After bounded readiness retries,
   blocked infra parks this phase; return control to a goal/sprint driver for
   independent approved work. Never treat an unavailable service as tested.

c. PHASE STATE CHECK: Read docs/STATE.md and docs/PLAN.md.
   - No phase in progress, requested is next pending -> START at step 1.
   - Same phase in-progress -> reconcile worktree, approval, and checkpoint
     evidence before resuming STATE.md "next action"; retain retry counters.
   - Different phase in-progress -> finish it first unless parked and the driver
     selected this independently approved phase; preserve both checkpoints.
   - Out of dependency order -> AUTO: ignore the request and run the next pending
     phase in PLAN order. GUIDED: STOP, warn, proceed only if I confirm.
   - Phase not in PLAN.md -> STOP. Suggest /overview or /replan.

d. FINAL PHASE CHECK: Reconcile the approved plan with execution state. Is this
   the last planned phase? Record IS_FINAL_PHASE=true/false; earlier parked units
   still block package completion even when this is the final phase.

e. DELIVERY / ETA BOARD (required before RESEARCH):
   Update `docs/STATE.md` `delivery:` block:
   - First inspect any existing wait: while its gate remains unresolved, retain
     WAITING_ON_HUMAN (or WAITING_STALE after `stale_after`), surface the next
     human action, and park this unit. Resume AGENT_ACTIVE only when the gate is
     resolved and execution actually starts; then clear resolved waiting fields.
   - Set `agent_eta` and `phase_etas` using `flow-config.json` → `delivery.phaseHours`
     by phase size (S/M/L/XL) and project timezone. Preserve the previous ETA
     before recalculating so an overdue estimate is reported as SLIP, not hidden.
   - Stage line: `stage: RESEARCH | next: … | blocker: none`
   - Assumption budget: max `assumptionBudgetPerPhase` (default 3). Exceed → park
     this unit for `/replan` or human; independent approved driver work may continue.
   - If status was WAITING_ON_HUMAN and `stale_after` passed → set `WAITING_STALE`,
     tell the human `next_human_action`, do not pretend AI is still building.
   - If wall-clock past `agent_eta` while AGENT_ACTIVE → **SLIP**: report reason +
     new ETA or BLOCKED. Never silently continue past ETA.

f. LITE shortcuts (when LITE): skip dedicated researcher if unknowns are none;
   skip browser E2E if no UI. Keep every applicable CLOSE gate, including regression,
   endpoint coverage, lint, secrets, and UI task checks. LITE never waives approval,
   evidence, retry, or security requirements. Full path otherwise.


---

## 1. RESEARCH + TDD APPLICABILITY

If LITE and no open unknowns: skip researcher; note "lite: research skipped" in STATE.
Else dispatch `researcher` in IMPL mode scoped to this phase.
Returns terse summary + path. Read the file only if needed.
Unknowns block the phase -> re-dispatch narrowed within the methodology retry
budget, then park if unresolved. No guessing or unbounded research.
After each major stage change, rewrite STATE `stage:` + one-line progress.

SECURE SDLC (design): if this phase touches a TRUST BOUNDARY (auth, untrusted input,
data store, money, PII), threat-model it now (`security` skill) and fold the abuse
cases into the acceptance criteria as negative cases BEFORE SCAFFOLD.

Then classify the phase:

  `TDD_PHASE` = the phase adds or changes a PUBLIC CALLABLE SURFACE (endpoint,
  exported function/class, CLI command, message contract) assertable from the
  acceptance spec. Size is NOT the criterion.

- Clear public surface -> `TDD_PHASE=true` -> run the TDD path (§2 → §3a → §3b).
- Pure infra/config/doc, no public surface -> `TDD_PHASE=false` -> run the
  non-TDD path (§2N → §3N).
- AMBIGUOUS -> default `TDD_PHASE=true`. AUTO: log the classification + reason to
  STATE and proceed. GUIDED: surface it so I can override to non-TDD BEFORE SCAFFOLD
  fires. (Hard rule 10: never downgrade a TDD phase just to dodge the RED gate.)

=====================================================================
## TDD PATH  (TDD_PHASE=true)
=====================================================================

## 2. SCAFFOLD

Dispatch `implementer` in SCAFFOLD mode: interface stubs only (signatures +
types; bodies raise NotImplementedError / return 501); NO logic, NO tests.
Returns the stub files + the interface surface.

## 3a. RED

Dispatch `test-author` to write the REAL API suite (+ mock) BLIND against the
stubs + acceptance. Place contract/ENDPOINTS tests in `tests/regression/`,
phase-local tests in `tests/phase-<n>/`. Run the suite.

RED GATE = every acceptance test COLLECTS cleanly AND FAILS (assertion /
NotImplemented).
- Any test PASSES on stubs -> spec trivial or test wrong. AUTO: re-dispatch
  test-author to tighten it (within budget) + log the cause; GUIDED: STOP, show me.
- Collection / import / syntax error -> stub mismatch; re-dispatch SCAFFOLD to
  fix SIGNATURES (not logic); re-run.
- UNDERSPEC -> AUTO: sharpen the acceptance spec yourself from the BMAD/iSSM story,
  log the interpretation as an Assumption, continue. GUIDED: STOP; ask me to sharpen it.

## 3b. GREEN

Dispatch `implementer` in FILL mode with the phase spec + research + the test
file paths (it MAY read the tests — frozen before logic, no overfit — but must
NOT edit them). Fill to green. Budget 3, WARN@2, STUCK@3.

## 3c. TEST (e2e) — FRONTEND phases only

If this phase ships UI:
- FULL: dispatch `e2e-runner` (BLIND) for browser E2E of the slice.
- LITE with UI touch: skip full E2E only if a **task check** still proves the
  primary user job (scripted or manual-recorded happy path) — never skip both.
- Always run the `ux-design` cookbook + wireframe check (hard rule 9). Tokens must
  come from `docs/design/tokens.css` — raw hex/spacing in components = BLOCK.
  Do not re-run `ui-ux-pro-max` `--design-system` here — look is locked.
Non-frontend phase -> skip §3c.

PHASE GATE (rule 5) -> go to §4/§5/§6 (see GATE below).

=====================================================================
## NON-TDD PATH  (TDD_PHASE=false)
=====================================================================

## 2N. IMPLEMENT

Dispatch `implementer` (legacy mode) with phase spec + research summary.
Returns STUCK -> go to ESCALATE.
If IS_FINAL_PHASE: prepare the deploy task, but do not deploy without explicit
release authorization. Record deployment as pending approval when not authorized;
never require a fabricated deployed URL to advance local verification.

## 3N. TEST (blind)

Dispatch `test-author`. It writes MOCK + REAL API suites from the acceptance
spec — never reads the logic. (e2e-runner only if frontend.)

=====================================================================

## GATE (both paths)

PHASE GATE = current-phase REAL API suite passes AND (if frontend: E2E passes
OR the permitted LITE task check has recorded passing evidence) AND
(if frontend) the `ux-design` cookbook + wireframe check passes AND the
accumulated mock regression corpus stays green AND every docs/ENDPOINTS.md
entry has a regression test (checked at CLOSE).
- GATE PASS -> go to CLOSE.
- GATE FAIL (LOGIC FAIL) -> go to FIX.

---

## 4. FIX

Dispatch `debugger` (isolated context) on the specific failure.
- FIXED -> re-run TEST (and the regression corpus).
- WARN (2 attempts failed) -> relay immediately, then let debugger finish attempt 3.
- STUCK -> go to ESCALATE.

---

## 5. ESCALATE — circuit breaker (mode-aware; see METHODOLOGY → Autonomy)

**AUTO (default) — do NOT stop the run:**
  FIRST STUCK: auto-run `/unstuck` (deep re-research) — CAP: at most ONCE per phase
  (it is token-expensive); re-dispatch `debugger` with the findings, budget 3.
  STILL STUCK (or already spent this phase's unstuck): log the issue (root cause +
  every failed hypothesis) to ISSUES.md,
  mark the slice `BLOCKED` in execution state without rewriting the approved plan,
  then return to the goal/sprint driver for the next INDEPENDENT approved unit.
  A standalone phase reports the blocker rather than starting unrelated work.
  Hard stops park affected work and dependents; do not bypass them or halt safe
  independent driver work. Retain attempt counts across resume.

**GUIDED:**
  FIRST STUCK: STOP. Present the problem, 3 failed hypotheses, the debugger's
  recommendation, the debug file path. Wait. Options:
    (a) "re-research" -> /unstuck   (b) hint -> re-dispatch debugger, budget 3
    (c) "skip" / "re-slice" -> mark blocked, dispatch planner
  SECOND STUCK: STOP completely. Full summary. Hand control to me.

---

## 6. CLOSE

REGRESSION GATE (before closing — Feature 3):
- Run `scripts/regression.sh` (mock corpus). A failure BLOCKS close -> route to FIX.
- ENDPOINTS COVERAGE: every `docs/ENDPOINTS.md` entry MUST have >=1 test in
  `tests/regression/`. Zero coverage -> FAIL HARD; do not close.
- IF IS_FINAL_PHASE: additionally run `scripts/regression.sh --real` (full real
  corpus). A failure blocks close.

UI TASK CHECK (if this phase touched UI — required even in LITE):
- Happy path: primary user can complete the phase's user-visible job without guessing.
- Viewport: primary breakpoint (≥MD) + <SM if mobile is primary.
- Tokens: run `node .issflow/scripts/token-lint.js` to check unlisted hex/RGB colors.
  Review semantic token usage and spacing separately; the script does not verify those.
- Fail → FIX; do not close.

CODE-STANDARDS GATE (rule 12): the formatter + linter are clean (the language's
standard tool); names follow the language's own idiom; the code conforms to the
declared architecture (Feature-Based by default). Lint/format errors or idiom
violations BLOCK the close -> route to FIX. (`code-standards` skill.)

SECURITY GATE (rule 11 — Secure SDLC build stage):
- Security-touching OR deploy phase -> run the `security` cookbook. Build gates:
  secrets scan + SCA (dependency CVEs) + SAST must be clean.
- IS_FINAL_PHASE / deploy -> also run the pentest checklist (WSTG) + a security
  review of the diff; sign artifacts (SLSA L2+).
- Open HIGH/CRITICAL findings BLOCK the close -> route to FIX. Deploying to prod
  with open high/critical findings is a hard-stop (human sign-off).

Record phase `done` in execution state only if all required gates passed. Do not
edit approval-hashed plan content for progress; pending deployment remains pending
and prevents declaring a deployment-inclusive phase complete.
DELIVERY UPDATE: only after all required gates pass, set this phase's
`phase_etas` entry done; refresh the next ready phase's `agent_eta`. Set
`delivery.status: DONE` only if the package is complete. Otherwise preserve
WAITING/BLOCKED and its next action; clear only resolved waiting fields.

SPRINT STANDUP (if a sprint is active — STATE.md shows `sprint: <n> (active)`):
fire the `/sprint standup` tick — append the one-line standup to
docs/sprints/sprint-<n>.md and update the burndown (rule: SPRINT-STANDUP ritual).
If all the sprint's committed phases are now done/blocked, recommend `/sprint review`
(or, under `/sprint run`, the driver proceeds to review automatically).

ARCHITECTURE SELF-CHECK: did this phase add/remove/rename an agent, hook, or
command, or change a workflow rule? YES -> run `/log-decision`. NO -> state why not.

IF IS_FINAL_PHASE — FINAL CLOSE sequence:

  a. Run `/synthesize` — pass the signal that this is the final phase so the
     synthesizer runs the extended pass (OVERVIEW.md + README.md update).

  b. Read docs/ENDPOINTS.md. Surface a "READY TO USE" summary to me:
     ```
     ✅ PROJECT COMPLETE


     ## Endpoints
     <paste the full docs/ENDPOINTS.md table>

     ## Quick start
     - Base URL: <URL>
     - Auth: <Bearer token / API key / none — from ENDPOINTS.md>
     - Health check: GET <base URL>/health

     ## Docs
     - Full endpoint catalogue: docs/ENDPOINTS.md
     - Project history: docs/HISTORY.md
     ```
  Use the PROJECT COMPLETE / READY TO USE wording only if every required unit,
  check, and authorized deployment is actually complete. Otherwise report local
  implementation verified, pending release/approval, blocked, or not run, with
  evidence. Include only observed URLs and never include secret auth values.

ELSE (not final phase):

  Run `/synthesize`.
  Report phase result + next approved phase. Under `/goal run` or `/sprint run`,
  checkpoint and return to the driver to continue without routine confirmation.
  A standalone `/phase` ends here; use a context reset only if the host supports it.

---

## STATE CHECKPOINTING

After each step, checkpoint per METHODOLOGY → Execution contract (including
approval digest, branch/base, evidence, attempts and remaining budget). Update
docs/STATE.md without losing other lanes:
```

phase: <n> (in progress)
plan: approved <date>          ← carry forward; never drop the rule-13 sign-off record
tdd: <true|false>
stage: <RESEARCH|SCAFFOLD|RED|GREEN|TEST|FIX|CLOSE>
completed: <steps done so far>
next: <exact next step>
blocker: <none or open issue>
delivery:                      ← preserve + update; never drop
  agent_eta: <date>
  status: AGENT_ACTIVE | WAITING_ON_HUMAN | WAITING_STALE | BLOCKED | SLIP | DONE
  …

```
Keep STATE.md small — overwrite, do not append. Preserve `plan:` and `delivery:`
on every overwrite. When entering WAITING_ON_HUMAN: set waiting_for, waiting_since,
stale_after (configured `delivery.staleAfterHours`, default 24h), eta_paused: true, next_human_action (one sentence).
