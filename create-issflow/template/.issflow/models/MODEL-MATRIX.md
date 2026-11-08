# Model matrix (guidance)

**as_of:** 2026-11-04
Update this file when vendors ship new models. Do **not** hardcode unverified API IDs into agent runners.

Agent frontmatter stays: `haiku` · `sonnet` · `opus` · `inherit`.
Adaptive router (`.issflow/routing/`) remains advisory / fail-closed.

## Capability tiers → host suggestions

| Kit alias / role band | Claude Code | Cursor | Codex CLI | Antigravity |
|----------------------|-------------|--------|-----------|-------------|
| `haiku` (synthesizer, cheap) | Haiku 5.5 alias `haiku` | Composer 2.5 / Auto | Luna-class (plan-dependent) | Gemini 3.8 Flash |
| `sonnet` (researcher, e2e, daily) | Sonnet 5.5 alias `sonnet` | Composer 2.5 / Auto / Sonnet | Terra-class | Gemini 3.8 Flash |
| `opus` / `inherit` hard (planner, debugger, arch) | Opus 5.5 / session model | Opus / Sol / Grok flagship | Sol-class | Gemini 4 Argon |
| Long-horizon session | Fable / `opus[1m]` | Grok flagship | Sol + high effort | Argon High |

## Role defaults (unchanged aliases)

| Role | `model:` |
|------|----------|
| synthesizer | `haiku` |
| researcher · e2e-runner | `sonnet` |
| planner · debugger · implementer · test-author | `inherit` |

## Verify before pinning IDs

- Claude: https://code.claude.com/docs/en/model-config
- Cursor: https://cursor.com/help/models-and-usage/available-models
- Codex: https://learn.chatgpt.com/docs/models
- Antigravity: https://antigravity.google/docs/models/

If a host cannot switch models per agent, run everything on the session model.
