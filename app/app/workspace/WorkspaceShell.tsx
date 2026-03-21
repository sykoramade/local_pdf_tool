'use client'

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { consumePendingFile } from '@/lib/pending-file'
import type { EditMap, ExtractedTextItem, FieldData } from '@/lib/pdf/types'
import EditToolbar from '@/app/components/EditToolbar'
import { formatBytes } from '@/lib/pdf/compress'

const PdfViewer = dynamic(() => import('@/app/components/PdfViewer'), { ssr: false })

/* ─── Types ─── */
type ToolKey = 'edit' | 'sign' | 'annotate' | 'redact' | 'compress'

interface ToolDef {
  key: ToolKey
  label: string
  pro?: boolean
}

/* ─── Tool list — matches V2 order exactly ─── */
const TOOLS: ToolDef[] = [
  { key: 'edit',     label: 'Edit'     },
  { key: 'sign',     label: 'Sign'     },
  { key: 'annotate', label: 'Annotate' },
  { key: 'redact',   label: 'Redact',  pro: true },
  { key: 'compress', label: 'Compress' },
]

/* ─── Tool accent colors ─── */
const TOOL_COLORS: Record<ToolKey, { bg: string; text: string }> = {
  edit:     { bg: 'rgba(129,140,248,.20)', text: '#818cf8' },
  sign:     { bg: 'rgba(34,211,160,.20)',  text: '#22d3a0' },
  annotate: { bg: 'rgba(251,191,36,.20)',  text: '#d97706' },
  redact:   { bg: 'rgba(249,112,102,.20)', text: '#f97066' },
  compress: { bg: 'rgba(96,165,250,.20)',  text: '#60a5fa' },
}

/* ─── Inline SVG symbols (V2 icon set) ─── */
const SVG_DEFS = `
<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="ws-edit" viewBox="0 0 16 16">
    <path d="M11.5 1.5a1.5 1.5 0 0 1 2.12 2.12l-8.5 8.5-2.83.71.71-2.83 8.5-8.5z"
      fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <symbol id="ws-sign" viewBox="0 0 16 16">
    <path d="M2 12c2-3 4-5 5-5s1 2 2 2 2-1 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M13 12h1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </symbol>
  <symbol id="ws-annotate" viewBox="0 0 16 16">
    <rect x="2" y="5" width="8" height="1.5" rx=".75" fill="currentColor" opacity=".5"/>
    <rect x="2" y="8" width="10" height="1.5" rx=".75" fill="currentColor" opacity=".5"/>
    <rect x="2" y="11" width="6" height="1.5" rx=".75" fill="currentColor" opacity=".5"/>
    <rect x="1" y="4" width="3" height="9" rx="1.5" fill="currentColor"/>
  </symbol>
  <symbol id="ws-redact" viewBox="0 0 16 16">
    <rect x="2" y="5" width="12" height="6" rx="1.5" fill="currentColor"/>
    <line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </symbol>
  <symbol id="ws-compress" viewBox="0 0 16 16">
    <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4"
      fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <symbol id="ws-upload" viewBox="0 0 24 24">
    <path d="M12 15V3M7 8l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </symbol>
</svg>
`

function SvgIcon({ id, size = 16, style }: { id: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} style={style} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}


