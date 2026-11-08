#!/usr/bin/env node
'use strict';

// Validates reported evidence, not the truth of screenshots or user-research claims.
// Deliberately never opens evidence references, executes commands, or calls the network.
const fs = require('node:fs');
const BASELINE = Object.freeze({
  screen: ['hierarchy', 'accessibility', 'responsive', 'states', 'content', 'consistency'],
  flow: ['task-success', 'navigation', 'recovery', 'feedback'],
});
const RUNTIME = new Set(['accessibility', 'responsive', 'states', 'task-success', 'navigation', 'recovery', 'feedback', 'behavior-preservation']);
const STATUSES = ['pass', 'fail', 'blocked', 'not-run', 'not-applicable'];
const METHODS = ['browser', 'manual', 'automated', 'static', 'user-research'];
const LIMITATION = 'Evidence references and methods are author-reported. This validator does not inspect artifacts, certify accessibility, or establish usability with real users.';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 8192;
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);

function validateReport(report) {
  const errors = [];
  const issue = (condition, message) => { if (!condition) errors.push(message); };
  const invalid = () => ({ valid: false, verdict: 'invalid', errors, limitation: LIMITATION });
  if (!object(report)) { errors.push('Report must be an object.'); return invalid(); }
  issue(report.version === 1, 'version must be 1.');
  issue(['audit', 'redesign', 'new'].includes(report.mode), 'mode must be audit, redesign, or new.');
  issue(text(report.revision), 'revision must identify the inspected commit or build.');
  for (const key of ['scope', 'checks', 'findings']) {
    issue(Array.isArray(report[key]) && report[key].length <= 100000, `${key} must be an array of at most 100000 entries.`);
  }
  if (errors.length) return invalid();
  issue(report.scope.length > 0, 'scope cannot be empty.');
  const targets = new Map();
  report.scope.forEach((target, index) => {
    const label = `scope[${index}]`;
    if (!object(target)) { errors.push(`${label} must be an object.`); return; }
    issue(id(target.id), `${label}.id must be a stable identifier.`);
    issue(!targets.has(target.id), `${label}.id is duplicated.`);
    issue(['screen', 'flow'].includes(target.kind), `${label}.kind must be screen or flow.`);
    issue(text(target.name), `${label}.name is required.`);
    if (target.requiredDimensions !== undefined) {
      issue(Array.isArray(target.requiredDimensions) && target.requiredDimensions.every(id) && new Set(target.requiredDimensions).size === target.requiredDimensions.length,
        `${label}.requiredDimensions must contain unique dimension identifiers.`);
    }
    targets.set(target.id, target);
  });
  const checkIds = new Set();
  const pairs = new Map();
  report.checks.forEach((check, index) => {
    const label = `checks[${index}]`;
    if (!object(check)) { errors.push(`${label} must be an object.`); return; }
    issue(id(check.id) && !checkIds.has(check.id), `${label}.id must be unique and stable.`);
    checkIds.add(check.id);
    issue(targets.has(check.targetId), `${label}.targetId is unknown.`);
    issue(id(check.dimension), `${label}.dimension must be an identifier.`);
    const pair = JSON.stringify([check.targetId, check.dimension]);
    issue(!pairs.has(pair), `${label} duplicates a target/dimension; consolidate evidence into one result.`);
    pairs.set(pair, check);
    issue(STATUSES.includes(check.status), `${label}.status is invalid.`);
    issue(METHODS.includes(check.method), `${label}.method is invalid.`);
    if (['pass', 'fail'].includes(check.status)) {
      issue(Array.isArray(check.evidence) && check.evidence.length > 0 && check.evidence.every(text), `${label}.evidence requires nonempty artifact references.`);
    }
    if (['blocked', 'not-run', 'not-applicable'].includes(check.status)) {
      issue(text(check.explanation), `${label}.explanation is required.`);
    }
    // Automated testing can be static or runtime; it must say which one.
    if (check.method === 'automated') {
      issue(['rendered', 'source'].includes(check.environment), `${label}.environment must identify rendered or source automated checks.`);
    }
    if (check.browserVerified !== undefined) {
      issue(check.browserVerified === false, `${label}.browserVerified cannot be asserted by this report validator; use method and evidence.`);
    }
  });
  const findingIds = new Set();
  report.findings.forEach((finding, index) => {
    const label = `findings[${index}]`;
    if (!object(finding)) { errors.push(`${label} must be an object.`); return; }
    issue(id(finding.id) && !findingIds.has(finding.id), `${label}.id must be unique and stable.`);
    findingIds.add(finding.id);
    issue(targets.has(finding.targetId), `${label}.targetId is unknown.`);
    issue(['blocker', 'major', 'minor'].includes(finding.severity), `${label}.severity is invalid.`);
    issue(['open', 'fixed', 'accepted'].includes(finding.status), `${label}.status is invalid.`);
    issue(text(finding.description), `${label}.description is required.`);
    if (finding.status === 'accepted') issue(text(finding.acceptedBy) && text(finding.reason), `${label} requires acceptedBy and reason.`);
    if (finding.status === 'fixed') issue(Array.isArray(finding.retestEvidence) && finding.retestEvidence.length > 0 && finding.retestEvidence.every(text), `${label} requires retestEvidence.`);
  });
  if (errors.length) return invalid();
  const counts = Object.fromEntries(STATUSES.map(status => [status, 0]));
  const methods = Object.fromEntries(METHODS.map(method => [method, 0]));
  report.checks.forEach(check => { counts[check.status]++; methods[check.method]++; });
  const missing = [];
  const runtimeGaps = [];
  let required = 0;
  let covered = 0;
  let completed = 0;
  for (const target of report.scope) {
    const dimensions = new Set([...BASELINE[target.kind], ...(report.mode === 'redesign' ? ['behavior-preservation'] : []), ...(target.requiredDimensions || [])]);
    for (const dimension of dimensions) {
      required++;
      const check = pairs.get(JSON.stringify([target.id, dimension]));
      if (!check) { missing.push({ targetId: target.id, dimension }); continue; }
      covered++;
      if (check.status === 'not-applicable') { completed++; continue; }
      const runtime = check.method === 'browser' || (check.method === 'automated' && check.environment === 'rendered');
      if (check.status === 'pass' && RUNTIME.has(dimension) && !runtime) runtimeGaps.push({ targetId: target.id, dimension, method: check.method });
      else if (check.status === 'pass') completed++;
    }
  }
  const material = report.findings.filter(finding => ['blocker', 'major'].includes(finding.severity) && finding.status !== 'fixed');
  // Accepted material risks remain visible; acceptance is not evidence of a fix.
  const verdict = material.length || counts.fail ? 'fix-first'
    : missing.length || runtimeGaps.length || counts.blocked || counts['not-run'] ? 'incomplete' : 'reviewed';
  return {
    valid: true, verdict, errors: [], revision: report.revision, mode: report.mode,
    coverage: { targets: report.scope.length, required, covered, completed, counts, methods, missing, runtimeGaps },
    materialFindings: material.map(finding => finding.id),
    limitation: LIMITATION,
  };
}

if (require.main === module) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node .issflow/scripts/ux-evidence.js report.json');
    const filename = process.argv[2];
    const stat = fs.statSync(filename);
    if (!stat.isFile() || stat.size > 10 * 1024 * 1024) throw new Error('Report must be a regular file no larger than 10 MiB.');
    const result = validateReport(JSON.parse(fs.readFileSync(filename, 'utf8')));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.valid && result.verdict === 'reviewed' ? 0 : result.valid ? 1 : 2;
  } catch (error) {
    console.error(JSON.stringify({ valid: false, verdict: 'invalid', errors: [error.message], limitation: LIMITATION }));
    process.exitCode = 2;
  }
}
module.exports = { validateReport, BASELINE };
