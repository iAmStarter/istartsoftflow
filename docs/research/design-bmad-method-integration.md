# BMAD-METHOD Integration Design Research

**Date:** 2026-06-21  
**Status:** Complete  
**Scope:** Deep analysis of BMAD-METHOD framework and integration strategy with iStartSoftFlow

---

## Executive Summary

BMAD-METHOD (Breakthrough Method for Agile AI-Driven Development) is a mature, battle-tested framework (v6.8.0, 49K GitHub stars as of June 2026) that excels at **structured, agentic upstream planning** — turning vague ideas into detailed, sharded PRDs, architecture specs, and hyper-contextual story files. iStartSoftFlow is a Claude-Code-first **execution loop** kit with strong TDD/security/UX gates and token-economy discipline.

**The integration thesis:** BMAD should be the planning frontend; iStartSoftFlow should be the execution backend. They are highly complementary and can coexist with minimal duplication. The "signature" value of each should be preserved:
- **BMAD strength:** Rigorous multi-agent planning with embedded reasoning + document sharding for context efficiency.
- **iStartSoftFlow strength:** TDD-first execution loop, security SDLC, UX gates, token economy, commercial lifecycle (proposals, change orders), and AUTO autonomy.

**Decision:** YES to integration. Implementation is lean, phased, and non-disruptive.

---

## BMAD-METHOD Core Concepts

### 1. Core Philosophy

BMAD is built on two foundational pillars:

#### **Agentic Planning (Phase 1)**
A dedicated team of planning agents (Analyst, Product Manager, Architect, UX Designer) collaborate to produce:
- **Project Brief** (from market research + competitive analysis)
- **Product Requirements Document (PRD)** (functional + non-functional requirements, epics, draft stories)
- **Architecture Document** (system design, technical constraints, deployment model)
- **UX Specification**

The **failure mode addressed:** Planning inconsistency. AI agents writing code without consistent upstream specs lead to rework, misalignment, and thrashing. BMAD solves this by formalizing planning as a first-class discipline with dedicated agents.

#### **Context-Engineered Development (Phase 2)**
The Scrum Master agent transforms the planning output into **hyper-detailed story files** that contain:
- Full architectural context (what systems are involved, dependencies, constraints)
- Implementation guidelines (exact patterns, libraries, error handling strategies)
- Embedded reasoning (why each requirement exists, tradeoffs made)
- Testing criteria (acceptance tests, edge cases, QA focus areas)
- Definition of Ready + Done checklist

The **failure mode addressed:** Loss of context during handoff. Developers given a spec but not the reasoning behind it will make locally optimal but globally wrong decisions. BMAD embeds the full context in the story file so the Dev agent never loses the original intent.

### 2. The Two-Phase Workflow

#### **Phase 1: Agentic Planning**
- **Analyst** → Project Brief (market research, competitive landscape, user persona synthesis)
- **Product Manager** → PRD (transforms brief into detailed functional + non-functional requirements, epics)
- **Architect** → Architecture Document (technical decisions, deployment, integration points)
- **Product Owner** → Master Validation (runs checklists, reconciles conflicts, validates completeness)
- **Output:** Sharded docs in `docs/prd/`, `docs/architecture/`, `docs/uux/`

#### **Phase 2: Context-Engineered Development**
- **Scrum Master** → Draft story with full context
- **User** → Approves or requests modifications
- **Developer** → Implements story (has full context in the story file, rarely needs to ask)
- **QA** → Optional review, refactoring, quality improvements
- **Orchestrator** → Routes tasks, enforces workflow order
- **Output:** Implemented features, tested, with embedded context preserved for the next sprint

### 3. Agent Personas

BMAD defines 12+ specialized personas (each with distinct instructions, tone, expertise):

**Planning agents:**
- **Analyst (Mary)** — Market research, competitive analysis, user discovery
- **Product Manager (John)** — Requirements distillation, epic definition, trade-off resolution
- **Architect (Winston)** — System design, technical constraints, deployment patterns
- **UX Designer (Sally)** — Wireframes, interaction flows, accessibility compliance

