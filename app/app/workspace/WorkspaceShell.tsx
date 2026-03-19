'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { consumePendingFile } from '@/lib/pending-file'

/* ─── Types ─── */
type ToolKey = 'edit' | 'sign' | 'annotate' | 'redact' | 'compress'

interface ToolDef {
  key: ToolKey
  label: string
  color: string
  desc: string
  iconId: string
  pro?: boolean
}

/* ─── Tool definitions ─── */
const TOOLS: ToolDef[] = [
  { key: 'edit',     label: 'Edit',     color: '#818cf8', desc: 'Click any text to edit it directly.',    iconId: 'ws-ic-edit'     },
  { key: 'sign',     label: 'Sign',     color: '#22d3a0', desc: 'Draw and place your signature.',          iconId: 'ws-ic-sign'     },
  { key: 'annotate', label: 'Annotate', color: '#fbbf24', desc: 'Highlight text · sticky notes · flags.',  iconId: 'ws-ic-annotate' },
  { key: 'redact',   label: 'Redact',   color: '#f97066', desc: 'Permanently remove sensitive content.',   iconId: 'ws-ic-redact',   pro: true },
  { key: 'compress', label: 'Compress', color: '#fb923c', desc: 'Reduce file size without re-uploading.',  iconId: 'ws-ic-compress' },
]

/* ─── Inline SVG symbols ─── */
const SVG_DEFS = `
<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="ws-ic-edit" viewBox="0 0 16 16">
    <path d="M11.5 1.5a1.5 1.5 0 0 1 2.12 2.12l-8.5 8.5-2.83.71.71-2.83 8.5-8.5z"
      fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <symbol id="ws-ic-sign" viewBox="0 0 16 16">
    <path d="M2 12c2-3 4-5 5-5s1 2 2 2 2-1 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M13 12h1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </symbol>
  <symbol id="ws-ic-annotate" viewBox="0 0 16 16">
    <rect x="2" y="5" width="8" height="1.5" rx=".75" fill="currentColor" opacity=".5"/>
    <rect x="2" y="8" width="10" height="1.5" rx=".75" fill="currentColor" opacity=".5"/>
    <rect x="2" y="11" width="6" height="1.5" rx=".75" fill="currentColor" opacity=".5"/>
    <rect x="1" y="4" width="3" height="9" rx="1.5" fill="currentColor"/>
  </symbol>
  <symbol id="ws-ic-redact" viewBox="0 0 16 16">
    <rect x="2" y="5" width="12" height="6" rx="1.5" fill="currentColor"/>
    <line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </symbol>
  <symbol id="ws-ic-compress" viewBox="0 0 16 16">
    <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4"
      fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <symbol id="ws-ic-pdf" viewBox="0 0 24 24">
    <rect x="3" y="2" width="13" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M16 2l5 5v13a2 2 0 0 1-2 2H6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M16 2v5h5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </symbol>
  <symbol id="ws-ic-upload" viewBox="0 0 24 24">
    <path d="M12 15V3M7 8l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </symbol>
  <symbol id="ws-ic-download" viewBox="0 0 16 16">
    <path d="M8 2v9M4 8l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 13h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </symbol>
  <symbol id="ws-ic-close" viewBox="0 0 16 16">
    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </symbol>
</svg>
`

function SvgIcon({ id, size = 16, style }: { id: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} style={style} aria-hidden>
      <use href={`#${id}`} />
    </svg>
  )
}

/* ─── Helpers ─── */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ─── Sub-components ─── */

