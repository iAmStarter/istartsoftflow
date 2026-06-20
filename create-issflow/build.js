#!/usr/bin/env node
// build.js — rebuild template/ from the repo-root .claude kit.
// Pure Node, cross-platform (works in cmd / PowerShell / sh / bash).
// Runs automatically on `npm publish` (prepublishOnly) and via `npm run build`.
'use strict';
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const SRC = path.join(HERE, '..', '.claude');   // repo-root .claude (source of truth)
const TPL = path.join(HERE, 'template', '.claude');
const DIRS = ['agents', 'commands', 'skills', 'hooks', 'istartsoft-flow', 'templates'];

fs.rmSync(path.join(HERE, 'template'), { recursive: true, force: true });
fs.mkdirSync(TPL, { recursive: true });
for (const d of DIRS) {
  const from = path.join(SRC, d);
  if (!fs.existsSync(from)) { console.error(`build: missing ${from}`); process.exit(1); }
  fs.cpSync(from, path.join(TPL, d), { recursive: true });
}

function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
  }
  return n;
}
console.log(`rebuilt template/ from ${SRC} (${countFiles(path.join(HERE, 'template'))} files)`);