**Development agents:**
- **Developer (Amelia)** — Implementation, following the story's context + criteria exactly
- **Scrum Master (Bob)** — Story drafting, acceptance criteria clarification, context embedding
- **QA (Quinn)** — Test automation, edge case validation, refactoring feedback

**Governance agents:**
- **Product Owner (PO)** — Document sharding, master checklist, alignment validation
- **Orchestrator / BMad-Master** — Workflow routing, dependency enforcement, quality gates

**Utility agent:**
- **Technical Writer (Paige)** — Documentation, handoff clarity

**Quick-flow agent (solo dev):**
- **Barry** — Condensed version of all roles for small projects or patches

### 4. The Story File Structure (Signature Pattern)

A BMAD story file is NOT a ticket. It is a **self-contained knowledge package**:

```yaml
---
id: story-auth-login
epic: Authentication & Security
title: Implement JWT-based login with refresh token rotation
status: drafted

# Full context (the Dev agent reads this before implementing)
context: |
  The authentication system is the trust boundary between the user and the app.
  We chose JWT + refresh token rotation (not sessions) because:
  - Stateless (scales without sticky sessions)
  - Aligns with the microservice deployment (docs/architecture/deployment.md)
  - Refresh rotation prevents token theft (if a token leaks, rotation limits exposure)
  - User agents (web, mobile, CLI) all speak the same contract
  
  Related stories: story-user-registration, story-session-invalidation
  Architecture constraints: see docs/architecture/auth.md (ASVS L3 required)

# Sharp acceptance criteria (Dev + QA both use these)
acceptance: |
  GIVEN a new user with valid email/password
  WHEN POST /auth/login with correct credentials
  THEN return 200 with { access_token, refresh_token, expires_in }
  
  GIVEN a user with an expired access token
  WHEN POST /auth/refresh with a valid refresh token
  THEN return 200 with new { access_token, expires_in }
  
  GIVEN a user with an invalid/expired refresh token
  WHEN POST /auth/refresh with expired token
  THEN return 401 Unauthorized (client must re-login)
  
  GIVEN a compromised refresh token
  WHEN the token is used > 2 times in 1 second (anomaly)
  THEN invalidate ALL refresh tokens for that user (force re-login)
  AND log security event to audit trail

# Implementation guidelines (embedded in the story, not in a separate doc)
implementation: |
  Use jsonwebtoken library (Node.js) or equivalent.
  Refresh token should be stored server-side in Redis with TTL = 30 days.
  Access token TTL = 15 minutes.
  Implement the "double-submit cookie" pattern for CSRF protection.
  See docs/architecture/secure-coding.md for input validation rules.

# QA focus (tester reads this, not the implementation)
qa_focus: |
  - Token expiration boundaries (1 sec before, at, 1 sec after expiry)
  - Refresh token rotation: old token must become invalid on rotation
  - Clock skew: test across different system clocks (±5 min skew)
  - Concurrent refresh attempts (race condition)
  - Anomaly detection: rate-limit refresh attempts per user

# Traceability
linked_requirements: [REQ-AUTH-01, REQ-AUTH-02]
depends_on: [story-user-registration]
blocks: [story-password-reset]
```

**Key insight:** The story file is a **knowledge transfer medium**, not a task ticket. Every detail the developer needs is embedded in one place, with context + rationale + constraints. This prevents the "out of context" problem where a dev implements something locally optimal but globally wrong.

### 5. Document Sharding Pattern

BMAD solves the context-window problem by **sharding large documents** into focused pieces:

- A 100-page PRD becomes `docs/prd/epic-auth.md`, `docs/prd/epic-payments.md`, etc.
- A 50-page architecture spec becomes `docs/architecture/deployment.md`, `docs/architecture/auth.md`, etc.
- Each story file links to the specific shards it needs.

When the Dev agent picks up a story, it loads ONLY:
- The story file itself
- The specific shards linked in the story (e.g., `docs/architecture/auth.md`)
- NOT the entire 100-page document set

This is critical for token efficiency — the context window is used for reasoning, not for carrying full document sets forward.

### 6. .bmad-core Folder Structure

