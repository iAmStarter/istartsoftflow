# Design: Multi-Tool Adapter Strategy for iStartSoftFlow

**Date:** 2026-06-16  
**Scope:** CLAUDE.md → per-tool adapter generation (instruction files, commands, hooks, subagents, MCP)  
**Audience:** Implementation planning for `npx create-issflow` with tool-selection branching.

---

## Summary

A portable agentic-dev workflow kit can be made multi-tool by writing ONE source format (iStartSoftFlow's CLAUDE.md + skills + hooks) and GENERATING the target-tool equivalents. This document maps exact file locations, config formats, and precedence rules for each tool so minimal adapters can degrade gracefully.

---

## Tool Capability Matrix

| Tool | Instruction File | Command/Skill Format | Hooks/Lifecycle | Subagents | MCP Config | AGENTS.md Read | Native Support |
|------|------------------|----------------------|-----------------|-----------|------------|----------------|---|
| **Claude Code** | CLAUDE.md<br/>.claude/ | Skills: .claude/skills/{name}/SKILL.md<br/>Commands: .claude/commands/{name}.md | .claude/settings.json<br/>PostToolUse, PreToolUse, SessionStart, etc. | .claude/agents/{name}.md (native) | .mcp.json<br/>~/.claude.json | Yes (fallback) | Full-featured |
| **OpenAI Codex** | AGENTS.md<br/>(precedence: AGENTS.override.md → AGENTS.md → TEAM_GUIDE.md) | Custom agents: .codex/agents/{name}.toml<br/>Skills: agent-scoped | Configured in ~/.codex/config.toml (config layers) | .codex/agents/{name}.toml (native) | ~/.codex/config.toml | Yes (primary) | Full-featured |
| **Cursor** | .cursor/rules/{name}.mdc<br/>AGENTS.md (fallback) | SKILL.md (via .cursor/rules)<br/>CLI reads AGENTS.md, CLAUDE.md | .cursor/hooks.json<br/>(sessionStart, preToolUse, postToolUse, subagentStart/Stop) | Native (referenced in rules) | .cursor/rules (MCP servers inline) | Yes (priority) | Full-featured |
| **Gemini CLI** | GEMINI.md (conventions)<br/>.gemini/extensions/ | Custom commands: .gemini/extensions/{name}/commands/{cmd}.toml | Via extension config in gemini-extension.json | Via extension definition | gemini-extension.json (MCP servers) | No native | Extensions-based |
| **Aider** | CONVENTIONS.md<br/>AGENTS.md (via .aider.conf.yml) | Defined in CONVENTIONS.md or AGENTS.md | .aider.conf.yml (no native hooks) | No native subagent support | Via config.toml (external MCP) | Yes | Minimal |
| **agents.md Standard** | AGENTS.md<br/>(minimal YAML frontmatter, flexible) | Inline in AGENTS.md<br/>(section-based) | No standardized hooks | No standard subagent format | No MCP standard | Auto-read by all | Generic fallback |

---

## Detailed Findings: Per-Tool File Layouts

### Claude Code (Anthropic)

**Official Docs:** [code.claude.com/docs/en/claude-directory](https://code.claude.com/docs/en/claude-directory)

#### Directory Structure
```
project-root/
├── CLAUDE.md                      # Project instructions (auto-reads at session start)
├── .claude/
│   ├── settings.json              # Permissions, hooks, environment
│   ├── settings.local.json        # Local-only overrides (gitignored)
│   ├── CLAUDE.md                  # Alternative location for CLAUDE.md
│   ├── rules/
│   │   ├── testing.md             # Scoped rule with paths: frontmatter
│   │   └── api-design.md          # Can nest: rules/frontend/react.md
│   ├── skills/
│   │   └── {skill-name}/
│   │       ├── SKILL.md           # Entrypoint (description, disable-model-invocation, etc.)
│   │       └── *.md               # Supporting files bundled with skill
│   ├── commands/                  # Deprecated; use skills/ instead
│   │   └── {cmd-name}.md          # Single-file command
│   ├── agents/
│   │   └── {agent-name}.md        # Subagent with name, description, tools fields
│   ├── workflows/
│   │   └── {workflow-name}.js     # Dynamic workflow (orchestrates subagents)
│   ├── agent-memory/              # Persistent memory per subagent
│   │   └── {agent-name}/MEMORY.md
│   └── plugins/                   # Future extensibility
├── .mcp.json                      # Project-scoped MCP servers
├── .worktreeinclude               # Gitignore-syntax for worktree copy
│
~/ (user home)
├── .claude.json                   # App state, theme, personal MCP
├── .claude/
│   ├── CLAUDE.md                  # Global personal preferences
│   ├── settings.json              # User defaults (overridable by project)
│   ├── keybindings.json           # Custom shortcuts
│   ├── themes/                    # Custom color themes
│   ├── projects/                  # Auto memory per project (auto-generated)
│   │   └── <project-path>/memory/
│   │       ├── MEMORY.md          # Claude writes; first 200 lines loaded at startup
│   │       └── {topic}.md         # Spill topics when MEMORY.md grows
│   ├── rules/                     # User-level rules (apply to all projects)
│   ├── skills/                    # Personal skills (available everywhere)
│   ├── commands/                  # Personal commands (deprecated; use skills)
│   ├── output-styles/             # Custom system-prompt styles
│   ├── agents/                    # Personal subagents (available everywhere)
│   ├── workflows/                 # Personal workflows (available everywhere)
│   └── agent-memory/              # Persistent memory for user-scope subagents
```

#### Precedence & Merge Rules
- **CLAUDE.md:** Project and global both loaded; project takes priority if conflict.
- **settings.json:** Project > Local > Global (scalar settings use most specific; arrays combine).
- **Rules, skills, agents:** Project-scoped > User-scoped (by name).
- **Auto memory:** Per project, stored in `~/.claude/projects/<path>/memory/`.

#### Hooks Format (settings.json)
```json
{
  "hooks": {
    "SessionStart": [{"type": "command", "command": "..."}],
    "PostToolUse": [{"matcher": "Edit|Write", "hooks": [...]}],
    "PreToolUse": [...],
    "PostToolUseFailure": [...],
    "PostToolComplete": [...]
  }
}
```

#### MCP Configuration
- **Project:** `.mcp.json` at root (committed, shared with team).
- **User:** `~/.claude.json` under `mcpServers` key (personal only).
- Format: Standard MCP JSON with command, args, env.

---

### OpenAI Codex CLI

**Official Docs:** [developers.openai.com/codex](https://developers.openai.com/codex)

#### Directory Structure & Config
```
project-root/
├── AGENTS.md                      # Primary instruction file
├── AGENTS.override.md             # Takes precedence over AGENTS.md
├── .codex/
│   ├── agents/
│   │   └── {agent-name}.toml      # Custom agent config
│   └── (no other standard subdirs)
├── .mcp.json                      # MCP servers (project-scoped)

~/ (user home)
├── .codex/
│   ├── config.toml                # Global config: model, tokens, features
│   ├── agents/
│   │   └── {agent-name}.toml      # Personal custom agents
│   └── (cache, session state auto-created)
```

#### AGENTS.md Precedence
Codex walks from repo root → cwd, checking each directory:
1. AGENTS.override.md (if present)
2. AGENTS.md (if present)
3. Fallback names (configurable: TEAM_GUIDE.md, .agents.md)

Concatenates all found files (one per directory), joining with blank lines.

#### Custom Agent Format (TOML)
```toml
[agent]
name = "code-reviewer"
description = "Reviews code for correctness"
tools = ["Read", "Grep", "Glob"]  # Optional tool list

[instructions]
# Agent's system prompt goes here as freeform text
```

#### config.toml (Sample)
```toml
[features]
child_agents_md = true

[agent_docs]
project_doc_max_bytes = 65536
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
```

#### MCP Configuration
- Location: `~/.codex/config.toml` or `.mcp.json` (project).
- Format: Standard MCP JSON/TOML references.

---

### Cursor

**Official Docs:** [cursor.com/docs/rules](https://cursor.com/docs/rules), [cursor.com/docs/hooks](https://cursor.com/docs/hooks)

#### Directory Structure
```
project-root/
├── .cursor/
│   ├── rules/
│   │   └── {rule-name}.mdc        # YAML frontmatter + markdown content
│   └── hooks.json                 # Lifecycle hooks config
├── AGENTS.md                      # Fallback (CLI reads if .cursor/ missing)
├── CLAUDE.md                      # Fallback (CLI reads; respected same as AGENTS.md)
├── .mdc.json                      # MCP servers (if needed; non-standard)

~/ (user home)
├── .cursor/                       # User-scoped rules, hooks (not commonly used)
```

#### .mdc File Format
```yaml
---
paths:
  - "**/*.test.ts"
  - "src/api/**/*.ts"
---

# Rule Title

- Markdown content here
- Claude reads this as guidance
```

**Key:** `.mdc` is a naming convention (markdown + metadata). No semantic difference from `.md`, but Cursor parses YAML frontmatter.

#### hooks.json Format
```json
{
  "hooks": [
    {
      "event": "sessionStart",
      "handler": "bash",
      "command": "..."
    },
    {
      "event": "preToolUse",
      "handler": "bash",
      "command": "..."
    },
    {
      "event": "postToolUse",
      "matcher": "Edit|Write",
      "handler": "bash",
      "command": "..."
    }
  ]
}
```

**Lifecycle Events:** sessionStart, sessionEnd, preToolUse, postToolUse, postToolUseFailure, subagentStart, subagentStop.

#### MCP Configuration
- No standardized `.mcp.json` in Cursor yet (as of 2026-06).
- MCP servers may be defined inline in rules or via external config.

---

### Google Gemini CLI

**Official Docs:** [google-gemini.github.io/gemini-cli/docs/extensions](https://google-gemini.github.io/gemini-cli/docs/extensions)

#### Directory Structure
```
project-root/
├── GEMINI.md                      # Conventions/instructions
├── .gemini/
│   ├── extensions/
│   │   └── {extension-name}/
│   │       ├── gemini-extension.json    # Extension manifest
│   │       ├── commands/
│   │       │   └── {cmd-name}.toml      # Custom commands
│   │       └── mcp-servers/             # Optional MCP definitions
│   └── config.toml                # Extension config (if needed)

~/ (user home)
├── .gemini/
│   ├── extensions/                # User-scoped extensions (take precedence)
│   └── config.toml                # User config
```

#### gemini-extension.json Format
```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "description": "My custom extension",
  "contextFileName": "GEMINI.md",
  "mcpServers": [
    {
      "name": "my-mcp",
      "command": "python",
      "args": ["-m", "mcp_server"]
    }
  ]
}
```

#### Custom Commands (TOML)
```toml
# .gemini/extensions/{name}/commands/deploy.toml
[command]
name = "deploy"
description = "Deploy application"
prompt = """
Deploy the application to staging.
"""
# Nesting: gcs/sync.toml creates /gcs:sync command
```

#### Precedence
- User `.gemini/extensions/` overrides workspace `.gemini/extensions/` (same name).
- GEMINI.md is read if listed in extension's `contextFileName`.

---

### Aider

**Official Docs:** [aider.chat/docs/usage/conventions.html](https://aider.chat/docs/usage/conventions.html)

#### Directory Structure
```
project-root/
├── CONVENTIONS.md                 # Coding conventions (plain markdown)
├── AGENTS.md                      # Supported if configured
├── .aider.conf.yml                # YAML config file

~/ (user home)
├── .aider/
│   └── (cache, profiles)
```

#### CONVENTIONS.md Format
- **Format:** Plain markdown with NO required structure.
- **Content:** Project-specific conventions, e.g.:
  ```markdown
  # Code Conventions
  
  - Use httpx instead of requests
  - Always add type hints
  - Tests in tests/ directory
  ```

#### .aider.conf.yml (Sample)
```yaml
model: claude-3-5-sonnet
read-files:
  - CONVENTIONS.md
  - README.md

mcp-servers:
  github:
    command: npx
    args: ["@modelcontextprotocol/server-github"]
    env:
      GITHUB_TOKEN: ${GITHUB_TOKEN}
```

**Key:** Aider reads CONVENTIONS.md via `read-files` directive (marked read-only for prompt caching).

#### Limitations
- **No native hooks:** Aider does not support lifecycle hooks.
- **No subagents:** Aider spawns separate processes; no native subagent abstraction.
- **Limited MCP:** Configured in .aider.conf.yml; not as deep as Claude Code.

---

### agents.md (Open Standard)

**Official Spec:** [github.com/agentsmd/agents.md](https://github.com/agentsmd/agents.md)

#### File Location & Format
```
project-root/
├── AGENTS.md                      # Main instruction file
```

**Structure:**
```markdown
---
description: Short one-liner about the project
globs: ["**/*.ts", "**/*.tsx"]  # Optional: file patterns the instructions apply to
alwaysApply: true                # Optional: whether to always load
---

# Dev Environment

- Node 18+
- pnpm install

# Testing

- Run: `pnpm test`

# Code Style

- Use PascalCase for components
```

#### Key Characteristics
- **No required frontmatter:** Optional YAML with triple-dash delimiters.
- **Flexible sections:** No mandated structure; adapt to project needs.
- **No hooks, no MCP:** Plain markdown; tools implement reading/parsing.
- **Precedence:** Tool-dependent; Codex has explicit chain (AGENTS.override.md → AGENTS.md → TEAM_GUIDE.md).

#### Tools That Read agents.md
- Claude Code (fallback if CLAUDE.md missing).
- Codex (primary).
- Cursor (fallback + CLI mode).
- Aider (if configured).
- GitHub Copilot, Windsurf, Jules, and others.

**Note:** agents.md is a lowest-common-denominator standard; tool-specific features (hooks, MCP, subagents) are not part of the spec.

---

## Adapter Strategy: Source → Multi-Tool Generation

### Core Principle
Write iStartSoftFlow config ONCE in Claude Code format (CLAUDE.md + .claude/ structure), then generate equivalents for other tools by:
1. **Preserving semantics:** Instructions stay intelligible across tools.
2. **Degrading gracefully:** Drop tool-specific features (hooks, subagents) if target tool doesn't support them.
3. **Normalizing config:** Map Claude Code settings → equivalent tool configs.

### Single-Source Artifacts

#### 1. Source: iStartSoftFlow CLAUDE.md + .claude/
- **Base:** CLAUDE.md (human-readable; all tools can read it).
- **Skills:** .claude/skills/ (auto-invoked prompts).
- **Rules:** .claude/rules/ (path-scoped instructions).
- **Hooks:** .claude/settings.json (SessionStart, PostToolUse, etc.).
- **Agents:** .claude/agents/ (specialized subagents).
- **MCP:** .mcp.json (external tool integrations).

#### 2. Generation Targets

| Target | Source Files | Generated Output | Degradation |
|--------|--------------|------------------|-------------|
| **Codex** | CLAUDE.md + rules + agents | AGENTS.md, .codex/agents/*.toml | No subagent isolation; agents flatten to AGENTS.md |
| **Cursor** | CLAUDE.md + rules + agents | .cursor/rules/*.mdc, hooks.json | No workflow orchestration; skills → rules |
| **Gemini CLI** | CLAUDE.md + rules | GEMINI.md, .gemini/extensions/ | No hooks; no subagents; commands → TOML |
| **Aider** | CLAUDE.md + rules | CONVENTIONS.md, .aider.conf.yml | No hooks; no MCP natively; skills → text sections |
| **agents.md** | CLAUDE.md + rules | AGENTS.md (frontmatter-optional) | No hooks, no MCP, no subagents; universal fallback |

### Generation Rules

#### Rule 1: Instructions (CLAUDE.md → Target)
```
Claude Code:  CLAUDE.md (target < 200 lines) + rules/ (scoped)
    ↓
Codex:        AGENTS.md (consolidated) + AGENTS.override.md (overrides)
Cursor:       .cursor/rules/*.mdc (one per rule) + AGENTS.md (fallback)
Gemini CLI:   GEMINI.md (consolidated) + .gemini/extensions/{ext}/commands/
Aider:        CONVENTIONS.md (consolidated) + AGENTS.md (for context)
agents.md:    AGENTS.md (plain; drop paths: scoping)
```

**Logic:**
- Extract CLAUDE.md + rules/*.md.
- Merge into single instruction file per tool (scoping frontmatter when supported).
- For agents.md: strip tool-specific syntax; output minimal frontmatter.

#### Rule 2: Skills/Commands → Tool Equivalents
```
Claude Code:  .claude/skills/{name}/SKILL.md (auto-invoked)
    ↓
Codex:        AGENTS.md + .codex/agents/{name}.toml (custom agent)
Cursor:       .cursor/rules/{name}.mdc (skill rules)
Gemini CLI:   .gemini/extensions/{name}/commands/*.toml
Aider:        CONVENTIONS.md sections (no auto-invocation)
agents.md:    AGENTS.md sections (no auto-invocation)
```

**Logic:**
- Claude Code skills → skill frontmatter (description, tools).
- Codex → custom agent TOML (if skill has isolation requirements).
- Cursor/Gemini → rule/command files.
- Aider/agents.md → documentary sections (no exec semantics).

#### Rule 3: Hooks → Tool Events
```
Claude Code:  .claude/settings.json hooks (SessionStart, PostToolUse, etc.)
    ↓
Codex:        config.toml [agent_docs] (no direct hook equiv.)
Cursor:       .cursor/hooks.json (sessionStart, postToolUse, etc.)
Gemini CLI:   gemini-extension.json (no hooks)
Aider:        .aider.conf.yml read-files (no hooks)
agents.md:    (no hooks standard)
```

**Logic:**
- Hooks → bash commands in source.
- Cursor supports similar events; direct map.
- Codex: hooks drop; config options remain.
- Gemini/Aider/agents.md: drop hooks (warn user).

#### Rule 4: Subagents → Tool Equivalents
```
Claude Code:  .claude/agents/{name}.md (with tools: field)
    ↓
Codex:        .codex/agents/{name}.toml (custom agent)
Cursor:       .cursor/rules/ (inline; no isolation)
Gemini CLI:   .gemini/extensions/{name}/ (extension as pseudo-agent)
Aider:        (none; drop with warning)
agents.md:    (none; drop with warning)
```

**Logic:**
- Claude subagents → context-isolated specialized entities.
- Codex: native custom agent support.
- Cursor: rules (same context, not isolated).
- Gemini: extensions (lightweight isolation).
- Aider/agents.md: no equivalent; document as fallback instructions.

#### Rule 5: MCP Configuration
```
Claude Code:  .mcp.json (project-scoped) + ~/.claude.json (user-scoped)
    ↓
Codex:        ~/.codex/config.toml [mcp_servers]
Cursor:       (no standard; skip or document manually)
Gemini CLI:   gemini-extension.json + .gemini/config.toml
Aider:        .aider.conf.yml [mcp-servers]
agents.md:    (no MCP standard)
```

**Logic:**
- Extract MCP servers from .mcp.json.
- Map to target config location; warn if unsupported.

---

## Implementation Checklist for create-issflow Adapter

### Phase 1: Read Source
- [ ] Parse CLAUDE.md (frontmatter + content).
- [ ] Glob .claude/rules/*.md; parse paths: frontmatter.
- [ ] Glob .claude/skills/**/SKILL.md; extract description, tools, disable-model-invocation.
- [ ] Glob .claude/agents/*.md; extract name, description, tools.
- [ ] Parse .claude/settings.json hooks (SessionStart, PostToolUse, etc.).
- [ ] Parse .mcp.json MCP servers.

### Phase 2: Transform (Per-Tool)
- [ ] **Codex Adapter:** Merge CLAUDE.md + rules into AGENTS.md; extract agents → .codex/agents/.
- [ ] **Cursor Adapter:** Map rules → .cursor/rules/*.mdc; generate hooks.json from settings.json.
- [ ] **Gemini CLI Adapter:** Merge CLAUDE.md → GEMINI.md; create .gemini/extensions/ + commands/.
- [ ] **Aider Adapter:** Merge CLAUDE.md + rules → CONVENTIONS.md; config .aider.conf.yml.
- [ ] **agents.md Adapter:** Strip tool-specific fields; output minimal AGENTS.md.

### Phase 3: Output & Validation
- [ ] Write generated files to target tree.
- [ ] Validate JSON/TOML syntax.
- [ ] Warn on degradations (hooks/subagents unsupported).
- [ ] Generate a per-tool capability summary.

### Phase 4: Metadata & Docs
- [ ] Write manifest: which source files generated which outputs.
- [ ] Generate README per tool explaining how to use (e.g., "Cursor users: edit .cursor/rules/*.mdc").
- [ ] Create ADAPTER.md with tool-specific notes (e.g., "Aider: no hooks; manually call /read").

---

## Open Questions & Unknowns

1. **Aider Hooks Workaround:** Can we emit `.aider.conf.yml` with `before-cmd` or `after-cmd` to approximate PostToolUse behavior?
   - Research: Aider 0.24.2 doesn't have native hooks; check if config.toml supports script injection.

2. **Gemini CLI Subagent Model:** Can extensions define specialized subagents, or only extend the root agent?
   - Spec unclear; may need to flatten all agents into single GEMINI.md.

3. **Cursor MCP JSON Schema:** Is there an official .mcp.json spec for Cursor, or is MCP config still IDE-only?
   - Needs verification; as of 2026-06, appears to be feature request, not yet implemented.

4. **agents.md Frontmatter Adoption:** Do all tools actually parse optional YAML frontmatter, or is it cosmetic?
   - Recommend: support it in generator but do NOT require it; output plain markdown if unsure.

5. **Tool Precedence Conflicts:** If project has both CLAUDE.md and AGENTS.md, which wins?
   - **Claude Code:** CLAUDE.md priority.
   - **Codex:** AGENTS.md priority (unless AGENTS.override.md exists).
   - **Cursor CLI:** AGENTS.md if in project root (CLAUDE.md is fallback).
   - **Recommendation:** Generator should emit warnings if both exist; suggest consolidating.

---

## Cost & Token Impact

### Claude Code
- **CLAUDE.md:** Always loaded; baseline ~100–500 tokens (guidance, not enforced).
- **Skills:** On-demand; ~50–200 tokens per skill.
- **Hooks:** Enforced; e.g., PostToolUse on every edit (~20 tokens per call).

### Codex
- **AGENTS.md:** Configurable max bytes (default 65536); typically 200–1000 tokens.
- **Config layers:** Low cost; merged at startup.

### Cursor
- **Rules (.mdc):** All loaded at startup; similar to AGENTS.md.
- **Hooks:** Call overhead; similar to Claude Code.

### Gemini CLI
- **GEMINI.md:** Loaded per context; no special caching.
- **Extensions:** Config-driven; overhead depends on number of extensions.

### Aider
- **CONVENTIONS.md:** Read-only via /read directive; cached if prompt caching enabled.
- **No hooks:** Avoids per-call overhead.

**Recommendation:** For token-constrained setups, recommend Aider (no hook overhead) or agents.md (minimal).

---

## References

### Official Documentation
- [Claude Code Directory Guide](https://code.claude.com/docs/en/claude-directory)
- [OpenAI Codex: AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Cursor: Rules](https://cursor.com/docs/rules)
- [Cursor: Hooks](https://cursor.com/docs/hooks)
- [Google Gemini CLI: Extensions](https://google-gemini.github.io/gemini-cli/docs/extensions/)
- [Aider: Conventions](https://aider.chat/docs/usage/conventions.html)
- [agents.md Specification](https://github.com/agentsmd/agents.md)

### Tool Surveys & Comparisons
- [Anablock: AGENTS.md Open Standard](https://www.anablock.com/blog/agents-md-open-standard-ai-coding-agents)
- [Configuring Agentic AI Coding Tools (Exploratory Study)](https://arxiv.org/pdf/2602.14690)
- [How to Configure Claude Code, Cursor, Codex (agensi.io)](https://www.agensi.io/learn/ai-agent-configuration-guide-2026)

### Key Blog Posts & Guides
- [Mastering .mdc Files in Cursor (Medium)](https://medium.com/@ror.venkat/mastering-mdc-files-in-cursor-best-practices-f535e670f651)
- [AGENTS.md v1.1 Proposal (GitHub Issue #135)](https://github.com/agentsmd/agents.md/issues/135)
- [Agent Skills Standard (SKILL.md)](https://agentskills.io/specification)

---

## Recommendations for Minimal Viable Adapter

### MVP Scope (Phase 1)
1. **Support:** Claude Code (reference), Codex, Cursor.
2. **No:** Hooks (complex; tool-specific events).
3. **Yes:** CLAUDE.md consolidation, rules, agents → tool equivalents.
4. **Graceful degradation:** Warn on unsupported features; still emit valid output.

### Generation Order (Simplest → Most Complex)
1. **agents.md:** Strip tool fields; output plain markdown. (1 line per tool)
2. **Aider:** Merge CLAUDE.md + rules; output CONVENTIONS.md. (2–3 lines per tool)
3. **Cursor:** Map rules → .mdc; generate hooks.json skeleton. (4–5 lines per tool)
4. **Codex:** AGENTS.md + custom agents. (3–4 lines per tool)
5. **Gemini CLI:** Extensions + commands. (5–7 lines per tool)

### Single Source → Minimal Outputs

**Generate these files from iStartSoftFlow CLAUDE.md + .claude/:

```
input/
├── CLAUDE.md
├── .claude/rules/*.md
├── .claude/skills/**/SKILL.md
├── .claude/agents/*.md
├── .claude/settings.json (hooks only)
└── .mcp.json

output/
├── agents.md/AGENTS.md                      (from CLAUDE.md + rules)
├── codex/AGENTS.md + .codex/agents/*.toml   (from agents + custom config)
├── cursor/.cursor/rules/*.mdc + hooks.json  (from rules + hooks)
├── gemini/.gemini/extensions/...            (from rules + commands)
├── aider/CONVENTIONS.md + config            (from CLAUDE.md + rules)
```

**Metadata:**
- Per-tool README explaining usage.
- ADAPTER.md noting which iStartSoftFlow features translated to each tool.
- Warnings for dropped features (e.g., "Aider: no hooks; skipped PostToolUse events").

---

## Conclusion

A multi-tool adapter for iStartSoftFlow is **feasible and practical**. The key insight: **all tools read markdown instruction files**; tool-specific features (hooks, subagents, MCP) can be supported where they exist and safely omitted where they don't.

The adapter should:
1. Accept iStartSoftFlow's Claude Code structure as source-of-truth.
2. Generate per-tool equivalents with **1:N mapping** (one CLAUDE.md → N tool configs).
3. **Degrade gracefully:** Warn on unsupported features; never break valid output.
4. **Document precedence** per tool so users understand what's loaded.

This keeps **iStartSoftFlow portable** without requiring users to learn N different syntaxes—they write once, select a tool, and the adapter handles the rest.
