'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { route, execute } = require('../.issflow/routing/model-router');
const verified = { models: [{ id: 'verified-model', reasoningEfforts: ['medium', 'high', 'xhigh'] }],
  tiers: { economy: { modelId: 'verified-model', reasoningEffort: 'medium' },
    balanced: { modelId: 'verified-model', reasoningEffort: 'high' },
    advanced: { modelId: 'verified-model', reasoningEffort: 'xhigh' } } };

test('no capability discovery falls back to inherit', () => {
  assert.equal(route({ provider: 'codex', agent: 'planner' }).action, 'inherit');
});
test('unsupported model and effort fall back', () => {
  assert.equal(route({ provider: 'codex', capabilities: { ...verified, tiers: { balanced: { modelId: 'verified-model', reasoningEffort: 'ultra' } } } }).action, 'inherit');
  assert.equal(route({ provider: 'cursor', capabilities: { models: [], tiers: verified.tiers } }).action, 'inherit');
});
test('advisory never changes the host', async () => {
  let calls = 0;
  const r = await execute({ provider: 'codex', capabilities: verified }, { supportsSwitch: true, switchModel: () => { calls++; } });
  assert.equal(r.action, 'recommend'); assert.equal(r.switched, false); assert.equal(calls, 0);
});
test('automatic mode requires explicit host support and confirmation', async () => {
  const input = { provider: 'codex', mode: 'automatic', capabilities: verified };
  assert.equal((await execute(input, {})).switched, false);
  assert.equal((await execute(input, { supportsSwitch: true, switchModel: async () => ({ confirmed: false }) })).switched, false);
  const ok = await execute(input, { supportsSwitch: true, switchModel: async x => ({ ...x, confirmed: true }) });
  assert.equal(ok.switched, true); assert.equal(ok.action, 'switched');
});
test('security and complex tasks escalate without bypassing gates', () => {
  assert.equal(route({ provider: 'claude', agent: 'researcher', task: 'security' }).tier, 'advanced');
  assert.equal(route({ provider: 'cursor', agent: 'implementer', complexity: 'high' }).tier, 'advanced');
});
test('unknown provider and invalid mode fail closed', () => {
  assert.throws(() => route({ provider: 'gemini' }));
  assert.throws(() => route({ provider: 'codex', mode: 'magic' }));
});
