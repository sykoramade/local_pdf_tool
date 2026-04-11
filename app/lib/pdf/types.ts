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
  itemId?: string     // ExtractedTextItem.id — used for toggle deduplication
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

// ─── Image types ─────────────────────────────────────────────────────────────

/** A raster image placed on a page. xPct/yPct are the CENTER point (0–100). */
export interface ImageEntry {
  id: string
  dataUrl: string
  mimeType: 'png' | 'jpeg'
  page: number
  xPct: number
  yPct: number
  widthPct: number
}

// ─── Canvas layer types (S29 canvas pivot) ───────────────────────────────────

/** Data exported from a Fabric Textbox for PDF save. */
export interface FabricTextboxExport {
  text: string
  anchorItem: ExtractedTextItem          // pdfX/pdfY used for text placement
  blockBounds: {                          // canvas-pixel coords of original block
    left: number
    top: number
    width: number
    height: number
  }
  fontSize: number                        // canvas px (divide by scale → PDF pt)
  fontFamily: string
  fontWeight: string                      // 'normal' | 'bold'
  fontStyle: string                       // 'normal' | 'italic'
  fill: string                            // hex color string e.g. '#000000'
}

/** Ref handle exposed by CanvasTextLayer for collecting edits at export time. */
export interface FabricLayerRef {
  getTextboxes: () => FabricTextboxExport[]
}

/**
 * A committed canvas text edit — persisted in WorkspaceShell across tool switches.
 * Mirrors FabricTextboxExport so it can be used as a download fallback
 * when CanvasTextLayer is unmounted (edit tool not active).
 */
export interface CommittedEdit {
  text: string
  fontSize: number                        // canvas px (divide by scale → PDF pt)
  fontFamily: string
  fontWeight: string                      // 'normal' | 'bold'
  fontStyle: string                       // 'normal' | 'italic'
  fill: string                            // hex color string e.g. '#000000'
  anchorItem: ExtractedTextItem
  blockBounds: { left: number; top: number; width: number; height: number }
}