BMAD installs a `.bmad-core/` directory (analogous to `.claude/` in iStartSoftFlow):

```
.bmad-core/
├── agents/                 # Agent definitions (YAML + MD)
│   ├── analyst.md
│   ├── pm.md
│   ├── architect.md
│   ├── ux-designer.md
│   ├── scrum-master.md
│   ├── dev.md
│   ├── qa.md
│   ├── product-owner.md
│   ├── orchestrator.md
│   └── ...
│
├── agent-teams/            # Collections of agents (YAML)
│   ├── planning-team.yaml
│   ├── dev-team.yaml
│   └── all-hands.yaml
│
├── workflows/              # Sequential task definitions (YAML)
│   ├── greenfield-fullstack.yaml
│   ├── brownfield-feature.yaml
│   └── patch-fix.yaml
│
├── templates/              # Document templates (MD)
│   ├── prd-template.md
│   ├── architecture-template.md
│   ├── story-template.md
│   └── uux-spec-template.md
│
├── tasks/                  # Repeatable actions (YAML)
│   ├── create-project-brief.yaml
│   ├── create-prd.yaml
│   ├── shard-document.yaml
│   ├── create-next-story.yaml
│   └── review-story.yaml
│
├── checklists/             # QA gates (YAML)
│   ├── prd-checklist.yaml
│   ├── architecture-checklist.yaml
│   ├── story-ready-checklist.yaml
│   └── qa-checklist.yaml
│
├── data/                   # Knowledge base
│   ├── bmad-kb.md
│   ├── technical-preferences.md
│   └── project-config.yaml
│
└── utils/                  # Utilities
    └── template-format.md
```

Each agent is a **YAML + Markdown file** defining:
- Role + persona
- Dependencies (other agents/tasks)
- Startup instructions
- Skill constraints
- Output format

Installation is: `npx bmad-method install` (Node.js v20.12+, Python 3.10+, uv package manager required).

### 7. Expansion Packs (Modules)

BMAD v6 introduced **expansion packs** — optional domain-specific modules:

- **Core** (always installed): Analyst, PM, Architect, Dev, QA, Scrum Master, Orchestrator
- **Game Development** (optional): Game-specific UX patterns, asset management, playtesting workflows
- **Full-Stack Web** (optional): Frontend-specific patterns, CSS/design systems, E2E testing
- **Data Science** (optional): Experiment tracking, model validation, feature engineering
- **DevOps** (optional): Infrastructure-as-code patterns, deployment automation, monitoring

Each pack is installed selectively during `npx bmad-method install` (non-interactive mode supports CI/CD). Packs are **not bloat** — you only load the personas and templates relevant to your project.

### 8. Versioning

- **V4 (stable):** Web UI + CLI, agent-driven planning, development stories. Production-ready.
- **V5 (planned):** Intermediate release (became V6).
- **V6 (current, alpha/early release):** 
  - **Scale Adaptive Framework:** Lightweight workflow for small patches; heavyweight workflow for enterprise.
  - **Project Types:** Specialized blueprints for web apps, games, APIs, etc.
  - **Language Localization:** Agents + docs in Thai, Spanish, French, Chinese, etc.
  - **Agent Customization:** Override agent instructions per project.
  - **BMAD Core separation:** Core orchestration engine decoupled from the Method, allowing BMAD to power other frameworks.

Current release: **v6.8.0** (late May 2026), with near-daily pushes and active community.

---

## iStartSoftFlow Recap (Current State)

### 1. The 7 Agents

- **planner** — turns research + OVERVIEW into vertical-slice phase plan
- **researcher** — DESIGN mode (service limits, architectural constraints) + IMPL mode (codebase, APIs, bugs)
- **implementer** — builds ONE phase (SCAFFOLD or FILL modes on TDD phases)
- **test-author** — writes tests BLIND (never reads implementation)
- **e2e-runner** — writes/runs browser E2E BLIND
- **debugger** — debugs in isolation
- **synthesizer** — compresses STATE.md, deduplicates ISSUES.md, prunes snapshots

### 2. The 11 Commands

