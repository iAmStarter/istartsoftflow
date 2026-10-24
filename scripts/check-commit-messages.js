#!/usr/bin/env node
'use strict';

const { execFileSync } = require('node:child_process');

const base = process.argv[2];
if (!base) {
  console.error('Usage: node scripts/check-commit-messages.js <base-ref>');
  process.exit(2);
}
try {
  const mergeBase = execFileSync('git', ['merge-base', base, 'HEAD'], { encoding: 'utf8' }).trim();
  const subjects = execFileSync('git', ['log', '--format=%s', `${mergeBase}..HEAD`], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const convention = /^(feat|fix|docs|test|refactor|perf|style|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: [a-z0-9].{0,71}$/;
  const invalid = subjects.filter((subject) => !convention.test(subject));
  if (invalid.length) {
    console.error('Invalid commit subjects:\n' + invalid.join('\n'));
    process.exit(1);
  }
  console.log(`Validated ${subjects.length} commit subject(s)`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
