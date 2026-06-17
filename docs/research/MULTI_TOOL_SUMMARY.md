# Multi-Tool Adapter Summary: Per-Tool Configuration

Quick reference for `create-issflow` adapter implementation. Maps iStartSoftFlow CLAUDE.md → per-tool outputs.

## File Locations & Formats

### Claude Code (Anthropic) — REFERENCE

| Aspect | Location | Format | Notes |
|--------|----------|--------|-------|
| **Instructions** | CLAUDE.md<br/>.claude/CLAUDE.md | Markdown (target <200 lines) | Project + global both loaded; merge if conflict |
| **Skills** | .claude/skills/{name}/SKILL.md | YAML frontmatter + markdown | Auto-invoked; bundle supporting files |
| **Rules** | .claude/rules/{name}.md | YAML frontmatter (paths: glob) | Load conditionally by file path |
| **Agents (Subagents)** | .claude/agents/{name}.md | name, description, tools, memory | Fresh context; delegate tasks |
| **Hooks** | .claude/settings.json | JSON (SessionStart, PostToolUse, etc.) | Enforced at runtime; call overhead |
| **MCP** | .mcp.json (project) / ~/.claude.json (user) | Standard MCP JSON | Lazy-load tools via tool search |
| **Commands (deprecated)** | .claude/commands/{name}.md | YAML frontmatter + markdown | Use skills/ instead |
| **Workflows** | .claude/workflows/{name}.js | JavaScript (subagent orchestration) | Dynamically generated; save from /workflows |
| **Memory** | ~/.claude/projects/{path}/memory/MEMORY.md | Auto-generated; user reads sections | First 200 lines or 25KB loaded at startup |

---

### OpenAI Codex CLI — TARGET 1

| Aspect | Location | Format | Notes |
|--------|----------|--------|-------|
| **Instructions** | AGENTS.md | Markdown (no frontmatter required) | Precedence: AGENTS.override.md > AGENTS.md > TEAM_GUIDE.md (configurable) |
| **Fallback filenames** | ~/.codex/config.toml | TOML | project_doc_fallback_filenames, project_doc_max_bytes |
| **Custom Agents** | .codex/agents/{name}.toml (project)<br/>~/.codex/agents/{name}.toml (user) | TOML (name, description, instructions, tools) | Custom agents override built-ins |
| **Hooks** | N/A | Config layers (config.toml) | No lifecycle hooks like Claude Code |
| **MCP** | ~/.codex/config.toml | TOML references | MCP servers configured in agent config layers |

