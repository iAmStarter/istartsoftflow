# Changelog — create-issflow

## 1.10.1 — 2026-10-25

### Fixed
- Portable Node hooks now include a nested `.issflow/hooks/package.json` declaring CommonJS, so they run in projects using `"type": "module"` without renaming or overwriting existing hook scripts.
- Template generation excludes Python `__pycache__`, `*.pyc`, `*.pyo`, and installer conflict artifacts.
- Docker feature runner now uses dynamic Node imports, so `--docker` works in both ESM and CommonJS consumer projects.
- Approval verification now checks deleted paths in Git diffs, preventing out-of-scope deletions from being ignored.
- Regression tests cover installer dry-run, non-destructive installation, pending/approved plan gates, and verification in ESM and CommonJS consumers.

### Upgrade
- Run `npx create-issflow@1.10.1 --tool=codex` from the project root. The new `.issflow/hooks/package.json` is added without overwriting customized hook scripts.
- Existing `.issflow-new` conflicts still require manual review. The package boundary fixes Node module interpretation; it does not automatically merge customized policy files.
- No changes to authentication, business logic, or existing plan approval records.

## 1.10.0 — 2026-10-25

### Added
- Plan-scoped approvals: one approved plan ID and revision per task, bound to the exact Markdown Git blob hash.
- Approval verifier CLI for checking changed-file boundaries in local development and CI.
- Scoped plan template and automated regression coverage for approval gates and non-destructive installer behavior.

### Changed
- Claude Code file-edit approval gate now rejects missing or invalid approval metadata and no longer trusts an active feature state as approval.
- Concise Conventional Commit validation and GitHub Actions approval checks.
- English and Thai setup guidance for the new approval workflow.

### Compatibility and limitations
- Existing projects using `docs/PLAN.md` remain supported through legacy approval checks; these are not revision-scoped.
- Codex does not have universal pre-edit enforcement; use the CLI/CI verifier and protected branch reviews.
- A writable approval JSON is not cryptographic evidence of human authorization.
- Installer remains non-destructive by default and may write `.issflow-new` files when existing files differ.

## 1.9.2 — 2026-10-22

### Added
- **`ui-ux-pro-max` skill** vendored into the kit (search engine + catalogue
  from [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill),
  MIT). `/design` STEP 1 runs `scripts/search.py --design-system` and folds the
  look into `docs/UX-PACK.md`. No extra `uipro init`. `ux-design` stays the
  rule-9 CLOSE gate; do not re-roll styles per phase. Python 3 required at
  runtime (ask the human if missing).

## 1.9.1 — 2026-10-21

### Changed
- **`/propose` client quote:** sign page is one A4 sheet of **3–6 packages**
  (PLAN phases stay internal). Same HTML then page-breaks into a screen
  appendix covering every in-scope module. Totals only — no rate, no
  contingency %, no sample amounts in the kit template. Hosting/database
  exclusion and payment split are asked in chat; bank details only if given.
  Software delivery payment wording (not construction). Dry-run still writes
  nothing. Stop at sign-off — do not start `/design` or `/phase`.

## 1.9.0 — 2026-10-21

### Changed
- **Portable kit directory renamed `.claude/` → `.issflow/`.** Every `--tool=`
  install gets `.issflow/` + root `AGENTS.md`. **Claude Code only**
  (`--tool=claude` or `all`) also mirrors the kit into `.claude/` + `CLAUDE.md`
  shim; Cursor / Codex / Gemini / Aider no longer create `.claude/`.
- Hooks always execute from `.issflow/hooks/` (single source). Claude
  `.claude/settings.json` points there.
- METHODOLOGY, commands, hooks, templates, landing/HOW-TO paths updated.
- `.issflow/README.md` documents the Claude-only mirror.

## 1.8.1 — 2026-10-21

### Changed
- **Clarify kit layout:** Add `.issflow/README.md` map (shipped in template).
  METHODOLOGY + generated `AGENTS.md` lead with AGENTS.md; `CLAUDE.md` shim
  wording softened. Capability matrix lists AGENTS.md hosts first.
  *(Superseded by 1.9.0 kit-dir rename — 1.8.1 still lived under `.claude/`.)*

## 1.8.0 — 2026-10-21

### Added
- **`/design`** — post-proposal UX pack + architecture approve gates (hard rule 15)
  before `/phase`; templates `UX-PACK-template.md` · `ARCHITECTURE-template.md`.
- **`/support`** + **`support-triage` skill** — after-go-live severity triage,
  warranty vs billable CR, hotfix routing.
- **`CR-template.md`** — detailed change-order artifact under `docs/changes/`.
- Software-house **roles → kit map** and **Default / Advanced** lane routing in
  METHODOLOGY.

### Changed
- **Installer:** omit `--tool` now installs **every** adapter (same as
  `--tool=all`); typo alias `--tool=cusor` → `cursor`. Docs/landing lead with
  **AGENTS.md** as primary entry; `CLAUDE.md` remains a thin Claude Code-only shim.
- **`/propose` / `/change-request`:** ask rate + contingency in chat when missing;
  never ship kit default rates; client PROPOSAL / HTML show **totals only**
  (no rate, no contingency %). `proposal.html` `{{CONTINGENCY_NOTE}}` →
  `{{TOTAL_NOTE}}`.
- **Landing / HOW-TO / README:** default paths (`/overview` · `/feature` ·
  `/quick`) first; advanced commands labeled, not cut; hero brand-forward.
- **`/phase` preflight** enforces design + architecture gates when a proposal
  exists; `/release` STAGE 8 hypercare points at `/support`.

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

### Fixed (usability review — verified against official Claude Code docs)
- Docker: `git config --global --add safe.directory '*'` for the runner user —
  without it every git command on the host-owned mount fails ("dubious
  ownership"), which silently killed the whole lane.
- Docker `--worktree`: mount the main repo AND the worktree at their host
  paths (worktree git metadata points both ways by absolute path; the old
  /work mount broke git inside the container).
- CI workflows: `--allowedTools <list>` (documented) instead of
  `--dangerously-skip-permissions` (undocumented in the Actions context).
- `/feature` + `/quick`: regression fallback for brownfield repos without
  `scripts/regression.sh` — run the project's own suite; a repo with nothing
  runnable hard-stops instead of pretending green.
- Integration facts verified against code.claude.com docs: subagent
  `model: inherit`, Stop-hook `decision:block` + `stop_hook_active`,
  PreToolUse `permissionDecision:deny`, multiple PreToolUse matcher groups,
  `claude -p "/custom-command"`, non-root `--dangerously-skip-permissions` +
  `ANTHROPIC_API_KEY` headless auth.

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
- **`.issflow/templates/FEATURE-template.md`** — the Feature-doc form with
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
