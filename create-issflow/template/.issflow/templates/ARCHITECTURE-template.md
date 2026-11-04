# Architecture — <project>

> Approval: PENDING
> (Stamp on sign-off: `approved <YYYY-MM-DD> v<n>` — hard rule 15)

## Purpose
Build-ready architecture note after commercial sign-off. Refines OVERVIEW stack
into concrete boundaries the implementer follows per phase.

## Context
- OVERVIEW stack summary:
- Constraints / non-goals:

## Pattern
- Declared architecture: Feature-Based (default) | layered | hexagonal | other:
- Why this fits:

## System diagram (text)
```
(clients) → (API / BFF) → (domain) → (data / external)
```

## Boundaries & modules
| Module | Owns | Talks to |
|--------|------|----------|
| | | |

## Data
- Stores / schemas (high level):
- Migrations approach:

## Auth & trust boundaries (decision record)
- Provider (e.g. Clerk / Auth.js / Supabase / custom / LINE Login):
- Session model (cookie session / JWT / opaque):
- Identity linking (e.g. LINE userId ↔ app user):
- Roles / authz:
- Secrets handling:
- Threat notes (STRIDE if security-touching):
- Open auth questions: none | (list — blocks Architectural approve if material)

## Integrations
| Service | Use | Failure mode |
|---------|-----|--------------|
| | | |

## Quality & ops
- Test + E2E runners (from OVERVIEW):
- Deploy target:
- Observability / runbook hooks:

## Decisions open
-

## Sign-off
- Approved by: ___
- Date: ___
- Version: v1
