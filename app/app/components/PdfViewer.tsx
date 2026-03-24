'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ExtractedTextItem, EditMap, FieldData, SigEntry, Annotation, TextHighlight, StickyNote, CheckAnnotation, ImageEntry } from '@/lib/pdf/types'
import PdfTextLayer from './PdfTextLayer'
import SigOverlay from './SigOverlay'
import AnnotationOverlay from './AnnotationOverlay'
import ImageOverlay from './ImageOverlay'

interface PdfViewerProps {
  pdfBytes: Uint8Array
  scale?: number
  editMap: EditMap
  onEdit: (id: string, fieldData: FieldData) => void
  onTextItems?: (items: ExtractedTextItem[]) => void
  onLoad?: (pageCount: number) => void
  onFieldSelect?: (id: string) => void
  pageRefs?: React.MutableRefObject<Map<number, HTMLDivElement>>
  sigs?: SigEntry[]
  onSigMove?: (id: string, xPct: number, yPct: number) => void
  onSigDelete?: (id: string) => void
  isPro?: boolean
  annotateMode?: 'yellow' | 'green' | 'pink' | 'note' | 'check' | null
  annotations?: Annotation[]
  onAnnotate?: (ann: Annotation) => void
  onAnnotationMove?: (id: string, xPct: number, yPct: number) => void
  onAnnotationDelete?: (id: string) => void
  images?: ImageEntry[]
  onImageMove?: (id: string, xPct: number, yPct: number) => void
  onImageDelete?: (id: string) => void
}

interface PageData {
  pageNum: number
  width: number
  height: number
  items: ExtractedTextItem[]
}

const HIGHLIGHT_OVERLAY_COLORS: Record<string, string> = {
  yellow: 'rgba(251,191,36,0.35)',
  green: 'rgba(74,222,128,0.35)',
  pink: 'rgba(244,114,182,0.35)',
}

const PDF_ERRORS: Record<string, string> = {
  'No password given': 'This PDF is password-protected. Please unlock it first.',
  'Incorrect Password': 'Incorrect PDF password.',
  'Invalid PDF structure': 'This file appears to be corrupted or is not a valid PDF.',
  'Missing PDF': 'This file does not appear to be a valid PDF.',
}

function friendlyError(raw: string): string {
  for (const [key, msg] of Object.entries(PDF_ERRORS)) {
    if (raw.includes(key)) return msg
  }
  return 'Could not open this PDF. It may be corrupted, encrypted, or unsupported.'
}

