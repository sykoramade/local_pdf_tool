# Frontend Task Queue

Tasks assigned to the ui-builder agent.
Delete task when complete. Log any architecture decisions to docs/decisions.md first.

---

## SPRINT 16 — WorkspaceShell: Wire Real Tool Components into CanvasArea

**Goal**: Replace the `"PDF canvas — Sprint 17"` placeholder in `WorkspaceShell.tsx` with
conditional rendering of the actual tool components. The shell layout is complete and correct per V2.
This task is purely the CanvasArea wiring.

**Pre-conditions met**:
- [x] localpdf_v2.html read and understood
- [x] WorkspaceShell.tsx read in full (791 lines)
- [x] lessons-learned.md read — no pipeline skips, no board updates before code is verified

---

### F16-1 — Audit existing tool component props and interfaces

Read each component to establish the exact props contract before wiring:

1. `components/PdfEditor.tsx` — what does it accept? (pdfDoc, file, onSave callback, etc.)
2. `app/app/sign/SignTool.tsx` — what does it accept?
3. `app/app/annotate/AnnotateTool.tsx` — what does it accept?
4. `components/CompressTool.tsx` — what does it accept?

**Output**: A comment block at the top of the CanvasArea section in WorkspaceShell.tsx
documenting exact prop contracts used, so future agents don't have to re-read.

---

### F16-2 — Wire CanvasArea hasFile=true branch

Replace the placeholder at ~line 616 of WorkspaceShell.tsx with conditional rendering.

**Logic**:
```
activeTool.key === 'edit'     → <PdfEditor ... />
activeTool.key === 'sign'     → <SignTool ... />
activeTool.key === 'annotate' → <AnnotateTool ... />
activeTool.key === 'compress' → <CompressTool ... />
activeTool.key === 'redact'   → PRO placeholder (styled consistent with V2, no separate component yet)
```

**Wrapper**: Keep the V2 canvas container div (`.pdf-doc` equivalent):
```
width:100%, maxWidth:440, background:#fff, borderRadius:2,
boxShadow:'0 4px 48px rgba(0,0,0,.75)', padding:'40px 38px 60px', minHeight:560
```
Each tool renders *inside* this container, inheriting the V2 card appearance.

**File state**: `loadedFile` (the ArrayBuffer/File from consumePendingFile or drop) must be
passed down to each tool. Confirm the exact state variable name in WorkspaceShell before wiring.

---

### F16-3 — PageRail: real page count

Currently PageRail renders with `pageCount` state. That state is set to `0` until a file loads.

After a file loads, the component that reads the PDF (PDF.js inside PdfEditor/PdfViewer)
knows the real page count. Options:

1. PdfEditor exposes an `onLoad` callback that receives `{ pageCount: number }` — WorkspaceShell
   sets state, PageRail re-renders with real count.
2. Use a shared ref passed to the tool component.

Prefer option 1 (callback prop) — it's explicit and testable.

**Acceptance**: PageRail shows correct page thumbnails (or at minimum correct count) when
a PDF is loaded in any tool.

---

### F16-4 — Browser verification (mandatory before marking COMPLETE)

Per lessons-learned.md: TypeScript passing ≠ working.

1. `npm run dev`
2. Open `http://localhost:3000`
3. Drop a PDF on the homepage hub → confirm it routes to `/workspace`
4. Confirm Edit tool renders real PDF editor (not placeholder text)
5. Switch to Compress → confirm CompressTool renders
6. Switch to Annotate → confirm AnnotateTool renders
7. Switch to Sign → confirm SignTool renders
8. Switch to Redact → confirm PRO placeholder renders (not a white box crash)
9. Confirm PageRail shows real page count after load
10. Check browser console — zero unhandled errors

**Only after all 10 pass**: update sprint.md S16 → COMPLETE.

---

### F16-5 — code-reviewer agent (mandatory — file is 791 lines, above 300-line threshold)

After wiring is complete and browser-verified, run code-reviewer agent on WorkspaceShell.tsx.
Address all CRITICAL and HIGH findings before closing sprint.

---

## Scope boundary

This sprint does NOT include:
- Building the Redact tool (future sprint per master-brief.html)
- Audience landing pages (/for/*)
- Font pack or IndexedDB font cache
- Feature-based usage gate changes

Those go to the backlog after this sprint closes.

---
