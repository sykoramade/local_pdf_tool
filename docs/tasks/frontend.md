# Frontend Task Queue

Tasks assigned to the ui-builder agent.
Delete task when complete. Log any architecture decisions to docs/decisions.md first.

---

## SPRINT 19 — Sign tool overhaul + annotate wiring + page rail scroll sync

**Goal**: Complete the sign tool (draw modal, smoothing, drag/delete overlays), wire annotate tool, sync page rail on scroll.

**Spec source**: `localpdf_v2.html` — authoritative for layout/styling.
**Pre-read mandatory**: Read WorkspaceShell.tsx and lib/pdf/signature.ts before any implementation.

**Model assignments:**
- 🔵 **Sonnet** — S19-1 (scroll-offset fix if found), S19-2 (draw modal), S19-6 (annotate wiring), S19-7 (code-reviewer)
- 🟡 **Haiku** — S19-1 (checklist execution only), S19-4 (SigOverlay), S19-5 (IntersectionObserver), sprint board updates, docs/ edits

**Haiku review**: All Haiku tasks require a self-report + Sonnet review before acceptance.
See `docs/guidelines/haiku-review.md` for protocol.

---

### S19-1 — Browser verification of sign flow 🟡 Haiku (checklist) / 🔵 Sonnet (fix if needed)
**MANDATORY QUALITY GATE — do this first**

S18 is not COMPLETE until this passes. TypeScript clean ≠ working.

Steps:
1. `npm run dev`
2. Open `/workspace?tool=sign`, drop a 3+ page PDF
3. Type a name → confirm "Place →" appears with live serif preview
4. Click "Place →" → confirm crosshair overlay appears on canvas
5. Click a location on page 1 → confirm sig is recorded (count badge increments)
6. Scroll to page 2 → click a location → confirm second sig recorded
7. Click Download → open the PDF → confirm both signatures appear at correct positions
8. **Scroll-offset test**: scroll canvas to page 3, place a sig — confirm it lands where clicked (not offset by scroll amount)
9. Check browser console — zero unhandled errors

**If scroll-offset bug found**: fix is to subtract `canvasContainer.scrollTop` from the Y offset in the click handler before computing yPct.

Only after all checks pass: clear S18 status issue and proceed to S19-2.

**🟡 Haiku self-report required before Sonnet accepts this task.**
If scroll-offset bug found → escalate to Sonnet for the coordinate fix.

---

### S19-2 — Draw signature modal (canvas, smoothing, typed fallback) 🔵 Sonnet

**Context**: The old SignTool had a canvas draw modal. WorkspaceShell S18 replaced it with typed-name only. Restore the draw option as the primary mode, with typed name as the fallback tab.

**Modal layout** (matches decisions.md 2026-03-13 modal decision):
- `<640px`: full-screen bottom sheet (`h-[90dvh]`, `rounded-t-2xl`)
- `≥640px`: centred dialog (`max-w-[520px]`, dark surface `rgba(11,13,20,.96)`, `border border-[--bord]`, `rounded-2xl`)
- Backdrop: `fixed inset-0 bg-black/60 backdrop-blur-sm z-50`

**Tabs inside modal**:
- `Draw` (default) — canvas draw surface
- `Type` — existing typed-name input (move current S18 naming UI here)

**Draw tab canvas**:
- Canvas fills modal body (`width: 100%`, `height: 240px` desktop / `height: 180px` mobile)
- Background: `rgba(255,255,255,.04)` with `rounded-xl border border-[--bord2]`
- Pointer events: `mousedown/mousemove/mouseup` + `touchstart/touchmove/touchend` with `preventDefault`
- Stroke: `#f4f6fc` (var --tx), `lineWidth: 2.5`, `lineCap: 'round'`, `lineJoin: 'round'`
- **Line smoothing**: use Catmull-Rom to Bezier conversion on each stroke segment (see S19-3)
- Clear button (bottom-left): resets canvas
- Confirm button (bottom-right, indigo): disabled until at least one stroke point exists

