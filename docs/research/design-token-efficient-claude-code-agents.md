# Design Research: Token-Lean Claude Code Agent Kits

**Date:** 2026-06-16  
**Topic:** Token efficiency best practices for Claude Code agent frameworks  
**Source:** Web research + official Anthropic Claude Code docs  

---

## TOPIC 1: Components That Cost Tokens Per Session vs On-Demand

### SessionStart Hook: Always-On Cost ⚠️

**Cost model:**
- SessionStart hook **output is injected into context once at session start**
- This means the hook output is an **always-on cost per session**: every new session reads this context
- Unlike `.claude.md` files (which Claude can ignore), SessionStart hooks are **deterministic** — output is always injected
- As of Claude Code 2.1.0, hook output is injected silently via `hookSpecificOutput.additionalContext` (not user-visible)

**Quantified guidance:**
- Keep SessionStart hook output between **200–500 tokens max** (essential requirements only)
- Each token injected costs proportionally across the entire session — this compounds with every message
- Example: 500-token hook output × 100 messages = 50,000 input token re-reads across the session
- Avoid documentation dumps; seed only critical state (open issues, recent commits, env facts)

**Token impact per session breakdown** (from official docs):
- System prompt (~8,700 tokens) is **cached after first turn** — essentially free after T1
- SessionStart hook output is **NOT cached** — costs input tokens on every message in the session
- Resumed sessions retain conversation history in transcript; skip redundant context loads (check `source` field)

---

### Subagents & Skills: On-Demand Loading

**Cost model:**
- Skills load **only when invoked** — zero cost until called
- Subagents return **condensed summaries (1,000–2,000 tokens)** from potentially tens of thousands of tokens of exploration
- Each subagent maintains **its own context window** — roughly proportional to team size (agent teams use ~7x more tokens than standard sessions in plan mode)

**Token-saving pattern:**
- Delegate verbose operations (tests, log parsing, data fetches) to subagents so output stays isolated
- Keep subagent spawn prompts focused; teammates auto-load CLAUDE.md and skills, so prompt bloat adds cost
- Use Sonnet for subagents (balances capability + cost for coordination tasks)

---

### CLAUDE.md (Static File): Cached, But Always Loaded

**Cost model:**
- CLAUDE.md is **loaded into context at session start** (like SessionStart hook, but non-scripted)
- Content is **eligible for prompt caching** if using the Claude API
- Recommend keeping CLAUDE.md **under 200 lines** to avoid baseline context bloat

**Best practice:**
- Move detailed, specialized instructions (PR review templates, migration workflows) into **Skills** (on-demand) rather than keeping them in CLAUDE.md
- Keep CLAUDE.md for only essentials: project conventions, naming patterns, and compact instructions for compaction behavior

---

## SessionStart Hook Best Practices (Minimize Output)

### Pattern 1: Conditional Loading Based on Session Source

```bash
#!/bin/bash
source=$(jq -r '.source' < /dev/stdin)

if [ "$source" = "startup" ]; then
  # Fresh session only: load expensive context
  open_issues=$(gh issue list --limit 5 2>/dev/null | sed 's/^/  /')
  recent_changes=$(git log --oneline -3 2>/dev/null)
  context="Open issues:\n$open_issues\n\nRecent commits:\n$recent_changes"
else
  # Resumed session: skip — context already in transcript
  context=""
fi

jq -nc --arg ctx "$context" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'
```

**Savings:** Avoids re-fetching expensive context on resumed sessions (same session object retains history).

### Pattern 2: Use sessionTitle + watchPaths (No Token Cost)

Instead of injecting context about branch/environment:

```bash
jq -nc '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    sessionTitle: "auth-refactor / main",
    watchPaths: ["/home/user/my-project/.env"],
    additionalContext: "Environment configured"
  }
}'
```

- `sessionTitle` costs no tokens (sidebar metadata only)
- `watchPaths` register reactive updates; changes fire `FileChanged` hooks (pay only on actual changes)

### Pattern 3: Separate Static Env Setup (Zero Token Cost)

```bash
#!/bin/bash
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  nvm use 20
  nvm current >> "$CLAUDE_ENV_FILE"
fi
exit 0  # No additionalContext — no tokens spent
```

**Savings:** Setup that Claude doesn't need to reason about doesn't go into context.

### Pattern 4: Factual, Not Imperative

```bash
# ✅ GOOD (factual context)
"The active branch is feat/auth-refactor"
"This project uses pnpm for package management"

# ❌ BAD (imperative; triggers prompt-injection defenses)
"You must use pnpm for all installs"
"Never deploy without approval"
```

