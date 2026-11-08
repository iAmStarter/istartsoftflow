# Host capabilities and verification

The installer ships procedures plus local Node helpers. It does not install an
agent service, guarantee unattended continuation, or enable persistent access.
An active host agent must perform the work and call the helper. Future sessions
require a separately authorized host scheduler. A checkpoint is not approval.

| Capability | Claude adapter | Codex adapter | Cursor adapter |
| --- | --- | --- | --- |
| Entry instructions | CLAUDE.md imports AGENTS.md | AGENTS.md | always-apply workflow/gate rules + AGENTS.md |
| Roles | .claude agent mirror, host-dependent discovery | reference files; use native delegation if exposed | reference files; use native delegation if exposed |
| Installed hooks | session, pre-tool, pre-compact, subagent-stop, stop | none | sessionStart, subagentStop only |
| Task state helper | explicit Node CLI | explicit Node CLI | explicit Node CLI |
| Checkpoint recovery | lean Tier-A session hook summarizes state; agent reconciles | agent reads state explicitly | session hook if supported; otherwise explicit |
| Approval enforcement | edit hook covers listed edit tools, not all shell writes | explicit verifier / CI | explicit verifier / CI |
| Completion proof | agent checks current code; file gate alone is insufficient | same | same |

Host versions and permissions vary. Detect available tools at session start.
Never claim a role file creates an isolated worker or a hook covers every edit.
If delegation is absent, use serial roles. If a hook is absent, perform the same
ritual explicitly. Respect host safety, approval, token, and execution limits.

## Smoke checks

Automated installer tests cover Claude/Codex/Cursor in CommonJS and ESM projects,
dry-run, runtime loading, non-destructive upgrades, and truthful adapter text.
Runtime tests exercise restart, blocked dependencies, independent tasks, budgets,
retries, and evidence. These are local contract tests, not live vendor-host tests.

For a real host smoke check, use an isolated disposable project:
1. Install its adapter and inspect generated entry files/hooks.
2. Start a fresh session, verify instructions are loaded and note actual tools.
3. Run an authorized tiny task and record command output with code revision.
4. Interrupt after a checkpoint. Start a new session and reconcile running work
   rather than blindly retrying a possibly completed external action.
5. Block one task and confirm independent authorized work continues.
6. Verify the final report distinguishes passed, failed, blocked and unrun checks.

Do not count these live-host checks as passed until they actually run. Publishing,
PR creation and deployment need their own authorized scope; local tests do not
imply remote publication or CI success.
