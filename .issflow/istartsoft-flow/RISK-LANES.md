# Risk-based workflow lanes

Classify by consequences and uncertainty, not line count. This classification
selects ceremony and verification depth; it never grants authorization.

## Quick: local, reversible, fully specified
All must hold: a clear user request, bounded known files and acceptance outcome,
no new feature or public/API/data contract, no security/auth/permission change,
no migration or destructive action, no outbound action/release/deployment, and
no material design-direction change. Existing required review policies still apply.
Examples: fix specified copy, correct a local display bug with a known reproducer,
or rename an internal symbol without changing its behavior. A one-line auth change
is not quick. If inspection reveals wider impact, stop and reclassify before editing.

Use a short `docs/plans/PLAN-<id>.md` scope receipt with the existing ID/revision
format: goal, exact allowed paths, acceptance and checks, exclusions, and provenance
of the direct request. The existing owner-controlled approval record still binds
that exact plan blob and allowed paths. Preserve its real approval source; do not
claim a user reviewed generated text they never saw.

If the direct request already specifies the exact bounded change and carries no
missing consequential choice, it can be the consent for that scope: no redundant
"is this what you mean?" turn is needed. An authorized owner-controlled recording
mechanism must still bind the receipt to that consent. Hosts without one need that
recording action before source edits; do not promise a zero-artifact or gate-free
path. A generic "make it better" is not exact scope. Derived assumptions that affect
behavior or permission require clarification, not automatic approval.

No full OVERVIEW, double grill, sprint, UX pack or STATE rewrite is required for
this lane. Inspect existing context and run targeted checks plus affected regression.
Use at most two repair attempts within the same scope, then report the blocker.

## Planned: feature or material redesign
New behavior, public contracts, multi-module changes, uncertain scope or a new
visual direction uses `/feature`, `/phase` or `/redesign`. Define acceptance and
preservation requirements, obtain scoped plan approval, and apply relevant gates.
Reuse answers and existing valid approvals; do not repeat discovery without a gap.

## High risk: strengthened review
Auth/security, permission expansion, sensitive data, schema/data migrations,
production operations, outbound effects and irreversible changes require explicit
scope and action-appropriate approval. Use threat analysis, safe fixtures, rollback
and relevant independent verification. A small diff does not reduce these duties.
Publication/merge/deployment is never implied by a local implementation request.

## Enforcement limits
The classification is agent judgment, not a security boundary. The existing
approval verifier and host safety controls remain authoritative. Missing/malformed
approval or an out-of-scope path stays blocked for every lane. Never edit approval
files to defeat a gate. CI and human review remain necessary; a writable JSON record
is not authenticated proof of who approved it.
