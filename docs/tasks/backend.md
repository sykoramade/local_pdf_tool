# Backend Task Queue

Tasks assigned to the pdf-builder agent (PDF processing logic).
Delete task when complete. Log any architecture decisions to docs/decisions.md first.

---

## SPRINT 7 — PDF processing for Signature Tool

### TASK B7-1: Grid snap utility — lib/pdf/grid.ts

**Goal:** Extract the implicit layout grid from a PDF page's text items so the UI can snap placed elements to baselines and columns.

**Input:** Array of `ExtractedTextItem` (already defined in lib/pdf/types.ts) for a given page.

**Output:**
```typescript
export interface PageGrid {
  baselines: number[]   // sorted unique Y positions (PDF space) where text sits
  columns: number[]     // sorted unique X positions where text blocks begin
  formFields: FormFieldRegion[]  // AcroForm field bounding boxes if present
}

export interface FormFieldRegion {
  x: number
  y: number
  width: number
  height: number
  name: string  // field name from PDF
}
```

**Implementation:**
- Extract Y values from text items, deduplicate within 4px tolerance (same baseline)
- Extract X values for line-starts (items where no other text item ends within 20px to their left)
- For AcroForm fields: use pdf-lib's `PDFDocument.getForm().getFields()` to read field positions
- Sort all arrays ascending
- Export: `extractPageGrid(textItems: ExtractedTextItem[], pdfDoc?: PDFDocument): PageGrid`

**Snap logic (also in this file):**
```typescript
export function snapToGrid(
  x: number,
  y: number,
  grid: PageGrid,
  threshold: number = 12
): { x: number; y: number; snapped: boolean }
```
- Find nearest baseline within threshold pixels — if found, snap Y
- Find nearest column within threshold pixels — if found, snap X
- Return snapped coordinates and whether snap occurred

---

### TASK B7-2: Signature embed — lib/pdf/signature.ts

**Goal:** Take a signature image (PNG from canvas) and embed it into a PDF page at specified coordinates.

**Coordinate contract from F7-1 UI:**
The SignTool UI stores placements as percentage coordinates (xPct, yPct, widthPct — 0 to 100 as % of on-screen page dimensions). The backend must convert these to PDF user-space before drawing.
- `pdf_x = (xPct / 100) * page.getWidth()`
- Aspect ratio of the signature image must be preserved when computing height from width.
- Y origin flip: PDF Y=0 is bottom-left, browser Y=0 is top-left.
  - `pdf_y = page.getHeight() - (yPct / 100) * page.getHeight() - sig_height_pdf`

**Interface:**
```typescript
// Matches the SignaturePlacement type exported from app/sign/SignTool.tsx
export interface SignaturePlacementInput {
  pageNum: number       // 1-indexed (matches SignTool's pageNum field)
  xPct: number          // 0–100, centre x as % of page width
  yPct: number          // 0–100, centre y as % of page height
  widthPct: number      // 0–100, width as % of page width
  dataUrl: string       // canvas.toDataURL('image/png')
}

export async function applySignatures(
  pdfBytes: Uint8Array,
  placements: SignaturePlacementInput[]
): Promise<Uint8Array>
```

**Implementation:**
- Load PDF with `PDFDocument.load(pdfBytes)`
- For each placement: `pdfDoc.embedPng(pngBytes)` → `page.drawImage()`
- Coordinate conversion: percentage → PDF units (see above)
- Use a single shared `pctToPdfCoords()` utility — do NOT duplicate this formula
- Return serialised PDF bytes

**Coordinate utility (lib/pdf/coords.ts — new shared file):**
```typescript
export function canvasToPdfX(canvasX: number, scale: number): number
export function canvasToPdfY(canvasY: number, scale: number, pageHeightPdf: number, elementHeightCanvas: number): number
export function pdfToCanvasX(pdfX: number, scale: number): number
export function pdfToCanvasY(pdfY: number, scale: number, pageHeightPdf: number): number
// New — used by signature tool:
export function pctToPdfCoords(
  xPct: number, yPct: number, widthPct: number,
  pageWidthPdf: number, pageHeightPdf: number,
  sigAspectRatio: number  // sig image naturalWidth / naturalHeight
): { x: number; y: number; width: number; height: number }
```
This file must be created and used by ALL future annotation features — no inline coordinate math anywhere else.

---

## SPRINT 8 — PDF Split (after Sprint 7 ships)

### TASK B8-1: PDF Split — lib/pdf/split.ts

**Goal:** Split a PDF into individual pages or extract a user-selected range.

```typescript
export interface SplitResult {
  files: { name: string; bytes: Uint8Array }[]
}

export async function splitPdf(
  pdfBytes: Uint8Array,
  mode: 'all-pages' | 'range',
  range?: { start: number; end: number }  // 1-indexed, inclusive
): Promise<SplitResult>
```

- `all-pages`: one output PDF per page, named `page-1.pdf`, `page-2.pdf`, etc.
- `range`: single output PDF containing pages start–end
- Use `PDFDocument.create()` + `copyPages()` pattern (same as merge.ts)
- Return array of `{ name, bytes }` — UI handles download of each

---
