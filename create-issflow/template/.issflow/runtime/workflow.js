#!/usr/bin/env node
'use strict';

// A checkpoint and scheduling helper, not an executor or approval authority.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const MAX_BYTES = 4 * 1024 * 1024;
const STATES = ['pending', 'running', 'blocked', 'waiting', 'done'];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const integer = (value, min = 0) => Number.isSafeInteger(value) && value >= min;
function keys(value, allowed) {
  assert(object(value), 'Expected an object');
  assert(Object.keys(value).every((key) => allowed.includes(key)), 'Unknown field');
}

function validate(state) {
  keys(state, ['version', 'goal', 'budget', 'spent', 'revision', 'tasks']);
  assert(state.version === 1 && nonempty(state.goal), 'Invalid version or goal');
  assert(integer(state.budget, 1) && integer(state.spent) && state.spent <= state.budget && integer(state.revision), 'Invalid budget or revision');
  assert(Array.isArray(state.tasks) && state.tasks.length > 0 && state.tasks.length <= 1000, 'Expected 1–1000 tasks');
  const byId = new Map();
  for (const task of state.tasks) {
    keys(task, ['id', 'title', 'dependsOn', 'maxAttempts', 'units', 'attempts', 'state', 'reason', 'evidence', 'codeRevision']);
    assert(typeof task.id === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(task.id) && !byId.has(task.id), 'Invalid or duplicate task id');
    assert(nonempty(task.title) && STATES.includes(task.state), 'Invalid title or task state');
    assert(integer(task.maxAttempts, 1) && integer(task.units, 1) && integer(task.attempts) && task.attempts <= task.maxAttempts, 'Invalid task limits');
    assert(Array.isArray(task.dependsOn) && task.dependsOn.every((id) => typeof id === 'string') && new Set(task.dependsOn).size === task.dependsOn.length, 'Invalid dependencies');
    assert(typeof task.codeRevision === 'string', 'Invalid code revision');
    assert(typeof task.reason === 'string' && Array.isArray(task.evidence) && task.evidence.every(nonempty), 'Invalid reason or evidence');
    if (['running', 'done'].includes(task.state)) assert(task.attempts > 0, 'Task has not been attempted');
    if (['blocked', 'waiting'].includes(task.state)) assert(nonempty(task.reason), 'Blocked/waiting requires a reason');
    if (task.state === 'done') {
      assert(task.evidence.length > 0, 'Done requires evidence');
      assert(nonempty(task.codeRevision), 'Done requires codeRevision');
    }
    byId.set(task.id, task);
  }
  let total = 0;
  for (const task of state.tasks) {
    total += task.units * task.attempts;
    assert(Number.isSafeInteger(total), 'Budget overflow');
    for (const id of task.dependsOn) {
      assert(byId.has(id) && id !== task.id, 'Unknown or self dependency');
      if (['running', 'done'].includes(task.state)) assert(byId.get(id).state === 'done', 'Dependencies are not done');
    }
  }
  assert(total === state.spent, 'Spent budget does not match attempts');
  const visiting = new Set(); const visited = new Set();
  function visit(id) {
    assert(!visiting.has(id), 'Dependency cycle');
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of byId.get(id).dependsOn) visit(dep);
    visiting.delete(id); visited.add(id);
  }
  for (const id of byId.keys()) visit(id);
  return state;
}

