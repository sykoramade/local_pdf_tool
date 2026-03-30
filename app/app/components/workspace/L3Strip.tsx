'use client'

import { useState, useRef, useLayoutEffect } from 'react'
import type { FieldData } from '@/lib/pdf/types'
import type { ToolDef, SigMode, AMode } from '@/app/workspace/workspace-types'
import EditToolbar from '@/app/components/EditToolbar'
import { formatBytes } from '@/lib/pdf/compress'

function SvgIcon({ id, size = 16, style }: { id: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} style={style} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}

/* Annotate sub-rail (yellow / green / pink / note / check) */
function AnnotateSubRail({ mode, onModeChange }: { mode: AMode; onModeChange: (m: AMode) => void }) {
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({ left: 0, width: 0 })

  const modes: { key: AMode; label: string; dot?: string }[] = [
    { key: 'yellow', label: 'Yellow', dot: '#fbbf24' },
    { key: 'green',  label: 'Green',  dot: '#4ade80' },
    { key: 'pink',   label: 'Pink',   dot: '#f472b6' },
    { key: 'note',   label: 'Note'   },
    { key: 'check',  label: 'Check'  },
  ]

  useLayoutEffect(() => {
    const idx = modes.findIndex(m => m.key === mode)
    const el = tabRefs.current[idx]
    if (el) setPillStyle({ left: el.offsetLeft, width: el.offsetWidth })
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          onClick={() => onModeChange(m.key)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onModeChange(m.key) } }}
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
          {m.key === 'check' && (
            <svg width="11" height="11" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
              <path d="M2 8 L6 12 L14 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {m.label}
        </div>
      ))}
    </div>
  )
}