Imperative framing can trigger Claude's defense systems, surfacing the text instead of incorporating it.

---

## Always-Loaded Methodology/Rules Files: Worth It?

**Analysis:** Large methodology files (e.g., METHODOLOGY.md with 1,000+ tokens) add baseline session cost.

**Recommendation:**
- **DO** embed in CLAUDE.md: Essential patterns, naming conventions, architecture summary (keep under 200 lines total)
- **DO NOT** embed: Full methodology dumps, comprehensive runbooks, or detailed state machines
  - Instead: Reference them via **Skills** so they load only when invoked
  - Or: Create a `README.md` for human reference; don't inject it into every Claude session

**Token savings example:**
- 500-token methodology file × 100 messages = 50,000 input tokens per session
- Moving to a skill: 0 baseline cost; pay only when Claude explicitly calls the skill (maybe 5–10 times per session)
- **Savings: ~45,000+ tokens per session**

---

## Subagent Context Isolation as a Token-Saving Pattern

**How it works:**
- Subagents run in **isolated context windows** with their own history
- Verbose operations (test output, log files, API responses) stay contained in the subagent
- Parent session receives only **condensed summaries** (1,000–2,000 tokens)

**Use cases:**
- Long-running test suites → run in subagent, return pass/fail summary
- Large log file analysis → filter for errors in subagent, return matches
- API exploration → fetch in subagent, return relevant endpoints

**Cost model:**
- Subagent maintains separate context, doesn't pollute parent session
- Trade-off: subagent itself costs tokens, but worthwhile if it prevents 10,000+ token pollution of parent

---

## Official Anthropic Guidance on Token Economy (Claude Code 2.1+)

### From code.claude.com/docs/en/costs

**Key quotes:**
- "Token costs scale with context size: the more context Claude processes, the more tokens you use."
- "Claude Code automatically optimizes costs through prompt caching... and auto-compaction, which summarizes conversation history when approaching context limits."
- "The average cost is around **$13 per developer per active day** and $150–250 per developer per month."

**Recommended strategies (official):**
1. Use `/usage` to check current token consumption
2. **Clear between tasks** with `/clear` (prevents context rot)
3. **Choose the right model**: Sonnet for most tasks, Opus only for complex reasoning
4. **Reduce MCP overhead**: Disable unused servers; prefer CLI tools (no tool listing cost)
5. **Install code intelligence plugins** for typed languages (precise navigation replaces text search)
6. **Offload to hooks + skills**: Preprocess data in hooks; move specialized instructions to skills
7. **Delegate verbose operations to subagents** (tests, fetching docs, processing logs)
8. **Use plan mode** for complex tasks (avoids re-work on wrong paths)
9. **Adjust extended thinking**: Lower effort level with `/effort` or disable for simple tasks

### Rate Limits Per User (official table)

| Team size | TPM per user | RPM per user |
|-----------|--------------|--------------|
| 1–5       | 200k–300k    | 5–7          |
| 5–20      | 100k–150k    | 2.5–3.5      |
| 20–50     | 50k–75k      | 1.25–1.75    |
| 50–100    | 25k–35k      | 0.62–0.87    |
| 100–500   | 15k–20k      | 0.37–0.47    |
| 500+      | 10k–15k      | 0.25–0.35    |

---

## Key Constraints & Unknowns

### Constraints:
1. **SessionStart hook output is NOT prompt-cached** — unlike system prompt, it costs input tokens every message
2. **Agent teams cost ~7x more tokens** — each teammate has its own context window; use sparingly
3. **Extended thinking enabled by default** — thinking tokens are billable as output; consider lowering effort level
4. **Large CLAUDE.md files baseline all sessions** — moving instructions to skills saves tokens on off-topic work

### Unknowns:
- No official guidance on optimal hook output size (research suggests 200–500 tokens as sweet spot, but no hard limit published)
- Prompt caching for SessionStart hooks not supported (as of Feb 2025 cutoff); may change in later versions
- Agent team cost multiplier (7x) may vary by model/team size; not exhaustively documented

---

## Citations

- [Claude Code Docs: Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Docs: Manage Costs Effectively](https://code.claude.com/docs/en/costs)
- [MindStudio: Session Start Hooks](https://www.mindstudio.ai/blog/session-start-hooks-claude-code-force-context)
- [CodeWithMukesh: Anatomy of a Claude Code Session](https://codewithmukesh.com/blog/anatomy-claude-code-session/)
- [TechBytes: Claude Code Session Management & 1M Context](https://techbytes.app/posts/claude-code-session-management-1m-context-guide/)
