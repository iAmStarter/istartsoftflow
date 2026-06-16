# Design Research: UX-Design Cookbook + Wireframe-as-Template Pattern for AI Coding Agents

**Date:** 2026-06-16  
**Topic:** Design system validation checklist and wireframe-as-canonical-prototype pattern for LLM agent code generation  
**Sources:** Web research, design system docs, academic papers, WCAG standards  

---

## TOPIC 2A: UX-Design Cookbook — What Belongs in a Design System Validation Checklist

A **UX Design Cookbook** for AI agents is a structured, machine-readable specification that agents use to validate generated UI code before deployment. It prevents **design drift** ("ไม่ออกนอกกรอบ" — not escaping the frame).

### Core Categories for the Cookbook

#### 1. **Design Tokens** (Foundation Layer)

- **Color tokens:** Primary, secondary, tertiary + semantic colors (success, error, warning)
  - Include light/dark mode variants
  - Accessibility tokens: min contrast ratios (4.5:1 for normal text, 3:1 for large text per WCAG 2.1 AA)
- **Typography tokens:** Font families, sizes (12px–48px scale), weights, line heights
- **Spacing tokens:** 8px base unit scale (0px, 8px, 16px, 24px, 32px, etc.) for consistent padding/margins
- **Border radius:** Small (2px), medium (4px), large (8px) for rounded corners
- **Shadow/elevation:** Depth layers (shadow-sm, shadow-md, shadow-lg) for visual hierarchy

**Example structure for agent validation:**
```json
{
  "designTokens": {
    "colors": {
      "primary": "#0066CC",
      "contrast_ratio_min": 4.5,
      "light_mode_bg": "#FFFFFF",
      "dark_mode_bg": "#1A1A1A"
    },
    "spacing": {
      "unit": 8,
      "scale": [0, 8, 16, 24, 32, 40, 48]
    }
  }
}
```

#### 2. **Component Inventory** (What Can Be Used)

- **Atomic components:** Button, Input, Label, Icon, Badge, Chip
- **Composite components:** Card, Modal, Dropdown, Navigation Bar, Data Table
- **States per component:** default, hover, active, focus, disabled, loading, error
- **Props + constraints:** Type definitions (string, boolean, enum) so agent knows valid combinations

**Example:**
```json
{
  "Button": {
    "variants": ["primary", "secondary", "tertiary"],
    "sizes": ["sm", "md", "lg"],
    "states": ["default", "hover", "active", "disabled"],
    "required_props": ["onClick", "label"],
    "optional_props": ["icon", "loading"]
  }
}
```

#### 3. **Responsive Design Breakpoints** (Mobile-First)

- **XS:** 320px (mobile phones)
- **SM:** 480px (small phones/landscape)
- **MD:** 768px (tablets)
- **LG:** 1024px (desktops)
- **XL:** 1280px+ (large displays)

**Agent validation rule:** Every layout component must pass 3-point breakpoint check (mobile, tablet, desktop).

#### 4. **Accessibility (WCAG 2.1 AA) Compliance Checklist** ♿

Core WCAG 2.1 AA criteria agents must validate:

- **Contrast ratio:** Text ≥ 4.5:1 (normal), ≥ 3:1 (large text 18pt+)
- **Keyboard navigation:** All interactive elements reachable via Tab
- **Focus indicators:** Visible focus state on all buttons/inputs (outline or highlight)
- **Alt text:** All images must have descriptive `alt` attribute
- **Form labels:** Every input must have associated `<label>` or `aria-label`
- **Semantic HTML:** Use `<button>`, `<input>`, `<nav>`, not generic `<div>` for interactions
- **Color not sole indicator:** Don't rely on color alone (e.g., red input = error); also add icon/text
- **Motion/animation:** Respect `prefers-reduced-motion` media query
- **Text scaling:** Support zoom up to 200% without loss of content

**Agent checklist example:**
```json
{
  "wcagAARequirements": {
    "contrast_ratio": 4.5,
    "keyboard_navigable": true,
    "focus_visible": true,
    "alt_text_required": true,
    "semantic_html": true,
    "form_labels_required": true,
    "respects_prefers_reduced_motion": true
  }
}
```

#### 5. **i18n & Content Guidelines**

- **Text length expectations:** English 10 words → German 12 words; design must accommodate 125% width in German
- **Direction:** RTL (Arabic, Hebrew) vs LTR; test in both
- **Date/number/currency formats:** Not hardcoded; use locale
- **Plural forms:** Some languages have 3+ plural rules

**Agent guidance:** Flag designs that hardcode text without i18n variables.

#### 6. **Component State Matrix**

A validation table agents query before generating:

| Component | States | Props | Required? |
|-----------|--------|-------|-----------|
| Button | default, hover, active, disabled, loading | variant, size, onClick | onClick, label |
| Input | default, focus, filled, error, disabled | type, placeholder, value | type |
| Card | default, hover, selected | padding, border, shadow | None (container) |

---

## TOPIC 2B: Wireframe-as-Canonical-Prototype Pattern

### Pattern Definition

