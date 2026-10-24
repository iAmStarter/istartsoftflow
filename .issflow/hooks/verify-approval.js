#!/usr/bin/env node
'use strict';

const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { validate } = require('./approval-policy');

function main(args) {
  const root = process.cwd();
  const baseIndex = args.indexOf('--base');
  const filesIndex = args.indexOf('--files');
  const planIndex = args.indexOf('--plan');
  if (baseIndex !== -1 && filesIndex !== -1) throw new Error('Choose --base or --files');
  const planFile = planIndex < 0 ? undefined : args[planIndex + 1];
  let changedFiles = [];
  if (baseIndex >= 0) {
    const base = args[baseIndex + 1];
    if (!base || base.startsWith('--')) throw new Error('Missing --base value');
    const mergeBase = execFileSync('git', ['merge-base', base, 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const diff = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMRT', mergeBase, 'HEAD'], { cwd: root, encoding: 'utf8' });
    changedFiles = diff.split(/\r?\n/).filter(Boolean);
  } else if (filesIndex >= 0) {
    const files = args[filesIndex + 1];
    if (!files || files.startsWith('--')) throw new Error('Missing --files value');
    changedFiles = files.split(',').map((f) => f.trim()).filter(Boolean);
  }
  const result = validate(root, { planFile, changedFiles });
  if (!result.ok) {
    console.error(`BLOCKED: ${result.reason}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Approval verified: ${result.planId || 'legacy'}${result.revision ? ` revision ${result.revision}` : ''}`);
  if (result.warning) console.warn(result.warning);
  console.log(`Checked ${changedFiles.length} changed file(s)`);
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(`BLOCKED: ${error.message}`);
  process.exitCode = 1;
}
