---
description: Log an error to docs/ISSUES.md with root cause + solution, in the canonical format.
argument-hint: [short error description]
---

Caveman ULTRA mode.

Append an entry to docs/ISSUES.md. Error: $ARGUMENTS

Canonical format:
```

### <short error title — searchable, literal error keywords>

- [ ] open      (or “- [x] resolved” once fixed)
- severity: P1 | P2 | P3   (optional; required when filed via /support)
- commercial: warranty | billable | n/a
- symptom: <what was observed>
- root cause: <the REAL underlying cause>
- solution: <exact fix, or “pending”>
- failed attempts: <approaches that did NOT work>

```
Rules:
- title must contain literal error keywords -> grep finds it.
- root cause is the real cause, not "the line threw an error".
- always fill "failed attempts" — stops repeated dead ends.
- open issues use the empty box `- [ ]`; resolved are checked `- [x] resolved`
  (the SessionStart hook surfaces every `- [ ]` as open — keep the box empty until fixed).
- open issues go at the TOP; resolved below; archived oldest at bottom.
- For after-go-live tickets prefer `/support` first (triage), then this log.

Confirm the entry back in 2 lines.
