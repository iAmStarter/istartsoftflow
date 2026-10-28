# Adaptive Model Routing — Host Capability Policy (v1)

Status: proposed implementation specification; existing iStartSoftFlow agent model tiers remain authoritative until host adapters and tests pass.

## Model identity vs controls
Treat these as independent fields:
- provider: codex | claude | cursor | gemini
- host: specific CLI/app and version
- modelId: exact verified host identifier (never derive from display name)
- displayName: user-facing label, not an API identifier
- reasoningEffort: only levels verified supported by that model/host
- speedMode: independent host control; never assume faster means cheaper
- availability: verified | user-configured | unknown
- verification: source and date

## Codex observed UI example (not an API capability claim)
A user reported these display labels on 2026-10-28: 6.1 Sol, 6 Astra, 6.1 Terra, 6 Sol, 5.6 Sol, 6 Luna, 5.6 Terra, 5.6 Luna.
The UI showed Low, Medium, High, Extra High, Max, Ultra and Standard/Fast. This does NOT establish which effort levels each model supports, nor exact CLI/API IDs, pricing, latency or relative quality. Discovery or user-provided verified mapping is required before automatic routing.

## Routing contract
1. Determine task risk and complexity: economy (discovery/docs/handoff), balanced (features/tests/refactor), advanced (security/architecture/critical debugging).
2. Select the lowest suitable tier, subject to security/quality constraints.
3. Resolve model through host capability discovery when available, otherwise a validated user configuration.
4. Advisory mode: print recommended model display name, effort, host, reason, fallback and confidence; do not claim an automatic switch.
5. Automatic mode: apply only via an explicit supported host mechanism; verify selected model after switching. Otherwise degrade to advisory.
6. Escalate on evidence-based failures, respect existing debug caps, record why; do not escalate just because a task is long.
7. Track token/latency/cost only when the host exposes measurements. Unknown must remain unknown.
8. Preserve plan-scoped approvals, phase gates, context-guard and session handoff. Model routing cannot authorize edits, merges or deployments.

## Initial agent tier defaults (configurable, not benchmark rankings)
| Agent | Default | Escalate when |
| --- | --- | --- |
| orchestrator | balanced | cross-module architectural decisions |
| researcher | economy | difficult domain or security constraints |
| planner | advanced | already advanced; use human review for critical changes |
| implementer | balanced | critical integrations, repeated evidence-based failures |
| test-author | balanced | complex contracts or security cases |
| debugger | balanced | multi-layer root cause after bounded attempts |
| e2e-runner | economy | brittle complex workflows |
| synthesizer | economy | conflicting state or decision reconciliation |

## Session transition
At phase CLOSE or when context quality degrades, run the existing synthesis and handoff process. Record next task, proposed model/effort, availability confidence, tests, branch and PR. If the host exposes context usage, 60–70% is an advisory checkpoint and 80% a suggested safe reset; never invent percentages.

## Required tests before enabling automatic mode
- unsupported model and unsupported effort fallback
- no host discovery available
- advisory does not change host settings
- automatic switch requires confirmed host support
- failure escalation and debug caps
- approval gate and existing workflow regressions
- token and cost unknown handling

## Integration note
The reusable kit is maintained in `.issflow/` and packaged under `create-issflow/template/`. Changes to generated artifacts must be made through the established build pipeline, not by manually editing only one copy. Do not publish npm without explicit approval.
