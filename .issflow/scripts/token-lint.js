#!/usr/bin/env node
// Portable copy — prefer project `scripts/token-lint.js` after install.
// Same logic as repo-root scripts/token-lint.js for kit consumers.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TOKENS = path.join(ROOT, 'docs', 'design', 'tokens.css');
const SCAN_GLOBS = ['src', 'app', 'components', 'pages', 'web', 'frontend', 'ui'];
const EXT = new Set(['.css', '.scss', '.tsx', '.jsx', '.vue', '.svelte', '.html']);
const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const RGB = /\brgba?\([^)]+\)/g;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

if (!fs.existsSync(TOKENS)) {
  console.log('token-lint: skip (no docs/design/tokens.css)');
  process.exit(0);
}

const tokenSrc = fs.readFileSync(TOKENS, 'utf8');
const allowed = new Set();
for (const m of tokenSrc.matchAll(HEX)) allowed.add(m[0].toLowerCase());
for (const m of tokenSrc.matchAll(RGB)) allowed.add(m[0].replace(/\s+/g, '').toLowerCase());

const files = SCAN_GLOBS.flatMap((d) => walk(path.join(ROOT, d)));
const hits = [];
for (const file of files) {
  if (path.resolve(file) === path.resolve(TOKENS)) continue;
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  for (const m of text.matchAll(HEX)) {
    if (!allowed.has(m[0].toLowerCase())) hits.push(`${rel}: raw hex ${m[0]}`);
  }
  for (const m of text.matchAll(RGB)) {
    const norm = m[0].replace(/\s+/g, '').toLowerCase();
    if (!allowed.has(norm)) hits.push(`${rel}: raw color ${m[0]}`);
  }
}

if (!hits.length) {
  console.log(`token-lint: ok (${files.length} files)`);
  process.exit(0);
}
console.error('token-lint: BLOCK — use semantic tokens from docs/design/tokens.css');
for (const h of hits.slice(0, 40)) console.error('  ' + h);
if (hits.length > 40) console.error(`  … +${hits.length - 40} more`);
process.exit(1);
