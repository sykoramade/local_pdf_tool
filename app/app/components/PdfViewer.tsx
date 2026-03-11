'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ExtractedTextItem, EditMap } from '@/lib/pdf/types'
import PdfTextLayer from './PdfTextLayer'

interface PdfViewerProps {
  pdfBytes: Uint8Array
  scale?: number
  editMap: EditMap
  onEdit: (id: string, text: string) => void
  onTextItems?: (items: ExtractedTextItem[]) => void
}

interface PageData {
  pageNum: number
  width: number
  height: number
  items: ExtractedTextItem[]
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
      const page = await doc.getPage(pageNum)
      const vp = page.getViewport({ scale })
      canvas.width = vp.width
      canvas.height = vp.height
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx as any, viewport: vp }).promise
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
                canvasY: tx[5] - canvasFontSize,
                canvasWidth: Math.max(raw.width * scale, 4),
                canvasFontSize,
              }
            })

          allItems.push(...items)
          pageData.push({ pageNum: p, width: viewport.width, height: viewport.height, items })
        }

        if (cancelled) return
        docRef.current = doc
        setPages(pageData)
        setLoading(false)
        onTextItems?.(allItems)
      } catch (err) {
        if (!cancelled) {
          setError(friendlyError((err as Error).message ?? ''))
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [pdfBytes, scale, onTextItems])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">📄</div>
          <p className="text-sm">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        <div className="text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm max-w-xs">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4">
      {pages.map(({ pageNum, width, height, items }) => (
        <div
          key={pageNum}
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
                scale={scale}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