export default function L3Strip({
  activeTool,
  editMode = 'text',
  onEditModeChange,
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
  sigMode,
  sigCount,
  onOpenSigModal,
  onCancelSig,
  annotateMode,
  onAnnotateModeChange,
  imageCount,
  onInsertImageClick,
  drawMode,
  onDrawClick,
  redactTargets = [],
  redactMatchCounts = {},
  redactInput = '',
  onRedactInputChange,
  onRedactTargetsChange,
}: {
  activeTool: ToolDef
  editMode?: 'select' | 'text'
  onEditModeChange?: (mode: 'select' | 'text') => void
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
  sigMode: SigMode
  sigCount: number
  onOpenSigModal: () => void
  onCancelSig: () => void
  annotateMode: AMode
  onAnnotateModeChange: (m: AMode) => void
  imageCount: number
  onInsertImageClick: () => void
  drawMode: boolean
  onDrawClick: () => void
  redactTargets?: string[]
  redactMatchCounts?: Record<string, number>
  redactInput?: string
  onRedactInputChange?: (val: string) => void
  onRedactTargetsChange?: (targets: string[]) => void
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
        <div key={animKey} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', animation: 'strip-appear .2s ease both' }}>
          {/* Mode toggle: Select | T Text */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: 2, flexShrink: 0 }}>
            <button
              onClick={() => onEditModeChange?.('select')}
              title="Select mode"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 9px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                background: editMode === 'select' ? 'rgba(255,255,255,.12)' : 'none',
                color: editMode === 'select' ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.35)',
                transition: 'background .15s, color .15s',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M2 2l5 12 2.5-4.5L14 12l-2-2-4.5-2.5z"/>
              </svg>
              Select
            </button>
            <button
              onClick={() => onEditModeChange?.('text')}
              title="Text editing mode"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 9px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                background: editMode === 'text' ? 'rgba(255,255,255,.12)' : 'none',
                color: editMode === 'text' ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.35)',
                transition: 'background .15s, color .15s',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Georgia,serif', lineHeight: 1 }}>T</span>
              Text
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
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
      </div>
    )
  }

  if (activeTool.key === 'sign') {
    if (sigMode === 'idle') {
      return (
        <div style={base}>
          <div key="sign-idle" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', animation: 'strip-appear .2s ease both' }}>
            <button
              onClick={onOpenSigModal}
              style={{ background: '#22d3a0', color: '#0b0d14', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
            >
              + Add Signature
            </button>
            <button
              onClick={onInsertImageClick}
              style={{ background: 'none', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
            >
              Insert Image
            </button>
            <button
              onClick={onDrawClick}
              style={{ background: drawMode ? 'rgba(99,102,241,.18)' : 'none', color: drawMode ? '#818cf8' : 'rgba(255,255,255,.5)', border: drawMode ? '1px solid rgba(129,140,248,.4)' : '1px solid rgba(255,255,255,.15)', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
            >
              Draw
            </button>
            {sigCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#22d3a0', background: 'rgba(34,211,160,.12)', border: '1px solid rgba(34,211,160,.25)', borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>
                {sigCount} sig{sigCount > 1 ? 's' : ''} ✓
              </span>
            )}
            {imageCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>
                {imageCount} img{imageCount > 1 ? 's' : ''} ✓
              </span>
            )}
          </div>
        </div>
      )
    }

    if (sigMode === 'placing') {
      return (
        <div style={base}>
          <div key="sign-placing" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', animation: 'strip-appear .2s ease both' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: '#22d3a0', flexShrink: 0, display: 'block', boxShadow: '0 0 0 3px rgba(34,211,160,.25)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#22d3a0' }}>Click on the PDF to place your signature</span>
            <button
              onClick={onCancelSig}
              style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,255,255,.15)', borderRadius: 7, padding: '5px 10px', fontSize: 11, color: 'rgba(255,255,255,.5)', cursor: 'pointer', flexShrink: 0 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  if (activeTool.key === 'annotate') {
    return (
      <div style={base}>
        <div key={animKey} style={{ animation: 'strip-appear .2s ease both' }}>
          <AnnotateSubRail mode={annotateMode} onModeChange={onAnnotateModeChange} />
        </div>
      </div>
    )
  }

  if (activeTool.key === 'redact') {
    const visibleChips = redactTargets.slice(0, 3)
    const hiddenCount = redactTargets.length - visibleChips.length
    const hasTargets = redactTargets.length > 0

    return (
      <div style={base}>
        <div key={animKey} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', animation: 'strip-appear .2s ease both', overflow: 'hidden' }}>

          {/* ── Left: icon + input ── */}
          <SvgIcon id="ws-redact" size={14} style={{ color: '#f97066', flexShrink: 0 }} />
          <input
            type="text"
            value={redactInput}
            onChange={e => onRedactInputChange?.(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = redactInput.trim()
                if (val && !redactTargets.includes(val)) onRedactTargetsChange?.([...redactTargets, val])
                onRedactInputChange?.('')
              }
            }}
            placeholder="Enter phrase, press ↵ to queue"
            style={{ fontSize: 12, padding: '4px 8px', background: 'rgba(249,112,102,.08)', border: '1px solid rgba(249,112,102,.3)', borderRadius: 6, color: 'rgba(255,255,255,.8)', outline: 'none', width: 160, flexShrink: 0 }}
          />

          {/* ── Chip queue ── */}
          {!hasTargets ? (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', flexShrink: 0 }}>
              Queue is empty — type above or click text on the PDF
            </span>
          ) : (
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', flex: 1, overflow: 'hidden', minWidth: 0 }}>
              {visibleChips.map(t => {
                const count = redactMatchCounts[t] ?? 0
                return (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, background: 'rgba(220,38,38,.15)', color: '#fca5a5', border: '1px solid rgba(220,38,38,.3)', padding: '2px 7px', borderRadius: 9999, flexShrink: 0 }}>
                    <span style={{ maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span>
                    <span style={{ opacity: 0.7, whiteSpace: 'nowrap', flexShrink: 0 }}>({count})</span>
                    <button
                      onClick={() => onRedactTargetsChange?.(redactTargets.filter(x => x !== t))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 1, flexShrink: 0 }}
                    >×</button>
                  </span>
                )
              })}
              {hiddenCount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', padding: '2px 8px', borderRadius: 9999, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  +{hiddenCount} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (activeTool.key === 'compress') {
    const toggleOn = compressEnabled
    return (
      <div style={base}>
        <div key={animKey} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', animation: 'strip-appear .2s ease both' }}>
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
