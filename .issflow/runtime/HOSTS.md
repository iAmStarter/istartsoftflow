# Host capabilities and verification

The kit supplies project guidance, native discovery artifacts and local Node
helpers. It does not replace the host's execution engine, scheduler or security.
A checkpoint is not approval. Support below describes what the installer writes,
not a claim that every installed vendor version activates it.

| Capability | Claude adapter | Codex adapter | Cursor adapter |
| --- | --- | --- | --- |
| Entry | CLAUDE.md imports AGENTS.md | AGENTS.md → concise CORE | scoped host rules + AGENTS.md → CORE |
| Skills | .claude/skills | .agents/skills | .agents/skills |
| Roles | .claude/agents | .codex/agents TOML | .cursor/agents Markdown |
| Model selection | existing Claude aliases | inherit host default | inherit host default |
| Installed hooks | session, pre-tool, pre-compact, subagent-stop, stop | none in this release | sessionStart, subagentStop |
| State helper | explicit Node CLI | explicit Node CLI | explicit Node CLI |
| Approval enforcement | supported edit tools only; shell writes not covered | explicit verifier / CI | explicit verifier / CI |
| Completion proof | current code and runtime evidence, not file presence | same | same |

Codex supports native hooks; this kit deliberately does not install them until
its payload, trust and denial behavior has been verified against supported host
versions. Do not copy Claude hook JSON into another host and assume equivalence.
Native role definitions are configuration, not evidence a worker was spawned.
Check session capabilities and use serial roles when unavailable. Never claim
isolated/blind testing unless the host actually provides that isolation.

Run `npx create-issflow --doctor` or `node .issflow/scripts/doctor.js` from the
consumer project. This is a read-only structural/version check, not host execution
or a security audit. It reports unresolved activation and missing executables.
An all-host install includes Claude compatibility mirrors. Cursor may discover
shared and Claude skills with identical names; inspect the actual host selector
and resolve duplicates deliberately without deleting customized user files.

## Verification levels

1. Contract tests: generation, parsing, non-destructive updates and helper behavior.
2. Host smoke: vendor process discovers skills/roles, authorized tiny task, denied
   scope, checkpoint interruption/resume and honest final report.
3. Product evaluation: the same representative tasks with and without the kit,
   including a real UI flow, behavior preservation, independent acceptance tests,
   human interruptions, elapsed time and measured usage/cost where available.

Passing one level does not imply the next. Record host version, model, setup,
code revision and exact results. Unknown usage/cost is unavailable, not zero.
Do not benchmark against the active production checkout or run real outbound
transactions. Use disposable fixtures or a separately authorized example project.

## Current official integration references

Checked 2026-11-10; host versions and deployment surfaces may differ:
- Codex skills: https://learn.chatgpt.com/docs/build-skills
- Codex subagents: https://learn.chatgpt.com/docs/agent-configuration/subagents
- Codex hooks: https://learn.chatgpt.com/docs/hooks
- Cursor skills: https://cursor.com/docs/skills
- Cursor subagents: https://cursor.com/docs/subagents
- Claude subagents: https://code.claude.com/docs/en/sub-agents
- Claude hooks: https://code.claude.com/docs/en/hooks