A **wireframe is the canonical baseline** that an AI agent must conform to before generating production UI code. Instead of generating arbitrary layouts, the agent:

1. **Receives low-fidelity wireframe** (sketch, ASCII diagram, or structured spec)
2. **Extracts structural constraints:** component placement, hierarchy, grid alignment
3. **Maps to design tokens + component inventory:** respects colors, spacing, typography
4. **Validates against design system:** checks WCAG, contrast, responsive behavior
5. **Emits typed, schema-validated code:** no hallucination; only recognized components + props

### How Teams Encode Wireframes for LLM Agents

#### Approach 1: Structured JSON Schema (Most Reliable)

**The wireframe is a JSON blueprint:**

```json
{
  "layout": {
    "type": "grid",
    "columns": 12,
    "rows": "auto",
    "gap": "md"
  },
  "regions": [
    {
      "id": "header",
      "type": "component",
      "component": "NavigationBar",
      "props": {
        "variant": "primary",
        "sticky": true
      },
      "grid": { "column": "1 / 13", "row": 1 }
    },
    {
      "id": "main_content",
      "type": "grid",
      "columns": [6, 6],
      "rows": "auto",
      "grid": { "column": "1 / 13", "row": 2 }
    },
    {
      "id": "sidebar",
      "type": "component",
      "component": "Card",
      "children": [
        {
          "type": "component",
          "component": "Button",
          "props": { "variant": "secondary", "fullWidth": true }
        }
      ],
      "grid": { "column": 1, "row": "1 / 3" }
    }
  ]
}
```

**Agent workflow:**
- Parse wireframe JSON → extract region structure
- For each region: validate component type exists in inventory
- Map props to design tokens (colors, spacing)
- Generate framework-specific code (React, Vue, etc.) from schema
- Validate output against original wireframe structure

**Benefit:** Hard constraints; agent cannot drift. Either it matches the schema or it fails validation.

#### Approach 2: Visual Wireframe + Constraint Rules (Multi-Modal)

**Low-fidelity image** (Figma screenshot, Excalidraw sketch) + **text constraint document:**

```markdown
# Wireframe Constraints

## Layout Grid
- 12-column grid, 1200px max-width
- Mobile: single column; tablet: 2 columns; desktop: 3 columns

## Regions
1. **Header** (full width, sticky): NavigationBar component, height 64px
2. **Sidebar** (left, 25% width on desktop): Card with primary/secondary buttons
3. **Main Content** (75% on desktop): 2-column grid for articles

## Component Rules
- All buttons must use Button component from inventory (no `<div onclick>`)
- All text in body must use Typography component
- Card component must have 16px padding token (md)
- Focus states required on all interactive elements

## Responsive Rules
- Hide sidebar on mobile (< 768px)
- Stack main content into 1 column on tablet
- All text must scale at 16px base (no hardcoded px values)

## Accessibility Requirements
- Heading hierarchy: h1 (page title), h2 (sections), h3 (subsections) — no skipping levels
- Contrast: all text ≥ 4.5:1 against background
- Focus outline: 2px solid primary color
```

**Agent workflow:**
1. Analyze wireframe image (vision model) → infer layout structure
2. Cross-reference constraint rules → validate intent
3. Generate code respecting both visual layout and text constraints
4. Run validation suite against design system tokens + accessibility

#### Approach 3: Storybook as Canonical Reference

Storybook components are the **source of truth**:

```typescript
// Button.stories.ts (agent reference)
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['primary', 'secondary', 'tertiary'],
      control: 'select',
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: 'select',
    },
    disabled: { control: 'boolean' },
  },
};

// Agent extracts from stories:
// - Valid prop combinations
// - Visual states (hover, focus, disabled)
// - Default prop values
// - A11y requirements (aria-label, role, etc.)
```

**Agent workflow:**
- Ingest Storybook component definitions as schema
- When generating UI, call only components + props seen in Storybook
- Validate generated code against Storybook specs (no undefined variants)

---

## Authority Sources & Frameworks

### 1. **WCAG 2.1 AA Standard** (Legal Baseline)

