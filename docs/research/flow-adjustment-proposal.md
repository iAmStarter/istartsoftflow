# Flow adjustment proposal — istartsoft-flow

> Merges two inputs: the enterprise-SDLC gap analysis
> ([design-enterprise-sdlc-fitness.md](./design-enterprise-sdlc-fitness.md)) and
> how Anthropic's own teams use Claude Code
> ([blog](https://claude.com/blog/how-anthropic-teams-use-claude-code)).
> Goal: make the kit more enterprise-fit **without** bolting heavy process onto a
> loop whose strength is exactly its lightness.

## The reframe (from the blog)

Anthropic teams do NOT win with governance ceremony. They win with:

- **Autonomous loops + thin review** — "give Claude an abstract problem, let it
  work, review the result" (Product Design, Data Science). → We already have this
  (AUTO dev loop + phase gates). Blog *validates* our core; don't dilute it.
- **Context docs as navigation** — CLAUDE.md as the onboarding/data-catalog map
  (Infrastructure). → Maps to our STATE.md + METHODOLOGY. Already aligned.
- **Markdown runbooks for prod debugging / incident response** — Security AND
  Data-Infra teams *independently* converged on this. Strongest empirical signal.
- **Hooks / GitHub Actions for the boring gates** — auto PR comments for test
  formatting + refactor (Product Design). Discipline via automation, not meetings.
- **TDD through pseudocode stages** (Security) → our blind TDD RED-first. Ahead.

**Conclusion:** filter the 8 enterprise gaps through this culture. Keep what is
automatable + lightweight + reversible. Defer what is ceremony.

## Culture-filtered adoption (opt-in ENTERPRISE PROFILE, non-breaking)

| # | Enterprise gap | Blog support | Verdict | Effort |
|---|----------------|--------------|---------|--------|
| 6 | Incident / debug **runbook** | ✅✅ Security + Data-Infra both | **KEEP — slice 1** | M |
| 2 | Approval + **audit trail** | ✅ PR-comment automation = audit-ish | **KEEP** (automate via git/PR, no manual ceremony) | M |
| 1 | Requirements **traceability (RTM)** | ◑ CLAUDE.md-as-catalog | **KEEP** (generated, not hand-maintained) | S |
| 5 | Release / version manifest | — | **KEEP** (cheap provenance) | S |
| 4 | Staged deploy + rollback | ◑ incident response | **KEEP** | M |
| 3 | RACI / governance | — | KEEP **minimal** (one small doc), defer escalation matrices | S |
| 7 | SLSA provenance/attestation | — | **DEFER** — niche, regulated-only | M |
| 8 | DORA metrics | ◑ | **DEFER** — optional, low value for small teams | S |

**Non-goals (deliberately NOT adding — would bloat the loop):** heavy multi-role
sign-off gates, mandatory escalation trees, ceremony that the AUTO loop would have
to stop for. The kit stays light by default; the profile is opt-in.

## How the profile toggles

`.claude/flow-config.json` → `"profile": "default" | "enterprise"`. Small/personal
teams ignore it. Regulated orgs flip to `enterprise`; the SessionStart hook then
injects the extra gates + the audit-trail reminder. No breaking change to existing
projects.

## Recommended first slice

**Slice 1 — Incident/debug runbook (#6).** Highest empirical support (two
independent Anthropic teams), high value even for personal projects, low risk,
fully on-culture. Deliverable: a `/runbook` command + `docs/RUNBOOK.md` template
that consolidates prod-debug context (stack traces, dashboards, remediation
commands) into one grep-able markdown — exactly the Security/Data-Infra pattern.

Then iterate: slice 2 = audit trail (#2), slice 3 = RTM (#1) + release manifest (#5).

## What already ships ahead of enterprise baseline

Secure SDLC (shift-left), blind TDD RED-first, context hygiene + the new
**context-budget watchdog** (lightweight discipline via hook — itself the most
on-culture thing we could add), phase gates at merge-time, vertical slices.