**Output**: when Confirm pressed in Draw tab, export canvas as PNG DataURL → pass to `SigEntry` as `drawingDataUrl` field. In Type tab, pass `text` field as before.

**SigEntry type extension** (in `lib/pdf/types.ts`):
```ts
export interface SigEntry {
  id: string
  // one of:
  text?: string          // typed name
  drawingDataUrl?: string  // PNG from canvas
  // placement:
  page: number
  xPct: number
  yPct: number
  widthPct: number
}
```

**New file**: `app/app/components/SignatureModal.tsx` (~220 lines max)
Props:
```ts
interface SignatureModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (sig: Pick<SigEntry, 'text' | 'drawingDataUrl'>) => void
}
```

**WorkspaceShell changes**:
- Replace the inline naming phase with `<SignatureModal>` open on "Add Signature" button click
- On modal confirm → enter placing mode with the sig payload
- Remove the current idle/naming/placing 3-phase inline UI; simplify to idle (button + count) / placing (crosshair instruction)

---

### S19-3 — Signature line smoothing (Catmull-Rom → Bezier) 🔵 Sonnet (merged into S19-2)

**Scope**: inside `SignatureModal.tsx` canvas draw handler only. No new files.

**Algorithm** (add as a pure utility inside the file — ~30 lines):
```ts
// Collect raw points per stroke in a points[] array
// On each new point, redraw the stroke using bezierCurveTo:
function drawSmooth(ctx: CanvasRenderingContext2D, pts: {x:number,y:number}[]) {
  if (pts.length < 2) return
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length - 1; i++) {
    const cpX = (pts[i].x + pts[i+1].x) / 2
    const cpY = (pts[i].y + pts[i+1].y) / 2
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpX, cpY)
  }
  const last = pts[pts.length - 1]
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
}
```
Clear and redraw full stroke on every `mousemove`/`touchmove`. This removes choppiness without external libraries.

---

### S19-4 — Drag, reposition, and delete placed signatures 🟡 Haiku

**Context**: currently `sigs` array is write-only — no way to move or remove a placed sig. This task adds overlay management.

**Signature overlays** (in `CanvasArea` / `WorkspaceShell`):
- For each `SigEntry` in `sigs[]`, render a positioned `div` over the corresponding PDF page
- Position: `left: xPct%`, `top: yPct%`, `width: widthPct%` — absolute within the page card
- Content: if `drawingDataUrl` → `<img>` tag; if `text` → serif italic span (same preview as S18 typed preview)
- **Drag**: `mousedown` on overlay → track `mousemove` delta → update `xPct/yPct` on `mouseup` (clamp 0–95%)
- **Delete**: small `×` button top-right of each overlay, `opacity-0 group-hover:opacity-100`; click removes from `sigs[]`
- **Resize handle** (Pro only — same gate as S18): bottom-right corner drag updates `widthPct` (min 10%, max 80%)

**State change**: `sigs` array must become properly updatable:
```ts
// update position
setSigs(prev => prev.map(s => s.id === id ? {...s, xPct, yPct} : s))
// delete
setSigs(prev => prev.filter(s => s.id !== id))
```

**Overlay z-index**: overlays sit above the PDF canvas but below the crosshair placement overlay.

**File to create**: `app/app/components/SigOverlay.tsx` (~120 lines)
Props: `{ sig: SigEntry, onMove: (id, xPct, yPct) => void, onDelete: (id) => void, isPro: boolean }`

**🟡 Haiku self-report required. Sonnet review checklist: deps arrays, no direct Map mutation, drag delta clamping logic.**

---

### S19-5 — Page rail syncs active page on canvas scroll 🟡 Haiku

**Context**: clicking a page rail thumbnail scrolls the canvas to that page (S17). The reverse is not implemented — scrolling the canvas does not update the active thumbnail border.