**Adapter mapping:**
- CLAUDE.md + rules → AGENTS.md (single consolidated file)
- .claude/agents/ → .codex/agents/*.toml
- Hooks → warn (unsupported)
- MCP → config.toml

---

### Cursor — TARGET 2

| Aspect | Location | Format | Notes |
|--------|----------|--------|-------|
| **Rules** | .cursor/rules/{name}.mdc | YAML frontmatter + markdown | .mdc naming convention; path scoping via frontmatter |
| **Fallback** | AGENTS.md / CLAUDE.md | Markdown | CLI reads if .cursor/ missing; AGENTS.md priority |
| **Hooks** | .cursor/hooks.json | JSON (sessionStart, preToolUse, postToolUse, subagentStart/Stop) | Spawned processes; stdio JSON communication |
| **Subagents** | Inline in rules / .cursor/agents/ | (emerging; not yet standard) | Referenced in rules; no isolated context (2026-06) |
| **MCP** | (not yet standardized) | TBD | Feature request; not yet in core Cursor |

**Adapter mapping:**
- CLAUDE.md + rules → .cursor/rules/*.mdc (one per rule, or merged)
- .claude/settings.json hooks → .cursor/hooks.json (event mapping)
- .claude/agents/ → .cursor/rules/ (no isolation; flatten as rules)
- MCP → warn (not standardized)

---

### Google Gemini CLI — TARGET 3

| Aspect | Location | Format | Notes |
|--------|----------|--------|-------|
| **Conventions** | GEMINI.md | Markdown | Referenced in extension's contextFileName |
| **Extensions** | .gemini/extensions/{name}/ | Directory with gemini-extension.json | Workspace .gemini/ overrides ~/.gemini/ (same name) |
| **Extension Manifest** | .gemini/extensions/{name}/gemini-extension.json | JSON (name, version, contextFileName, mcpServers, excludeTools) | Declares context file and MCP servers |
| **Custom Commands** | .gemini/extensions/{name}/commands/{cmd}.toml | TOML (command, description, prompt) | Nesting: dir/cmd.toml → /dir:cmd |
| **MCP** | gemini-extension.json (mcpServers array) | Standard MCP JSON | Defined in extension manifest |

**Adapter mapping:**
- CLAUDE.md + rules → GEMINI.md
- .claude/skills/ → .gemini/extensions/{name}/commands/*.toml
- .claude/agents/ → separate extensions (pseudo-isolation via extension config)
- Hooks → warn (unsupported)

---

### Aider — TARGET 4

| Aspect | Location | Format | Notes |
|--------|----------|--------|-------|
| **Conventions** | CONVENTIONS.md | Plain markdown (no required structure) | Flexible; document project-specific conventions |
| **Config** | .aider.conf.yml | YAML | read-files, model, mcp-servers |
| **AGENTS.md** | AGENTS.md (optional) | Markdown | Supported if configured in .aider.conf.yml |
| **Hooks** | N/A | N/A | No native lifecycle hooks |
| **Subagents** | N/A | N/A | No native subagent abstraction; spawns processes |
| **MCP** | .aider.conf.yml (mcp-servers) | YAML | External MCP servers configured here |

**Adapter mapping:**
- CLAUDE.md + rules → CONVENTIONS.md (merged into single file)
- .claude/skills/ → CONVENTIONS.md sections (no auto-invocation)
- .claude/agents/ → warn (unsupported; document as fallback)
- Hooks → warn (unsupported)
- MCP → .aider.conf.yml mcp-servers

**Limitation:** Aider has minimal agent-specific features; best used as documentation target with manual workflows.

---

### agents.md (Open Standard) — TARGET 5

| Aspect | Location | Format | Notes |
|--------|----------|--------|-------|
| **Instructions** | AGENTS.md | Markdown + optional YAML frontmatter | No required structure; tool-agnostic fallback |
| **Frontmatter** | Optional | YAML (description, globs, alwaysApply) | No standard required fields; flexible |
| **Hooks** | N/A | N/A | Not part of standard |
| **Subagents** | N/A | N/A | Not part of standard |
| **MCP** | N/A | N/A | Not part of standard |

**Adapter mapping:**
- CLAUDE.md + rules → AGENTS.md (drop tool-specific syntax, paths: scoping becomes sections)
- Skip: agents, hooks, MCP (no standard equivalents)
- Output: minimal frontmatter (optional description + globs if relevant)

**Role:** Universal fallback; all tools read agents.md to some degree.

---

## Generation Strategy: iStartSoftFlow → N Tools

### Source Files (Write Once)

```
istartsoftflow/
├── CLAUDE.md                    # Base instructions
├── .claude/
│   ├── rules/
│   │   ├── testing.md           # paths: ["**/*.test.ts"]
│   │   ├── api-design.md        # paths: ["src/api/**/*.ts"]
│   │   └── ...
│   ├── skills/
│   │   └── {name}/
│   │       ├── SKILL.md         # description, disable-model-invocation
│   │       └── supporting files
│   ├── agents/
│   │   └── {name}.md            # name, description, tools
│   ├── settings.json            # hooks: SessionStart, PostToolUse, etc.
│   └── agent-memory/
├── .mcp.json                    # MCP servers
└── AGENTS.md                    # Optional fallback
```

### Output Pattern: 1 Source → N Targets

```
claude-code/
├── CLAUDE.md                    (symlink or copy)
├── .claude/                     (symlink or copy)
└── ...

codex/
├── AGENTS.md                    (merged from CLAUDE.md + rules)
├── .codex/
│   └── agents/
│       └── {agent}.toml         (from .claude/agents/)
└── ...

cursor/
├── .cursor/
│   ├── rules/
│   │   └── {rule}.mdc           (from .claude/rules/)
│   └── hooks.json               (from .claude/settings.json)
├── AGENTS.md                    (fallback)
└── ...

gemini/
├── GEMINI.md                    (merged from CLAUDE.md + rules)
├── .gemini/
│   └── extensions/
│       └── {name}/
│           ├── gemini-extension.json
│           └── commands/
└── ...

aider/
├── CONVENTIONS.md               (merged from CLAUDE.md + rules)
├── .aider.conf.yml              (mcp-servers, read-files)
└── ...

