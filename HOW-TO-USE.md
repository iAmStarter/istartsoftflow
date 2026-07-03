# How to use iStartSoftFlow

> ฉบับภาษาไทย: [HOW-TO-USE.th.md](./HOW-TO-USE.th.md)

## What is this?

When you ask an AI to write code, it usually "guesses and goes" — fast, but
things break, it loops on fixes, and your AI bill grows.

**iStartSoftFlow is a rulebook + a team of helpers that makes the AI work like
a professional team:** understand first → plan → **get your approval** → build
one slice at a time → test everything → deliver with a test sheet for you.

Think of it as upgrading from "an intern who guesses" to "a team with a project
manager" — and the important rules are enforced by small programs (hooks) the
AI **cannot skip**, not by politely asking it.

Free (MIT). You only pay for the AI you already use.

---

## What you need first

1. **Node.js 18+** — check with `node -v` (get it at nodejs.org)
2. **Claude Code** — Anthropic's AI coding tool:
   `npm install -g @anthropic-ai/claude-code`, then log in when it asks.
   (Codex / Cursor / Gemini / Aider also work; Claude Code gets the most features.)
3. **A project folder** — brand new or an existing codebase, both fine.

---

## Install (1 minute)

In your project folder:

```bash
npx create-issflow
```

Pick your AI tool (usually `claude`). Done.

- **It never overwrites your files** — conflicts are written next to yours for review.
- Re-run any time to update.

Then open Claude Code there:

```bash
claude
```

---

## How to use it — pick your situation

### Situation 1: starting a brand-new project

```
/overview
```

It **interviews you** like a good PM: what are we building, for whom, what are
the constraints. Answer honestly — "I don't know" is a fine answer (it will
research). Then it writes a **plan** and stops: **read it and approve it before
anything gets built.** (This is a real lock — while the plan is unapproved, the
AI physically cannot edit source files.)

After approval, build slice by slice:

```
/phase
```

Each phase: tests written first → code until tests pass → security check →
close. Repeat `/phase` until the plan is done.

### Situation 2: adding a feature to an existing product (the star of the kit)

**Step 1 — get the work-order form:**

```
/feature new my-feature-name
```

It creates a form at `docs/features/my-feature-name/FEATURE.md`.

**Step 2 — fill it in, in normal human language:** what you want, why, what it
must do, what is explicitly NOT included. Then change the top line from
`Approval: PENDING` to `Approval: APPROVED yourname date` — that's your signature.

**Step 3 — release the work:**

```
/feature
```

Walk away. It will: attack the spec for holes → mini-plan → write tests first,
then code → harden with adversarial review → produce a **human test sheet** →
deliver a branch.

**Step 4 — your only job:** open the generated `TEST-PLAN.md`, click through the
scenarios, and merge when everything passes.

### Situation 3: a tiny fix (copy change, small bug)

```
/quick describe what to change
```

It **repeats its understanding back and waits for your confirm**, then makes the
smallest change that works — with a regression check so nothing else breaks.

---

## All commands

| Type | It means |
|---|---|
| `/overview` | new project — interview + plan + your sign-off |
| `/feature new <name>` | get the feature work-order form |
| `/feature` | build the feature end-to-end, deliver branch + test sheet |
| `/quick ...` | small fast fix |
| `/phase` | build the next slice of the plan |
| `/goal set "..."` | set a big goal ("clear the feature backlog") for it to chase |
| `/goal run` | work toward the goal until done / budget spent |
| `/sprint run` | organize phases into Scrum-style sprints, driven automatically |
| `/propose` | client proposal with scope + price (for freelance/agency work) |
| `/change-request ...` | mid-project change — impact + fair re-price, transparently |
| `/release` | the big pre-production check (full tests + audits + human UAT) |
| `/uat` | generate a human test sheet + collect results |
| `/ui-audit` `/qa-audit` `/security-audit` | whole-product health checks |
| `/replan` | change the plan (needs your sign-off again) |
| `/synthesize` | compress notes to keep the AI bill down |
| `/log-issue` `/log-decision` `/runbook` | write down problems / decisions / recovery steps |
| `/store-wisdom` | keep lessons for future projects |
| `/unstuck` | it's stuck — force a proper research retreat |

You only need three to be productive: `/overview` to start, `/feature` to add,
`/quick` to fix.

---

## When does it stop and ask YOU?

Almost everything is automatic — except the points that must stay human:

1. **Before starting any new task** — it briefs its understanding back; you
   confirm first (a wrong understanding wastes far more money than one question).
2. **Approvals** — the plan, the feature doc, the price. No signature, no build.
3. **Dangerous things** — production deploys, deleting data, sending things out.
4. **Final testing (UAT) + the merge** — the last gate is always a person.

---

## FAQ

**Do I need to know how to code?**
No — your job is describing what you want, clicking through the test sheet, and
approving. Reading code helps you review deeper, but isn't required.

**What does it cost?**
The kit is free. You pay only your existing AI usage — and the kit is built to
be frugal: loads only what's needed, compresses notes between phases, and routes
work to cheaper models where that's safe.

**Which languages/frameworks?**
All of them. It pins a *process*, not a stack — you declare your stack once
during `/overview`.

**What if the AI makes mistakes?**
Tests are written before code, so mistakes get caught; after 3 failed fix
attempts it must stop and report (no thrashing); every problem is logged so it
isn't repeated; and all work lives on a separate branch — nothing is real until
you merge.

**Can it work while I sleep?**
Yes — install with `npx create-issflow --ci` (GitHub: label an issue
`feature:approved` and it runs) or `--docker` (a safe box on your machine:
`node scripts/feature-docker.js docs/features/<name>/FEATURE.md`). Needs an
Anthropic API key.

**How do I uninstall?**
Delete the `.claude/` folder and `AGENTS.md`. Your code is untouched.

---

## Read next

- Overview + detailed install: [README.md](./README.md)
- The full rulebook: `.claude/istartsoft-flow/METHODOLOGY.md` (after install)
- Website: https://iamstarter.github.io/istartsoftflow/