export default function PdfViewer({
  pdfBytes,
  scale = 1.5,
  editMap,
  onEdit,
  onTextItems,
  onLoad,
  onFieldSelect,
  pageRefs,
  sigs,
  onSigMove,
  onSigDelete,
  isPro = false,
  annotateMode,
  annotations,
  onAnnotate,
  onAnnotationMove,
  onAnnotationDelete,
  images,
  onImageMove,
  onImageDelete,
}: PdfViewerProps) {
  const [pages, setPages] = useState<PageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map())
  // Keep a ref to the PDF.js doc so we can render after pages state settles
  const docRef = useRef<import('pdfjs-dist').PDFDocumentProxy | null>(null)

  // Renders all pages to their canvases — called after pages state update
  const renderPages = useCallback(async (pageData: PageData[]) => {
    const doc = docRef.current
    if (!doc) return
    for (const { pageNum } of pageData) {
      const canvas = canvasRefs.current.get(pageNum)
      if (!canvas) continue
      try {
        const page = await doc.getPage(pageNum)
        const vp = page.getViewport({ scale })
        canvas.width = vp.width
        canvas.height = vp.height
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx as any, viewport: vp }).promise
      } catch (err) {
        // Swallow RenderingCancelledException — happens when component unmounts mid-render
        if ((err as Error)?.name !== 'RenderingCancelledException') throw err
      }
    }
  }, [scale])

  // Trigger canvas render after pages state settles
  useEffect(() => {
    if (pages.length > 0) {
      renderPages(pages)
    }
  }, [pages, renderPages])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setPages([])

      const pdfjs = (await import('pdfjs-dist')) as typeof import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

      try {
        const doc = await pdfjs.getDocument({ data: pdfBytes.slice(0) }).promise
        if (cancelled) return

        docRef.current = doc
        const allItems: ExtractedTextItem[] = []
        const pageData: PageData[] = []

        for (let p = 1; p <= doc.numPages; p++) {
          const page = await doc.getPage(p)
          const viewport = page.getViewport({ scale })
          const textContent = await page.getTextContent()

          const items: ExtractedTextItem[] = textContent.items
            .filter((it): it is typeof it & { str: string } =>
              'str' in it && (it as { str: string }).str.trim().length > 0
            )
            .map((it, idx) => {
              const raw = it as {
                str: string
                fontName: string
                transform: number[]
                width: number
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tx = (pdfjs as any).Util.transform(viewport.transform, raw.transform)
              const canvasFontSize = Math.max(Math.abs(tx[3]), 4)
              const pdfFontSize = Math.max(Math.abs(raw.transform[3]), 4)

              return {
                id: `p${p}-${idx}`,
                pageNum: p,
                str: raw.str,
                fontName: raw.fontName || '',
                pdfX: raw.transform[4],
                pdfY: raw.transform[5],
                pdfWidth: raw.width,
                pdfFontSize,
                canvasX: tx[4],
                canvasY: tx[5] - canvasFontSize * 0.8,
                canvasWidth: Math.max(raw.width * scale, 4),
                canvasFontSize,
              }
            })

          allItems.push(...items)
          pageData.push({ pageNum: p, width: viewport.width, height: viewport.height, items })
        }

        if (cancelled) return
        setPages(pageData)
        setLoading(false)
        onTextItems?.(allItems)
        onLoad?.(pageData.length)
      } catch (err) {
        if (!cancelled) {
          setError(friendlyError((err as Error).message ?? ''))
        }
      }
    }

    load()
    return () => {
      cancelled = true
      docRef.current?.destroy()
      docRef.current = null
      pageRefs?.current.clear()
    }
  }, [pdfBytes, scale, onTextItems, onLoad, pageRefs])

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 py-6 px-4">
        {/* Skeleton pages — A4 proportions at default scale */}
        {[1, 2].map(i => (
          <div
            key={i}
            className="bg-white shadow-lg rounded-sm animate-pulse"
            style={{ width: 'min(816px, calc(100vw - 2rem))', aspectRatio: '1 / 1.414' }}
          >
            <div className="p-8 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-400">Loading PDF…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-xs">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <p className="text-xs text-gray-400">Use the ← Back button in the toolbar to try another file.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4">
      {pages.map(({ pageNum, width, height, items }) => {
        const pageEditCount = items.filter(
          item => editMap.has(item.id) && editMap.get(item.id)?.value !== item.str
        ).length

        return (
          <div
            key={pageNum}
            className="flex flex-col items-center gap-1 w-full"
            style={{ maxWidth: width }}
          >
            {pageEditCount > 0 && (
              <div className="self-end text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {pageEditCount} edit{pageEditCount !== 1 ? 's' : ''} on p.{pageNum}
              </div>
            )}
            <div
              ref={el => {
                if (el && pageRefs) pageRefs.current.set(pageNum, el)
              }}
              className="relative shadow-lg bg-white"
              style={{ width, height }}
            >
              <canvas
                ref={el => {
                  if (el) canvasRefs.current.set(pageNum, el)
                  else canvasRefs.current.delete(pageNum)
                }}
                width={width}
                height={height}
                className="block"
              />
              <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                <div style={{ position: 'relative', width, height, pointerEvents: 'all' }}>
                  <PdfTextLayer
                    items={items}
                    editMap={editMap}
                    onEdit={onEdit}
                    onFieldSelect={onFieldSelect}
                    scale={scale}
                    annotateMode={
                      annotateMode === 'yellow' || annotateMode === 'green' || annotateMode === 'pink'
                        ? annotateMode
                        : null
                    }
                    onHighlight={item => {
                      if (!onAnnotate) return
                      const hl: TextHighlight = {
                        type: 'highlight',
                        id: crypto.randomUUID(),
                        itemId: item.id,
                        pageNum,
                        colorIndex: annotateMode === 'green' ? 1 : annotateMode === 'pink' ? 2 : 0,
                        xPct: (item.canvasX / width) * 100,
                        yPct: (item.canvasY / height) * 100,
                        widthPct: (item.canvasWidth / width) * 100,
                        heightPct: ((item.canvasFontSize * 1.4) / height) * 100,
                      }
                      onAnnotate(hl)
                    }}
                  />
                </div>
              </div>
              {/* Signature overlays for this page */}
              {sigs && onSigMove && onSigDelete && sigs
                .filter(sig => sig.pageNum === pageNum)
                .map(sig => (
                  <SigOverlay
                    key={sig.id}
                    sig={sig}
                    onMove={onSigMove}
                    onDelete={onSigDelete}
                    isPro={isPro}
                  />
                ))}

              {/* Image overlays for this page */}
              {images && onImageMove && onImageDelete && images
                .filter(img => img.page === pageNum)
                .map(img => (
                  <ImageOverlay
                    key={img.id}
                    image={img}
                    onMove={onImageMove}
                    onDelete={onImageDelete}
                  />
                ))}

              {/* Annotation overlays for this page */}
              {annotations && annotations
                .filter(ann => ann.pageNum === pageNum)
                .map(ann => {
                  if (ann.type === 'highlight') {
                    const hl = ann as TextHighlight
                    return (
                      <div
                        key={hl.id}
                        style={{
                          position: 'absolute',
                          left: hl.xPct + '%',
                          top: hl.yPct + '%',
                          width: hl.widthPct + '%',
                          height: hl.heightPct + '%',
                          background: HIGHLIGHT_OVERLAY_COLORS[['yellow', 'green', 'pink'][hl.colorIndex] ?? 'yellow'],
                          pointerEvents: 'none',
                          zIndex: 3,
                        }}
                      />
                    )
                  }
                  if (ann.type === 'sticky-note' || ann.type === 'check') {
                    if (onAnnotationMove && onAnnotationDelete) {
                      return (
                        <AnnotationOverlay
                          key={ann.id}
                          annotation={ann as StickyNote | CheckAnnotation}
                          onMove={onAnnotationMove}
                          onDelete={onAnnotationDelete}
                        />
                      )
                    }
                    // Fallback: static render if no handlers provided
                    return (
                      <div
                        key={ann.id}
                        style={{
                          position: 'absolute',
                          left: ann.xPct + '%',
                          top: ann.yPct + '%',
                          pointerEvents: 'none',
                          zIndex: 3,
                        }}
                      >
                        {ann.type === 'sticky-note' ? (ann as StickyNote).text || '📝' : '✓'}
                      </div>
                    )
                  }
                  return null
                })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