agents-md/
├── AGENTS.md                    (universal format)
└── ...
```

---

## Feature Degradation Table

| Feature | Claude | Codex | Cursor | Gemini | Aider | agents.md |
|---------|--------|-------|--------|--------|-------|-----------|
| **Instructions (Markdown)** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Rules/Scoping (paths: glob)** | ✓ | ✗ (flat) | ✓ | ✗ (flat) | ✗ (flat) | ✗ (flat) |
| **Skills (auto-invoked)** | ✓ | ⚠ (custom agents) | ⚠ (rules only) | ⚠ (commands) | ✗ | ✗ |
| **Subagents (isolated context)** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Hooks (lifecycle)** | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| **MCP Servers** | ✓ | ✓ | ✗ | ✓ | ⚠ (manual) | ✗ |
| **Workflows (orchestration)** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Auto Memory** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

**Legend:**
- ✓ = Full support
- ⚠ = Partial/degraded support (warn user)
- ✗ = Not supported (skip silently or document)

---

## Implementation Checklist

### Read Phase (from source)
- [ ] Parse CLAUDE.md (frontmatter + content)
- [ ] Parse .claude/rules/*.md (extract paths: globs)
- [ ] Parse .claude/skills/**/SKILL.md (extract description, tools, disable-model-invocation)
- [ ] Parse .claude/agents/*.md (extract name, description, tools, memory)
- [ ] Parse .claude/settings.json (extract hooks; map event → command)
- [ ] Parse .mcp.json (extract mcpServers)
- [ ] Validate YAML/JSON syntax

### Transform Phase (per target)
- [ ] **Codex:** Merge CLAUDE.md + rules → AGENTS.md; extract agents → .codex/agents/*.toml
- [ ] **Cursor:** Map rules → .cursor/rules/*.mdc; transform hooks → .cursor/hooks.json
- [ ] **Gemini:** Merge CLAUDE.md + rules → GEMINI.md; create .gemini/extensions/ + commands/
- [ ] **Aider:** Merge CLAUDE.md + rules → CONVENTIONS.md; write .aider.conf.yml
- [ ] **agents.md:** Strip tool fields; output minimal AGENTS.md (no frontmatter unless needed)

### Output Phase
- [ ] Write files to target directory tree
- [ ] Validate JSON/TOML/YAML syntax
- [ ] Generate per-tool README (how to use in each tool)
- [ ] Generate ADAPTER.md (feature mapping + dropped features)
- [ ] Generate manifest (source → output file mapping)

### Validation
- [ ] All .json files parse (Claude Code, Codex, Cursor, Gemini, Aider)
- [ ] All .toml files parse (Codex, Gemini)
- [ ] All .mdc/.md files are valid markdown
- [ ] Warn on unsupported features (hooks in Aider/Gemini; subagents in Cursor/Aider)

---

## Cost & Token Notes

| Tool | Token Cost | Notes |
|------|-----------|-------|
| **Claude Code** | 100–500 baseline + per-hook | CLAUDE.md always loaded; hooks add ~20 tokens per call |
| **Codex** | 200–1000 (AGENTS.md configurable) | Configurable max bytes; usually cheaper than hooks |
| **Cursor** | Similar to AGENTS.md (~300–800) | Rules loaded at startup; hooks have call overhead |
| **Gemini CLI** | Extension config + GEMINI.md | Low baseline; depends on extension complexity |
| **Aider** | Minimal (CONVENTIONS.md cached) | No hook overhead; prompt caching if /read used |
| **agents.md** | Minimal (plain markdown) | Lowest cost; no special features = no overhead |

**Recommendation:** For token-constrained scenarios, prefer Aider (no hooks) or agents.md (minimal overhead).

---

## Official Documentation Links

- [Claude Code: Directory Guide](https://code.claude.com/docs/en/claude-directory)
- [OpenAI Codex: AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Cursor: Rules](https://cursor.com/docs/rules) + [Hooks](https://cursor.com/docs/hooks)
- [Google Gemini CLI: Extensions](https://google-gemini.github.io/gemini-cli/docs/extensions/)
- [Aider: Conventions](https://aider.chat/docs/usage/conventions.html)
- [agents.md Specification](https://github.com/agentsmd/agents.md)

---

## Next Steps for Implementation

1. **Phase 1 (MVP):** Support Claude Code (ref), Codex, Cursor; skip MCP & hooks.
2. **Phase 2:** Add Aider (simpler; no hooks); validate degradation messaging.
3. **Phase 3:** Add Gemini CLI & full MCP support.
4. **Phase 4:** Add agents.md as universal fallback.

Each phase outputs a working `create-issflow --tool=<name>` generator that produces a valid, ready-to-use config tree for that tool.
