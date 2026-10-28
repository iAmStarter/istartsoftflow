# Adaptive Model Routing v1 — Usage

The router is intentionally **fail-closed**. It recommends a capability tier and
only selects a concrete model ID if the host supplies a verified model inventory
and an explicit tier mapping. It never infers API/CLI IDs from UI display names.

Supported providers: `codex`, `claude`, `cursor`. Gemini is out of scope for v1.

## Task defaults

| Agent | Tier | Escalation |
| --- | --- | --- |
| orchestrator | balanced | high complexity/risk |
| researcher | economy | high complexity/risk |
| planner | advanced | human review for critical changes |
| implementer | balanced | high complexity/risk |
| test-author | balanced | high complexity/risk |
| debugger | balanced | high complexity/risk |
| e2e-runner | economy | high complexity/risk |
| synthesizer | economy | high complexity/risk |

Codex preference levels are medium/high/xhigh by tier, **not verified support**.
Claude Code and Cursor effort is unspecified until host capability discovery.
All three inherit the current session model if an exact supported model and
effort cannot be verified. No model name is hardcoded as an executable ID.

## JavaScript API

```js
const { route, execute } = require('./.issflow/routing/model-router');
const capabilities = {
  models: [{ id: 'host-verified-id', reasoningEfforts: ['high'] }],
  tiers: { balanced: { modelId: 'host-verified-id', reasoningEffort: 'high' } },
};
const advice = route({ provider: 'codex', agent: 'implementer', capabilities });
const result = await execute(
  { provider: 'codex', agent: 'implementer', mode: 'automatic', capabilities },
  { supportsSwitch: true, switchModel: async ({ modelId, reasoningEffort }) => {
    // Host integration MUST perform and verify the actual switch.
    return { confirmed: false, modelId, reasoningEffort };
  } },
);
```

`route` is pure and advisory by default. `execute` requires an injected,
host-native `switchModel` callback and verified confirmation. No Codex, Claude
or Cursor host-native switch integration is shipped in this version; automatic
mode therefore remains advisory unless a verified adapter is provided.

The router never writes approval records, changes branch protection, authorizes
merges or deploys, or overrides phase/feature gates. Debug retry budgets and
context/session boundaries remain governed by METHODOLOGY.md.

## Validation

```sh
node --test tests/model-router.test.js
```

Before enabling automatic mode in any host, independently verify exact CLI/API
model IDs, supported reasoning controls, and a switch-and-readback mechanism.
