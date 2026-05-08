Here is the full deep-dive technical and UX comparison, based on live inspection of both tools' DOM, Fabric.js canvas state, React fiber tree, PDF.js operator lists, and event handler internals.

---

## 🔬 Deep Technical Comparison: PDFNoLimit vs LocalPDF

### Architecture Overview

Both tools use **Fabric.js** as their interactive editing layer on top of a PDF rendered by **PDF.js**. However, the architectural decisions diverge dramatically in how they glue these pieces together — and those divergences explain every UX difference you're experiencing.

---

## 1. PDF Rendering Pipeline

**PDFNoLimit** renders the entire PDF page using `page.render()` and encodes the result as a full-resolution JPEG. That JPEG is set as `backgroundImage` on the Fabric canvas (at 1785×2525 px for a ~2× DPR render). The Fabric canvas itself is the *only* canvas element present — the background and all interactive objects live in one unified surface. This is why text, images, and vector elements all look and interact consistently: they are all Fabric objects sitting above the same composited background.

**LocalPDF** uses a *two-canvas* approach. A separate `<canvas class="block">` renders the PDF background via PDF.js directly. The Fabric canvas (`lower-canvas` + `upper-canvas`) sits as an absolutely-positioned overlay on top of it. This split works but introduces a seam: the Fabric layer only knows about objects it explicitly created. Anything it didn't create — like the signature — is invisible to it.

---

## 2. Text Object Interaction Model — The "Ghost Layer"

Both tools share the same clever technique, but with a critical difference in execution:

Both extract text via `page.getTextContent()` and create one Fabric `i-text` object per text span, positioned to exactly overlay the corresponding text in the background PDF render. These objects start as **invisible ghosts**: `opacity: 0`, `selectable: false`, `evented: false` (LocalPDF leaves `evented: true` by default — a minor variation).

