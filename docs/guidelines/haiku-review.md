# Haiku Review Protocol

> Applied after every Haiku agent task, before the output is accepted.
> Sonnet (CEO) performs this review. Think: junior dev PR review.

---

## Why This Exists

Haiku follows instructions well but makes poor judgment calls when the spec has gaps.
It will fill ambiguity with plausible-looking code that compiles but does the wrong thing.
It also misses React-specific traps (stale closures, missing deps, effect cleanup) more often than Sonnet.

This review catches those before they compound.

---

## Haiku Self-Report (required output from every Haiku task)

Before finishing, Haiku must output a structured self-report in this format:

```
## Haiku Task Report — [task ID]

### Files changed
- path/to/file.tsx — [one-line description of change]

### Decisions made
- [any choice made that wasn't explicit in the task spec]

### Uncertain / needs review
- [anything Haiku was unsure about — if nothing, write "none"]

### Spec deviations
- [anything done differently from the task file — if none, write "none"]
```

If Haiku does not produce this report, the task output is rejected automatically.

---

## Sonnet Review Checklist

Run through this after reading the self-report and diffing the changed files.

### 1. Scope containment
- [ ] Only files listed in the task spec were changed
- [ ] No new imports added that weren't in the spec
- [ ] No new npm packages introduced

### 2. Spec fidelity
- [ ] Props interfaces match the task file exactly (names, types, optionality)
- [ ] CSS classes / design tokens match V2 spec (check any hardcoded colors or sizes)
- [ ] Acceptance criteria from task file are met — verify each one explicitly

### 3. React traps (most common Haiku misses)
- [ ] All `useCallback` and `useMemo` deps arrays are complete
- [ ] `useEffect` cleanup functions present where needed (observers, listeners, timers)
- [ ] No stale closures over state that changes (e.g. array state in event handlers)
- [ ] No direct state mutation (spread or `new Map()` — never `.set()` on existing ref)

### 4. Type safety
- [ ] No `any` types introduced
- [ ] No non-null assertions (`!`) on values that could genuinely be null
- [ ] Optional chaining used correctly (not masking real bugs)

### 5. Self-report review
- [ ] Decisions made: are they reasonable? Would you have made the same call?
- [ ] Spec deviations: are they justified or should they be reverted?
- [ ] Uncertain items: address each one before accepting

---

## Review Verdicts

**ACCEPT** — all checklist items pass, self-report is clean.

**ACCEPT WITH NOTES** — minor issues (style, naming) that don't affect correctness. Log the note; don't block.

**RETURN TO HAIKU** — checklist failures that are mechanical fixes (wrong prop name, missing cleanup). Re-run Haiku with the specific correction.

**ESCALATE TO SONNET** — judgment call required, spec gap found, or React trap present. Sonnet fixes directly.

---

## Common Haiku Failure Patterns (updated as found)

| Pattern | What Haiku does | Correct approach |
|---|---|---|
| Stale closure | Captures state value at render time in `useCallback` without including in deps | Add state to deps array |
| Effect cleanup | Adds `addEventListener` without returning a cleanup function | Always return `() => removeEventListener(...)` |
| Direct map mutation | Calls `.set()` on existing Map state | `new Map(prev).set(k, v)` |
| Hardcoded colors | Uses `#fbbf24` inline instead of `var(--tc)` or design token | Use CSS variable or `TOOL_HEX` import |
| Missing `Array.from()` | Iterates `Map.entries()` directly (fails at tsconfig target es5/es6) | `Array.from(map.entries())` |
| Over-scoped useEffect | Single effect does too many things; runs on every render | Split into focused effects with minimal deps |

---

## Integration with Sprint Flow

```
Haiku executes task
    ↓
Haiku writes self-report (required)
    ↓
Sonnet reads self-report + diffs changed files
    ↓
Sonnet runs checklist (5 sections, ~10 min equivalent)
    ↓
ACCEPT → commit + update sprint board
RETURN → Haiku re-runs with correction note
ESCALATE → Sonnet fixes + notes pattern in this file
```

Sprint board is not updated until Sonnet has accepted the Haiku output.