**Fix**: `IntersectionObserver` on each page div in the canvas scroll container.

In `WorkspaceShell.tsx`:
```ts
useEffect(() => {
  if (!pageRefsMap.current.size) return
  const observer = new IntersectionObserver(
    entries => {
      // find the entry with highest intersectionRatio
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) {
        const pageNum = [...pageRefsMap.current.entries()]
          .find(([, el]) => el === visible.target)?.[0]
        if (pageNum !== undefined) setActivePage(pageNum)
      }
    },
    { root: canvasScrollRef.current, threshold: [0.3, 0.6] }
  )
  pageRefsMap.current.forEach(el => observer.observe(el))
  return () => observer.disconnect()
}, [pdfDoc]) // re-run when PDF loads
```

Requires: `canvasScrollRef` = `useRef<HTMLDivElement>` on the canvas scroll container div (add if not present).

**Acceptance**: scroll down through a 3-page PDF → active thumbnail border moves to match the most-visible page.

**🟡 Haiku self-report required. Sonnet review checklist: observer cleanup in effect return, `canvasScrollRef` correctly assigned, `pdfDoc` dep correct.**

---

### S19-6 — Annotate tool wiring + checkmark tool 🔵 Sonnet

**Context**: `AnnotateSubRail` (Yellow/Green/Pink/Note/Flag) renders in WorkspaceShell from S16/S17. `lib/pdf/annotate.ts` + `applyAnnotations()` written in S11. They are not connected.

**Scope**:
- Highlight mode (Yellow/Green/Pink): clicking a text item in the PDF creates a highlight annotation
- Note mode: clicking anywhere on the PDF creates a sticky note (position + text)
- Annotations stored in `annotations: Annotation[]` state in WorkspaceShell
- Download handler: call `applyAnnotations()` before pdf-lib save if `annotations.length > 0`

**Checkmark tool additions** (bolt-on to this task):
- New `CheckAnnotation` type in `lib/pdf/types.ts`: `{ type: 'check', id: string, page: number, xPct: number, yPct: number }`
- New `Check` tab in `AnnotateSubRail` (after Flag) — use a ✓ icon
- In check mode: clicking anywhere on the canvas places a `CheckAnnotation`
- Rendered as a draggable/deletable overlay (same pattern as SigOverlay from S19-4 — reuse the component, different content)
- `applyAnnotations()` in `annotate.ts` must embed ✓ at the correct position (use pdf-lib drawText with ✓ character, TimesRoman, size 20pt)

**Files to change**:
1. `WorkspaceShell.tsx` — add `annotations` state, pass active annotate sub-tool down to canvas
2. `PdfTextLayer.tsx` — on click in highlight mode → create `HighlightAnnotation` entry
3. `CanvasArea` / canvas layer — on click in note/check mode → create annotation at click position
4. `lib/pdf/types.ts` — add `CheckAnnotation` type
5. `lib/pdf/annotate.ts` — extend `applyAnnotations()` to handle `CheckAnnotation`
6. Download handler — integrate `applyAnnotations()` from `lib/pdf/annotate.ts`

Read `lib/pdf/annotate.ts` and `lib/pdf/types.ts` fully before writing any of this.

---

### S19-7 — code-reviewer + browser verification (mandatory gate)

After all tasks above:
1. Run `npm run dev`
2. Verify draw modal opens, smoothed stroke renders, signature places correctly
3. Drag a placed sig → confirm it moves
4. Delete a placed sig → confirm it disappears from overlay and from downloaded PDF
5. Scroll a 3-page PDF → confirm page rail active border tracks scroll
6. Place a highlight annotation → download → confirm it appears in PDF
7. Run `code-reviewer` agent on: `WorkspaceShell.tsx`, `SignatureModal.tsx`, `SigOverlay.tsx`
8. Address all CRITICAL and HIGH findings

Only after all checks pass: update sprint.md S19 → COMPLETE.

---