// Existing parent directory required. Refuse symlinks in every path component.
// This protects accidental redirection, not hostile concurrent filesystem changes.
function safePath(file) {
  assert(nonempty(file), 'A file path is required');
  const full = path.resolve(file);
  let part = path.parse(full).root;
  const pieces = full.slice(part.length).split(path.sep);
  for (let i = 0; i < pieces.length; i++) {
    part = path.join(part, pieces[i]);
    let stat;
    try { stat = fs.lstatSync(part); } catch (error) {
      if (error.code === 'ENOENT' && i === pieces.length - 1) return full;
      throw error;
    }
    assert(!stat.isSymbolicLink(), 'Symbolic links are not allowed');
    assert(i === pieces.length - 1 ? stat.isFile() && stat.nlink === 1 : stat.isDirectory(), 'Expected an ordinary file in a directory');
  }
  return full;
}
function readJSON(file) {
  const full = safePath(file);
  const fd = fs.openSync(full, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
  try {
    const stat = fs.fstatSync(fd);
    assert(stat.isFile() && stat.nlink === 1 && stat.size <= MAX_BYTES, 'Invalid or oversized JSON file');
    return JSON.parse(fs.readFileSync(fd, 'utf8'));
  } finally { fs.closeSync(fd); }
}
function load(file) { return validate(readJSON(file)); }
function write(file, state) {
  validate(state);
  const text = JSON.stringify(state, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= MAX_BYTES, 'State exceeds size limit');
  safePath(file);
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  let fd;
  try {
    fd = fs.openSync(temp, 'wx', 0o600);
    fs.writeFileSync(fd, text); fs.fsyncSync(fd); fs.closeSync(fd); fd = undefined;
    fs.renameSync(temp, file);
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}
function locked(file, operation) {
  file = safePath(file);
  const lock = `${file}.lock`;
  let fd;
  try { fd = fs.openSync(lock, 'wx', 0o600); }
  catch (error) { if (error.code === 'EEXIST') throw new Error('State is locked; verify no writer is active before removing a stale .lock file'); throw error; }
  try { return operation(file); }
  finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
function init(file, spec) {
  keys(spec, ['goal', 'budget', 'tasks']);
  assert(Array.isArray(spec.tasks), 'Expected tasks');
  const state = { version: 1, goal: spec.goal, budget: spec.budget, spent: 0, revision: 0,
    tasks: spec.tasks.map((task) => {
      keys(task, ['id', 'title', 'dependsOn', 'maxAttempts', 'units']);
      return { id: task.id, title: task.title, dependsOn: task.dependsOn ?? [], maxAttempts: task.maxAttempts ?? 3,
        units: task.units ?? 1, attempts: 0, state: 'pending', reason: '', evidence: [], codeRevision: '' };
    }) };
  validate(state);
  return locked(file, (full) => { assert(!fs.existsSync(full), 'State already exists'); write(full, state); return state; });
}
function summarize(state) {
  validate(state);
  const done = new Set(state.tasks.filter((t) => t.state === 'done').map((t) => t.id));
  const runnable = state.tasks.filter((t) => t.state === 'pending' && t.attempts < t.maxAttempts &&
    t.units <= state.budget - state.spent && t.dependsOn.every((id) => done.has(id))).map((t) => t.id);
  const stateName = state.tasks.every((t) => t.state === 'done') ? 'done' : runnable.length ? 'ready' :
    state.tasks.some((t) => ['running', 'waiting'].includes(t.state)) ? 'waiting' : 'blocked';
  return { goal: state.goal, state: stateName, revision: state.revision, budget: state.budget, spent: state.spent,
    remaining: state.budget - state.spent, runnable, tasks: state.tasks.map((t) => ({ ...t,
      blockers: t.state === 'pending' ? [
        ...(t.attempts >= t.maxAttempts ? ['attempt limit reached'] : []),
        ...(t.units > state.budget - state.spent ? ['unit budget exhausted'] : []),
        ...t.dependsOn.filter((id) => !done.has(id)).map((id) => `dependency: ${id}`)
      ] : [] })) };
}
function status(file) { return summarize(load(file)); }
function next(file) {
  return locked(file, (full) => {
    const state = load(full); const summary = summarize(state);
    if (!summary.runnable.length) return { task: null, status: summary };
    const task = state.tasks.find((t) => t.id === summary.runnable[0]);
    task.state = 'running'; task.reason = ''; task.evidence = []; task.codeRevision = ''; task.attempts++;
    state.spent += task.units; state.revision++;
    write(full, state);
    return { task, status: summarize(state) };
  });
}
function update(file, id, patch) {
  keys(patch, ['state', 'reason', 'evidence', 'expectedRevision', 'expectedAttempt', 'codeRevision']);
  assert(['pending', 'blocked', 'waiting', 'done'].includes(patch.state), 'Invalid update state; use next to start work');
  if (patch.codeRevision !== undefined) assert(nonempty(patch.codeRevision), 'Invalid codeRevision');
  if (patch.reason !== undefined) assert(typeof patch.reason === 'string', 'Invalid reason');
  if (patch.evidence !== undefined) assert(Array.isArray(patch.evidence) && patch.evidence.every(nonempty), 'Invalid evidence');
  return locked(file, (full) => {
    const state = load(full);
    assert(integer(patch.expectedRevision) && patch.expectedRevision === state.revision, 'Stale or missing expectedRevision');
    const task = state.tasks.find((t) => t.id === id);
    assert(task, 'Unknown task'); assert(task.state !== 'done', 'Completed tasks are immutable');
    if (patch.state === 'done') {
      assert(task.state === 'running', 'Only running tasks can complete');
      assert(integer(patch.expectedAttempt, 1) && patch.expectedAttempt === task.attempts, 'Done requires the current expectedAttempt; stale evidence rejected');
    }
    task.state = patch.state; task.reason = patch.reason ?? ''; task.evidence = patch.evidence ?? []; task.codeRevision = patch.codeRevision ?? '';
    state.revision++; write(full, state); return summarize(state);
  });
}
function cli(args) {
  const [command, file, arg, patch] = args;
  if (command === 'init' && args.length === 3) return init(file, readJSON(arg));
  if (command === 'status' && args.length === 2) return status(file);
  if (command === 'next' && args.length === 2) return next(file);
  if (command === 'update' && args.length === 4) return update(file, arg, readJSON(patch));
  throw new Error('Usage: workflow.js init STATE SPEC.json | status STATE | next STATE | update STATE TASK PATCH.json');
}
module.exports = { init, load, validate, summarize, status, next, update };
if (require.main === module) {
  try { process.stdout.write(JSON.stringify(cli(process.argv.slice(2)), null, 2) + '\n'); }
  catch (error) { process.stderr.write(`workflow: ${error.message}\n`); process.exitCode = 1; }
}
