# iStartSoftFlow — portable agent methodology (single source of truth)

> **The iStartSoft execution loop.** Namespaced under `.claude/istartsoft-flow/`
> so it coexists with a repo's own agent-instruction files (`CLAUDE.md`,
> `AGENTS.md`, `GEMINI.md`, …) — it does NOT replace them. The kit is
> **stack-agnostic and tool-agnostic**: it pins a *process*, not a *stack*.
> Declare your stack (language, framework, infra, auth, test + E2E runner,
> planning source) once in `docs/OVERVIEW.md`; every rule below references *your
> declared stack* and hardcodes none. If infra is **managed** (a PaaS + a managed
> datastore), Phase 0 (infra) is N/A and phases begin at the first vertical slice;
> otherwise Phase 0 provisions infra first. Planning source of truth stays in your
> PRD / architecture / stories (e.g. BMAD / iSSM); iStartSoftFlow is the execution
> loop layered on top.

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
cookbook + wireframe baseline) on every UI-facing task. Apply the `security` skill
(the Secure SDLC cookbook) at design (threat model), while coding (secure coding),
and before any deploy.

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

## Project lifecycle (real-world delivery)

The loop above is the BUILD engine. Around it runs a full client-delivery lifecycle
— every stage produces an artifact and is logged, so a project has a complete trail
from idea to closeout:

1. **Discover** — idea → requirements, captured by `/overview` (the double-grill).
2. **PRD** — crystallised requirements in `docs/PRD.md` (or your BMAD/iSSM stories).
3. **Stack & architecture** — decided in `/overview` design-research → `OVERVIEW.md`.
4. **Proposal & estimate** — `/propose` → `docs/PROPOSAL.md`: scope, phase breakdown,
   effort + cost estimate, timeline, assumptions. **Client sign-off gate** before build.
5. **Plan** — `planner` → `docs/PLAN.md` (vertical-slice phases).
6. **Build** — the loop, one phase at a time (`/phase`, AUTO dev loop).
7. **Change mid-flight** — `/change-request`: impact analysis + re-estimate + a logged
   change order (`docs/CHANGES.md`) + sign-off, then `/replan`. Scope and cost never
   change silently.
8. **Deploy** — in the final phase.
9. **Closeout** — `/synthesize` (final pass) → a project summary: what was built, key
   decisions, every change order, and the final cost vs the original estimate.

**Logging is continuous and total.** Every stage writes to a durable artifact:
requirements (PRD / OVERVIEW), commercial (PROPOSAL / CHANGES), execution
(PLAN / HISTORY), decisions (DESIGN_LOG), errors (ISSUES), research (research/).
Nothing important lives only in chat — it is on disk, so the project can always be
reconstructed and summarised.

**Commercial gates are always interactive** (both modes): the proposal sign-off and
every change-order approval pause for the human. AUTO governs the *dev loop between*
those gates, never the money decisions.

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
- **e2e-runner** — writes/runs functional browser E2E (your declared E2E runner,
  e.g. Playwright) BLIND. Reads only the acceptance spec + `docs/ENDPOINTS.md`,
  never the implementation.
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
- **propose** — turn approved requirements + stack into `PROPOSAL.md` (scope, phase
  breakdown, effort + cost estimate, assumptions) with a client sign-off gate.
- **change-request** — a mid-project scope change: impact analysis + re-estimate +
  a logged change order (`CHANGES.md`) + sign-off, then `replan`.
- **phase [n]** — run one phase end-to-end with the circuit breaker. Chooses the
  TDD or non-TDD order at RESEARCH. CLOSE runs the regression guard + ENDPOINTS
  coverage gate.
- **quick [change]** — small, obvious, non-phase change; no agent chain. Stays
  non-TDD. Runs the mock regression corpus after the change.
- **unstuck** — deep re-research after a circuit breaker (auto-run once in AUTO on
  first stuck; human-triggered in GUIDED).
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

### Token economy (always)

The cheapest token is the one never loaded. The kit is built to minimise context:

- **Phase boundary is the primary reset.** `/synthesize -> /clear` ends every
  phase so the next one starts with a small, fresh context instead of carrying
  the whole history forward.
