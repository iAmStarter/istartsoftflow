# Local workflow checkpoint helper

`workflow.js` is a dependency-free Node.js CLI and CommonJS API. It persists a
small goal/task DAG and selects the next eligible task. It does **not** run
commands, start workers, verify tests, grant approval, or run as a daemon. An
agent or person still performs work under the project's existing approval rules.
Use Node.js 18 or later. Run tests from the repository root:

```sh
node --test tests/workflow-runtime.test.js
```

## Quick start

Create `goal.json`:

```json
{
  "goal": "Implement and verify the approved change",
  "budget": 8,
  "tasks": [
    { "id": "implement", "title": "Implement approved scope", "maxAttempts": 2, "units": 2 },
    { "id": "test", "title": "Verify the final change", "dependsOn": ["implement"] },
    { "id": "docs", "title": "Update usage examples" }
  ]
}
```

Choose a local checkpoint path with an existing parent directory. Do not store
secrets in state, reasons, or evidence. Keep personal run state out of commits.

```sh
node .issflow/runtime/workflow.js init workflow-state.json goal.json
node .issflow/runtime/workflow.js status workflow-state.json
node .issflow/runtime/workflow.js next workflow-state.json
```

`next` atomically claims a single runnable task, records `running`, increments its
attempt count, and charges `units` to the global budget **before** external work
starts. It returns `{ "task": ..., "status": ... }`. It does not do the task.
Independent tasks remain runnable when another task is blocked, waiting, or
running. A task with unfinished dependencies cannot be claimed.

After actually doing and verifying the selected work, create `result.json`:

```json
{
  "state": "done",
  "expectedAttempt": 1,
  "codeRevision": "git-tree:<exact-tested-tree-or-head-plus-diff-identity>",
  "evidence": ["test: node --test tests/example.test.js; passed; log: <path>"],
  "expectedRevision": 1
}
```

```sh
node .issflow/runtime/workflow.js update workflow-state.json implement result.json
```

Replace the placeholders with real evidence and the actual tested code identity.
`expectedAttempt` must match the claimed task's attempt number. `expectedRevision`
is mandatory optimistic concurrency protection for every update and must match
the **workflow** revision from the latest response, not a Git revision. If another
task changed the workflow, reload it, reconcile the result, and then submit a new
update; never blindly retry a stale update.

## States, retries, and stopping

Task states are `pending`, `running`, `blocked`, `waiting`, and `done`.

- `next` is the only way to start a task. No shell command is inferred from titles.
- A `done` update requires a running task, the current `expectedAttempt`, a
  nonempty `codeRevision`, and at least one nonempty evidence string.
- `blocked` and `waiting` updates require a nonempty `reason`. For example,
  `{"state":"blocked","reason":"Needs approval for expanded file scope","expectedRevision":1}`.
- Mark an unfinished task `pending` to explicitly release it for another attempt.
  `{"state":"pending","expectedRevision":1}` also clears prior evidence and code identity. The next
  claim charges another attempt and units. No refund occurs after failed work.
- `maxAttempts` and the total budget are immutable. Exhausted tasks are not
  claimable even if marked pending. A lower-cost independent task can still run.
- Completed tasks and task definitions are immutable. Changed scope or invalidated
  completed work requires a new reviewed workflow rather than silently resetting
  limits or reusing a stale completion record.

Aggregate status is `ready` if work is claimable, `done` if all tasks completed,
`waiting` if no work is claimable but a task is running or explicitly waiting,
and otherwise `blocked`. The `tasks[].blockers` list explains pending dependency,
attempt-limit, and budget constraints. `next` returns `task: null` without changing
the checkpoint if there is no runnable task. It never loops, waits, or retries.

## Resume and evidence boundary

Every mutation is a checkpoint. After restart, run `status` and inspect unfinished
work. Running tasks stay running: they are never silently reclaimed or repeated.
If the original worker is gone, inspect its effects before explicitly returning
its task to pending. Waiting and blocked tasks also need an explicit update.

Evidence is **caller-attested**. The helper binds completion to the latest attempt
and records the supplied code identity; it does not inspect Git, compare that
identity to the working tree, execute tests, or prove a log is truthful. The caller
must rerun relevant checks after edits and provide the identity of the exact code
checked, including uncommitted changes. A later edit can invalidate a prior done
record; `status` cannot detect that. Do not present persisted `done` as proof that
the current checkout passes. This helper is not a replacement for CI, approval
validation, or review.

## Schemas and API

Plan: `{goal, budget, tasks}`. `goal` and task `title` must be nonempty strings;
`budget`, `units`, and `maxAttempts` must be positive safe integers. Each task is
`{id,title,dependsOn?,maxAttempts?,units?}`. Defaults are `[]`, `3`, and `1`.
IDs match `[A-Za-z0-9][A-Za-z0-9_-]{0,99}`. There must be 1–1000 tasks. Unknown,
duplicate, self, and cyclic dependencies are rejected. Unknown fields fail closed.

Update: `{state,reason?,evidence?,codeRevision?,expectedAttempt?,expectedRevision}`.
`state` may be pending/blocked/waiting/done, never running. `evidence` is an array
of nonempty strings. A done update requires evidence, codeRevision, and
expectedAttempt. Every update requires the current expectedRevision. Updates replace reason/evidence/codeRevision; omitted values
clear them. Callers cannot mutate attempts, budgets, or definitions via updates.

```js
const workflow = require('./.issflow/runtime/workflow.js');
workflow.init('/existing/directory/state.json', plan); // returns persisted state
workflow.status(file);                                // derived summary
workflow.next(file);                                  // {task, status}
workflow.update(file, taskId, patch);                  // derived summary
workflow.load(file);                                  // validated raw state
workflow.validate(state);                             // validates, returns state
workflow.summarize(state);                            // summary without file I/O
```

API calls are synchronous and throw on invalid input. CLI success emits JSON on
stdout; failures emit an error on stderr and exit nonzero. There is no implicit
default checkpoint path. `init` refuses to overwrite an existing file.

## Persistence safeguards and limits

Writes use a same-directory private temporary file, file fsync, and atomic rename.
Exclusive `.lock` files serialize cooperating writers. A crash can leave a lock:
verify that no writer is active before manually removing the stale lock. Locks
are not automatically expired. Readers see the previous or next complete snapshot.
Directory entries are not fsynced, so sudden power-loss durability is not promised.

State and JSON input files are limited to 4 MiB and must be ordinary single-link
files. Symbolic links in the file or its parent path are rejected. Parent directories
must exist. On systems where `/tmp` is a symlink (such as macOS), use its canonical
physical path instead. Malformed/corrupt state is rejected without replacing it. These checks
protect against accidental redirection, not hostile users racing filesystem
changes. Local files remain editable by their owner; validation is not cryptographic
tamper detection. Never place the checkpoint in an untrusted shared directory.
