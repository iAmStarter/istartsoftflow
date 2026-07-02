#!/usr/bin/env node
// Stop hook — the feature-lane gate. While a /feature run is active
// (docs/STATE.md has `feature: <slug> (active)`), the session may not end
// with unchecked gates in docs/features/<slug>/GATES.md. Deterministic
// enforcement: the pipeline cannot silently skip a step it merely forgot.
// It verifies the checklist was worked through, not the work itself — the
// real proof (green suites, files on disk) is checked by the steps that
// tick each box. Pure Node, cross-platform, zero deps.
'use strict';
const fs = require('fs');
const path = require('path');

try { process.chdir(process.env.CLAUDE_PROJECT_DIR || '.'); } catch (_) {}

const allow = () => process.exit(0);
const block = (reason) => { process.stdout.write(JSON.stringify({ decision: 'block', reason }) + '\n'); process.exit(0); };
const read = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch (_) { return null; } };

// stdin: hook input JSON. stop_hook_active=true means we already blocked once
// this stop — allow through to avoid an infinite block loop.
let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch (_) {}
if (input.stop_hook_active) allow();

const state = read(path.join('docs', 'STATE.md'));
if (!state) allow();

// only an ACTIVE feature arms the gate. `(done)` / `(parked — reason)` disarm it.
const m = state.match(/^\s*feature:\s*([A-Za-z0-9._-]+)\s*\(active\)/m);
if (!m) allow();
const slug = m[1];

const gates = read(path.join('docs', 'features', slug, 'GATES.md'));
if (!gates) block(
  `Feature "${slug}" is active in docs/STATE.md but docs/features/${slug}/GATES.md is missing. ` +
  `Recreate the gate checklist (see /feature step 0c), or park the run: set ` +
  `"feature: ${slug} (parked — <reason>)" in docs/STATE.md.`
);

const open = gates.split('\n').filter((l) => /^\s*- \[ \]/.test(l)).map((l) => l.replace(/^\s*- \[ \]\s*/, '').trim());
if (open.length === 0) block(
  `Feature "${slug}": all gates are checked but docs/STATE.md still says (active). ` +
  `Finish the close-out: set "feature: ${slug} (done)" in docs/STATE.md (/feature step 8).`
);

block(
  `Feature "${slug}" has ${open.length} unchecked gate(s): ${open.join(' · ')}. ` +
  `Finish those steps and tick each box in docs/features/${slug}/GATES.md, ` +
  `or park the run: set "feature: ${slug} (parked — <reason>)" in docs/STATE.md ` +
  `and record the blocker in docs/features/${slug}/BLOCKED.md.`
);
