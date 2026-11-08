# Autonomous workflow verification

Base: main commit `58a9d845a14b7eb4501bb5343d92af388d5c2c64`.
Local delivery branch: `feat/bounded-autonomous-workflow`.

## Implemented

- Bounded local task DAG/checkpoint helper with durable claims, dependency gates,
  independent work, retry/unit accounting, stale update/attempt rejection and
  evidence/code identity requirements.
- Consistent AUTO behavior across quick/phase/feature/goal/sprint; approval,
  publication and deployment boundaries retained.
- Session checkpoint summary and host-specific instructions; installer packages
  runtime and existing model router, including ESM compatibility and upgrades.
- Capability matrix and live-host smoke checklist in `.issflow/runtime/HOSTS.md`.

## Checks performed locally

- `node --test tests/*.test.js`: 48 passed, 0 failed, 0 skipped.
- `node create-issflow/build.js`: rebuilt template; repeat build produces the same files.
- `git diff --check`: passed.
- Scoped approval verifier: PLAN-0005, exact revision/digest and changed paths.
- Conventional commit subject check against local main.
- `npm pack --dry-run --json` and `npm pack`: package contains required runtime,
  router, approval and installer files; no generated Python bytecode (122 files).
- Clean local tarball installs in both ESM and CommonJS projects, all adapters,
  Docker/CI templates, and runtime loading passed.
- Installer tests also cover Claude/Codex/Cursor individually, dry-run, preserved
  custom files, repeated upgrades and existing ignore exceptions.
- Runtime tests include concurrent CLI claims, interrupted-running preservation,
  blocked dependencies, attempt/budget exhaustion, corrupt state, stale evidence,
  stale readers, symlinks and invalid DAGs.

The environment's default npm cache was unavailable; packing and installation
succeeded with a temporary local cache. No dependency/network workaround needed.

## Limits

No live Claude, Codex, or Cursor host session, remote GitHub Actions run, Docker
container execution, push, PR, merge, or deployment was performed. Generated host
configuration is locally contract-tested, not certified against every host version.

The runtime records caller-attested evidence and code identity. It does not run
agents/tests, verify Git truth, grant approvals, schedule sessions, or discover
later edits invalidating done records. The agent must check the current worktree
and rerun affected checks. Checkpoints alone do not prove current-code correctness.

## Subsequent publication authorization

The user subsequently requested pushing the verified change directly to main and
waived live provider testing. PLAN-0005 revision 2 records that approval. Local
checks were rerun before publication; this report does not assert remote CI passed.