- **Lazy, not always-on.** This methodology + the skills load on demand; only the
  SessionStart hook output is paid every session, and it injects just the live
  STATE + *open* issues (resolved ones stay on disk for grep, not re-paid in tokens).
- **Subagents isolate the noise.** Research, debugging, log/test output run in a
  worker's own context and return a terse summary — the orchestrator never pays
  for the raw dump.
- **Soft context budget.** The phase boundary should keep you well under the model
  window. If a single phase grows past ~50% of the window (≈ 200k on a 1M-context
  model), treat it as a signal the slice is too big: `/synthesize -> /clear` or
  split the phase. Don't coast to auto-compact. This is guidance, not a hard gate —
  the number scales with the host model's window, it is not fixed at 200k.

-----

## Autonomy

The kit runs in one of two modes, declared in `docs/OVERVIEW.md` (default: **AUTO**):

**Planning always asks; development doesn't.** Asking is cheap and decisive while
*planning* — so `/overview` (the double-grill) and plan approval stay interactive in
both modes. AUTO governs only the **development loop** (implement → test → debug →
close): there, interruptions are expensive, so it follows the plan instead of asking.

- **AUTO (default) — during DEVELOPMENT, follow the plan, don't interrupt.** Once a
  plan exists, the dev loop prefers DECIDING over asking. Resolve any in-process
  choice from (1) the PLAN/OVERVIEW/spec, (2) the codebase, (3) a sensible default +
  the worker's recommendation — then RECORD it (`docs/DESIGN_LOG.md` or STATE) and
  CONTINUE. Do not stop mid-build to ask.
- **GUIDED — ask at each fork in dev too.** The original behaviour: the development
  loop also surfaces choices and waits. Use when exploring an unfamiliar codebase.