/* ─── Spring pill selector rail — matches V2 .sel-rail/.sel-pill ─── */
function SelRail({
  activeTool,
  onSelect,
}: {
  activeTool: ToolDef
  onSelect: (key: ToolKey) => void
}) {
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const idx = TOOLS.findIndex(t => t.key === activeTool.key)
    const el = tabRefs.current[idx]
    if (el) {
      setPillStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      })
    }
  }, [activeTool.key])

  return (
    <div
      role="tablist"
      aria-label="PDF tool selector"
      style={{
        position: 'relative',
        display: 'flex',
        background: 'rgba(255,255,255,.05)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 11,
        padding: 3,
      }}
    >
      {/* Spring pill — colored by active tool */}
      <div
        style={{
          position: 'absolute',
          top: 3,
          height: 'calc(100% - 6px)',
          background: TOOL_COLORS[activeTool.key].bg,
          border: `1px solid ${TOOL_COLORS[activeTool.key].text}40`,
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,.12)',
          transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), width .28s cubic-bezier(.34,1.56,.64,1), background .18s, border-color .18s',
          transform: `translateX(${(pillStyle.left as number) - 0}px)`,
          width: pillStyle.width,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {TOOLS.map((tool, idx) => {
        const isActive = tool.key === activeTool.key
        return (
          <div
            key={tool.key}
            ref={el => { tabRefs.current[idx] = el }}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tool.pro}
            tabIndex={tool.pro ? -1 : 0}
            onClick={() => !tool.pro && onSelect(tool.key)}
            onKeyDown={e => { if (!tool.pro && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(tool.key) } }}
            style={{
              position: 'relative',
              zIndex: 1,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 6,
              padding: '9px 8px 9px 10px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: isActive ? TOOL_COLORS[tool.key].text : 'rgba(255,255,255,.3)',
              cursor: tool.pro ? 'default' : 'pointer',
              userSelect: 'none',
              transition: 'color .18s',
              whiteSpace: 'nowrap',
            }}
          >
            <SvgIcon
              id={`ws-${tool.key}`}
              size={14}
              style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7, transition: 'opacity .18s' }}
            />
            {tool.label}
            {tool.pro && (
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  background: 'rgba(249,112,102,.18)',
                  color: '#f97066',
                  padding: '1px 4px',
                  borderRadius: 3,
                  marginLeft: 2,
                }}
              >
                PRO
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── L3 contextual strips — one per tool, shown inline below sel-rail ─── */
function L3Strip({
  activeTool,
  selectedField,
  editCount,
  canUndo,
  canRedo,
  onFieldChange,
  onUndo,
  onRedo,
  compressEnabled,
  compressStats,
  compressLoading,
  onToggleCompress,
}: {
  activeTool: ToolDef
  selectedField: FieldData | null
  editCount: number
  canUndo: boolean
  canRedo: boolean
  onFieldChange: (patch: Partial<FieldData>) => void
  onUndo: () => void
  onRedo: () => void
  compressEnabled: boolean
  compressStats: { original: number; compressed: number; pct: number } | null
  compressLoading: boolean
  onToggleCompress: () => void
}) {
  const base: React.CSSProperties = {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    padding: '0',
    gap: 10,
    overflow: 'hidden',
  }

  const animKey = activeTool.key

  if (activeTool.key === 'edit') {
    return (
      <div style={base}>
        <div key={animKey} style={{ width: '100%', animation: 'strip-appear .2s ease both' }}>
          <EditToolbar
            selectedField={selectedField}
            editCount={editCount}
            canUndo={canUndo}
            canRedo={canRedo}
            onFieldChange={onFieldChange}
            onUndo={onUndo}
            onRedo={onRedo}
          />
        </div>
      </div>
    )
  }

  if (activeTool.key === 'sign') {
    return (
      <div style={base}>
        <div key={animKey} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', animation: 'strip-appear .2s ease both' }}>
          <button
            style={{
              background: '#22d3a0',
              color: '#0b0d14',
              border: 'none',
              borderRadius: 7,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Add Signature
          </button>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,.28)' }}>
            Drag to position
          </span>
        </div>
      </div>
    )
  }

  if (activeTool.key === 'annotate') {
    return (
      <div style={base}>
        <div key={animKey} style={{ animation: 'strip-appear .2s ease both' }}>
          <AnnotateSubRail />
        </div>
      </div>
    )
  }

  if (activeTool.key === 'redact') {
    return (
      <div style={base}>
        <div key={animKey} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 12px', background: 'rgba(249,112,102,.06)', border: '1px solid rgba(249,112,102,.2)', borderRadius: 9, width: '100%', boxSizing: 'border-box', animation: 'strip-appear .2s ease both' }}>
          <SvgIcon id="ws-redact" size={16} style={{ color: '#f97066', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f97066' }}>Redact — Pro feature</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
              Permanent removal · GDPR &amp; HIPAA compliant
            </div>
          </div>
          <button
            style={{ background: '#f97066', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
          >
            Upgrade →
          </button>
        </div>
      </div>
    )
  }

  if (activeTool.key === 'compress') {
    const toggleOn = compressEnabled
    return (
      <div style={base}>
        <div key={animKey} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', animation: 'strip-appear .2s ease both' }}>
          {/* Toggle */}
          <button
            onClick={onToggleCompress}
            aria-pressed={toggleOn}
            aria-label="Compress on download"
            style={{
              width: 38,
              height: 22,
              borderRadius: 11,
              background: toggleOn ? '#60a5fa' : 'rgba(255,255,255,.12)',
              position: 'relative',
              cursor: 'pointer',
              flexShrink: 0,
              border: 'none',
              padding: 0,
              transition: 'background .2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: toggleOn ? 19 : 3,
                width: 16,
                height: 16,
                borderRadius: 8,
                background: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,.3)',
                transition: 'left .2s',
              }}
            />
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: toggleOn ? '#60a5fa' : 'rgba(255,255,255,.4)', transition: 'color .2s' }}>
            Compress on download
          </span>
          {/* Real filesize stats */}
          {compressLoading && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Calculating…</span>
          )}
          {!compressLoading && compressStats && (
            <span style={{ fontSize: 11, color: 'rgba(96,165,250,.7)' }}>
              · {formatBytes(compressStats.original)} → {formatBytes(compressStats.compressed)} (−{compressStats.pct}%)
            </span>
          )}
        </div>
      </div>
    )
  }

  return null
}

/* Annotate sub-rail (yellow / green / pink / note / flag) */
function AnnotateSubRail() {
  type AMode = 'yellow' | 'green' | 'pink' | 'note' | 'flag'
  const [mode, setMode] = useState<AMode>('yellow')
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({ left: 0, width: 0 })

  const modes: { key: AMode; label: string; dot?: string }[] = [
    { key: 'yellow', label: 'Yellow', dot: '#fbbf24' },
    { key: 'green',  label: 'Green',  dot: '#4ade80' },
    { key: 'pink',   label: 'Pink',   dot: '#f472b6' },
    { key: 'note',   label: 'Note'   },
    { key: 'flag',   label: 'Arrow'  },
  ]

  useLayoutEffect(() => {
    const idx = modes.findIndex(m => m.key === mode)
    const el = tabRefs.current[idx]
    if (el) setPillStyle({ left: el.offsetLeft, width: el.offsetWidth })
  }, [mode])

  return (
    <div
      role="tablist"
      aria-label="Annotation mode"
      style={{
        position: 'relative',
        display: 'inline-flex',
        background: 'rgba(255,255,255,.05)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 9,
        padding: 3,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          height: 'calc(100% - 6px)',
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          transition: 'transform .24s cubic-bezier(.34,1.56,.64,1), width .24s cubic-bezier(.34,1.56,.64,1)',
          transform: `translateX(${pillStyle.left as number}px)`,
          width: pillStyle.width,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {modes.map((m, idx) => (
        <div
          key={m.key}
          ref={el => { tabRefs.current[idx] = el }}
          role="tab"
          aria-selected={mode === m.key}
          tabIndex={0}
          onClick={() => setMode(m.key)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMode(m.key) } }}
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            userSelect: 'none',
            color: mode === m.key ? '#0b0d14' : 'rgba(255,255,255,.35)',
            transition: 'color .18s',
            whiteSpace: 'nowrap',
          }}
        >
          {m.dot && (
            <span style={{ width: 9, height: 9, borderRadius: 2, background: m.dot, flexShrink: 0, display: 'block' }} />
          )}
          {m.key === 'note' && (
            <svg width="11" height="11" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
              <rect x="2" y="2" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
              <line x1="5" y1="14" x2="11" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="8" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          )}
          {m.key === 'flag' && (
            /* Arrow post-it note icon */
            <svg width="11" height="11" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
              <rect x="2" y="3" width="9" height="8" rx="1.2" fill="currentColor" opacity=".25"/>
              <rect x="2" y="3" width="9" height="8" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 13 L8 13 L8 16 Z" fill="currentColor" opacity=".4"/>
              <path d="M7 7 L10 7 M9 5.5 L11 7 L9 8.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {m.label}
        </div>
      ))}
    </div>
  )
}

/* ─── Page rail — LEFT 64px, matches V2 .page-rail ─── */
function PageRail({
  pageCount,
  activePage,
  onPageClick,
}: {
  pageCount: number
  activePage: number
  onPageClick: (n: number) => void
}) {
  const count = pageCount > 0 ? pageCount : 1  // always show at least 1 placeholder

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
              transition: 'border-color .15s',
            }}
          >
            {/* Line stubs mimicking page content — decorative */}
            <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              {[1, 0.55, 0.82, 0.68, 0.75].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: i === 0 ? 2 : 1.5,
                    background: i === 0 ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.14)',
                    borderRadius: 1,
                    width: `${w * 100}%`,
                  }}
                />
              ))}
            </div>
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
    </div>
  )
}