**Citation:** [WCAG 2.1 Level AA](https://www.webability.io/blog/wcag-2-1-aa-the-standard-for-accessible-web-design)

Core requirements:
- Contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation: all functionality via keyboard
- Focus indicators: visible focus state
- Alt text for images
- Semantic HTML structure

**For agents:** Build WCAG checklist into design system validation. Fail code generation if contrast or focus visibility is missing.

### 2. **Shopify Polaris Design System** (Production Reference)

**Citation:** [Shopify Polaris Design Tokens](https://github.com/Shopify/polaris-tokens)

Components: Button, Card, TextField, Select, Modal, DataTable, Navigation  
Tokens: 60+ production-ready, organized by category (color, spacing, typography, shadow)  
Accessibility: Every component documented with WCAG requirements + keyboard navigation

**For agents:** Use Polaris token structure as template for your design token definitions. Polaris enforces consistency via tokens; agent should do the same.

### 3. **Material Design 3** (Comprehensive System)

**Citation:** [Material Design System](https://www.uxpin.com/studio/blog/best-design-system-examples/)

Key contribution: **Design tokens as first-class objects**, not afterthoughts
- Color system includes semantic tokens (success, error, warning) not just raw hex values
- Elevation system (M3 uses tonal color instead of shadows)
- Motion guidelines for animations (duration, easing)
- Responsive grid system: 4-column (mobile), 8-column (tablet), 12-column (desktop)

**For agents:** Material's semantic token approach prevents drift. Agent picking `color: "error"` automatically gets right contrast + context.

### 4. **Apple Human Interface Guidelines (HIG)**

**Citation:** [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)

Key principles:
- **Respect user control:** undo, confirm destructive actions, don't auto-save
- **Clarity:** text must be legible at all sizes, hit targets ≥ 44pt
- **Feedback:** users must know what happened (loading states, confirmation)
- **Accessibility:** color not sole indicator; support Dynamic Type (text scaling); support VoiceOver

**For agents:** HIG emphasizes user intent + feedback. Agents should validate that generated UI acknowledges user actions (loading spinner, toast message, success state).

### 5. **LLM Component Schema Standard** (Emerging Practice)

**Citation:** [From Template to Tested Product: LLM Component Schema Standard](https://dev.to/petrilahdelma/from-template-to-tested-product-launching-the-llm-component-schema-standard-42fc)

Pattern: **Component schema defines structure, behavior, accessibility, constraints**
- Drift detection: compare generated props against schema
- Validation gates: multi-stage pipeline (syntax, type, execution, output accuracy)
- Schema-driven generation: agent emits typed components, no freeform HTML

**For agents:** Implement schema validation as a hard gate. If agent generates a Button with `variant: "invalid"`, the schema catch it before it reaches the browser.

---

## Example: Minimal Design System Validation Spec

Agents use this as the **gating checklist** before approving generated UI:

```json
{
  "designSystemSpec": {
    "designTokens": {
      "colors": ["primary", "secondary", "error", "success"],
      "spacing": [8, 16, 24, 32],
      "typography": ["h1", "h2", "body", "caption"]
    },
    "componentInventory": {
      "Button": { "variants": ["primary", "secondary"], "sizes": ["sm", "md", "lg"], "required": ["onClick"] },
      "Card": { "variants": ["raised", "outlined"], "required": [] },
      "Input": { "required": ["type", "aria-label"] }
    },
    "wcagChecklist": {
      "contrast_ratio_min": 4.5,
      "focus_visible": true,
      "semantic_html": true,
      "alt_text": "required_for_images"
    },
    "responsiveBreakpoints": { "mobile": 320, "tablet": 768, "desktop": 1024 },
    "i18nRules": { "text_expansion_factor": 1.25, "rtl_tested": true }
  },
  "validationRules": [
    "All colors must be from tokens list",
    "All spacing must be from spacing scale (multiples of 8)",
    "Every interactive element requires focus indicator",
    "Contrast ratio >= 4.5:1 for all text",
    "No hardcoded px values; use token references",
    "Responsive design: test all breakpoints"
  ]
}
```

---

## Key Constraints & Unknowns

### Constraints:
1. **Wireframe fidelity trade-off:** Very low-fidelity wireframes leave room for agent misinterpretation; detailed wireframes constrain agent more but cost time to create
2. **Framework specificity:** Wireframe constraints are framework-agnostic (React, Vue, Svelte); agent must map to target framework's idioms
3. **Token completeness:** If design token spec is incomplete, agent fills gaps with defaults (or hallucination); maintain comprehensive token library
4. **Validation overhead:** Multi-stage validation (syntax → type → execution → accuracy) adds latency; pipeline gates needed for CI/CD

### Unknowns:
- Optimal wireframe fidelity for LLM agents (academic research in progress; no consensus yet)
- Cost of agent's multi-stage validation in production (feasible for critical UI, maybe not for every component)
- How to handle design system evolution (agent trained on old tokens, system updated; drift detection strategy unclear)

---

## Citations

- [WCAG 2.1 AA Checklist](https://www.webability.io/blog/wcag-2-1-aa-the-standard-for-accessible-web-design)
- [Shopify Polaris Design Tokens](https://github.com/Shopify/polaris-tokens)
- [Material Design 3 System](https://www.uxpin.com/studio/blog/best-design-system-examples/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [LLM Component Schema Standard](https://dev.to/petrilahdelma/from-template-to-tested-product-launching-the-llm-component-schema-standard-42fc)
- [Component Validation & Design System Drift](https://dev.to/singhdevhub/how-we-prevent-ai-agents-drift-code-slop-generation-2eb7)
- [VSA: Visual–Structural Alignment for UI-to-Code](https://arxiv.org/pdf/2512.20034)
- [Designing with Language: Wireframing UI Design Intent with Generative LLMs](https://arxiv.org/pdf/2312.07755)
- [Design Tokens: Atlassian Design](https://atlassian.design/foundations/spacing)
- [Accessibility in Design Systems](https://a11ypros.com/blog/accessibility-in-design-systems)
