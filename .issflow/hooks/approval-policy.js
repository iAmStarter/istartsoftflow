'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function fail(message) {
  return { ok: false, reason: message };
}

function within(root, relative) {
  if (!relative || path.isAbsolute(relative)) return false;
  const full = path.resolve(root, relative);
  return full.startsWith(path.resolve(root) + path.sep);
}

function read(root, relative) {
  if (!within(root, relative)) throw new Error('Path escapes repository');
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function gitBlobSha(content) {
  const bytes = Buffer.from(content, 'utf8');
  return crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

function activePlan(root, explicit) {
  if (explicit) return explicit.replaceAll('\\', '/');
  const pointer = path.join(root, 'docs', 'ACTIVE-PLAN');
  if (fs.existsSync(pointer)) return fs.readFileSync(pointer, 'utf8').trim();
  const plansDir = path.join(root, 'docs', 'plans');
  if (fs.existsSync(plansDir) && fs.readdirSync(plansDir).some((name) => /^PLAN-.*\.md$/i.test(name))) {
    throw new Error('docs/ACTIVE-PLAN is required when scoped plans exist');
  }
  return 'docs/PLAN.md'; // Legacy projects remain supported.
}

function matchesPath(pattern, relative) {
  if (pattern.endsWith('/**')) return relative.startsWith(pattern.slice(0, -2));
  return relative === pattern;
}

function validate(root, { planFile, changedFiles = [] } = {}) {
  try {
    const relativePlan = activePlan(root, planFile);
    if (!within(root, relativePlan)) return fail('Invalid plan path');
    const plan = read(root, relativePlan);
    if (relativePlan === 'docs/PLAN.md') {
      const match = plan.match(/^>\s*Approval:\s*(.+)$/mi);
      if (!match || !/^approved\b/i.test(match[1].trim())) return fail('Legacy PLAN.md is not approved');
      return { ok: true, mode: 'legacy', planFile: relativePlan, warning: 'Legacy approval is not revision-scoped; migrate to docs/plans/' };
    }

    const id = plan.match(/^#\s+(PLAN-[A-Za-z0-9-]+)\b/m)?.[1];
    const revision = Number(plan.match(/^>\s*Revision:\s*(\d+)\s*$/mi)?.[1]);
    if (!id || !Number.isSafeInteger(revision) || revision < 1) return fail('Plan ID or revision missing');
    const approvalFile = `docs/approvals/${id}.json`;
    const approval = JSON.parse(read(root, approvalFile));
    if (approval.planId !== id || approval.revision !== revision) return fail('Approval is for a different plan ID or revision');
    if (approval.planBlobSha !== gitBlobSha(plan)) return fail('Plan changed after approval; request a new approval');
    if (!approval.approvedBy || !approval.approvedAt || !approval.approvalSource) return fail('Approval provenance is incomplete');
    if (!Array.isArray(approval.allowedPaths) || approval.allowedPaths.length === 0 ||
        !approval.allowedPaths.every((p) => typeof p === 'string' && p.length > 0 && !p.includes('..') && !p.startsWith('/'))) {
      return fail('Approved path boundaries are missing or invalid');
    }
    for (const file of changedFiles) {
      const normalized = file.replaceAll('\\', '/');
      if (!within(root, normalized) || !approval.allowedPaths.some((p) => matchesPath(p, normalized))) {
        return fail(`File outside approved plan scope: ${file}`);
      }
    }
    return { ok: true, mode: 'scoped', planFile: relativePlan, planId: id, revision, approval };
  } catch (error) {
    return fail(`Approval verification failed: ${error.message}`);
  }
}

module.exports = { validate, gitBlobSha, activePlan, matchesPath };