/* ─── Canvas area — RIGHT flex:1, matches V2 .canvas-area ─── */
function CanvasArea({
  hasFile,
  pdfBytes,
  activeTool,
  editMap,
  onEdit,
  onPageCount,
  onTextItems,
  filename,
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  onFieldSelect,
  pageRefs,
}: {
  hasFile: boolean
  pdfBytes: Uint8Array | null
  activeTool: ToolDef
  editMap: EditMap
  onEdit: (id: string, fieldData: FieldData) => void
  onPageCount: (n: number) => void
  onTextItems: (items: ExtractedTextItem[]) => void
  filename: string
  isDragging: boolean
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onFileSelect: (file: File) => void
  onFieldSelect?: (id: string) => void
  pageRefs?: React.MutableRefObject<Map<number, HTMLDivElement>>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!hasFile) {
    return (
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '20px 14px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 440,
            marginTop: 60,
            borderRadius: 14,
            border: isDragging ? '1.5px dashed #818cf8' : '1.5px dashed rgba(255,255,255,.14)',
            background: isDragging ? 'rgba(129,140,248,.06)' : 'rgba(255,255,255,.025)',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color .25s, background .25s',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              background: 'rgba(129,140,248,.15)',
            }}
          >
            <SvgIcon id="ws-upload" size={22} style={{ color: '#818cf8' }} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--tx)', marginBottom: 6, letterSpacing: '-.1px' }}>
            {isDragging ? 'Drop to open' : 'Drop your PDF here'}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', marginBottom: 18 }}>
            files never leave your browser
          </div>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 22px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '.02em',
              color: '#fff',
              background: '#818cf8',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
          >
            Browse files
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) onFileSelect(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>
    )
  }

  /* File loaded — render tool-specific canvas content */
  const cardStyle: React.CSSProperties = {
    width: 'fit-content',
    background: '#fff',
    borderRadius: 2,
    boxShadow: '0 4px 48px rgba(0,0,0,.75)',
    minHeight: 560,
  }

  const noOpEdit = () => {}
  const readOnlyMap: EditMap = new Map()

  let toolContent: React.ReactNode

  if (!pdfBytes) {
    toolContent = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 560, color: '#9ca3af', fontSize: 13, fontFamily: 'var(--font-sans)' }}>
        Loading PDF…
      </div>
    )
  } else if (activeTool.key === 'redact') {
    toolContent = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 560, padding: '32px 24px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 12 }}>PRO</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 8 }}>Redact sensitive content</div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>Permanently remove text and images — not just visually hidden. Available on the Pro plan.</div>
      </div>
    )
  } else {
    /* All tools (edit, sign, annotate, compress) render the PDF canvas via PdfViewer */
    const isEdit = activeTool.key === 'edit'
    toolContent = (
      <PdfViewer
        pdfBytes={pdfBytes}
        scale={1.5}
        editMap={isEdit ? editMap : readOnlyMap}
        onEdit={isEdit ? onEdit : noOpEdit}
        onLoad={onPageCount}
        onTextItems={onTextItems}
        onFieldSelect={isEdit ? onFieldSelect : undefined}
        pageRefs={pageRefs}
      />
    )
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 14px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div style={cardStyle}>
        {toolContent}
      </div>
    </div>
  )
}

