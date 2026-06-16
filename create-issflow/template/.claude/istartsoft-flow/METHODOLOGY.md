# iStartSoftFlow — portable agent methodology (single source of truth)

> **The iStartSoft execution loop.** Namespaced under `.claude/istartsoft-flow/`
> so it coexists with a repo's own `CLAUDE.md` / `AGENTS.md` (project docs) — it
> does NOT replace them. This kit is **Claude-only** and assumes **managed infra
> (Vercel + Supabase)**, so **Phase 0 (infra) is N/A** — phases begin at the first
> vertical slice. Planning source of truth stays in **iSSM / BMAD**
> (PRD / architecture / stories); iStartSoftFlow is the execution loop layered on top.

<!-- ISTARTSOFTFLOW-AGENTS-SENTINEL-v2.0 -->
> **SENTINEL.** The HTML comment above (`ISTARTSOFTFLOW-AGENTS-SENTINEL-v2.0`) is a
> load-bearing marker. The installer (`create-issflow`) and tooling grep for it to
> confirm this file resolved on disk and was not clobbered. Do not remove or rename it.

> **What this file is.** The complete, tool-agnostic methodology for the iStartSoftFlow
> workflow: the loop, the roles, the procedures, the rituals, and the hard rules.
> This is the ONE place every rule lives. Claude Code, and any tool that reads the
> open `AGENTS.md` standard, get the full methodology from here.

> **Anti-drift invariant (load-bearing).** Every rule lives in exactly ONE place:
> this file. `CLAUDE.md` restates NO rule — it only maps roles to Claude-native
> files and says "native mechanism X performs ritual Y automatically." A rule and
> its automation may never contradict. Duplication between files is an
> architectural defect, not a convenience.

Caveman ULTRA mode always on. Apply the `karpathy-guidelines` skill (engineering
discipline) on every coding and debugging task. Apply the `ux-design` skill (the UX
cookbook + wireframe baseline) on every UI-facing task.

-----

## The loop

`design-research -> grill (×2) -> plan -> implement -> test -> deploy`, one
VERTICAL SLICE per phase. Implement AND test a phase before the next. The last
phase always includes deployment.

A phase runs in one of two orders, chosen at RESEARCH time by the TDD
APPLICABILITY check (see Procedures → `phase`):

- **TDD phase** (`TDD_PHASE=true`):
  `RESEARCH -> SCAFFOLD -> RED -> GREEN -> TEST(e2e) -> FIX -> CLOSE`
- **Non-TDD phase** (pure infra / config / doc — `TDD_PHASE=false`):
  `RESEARCH -> IMPLEMENT -> TEST -> FIX -> CLOSE`

`TDD_PHASE` = "the phase adds or changes a public callable surface (an endpoint,
exported function/class, CLI command, or message contract) that is assertable
from the acceptance spec." Size is NOT the criterion. On ambiguity, default
`TDD_PHASE=true` AND state the classification + reason so a human can override to
non-TDD before SCAFFOLD fires.

-----

## Roles (fresh-context workers)

Each role is a fresh-context worker mapped to a named Claude Code subagent in
`.claude/agents/*.md`. A worker dumps its noise to a file and returns only a
terse summary + path. Workers cannot address the user — only the orchestrator
can. Escalation is at most two hops.

- **researcher** — two modes. DESIGN: domain/constraint research before planning
  (service limits, API contracts, architectural constraints, cost surprises).
  IMPL: per-phase codebase + service investigation. Checks the shared KB snapshot
  first (step 0). Writes findings to `docs/research/`; returns terse summary + path.
- **planner** — research → vertical-slice `docs/PLAN.md`. Phase 0 (infra) leads
  when there is infra to provision; with managed infra it is N/A and the plan
  begins at the first slice. The last phase always contains the deploy task.
