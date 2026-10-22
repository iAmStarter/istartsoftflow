---
name: ui-ux-pro-max
description: >
  Design intelligence for NEW visual direction — styles, palettes, type, landing
  patterns. Use when authoring `/design` UX-PACK, setting OVERVIEW UX direction,
  or the project has no approved UX pack yet. Triggers: "/design", "UX pack",
  "visual direction", "design system", "palette", "typography", "landing pattern",
  "ทิศทางดีไซน์", "โทนสี". Skip for backend, and skip re-rolling styles when an
  approved UX-PACK already exists (follow that frame; validate with ux-design).
---

# ui-ux-pro-max — visual direction (authoring)

Vendored from [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
(MIT — see `LICENSE.upstream` + `UPSTREAM.md`). Engine lives **in this folder**.

`ux-design` remains the **gate** (hard rule 9 — wireframe + cookbook). This skill
picks the **look**. Do not let a catalogue restyle override an approved UX pack.

## When

- `/design` STEP 1 (author the UX pack) — **required** when UI is in scope.
- First visual direction (OVERVIEW UX / no approved `docs/UX-PACK.md`).
- Human explicitly asks to restyle — then re-run and wait for UX-PACK re-approve.

**Not** at `/phase` CLOSE. CLOSE = `ux-design` cookbook against the approved pack.
Do not run `--design-system` again per slice.

## Engine

```
python3 .issflow/skills/ui-ux-pro-max/scripts/search.py
```

If this project's kit was mirrored for Claude Code, the same files exist under
`.claude/skills/ui-ux-pro-max/` — use whichever path is present.

Try `python3`, then `python`, then `py -3`. Stdlib only. If Python 3 is missing,
**ask the human** to install it (python.org / Homebrew / apt). Do not install
Python or npm yourself. Do not tell them to run `uipro init` — the catalogue
is already in the kit.

On-demand detail: `references/quick-reference.md`, `references/pro-rules.md`.

## Authoring workflow

1. Product / industry / keywords from OVERVIEW + PLAN (2–5 terms). Detect stack
   from the project; never assume HTML+Tailwind.
2. Run:

```
python3 .issflow/skills/ui-ux-pro-max/scripts/search.py "<product> <industry> <keywords>" --design-system -p "<project>" -f markdown
```

   Retry once if empty. Do not persist unverified output. Do **not** pass
   `--persist` / do **not** write a parallel `design-system/` tree — fold into
   `docs/UX-PACK.md` → Frame & tokens (style, palette, type, effects,
   anti-patterns). Kit SoT stays UX-PACK.
3. Optional domain search only for a named gap:

```
python3 .issflow/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux|icons|chart|typography|style|color|landing
python3 .issflow/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack <detected>
```

4. Then apply `ux-design` authoring (wireframe + cookbook). Catalogue must still
   pass: no emoji icons, tokens not raw hex in components, WCAG AA.

If UX-PACK is already **approved**, read it and stop — unless the human asked to
change the look.
