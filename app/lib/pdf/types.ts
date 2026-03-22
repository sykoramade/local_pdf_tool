/**
 * Shared types for PDF text extraction and editing.
 */

export interface ExtractedTextItem {
  id: string         // stable key: `p${pageNum}-${index}`
  pageNum: number
  str: string        // original text string

  // PDF coordinate space (bottom-left origin) — used by pdf-lib for save
  pdfX: number
  pdfY: number
  pdfWidth: number
  pdfFontSize: number

  // Canvas coordinate space (top-left origin) — used by overlay positioning
  canvasX: number
  canvasY: number
  canvasWidth: number
  canvasFontSize: number

  fontName: string   // raw PDF font name — passed to font-map
}

export interface FieldData {
  value: string       // replacement text
  family: string      // e.g. 'Helvetica', 'Arial'
  size: number        // font size in pt
  color: string       // hex string e.g. '#000000'
  bold: boolean
  italic: boolean
  underline: boolean
}

// Map of text item id → FieldData
export type EditMap = Map<string, FieldData>

// ─── Annotation types ────────────────────────────────────────────────────────

/** A highlight over a text item. Coordinates are % of page dimensions (0–100). */
export interface TextHighlight {
  type: 'highlight'
  id: string
  pageNum: number
  colorIndex: number  // 0=yellow, 1=green, 2=pink
  xPct: number
  yPct: number        // from top of page
  widthPct: number
  heightPct: number
}

/** A sticky note anchored to a point. xPct/yPct are top-left of the note box. */
export interface StickyNote {
  type: 'sticky-note'
  id: string
  pageNum: number
  text: string
  xPct: number
  yPct: number        // from top of page
}

/** A checkmark placed at a point on the page. xPct/yPct are % of page from top-left. */
export interface CheckAnnotation {
  type: 'check'
  id: string
  pageNum: number
  xPct: number
  yPct: number
}

export type Annotation = TextHighlight | StickyNote | CheckAnnotation

// ─── Signature types ────────────────────────────────────────────────────────

/** A signature entry that can be either typed text or a hand-drawn image. */
export interface SigEntry {
  id: string
  text?: string           // typed name (optional)
  drawingDataUrl?: string // PNG from canvas draw (optional)
  pageNum: number
  xPct: number
  yPct: number
  widthPct: number
}
