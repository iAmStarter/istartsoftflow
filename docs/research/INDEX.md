# Research Index

## Design-Mode Research (Token Efficiency + UX Patterns)

| Date | Topic | Conclusion | File |
|------|-------|-----------|------|
| 2026-06-16 | design-token-efficient-claude-code-agents | SessionStart hooks inject 200–500 tokens per session (always-on cost); move specialized instructions to Skills for on-demand loading; CLAUDE.md baseline should stay <200 lines. Official guidance: delegate verbose operations to subagents, use prompt caching, optimize context proactively. | [docs/research/design-token-efficient-claude-code-agents.md](design-token-efficient-claude-code-agents.md) |
| 2026-06-16 | design-ux-cookbook-wireframe-pattern | UX validation cookbook must encode design tokens (spacing scale, colors, a11y contrast), component inventory with state matrices, responsive breakpoints (mobile/tablet/desktop), and WCAG 2.1 AA checklist. Wireframe-as-canonical-baseline pattern: encode in JSON schema or Storybook to constrain agent generation; validate against schema before deployment. Authority sources: Shopify Polaris, Material Design 3, Apple HIG, WCAG 2.1 AA, LLM Component Schema Standard. | [docs/research/design-ux-cookbook-wireframe-pattern.md](design-ux-cookbook-wireframe-pattern.md) |
