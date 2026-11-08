# UX workflow verification

## Release candidate 1.13.0

Existing-product review/redesign procedures, expanded UX rubric, contextual visual
direction guidance, preservation/coverage/evidence templates, portable validator,
and installer discovery. See `research/ux-review-redesign-capability.md` for sources,
scope and limits. Source of truth is `.issflow/`; packaged copies are rebuilt.

## Checks (2026-11-08 results)

- PASS: 66/66 tests. Node test suite: `node --test tests/*.test.js` (includes UX validator and ESM
  installer regression coverage alongside existing approval/runtime/release tests).
- PASS: Build: `node create-issflow/build.js`.
- PASS: 141 package files. Package inventory: `npm pack --cache /tmp/ux-npm-cache --dry-run --json` from
  create-issflow, asserting all new portable UX assets are included.
- PASS: Whitespace: `git diff --check`.
- Token lint: skipped because this toolkit checkout has no project tokens file.

## Not claimed

No actual customer product was browser-audited or redesigned. No screenshots or
contextual previews were produced for a supplied example repo because that repo
is still pending. These instructions require the host to execute those steps;
they do not provide an autonomous browser implementation.

The bookkeeping validator does not open evidence files, authenticate them or
discover routes omitted from the declared inventory. A REVIEWED result is only a
consistency check on the declared report, never a release/a11y certification.

## Release verification

- Fresh packed-tarball installs in ESM and CommonJS consumers run all adapters.
- The installed evidence CLI correctly returns INCOMPLETE for unrun template checks.
- Landing-page static regression verifies every shipped command, skill count and
  explicit limitations. EN/TH copy now documents audit/redesign.
- Chromium visual QA was attempted, including approved process escalation, but
  launch fails with `socket() failed: Operation not permitted`. No rendered-page
  or mobile/desktop visual pass is claimed.
- Provider end-to-end execution remains unverified: prior Codex run was read-only;
  Cursor/Claude runtime sessions were unavailable. Installer tests are not provider E2E.
- PLAN-0007 records the user's explicit Git push and npm publication authorization.
  Approval validation uses the actual changed-file list, not an empty default diff.
- Git and npm publication status must be verified separately from these local checks.

