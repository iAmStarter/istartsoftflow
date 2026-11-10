# Modernization results (2026-11-10)

## Scope
Local implementation from verified main 76bc3d5. The existing checkout and TwinFlow
were not modified. No version bump, push, PR, merge, publication or deployment.

## Implemented
- Codex/Cursor native skill discovery and seven host-specific role definitions.
- Host-default models instead of copying Claude aliases or permission tool names.
- Non-destructive conflicts, dry-run and explicit force behavior retained.
- Concise core entry and selective policy loading; risk-based quick/planned/high-risk lanes.
- Direct explicit requests no longer require redundant conversational confirmation,
  but existing owner-controlled scope/digest/path approval checks remain intact.
- UX scope now includes tasks, behavior, recovery and presentation consistently.
- Read-only doctor separates file inventory/executable version from actual activation.

## Comparative evidence
`native-structural-comparison.json` records six real disposable ESM installations.
Baseline Codex/Cursor adapters generated no native skill/role files; candidate
adapters generate eight skills and seven roles each. Claude retains seven roles.
Candidate's core entry is 60 content lines; the prior mandatory methodology was
909 lines. Detailed policy remains available. These counts are not measurements
of quality, tokens, cost or speed, and runtime loading has not been demonstrated.

Reproduce: obtain baseline 76bc3d5 in a separate checkout, then run
`node scripts/compare-native-installers.js <baseline-checkout> [candidate-checkout]`.
The script installs only into disposable temporary directories, removes its fixtures,
and emits JSON. It does not invoke vendor agents or write either source checkout.

## Live host smoke: blocked, not passed
Codex CLI 0.167.0-alpha.4 is installed. A read-only ephemeral READY probe with an
isolated temporary Codex home failed before session creation: the sandbox helper
reported that the app-server socket directory must be user-owned with mode 0700.
No sandbox/security setting was changed or bypassed. This is an environment blocker,
not evidence that the generated integration works or fails. Claude and Cursor
executables were not found on PATH. No product browser evaluation was run.

## Required next evaluation
Use authorized functioning vendor hosts and a disposable representative product.
Run matched baseline/native-agent/candidate tasks, repeat to account for model
variance, keep model/setup/test fixtures constant, and evaluate independently:
- actual skill and role discovery, scope denial, interruption/resume;
- acceptance tests and regressions, UX critical-flow completion and recovery;
- clarification count, elapsed time and actual measured tokens/cost when available.
Do not report fabricated savings or infer user experience from artifact counts.

## Known limitations
Mixed-host installs can expose shared and Claude skill mirrors with identical names
in Cursor; documented role precedence does not establish skill deduplication.
No Codex hooks are installed in this change. Owner-controlled approval recording
is not implemented as a new authentication system, so gated hosts still need that
recording mechanism. The prior release approval is not reused for publishing this work.

## Final local verification
- 80/80 Node tests passed after independent review correction.
- Native adapter matrix covers Codex/Cursor/all in CommonJS and ESM projects,
  dry-run, valid native definitions, customization preservation and force updates.
- Seven generated Codex role definitions parsed as TOML during adapter verification.
- Doctor unit tests and real CLI dispatch passed without modifying the target.
- Package dry-run inventory: 144 files, including doctor, CORE and risk lanes.
- Deterministic template rebuild and whitespace checks passed.
- Reproducible six-install structural comparison matched saved JSON exactly.
- Independent review found ambiguous Cursor quick-approval wording; corrected it
  and added a regression test. No approval gate implementation was relaxed.

## 1.14.0 release preparation
The user subsequently authorized the Git/npm release and landing-page update.
PLAN-0008 records that release scope separately from the earlier implementation.
EN/TH index.html now describes native skills/roles, risk lanes and diagnostics with
explicit hook/browser limits. Automated landing assertions pass. Local Chromium
rendering was attempted but blocked at process startup by socket restrictions, even
with approved escalation; this check is not counted as passed. No security settings
were weakened. Real host and comparative product evaluation remain unverified.
