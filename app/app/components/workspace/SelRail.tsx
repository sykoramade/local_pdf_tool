'use client'

import { useState, useRef, useLayoutEffect } from 'react'
import { TOOLS, TOOL_HEX, TOOL_BG, type ToolDef, type ToolKey } from '@/app/workspace/workspace-types'

function SvgIcon({ id, size = 16, style }: { id: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} style={style} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}

export default function SelRail({
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
      <div
        style={{
          position: 'absolute',
          top: 3,
          height: 'calc(100% - 6px)',
          background: TOOL_BG[activeTool.key],
          border: `1px solid ${TOOL_HEX[activeTool.key]}40`,
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
              color: isActive ? TOOL_HEX[tool.key] : 'rgba(255,255,255,.3)',
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
