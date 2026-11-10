'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', '.issflow', file), 'utf8');

test('core stays concise and loads detailed procedures selectively', () => {
  const core = read('istartsoft-flow/CORE.md');
  assert.ok(core.split('\n').length <= 80);
  assert.match(core, /Load only the procedure/);
  assert.match(core, /RISK-LANES\.md/);
  assert.match(core, /existing scoped-plan\/digest\/path approval verifier/);
});

test('quick removes redundant questions without relaxing approval checks', () => {
  const quick = read('commands/quick.md');
  assert.match(quick, /do not add a redundant confirmation turn/);
  assert.match(quick, /owner-controlled recording mechanism/);
  assert.match(quick, /never self-approve/);
  assert.match(quick, /No shell\/tool bypass/);
  assert.match(quick, /no auth\/security\/permission change/);
  assert.doesNotMatch(quick, /under 30 lines|WAIT for my confirm/);
});

test('risk is consequence-based and admits recording and enforcement limits', () => {
  const lanes = read('istartsoft-flow/RISK-LANES.md');
  for (const phrase of ['not line count', 'one-line auth change', 'exact plan blob',
    'owner-controlled', 'not exact scope', 'Missing/malformed', 'zero-artifact']) {
    assert.ok(lanes.includes(phrase), phrase);
  }
  assert.match(lanes, /Publication\/merge\/deployment is never implied/);
});

test('methodology aligns UX scope and installed-versus-vendor capabilities', () => {
  const methodology = read('istartsoft-flow/METHODOLOGY.md');
  assert.doesNotMatch(methodology, /UI audit checks \*presentation\*/);
  assert.match(methodology, /UX review examines whether users can understand/);
  assert.match(methodology, /installed wiring, not vendor ceilings/);
  assert.match(methodology, /An active feature is not exempt/);
});
