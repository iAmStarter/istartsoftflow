# Changelog — create-issflow

## 1.7.0 — 2026-07-03

### Added
- **Model routing** — each role pins a `model:` tier: heavy-reasoning roles
  (planner · debugger · implementer · test-author) use `inherit` so the owner's
  session model cascades; researcher/e2e-runner run `sonnet`; synthesizer runs
  `haiku`. Pin a specific model by editing the role's `model:` line — the
  installer never overwrites your edits.
- **`/goal` command (goal layer)** — declare an OUTCOME with a measurable
  Done-when + budget; `/goal run` loops pick-next-unit → route lane → tick until
  done / budget / hard-stop. Goal-driven (stops on the finish line), composes
  with host interval loops for recurrence. State in `docs/GOALS.md`; the
  `Approved:` line arms headless passes. `--ci` now also installs a cron-ready
  `issflow-goal.yml` workflow (disarmed by default).
- **Hard rule 14 — UNDERSTAND-FIRST gate (brief-back)** — any new free-text task
  (`/quick`, `/change-request`, `/goal set`, the grill) restates its
  understanding (goal · scope · assumptions · blast radius) and WAITS for
  explicit confirmation before executing. Approved artifacts (PLAN / FEATURE doc
  / CR / goal) are the recorded confirmation for their lanes. Wrong
  understanding burns tokens at 100× the cost of one confirm turn.

## 1.6.0 — 2026-07-02

The **feature lane** release: near-100% hands-off feature delivery on an
existing product. Humans remain at doc approval, UAT, and merge.

### Added
- **`/feature` command** — one APPROVED Feature doc → adversarial doc-review →
  scoped mini-plan → contract surface probe → blind-TDD build loop → adversarial
  review & harden → manual TEST-PLAN → docs + token stamp + summary → wisdom
  queue → delivery (branch / PR per the doc's `> Automation:` header).
  Entry modes: `/feature new <name>` (scaffold the doc) and
  `/feature from-story <key>` (BMAD/iSSM story → PENDING doc).
- **`.claude/templates/FEATURE-template.md`** — the Feature-doc form with
  `> Approval:` / `> Automation:` headers and spec sections.
- **`feature-gate.js` (Stop hook)** — blocks session end while the active
  feature has unchecked gates in `docs/features/<slug>/GATES.md`, and verifies
  ARTIFACTS behind checked gates (PLAN/CONTRACTS/TEST-PLAN files, Token
  stamp/Summary sections, WISDOM-QUEUE); re-checked in the `(done)` state.
- **`plan-gate.js` (PreToolUse hook)** — hard rule 13 as code: denies source
  Edit/Write while `docs/PLAN.md` reads `> Approval: PENDING` (docs/kit paths
  stay writable; an active feature lane is exempt).
- **Headless runners** (`--ci` / `--docker` installer flags):
  `.github/workflows/issflow-feature.yml` (label an issue `feature:approved` →
  the lane runs) and `Dockerfile.issflow` + `scripts/feature-docker.js`
  (unprivileged Node-based container; preflights `node` in the image —
  the lifecycle hooks are Node scripts and die silently without it).
  `--worktree` isolates a run in its own git worktree for parallel features.
- **Lane routing table** in METHODOLOGY (overview/feature/quick/change-request).
- **`/change-request` feature-lane variant** — scope creep on a feature doc is
  logged as a CR against the doc and resets it to PENDING for re-approval.

### Changed
- SessionStart hook now injects only the 5 newest research-INDEX rows
  (truncated) instead of 15 full rows — token economy.
- `ISSFLOW_HEADLESS=1` degrades every hard-stop to a `BLOCKED.md` report +
  clean exit (never a guess) for CI/Docker runs.

## 1.5.0 and earlier

See the git history of github.com/iAmStarter/istartsoftflow.
