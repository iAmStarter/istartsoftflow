# Native integration and proportional workflow modernization

Baseline: upstream main 76bc3d50d2df98e5f1edabc092833a57df94db76, verified complete
Git tree f47c1c21ab9e972cbbd7ed2546e2875492b6cbfd. Work occurs in a separate checkout;
prior work and TwinFlow are untouched.

User requested implementation after the recommendation to improve native
integrations, simplify by risk, and evaluate honestly. Local scope: installer,
portable helper/guidance, tests and documentation. No push, release, merge or deploy.
This note does not reuse prior release approval or claim publication authorization.

Acceptance:
- Generate discoverable native skills and host-correct role definitions without
  applying Claude-specific model aliases or tool names to other hosts.
- Keep dry-run and non-destructive upgrades, ESM/CommonJS consumers and source/template parity.
- Short always-on CORE, selective deeper workflow, low-risk scope receipt without
  redundant conversational confirmation; preserve existing owner-controlled gates.
- Reconcile UX responsibilities and host capability descriptions.
- Read-only doctor identifies structural state and separates it from live activation.
- Run aggregate tests and compare generated native surfaces against the baseline.
- Attempt feasible host smoke. Report unavailable authentication/executables as
  blocked, not evidence of poor performance or successful evaluation.

Later acceptance requiring separate environment/access: comparative live-agent
product task trial, browser UX evaluation and cost/quality outcome measurement.
