# OVERVIEW — iStartSoftFlow software-house delivery + UX simplify

> Project language: **th** (discovery / grill / internal docs); public web + HOW-TO stay **EN default + TH pair**  
> Autonomy: **AUTO** (dev loop after plan / design / commercial gates)  
> Planning source: grill + design research in `docs/research/`  
> Status: foundations for kit v1.8.0 ship

## Purpose / success criteria

**Purpose.** Make the kit work like a small software house for client work
(requirements → design → proposal → UX/arch gates → build → QA → deploy →
support / CR) while keeping day-to-day use simple (three default paths), then
ship to GitHub Pages + npm (human publish).

**Done when**
1. `/propose` asks for rate/contingency in chat when missing; kit has **no**
   public default rate; client proposal/HTML show **totals only**
2. After proposal sign-off, `/design` + rule 15 block `/phase` until UX pack +
   architecture are approved (internal work may set `n/a`)
3. `/support` + CR template cover warranty vs billable triage
4. Landing / HOW-TO / README lead with `/overview` · `/feature` · `/quick`
5. Root `.claude/` syncs to `create-issflow/template/` via build; version **1.8.0**
6. Draft PR → human merge → Pages; human runs npm publish locally

## Stack (declared)

| Layer | Choice |
|-------|--------|
| Language | Markdown (process) · HTML/CSS/JS (static site) · Node ≥18 (installer) |
| Framework | No SPA — static HTML |
| Infra | **managed** — GitHub Pages (`main` `/`) · npm registry |
| Auth | N/A for public site; npm publish = human credentials |
| Datastore | N/A |
| Test + E2E | Manual visual + link check + `npm run build` in `create-issflow/` |
| Planning | Double-grill + design research |

Phase 0 (self-managed infra) = **N/A**.

## Architecture

- **Pattern:** Feature-Based (kit surfaces: docs · landing · installer)
- **Layout:** `.claude/` SoT → `create-issflow/template/` via `build.js`

## UX direction

- Keep existing brand (ink + violet + teal, Inter) — composition / hierarchy only
- Default paths first on landing + HOW-TO; Advanced labeled, not cut
- EN default + TH toggle on HTML

## Scope

**In:** commercial hygiene · design/arch gates · role→skills map · CR/support ·
UX simplify surfaces · 1.8.0 ship  

**Out:** hardcoded personal rates · enterprise RACI profile · command cuts ·
rebrand · agent `npm publish` · silent merge

## Risks

- HTML ↔ markdown dual maintenance — sync in the same change set
- Pages updates only after human merge to `main`
- Registry version appears only when the human publishes

## Research refs

- [design-flow-ux-simplify-deploy.md](./research/design-flow-ux-simplify-deploy.md)
- [design-devtool-landing-code-demo.md](./research/design-devtool-landing-code-demo.md)
- [flow-adjustment-proposal.md](./research/flow-adjustment-proposal.md) (context; enterprise out)