- `/overview` — design-research → double grill → OVERVIEW.md → PLAN.md
- `/propose` — OVERVIEW + PLAN → PROPOSAL.md + proposal.html + client sign-off
- `/change-request` — scope change → impact analysis → CHANGES.md
- `/phase [n]` — run one phase end-to-end (RESEARCH → SCAFFOLD | IMPLEMENT → TEST → FIX → CLOSE)
- `/quick` — small, non-phase change (no agent chain)
- `/replan` — revise PLAN.md + reconcile regression corpus
- `/synthesize` — compress + snapshot before context reset
- `/unstuck` — re-research after a circuit breaker (capped once per phase)
- `/log-issue`, `/log-decision`, `/store-wisdom` — logging

### 3. The 6 Skills (On-Demand)

- `caveman` — ruthless UX minimalism + ULTRA mode discipline
- `grill-me` — interrogate requirements (used in `/overview`)
- `karpathy-guidelines` — engineering discipline (applied in every coding task)
- `ux-design` — UX cookbook + wireframe baseline (applied in every UI task)
- `security` — Secure SDLC cookbook + threat-modeling (applied in design + dev)
- `code-standards` — language idiom + architecture (applied in every code task)

### 4. The Methodology

**The loop:**
```
design-research → grill ×2 → plan → phase 1 → phase 2 → ... → phase N → deploy
```

**TDD or non-TDD per phase:**
- TDD phase: RESEARCH → SCAFFOLD → RED → GREEN → TEST(e2e) → FIX → CLOSE
- Non-TDD phase: RESEARCH → IMPLEMENT → TEST → FIX → CLOSE

**Key principles:**
- Phase boundary = primary reset (every phase, synthesize + compact)
- Lazy context loading (skills + methodology load on demand, not always-on)
- Hard gates: PHASE GATE must pass (mock suite + real suite + E2E regression + ENDPOINTS coverage)
- Security at every stage (threat-model design → secure coding → SCA/SAST/secrets → pentest pre-deploy)
- Auto autonomy: dev loop follows the plan, doesn't interrupt; planning always interactive
- Batched escalation: blockers park the slice, move to independent work, report consolidated at phase boundary

### 5. Commercial Lifecycle

- **Discover** → `/overview` (double grill + DESIGN research)
- **PRD** → docs/PRD.md (or BMAD/iSSM stories)
- **Plan** → docs/PLAN.md (vertical slices)
- **Proposal** → `/propose` (scope + phases + effort + cost + client sign-off gate)
- **Build** → `/phase` (AUTO dev loop, follows plan)
- **Change mid-flight** → `/change-request` (impact + re-estimate + CHANGES.md + sign-off)
- **Deploy** → final phase
- **Closeout** → `/synthesize` (summary + decisions + changes + cost vs. estimate)

### 6. Token Economy

- Phase boundary reset (synthesize → compact)
- Lazy skill loading (only on demand)
- Subagent isolation (noise dumped to file, not re-paid)
- Soft budget: ~50% of context window per phase signals "slice too big, split it"

---

## BMAD Strengths vs. iStartSoftFlow Strengths

### BMAD Excels At

1. **Structured upstream planning** — multi-agent consensus on PRD, architecture, epics
2. **Document sharding** — auto-split large specs into context-aware pieces
3. **Story files as knowledge packages** — embedded context + rationale + constraints
4. **Scale adaptivity** — lightweight workflow for patches, heavyweight for enterprise
5. **Planning-first discipline** — forces clear specs before code exists
6. **Multi-language support** — agents + docs in user's language (v6)
7. **Agent customization** — override persona instructions per project

### iStartSoftFlow Excels At

1. **TDD-first execution** — SCAFFOLD + RED before FILL (prevents overfit to bad tests)
2. **Security-first SDLC** — threat-model design → secure coding → SCA/SAST/secrets → pentest
3. **UX gates** — every UI change validated against cookbook + wireframe baseline
4. **Blind test-author** — structurally prevents test bias (RED-first on TDD phases)
5. **Blind E2E-runner** — functional test from spec, never from implementation
6. **Token economy** — phase resets, lazy loading, subagent isolation
7. **Commercial lifecycle** — proposals, change orders, cost tracking, closeout summaries
8. **AUTO autonomy** — dev loop follows plan, not blocked by questions (planning stays interactive)
9. **Code-standards gate** — enforce language idiom + architecture at CLOSE

