# create-issflow 1.12.0 release verification

Reconciles main 215bba54451e250ee069322b347cd9ba56a3ea97 with published npm
1.11.1 source d587932a7553ca2413043edd454f39fdc5e07b6c. Both descended from
58a9d845. Registry tarball SHA-1 and SHA-512 were checked against npm metadata.

Preserved released delivery ETA/waiting state, lean Tier-A context, Cursor gate
rules, model matrix, design picker/tokens/templates, token lint and documentation.
Retained bounded autonomous task state, current-attempt evidence, independent-task
continuation, capability limits and publication approval boundaries. Existing
PLAN-0005 was not overwritten by the release sibling's unrelated same-number plan.
PLAN-0006 records this release preparation's scope.

Local verification:
- 54 tests pass, zero failures or skips.
- Every template file from npm 1.11.1 exists in the candidate package.
- Installed token lint passes allowed colors and rejects unlisted colors in ESM
  and CommonJS consumers; installed runtime loads in both module formats.
- Waiting/stale ETA and lean resume coexist with bounded workflow summaries.
- Clean tarball install with all adapters and Docker/CI templates passes in both
  module formats. Package identity create-issflow@1.12.0; 135 packed files.
- Generated template rebuild and approval scope checks are required before merge.

The helper still records caller-attested test evidence, not verified shell results.
No live provider execution or deployment was performed. npm publication and remote
CI results must be verified separately; this document does not claim they occurred.