function WorkspaceNav({
  fileName,
  fileSize,
  activeTool,
  onClearFile,
}: {
  fileName: string | null
  fileSize: number | null
  activeTool: ToolDef
  onClearFile: () => void
}) {
  return (
    <header
      style={{
        height: 52,
        background: '#0e1018',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
        fontFamily: 'var(--font-sans)',
        zIndex: 10,
      }}
    >
      {/* Logo / home link */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 400,
            color: '#f4f6fc',
            letterSpacing: '-0.01em',
          }}
        >
          LocalPDF
        </span>
      </Link>

      {/* Divider */}
      <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,.1)', flexShrink: 0 }} />

      {/* Active tool badge */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: 20,
          background: `${activeTool.color}18`,
          color: activeTool.color,
          border: `1px solid ${activeTool.color}30`,
          flexShrink: 0,
        }}
      >
        {activeTool.label}
      </span>

      {/* Filename */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        {fileName ? (
          <>
            <SvgIcon id="ws-ic-pdf" size={14} style={{ color: 'rgba(255,255,255,.35)', flexShrink: 0 }} />
            <span
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,.7)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fileName}
            </span>
            {fileSize !== null && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', flexShrink: 0 }}>
                {formatBytes(fileSize)}
              </span>
            )}
            <button
              onClick={onClearFile}
              title="Close file"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: 4,
                color: 'rgba(255,255,255,.25)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                transition: 'color .15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.6)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.25)')}
            >
              <SvgIcon id="ws-ic-close" size={12} />
            </button>
          </>
        ) : (
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.25)', fontStyle: 'italic' }}>
            No file open
          </span>
        )}
      </div>

      {/* Download button */}
      <button
        disabled={!fileName}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 8,
          border: 'none',
          background: fileName ? activeTool.color : 'rgba(255,255,255,.06)',
          color: fileName ? '#fff' : 'rgba(255,255,255,.2)',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          cursor: fileName ? 'pointer' : 'not-allowed',
          transition: 'opacity .15s',
          flexShrink: 0,
        }}
      >
        <SvgIcon id="ws-ic-download" size={13} />
        Download
      </button>
    </header>
  )
}

