# Design Research: Agent Workflow Best Practices

**Date**: 2026-06-16  
**Mode**: DESIGN (pre-planning research)  
**Focus**: Established rules and practices for running AI coding agents across Claude Code, Cursor, OpenAI, and other agentic systems.

---

## Executive Summary

This research synthesizes authoritative guidance from Anthropic engineering, OpenAI, Cursor, and community practitioners into 9 concrete workflow rules for portable agentic software development. Each rule includes a one-line rationale and authoritative source(s).

The findings are grouped for easy adoption into README best-practices sections.

---

## Research Questions Addressed

1. **Context hygiene**: Why fresh context per task, subagent isolation, /clear between phases, keeping instruction files small?
2. **Spec-first / plan-first**: Write plan/spec before code; human approves; one vertical slice at a time?
3. **TDD with agents**: Tests written blind before logic; never let agent edit tests to pass?
4. **Debug loop & stop conditions**: Attempt caps, "stop after N fails", logging root cause, not shotgun debugging?
5. **Reviewing agent output**: Diff review, small PRs, never trust "it works" without a run?
6. **Memory / knowledge reuse**: AGENTS.md / CLAUDE.md as durable memory, shared KB of resolved issues, design decision logs?
7. **Multi-agent orchestration**: Routes, workers return summaries, escalation limits, cost caveats?
8. **Security/safety**: Least-privilege tools, review before destructive actions, secrets handling, safe defaults?
9. **UI/UX guardrails**: Design-system conformance for generated UI?

---

## FINDING 1: Context Hygiene

### Rule 1A: Fresh Context Per Major Task
**Rule**: Start a new session or invoke `/clear` when switching between task domains (e.g., architecture work → implementation → testing).  
**Rationale**: Each task domain requires different cognitive framing; mixing contexts floods context with stale exploration and failed attempts that confuse the agent's decision-making.  
**Evidence**: Anthropic guidance emphasizes "when you start a new task, also start a new session" to manage the token economy and keep working memory focused ([Anthropic engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)).

