# Agent Workflow Best Practices – README Edition

**For portable agentic software development (Claude Code, Cursor, Codex, etc.)**

Each rule has a one-line rationale and authoritative source(s).

---

## Context Hygiene

1. **Fresh context per major task.** Start a new session or invoke `/clear` when switching task domains (architecture → implementation → testing).
   - *Rationale*: Mixing contexts floods working memory with stale exploration; agent decision-making degrades.
   - *Source*: [Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

2. **Delegate side tasks to subagents.** Use specialized subagents for research, data exploration, or log analysis; main agent receives only the summary.
   - *Rationale*: Prevents search results, logs, and intermediate outputs from bloating main context window.
   - *Source*: [Claude Code Documentation](https://code.claude.com/docs/en/sub-agents)

3. **Keep instruction files compact (20–30 lines, max ~200 lines).** CLAUDE.md and AGENTS.md become per-session overhead; longer files hurt token efficiency.
   - *Rationale*: Instruction bloat is loaded into every response; analysis of 2,500 repos shows conciseness correlates with better outcomes.
   - *Source*: Community best practices + token-efficiency research

4. **Use CLAUDE.md for baseline context, Skills for on-demand procedures.** Move verbose domain-specific steps to Skills; keep CLAUDE.md to codebase rules, testing conventions, module boundaries.
   - *Rationale*: Skills are loaded only when needed; CLAUDE.md is always loaded. Separation reduces per-session overhead.
   - *Source*: Anthropic design patterns

---

## Spec-First / Plan-First Development

5. **Write acceptance criteria & design doc before code.** For any feature touching >2 files: create spec with intent, acceptance criteria, constraints, data flow, breaking-change flags. Agent proposes; human approves; then code begins.
   - *Rationale*: Spec-first cuts correction prompts 8→2.4 per feature and reduces tokens per feature by ~60% due to fewer rebuilds.
   - *Source*: [Spec-Driven Development](https://agentpedia.codes/blog/antigravity-spec-first-development-planning) + OpenSpec framework (52k+ GitHub stars)

6. **Plan vertical slices, not horizontal layers.** Decompose work into thin end-to-end slices (one use case, one test scenario) rather than "backend first, UI later."
   - *Rationale*: Slices are smaller, easier to review, and reduce context pollution; agents can verify each slice works in isolation.
   - *Source*: Agentic SDLC best practices

7. **Require human approval on plans before implementation.** Explicit sign-off on agent's plan (file list, data flow, breaking changes) before code is written.
   - *Rationale*: Catches misinterpretation early; prevents large-scale misdirection.
   - *Source*: Spec-driven development workflow standard (INTENT → SPEC → PLAN [approval] → IMPLEMENT → VERIFY)

---

## Test-Driven Development (TDD) with Agents

8. **Write tests first; explicitly mark tests as "blind."** Instruct agent to write tests based on spec **before** seeing implementation. Require agent to confirm tests fail before implementing.
   - *Rationale*: Tests define exit criteria deterministically; red-phase confirmation masks incomplete implementations.
   - *Source*: [Endor Labs](https://www.endorlabs.com/learn/test-first-prompting-using-tdd-for-secure-ai-generated-code)

9. **Never let agent modify tests to pass.** Tests are immutable acceptance criteria; agent must rewrite implementation, not tests.
   - *Rationale*: Tests are the contract. Allowing edits defeats the purpose and hides correctness issues.
   - *Source*: [Simon Willison, Agentic Engineering Patterns](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/)

10. **Follow red-green-refactor cycle.** RED: tests fail. GREEN: minimal implementation passes. REFACTOR: clean up while tests pass.
    - *Rationale*: Provides deterministic exit criteria; forces incremental correctness validation.
    - *Source*: Red-green TDD standard (Simon Willison, Rupeshit Patekar, FlowHunt)

---

## Debug Loop & Stop Conditions

11. **Set attempt caps; stop & investigate after N failures.** After 3–5 failed debug attempts with the same error, stop iteration. Switch to investigation mode: add logging, generate hypotheses, ask for human input on root cause.
    - *Rationale*: Agents loop indefinitely on surface symptoms without diagnosing root cause; loop-detection is the strongest guardrail.
    - *Source*: [Virtually Caffeinated](https://www.virtuallycaffeinated.com/2026/01/06/stop-the-loop-how-to-make-claude-code-cli-focus-on-root-causes-instead-of-chasing-symptoms/)

12. **Use hypothesis-driven debugging.** Instrument code with logging. Generate multiple hypotheses about root cause. Test each with targeted inspection (logs, diffs, screenshots).
    - *Rationale*: Agents cannot see what they don't see; visibility (logs, evidence) dramatically improves debugging efficiency.
    - *Source*: Fly-by-wire debugging + hypothesis-driven investigation patterns

13. **Set 30-minute context window limit.** If session exceeds 30 minutes, you have too much garbage context (failed attempts, dead-end discussions). Archive findings, clear context, start fresh.
    - *Rationale*: Long sessions accumulate stale exploration that clouds the agent's judgment.
    - *Source*: Claude Code debugging guidance

---

## Reviewing Agent Output

14. **Diff-based code review, not trust assertions.** Always review diffs line-by-line before approving or merging. Never accept "it works" or "all tests pass" without seeing actual code changes.
    - *Rationale*: Agents can pass tests while introducing subtle bugs, security issues, or architectural debt.
    - *Source*: [AI Code Review Tools](https://codegen.com/blog/ai-code-review-tools/)

15. **Keep PRs small (< 400 LOC).** Smaller PRs give reviewers (human and AI) dramatically better signal. Split large changes into atomic stacked PRs.
    - *Rationale*: Stacked PRs reduce review surface; AI reviewers perform better on focused diffs.
    - *Source*: [Graphite Agent](https://codegen.com/blog/ai-code-review-tools/)

16. **Verification gates before merge; CI re-runs as hard gate.** Run verification internally before creating PR. Re-run as a mandatory CI gate that the agent cannot bypass.
    - *Rationale*: Ensures no drift between agent environment and CI environment; prevents regressions.
    - *Source*: [AI Agent Pre-Merge Verification](https://www.augmentcode.com/guides/ai-agent-pre-merge-verification)

17. **Never commit to default branch; use feature branches + PR templates.** All agent-generated code goes to feature branches. PR templates require human checkboxes: "AI-generated code reviewed," "local tested," "approved by domain expert."
    - *Rationale*: Creates audit trail; enforces human involvement.
    - *Source*: Code quality gates for AI-generated code

---

## Memory & Knowledge Reuse

18. **Separate CLAUDE.md, AGENTS.md, and MEMORY.md by purpose.**
    - **CLAUDE.md**: Project rules, conventions, module boundaries, verification commands (always loaded).
    - **AGENTS.md**: Orchestration rules, multi-agent coordination patterns (shared across agents).
    - **MEMORY.md**: Resolved issues, design decisions, lessons learned (append-only, timestamped).
    - *Rationale*: Separation prevents agents from re-learning lessons across sessions; prevents instruction bloat.
    - *Source*: [AGENTS.md vs CLAUDE.md Guide](https://www.morphllm.com/agents-md-guide)

19. **Keep design decision log append-only with timestamps.** When agent resolves a decision, log it in MEMORY.md with date and rationale. Never rewrite; evolve chronologically.
    - *Rationale*: Preserves decision history; agent understands context and avoids repeating missteps.
    - *Source*: claude-memory-compiler project

20. **Maintain shared project memory directory for agent teams.** For multi-agent workflows, keep a shared status/decisions/task-history file that all agents can write to and read from.
    - *Rationale*: Coordinates work across agents; prevents duplicate effort.
    - *Source*: Persistent memory system for Claude Code agents

---

## Multi-Agent Orchestration

21. **Orchestrator routes; workers return summaries only.** Designate one agent as orchestrator (decision-maker, router). Other agents are workers (specialists). Workers return only summaries, not full outputs.
    - *Rationale*: Reduces context pollution; orchestrator stays focused on sequencing.
    - *Source*: [Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

22. **Limit subagent depth; hand off only when necessary.** No subagent spawning subagents. Hand off to specialized subagents only for bounded, high-context-cost tasks.
    - *Rationale*: Nesting increases latency and coordination overhead.
    - *Source*: Claude Code subagents documentation

23. **Account for 3–5x token multiplier; verify cost before scaling.** Multi-agent workflows consume 3–5x more tokens than single-agent equivalents. Benchmark cost before committing to orchestration.
    - *Rationale*: Example: multi-agent customer service cost $47k/month vs. $22.7k for single-agent, with minimal accuracy gain.
    - *Source*: [Multi-Agent Orchestration Economics](https://iterathon.tech/blog/multi-agent-orchestration-economics-single-vs-multi-2026)

24. **Single-agent suffices for linear pipelines, prototypes; multi-agent only when context exceeds limits.** Only adopt multi-agent when single-agent context window fills up (> 120k tokens of necessary context).
    - *Rationale*: Coordination overhead 5–10x cost and doubles latency without improving accuracy for simple workflows.
    - *Source*: Multi-agent orchestration architecture guide

---

## Security & Safety

25. **Least-privilege tool access per agent.** Each agent gets only the minimum tool set required for its task. No standing admin privileges; enforce just-in-time (JIT) access for destructive actions.
    - *Rationale*: Limits blast radius if agent behavior diverges or is compromised.
    - *Source*: [OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)

26. **Human review before destructive or outbound actions.** Any action that modifies files, pushes to external services, or deletes data must be approved by human before execution or must pass a verification gate.
    - *Rationale*: Irreversible actions carry high risk; human oversight is non-negotiable.
    - *Source*: OWASP AI Agent Security guidelines

27. **Secrets: use vaults & environment variables; never hardcode.** Never embed secrets in code or prompts. Use secrets managers (HashiCorp Vault, AWS Secrets Manager, GitHub Secrets) and environment variables.
    - *Rationale*: Prevents credential leakage; follows industry-standard secret rotation.
    - *Source*: AI Agent Security research

28. **Treat inputs & outputs as untrusted by default.** Validate all agent inputs (prompts, data, files). Sanitize all outputs before deployment. Segment environments to limit lateral movement.
    - *Rationale*: Malicious or corrupted input causes agent misbehavior; segmentation limits fallout.
    - *Source*: Safe defaults for AI agent architecture

29. **Monitoring & observability are non-optional.** Log all agent decisions, tool calls, and outputs. Monitor for behavioral drift. Maintain audit trails (who, what, when, why).
    - *Rationale*: Enables incident reconstruction and early warning if behavior changes unexpectedly.
    - *Source*: [OWASP AI Agent Security](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)

---

## UI/UX Guardrails for Generated UI

30. **Design system & wireframe as canonical baseline.** Encode design tokens (spacing scale, colors, a11y contrast), component inventory, responsive breakpoints (mobile/tablet/desktop), and WCAG 2.1 AA checklist in JSON schema or Storybook.
    - *Rationale*: Prevents agent-generated UI from drifting; schema enforcement ensures consistency.
    - *Source*: Shopify Polaris, Material Design 3, Apple HIG, WCAG 2.1 AA standards

31. **Validate generated UI against schema before deployment.** All agent-generated UI components must pass schema validation (type, slot count, required props) and lighthouse/a11y audit before merge.
    - *Rationale*: Catches missing props, accessibility regressions, and responsive breakpoint violations.
    - *Source*: UX validation cookbook + design-system schema standards

---

## Quick Adoption Checklist

- [ ] Initialize CLAUDE.md (20–30 lines); add project conventions, module boundaries, verification commands.
- [ ] Create AGENTS.md for multi-agent rules (if multi-agent).
- [ ] Create MEMORY.md (append-only design decision log).
- [ ] Set up `/clear` and session-switching discipline.
- [ ] Define spec template (acceptance criteria, constraints, data flow, breaking changes).
- [ ] Document TDD workflow (blind tests, red-green-refactor, no test edits).
- [ ] Set attempt cap policy (3–5 failures → investigation mode).
- [ ] Enable PR templates with AI-generated code checkboxes.
- [ ] Configure least-privilege tool access per agent.
- [ ] Set up audit logging (decisions, tool calls, outputs).
- [ ] Document UI validation schema (design tokens, a11y, responsive breakpoints).

---

## Sources

- [Anthropic Engineering: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Claude Code Documentation: Create Custom Subagents](https://code.claude.com/docs/en/sub-agents)
- [Endor Labs: Test-First Prompting for Secure AI-Generated Code](https://www.endorlabs.com/learn/test-first-prompting-using-tdd-for-secure-ai-generated-code)
- [Simon Willison: Red-Green-Refactor TDD for Agentic Engineering](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/)
- [Virtually Caffeinated: Stop the Loop - Root Cause vs. Symptoms](https://www.virtuallycaffeinated.com/2026/01/06/stop-the-loop-how-to-make-claude-code-cli-focus-on-root-causes-instead-of-chasing-symptoms/)
- [AI Code Review Tools: 8 Options for the Agent Era](https://codegen.com/blog/ai-code-review-tools/)
- [AI Agent Pre-Merge Verification Guide](https://www.augmentcode.com/guides/ai-agent-pre-merge-verification)
- [AGENTS.md vs CLAUDE.md Configuration Guide (2026)](https://www.morphllm.com/agents-md-guide)
- [Multi-Agent Orchestration Economics: Single vs. Multi (2026)](https://iterathon.tech/blog/multi-agent-orchestration-economics-single-vs-multi-2026)
- [OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)
- [Spec-Driven Development: Why Planning Beats Prompting (2026)](https://agentpedia.codes/blog/antigravity-spec-first-development-planning)
- [Cursor Best Practices for Agent Coding](https://cursor.com/blog/agent-best-practices)
- [OpenAI Practical Guide to Building AI Agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
