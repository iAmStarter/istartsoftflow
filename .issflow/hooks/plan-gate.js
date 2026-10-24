#!/usr/bin/env node
'use strict';

// Claude PreToolUse guard. Shell commands and other hosts require the CLI/CI verifier.
const path = require('node:path');
const { validate } = require('./approval-policy');

const MUTATORS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }) + '\n');
}

function safePlanningPath(relative) {
  return /^docs\/plans\/PLAN-[\w-]+\.md$/.test(relative) ||
    /^docs\/features\/[\w.-]+\/(PLAN|FEATURE)\.md$/.test(relative) ||
    relative === 'docs/ACTIVE-PLAN';
}

function run(event) {
  if (!MUTATORS.has(event.tool_name)) return;
  const root = path.resolve(process.env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd());
  const input = event.tool_input || {};
  const paths = event.tool_name === 'MultiEdit'
    ? [input.file_path]
    : [input.file_path || input.notebook_path];
  if (paths.some((p) => typeof p !== 'string' || !p.trim())) {
    return deny('Approval gate cannot determine target path');
  }
  const relative = paths.map((p) => path.relative(root, path.resolve(root, p)).split(path.sep).join('/'));
  if (relative.some((p) => p.startsWith('..') || path.isAbsolute(p))) {
    return deny('Cannot edit outside repository');
  }
  if (relative.every(safePlanningPath)) return;
  if (relative.some((p) => /^docs\/approvals\//.test(p))) {
    return deny('Approval records require a separate owner-controlled action');
  }
  const result = validate(root, { changedFiles: relative });
  if (!result.ok) deny(`Plan approval required: ${result.reason}`);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  try {
    run(JSON.parse(raw));
  } catch (error) {
    deny(`Approval gate error: ${error.message}`);
  }
});
