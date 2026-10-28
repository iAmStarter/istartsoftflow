'use strict';

/**
 * Host-aware model routing. Pure decision logic; does not alter approvals,
 * mutate host configuration, or assume UI labels are model identifiers.
 * Hosts must inject verified capabilities and a switchModel implementation.
 */
const policy = require('./policy.json');
const SUPPORTED = Object.freeze(['codex', 'claude', 'cursor']);
const TIERS = Object.freeze(['economy', 'balanced', 'advanced']);
const HIGH_RISK = new Set(['security', 'authentication', 'authorization', 'payments', 'secrets', 'production', 'migration']);

function route(input = {}) {
  const { provider, agent = 'orchestrator', task = '', risk = 'low', complexity = 'medium',
    mode = policy.defaultMode, capabilities = {} } = input;
  if (!SUPPORTED.includes(provider)) throw new Error('Unsupported provider: ' + String(provider));
  if (!['advisory', 'automatic'].includes(mode)) throw new Error('Invalid routing mode');
  const elevated = risk === 'high' || HIGH_RISK.has(String(task).toLowerCase());
  let tier = policy.agents[agent] || 'balanced';
  if (elevated || complexity === 'high') tier = 'advanced';
  if (!TIERS.includes(tier)) tier = 'balanced';

  const preference = policy.providers[provider][tier];
  const verified = Array.isArray(capabilities.models) ? capabilities.models : [];
  // Never invent model IDs: only an explicitly configured, verified model is selectable.
  const configured = capabilities.tiers && capabilities.tiers[tier];
  const modelId = configured && configured.modelId || preference.modelId;
  const match = verified.find(m => m.id === modelId);
  const requestedEffort = configured && configured.reasoningEffort !== undefined
    ? configured.reasoningEffort : preference.reasoningEffort;
  const supportedEfforts = match && Array.isArray(match.reasoningEfforts) ? match.reasoningEfforts : [];
  const effort = requestedEffort && supportedEfforts.includes(requestedEffort) ? requestedEffort : null;
  const eligible = !!match && (!requestedEffort || !!effort);
  return {
    provider, agent, tier, mode, modelId: eligible ? modelId : null,
    reasoningEffort: eligible ? effort : null,
    availability: eligible ? 'verified' : 'unknown',
    action: eligible ? (mode === 'automatic' ? 'switch-request' : 'recommend') : 'inherit',
    reason: elevated ? 'Elevated risk' : complexity === 'high' ? 'High complexity' : 'Agent default',
    fallback: 'inherit',
  };
}

/**
 * Automatic mode is opt-in. switchModel must be a host-provided function
 * returning {confirmed:true, modelId, reasoningEffort}; a request alone is
 * never considered a successful model switch.
 */
async function execute(input = {}, host = {}) {
  const decision = route(input);
  if (decision.action !== 'switch-request') return { ...decision, switched: false };
  if (host.supportsSwitch !== true || typeof host.switchModel !== 'function') {
    return { ...decision, action: 'recommend', switched: false, reason: 'Host switch unavailable' };
  }
  try {
    const result = await host.switchModel({ modelId: decision.modelId, reasoningEffort: decision.reasoningEffort });
    const confirmed = result && result.confirmed === true && result.modelId === decision.modelId &&
      (decision.reasoningEffort === null || result.reasoningEffort === decision.reasoningEffort);
    return { ...decision, action: confirmed ? 'switched' : 'recommend', switched: !!confirmed,
      reason: confirmed ? decision.reason : 'Host did not confirm selected model/effort' };
  } catch (_) {
    return { ...decision, action: 'recommend', switched: false, reason: 'Host switch failed' };
  }
}

module.exports = { route, execute, policy };