function ToolRail({
  activeTool,
  onSelect,
}: {
  activeTool: ToolDef
  onSelect: (key: ToolKey) => void
}) {
  return (
    <nav
      style={{
        width: 56,
        background: '#0b0d14',
        borderRight: '1px solid rgba(255,255,255,.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        gap: 4,
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {TOOLS.map(tool => {
        const isActive = tool.key === activeTool.key
        return (
          <button
            key={tool.key}
            title={tool.pro ? `${tool.label} (Pro)` : tool.label}
            onClick={() => !tool.pro && onSelect(tool.key)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: isActive
                ? `1px solid ${tool.color}40`
                : '1px solid transparent',
              background: isActive ? `${tool.color}15` : 'transparent',
              color: isActive ? tool.color : 'rgba(255,255,255,.3)',
              cursor: tool.pro ? 'default' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              transition: 'all .15s',
              position: 'relative',
              padding: 0,
            }}
            onMouseEnter={e => {
              if (!isActive && !tool.pro) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'
                ;(e.currentTarget as HTMLElement).style.color = tool.color
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.3)'
              }
            }}
          >
            <SvgIcon id={tool.iconId} size={16} />
            <span style={{ fontSize: 9, fontFamily: 'var(--font-sans)', fontWeight: 500, lineHeight: 1 }}>
              {tool.label}
            </span>
            {tool.pro && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  fontSize: 7,
                  fontWeight: 700,
                  color: '#f97066',
                  lineHeight: 1,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                PRO
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

function ContextualPanel({ activeTool, hasFile }: { activeTool: ToolDef; hasFile: boolean }) {
  return (
    <aside
      style={{
        width: 220,
        background: '#0d0f17',
        borderRight: '1px solid rgba(255,255,255,.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: activeTool.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,.7)',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {activeTool.label}
          </span>
        </div>
        <p
          style={{
            fontSize: 11.5,
            color: 'rgba(255,255,255,.35)',
            marginTop: 6,
            lineHeight: 1.5,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {activeTool.desc}
        </p>
      </div>

      {/* Tool options placeholder */}
      <div style={{ flex: 1, padding: '16px 16px' }}>
        {!hasFile ? (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
            Open a PDF to see options.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Placeholder option rows — will be replaced in S17+ */}
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  height: 32,
                  borderRadius: 6,
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.06)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

function PageRail({
  pageCount,
  activePage,
  onPageClick,
}: {
  pageCount: number
  activePage: number
  onPageClick: (n: number) => void
}) {
  return (
    <aside
      style={{
        width: 92,
        background: '#0b0d14',
        borderLeft: '1px solid rgba(255,255,255,.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 8px',
        gap: 8,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: 'rgba(255,255,255,.2)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans)',
          marginBottom: 4,
        }}
      >
        Pages
      </span>

      {pageCount === 0 ? (
        <div
          style={{
            width: 64,
            height: 84,
            borderRadius: 4,
            border: '1px dashed rgba(255,255,255,.1)',
            background: 'rgba(255,255,255,.02)',
          }}
        />
      ) : (
        Array.from({ length: pageCount }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onPageClick(n)}
            style={{
              width: 64,
              height: 84,
              borderRadius: 4,
              border: n === activePage
                ? '1.5px solid rgba(255,255,255,.4)'
                : '1px solid rgba(255,255,255,.1)',
              background: n === activePage ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.02)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
              transition: 'border-color .15s',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                bottom: 3,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: 9,
                color: 'rgba(255,255,255,.3)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {n}
            </span>
          </button>
        ))
      )}
    </aside>
  )
}

function CanvasArea({
  hasFile,
  isDragging,
  activeTool,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
}: {
  hasFile: boolean
  isDragging: boolean
  activeTool: ToolDef
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onFileSelect: (file: File) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!hasFile) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0d14',
          overflow: 'hidden',
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '40px 32px',
            borderRadius: 16,
            border: isDragging
              ? `2px dashed ${activeTool.color}`
              : '2px dashed rgba(255,255,255,.1)',
            background: isDragging ? `${activeTool.color}08` : 'transparent',
            transition: 'all .2s',
            cursor: 'default',
            maxWidth: 360,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: `${activeTool.color}15`,
              border: `1px solid ${activeTool.color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTool.color,
            }}
          >
            <SvgIcon id="ws-ic-upload" size={22} />
          </div>

          <div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'rgba(255,255,255,.8)',
                margin: '0 0 6px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {isDragging ? 'Drop to open' : 'Open a PDF to start'}
            </p>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,.35)',
                margin: 0,
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.5,
              }}
            >
              Drag a file here or click below.
              <br />
              Files never leave your browser.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: `1px solid ${activeTool.color}50`,
              background: `${activeTool.color}12`,
              color: activeTool.color,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = `${activeTool.color}22`)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = `${activeTool.color}12`)}
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

  /* File loaded — canvas placeholder (replaced in S17+) */
  return (
    <div
      style={{
        flex: 1,
        background: '#13141c',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 24px',
      }}
    >
      {/* Placeholder A4 page — replaced by real PDF.js rendering in S17 */}
      <div
        style={{
          width: 595,
          minHeight: 842,
          background: '#fff',
          borderRadius: 4,
          boxShadow: '0 4px 32px rgba(0,0,0,.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: 14,
          fontFamily: 'var(--font-sans)',
        }}
      >
        PDF canvas — rendered in Sprint 17
      </div>
    </div>
  )
}

/* ─── Main component ─── */
export default function WorkspaceShell() {
  const searchParams = useSearchParams()
  const router = useRouter()

  /* Resolve initial tool from ?tool= param */
  const initialToolKey = (searchParams.get('tool') ?? 'edit') as ToolKey
  const resolvedTool = TOOLS.find(t => t.key === initialToolKey) ?? TOOLS[0]

  const [activeTool, setActiveTool] = useState<ToolDef>(resolvedTool)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activePage, setActivePage] = useState(1)
  const [pageCount] = useState(0)  // updated in S17 when PDF.js loads

  /* Consume pending file (set by homepage hub) on mount */
  useEffect(() => {
    const pending = consumePendingFile()
    if (pending) setFile(pending)
  }, [])

  /* Keep URL in sync when tool changes */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tool', activeTool.key)
    router.replace(`/workspace?${params.toString()}`, { scroll: false })
  }, [activeTool.key]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectTool = useCallback((key: ToolKey) => {
    const tool = TOOLS.find(t => t.key === key)
    if (tool && !tool.pro) setActiveTool(tool)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf' || f?.name.endsWith('.pdf')) {
      setFile(f)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleFileSelect = useCallback((f: File) => setFile(f), [])

  const handleClearFile = useCallback(() => {
    setFile(null)
    setActivePage(1)
  }, [])

  return (
    <>
      {/* Inject SVG symbol defs */}
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
        {/* Top nav */}
        <WorkspaceNav
          fileName={file?.name ?? null}
          fileSize={file?.size ?? null}
          activeTool={activeTool}
          onClearFile={handleClearFile}
        />

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* L2 tool rail */}
          <ToolRail activeTool={activeTool} onSelect={handleSelectTool} />

          {/* L3 contextual strip */}
          <ContextualPanel activeTool={activeTool} hasFile={!!file} />

          {/* Canvas */}
          <CanvasArea
            hasFile={!!file}
            isDragging={isDragging}
            activeTool={activeTool}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileSelect={handleFileSelect}
          />

          {/* Page rail */}
          <PageRail
            pageCount={file ? pageCount : 0}
            activePage={activePage}
            onPageClick={setActivePage}
          />
        </div>
      </div>
    </>
  )
}
