# iStartSoftFlow core contract

Read this first. Load only the procedure and detailed rules needed for the task.
`METHODOLOGY.md` remains the full policy reference, not required background for
unrelated work. Host security and the user's latest instructions take precedence.

## Start with the actual request
- Identify the outcome, existing project context and requested action.
- Inspect relevant code, instructions and current tests before changing anything.
- Classify risk using `RISK-LANES.md`; size alone does not establish safety.
- A clear, explicit request need not be repeated as a confirmation question.
  Ask only for missing consequential choices, conflicting scope or required approval.
- An audit/review is read-only product work unless implementation was requested.

## Choose the smallest sufficient lane
- Low-risk, local, reversible, bounded edit: `/quick`.
- New behavior, public contract or multi-part feature: `/feature` or `/phase`.
- Existing-product UX review: `/ui-audit`; approved redesign: `/redesign`.
- Security/auth, migrations, production, outbound or irreversible actions: use the
  relevant full workflow and obtain the permissions that the action requires.
- Do not split risky work into tiny edits to evade gates.

## Authorization is real, not a label
- Source changes still use the existing scoped-plan/digest/path approval verifier.
- Quick work uses a concise scope receipt, not a second discovery ceremony.
- A direct explicit request may supply consent for exactly the requested quick
  scope. Record its provenance faithfully through the owner-controlled mechanism.
- The agent cannot approve its own plan or write a receipt to invent permission.
- If the host cannot record the existing consent safely, report that boundary;
  do not bypass a denial through shell writes or a different tool.
- Reuse valid approval within scope; changed scope/revision needs new approval.
- Publication, merge, deployment and external effects require their own authority.
See `METHODOLOGY.md` → Plan-scoped approvals and `RISK-LANES.md`.

## Execute and verify
- Make cohesive, minimal changes that fit the existing architecture and stack.
- Use native skills/workers when actually available; sequential role passes are
  the fallback. Delegate for independent review, useful parallelism or isolation,
  not to force every tiny change through a fixed chain.
- Preserve behavior, data/API contracts and approved visual direction.
- UI work checks user jobs, flows, recovery, hierarchy, content, accessibility and
  responsive behavior, not just styling. Load `ux-design` and the relevant procedure.
- Run relevant lint/type/test checks and inspect affected runtime behavior.
- A checklist, screenshot or passing report validator is not proof the task works.
- Keep retries bounded; preserve evidence and counters across interruption.
- Do not weaken tests, approvals or safety controls to obtain a green result.

## Finish honestly
- Report changed behavior, observed checks, remaining risks and next action.
- Distinguish passed, failed, blocked and not-run. Never invent coverage or metrics.
- Leave a minimal resumable checkpoint when interrupted; preserve existing work.
- No prompt or checkpoint creates an unattended scheduler. Use actual host support.

## Load detailed policy when needed
- Approvals, scope changes or blocked edits: Plan-scoped approvals + rules 13–14.
- Feature/phase implementation: Execution contract + phase/feature procedure.
- New product: `/overview`; quoted work: `/propose` + rule 15.
- UX: `ux-design`, `/ui-audit` or `/redesign`; QA: `/qa-audit`.
- Trust boundaries/security: `security` + rule 11; release: `/release`.
- Host discovery/enforcement: `../runtime/HOSTS.md`.
