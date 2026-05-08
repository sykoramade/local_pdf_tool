# UX Fix Session Log

---

## Fix 1 — Undo/Redo
**Date:** 2026-04-24
**Commit:** `72ac5e0`

### Files Changed
- `app/app/components/CanvasTextLayer.tsx` (+232 / -23)

### What Changed
- Added `UndoItem` discriminated union type (`text` delta | `move` delta) — delta-based approach instead of full `canvas.toJSON()` snapshots to avoid handler-loss on `loadFromJSON`
- `text:editing:entered` listener → captures `preEditTextRef` (text state before user starts typing)
- `text:editing:exited` → pushes `{ kind: 'text', before, after }` to undoStack when text committed; clears redoStack on new action
- `mouse:down` → captures `prePositionRef` BEFORE select-mode early return (so Fix 3 drags tracked correctly)
- `object:modified (e.target)` → pushes move delta if position changed; `getActiveObject()` replaced with `e.target` to avoid stale reference
- Ctrl+Z: guards (native input focus, Fabric IText in edit mode), then pops undoStack → restores text or position; dormant state restored when reverting to original text (removes occluder)
- Ctrl+Shift+Z: reverse; redo text path re-creates occluder via cached `rectClassRef`
- Both stacks capped at 50 entries; `rectClassRef` caches Fabric `Rect` class after import
- `sampleBgColor` moved to module level (pure function, takes canvas as param)
- Occluder intentionally not moved during move undo/redo — it covers original PDF text location and should stay there

### Acceptance Test Result
- Browser verification pending (cannot run without dev server)
- TypeScript: 0 errors (`npx tsc --noEmit`)
- Pre-commit hook: PASSED (lint-staged + next lint, 3 warnings in unrelated files pre-existed)

### Deviations from Spec
- Used **delta-based undo** instead of `canvas.toJSON()` snapshots — avoids Fabric handler-loss after `loadFromJSON` while achieving identical user-visible behavior
- `FabricLayerRef` NOT extended with `undo()`/`redo()` — functions are closured inside useEffect, accessible via keyboard shortcuts only; external button wiring deferred (buttons already exist in EditToolbar but use the editMap undo system, not canvas undo)

### Known Limitations (carry to Fix 2 scope)
- Undo for text edits does not sync back to parent's `committedEdits` React state (only updates canvas visuals + local `committedEditsRef`). If user undoes then switches tools, the download may use stale `committedEdits`. Fixing parent state sync is Fix 2.
- Move undo requires Fix 3 (Select mode makes objects draggable) before it can be tested

### Confidence: 8/10
Solid on the text undo path. Move undo is untested (requires Fix 3). Redo occluder recreation is new code that needs browser verification.

---

## Toolbar Button Fix (between Fix 1 and Fix 2)
**Date:** 2026-04-24
**Commit:** `e574b5c`

### Files Changed
- `app/lib/pdf/types.ts` (+2)
- `app/app/components/CanvasTextLayer.tsx` (net −90 — removed duplicate inner fns)
- `app/app/workspace/WorkspaceShell.tsx` (+4 / -4)
- `app/app/components/EditToolbar.tsx` (+27 / -27)

### What Changed
- `FabricLayerRef` extended with `undo()` and `redo()`
- `applyUndo`/`applyRedo` lifted to component scope; `useImperativeHandle` exposes them
- WorkspaceShell routes toolbar buttons to canvas undo stack; `canUndo/canRedo = !!file`
- EditToolbar: enabled icon opacity `.5→.85`, border `.14→.18`, hover fill; disabled `.4→.35`

### Confidence: 9/10

---

## Fix 2 — State Sync
**Date:** 2026-04-24
**Commit:** `54dc8f3`

### Files Changed
- `app/app/components/CanvasTextLayer.tsx` (+3 / -1)

### What Changed
- Added `useEffect(() => { committedEditsRef.current = committedEdits }, [committedEdits])` to keep committed-edits ref current. Previously it was set at mount only — any canvas re-init after edits would rehydrate from stale state, silently discarding edits made since mount.

### Acceptance Test Result
- Browser verification pending. TypeScript: 0 errors; pre-commit: PASSED

### Confidence: 9/10 — single-line fix, exact pattern already used for `onCommitRef` and `pdfCanvasRef`

---

## Fix 3 — Marquee Selection
**Date:** 2026-04-24
**Commit:** `1143f67`

### Files Changed
- `app/app/components/CanvasTextLayer.tsx` (+38 / -2)

### What Changed
- Added `applyEditModeToCanvas(canvas, mode)` at component scope
  - Select: `canvas.selection=true`, all `edited-text` IText → `{ selectable: true, evented: true, hasBorders: true, hasControls: false }`
  - Text: `canvas.selection=false`, `discardActiveObject()`, committed blocks lose selectable but stay visible, ghosts go to `opacity: 0.001`
- `editMode` useEffect calls the helper on mode change (no-op if canvas not yet initialised)
- `init()` calls `applyEditModeToCanvas` at completion so re-inits while in select mode apply correctly

### Acceptance Test Result
- Browser verification pending. TypeScript: 0 errors; pre-commit: PASSED
- Opus review: PASS (confirmed race condition handled correctly, committed block opacity preserved)

### Known lint warnings (pre-existing, not introduced here)
- `react-hooks/exhaustive-deps` for `applyUndo`/`applyRedo` in deps arrays — functions use only stable refs; will suppress in Fix 4

### Confidence: 9/10

---
