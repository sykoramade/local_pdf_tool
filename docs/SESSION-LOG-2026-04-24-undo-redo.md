# Session Log — 2026-04-24 — Undo/Redo (UX Fix 1 of 5)

**Commit:** 4048bf4  
**Time:** ~50 min actual vs 45 min estimate (+11%)  
**Hook:** Passed (warnings only, pre-existing)

## Files touched

| File | Change |
|---|---|
| `app/app/components/CanvasTextLayer.tsx` | Added `onStackChange` prop + ref, `notifyStackChange()` helper, Ctrl+Y redo, contentEditable guard; call `notifyStackChange` at all stack mutation sites |
| `app/app/components/PdfViewer.tsx` | Threaded `onStackChange` prop to CanvasTextLayer |
| `app/app/components/workspace/CanvasArea.tsx` | Threaded `onStackChange` prop to PdfViewer |
| `app/app/workspace/WorkspaceShell.tsx` | Added `undoCount`/`redoCount` state; `onStackChange` callback; reset on file/page change; `canUndo={undoCount > 0}`, `canRedo={redoCount > 0}` |

## Acceptance tests

Cannot run without browser — manual testing required. Implementation analysis:

1. **Edit text, Ctrl+Z reverts; Ctrl+Shift+Z returns** — `text:editing:exited` pushes `{kind:'text', before, after}` to undoStack; `applyUndo` restores `before`; `applyRedo` restores `after`. ✓ wired
2. **Move text block, Ctrl+Z moves back; Ctrl+Y moves forward** — `object:modified` pushes `{kind:'move', bLeft, bTop, aLeft, aTop}`; applyUndo/applyRedo set left/top. Ctrl+Y added. ✓ wired
3. **51 edits — oldest dropped** — cap enforced at both push sites via `if (length > 50) shift()`. ✓ implemented
4. **Ctrl+Z inside Fabric text edit fires native** — guard: `if active?.type === 'i-text' && active.isEditing return` before global undo. ✓ implemented
5. **Undo button same as Ctrl+Z** — `onUndo` calls `fabricLayerRefs.current.get(activePage)?.undo()` which is `applyUndo`. ✓ wired
6. **Button states update** — `notifyStackChange()` fires after every stack mutation → `setUndoCount`/`setRedoCount` → `canUndo`/`canRedo` props reflect real stack depths. ✓ wired

## Pre-commit hook result

✅ PASSED (warnings only — 2 pre-existing `react-hooks/exhaustive-deps` in CanvasTextLayer, 3 pre-existing image/hooks warnings elsewhere)

## Unexpected findings

1. **Implementation was 90% complete on arrival.** `CanvasTextLayer` already had operation-delta undo/redo with 50-entry cap, `text:editing:entered/exited`, `object:modified`, keyboard handler, and `useImperativeHandle`. The spec's "register object:modified" etc. were all present. Actual gaps: Ctrl+Y, contentEditable guard, and the disabled button state plumbing.
2. **Keyboard handler conflict (pre-existing).** `useWorkspaceEdit.ts` has a Ctrl+Z listener that fires `histUndo()` (editMap history) at the same time as CanvasTextLayer's listener. Both are `window` listeners; `stopPropagation` doesn't prevent both from firing. In practice benign (editMap history is usually at head entry), but structurally wrong. Not fixed in this commit — separate scope.
3. **`canUndo`/`canRedo` were hardcoded `!!file`.** Buttons were always enabled when any file was open, regardless of stack depth.

## Confidence

**7/10** — Static analysis confirms correct wiring. Cannot confirm runtime behavior without browser test (Fabric canvas interactions, occluder recreation on redo, edge cases around page switches clearing stacks mid-operation).