- **implementer** — builds ONE phase. Two MODES for TDD phases (SCAFFOLD: stubs
  only; FILL: logic to green) plus a legacy full-build mode for non-TDD phases.
  Writes code, never tests. Maintains `docs/ENDPOINTS.md` each phase.
- **test-author** — writes tests BLIND (never reads implementation logic). On TDD
  phases it is dispatched BEFORE logic exists (RED-first), so blindness is
  structural, not honor-system. Writes a MOCK suite + a REAL API suite.
- **e2e-runner** — writes/runs functional browser E2E (Playwright) BLIND. Reads
  only the acceptance spec + `docs/ENDPOINTS.md`, never the implementation.
- **debugger** — debugs in an ISOLATED context. Writes a trace to
  `docs/research/debug-<slug>.md`; returns a summary.
- **synthesizer** — compresses `docs/STATE.md` / `docs/ISSUES.md`, prunes
  snapshots. On the final phase, also updates `README.md` + `docs/OVERVIEW.md`.

The orchestrator ROUTES. It does not implement or debug.

-----

## Procedures (the slash-command set)

Named procedures, each with a canonical body in `.claude/commands/<name>.md`.

- **overview** — bootstrap a project: design-research → grill r1 → design-research
  → re-grill r2 → `OVERVIEW.md` → planner → `PLAN.md`.
- **phase [n]** — run one phase end-to-end with the circuit breaker. Chooses the
  TDD or non-TDD order at RESEARCH. CLOSE runs the regression guard + ENDPOINTS
  coverage gate.
- **quick [change]** — small, obvious, non-phase change; no agent chain. Stays
  non-TDD. Runs the mock regression corpus after the change.
- **unstuck** — deep re-research after a circuit breaker (human-triggered).
- **synthesize** — compress STATE.md, dedup ISSUES.md, prune snapshots. Run
  before a context reset.
- **replan** — revise `PLAN.md` (add/cut/split/merge/reorder pending phases) and
  reconcile the regression corpus in step.
- **log-issue** — append an error to `ISSUES.md` with root cause + failed attempts.
- **log-decision** — record an architectural change in `docs/DESIGN_LOG.md`.
- **store-wisdom** — promote resolved issues + research to the shared KB.

-----

## Rituals (model-run fallback for hooks)

Where the host tool can run lifecycle hooks (Claude Code), these rituals are
AUTOMATED by hook scripts and must NOT be run by hand. Where the tool cannot
inject context, the model performs them itself.

### SESSION-OPEN (start / clear / compact-resume)

At the start of every session, before any other work, surface:
1. git state (branch, uncommitted count, last 3 commits).
2. `docs/STATE.md` — the current position. READ THIS FIRST.
3. open items in `docs/ISSUES.md`.
4. `docs/research/INDEX.md` (research map) + infra/auth status.
5. shared KB: pull latest + load `docs/.kb-snapshot.md` if `.claude/kb-config.json`
   exists.
6. a one-line reminder of the hard rules below.

### COMPRESS (before a context compaction)

Snapshot the live position to `docs/.snapshots/` so a post-compact session can
recover: current phase, next action, open blocker.

-----

## Hard rules (1–10)

1. Before debugging ANY error: grep `docs/ISSUES.md` AND `docs/research/INDEX.md`.
   The SESSION-OPEN ritual surfaces ISSUES.md — there is no excuse to miss it.
   Before debugging an auth/infra error, check the infra + auth status surfaced
   at SESSION-OPEN first.
2. Debug attempt cap = 3: WARN the user at attempt 2; the FIRST hard-stop at 3
   STOPS and asks the user. No 4th in-place attempt.
3. Every resolved error -> logged to `docs/ISSUES.md` with root cause + failed
   attempts.
4. End of phase -> synthesize -> context reset -> next phase.
5. **PHASE GATE** = the current-phase REAL API suite passes AND (frontend phase)
   the E2E suite passes AND the accumulated mock regression corpus stays green AND
   every `docs/ENDPOINTS.md` entry has at least one test in `tests/regression/`.
   The final phase additionally runs the full REAL regression corpus. A green
   mock suite alone can never close a phase.
