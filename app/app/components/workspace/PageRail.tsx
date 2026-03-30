'use client'

import { useRef, useEffect } from 'react'

export default function PageRail({
  pageCount,
  activePage,
  onPageClick,
  onAddPage,
  pdfBytes,
}: {
  pageCount: number
  activePage: number
  onPageClick: (n: number) => void
  onAddPage?: (afterPage: number) => void
  pdfBytes?: Uint8Array | null
}) {
  const count = pageCount > 0 ? pageCount : 1  // always show at least 1 placeholder
  const thumbRefs = useRef<Map<number, HTMLCanvasElement>>(new Map())

  useEffect(() => {
    if (!pdfBytes || pageCount === 0) return
    let cancelled = false

    async function renderThumbs() {
      const pdfjs = (await import('pdfjs-dist')) as typeof import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
      const doc = await pdfjs.getDocument({ data: pdfBytes!.slice(0) }).promise
      if (cancelled) { doc.destroy(); return }

      for (let p = 1; p <= doc.numPages; p++) {
        if (cancelled) break
        const canvas = thumbRefs.current.get(p)
        if (!canvas) continue
        const page = await doc.getPage(p)
        const vp = page.getViewport({ scale: 0.15 })
        canvas.width = vp.width
        canvas.height = vp.height
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx as any, viewport: vp }).promise
      }

      if (!cancelled) doc.destroy()
    }

    renderThumbs().catch(() => {})
    return () => { cancelled = true }
  }, [pdfBytes, pageCount])

  return (
    <div
      style={{
        width: 64,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(0,0,0,.2)',
        padding: '10px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
      }}
    >
      {Array.from({ length: count }, (_, i) => i + 1).map(n => {
        const isActive = n === activePage
        return (
          <div
            key={n}
            onClick={() => pageCount > 0 && onPageClick(n)}
            style={{
              borderRadius: 4,
              border: isActive ? '1.5px solid #818cf8' : '1.5px solid rgba(255,255,255,.07)',
              background: 'rgba(255,255,255,.02)',
              aspectRatio: '1 / 1.414',
              cursor: pageCount > 0 ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              padding: 5,
              overflow: 'hidden',
              transition: 'border-color .15s',
            }}
          >
            {pdfBytes ? (
              <canvas
                ref={el => {
                  if (el) thumbRefs.current.set(n, el)
                  else thumbRefs.current.delete(n)
                }}
                style={{ width: '100%', height: 'auto', display: 'block', flex: 1 }}
              />
            ) : (
              /* Line stubs — shown before PDF loads */
              <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {[1, 0.55, 0.82, 0.68, 0.75].map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: idx === 0 ? 2 : 1.5,
                      background: idx === 0 ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.14)',
                      borderRadius: 1,
                      width: `${w * 100}%`,
                    }}
                  />
                ))}
              </div>
            )}
            <div
              style={{
                fontSize: 8,
                textAlign: 'center',
                color: isActive ? '#818cf8' : 'rgba(255,255,255,.2)',
                fontFamily: 'var(--font-mono)',
                transition: 'color .15s',
              }}
            >
              {n}
            </div>
          </div>
        )
      })}

      {/* Add blank page button — only shown when a PDF is loaded */}
      {pageCount > 0 && onAddPage && (
        <button
          onClick={() => onAddPage(pageCount)}
          title="Add blank page at end"
          style={{
            background: 'none',
            border: '1.5px dashed rgba(255,255,255,.15)',
            borderRadius: 4,
            color: 'rgba(255,255,255,.3)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '6px 0',
            textAlign: 'center',
            transition: 'border-color .15s, color .15s',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(129,140,248,.5)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#818cf8'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.15)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.3)'
          }}
        >
          +
        </button>
      )}
    </div>
  )
}