When you click in the document, a custom `mouse:down` event handler performs a manual spatial hit-test (since `evented: false` means Fabric won't auto-detect them), finds the nearest text object at the click coordinates, and activates it.

**Where they diverge:**

| Behavior | PDFNoLimit | LocalPDF |
|---|---|---|
| On click | Ghost → `opacity: 1`, `selectable: true`, `evented: true` → **selected state** | Ghost → `opacity: 1`, `isEditing: true` immediately → **edit mode** |
| Interaction flow | Click selects → double-click or Enter enters edit mode | Single click jumps straight into editing cursor |
| Deselect | Object resets to `opacity: 0`, `selectable: false` | Object resets to `opacity: 0`, `selectable: false` |
| Feel | Two-stage (select → edit), more controlled | One-stage (jump to edit), faster for power typing but skips "selection" semantics |

The PDFNoLimit two-stage approach matters because it allows you to *select and move* text blocks in Select mode before committing to an edit. LocalPDF's click-to-edit shortcut means the selection-state phase is completely absent, which is why you can't drag a text block or apply formatting to a whole block before entering it.

---

## 3. Marquee (Rubber-Band) Selection

**PDFNoLimit** sets `fabricCanvas.selection = true` and all activated objects get `selectable: true` while active. This means Fabric's built-in marquee-selection rectangle works normally — drag-select across an area and all text objects it intersects become a selection group.

**LocalPDF** has `fabricCanvas.selection = false` hard-set in both "Text" and "Select" modes. Even in "Select" mode, switching it to Select doesn't change `fc.selection` or make any object `selectable: true`. The result: drag-selecting does absolutely nothing. The Fabric API for multi-object selection is present but deliberately turned off and never re-enabled on mode switch.

**Fix required:** In LocalPDF's "Select" mode handler, you need to set `fc.selection = true` and also call `obj.set({ selectable: true })` on all objects so they can participate in the rubber-band selection.

---

## 4. Undo / Redo

**PDFNoLimit** uses a **full-snapshot undo** strategy. On every meaningful change (text edits, image moves, etc.), it serializes the entire Fabric canvas to JSON via `canvas.toJSON()` and pushes the string to `fc.hUndo[]`. Undo pops the last snapshot and calls `canvas.loadFromJSON()`. This is simple and reliable — each snapshot was ~955 KB in your document — but memory-expensive at scale.

**LocalPDF** has a React state array at depth-17 hook 47 (`undoStack: []`) and the Undo/Redo buttons exist in the UI, but **the undo stack is never populated**. Inspecting the Fabric event listeners reveals only two registered events: `mouse:down` and `text:editing:exited`. There is no `object:modified`, `object:added`, `object:removed`, or any other listener that pushes a snapshot onto the undo stack. The `text:editing:exited` handler resets the ghost-layer properties and calls `renderAll()` — but never saves state. After typing "X" into a text field, `undoStack.length` remains 0, the Undo button stays disabled, and Ctrl+Z does nothing.

**Fix required:** Register an `object:modified` listener on the Fabric canvas that serializes the canvas state (or at minimum the changed object's state) and pushes it to the undo stack via a React dispatch call. Also hook `text:editing:exited` to push the pre-edit snapshot. Mirror this with a `redo` stack that the Undo action drains into.

---

## 5. Image / Signature Detection — The Core Missing Feature

This is the most architecturally significant gap.

**PDFNoLimit** uses `page.getOperatorList()` in addition to `getTextContent()`. The operator list is a low-level stream of PDF rendering commands. It scans for **op code 85 = `paintXObject`** calls, which are how PDFs embed raster images (XObjects). For each one, it reads the transformation matrix applied immediately before the `paintXObject` call to compute the image's canvas-space position and dimensions. It then fetches the actual image pixels and creates a real Fabric `Image` object at that position:

```
left: 171, top: 814, width: 179, height: 90
selectable: true, evented: true, hasControls: true
```

The result: the signature appears as a **first-class, selectable, draggable, resizable Fabric image object**, complete with corner handles and a "Replace image" button in the toolbar.

**LocalPDF** exclusively calls `page.getTextContent()`, which returns only text spans. The PDF.js text content API has **no concept of images**. The signature XObject (`img_p0_2`) is present in the PDF's operator stream (confirmed by live inspection: `paintXObject args: ["img_p0_2", 478, 240]` at op index 1061), but LocalPDF never calls `getOperatorList()`, so it never discovers it. The Fabric canvas has 0 image objects. Clicking the signature area — in either Text or Select mode — does nothing because there is no Fabric object there to interact with. The signature is visible only because the PDF.js background canvas rendered it, but the editing layer has no awareness of it.

**Fix required:**

```js
// After getTextContent(), also call:
const ops = await page.getOperatorList();

// Scan for paintXObject (op 85)
for (let i = 0; i < ops.fnArray.length; i++) {
  if (ops.fnArray[i] === pdfjsLib.OPS.paintXObject) {
    const name = ops.argsArray[i][0]; // e.g. "img_p0_2"
    // Backtrack to find the CTM (transform matrix) applied before this call
    // ops.argsArray[i-2] and ops.argsArray[i-4] contain the scale+translate matrices
    // Compute canvas-space x, y, w, h from those matrices
    // Load the image via page.objs.get(name) and create a fabric.Image
    const img = new fabric.Image(imgElement, {
      left: canvasX, top: canvasY,
      scaleX: canvasW / imgElement.width,
      scaleY: canvasH / imgElement.height,
      selectable: true, evented: true
    });
    fabricCanvas.add(img);
  }
}
```

The matrix math: the PDF transform sequence is usually `setTransform(scaleX, 0, 0, scaleY, 0, 0)` followed by `transform(1, 0, 0, 1, translateX, translateY)` or vice versa. The canvas scale factor (canvas px per PDF pt) converts those PDF-space values to Fabric canvas coordinates.

---

## 6. React State / Fabric Canvas Sync

LocalPDF's React state (the `items` array at hook 22, containing 161 text objects with their `str`, `canvasX`, `canvasY`, etc.) is **never updated when text is edited in the Fabric canvas**. After typing in a text field, the Fabric object has `text: "XGründungskosten..."` but the React items array still shows the original. This creates a silent desync. If anything causes a re-render that re-initializes the Fabric canvas from the React items array, the user's edits would be silently lost.

---

## Summary of Actionable Differences

| Feature | PDFNoLimit | LocalPDF | What to fix in LocalPDF |
|---|---|---|---|
| **PDF rendering** | JPEG backgroundImage in Fabric | Separate background canvas | Either approach works; keep as-is |
| **Text click UX** | Click → select, then edit | Click → immediate edit | Add a "selected but not editing" state |
| **Marquee select** | ✅ Working (`fc.selection = true`) | ❌ Broken (`fc.selection = false` always) | Set `fc.selection = true` in Select mode; set all objects `selectable: true` |
| **Image XObject extraction** | ✅ Via `getOperatorList()` | ❌ Completely absent | Add `getOperatorList()` scan for `paintXObject` (op 85) |
| **Signature selectable** | ✅ Full Fabric Image object | ❌ Not detectable at all | Implement image extraction above |
| **Undo/Redo** | ✅ Full JSON snapshots in `hUndo[]` | ❌ Stack exists but never populated | Add `object:modified` + `text:editing:exited` listeners that push snapshots |
| **State sync** | Canvas IS the state | Canvas and React state are desynced | Push text changes back to React state on `text:editing:exited` |

The smoothness of PDFNoLimit comes from three things working together: a unified canvas that owns everything, a two-stage select→edit flow that gives users a "grip" moment before committing, and a complete object model that doesn't leave PDF content (like images) invisible to the editor. Each of those has a concrete implementation path in LocalPDF.