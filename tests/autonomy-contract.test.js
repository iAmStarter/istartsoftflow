const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', '.issflow', name), 'utf8');
const methodology = read('istartsoft-flow/METHODOLOGY.md');
test('autonomy retains approvals, finite retries and honest host continuity', () => {
  for (const phrase of ['plan is approved', 'Preserve retry counters', 'default two',
    'do not create a persistent runtime', 'not approval, test evidence',
    'defaults to `none`', 'a header an agent writes is not consent']) {
    assert.ok(methodology.includes(phrase), phrase);
  }
});
test('quick repairs before parking and goal accounts for blocked attempts', () => {
  assert.match(read('commands/quick.md'), /blocks completion, not the first repair attempt/);
  const goal = read('commands/goal.md');
  assert.match(goal, /including a parked unit/);
  assert.match(goal, /Skip parked units and their dependents/);
  assert.match(goal, /blocked required unit prevents claiming the goal complete/);
});
test('phase and feature distinguish verification from deployment and completion', () => {
  const phase = read('commands/phase.md');
  assert.match(phase, /do not deploy without explicit/);
  assert.doesNotMatch(phase, /Tell me the project is complete and ready to use\./);
  assert.match(read('commands/feature.md'), /every required gate is verified/);
  assert.match(read('commands/feature.md'), /no-commit\/no-push instruction overrides/);
});
test('sprint preserves approval content and cannot recycle blocked work indefinitely', () => {
  const sprint = read('commands/sprint.md');
  assert.match(sprint, /leaving the approved plan unchanged/);
  assert.match(sprint, /Never recycle a blocked phase/);
  assert.match(sprint, /run budget permits/);
});
