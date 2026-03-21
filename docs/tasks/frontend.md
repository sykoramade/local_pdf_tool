# Frontend Task Queue

Tasks assigned to the ui-builder agent.
Delete task when complete. Log any architecture decisions to docs/decisions.md first.

---

## SPRINT 17 — WorkspaceShell: Rich Edit Toolbar + PageRail Scroll

**Goal**: Implement the full rich text edit toolbar from `edit_bar.md` spec + PageRail scroll-to-page.

**Spec source**: `edit_bar.md` (repo root) — authoritative. Read it before touching L3Strip.
**V2 spec source**: `localpdf_v2.html` — authoritative for layout/styling.

**Pre-conditions met**:
- [x] edit_bar.md read and understood (toolbar HTML lines 199–250, history model lines 411–446)
- [x] WorkspaceShell.tsx read in full (959 lines)
- [x] PdfViewer.tsx read in full (235 lines)
- [x] PdfTextLayer.tsx read in full (137 lines)
- [x] types.ts read — EditMap currently `Map<string, string>`
- [x] save.ts read — iterates `editMap.entries()` as `[id, newText: string]`

**Scope boundary — NOT in this sprint**:
- Transform control (explicitly excluded by MD)
- Sign tool / Annotate tool workspace embedding
- Full word selection / multi-chunk selection merge
- Compress L3 strip toggle

---

### F17-0 — Type model update (blocking — do this first)

Current: `EditMap = Map<string, string>`
Target: `EditMap = Map<string, FieldData>` where:

```ts
export interface FieldData {
  value: string       // replacement text
  family: string      // e.g. 'Helvetica', 'Arial'
  size: number        // font size in pt
  color: string       // hex string e.g. '#000000'
  bold: boolean
  italic: boolean
  underline: boolean
}
```

**Files to change**:

1. **`app/lib/pdf/types.ts`** — add `FieldData` interface, update `EditMap` type alias to `Map<string, FieldData>`

2. **`app/lib/pdf/save.ts`** — update loop:
   ```ts
   for (const [id, fieldData] of Array.from(editMap.entries())) {
     if (!fieldData.value.trim()) continue
     // ...use fieldData.value wherever newText was used
   ```
   Also pass `fieldData.size` for font size (use `fieldData.size || item.pdfFontSize || 12`).
   Color: parse `fieldData.color` hex → `rgb(r, g, b)`. If empty/default use `rgb(0,0,0)`.

3. **`app/app/components/PdfViewer.tsx`** — update all `editMap.get(item.id)` references:
   - `editMap.get(item.id)?.value ?? item.str` for text display
   - `editMap.has(item.id) && editMap.get(item.id)?.value !== item.str` for isEdited check

4. **`app/app/components/PdfTextLayer.tsx`** — same pattern:
   - `const currentText = editMap.get(item.id)?.value ?? item.str`
   - `const isEdited = editMap.has(item.id) && editMap.get(item.id)?.value !== item.str`

5. **`app/app/workspace/WorkspaceShell.tsx`** — update `handleEdit`:
   ```ts
   const handleEdit = useCallback((id: string, fieldData: FieldData) => {
     setEditMap(prev => new Map(prev).set(id, fieldData))
   }, [])
   ```
   Signature change propagates — update all `onEdit` prop types in the chain.

---

### F17-1 — Rich edit toolbar

**Spec (from edit_bar.md lines 199–250 — derive exact styling from there):**
- Font family select: `['Helvetica','Arial','Times New Roman','Courier','Georgia']`
- Size stepper: `−` / `+` buttons, display current size
- Color picker: `<input type="color">` + hex display
- Bold / Italic / Underline toggles
- Edit count badge: `{n} edit{n !== 1 ? 's' : ''}` — show when `editCount > 0`
  - Style: `background: rgba(99,102,241,.15); color: #818cf8`
- Undo button (single step): `↩` — disabled when at start of history
- Redo button: `↷` — disabled when at end of history
- Keyboard: `Cmd/Ctrl+Z` → undo, `Cmd/Ctrl+Shift+Z` → redo

**History stack (from edit_bar.md lines 411–446):**
```ts
// In WorkspaceShell:
const histRef = useRef<EditMap[]>([new Map()])  // snapshot array
const [hIdx, setHIdx] = useState(0)             // drives button states

function hPush(nextMap: EditMap) {
  const newHist = histRef.current.slice(0, hIdx + 1)
  newHist.push(nextMap)
  histRef.current = newHist
  setHIdx(newHist.length - 1)
}
function histUndo() {
  if (hIdx === 0) return
  const newIdx = hIdx - 1
  setHIdx(newIdx)
  setEditMap(histRef.current[newIdx])
}
function histRedo() {
  if (hIdx >= histRef.current.length - 1) return
  const newIdx = hIdx + 1
  setHIdx(newIdx)
  setEditMap(histRef.current[newIdx])
}
```
Call `hPush(nextMap)` from `handleEdit` after building the new map.

