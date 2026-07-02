# Design Research: Developer Tool Landing Pages — Hero Copy, Code Demos & Artifact Visualization

**Date:** 2026-07-02  
**Research Scope:** Best practices for presenting "automated agent pipeline" capabilities on landing pages  
**Primary Sources:** Stripe, Vercel, Supabase, Bun, Cursor, GitHub Copilot, Tailwind CSS, Evil Martians 100-page study, landing page copywriting guides

---

## Executive Summary

Top developer-tool landing pages follow three distinct but complementary patterns to present automated/agent-driven capabilities:

1. **Outcome-first hero copy** with verb phrases ("Deploy," "Ship," "Build") + specific timeframe + proof that the user can offload the work
2. **Code/terminal demo boxes** positioned front-and-center (above fold), using monospace fonts, dark backgrounds, syntax highlighting, and either static snippets or animated typing
3. **Artifact visualization** (PR cards, CI screenshots, passing test output) to prove the agent delivered real deliverables

For iStartSoftFlow's Feature lane section, the optimal pattern is: **Input pane (FEATURE.md snippet) → Terminal pane (agent run output) → Delivered artifact line (branch/PR reference)**, all in a two-column grid on desktop, stacked on mobile, with minimal chrome and CSS-only implementation.

---

## 1. HERO + SECTION COPY FORMULAS

### 1.1 Core Hero Structure (Stripe, Vercel, Supabase, Bun)

**The Standard Formula:**
```
H1 (Main Headline): [Outcome-Focused Verb] + [Specific Deliverable] in [Timeframe]
Examples:
  - "Deploy a Production-Ready Database in 5 Minutes" (Supabase pattern)
  - "Build in a Weekend, Scale to Millions" (Supabase actual)
  - "The all-in-one JavaScript runtime & toolkit designed for speed" (Bun)
  
Subheadline (H2): [Action Agent/You Take] so [Outcome You Achieve]
Example: "Our one-click provisioning handles all the setup so you can focus on building."

Button Copy: Action-forward, low-friction verbs
  - "Start your project" (not "book a demo")
  - "Try free" (not "sign up")
  - "Get started" (not "learn more")
  - "View docs" (secondary, for technical deep-dive)
```

**Key Principles Observed:**

1. **Outcome-First, Not Feature-First:** 
   - ✓ "Cut onboarding time by 60%" → Visitor wants outcome
   - ✗ "Onboarding automation feature" → Visitor doesn't care about feature name
   
2. **Verb Matters:** Developer tools use strong action verbs
   - Vercel: "Deploy"
   - Bun: "Ship"
   - Cursor: "Build"
   - GitHub Copilot: "From idea to PR" (narrative verb sequence)
   
3. **Specificity & Timeframe:**
   - Visitors decide in 3 seconds: "What does this do and who is it for?"
   - Specificity wins: "Deploy in 5 minutes" > "Deploy quickly"
   - Timeframe creates urgency without hype
   
4. **Subheadline: The "So You Can" Bridge:**
   - Subheadline should answer: "What problem does the agent solve for me?"
   - Pattern: [Agent action] "so you [can focus/ship faster/review/verify]"
   - Example: "Hand off your feature spec → get a tested PR → review and merge"

5. **Length & Readability:**
   - Main H1: 40–80 characters (one visual line on desktop)
   - Subheadline: 1–2 short sentences OR 4–5 bullet points max
   - Developer audiences read everything, so don't make them scroll to understand

### 1.2 Copy Formula for "Agent Does Work" Pattern (GitHub Copilot Model)

GitHub Copilot's landing pages and blog posts use a **narrative sequence** rather than single-line outcome:

```
H1: "From idea to PR"
Narrative sequence visible below:
  1. Describe the task
  2. Agent writes code
  3. Tests run automatically
  4. You review the PR
  
CTA: "Start with Agent Mode"
```

**Adaptation for iStartSoftFlow Feature lane:**
```
H1: "Feature → Tested Branch"
Subheadline: "Write a feature spec. Get a hardened PR. Merge with confidence."

Visual narrative:
  1. Input: FEATURE.md snippet
  2. Process: Terminal output (agent running build/test/hardening)
  3. Output: Branch/PR delivered line
```