/* ─── Main component ─── */
export default function WorkspaceShell() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialKey = (searchParams.get('tool') ?? 'edit') as ToolKey
  const resolvedTool = TOOLS.find(t => t.key === initialKey) ?? TOOLS[0]

  const [activeTool, setActiveTool] = useState<ToolDef>(resolvedTool)
  const [file, setFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [editMap, setEditMap] = useState<EditMap>(new Map())
  const [textItems, setTextItems] = useState<ExtractedTextItem[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activePage, setActivePage] = useState(1)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  /* Compress state */
  const [compressEnabled, setCompressEnabled] = useState(false)
  const [compressStats, setCompressStats] = useState<{ original: number; compressed: number; pct: number } | null>(null)
  const [compressLoading, setCompressLoading] = useState(false)

  /* History stack */
  const histRef = useRef<EditMap[]>([new Map()])
  const [hIdx, setHIdx] = useState(0)

  const hPush = useCallback((nextMap: EditMap) => {
    const newHist = histRef.current.slice(0, hIdx + 1)
    newHist.push(nextMap)
    histRef.current = newHist
    setHIdx(newHist.length - 1)
  }, [hIdx])

  const histUndo = useCallback(() => {
    if (hIdx === 0) return
    const newIdx = hIdx - 1
    setHIdx(newIdx)
    setEditMap(histRef.current[newIdx])
  }, [hIdx])

  const histRedo = useCallback(() => {
    if (hIdx >= histRef.current.length - 1) return
    const newIdx = hIdx + 1
    setHIdx(newIdx)
    setEditMap(histRef.current[newIdx])
  }, [hIdx])

  /* Page refs for scroll-to-page */
  const pageRefsMap = useRef<Map<number, HTMLDivElement>>(new Map())

  const handlePageClick = useCallback((n: number) => {
    setActivePage(n)
    const el = pageRefsMap.current.get(n)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  /* Consume file handed off from homepage hub */
  useEffect(() => {
    const pending = consumePendingFile()
    if (pending) setFile(pending)
  }, [])

  /* Convert File → Uint8Array when file changes */
  useEffect(() => {
    if (!file) { setPdfBytes(null); setPageCount(0); setEditMap(new Map()); setTextItems([]); histRef.current = [new Map()]; setHIdx(0); setSelectedFieldId(null); pageRefsMap.current.clear(); return }
    let cancelled = false
    file.arrayBuffer().then(buf => {
      if (!cancelled) setPdfBytes(new Uint8Array(buf))
    })
    return () => { cancelled = true }
  }, [file])

  /* Keep ?tool= URL param in sync */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tool', activeTool.key)
    router.replace(`/workspace?${params.toString()}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // intentionally omits searchParams — adding it causes an infinite loop
  // (replace changes searchParams → triggers effect → replace again)
  }, [activeTool.key])

  const handleSelectTool = useCallback((key: ToolKey) => {
    const tool = TOOLS.find(t => t.key === key)
    if (tool && !tool.pro) setActiveTool(tool)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf' || f?.name.endsWith('.pdf')) setFile(f)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])
  const handleFileSelect = useCallback((f: File) => setFile(f), [])
  const handleClearFile = useCallback(() => { setFile(null); setActivePage(1); setSelectedFieldId(null) }, [])

  const handleEdit = useCallback((id: string, fieldData: FieldData) => {
    setEditMap(prev => {
      const next = new Map(prev).set(id, fieldData)
      hPush(next)
      return next
    })
  }, [hPush])

  const handleFieldChange = useCallback((patch: Partial<FieldData>) => {
    if (!selectedFieldId) return
    setEditMap(prev => {
      const existing = prev.get(selectedFieldId)
      if (!existing) return prev
      const updated = { ...existing, ...patch }
      const next = new Map(prev).set(selectedFieldId, updated)
      hPush(next)
      return next
    })
  }, [selectedFieldId, hPush])
  const handlePageCount = useCallback((n: number) => setPageCount(n), [])
  const handleTextItems = useCallback((items: ExtractedTextItem[]) => setTextItems(items), [])

  /* Compute compress stats when compress tool is active and pdfBytes available */
  useEffect(() => {
    if (activeTool.key !== 'compress' || !pdfBytes) return
    let cancelled = false
    setCompressLoading(true)
    setCompressStats(null)
    async function run() {
      try {
        const { compressPdf } = await import('@/lib/pdf/compress')
        const result = await compressPdf(pdfBytes!)
        if (cancelled) return
        setCompressStats({
          original: result.originalBytes,
          compressed: result.compressedBytes,
          pct: result.savingPercent,
        })
      } catch {
        // Stats failed silently — user can still toggle
      } finally {
        if (!cancelled) setCompressLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [activeTool.key, pdfBytes])

  const handleToggleCompress = useCallback(() => setCompressEnabled(prev => !prev), [])

  /* Keyboard handler for undo/redo */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) histRedo()
        else histUndo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [histUndo, histRedo])

  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownload = useCallback(async () => {
    if (!pdfBytes || !file) return
    setDownloadError(null)
    let url: string | null = null
    try {
      let outputBytes = pdfBytes
      let outputName = file.name
      if (editMap.size > 0) {
        const { applyEditsAndSave } = await import('@/lib/pdf/save')
        outputBytes = await applyEditsAndSave(pdfBytes, textItems, editMap)
        outputName = file.name.replace(/\.pdf$/i, '_edited.pdf')
      }
      if (compressEnabled) {
        const { compressPdf } = await import('@/lib/pdf/compress')
        const result = await compressPdf(outputBytes)
        outputBytes = result.output
        outputName = outputName.replace(/\.pdf$/i, '_compressed.pdf')
      }
      url = URL.createObjectURL(new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = outputName
      a.click()
    } catch (err) {
      setDownloadError('Download failed — the PDF could not be processed. Please try again.')
      console.error('[handleDownload]', err)
    } finally {
      if (url) URL.revokeObjectURL(url)
    }
  }, [pdfBytes, file, editMap, textItems, compressEnabled])

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: SVG_DEFS }} />

      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0b0d14',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* ── Nav: back arrow | filename | download ── */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 16px',
            height: 50,
            borderBottom: '1px solid rgba(255,255,255,.08)',
            background: 'rgba(11,13,20,.95)',
            backdropFilter: 'blur(14px)',
            flexShrink: 0,
            zIndex: 50,
          }}
        >
          <Link
            href="/"
            onClick={handleClearFile}
            aria-label="Back to home"
            style={{
              background: 'none',
              color: 'rgba(255,255,255,.5)',
              fontSize: 18,
              padding: '6px 8px 6px 0',
              lineHeight: 1,
              textDecoration: 'none',
              transition: 'color .15s',
              flexShrink: 0,
            }}
          >
            <span aria-hidden="true">←</span>
          </Link>

          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,.5)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {file ? `${file.name} · ${formatBytes(file.size)}` : 'No file open'}
          </span>

          {downloadError && (
            <span style={{ fontSize: 11, color: '#f87171', maxWidth: 220 }} title={downloadError}>
              ⚠ Download failed
            </span>
          )}

          <button
            disabled={!file}
            aria-label="Download PDF"
            onClick={handleDownload}
            style={{
              background: file ? '#6366f1' : 'rgba(99,102,241,.35)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '.03em',
              whiteSpace: 'nowrap',
              cursor: file ? 'pointer' : 'default',
              opacity: file ? 1 : 0.6,
              transition: 'background .25s, opacity .25s',
              flexShrink: 0,
            }}
          >
            <span aria-hidden="true">↓ </span>Download
          </button>
        </header>

        {/* ── L2: horizontal selector rail + L3 inline strip ── */}
        <div
          style={{
            background: 'rgba(11,13,20,.92)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
            padding: '10px 14px 0',
            flexShrink: 0,
            backdropFilter: 'blur(14px)',
          }}
        >
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <SelRail activeTool={activeTool} onSelect={handleSelectTool} />
            <L3Strip
              activeTool={activeTool}
              selectedField={selectedFieldId ? editMap.get(selectedFieldId) ?? null : null}
              editCount={editMap.size}
              canUndo={hIdx > 0}
              canRedo={hIdx < histRef.current.length - 1}
              onFieldChange={handleFieldChange}
              onUndo={histUndo}
              onRedo={histRedo}
              compressEnabled={compressEnabled}
              compressStats={compressStats}
              compressLoading={compressLoading}
              onToggleCompress={handleToggleCompress}
            />
          </div>
        </div>

        {/* ── ws-body: [page-rail LEFT 64px] [canvas RIGHT flex:1] ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <PageRail
            pageCount={pageCount}
            activePage={activePage}
            onPageClick={handlePageClick}
          />

          <CanvasArea
            hasFile={!!file}
            pdfBytes={pdfBytes}
            activeTool={activeTool}
            editMap={editMap}
            onEdit={handleEdit}
            onPageCount={handlePageCount}
            onTextItems={handleTextItems}
            filename={file?.name ?? ''}
            isDragging={isDragging}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileSelect={handleFileSelect}
            onFieldSelect={setSelectedFieldId}
            pageRefs={pageRefsMap}
          />
        </div>
      </div>
    </>
  )
}