**Decision protocol (AUTO, dev loop).** Incomplete acceptance spec → fill the gap
with the most reasonable interpretation, log it as an Assumption, continue.
Ambiguous TDD classification → apply the default (`TDD_PHASE=true`), log the reason,
continue. A worker that would have asked the user instead writes its question + its
own best answer to STATE and proceeds on that answer. (If the gap is in the PLAN
itself — not just an implementation detail — that's a planning question: surface it.)

**Batched escalation (AUTO).** Blockers never halt the whole run. On first stuck,
auto-run `/unstuck` (deep re-research) — capped at ONCE per phase, since it is
token-expensive. Still stuck → park the blocked slice (mark `BLOCKED` in PLAN), move
to the next independent slice, and surface ONE consolidated report of all parked
blockers + logged assumptions at the phase boundary / end of run. The human reviews
THERE (the `/re` checkpoint), not mid-flow.

**Hard stops (BOTH modes — these always pause for a human).** Autonomy is for
*development*, not for risk. Stop and get sign-off ONLY for:
1. Irreversible or outbound actions — deploy to prod, data deletion/migration,
   `git push`, publish, spending money, sending external messages.
2. Security-sensitive changes — auth, secrets, permissions, data exposure.
3. A spec that is internally CONTRADICTORY (merely incomplete is NOT a stop — fill
   + log instead).
4. The debug budget is spent AND no independent slice remains to make progress.

AUTO removes *questions*, not *discipline*: tests, the phase gate, issue logging,
and the regression corpus all still run. The point is an efficient, end-to-end
development run that follows the spec and logs every problem so it never recurs.

-----

## Hard rules (1–11)

1. Before debugging ANY error: grep `docs/ISSUES.md` AND `docs/research/INDEX.md`.
   The SESSION-OPEN ritual surfaces ISSUES.md — there is no excuse to miss it.
   Before debugging an auth/infra error, check the infra + auth status surfaced
   at SESSION-OPEN first.
2. Debug attempt cap = 3: WARN at attempt 2. At 3, stop the in-place attempts (no
   4th). GUIDED → ask the user. AUTO → log the issue (root cause + failed
   attempts), park the slice, and continue per the batched-escalation protocol.
   The cap protects efficiency (no flailing / token burn) in both modes.
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
   (an API login or a saved/reused auth state), never by scripting a
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
11. **Secure SDLC (security at every stage).** Security runs through the whole loop
    via the `security` skill, not just at the end:
    - **design** — threat-model any phase that touches a trust boundary (STRIDE);
      set the ASVS level; write abuse cases as negative acceptance criteria.
    - **implement** — follow the secure-coding rules (OWASP Top 10 2025).
    - **build (every phase CLOSE)** — secrets scan + SCA (dependency CVEs) + SAST
      must be clean; open HIGH/CRITICAL BLOCKS the close.
    - **pre-deploy** — run the pentest checklist (WSTG) + a security review of the
      diff; sign artifacts (SLSA L2+).
    - **operate** — vulnerability management: keep an SBOM, monitor for new CVEs.
    Deploying to prod with open high/critical findings is a hard-stop (human
    sign-off — see Autonomy). Grounded in OWASP / ASVS / WSTG / ISO 27001 / ISO 25010.

-----

## Shared KB (optional)

If `.claude/kb-config.json` exists, the SESSION-OPEN ritual pulls the KB and loads
a snapshot to `docs/.kb-snapshot.md`. The researcher checks the snapshot (step 0)
before any web search. Run `store-wisdom` to promote resolved issues + research to
the KB. The kit works normally without a KB.

-----

## File contract

- `docs/PRD.md` — crystallised product requirements (or your BMAD/iSSM stories).
- `docs/PROPOSAL.md` — scope + phase breakdown + effort/cost estimate + assumptions
  + sign-off. Versioned; the commercial baseline.
- `docs/CHANGES.md` — change-order log (append-only): each scope change with its
  impact, effort/cost delta, new total, and approval status. The commercial audit trail.
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
- your E2E stack — runner config + any ephemeral test services (e.g. `e2e/`,
  `playwright.config.ts`, `scripts/e2e-stack.sh`, `docker-compose.test.yml`).
  Names are conventions; use whatever your declared stack ships.
- `tests/phase-<n>/` — phase-local test suites.
- `tests/regression/` — cross-phase contract tests (the regression corpus). Run by
  `scripts/regression.sh` (default mock; `--real` runs the real corpus).
- `.claude/skills/ux-design/` — the UX cookbook + wireframe baseline (read on
  demand for any UI work).
- `.claude/skills/security/` — the Secure SDLC cookbook + threat-modeling /
  secure-coding / pentest / standards references (read on demand for security work).
- `.claude/kb-config.json` — shared KB path + remote (optional).
- `docs/.kb-snapshot.md` — KB INDEX loaded this session (auto-generated, gitignored).

-----

## Capability matrix (which host gets what)

The kit is single-source (`.claude/` + this file). `create-issflow --tool=<host>`
writes the right adapter; unsupported features degrade to model-run rituals, never
silently vanish. The portable assets (agents, commands, skills, methodology) are
the same everywhere — only the *wiring* differs.

| Host | Entry file | Commands | Subagents | Lifecycle hooks | Shared KB |
|------|-----------|----------|-----------|-----------------|-----------|
| **Claude Code** (reference) | `AGENTS.md` + `.claude/` | `.claude/commands/` | native | SessionStart · PreCompact · SubagentStop (with context injection) | yes |
| **Codex CLI** | `AGENTS.md` (native) | `.claude/commands/` (read as prompts) | read as reference | model-run | yes |
| **Cursor** | `.cursor/rules/` + `AGENTS.md` | `.cursor/commands/` | reads `.claude/agents/` | `.cursor/hooks.json` (sessionStart · subagentStop) | yes |
| **Gemini CLI** | `GEMINI.md` + `AGENTS.md` | `.claude/commands/` (read as prompts) | read as reference | model-run | yes |
| **Aider** | `.aider.conf.yml` → `AGENTS.md` | read as reference | model-run | model-run | yes |
| **Any AGENTS.md host** | `AGENTS.md` | read as reference | model-run | model-run | yes |

"model-run" = the host can't automate the ritual, so the model performs it by hand
(SESSION-OPEN at the top of each session; the COMPRESS snapshot before a reset).