**Field selection sync:**
```ts
// In WorkspaceShell:
const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
```
- Pass `onFieldSelect={setSelectedFieldId}` through WorkspaceShell → CanvasArea → PdfViewer → PdfTextLayer
- In PdfTextLayer: call `onFieldSelect?.(item.id)` on field click (alongside `setActiveId`)
- EditToolbar reads `editMap.get(selectedFieldId ?? '')` to sync controls to selected field

**Files to change / create**:

1. **NEW: `app/app/components/EditToolbar.tsx`** (~200 lines max)
   Extract the entire L3Strip edit branch into this component.
   Props:
   ```ts
   interface EditToolbarProps {
     selectedField: FieldData | null
     editCount: number
     canUndo: boolean
     canRedo: boolean
     onFieldChange: (patch: Partial<FieldData>) => void
     onUndo: () => void
     onRedo: () => void
   }
   ```
   `onFieldChange` patches the selected field's FieldData and calls through to handleEdit.

2. **`app/app/workspace/WorkspaceShell.tsx`**:
   - Add `histRef`, `hIdx`, `histUndo`, `histRedo`, `hPush`
   - Add `selectedFieldId` state
   - Update `handleEdit(id, fieldData)` signature
   - Update L3Strip edit branch: render `<EditToolbar>` with proper props
   - Pass `onFieldSelect={setSelectedFieldId}` to CanvasArea
   - Add keyboard listener: `useEffect` with `keydown` for `Cmd+Z` / `Cmd+Shift+Z`

3. **`app/app/components/PdfViewer.tsx`**:
   - Add `onFieldSelect?: (id: string) => void` prop
   - Update `onEdit` prop type: `(id: string, fieldData: FieldData) => void`
   - Pass `onFieldSelect` to `PdfTextLayer`
   - Add optional `pageRefs?: React.MutableRefObject<Map<number, HTMLDivElement>>` prop (F17-2)

4. **`app/app/components/PdfTextLayer.tsx`**:
   - Add `onFieldSelect?: (id: string) => void` prop
   - Call `onFieldSelect?.(item.id)` on field click
   - Update `onEdit` prop type
   - Pass `FieldData` to parent on blur: construct FieldData from current `editMap.get(id)` merging new value

---

### F17-2 — PageRail scroll-to-page

**Changes:**

1. **`app/app/components/PdfViewer.tsx`** — already listed above, add:
   ```ts
   pageRefs?: React.MutableRefObject<Map<number, HTMLDivElement>>
   ```
   In page render loop, assign each page wrapper div ref:
   ```tsx
   ref={el => {
     if (el && pageRefs) pageRefs.current.set(pageNum, el)
   }}
   ```
   On cleanup / pages reset: `pageRefs?.current.clear()`

2. **`app/app/workspace/WorkspaceShell.tsx`**:
   - Add `const pageRefsMap = useRef<Map<number, HTMLDivElement>>(new Map())`
   - Pass `pageRefs={pageRefsMap}` to `<PdfViewer>` (edit branch only)
   - Update `handlePageClick`:
     ```ts
     const handlePageClick = useCallback((n: number) => {
       setActivePage(n)
       const el = pageRefsMap.current.get(n)
       el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
     }, [])
     ```

**Acceptance**:
- Load multi-page PDF → click page 3 in PageRail → canvas scrolls to page 3, thumbnail 3 gets teal border
- Click page 1 → scrolls back up

---

### F17-3 — Browser verification (mandatory before marking COMPLETE)

Per lessons-learned.md: TypeScript passing ≠ working.

1. `npm run dev`
2. Open `http://localhost:3000`
3. Drop a multi-page PDF (3+ pages) → navigate to `/workspace`
4. **Edit toolbar**:
   - Confirm hint shows initially (no badge, no undo/redo)
   - Click a text field → toolbar controls sync to that field's properties
   - Change font family → field updates
   - Change size → field updates
   - Toggle Bold → field updates
   - Badge shows correct edit count
   - Undo step → reverts one edit, badge count decreases
   - Redo step → re-applies edit
   - Keyboard `Cmd+Z` / `Cmd+Shift+Z` work
5. **PageRail**:
   - Page thumbnails render for all pages
   - Click page 2 → canvas scrolls to page 2, thumbnail 2 gets teal border
   - Click page 1 → scroll back to top
6. Check browser console — zero unhandled errors

**Only after all checks pass**: update sprint.md S17 → COMPLETE.

---

### F17-4 — code-reviewer agent (mandatory — WorkspaceShell is 959+ lines)

After browser-verified, run code-reviewer agent on:
- `WorkspaceShell.tsx`
- `PdfViewer.tsx`
- `PdfTextLayer.tsx`
- `EditToolbar.tsx`

Address all CRITICAL and HIGH findings before closing sprint.

---
