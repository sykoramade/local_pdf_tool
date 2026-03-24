# Haiku Delegation Protocol

All tasks marked 🟡 are assigned to Haiku. All tasks marked 🔵 are Sonnet-only.
A sprint board task is NOT complete until Sonnet has reviewed the Haiku output.

---

## Task Routing Rules

### Haiku (🟡) — safe to delegate when ALL of the following are true:
- Fewer than 200 lines of new code
- No novel coordinate math or scroll-offset transforms
- No new interaction state machines (mousedown → move → up)
- Spec has explicit acceptance criteria with testable browser steps
- Pattern already exists in codebase (e.g., color fix, state toggle, prop threading)

### Sonnet only (🔵) — required when ANY of the following apply:
- Debugging unknown root cause (investigation tasks)
- New algorithm with tolerance/edge-case tuning
- Complex UI lifecycle (focus/blur, resize, drag with hit detection)
- Multi-component state coordination across scroll containers
- Performance-sensitive code paths
- Security-adjacent code (auth, payments)

---

## Haiku Self-Report Template

Haiku MUST output this report after every task before Sonnet reviews:

```markdown
## Haiku Task Report — [S##-#: task name]

### What I did
[2-3 sentences: what files changed, key decisions made, how ambiguity was resolved]

### Confidence rating
**X/10** — [one-sentence reason, e.g. "Mechanical find-replace in 2 known locations, no state management"]

### What you should verify
- [ ] [Specific browser step to confirm the fix, e.g. "Place a typed signature → confirm stroke is true black"]
- [ ] [Second testable step]
- [ ] [Any edge case that needs Sonnet eyes]

### Flags for further work
- [Anything Haiku saw but intentionally did not fix — incomplete scope, design gap, tech debt]
- [Or "None" if clean]
```

---

## Escalation Path

```
1. HAIKU EXECUTES TASK → writes self-report

2. CEO / MD READS REPORT
   ├─ Confidence ≥ 8/10 AND verification steps are clear
   │   └─ Run browser checks → pass → send to Sonnet code review
   └─ Confidence < 8/10 OR verification seems risky
       └─ Escalate directly to Sonnet with Haiku report attached

3. SONNET CODE REVIEW (for any Haiku task that passed browser checks)
   Checklist:
   - [ ] Every setState call uses spread/immutable pattern (no direct mutation)
   - [ ] Every useEffect has cleanup return (observer.disconnect, removeEventListener)
   - [ ] Drag/positioning logic subtracts scroll offset before computing %
   - [ ] CSS colors use design tokens (var(--tx), TOOL_HEX) not hardcoded hex
   - [ ] No new deps added without bundle size check
   - [ ] Haiku report flags addressed or documented

4. VERDICT
   ├─ ACCEPT — merge, mark sprint task complete
   ├─ ACCEPT WITH NOTES — merge, add note to lessons-learned.md
   ├─ RETURN TO HAIKU — specific correction with explicit instructions
   └─ ESCALATE TO SONNET — Sonnet re-implements

5. COMMIT — only after Sonnet sign-off
```

---

## Known Haiku Failure Modes (update as discovered)

| Pattern | Risk | Prevention |
|---|---|---|
| Drag clamping misses scroll offset | Sig/annotation lands at wrong position on scrolled pages | Task spec must include: "subtract canvasScrollRef.scrollTop before computing yPct" |
| Shallow spread on nested state | Stale UI after state update | Review checklist: verify every `{...s, field}` is on a flat object |
| Missing useEffect cleanup | Memory leak, crashes on second PDF load | Review checklist: every useEffect with observer/listener must return cleanup fn |
| Hardcoded color instead of token | Breaks on theme change | Task spec must name exact token: `var(--tx)`, `TOOL_HEX['sign']` etc. |
| MapIterator used where Array expected | TypeScript error at runtime in some browsers | Use `Array.from(map.entries())` not `[...map.entries()]` when targeting TS strict |

---

## Confidence Calibration Reference

| Rating | Meaning | CEO action |
|---|---|---|
| 9–10/10 | Mechanical, pattern-matched, fully verifiable | Browser check → Sonnet review → merge |
| 8/10 | Clear scope, minor uncertainty on edge case | Browser check → Sonnet review → merge |
| 7/10 | Medium risk, needs Sonnet review before browser test | Sonnet review first, then browser check |
| < 7/10 | Haiku struggled — don't trust the output | Escalate to Sonnet for re-implementation |