6. Tests are written by `test-author`, which never sees the implementation logic
   (unbiased). On TDD phases the suite is written before the logic (RED-first).
   `STACK NOT READY` / `FLAKE` do not spend the debug budget. Only `LOGIC FAIL`
   reaches the debugger.
7. E2E auth = a dedicated test account driven by a PROGRAMMATIC session
   (Supabase API login / Playwright `storageState`), never by scripting a
   third-party OAuth/login UI.
8. Architectural change (new/removed agent, hook, command, or a changed workflow
   rule)? -> run `log-decision` before closing.
9. **UI conforms to the frame.** Every UI-facing change is validated against the
   `ux-design` cookbook (design tokens, spacing scale, a11y/WCAG AA, component +
   state inventory, breakpoints) AND stays inside the wireframe baseline. Drift
   outside the wireframe frame is a defect, not a creative liberty. A frontend
   phase cannot CLOSE until the UX cookbook check passes.
10. **No-rationalization (scoped).** Do not downgrade a TDD phase to non-TDD to
    dodge the RED gate, and do not route phase-worthy work through `quick` to
    dodge it. (Scoped deliberately to these two seams; this is not a broad
    "never make excuses" rule.)

-----

## Shared KB (optional)

If `.claude/kb-config.json` exists, the SESSION-OPEN ritual pulls the KB and loads
a snapshot to `docs/.kb-snapshot.md`. The researcher checks the snapshot (step 0)
before any web search. Run `store-wisdom` to promote resolved issues + research to
the KB. The kit works normally without a KB.

-----

## File contract

- `docs/STATE.md` — current position. Small. Rewritten, not appended.
- `docs/ISSUES.md` — error log. Deduped by synthesizer.
- `docs/PLAN.md` — the phase plan. The last phase has the deploy task.
- `docs/HISTORY.md` — one line per finished phase.
- `docs/DESIGN_LOG.md` — kit architectural rationale (§5.x decision log).
- `docs/OVERVIEW.md` — project scope. Written after the double-grill in `overview`.
  E2E target.
- `docs/ENDPOINTS.md` — API/service endpoint catalogue. Maintained by implementer
  each phase. Drives the CLOSE coverage gate.
- `docs/research/` — full research + debug files. `INDEX.md` is the searchable map.
  `design-<slug>.md` (design research), `<slug>.md` (impl research),
  `debug-<slug>.md` (debugger traces).
- `docs/.snapshots/` — pre-compact recovery markers (auto-pruned, gitignored).
  Holds no secrets.
- `e2e/`, `scripts/e2e-stack.sh`, `docker-compose.test.yml`, `playwright.config.ts`
  — the E2E stack.
- `tests/phase-<n>/` — phase-local test suites.
- `tests/regression/` — cross-phase contract tests (the regression corpus). Run by
  `scripts/regression.sh` (default mock; `--real` runs the real corpus).
- `.claude/skills/ux-design/` — the UX cookbook + wireframe baseline (read on
  demand for any UI work).
- `.claude/kb-config.json` — shared KB path + remote (optional).
- `docs/.kb-snapshot.md` — KB INDEX loaded this session (auto-generated, gitignored).

-----

## Capability matrix (which tools get what)

- **Claude Code — full (reference implementation).** Generated commands; all three
  lifecycle hooks WITH context injection (SessionStart / PreCompact / SubagentStop);
  named subagents (`.claude/agents/*.md`); `@AGENTS.md` import; shared KB; skills
  loaded on demand (`caveman`, `karpathy-guidelines`, `grill-me`, `ux-design`).
- **Everything else.** Reads this `AGENTS.md` if it supports the open standard. No
  generated adapters, no lifecycle hooks — the rituals degrade to model-run
  fallbacks. Not claimed as a supported host in v2.0.