### Where BMAD Could Learn From iStartSoftFlow

1. Phase-based resets + token economy (BMAD focuses on planning, not cost)
2. TDD structure (RED-first on acceptance criteria)
3. Blind test-author discipline (prevent overfitting to code)
4. Security gates at every stage (BMAD has planning checklists, but fewer runtime gates)
5. Commercial lifecycle + change tracking (not in BMAD)

### Where iStartSoftFlow Could Learn From BMAD

1. Structured multi-agent planning (iStartSoftFlow's `/overview` is good, but BMAD is deeper)
2. Story files with embedded context (iStartSoftFlow phase specs are good, but BMAD goes further)
3. Document sharding for context efficiency (BMAD's shard pattern is cleaner)
4. Scale adaptivity (iStartSoftFlow assumes every project is the same size)

---

## Integration Analysis

### 1. Role Mapping (BMAD ↔ iStartSoftFlow)

| BMAD Role | iStartSoftFlow Agent | Notes |
|-----------|---------------------|-------|
| Analyst | researcher (DESIGN mode) | Market research, constraint discovery |
| Product Manager | planner (part of `/overview`) | Requirements → PLAN |
| Architect | planner (architecture phase in `/overview`) | Technical decisions |
| Product Owner | orchestrator (implicit) | Validation, conflict resolution |
| Scrum Master | planner (story spec phase) | Turns PLAN into sharp acceptance criteria |
| Developer | implementer | Builds the phase |
| QA | test-author + e2e-runner | TDD tests + E2E |
| Orchestrator | orchestrator | Routes, enforces workflow |
| UX Designer | implementer + test-author (UX skill) | Design + validation |

**Overlap:** YES, but not a problem. BMAD's planning agents map cleanly to iStartSoftFlow's `/overview` command chain + planner agent. BMAD's development agents map to implementer + test-author + e2e-runner.

**No duplication risk:** BMAD is planning-heavy; iStartSoftFlow is execution-heavy. They are naturally complementary.

### 2. Artifact Mapping

| BMAD Artifact | iStartSoftFlow Artifact | Relationship |
|--------------|----------------------|--------------|
| Project Brief | OVERVIEW.md (part 1) | iStartSoftFlow already produces this |
| PRD | OVERVIEW.md (part 2) + docs/PRD.md | iStartSoftFlow can write PRD from OVERVIEW |
| Architecture Doc | OVERVIEW.md (part 3) | iStartSoftFlow already documents this |
| Sharded epics | docs/PLAN.md phases | iStartSoftFlow phases ARE sharded user stories |
| Story file (context-embedded) | Phase spec + acceptance criteria | iStartSoftFlow spec is close; BMAD embeds more reasoning |
| UI/UX spec | ux-design skill reference | iStartSoftFlow already validates against this |

**Mapping:** iStartSoftFlow's docs/PLAN.md is ALREADY similar to BMAD's sharded stories (one phase = one story-like unit). The enhancement is to embed MORE context (architectural rationale, linked shards, traceability) in each phase spec.

### 3. Workflow Mapping

**BMAD Planning Phase 1:**
```
Analyst → Project Brief
PM → PRD (with epics)
Architect → Architecture (with constraints)
PO → Master Checklist (validate completeness)
Output: docs/prd/, docs/architecture/, docs/uux/
```

**iStartSoftFlow `/overview` command (already exists):**
```
researcher (DESIGN mode) → grill-me (R1) → design-research → grill-me (R2) → OVERVIEW.md → planner → PLAN.md
```

**Integration:** BMAD Phase 1 could wrap iStartSoftFlow's `/overview` command. Or: iStartSoftFlow's `/overview` output (OVERVIEW.md) could feed into a lightweight BMAD planning loop if more detail is needed. **Recommendation:** For most iStartSoftFlow projects, `/overview` is sufficient. For larger projects, invoke BMAD as an optional "planning intensive" mode before `/propose`.

**BMAD Development Phase 2:**
```
Scrum Master → Draft story with context
Dev → Implement
QA → Review
Orchestrator → Route next story
Cycle repeats
```

**iStartSoftFlow phase loop (already exists):**
```
/phase → RESEARCH → SCAFFOLD/IMPLEMENT → TEST → FIX → CLOSE → /synthesize
```

**Integration:** Each iStartSoftFlow phase is like one BMAD story. Enhance the phase spec to include more context (rationale, linked shards, edge cases) following BMAD's story-file pattern.

### 4. Document Sharding

**BMAD pattern:**
```
docs/prd/
  ├── epic-auth.md
  ├── epic-payments.md
  └── epic-admin.md
docs/architecture/
  ├── deployment.md
  ├── auth.md
  └── data-model.md
```

**iStartSoftFlow pattern (currently):**
```
docs/PLAN.md          (all phases in one file)
docs/OVERVIEW.md      (all architecture in one file)
docs/PRD.md           (all requirements in one file)
```

**Integration:** Adopt BMAD's sharding pattern. Split docs/PLAN.md into docs/plan/phase-1.md, docs/plan/phase-2.md, etc. Split docs/OVERVIEW.md architecture section into docs/architecture/*.md. When a phase spec is generated, link only to the relevant shards.

**Benefit:** Reduces context bloat. Dev agent reads only the phase spec + the shards it needs, not the entire PLAN.md (which grows across phases).

### 5. Story File Enhancement (iStartSoftFlow Phase Spec)

**Current iStartSoftFlow phase spec (from docs/PLAN.md):**
```markdown
## Phase 1: User auth

- slice: login + logout working end-to-end
- changes: src/auth/, tests/
- acceptance (sharp, testable):
  - GIVEN valid credentials WHEN POST /login THEN 200 + token
  - edge: invalid password → 401
```

**BMAD-enhanced phase spec (add context):**
```markdown
## Phase 1: User auth

- slice: login + logout working end-to-end
- changes: src/auth/, tests/
- rationale: |
    Authentication is the trust boundary. We chose JWT + refresh token rotation
    because it is stateless (scales without sticky sessions) and aligns with
    our microservice deployment (docs/architecture/deployment.md).
    See docs/architecture/auth.md for the full design.
- acceptance (sharp, testable):
  - GIVEN valid credentials WHEN POST /login THEN 200 + access_token + refresh_token
  - GIVEN expired access_token WHEN POST /refresh THEN 200 + new access_token
  - edge: invalid refresh_token → 401 (force re-login)
  - security: anomaly detect — if refresh token used >2x/sec, revoke all tokens + log audit
- qa_focus: |
    Token boundaries (±1 sec), refresh rotation, clock skew, rate-limiting
- implementation_hints: |
    Use jsonwebtoken, store refresh in Redis TTL=30d, access TTL=15m, CSRF=double-submit
- linked_architecture: docs/architecture/auth.md, docs/architecture/secure-coding.md
- depends_on: [Phase 0: User registration]
- blocks: [Phase 3: Password reset]
- external: none
```

**Benefit:** Dev agent reads the phase + rationale + hints + linked shards. Rarely asks clarifying questions. Aligns with BMAD's signature strength.

---

## Integration Strategy: The Lean Path

### Option A: Minimal Integration (Recommended)

**Goal:** Adopt the BMAD philosophy without restructuring iStartSoftFlow.

**What to do:**
1. Enhance `/overview` to optionally invoke BMAD-style multi-agent planning for large projects.
   - Default: lightweight (current `/overview` loop)
   - Flag `--bmad-planning` (optional): invoke BMAD Phase 1 agents (Analyst, PM, Architect, PO) for intensive planning
2. Enhance phase specs (docs/PLAN.md) with BMAD-style embedded context:
   - Add `rationale:` section (why this phase exists, architectural decisions)
   - Add `qa_focus:` section (what testers should focus on)
   - Add `implementation_hints:` section (patterns, libraries, error handling)
   - Add `linked_architecture:` section (references to relevant shards)
   - Add `depends_on:` and `blocks:` sections (explicit dependencies)
3. Adopt BMAD's document sharding:
   - Split docs/PLAN.md → docs/plan/phase-1.md, phase-2.md, etc. (optional; PLAN.md can remain for human reference)
   - Split docs/OVERVIEW.md architecture → docs/architecture/*.md (optional)
   - When phase specs link to shards, dev agent loads only what's needed
4. Integrate BMAD as an optional MCP server (like iSSM already exists):
   - `iStartSoftMCP` (iSSM) loads BMAD artifacts (PRD, architecture, stories) if .bmad-core exists
   - If BMAD planning was run, iStartSoftFlow reads the sharded artifacts instead of generating its own
5. No changes to the core loop (`/phase`, TDD, security gates, AUTO autonomy)

**Effort:** 2-3 weeks (phase specs + optional sharding + MCP integration)

**Risk:** Minimal (additive, no breaking changes to iStartSoftFlow)

**Outcome:** iStartSoftFlow projects can choose their planning depth (lightweight or heavyweight), and phase specs carry BMAD-style context without restructuring the execution loop.

### Option B: Deep Integration (More Ambitious)

**Goal:** Full fusion of BMAD planning + iStartSoftFlow execution.

**What to do:**
1. All of Option A, plus:
2. Replace `docs/PLAN.md` with BMAD-style story files (docs/stories/story-*.md)
   - Each story = one or more iStartSoftFlow phases (depends on story size)
   - Each story is a knowledge package (context + acceptance + constraints)
3. Make `/phase` command read story files instead of PLAN.md
4. Add Scrum Master agent (adapted from BMAD) to draft stories with context
5. Phase specs become story files (YAML + Markdown, BMAD-format)
6. Integrate BMAD's Product Owner checklist (validate completeness before dev)
7. Optional: Adoption of BMAD's scale-adaptive framework (lightweight for patches, heavyweight for enterprise)

**Effort:** 4-6 weeks (new commands, story-file format, Scrum Master agent)

**Risk:** Moderate (breaks the PLAN.md contract; requires migrating existing projects)

**Outcome:** iStartSoftFlow becomes a true BMAD-powered execution engine. Maximum context, minimum rework. But higher barrier to adoption.

### Recommendation: Hybrid (Option A + Selective B)

**Start with Option A (3 weeks).**

If that proves valuable:
- **For large, mission-critical projects:** Option B (story files + Scrum Master)
- **For small/medium projects:** Stay with Option A (PLAN.md + enhanced specs)
- **For rapid MVP:** Use iStartSoftFlow's existing `/overview` + lightweight planning

This gives users choice and de-risks the change.

---

## Phased Adoption Plan

### Week 1: Foundation (Option A Phase 1)

- [ ] Enhance `docs/PLAN.md` template with BMAD fields (`rationale:`, `qa_focus:`, `implementation_hints:`, etc.)
- [ ] Update planner agent to generate BMAD-style specs
- [ ] Document the enhancement in METHODOLOGY.md
- [ ] Test with one small project

### Week 2: Sharding (Option A Phase 2)

- [ ] Create `docs/plan/` directory structure
- [ ] Add optional `--shard` flag to `/overview` command
- [ ] If `--shard` is set, split PLAN.md → docs/plan/phase-*.md
- [ ] Split OVERVIEW.md architecture section → docs/architecture/*.md
- [ ] Update phase lookup to read sharded files (fall back to PLAN.md if not sharded)

### Week 3: MCP Integration (Option A Phase 3)

- [ ] Enhance iSSM MCP to load BMAD artifacts (if .bmad-core exists)
- [ ] If BMAD planning was run, iStartSoftFlow reads BMAD PRD + stories
- [ ] If BMAD was not run, iStartSoftFlow uses its own PLAN.md (as now)
- [ ] Test with a BMAD-planned project

### Week 4+: Optional Deep Integration (Option B, only if desired)

- [ ] Add Scrum Master agent (drafts story files with context)
- [ ] Replace PLAN.md with story-file format
- [ ] Update `/phase` command to read story files
- [ ] Add Product Owner validation step before dev phase
- [ ] Test with mission-critical project

---

## Key Unknowns / To Be Confirmed

1. **BMAD expansion pack licensing & availability:** Are all expansion packs (game dev, full-stack, data science) publicly available and free? Or are some gated?
   - **Evidence:** GitHub readme says MIT license, free + open-source; but need to verify expansion pack distribution model.

2. **BMAD .bmad-core MCP integration:** Can iStartSoftFlow's iSSM MCP easily read BMAD artifacts (PRD, stories, architecture)?
   - **Evidence:** BMAD stores everything in markdown + YAML; iSSM can read files. Likely feasible, but needs prototyping.

3. **BMAD workflow flexibility:** Can BMAD's strict workflow (Analyst → PM → Architect → PO → Scrum Master → Dev → QA) be relaxed for small projects?
   - **Evidence:** v6 includes "Scale Adaptive Framework" for small patches. Need to verify how lightweight it is.

4. **Token efficiency comparison:** Does BMAD's document sharding actually reduce token usage compared to iStartSoftFlow's phase resets?
   - **Evidence:** BMAD v6 claims "90% token savings" vs. v4. Need to benchmark a real project.

5. **AUTO autonomy + BMAD story files:** If a story file has detailed context, will the implementer respect it or over-interpret?
   - **Evidence:** iStartSoftFlow's implementer is disciplined (SCAFFOLD, FILL modes, TDD); likely compatible. Needs testing.

---

## Conclusion

**BMAD-METHOD is a strong match for iStartSoftFlow.** Both are rooted in disciplined, structured, agentic software development. BMAD excels at planning; iStartSoftFlow excels at execution and risk management.

**Integration recommendation: YES, phased, starting with Option A (enhanced phase specs + optional sharding).**

**Not a blocker:** BMAD and iStartSoftFlow can coexist independently. But together, they form a complete agentic SDLC:
- **BMAD** produces rigorous, context-embedded planning artifacts (PRD, architecture, sharded specs)
- **iStartSoftFlow** executes those plans with TDD, security gates, UX validation, and token economy discipline

**Next step:** Prototype Option A (BMAD-style phase specs + sharding) with one real project. Measure adoption friction + token savings. Decide on Option B based on results.

---

## Sources & References

### BMAD-METHOD Official
- https://github.com/bmad-code-org/BMAD-METHOD (primary repo, 49K stars, v6.8.0)
- https://docs.bmad-method.org/ (official docs, currently 403 — verify access)
- https://bmadcodes.com/ (official site)

### BMAD-METHOD Technical Deep Dives
- BMAD-AT-CLAUDE (Claude Code port): https://github.com/24601/BMAD-AT-CLAUDE (core-architecture.md, robust reference)
- "BMAD Fundamentals": https://theonlymittal.medium.com/bmad-fundamentals-70f1d0e912f2 (Medium)
- "BMAD Method Explained": https://codemyspec.com/blog/bmad-method-explained (comprehensive)
- "Scale Adaptive Framework": https://medium.com/@mikeschlottig44/embrace-bmad-or-live-in-regret-22aea58f1a67 (v6 features)

### BMAD-METHOD Agent & Workflow
- DeepWiki Planning Phase: https://deepwiki.com/bmadcode/BMAD-METHOD/4.1-planning-phase
- BMAD in Practice: https://diegorodrigo.dev/en/2026/04/06/bmad-in-practice-the-complete-ai-agent-development-workflow/
- BMAD Standard Workflow: https://dev.to/jacktt/bmad-standard-workflow-2kma (DEV Community)
- "What is BMAD-METHOD": https://medium.com/@visrow/what-is-bmad-method-a-simple-guide-to-the-future-of-ai-driven-development-412274f91419 (comprehensive intro)

### iStartSoftFlow (Current Kit, for Reference)
- `.claude/istartsoft-flow/METHODOLOGY.md` (primary methodology document)
- `.claude/agents/*.md` (agent definitions)
- `docs/research/INDEX.md` (research index)