---

## 2. CODE BOX / TERMINAL DEMO PATTERNS

### 2.1 When & Where Code Boxes Appear

**Principle: Code is a Visual Element, Not Decoration**

From Evil Martians' 100-page study and Tailwind CSS pattern:
- **Position:** Above the fold, right side of hero (desktop) OR immediately after H1/H2 (mobile)
- **Visibility:** Must be visible without scrolling if the target is technical buyers
- **Surface Area:** 300–500px wide on desktop; mobile: full width, stacked below copy
- **"Time to Code" rule:** If syntax-highlighted code isn't visible in the first 2 seconds, you lose ~30% of technical audience

**Tools That Lead With Code:**
- **Bun:** Terminal window showing `bun init --react` in the hero
- **Tailwind CSS:** Code snippet front-and-center showing utility classes
- **Vite:** Installation command prominently displayed
- **Supabase:** Animated code snippet in the hero section

### 2.2 Code Box Visual Patterns (in priority order)

#### Pattern A: **Terminal Window with Chrome** (Best for CLI/Agent Workflows)
```
├─ macOS-style window frame (dark bg, 3 color dots top-left)
├─ Monospace font (Monaco, Courier, SF Mono)
├─ Dark background (#0a0e27, #1a1a2e common)
├─ Green text or bright accent (#10b981, #0eff00)
├─ $ prompt line + command
├─ Output lines showing agent progress
└─ Copy button (top-right)

Height: 200–300px (not too tall; shows ~12–15 lines)
Width: 400–600px on desktop

Example content for iStartSoftFlow:
  $ npx create-issflow --feature feature.md
  → Building...
  → Testing...
  → Hardening PR...
  ✓ Branch ready: feature/user-auth (hardened)
  → Review at: github.com/org/repo/pull/42
```

#### Pattern B: **Split Input/Output Pane** (Best for "Doc → Artifact" Stories)
```
Left side (Input):           Right side (Output):
─────────────────────        ──────────────────────
# User Auth Feature          $ npm run build
                             ✓ Build passed
- User login form            $ npm test
- Session mgmt              ✓ 45 tests passed
- Password reset            $ npm audit
- Rate limiting             ✓ No vulnerabilities
                            
                            Feature branch created:
                            → github.com/.../pull/42
```

Reveals workflow: description → automated processing → deliverable

#### Pattern C: **Tabbed Code Samples** (Best for Multi-Language/Option Stories)
```
Tabs at top:
[ npm ] [ pnpm ] [ yarn ]

Content changes per tab; syntax-highlighted; copy button per tab.
Useful if iStartSoftFlow supports multiple package managers.
```

#### Pattern D: **Animated Typing/Reveal** (Best for Demo Videos)
Uses CSS `steps()` animation or Typed.js library:
- Terminal reveals character-by-character (~80ms per char)
- Simulates real agent work in progress
- GPU-optimized via border opacity transitions
- Respects `prefers-reduced-motion: reduce` for accessibility

**Implementation libraries:**
- **Typed.js** (JavaScript, 16K stars): Full-featured typing animation
- **CSS steps()** (Pure CSS): Lightweight, no JS dependency
- **Magic UI Terminal** (React component): Pre-built terminal component with animation

**When to use animate:** Only if the reveal takes <3 seconds; longer feels slow. Static is often better.

### 2.3 Code Box Accessibility & Readability Checklist