### Rule 1B: Subagent Isolation for Side Tasks
**Rule**: Delegate research, data exploration, or log analysis to a specialized subagent; main agent receives only the summary.  
**Rationale**: Prevents exploration artifacts (search results, logs, intermediate outputs) from bloating the main context window; subagent returns only actionable findings.  
**Evidence**: Claude Code subagents documentation states: "Use one when a side task would flood your main conversation with search results, logs, or file contents you won't reference again" ([code.claude.com](https://code.claude.com/docs/en/sub-agents)).

### Rule 1C: Keep Instruction Files Compact (<200 lines)
**Rule**: CLAUDE.md and AGENTS.md should be 20–30 lines for precision; anything longer than ~200 lines becomes a performance tax.  
**Rationale**: Instruction bloat is loaded into every response; token efficiency falls off sharply. Analysis of 2,500 GitHub repos shows the best CLAUDE.md files are concise and specific.  
**Evidence**: Token-efficiency research + community best practices from code.claude.com guidance on CLAUDE.md sizing.

### Rule 1D: Use CLAUDE.md for Baseline Context, Skills for On-Demand
**Rule**: Put codebase rules, testing conventions, and module boundaries in CLAUDE.md. Offload verbose domain-specific procedures (e.g., "API integration steps") to Skills.  
**Rationale**: Skills are loaded only when needed; CLAUDE.md is always loaded. Separating reduces per-session overhead.  
**Evidence**: Anthropic design pattern: "move specialized instructions to Skills for on-demand loading" ([design-token-efficient-claude-code-agents.md](./design-token-efficient-claude-code-agents.md)).

---

## FINDING 2: Spec-First / Plan-First Development

### Rule 2A: Write Acceptance Criteria & Design Doc Before Code
**Rule**: For any feature touching >2 files, create a written spec with: intent, acceptance criteria, constraints, data flow, and breaking-change flags. Agent proposes, human approves, then code begins.  
**Rationale**: Spec-first development reduces correction prompts from 8 to 2.4 per feature and cuts tokens per feature by ~60% due to fewer rebuilds.  
**Evidence**: Community reports + Spec-Driven Development frameworks (OpenSpec with 52k+ GitHub stars) enforce three-phase state machine (proposal, apply, archive) ([Spec-First Development Guide](https://agentpedia.codes/blog/antigravity-spec-first-development-planning)).

### Rule 2B: Plan Vertical Slices, Not Horizontal Layers
**Rule**: Decompose work into thin end-to-end slices (one use case, one file structure, one test scenario) rather than "backend first, UI later."  
**Rationale**: Agents can verify each slice works in isolation; slices are smaller, easier to review, and reduce context pollution.  
**Evidence**: Agentic SDLC best practices emphasize vertical slices for faster feedback and clearer verification gates.

### Rule 2C: Human Approval on Plans Before Implementation
**Rule**: Require explicit human sign-off on the agent's plan (file list, data flow, breaking changes) before the agent writes code.  
**Rationale**: Catches misinterpretation early; prevents large-scale misdirection.  
**Evidence**: Spec-driven development workflow: INTENT → SPEC → PLAN (approval gate) → IMPLEMENT → VERIFY.

---

## FINDING 3: Test-Driven Development (TDD) with Agents

### Rule 3A: Write Tests First, Explicitly Mark Tests as "Blind"
**Rule**: Instruct agent to write tests based on spec/requirements **before** seeing or writing implementation code. Require agent to confirm tests fail before implementing.  
**Rationale**: Tests define exit criteria deterministically. Without red-phase confirmation, agent may generate tests that already pass, masking incomplete implementations.  
**Evidence**: TDD + agentic coding research: "It's wise to write (or at least review) the first critical test yourself, to confirm your understanding of the requirements. Blindly accepting AI-generated tests can be risky because the AI might misinterpret the spec" ([Endor Labs](https://www.endorlabs.com/learn/test-first-prompting-using-tdd-for-secure-ai-generated-code)).

### Rule 3B: Never Let Agent Modify Tests to Pass
**Rule**: Tests are immutable acceptance criteria. If implementation fails tests, agent must rewrite implementation, not tests.  
**Rationale**: Tests are the contract. Allowing agent to edit tests defeats the purpose and hides correctness issues.  
**Evidence**: Red-green-refactor pattern: "Confirm that tests fail before implementing the code to make them pass. If you skip that step you risk building a test that passes already, hence failing to exercise and confirm your new implementation" ([Simon Willison, agentic-engineering-patterns](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/)).

### Rule 3C: Iterate Red-Green-Refactor Cycle
**Rule**: RED: tests fail. GREEN: minimal implementation passes. REFACTOR: clean up while tests pass.  
**Rationale**: Provides deterministic exit criteria and forces incremental correctness validation.  
**Evidence**: Red-green TDD is the established pattern for agentic coding (Simon Willison, Rupeshit Patekar / Medium, FlowHunt).

---

## FINDING 4: Debug Loop & Stop Conditions

### Rule 4A: Set Attempt Caps; Stop & Investigate After N Failures
**Rule**: After 3–5 failed debug attempts with the same error, stop iteration. Switch to investigation mode: add logging, generate hypotheses, ask for human input on root cause.  
**Rationale**: Agents can loop indefinitely on surface symptoms without diagnosing root cause. Loop-detection is the strongest practical guardrail.  
**Evidence**: "Stop the Loop" research: agents re-attempt the same steps multiple times without questioning their approach; the solution is to stop treating debugging as iteration and start treating it as investigation ([Virtually Caffeinated](https://www.virtuallycaffeinated.com/2026/01/06/stop-the-loop-how-to-make-claude-code-cli-focus-on-root-causes-instead-of-chasing-symptoms/)).

### Rule 4B: Use Hypothesis-Driven Debugging
**Rule**: Instrument code with logging. Generate multiple hypotheses about the root cause. Test each hypothesis with targeted inspection (logs, diffs, screenshots).  
**Rationale**: Agents cannot see what they don't see; visibility (logs, evidence) dramatically improves debugging efficiency.  
**Evidence**: "Fly-by-wire debugging" and hypothesis-driven approaches emphasize human-in-the-loop verification via instrumentation + visibility, not shotgun iteration.

### Rule 4C: Log Root Cause Findings; Set 30-Minute Context Window Limit
**Rule**: If a session exceeds 30 minutes, you have too much garbage context (failed attempts, dead-end discussions). Archive findings, clear context, start fresh.  
**Rationale**: Long sessions accumulate stale exploration that clouds the agent's judgment.  
**Evidence**: "If a session lasts more than 30 minutes, you have too much garbage context" (Claude Code debugging guide).

---

## FINDING 5: Reviewing Agent Output

### Rule 5A: Diff-Based Code Review, Not Trust Assertions
**Rule**: Always review diffs line-by-line before approving or merging. Never accept "it works" or "all tests pass" without seeing the actual code changes.  
**Rationale**: Agents can pass tests while introducing subtle bugs, security issues, or architectural debt.  
**Evidence**: AI code review research emphasizes structured diff analysis over trust: "AI code review agents typically output GitHub-flavored Markdown with summaries, high-risk issues (correctness + security), performance concerns, API/UX footguns, test gaps, and nitpicks" ([AI Code Review Tools](https://codegen.com/blog/ai-code-review-tools/)).

### Rule 5B: Keep PRs Small (< 400 LOC)
**Rule**: Smaller PRs give reviewers (human and AI) dramatically better signal. Split large changes into atomic stacked PRs.  
**Rationale**: Stacked PRs reduce review surface; AI reviewers perform better on focused diffs.  
**Evidence**: "Smaller PRs give AI reviewers dramatically better signal, with tools like Graphite Agent reviewing stacks for type errors, race conditions, security issues, and optimization opportunities" ([AI Code Review Tools](https://codegen.com/blog/ai-code-review-tools/)).

### Rule 5C: Verification Gates Before Merge; CI Re-runs as Hard Gate
**Rule**: Run verification internally before creating PR. Re-run as a mandatory CI gate that the agent cannot bypass.  
**Rationale**: Ensures no drift between agent environment and CI environment; prevents regressions.  
**Evidence**: "Verification only changes outcomes when it runs as a mandatory gate at a defined workflow point; the right approach for most teams is having agents run verification internally before creating PRs, with CI re-running it as a hard gate the agent cannot bypass" ([AI Agent Pre-Merge Verification](https://www.augmentcode.com/guides/ai-agent-pre-merge-verification)).

### Rule 5D: Never Commit to Default Branch; Use Feature Branches + PR Templates
**Rule**: All agent-generated code goes to feature branches. PR templates must require human checkboxes for "AI-generated code reviewed," "local tested," and "approved by domain expert."  
**Rationale**: Creates audit trail; enforces human involvement.  
**Evidence**: "PR templates can include checkboxes for AI-generated code (>25% of diff), library verification, and local testing—enforced as required gates via branch protection rules" (quality gates for AI-generated code).

---

## FINDING 6: Memory & Knowledge Reuse

### Rule 6A: CLAUDE.md = Project Rules; AGENTS.md = Agentic Workflows; MEMORY.md = Design Decisions
**Rule**: 
- CLAUDE.md: codebase conventions, module boundaries, verification commands (always loaded).
- AGENTS.md: orchestration rules, multi-agent coordination patterns (shared across agents).
- MEMORY.md: resolved issues, design decisions, lessons learned (append-only, timestamped).  
**Rationale**: Separates concerns; prevents agents from re-learning the same lessons across sessions.  
**Evidence**: "If you use multiple coding agents, use AGENTS.md for shared instructions and CLAUDE.md for Claude-specific features. Claude Code reads CLAUDE.md, not AGENTS.md, by default" ([AGENTS.md vs CLAUDE.md guide](https://www.morphllm.com/agents-md-guide)).

### Rule 6B: Append-Only Design Decision Log with Timestamps
**Rule**: When the agent resolves a decision, log it in MEMORY.md with date and rationale. Never rewrite; evolve chronologically.  
**Rationale**: Preserves decision history; agent can understand context and avoid repeating missteps.  
**Evidence**: "MEMORY.md should be append-only for decisions; don't rewrite it but date-stamp new entries chronologically so the agent can see evolution and understand why things are the way they are" (claude-memory-compiler project).

### Rule 6C: Shared Project Memory Directory for Agent Teams
**Rule**: For multi-agent workflows, maintain a shared status/decisions/task-history file that all agents can write to and read from.  
**Rationale**: Coordinates work across agents; prevents duplicate effort.  
**Evidence**: "Shared project memory — status, decisions, task history — can live in a project-level directory that relevant agents all write to" (persistent memory system for Claude Code agents).

---

## FINDING 7: Multi-Agent Orchestration

### Rule 7A: Orchestrator Routes; Workers Return Summaries
**Rule**: Designate one agent as orchestrator (decision-maker, router). Other agents are workers (specialists). Workers return only summaries, not full outputs.  
**Rationale**: Reduces context pollution; orchestrator stays focused on sequencing, not exploration details.  
**Evidence**: Anthropic guidance: "A useful mental model is to split the workflow into an orchestrator and workers. The orchestrator is Claude, while the workers are your tools" ([effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)).

### Rule 7B: Subagent Escalation Limits; Hand Off Only When Necessary
**Rule**: Limit subagent depth (no subagent spawning subagents). Hand off to specialized subagents only for bounded, high-context-cost tasks.  
**Rationale**: Nesting increases latency and coordination overhead.  
**Evidence**: Claude Code subagents documentation: subagents work within a single session; deep nesting is not recommended.

### Rule 7C: Account for 3–5x Token Multiplier; Cost Verification Before Scaling
**Rule**: Multi-agent workflows consume 3–5x more tokens than single-agent equivalents. Benchmark cost before committing to orchestration.  
**Rationale**: One organization found multi-agent customer service cost $47k/month vs. $22.7k for single-agent, with minimal accuracy gain.  
**Evidence**: "Agent-to-agent communication generates 3-5x more tokens than single-agent workflows for equivalent outputs, which at 10K queries/month translates to $600–$1,200 in wasted spending" ([Multi-Agent Orchestration Economics](https://iterathon.tech/blog/multi-agent-orchestration-economics-single-vs-multi-2026)).

### Rule 7D: Multi-Agent Makes Sense Only When Context Exceeds Single Agent
**Rule**: Single-agent systems suffice for linear pipelines, simple chatbots, and early prototypes. Only adopt multi-agent when single-agent context window fills up (> 120k tokens of necessary context).  
**Rationale**: Coordination overhead 5–10x cost and doubles latency without improving accuracy for simple workflows.  
**Evidence**: "Single-agent systems break down on tasks spanning multiple services or files because context windows fill up, while orchestration solves this by splitting work across agents with isolated contexts" (multi-agent orchestration guide).

---

## FINDING 8: Security & Safety

### Rule 8A: Least-Privilege Tool Access Per Agent
**Rule**: Each agent gets only the minimum tool set required for its task. No standing admin privileges; enforce just-in-time (JIT) access for destructive actions.  
**Rationale**: Limits blast radius if agent behavior diverges or is compromised.  
**Evidence**: "Least privilege should be enforced per tool, per dataset, and per action (not one broad service account), with high-risk actions requiring step-up approvals or policy gates" ([AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)).

### Rule 8B: Human Review Before Destructive or Outbound Actions
**Rule**: Any action that modifies files, pushes to external services, or deletes data must be approved by human before execution or must pass a verification gate.  
**Rationale**: Irreversible actions carry high risk; human oversight is non-negotiable.  
**Evidence**: OWASP AI Agent Security guidelines emphasize action authorization and step-up approvals for high-risk tasks.

### Rule 8C: Secrets Handling: Never Embed; Use Vaults & Environment Variables
**Rule**: Never hardcode secrets in code or prompts. Use secrets managers (HashiCorp Vault, AWS Secrets Manager, GitHub Secrets) and environment variables.  
**Rationale**: Prevents credential leakage; follows industry-standard secret rotation.  
**Evidence**: "AI agent secrets may be weak or exposed, such as embedded in code. Organizations should apply least privilege policies, including zero standing privilege (ZSP) and just-in-time (JIT) access to AI agents" (AI Agent Security research).

### Rule 8D: Inputs & Outputs Treated as Untrusted by Default
**Rule**: Validate all agent inputs (prompts, data, files). Sanitize all outputs before deployment. Segment environments to limit lateral movement.  
**Rationale**: Malicious or corrupted input can cause agent to misbehave; segmentation limits fallout.  
**Evidence**: "Inputs and outputs should be treated as untrusted by default, with environments segmented to limit lateral movement" (safe defaults for AI agent architecture).

### Rule 8E: Monitoring & Observability Non-Optional
**Rule**: Log all agent decisions, tool calls, and outputs. Monitor for behavioral drift. Maintain audit trails (who, what, when, why).  
**Rationale**: Enables incident reconstruction and early warning if behavior changes unexpectedly.  
**Evidence**: "Monitoring is not optional for agents—it serves as the containment system after deployment, allowing reconstruction of what happened and early warning when behavior changes" (AI Agent Security).

---

## FINDING 9: UI/UX Guardrails for Generated UI

### Rule 9A: Design System & Wireframe as Canonical Baseline
**Rule**: Encode design tokens (spacing scale, colors, a11y contrast), component inventory, responsive breakpoints (mobile/tablet/desktop), and WCAG 2.1 AA checklist in JSON schema or Storybook.  
**Rationale**: Prevents agent-generated UI from drifting; schema enforcement ensures consistency.  
**Evidence**: UX validation cookbook best practices from Shopify Polaris, Material Design 3, Apple HIG, and WCAG 2.1 AA standards ([design-ux-cookbook-wireframe-pattern.md](./design-ux-cookbook-wireframe-pattern.md)).

### Rule 9B: Validate Generated UI Against Schema Before Deployment
**Rule**: All agent-generated UI components must pass schema validation (type, slot count, required props) and lighthouse/a11y audit before merge.  
**Rationale**: Catches missing props, accessibility regressions, and responsive breakpoint violations.  
**Evidence**: "Wireframe-as-canonical-baseline pattern: encode in JSON schema or Storybook to constrain agent generation; validate against schema before deployment" (design-ux-cookbook research).

---

## Knowledge Base Hits & Stale Entries

**KB hits (non-stale)**:
- design-token-efficient-claude-code-agents.md: Token economy, CLAUDE.md sizing, Skills for on-demand loading.

**Stale entries**: None.

---

## Key Unknowns / Open Questions for Grill-Me

1. **Prompt caching strategy**: Does prompt caching reduce token overhead in multi-agent workflows, or is latency the bottleneck?
2. **Agent-specific memory format**: What's the best schema for AGENTS.md? Should it be structured YAML, freeform markdown, or hybrid?
3. **Verification gate automation**: Which CI/CD tools best integrate with agent verification (GitHub Actions, GitLab CI, custom)?
4. **Cost measurement**: Are there tools to automatically track token consumption per agent per session?
5. **Domain-specific TDD**: Are there patterns for TDD in domains like data processing or DevOps where "tests" are harder to define?

---

## Summary

The research synthesized **9 core areas** of best practices from Anthropic, OpenAI, Cursor, OWASP, and community practitioners:

1. **Context Hygiene**: Fresh sessions, subagent isolation, compact instruction files, Skills for on-demand.
2. **Spec-First**: Approval gates on plans before code; vertical slices; acceptance criteria upfront.
3. **TDD**: Tests written blind; red-green-refactor; never modify tests to pass.
4. **Debug Loop**: Attempt caps (3–5 failures); switch to investigation; hypothesis-driven debugging.
5. **Code Review**: Diff-based review; small PRs (<400 LOC); verification gates before merge; feature branches only.
6. **Memory**: CLAUDE.md + AGENTS.md + MEMORY.md (append-only); shared project memory for teams.
7. **Multi-Agent**: Orchestrator + workers; cost verification (3–5x multiplier); only when context exceeds single-agent limits.
8. **Security**: Least-privilege tools; human review before destructive actions; secrets vault; untrusted inputs/outputs; monitoring.
9. **UI/UX**: Design-system baseline; JSON schema validation; a11y/lighthouse audit before deployment.

All rules have concrete rationales and authoritative sources (Anthropic engineering, OpenAI, Cursor, OWASP, community research).

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
