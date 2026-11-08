// Dynamic imports keep this test compatible with both CommonJS and ESM hosts.
(async () => {
  const { default: test } = await import('node:test');
  const { default: assert } = await import('node:assert/strict');
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { spawnSync, spawn } = await import('node:child_process');
  const { default: runtime } = await import('../.issflow/runtime/workflow.js');
  const update = (file, id, patch) => runtime.update(file, id, { expectedRevision: runtime.load(file).revision, ...patch });
  const spec = () => ({ goal: 'Ship verified work', budget: 8, tasks: [
    { id: 'a', title: 'First', maxAttempts: 2, units: 2 },
    { id: 'b', title: 'Dependent', dependsOn: ['a'] },
    { id: 'c', title: 'Independent' }
  ] });
  function fixture(t, input = spec()) {
    const dir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'workflow-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    const file = path.join(dir, 'state.json');
    if (input) runtime.init(file, input);
    return { dir, file };
  }
  test('initializes a validated DAG without mutating the input', (t) => {
    const input = spec(); const before = JSON.stringify(input);
    const { file } = fixture(t, input);
    assert.equal(JSON.stringify(input), before);
    assert.deepEqual(runtime.status(file).runnable, ['a', 'c']);
    assert.equal(runtime.status(file).state, 'ready');
    assert.throws(() => runtime.init(file, input), /already exists/);
  });
  test('claims atomically, persists attempts and skips blocked dependencies', (t) => {
    const { file } = fixture(t);
    assert.equal(runtime.next(file).task.id, 'a');
    assert.equal(runtime.load(file).spent, 2);
    update(file, 'a', { state: 'blocked', reason: 'Approval needed' });
    assert.deepEqual(runtime.status(file).runnable, ['c']);
    assert.equal(runtime.next(file).task.id, 'c');
    update(file, 'c', { state: 'done', codeRevision: 'tree:fixture-v1', expectedAttempt: 1, evidence: ['test: passed'] });
    assert.equal(runtime.status(file).state, 'blocked');
    assert.equal(runtime.next(file).task, null);
    update(file, 'a', { state: 'pending' });
    assert.equal(runtime.next(file).task.attempts, 2);
    update(file, 'a', { state: 'done', codeRevision: 'tree:fixture-v1', expectedAttempt: 2, evidence: ['review: approved', 'test: passed'] });
    assert.equal(runtime.next(file).task.id, 'b');
    update(file, 'b', { state: 'done', codeRevision: 'tree:fixture-v1', expectedAttempt: 1, evidence: ['test: passed'] });
    assert.equal(runtime.status(file).state, 'done');
    assert.equal(runtime.status(file).spent, 6);
  });
  test('restart preserves in-flight work and never silently retries it', (t) => {
    const { file } = fixture(t, { goal: 'Resume', budget: 3, tasks: [{ id: 'a', title: 'Task' }] });
    runtime.next(file);
    const checkpoint = fs.readFileSync(file, 'utf8');
    assert.equal(runtime.status(file).state, 'waiting');
    assert.equal(runtime.next(file).task, null);
    assert.equal(fs.readFileSync(file, 'utf8'), checkpoint);
    update(file, 'a', { state: 'waiting', reason: 'External input' });
    assert.equal(runtime.next(file).task, null);
    update(file, 'a', { state: 'pending' });
    assert.equal(runtime.next(file).task.attempts, 2);
  });
  test('completion evidence must match the latest attempt after restart', (t) => {
    const { file } = fixture(t);
    runtime.next(file);
    update(file, 'a', { state: 'pending', evidence: ['old attempt log'] });
    runtime.next(file);
    assert.deepEqual(runtime.load(file).tasks[0].evidence, []);
    assert.throws(() => update(file, 'a', { state: 'done', codeRevision: 'tree:fixture-v1', evidence: ['old success'], expectedAttempt: 1 }), /stale evidence/);
    assert.throws(() => update(file, 'a', { state: 'done', codeRevision: 'tree:fixture-v1', evidence: ['unspecified attempt'] }), /expectedAttempt/);
    assert.throws(() => update(file, 'a', { state: 'done', evidence: ['current attempt'], expectedAttempt: 2 }), /codeRevision/);
    update(file, 'a', { state: 'done', codeRevision: 'tree:fixture-v2', evidence: ['current attempt success'], expectedAttempt: 2 });
    assert.equal(runtime.load(file).tasks[0].codeRevision, 'tree:fixture-v2');
    assert.equal(runtime.load(file).tasks[0].state, 'done');
  });
  test('attempt limits and unit budget are charged on claim, even after failure', (t) => {
    const { file } = fixture(t, { goal: 'Bounded', budget: 5, tasks: [
      { id: 'a', title: 'Task', units: 2, maxAttempts: 1 }, { id: 'b', title: 'Task B', units: 4 }
    ] });
    runtime.next(file); update(file, 'a', { state: 'pending' });
    const report = runtime.next(file);
    assert.equal(report.task, null); assert.equal(report.status.state, 'blocked');
    assert.deepEqual(report.status.tasks[0].blockers, ['attempt limit reached']);
    assert.deepEqual(report.status.tasks[1].blockers, ['unit budget exhausted']);
    assert.equal(report.status.spent, 2);
  });
  test('cannot complete unstarted work, invent attempts, or omit evidence', (t) => {
    const { file } = fixture(t);
    assert.throws(() => update(file, 'a', { state: 'done', codeRevision: 'tree:fixture-v1', expectedAttempt: 1, evidence: ['ok'] }), /Only running/);
    runtime.next(file);
    for (const patch of [{ state: 'done' }, { state: 'done', codeRevision: 'tree:fixture-v1', expectedAttempt: 1, evidence: [' '] },
      { state: 'blocked' }, { state: 'waiting' }, { state: 'running' },
      { state: 'pending', attempts: 0 }, { state: 'pending', reason: 123 }]) {
      const before = fs.readFileSync(file, 'utf8');
      assert.throws(() => update(file, 'a', patch));
      assert.equal(fs.readFileSync(file, 'utf8'), before);
    }
    update(file, 'a', { state: 'done', codeRevision: 'tree:fixture-v1', expectedAttempt: 1, evidence: ['test result path'] });
    assert.throws(() => update(file, 'a', { state: 'pending' }), /immutable/);
  });
  test('rejects malformed plans and DAGs', (t) => {
    const { file } = fixture(t, null);
    const bad = [
      { ...spec(), budget: 0 }, { ...spec(), budget: 1.5 }, { ...spec(), goal: '' },
      { ...spec(), tasks: [] }, { ...spec(), extra: true },
      { ...spec(), tasks: [{ id: '../a', title: 'No' }] },
      { ...spec(), tasks: [{ id: 'a', title: 'A', units: 0 }] },
      { ...spec(), tasks: [{ id: 'a', title: 'A', maxAttempts: -1 }] },
      { ...spec(), tasks: [{ id: 'a', title: 'A', dependsOn: ['missing'] }] },
      { ...spec(), tasks: [{ id: 'a', title: 'A', dependsOn: ['a'] }] },
      { ...spec(), tasks: [{ id: 'a', title: 'A' }, { id: 'a', title: 'Again' }] },
      { ...spec(), tasks: [{ id: 'a', title: 'A', dependsOn: ['b', 'b'] }, { id: 'b', title: 'B' }] },
      { ...spec(), tasks: [{ id: 'a', title: 'A', dependsOn: ['b'] }, { id: 'b', title: 'B', dependsOn: ['a'] }] }
    ];
    for (const input of bad) { assert.throws(() => runtime.init(file, input)); assert.equal(fs.existsSync(file), false); }
  });
  test('fails closed on corrupt state and inconsistent accounting', (t) => {
    const { file } = fixture(t); const valid = runtime.load(file);
    for (const state of [{ ...valid, spent: 1 }, { ...valid, version: 2 }, { ...valid, revision: -1 },
      { ...valid, tasks: valid.tasks.map((task, i) => i ? task : { ...task, state: 'done', codeRevision: 'tree:fixture-v1', expectedAttempt: 1, evidence: ['fake'] }) }]) {
      fs.writeFileSync(file, JSON.stringify(state));
      assert.throws(() => runtime.next(file));
      assert.equal(fs.existsSync(`${file}.lock`), false);
    }
    fs.writeFileSync(file, '{broken'); assert.throws(() => runtime.status(file));
    fs.writeFileSync(file, ' '.repeat(4 * 1024 * 1024 + 1)); assert.throws(() => runtime.status(file), /oversized/);
  });
  test('checks optimistic revision and refuses competing/stale locks', (t) => {
    const { file } = fixture(t);
    assert.throws(() => runtime.update(file, 'a', { state: 'blocked', reason: 'Wait' }), /missing expectedRevision/);
    assert.throws(() => update(file, 'a', { state: 'blocked', reason: 'Wait', expectedRevision: 1 }), /Stale/);
    fs.writeFileSync(`${file}.lock`, 'held');
    assert.throws(() => runtime.next(file), /locked/);
    assert.equal(fs.readFileSync(`${file}.lock`, 'utf8'), 'held');
    fs.unlinkSync(`${file}.lock`);
    update(file, 'a', { state: 'blocked', reason: 'Wait', expectedRevision: 0 });
    assert.equal(runtime.status(file).revision, 1);
  });
  test('two stale readers cannot overwrite a newer claim', (t) => {
    const { file } = fixture(t);
    runtime.next(file);
    const readerOne = runtime.status(file); const readerTwo = runtime.status(file);
    update(file, 'a', { state: 'pending', expectedRevision: readerOne.revision });
    runtime.next(file);
    const before = fs.readFileSync(file, 'utf8');
    for (const state of ['pending', 'waiting', 'blocked', 'done']) {
      assert.throws(() => update(file, 'a', { state, reason: 'Old worker', evidence: ['old log'], codeRevision: 'old-tree', expectedAttempt: 1, expectedRevision: readerTwo.revision }), /Stale/);
      assert.equal(fs.readFileSync(file, 'utf8'), before);
    }
  });
  test('rejects symlink files, symlink directories, hardlinks and directories', (t) => {
    const { file, dir } = fixture(t);
    const link = path.join(dir, 'link.json'); fs.symlinkSync(file, link);
    assert.throws(() => runtime.status(link), /Symbolic/);
    const directoryLink = path.join(dir, 'linked'); fs.symlinkSync(dir, directoryLink);
    assert.throws(() => runtime.init(path.join(directoryLink, 'new.json'), spec()), /Symbolic/);
    assert.throws(() => runtime.status(dir), /ordinary file/);
    fs.unlinkSync(link); fs.linkSync(file, link);
    assert.throws(() => runtime.status(file), /ordinary file/);
  });
  test('concurrent CLI claims never duplicate a task or overspend', async (t) => {
    const { file } = fixture(t, { goal: 'Concurrent', budget: 1, tasks: [{ id: 'a', title: 'One' }] });
    const script = path.resolve('.issflow/runtime/workflow.js');
    const run = () => new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [script, 'next', file]);
      let stdout = ''; let stderr = '';
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
      child.on('error', reject);
      child.on('close', (code) => resolve({ code, stdout, stderr }));
    });
    const results = await Promise.all(Array.from({ length: 8 }, run));
    const claims = results.filter((result) => result.code === 0 && JSON.parse(result.stdout).task);
    assert.equal(claims.length, 1);
    for (const result of results.filter((result) => result.code !== 0)) assert.match(result.stderr, /locked/);
    assert.equal(runtime.load(file).spent, 1);
    assert.equal(runtime.load(file).tasks[0].attempts, 1);
  });
  test('CLI supports init, next, update and status with useful failures', (t) => {
    const { file, dir } = fixture(t, null);
    const script = path.resolve('.issflow/runtime/workflow.js');
    const input = path.join(dir, 'input.json'); fs.writeFileSync(input, JSON.stringify(spec()));
    const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    assert.equal(run('init', file, input).status, 0);
    assert.equal(JSON.parse(run('next', file).stdout).task.id, 'a');
    fs.writeFileSync(input, JSON.stringify({ state: 'done', expectedRevision: 1, codeRevision: 'tree:fixture-v1', expectedAttempt: 1, evidence: ['verified'] }));
    assert.equal(run('update', file, 'a', input).status, 0);
    assert.equal(JSON.parse(run('status', file).stdout).tasks[0].state, 'done');
    const invalid = run('launch', file); assert.equal(invalid.status, 1); assert.match(invalid.stderr, /Usage/);
    assert.equal(run('init', file, input).status, 1);
    assert.deepEqual(fs.readdirSync(dir).sort(), ['input.json', 'state.json']);
  });
})();