- [ ] **Contrast:** Text color 4.5:1 minimum WCAG AA against dark background
- [ ] **Font size:** 13–14px monospace minimum (readable on mobile)
- [ ] **Line count:** 8–15 lines visible (not a 40-line wall of code)
- [ ] **Syntax highlighting:** Keywords, strings, commands in distinct colors (not just one color)
- [ ] **Responsive:** Stacks below copy on mobile (<600px); width 100% with side padding
- [ ] **Copy button:** Visible, distinct, works on mobile (touch-friendly 44px tap target)
- [ ] **No horizontal scroll:** All lines fit within container (break long lines with `\` if needed)
- [ ] **Keyboard navigation:** If interactive (tabs), full keyboard support (Tab, Enter, arrow keys)

---

## 3. SHOW-THE-ARTIFACT PATTERN

### 3.1 GitHub Copilot's Artifact Strategy (Canonical Pattern)

GitHub Copilot's landing pages and blog posts show agent work via:

1. **Canvas visualization:** A bidirectional work surface showing the agent's plan, code changes, and final state
2. **PR card visualization:** Shows a standard GitHub pull request with:
   - Branch name
   - Diff preview (a few file changes)
   - Check status (passing tests)
   - Commit history
3. **Agents Tab dashboard:** Unified view of active agent sessions and their outcomes

**Key insight:** The artifact is NOT proprietary. It's the real GitHub PR—diffs, checks, merge buttons intact.

### 3.2 Artifact Visualization Patterns for iStartSoftFlow

**Option 1: Static PR Card (Lowest Friction)**
```
┌─────────────────────────────────────────────┐
│ Pull Request #42                            │
│ feature: add user auth system               │
│                                             │
│ ✓ 12 commits                               │
│ ✓ CI passing (3/3 checks)                  │
│ ✓ Security hardened                        │
│                                             │
│ Files changed: 8 (+420 -10)                │
│ Author: iStartSoftFlow Agent                │
│ Created: 2 minutes ago                      │
│                                             │
│ [ Review on GitHub ] [ Merge ] [ Close ]  │
└─────────────────────────────────────────────┘
```

Implemented as a simple bordered div with flex layout, CSS only.

**Option 2: Before/After Code Diff**
```
Left (Before):              Right (After):
───────────────────         ──────────────────
(empty or skeleton)         (implemented with
                            tests, hardening)
```

Shows transformation power; requires more vertical space.

**Option 3: Test Output Summary**
```
✓ Unit tests: 45 passed
✓ Integration tests: 8 passed
✓ Security audit: 0 vulnerabilities
✓ Code coverage: 86%
✓ Bundle size: < 50KB

→ Branch ready for review
```

Emphasizes quality gate passing.

### 3.3 Design Principles for Artifact Display

1. **Credibility via Real Artifacts:** Show actual GitHub PR, actual test output, or actual metrics. Not mocked-up designs.
2. **Success Indicators:** Visible checkmarks, green badges, passing test counts
3. **Minimal Information:** Card should fit in ~300px height on desktop (scan-able at a glance)
4. **Actionable CTA:** "Review on GitHub" link is the primary action
5. **Scrollable or Expandable:** If more detail is needed, use a "show more" expand or make the PR card clickable

---

## 4. CONCRETE RECOMMENDATION FOR iStartSoftFlow FEATURE LANE SECTION

### 4.1 Hero Copy (For Feature Lane Section)

```html
<h2>Feature Lane</h2>
<p class="tagline">
  Describe your feature. Ship a tested branch.
</p>
<p class="subtext">
  Hand off an approved feature spec → get a hardened pull request 
  with passing tests, security scans, and code review ready.
</p>
```

**Rationale:**
- Active verbs: "Describe," "Ship"
- Outcome focus: "tested branch" (what you get, not how it works)
- Subtext uses the "so you" bridge: agent does work "so you" focus on review/merge
- Length: ~20 words for tagline, ~40 for subtext (scannable)

### 4.2 Visual Layout (Desktop & Mobile)

#### Desktop (≥768px)
```
┌────────────────────────────────────────────────────────┐
│  Feature Lane Section                                  │
│  ─────────────────────────────────────────────────────│
│                                                        │
│  Two-column layout (50/50):                           │
│  ┌────────────────────┐  ┌─────────────────────┐    │
│  │   Input Pane       │  │    Output Pane      │    │
│  │                    │  │                     │    │
│  │  ┌──────────────┐  │  │  ┌────────────────┐│    │
│  │  │ FEATURE.md   │  │  │  │ Terminal       ││    │
│  │  │ (code block) │  │  │  │ Window (code)  ││    │
│  │  │              │  │  │  │                ││    │
│  │  │ ---          │  │  │  │ $ npx ...      ││    │
│  │  │ ## User Auth │  │  │  │ ✓ Built       ││    │
│  │  │              │  │  │  │ ✓ Tested      ││    │
│  │  │ - Login form │  │  │  │ ✓ Hardened    ││    │
│  │  │ - Sessions   │  │  │  │                ││    │
│  │  │ - 2FA        │  │  │  │ Branch:       ││    │
│  │  │              │  │  │  │ feature/...   ││    │
│  │  └──────────────┘  │  │  └────────────────┘│    │
│  │                    │  │                     │    │
│  └────────────────────┘  └─────────────────────┘    │
│                                                        │
│  Delivered artifact (below):                         │
│  ┌─────────────────────────────────────────────┐   │
│  │ PR Ready: github.com/org/repo/pull/42       │   │
│  │ ✓ 12 commits | ✓ Tests passing | ✓ Secure  │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

#### Mobile (<768px)
```
Input Pane
(full width, ~200px height)

↓

Output Pane
(full width, ~250px height)

↓

Delivered Artifact
(full width)
```

### 4.3 Implementation (HTML/CSS, No Framework)

```html
<section class="feature-lane">
  <h2 class="feature-lane__heading">Feature Lane</h2>
  <p class="feature-lane__tagline">Describe your feature. Ship a tested branch.</p>
  <p class="feature-lane__subtext">
    Hand off an approved feature spec → get a hardened pull request 
    with passing tests, security scans, and code review ready.
  </p>

  <div class="feature-lane__demo">
    <!-- Input pane: FEATURE.md snippet -->
    <div class="demo-pane demo-pane--input">
      <div class="code-block">
        <div class="code-block__header">
          <span>FEATURE.md</span>
          <button class="code-block__copy" aria-label="Copy">Copy</button>
        </div>
        <pre class="code-block__content"><code class="language-markdown">---
title: User Authentication
priority: P1
---

## Feature: User Authentication

- Secure login with email/password
- Session management (JWT tokens)
- Two-factor authentication
- Password reset flow
- Rate limiting (5 attempts/5min)</code></pre>
      </div>
    </div>

    <!-- Output pane: Terminal window -->
    <div class="demo-pane demo-pane--output">
      <div class="terminal-window">
        <div class="terminal-header">
          <span class="terminal-title">Terminal</span>
        </div>
        <pre class="terminal-content"><code>$ npx create-issflow --feature FEATURE.md
<span class="terminal-dim">→ Reading feature spec...</span>
<span class="terminal-success">✓ Spec validated</span>

<span class="terminal-dim">→ Building implementation...</span>
<span class="terminal-success">✓ Build passed (2.3s)</span>

<span class="terminal-dim">→ Running tests...</span>
<span class="terminal-success">✓ 45 tests passed</span>

<span class="terminal-dim">→ Security hardening...</span>
<span class="terminal-success">✓ No vulnerabilities (audit clean)</span>

<span class="terminal-dim">→ Creating branch...</span>
<span class="terminal-success">✓ feature/user-auth created</span>

<span class="terminal-highlight">Ready for review → github.com/your-org/your-repo/pull/42</span></code></pre>
      </div>
    </div>
  </div>

  <!-- Artifact card -->
  <div class="artifact-card">
    <div class="artifact-card__header">
      <h3>Pull Request Ready</h3>
      <span class="artifact-card__badge">PR #42</span>
    </div>
    <div class="artifact-card__body">
      <p class="artifact-card__title">feature: user authentication system</p>
      <div class="artifact-card__stats">
        <span class="artifact-card__stat">
          <span class="artifact-card__icon">✓</span>
          <span>12 commits</span>
        </span>
        <span class="artifact-card__stat">
          <span class="artifact-card__icon">✓</span>
          <span>All checks passing</span>
        </span>
        <span class="artifact-card__stat">
          <span class="artifact-card__icon">✓</span>
          <span>Security hardened</span>
        </span>
      </div>
      <p class="artifact-card__time">Created 2 minutes ago</p>
    </div>
    <div class="artifact-card__footer">
      <a href="#" class="btn btn--primary">Review on GitHub</a>
    </div>
  </div>
</section>
```

### 4.4 CSS (Uses Existing Design Tokens)

```css
/* Feature Lane Section */
.feature-lane {
  padding: var(--spacing-6) var(--spacing-4);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin: var(--spacing-6) 0;
}

.feature-lane__heading {
  font-size: var(--text-2xl);
  font-weight: 600;
  margin-bottom: var(--spacing-2);
  color: var(--text-primary);
}

.feature-lane__tagline {
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-1);
}

.feature-lane__subtext {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-4);
}

/* Demo container */
.feature-lane__demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

@media (max-width: 768px) {
  .feature-lane__demo {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
}

/* Demo panes */
.demo-pane {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-primary);
}

/* Code block (shared) */
.code-block,
.terminal-window {
  background: #0f1419;
  color: #e0e0e0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.code-block__header,
.terminal-header {
  background: #1a1f2e;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: 1px solid #2a2f3e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.code-block__copy,
.code-block__copy {
  background: none;
  border: none;
  color: #0eff00;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

.code-block__copy:hover {
  opacity: 0.8;
}

.code-block__content,
.terminal-content {
  padding: var(--spacing-3);
  overflow-x: auto;
  flex: 1;
  max-height: 300px;
}

.code-block__content code,
.terminal-content code {
  display: block;
  white-space: pre;
  font-size: 13px;
  line-height: 1.6;
}

/* Terminal-specific styling */
.terminal-dim {
  color: #666;
}

.terminal-success {
  color: #10b981;
  font-weight: 500;
}

.terminal-highlight {
  color: #fbbf24;
  font-weight: 600;
}

/* Artifact card */
.artifact-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  padding: var(--spacing-4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.artifact-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-3);
}

.artifact-card__header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.artifact-card__badge {
  background: var(--accent-bg);
  color: var(--accent-text);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.artifact-card__body {
  margin-bottom: var(--spacing-3);
}

.artifact-card__title {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
}

.artifact-card__stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.artifact-card__stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.artifact-card__icon {
  color: #10b981;
  font-weight: bold;
}

.artifact-card__time {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.artifact-card__footer {
  display: flex;
  gap: var(--spacing-2);
}

.btn {
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.btn--primary {
  background: var(--accent-bg);
  color: var(--accent-text);
}

.btn--primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
```

### 4.5 Content Adaptation for iStartSoftFlow Brand

**Tone:** Keep it flat, clean, minimal. Match existing landing page (Inter font, CSS vars, no rounded corners beyond --radius-md).

**Terminal colors:** Use the site's existing accent color scheme, not hardcoded green. Map to CSS var `--accent-success` or `--accent-highlight`.

**Terminal content:** Adapt the example output to match iStartSoftFlow's actual CLI messaging. E.g., if the tool uses `issflow build`, show that instead of `npx create-issflow`.

**PR card context:** If you don't want to show a real PR, use placeholder text like `"feature/your-feature-name"` and `"github.com/your-org/your-repo/pull/N"`.

---

## 5. SUMMARY & DECISION MATRIX

### When to Use Each Pattern

| Pattern | Best For | Example |
|---------|----------|---------|
| **Terminal window (Pattern A)** | CLI tools, build output, agent progress | iStartSoftFlow ✓ |
| **Split input/output (Pattern B)** | "Description to artifact" narrative | Alternate approach |
| **Tabbed code (Pattern C)** | Multi-language, multi-option | If supporting pnpm/yarn/npm |
| **Animated typing (Pattern D)** | Demo video, ~2sec reveal | Optional add; avoid if >3sec |
| **PR card** | Artifact proof, review ready | iStartSoftFlow ✓ |
| **Test output summary** | Quality gates, security | Bonus below artifact card |

### Recommended for iStartSoftFlow Feature Lane

✓ **Use:**
1. Outcome-first hero copy: "Describe your feature. Ship a tested branch."
2. Two-column demo: Input pane (FEATURE.md) + Output pane (terminal window)
3. Artifact card: PR with checkmarks for commits, tests, security
4. Plain HTML/CSS: No framework; use existing design tokens

✗ **Avoid:**
- Animated typing (nice-to-have, not essential; adds JS complexity)
- Multiple tabs (scope creep; add later if needed)
- Before/after diff (too much vertical space for this context)
- Mocked/fake PR (use real artifact or realistic placeholder)

---

## 6. REFERENCES & SOURCE CITATIONS

### Primary Research

- **Evil Martians (2025):** "We studied 100 dev tool landing pages—here's what really works in 2025"  
  [evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)

- **Stripe Atlas:** Landing Page Copy Guidance  
  [stripe.com/guides/atlas/landing-page-copy](https://stripe.com/guides/atlas/landing-page-copy)

- **GitHub Blog (2026):** "From prompt to production: Building a landing page with Copilot agent mode"  
  [github.blog/ai-and-ml/github-copilot/from-prompt-to-production-building-a-landing-page-with-copilot-agent-mode/](https://github.blog/ai-and-ml/github-copilot/from-prompt-to-production-building-a-landing-page-with-copilot-agent-mode/)

- **GitHub Blog (2026):** "From idea to PR: A guide to GitHub Copilot's agentic workflows"  
  [github.blog/ai-and-ml/github-copilot/from-idea-to-pr-a-guide-to-github-copilots-agentic-workflows/](https://github.blog/ai-and-ml/github-copilot/from-idea-to-pr-a-guide-to-github-copilots-agentic-workflows/)

### Supporting Resources

- **Landing Page Copy Formulas:** [landingrabbit.com/blog/saas-website-hero-text](https://landingrabbit.com/blog/saas-website-hero-text)
- **Developer Landing Page Best Practices:** [business.daily.dev/resources/create-developer-first-landing-pages-convert/](https://business.daily.dev/resources/create-developer-first-landing-pages-convert/)
- **Terminal CSS Patterns:** [css-tricks.com/snippets/css/typewriter-effect/](https://css-tricks.com/snippets/css/typewriter-effect/)
- **Typed.js (Typing Animation):** [github.com/mattboldt/typed.js/](https://github.com/mattboldt/typed.js/)
- **Terminal Window Components:** [magicui.design/docs/components/terminal](https://magicui.design/docs/components/terminal)

---

## 7. NEXT STEPS / GRILL-ME QUESTIONS FOR ORCHESTRATOR

1. **Real vs. Simulated Output:** Should the terminal window show real iStartSoftFlow CLI output, or is realistic placeholder text acceptable?
2. **Artifact Link Behavior:** Does the "Review on GitHub" button link to an actual PR, a demo PR, or is it disabled (pointer-events: none)?
3. **Terminal Animation:** Is animated typing desired (adds ~2KB JS), or is static content preferred for performance?
4. **Multi-feature Support:** Should the demo show only one feature example, or support a carousel/tabbed selector to show multiple examples?
5. **Security/Audit Output:** Beyond test passes, should the artifact card show security audit results (SAST, dependency check, SBOM)?
6. **Mobile Readability:** Is the 50/50 split acceptable on tablets (≥768px), or should it stack at higher breakpoints?

---

## Appendix: Quick Copy-Paste Templates

### Template 1: Minimal Hero + Terminal (Fastest to Implement)

```html
<section class="feature-lane">
  <h2>Feature Lane</h2>
  <p>Describe your feature. Get a tested branch.</p>
  
  <div class="feature-lane__demo">
    <div class="terminal">
      <pre>$ issflow build feature.md
✓ Built
✓ Tested
✓ Hardened
→ github.com/org/repo/pull/42</pre>
    </div>
  </div>
</section>
```

### Template 2: Full Recommended Layout

(See Section 4.3 above)

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-02  
**Status:** Ready for implementation
