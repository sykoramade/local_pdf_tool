'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { setPendingFile } from '@/lib/pending-file'

/* ─── Tool definitions ─── */
type ToolKey = 'edit' | 'sign' | 'compress' | 'pages' | 'annotate' | 'redact'

interface ActiveTool {
  soon?: false
  name: string
  label: string
  desc: string
  dropLabel: string
  dropSub: string
  href: string
  iconBg: string
  accentColor: string
  btnColor: string
  btnHover: string
  glowColor: string
  icon: React.ReactNode
}

interface SoonTool {
  soon: true
  name: string
  label: string
  soonText: string
  icon: React.ReactNode
}

type ToolDef = ActiveTool | SoonTool

const EDIT_ICON = (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
    <path d="M13 2L16 5L7 14H4V11L13 2Z" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)
const SIGN_ICON = (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
    <path d="M2 14c2-1.5 3.5-4.5 4-6 .5 1.5 1.5 4.5 3 6 .5-3 1.5-7 3.5-9" stroke="#22d3a0" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const COMPRESS_ICON = (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
    <path d="M9 2v14M5.5 11.5l3.5 4 3.5-4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const PAGES_ICON = (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
    <rect x="1.5" y="2" width="7" height="9" rx="1.5" stroke="#60a5fa" strokeWidth="1.4"/>
    <rect x="9.5" y="2" width="7" height="9" rx="1.5" stroke="#60a5fa" strokeWidth="1.4"/>
    <path d="M9 11v5M6.5 14l2.5 2 2.5-2" stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ANNOTATE_ICON = (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
    <path d="M3 12h12M3 8h9M3 4h11" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const REDACT_ICON = (
  <svg width="17" height="17" viewBox="0 0 13 13" fill="none">
    <rect x="2" y="4" width="9" height="5" rx="1.5" fill="rgba(255,255,255,.25)" opacity=".55"/>
  </svg>
)

const TOOLS: Record<ToolKey, ToolDef> = {
  edit: {
    name: 'EDIT',
    label: 'EDIT',
    desc: 'Click any text. Edit it directly. Fonts match automatically.',
    dropLabel: 'Drop your PDF here',
    dropSub: 'contracts, invoices, forms, CVs',
    href: '/edit',
    iconBg: 'rgba(99,102,241,.18)',
    accentColor: 'rgba(99,102,241,.35)',
    btnColor: '#6366f1',
    btnHover: '#7274f3',
    glowColor: 'rgba(99,102,241,.35)',
    icon: EDIT_ICON,
  },
  sign: {
    name: 'SIGN',
    label: 'SIGN',
    desc: 'Draw, type, or upload your signature. eIDAS-compliant across the EU.',
    dropLabel: 'Drop your PDF to sign',
    dropSub: 'contracts, agreements, forms',
    href: '/sign',
    iconBg: 'rgba(34,211,160,.13)',
    accentColor: 'rgba(34,211,160,.35)',
    btnColor: '#059669',
    btnHover: '#10b981',
    glowColor: 'rgba(34,211,160,.3)',
    icon: SIGN_ICON,
  },
  compress: {
    name: 'COMPRESS',
    label: 'COMPRESS',
    desc: 'Reduce file size without visible quality loss. Instant, no size limit.',
    dropLabel: 'Drop your PDF to compress',
    dropSub: 'any PDF, any size',
    href: '/compress',
    iconBg: 'rgba(245,158,11,.13)',
    accentColor: 'rgba(245,158,11,.35)',
    btnColor: '#d97706',
    btnHover: '#f59e0b',
    glowColor: 'rgba(245,158,11,.3)',
    icon: COMPRESS_ICON,
  },
  pages: {
    name: 'PAGES',
    label: 'PAGES',
    desc: 'Merge, split, or reorder pages. Drag multiple files to merge.',
    dropLabel: 'Drop PDFs to merge or split',
    dropSub: 'multiple files to merge · one to split',
    href: '/merge',
    iconBg: 'rgba(96,165,250,.13)',
    accentColor: 'rgba(96,165,250,.35)',
    btnColor: '#2563eb',
    btnHover: '#3b82f6',
    glowColor: 'rgba(96,165,250,.3)',
    icon: PAGES_ICON,
  },
  annotate: {
    name: 'ANNOTATE',
    label: 'ANNOTATE',
    desc: 'Highlight text in yellow, green, or pink. Add sticky notes. Baked into the PDF.',
    dropLabel: 'Drop your PDF to annotate',
    dropSub: 'highlights and sticky notes',
    href: '/annotate',
    iconBg: 'rgba(251,191,36,.13)',
    accentColor: 'rgba(251,191,36,.35)',
    btnColor: '#d97706',
    btnHover: '#fbbf24',
    glowColor: 'rgba(251,191,36,.3)',
    icon: ANNOTATE_ICON,
  },
  redact: {
    soon: true,
    name: 'REDACT',
    label: 'REDACT',
    soonText: 'Permanent content removal, not just a black box overlay. Built for healthcare and legal teams. Shipping soon.',
    icon: REDACT_ICON,
  },
}

const TOOL_ORDER: ToolKey[] = ['edit', 'sign', 'compress', 'pages', 'annotate', 'redact']

const SEG_ICONS: Record<ToolKey, React.ReactNode> = {
  edit: <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5L11.5 3.5L4.5 10.5H2.5V8.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  sign: <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="M2 10c1.5-1 2.5-3 3-4 .5 1 1 3 2 4 .5-2 1-5 2.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  compress: <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M3.5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pages: <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="2" width="4" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="7.5" y="2" width="4" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 7v4M4.5 9l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  annotate: <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="M2 9h9M2 6h6M2 3h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  redact: <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><rect x="2" y="4" width="9" height="5" rx="1.5" fill="currentColor" opacity=".55"/></svg>,
}

export default function HomepageHub() {
  const router = useRouter()
  const [active, setActive] = useState<ToolKey>('edit')
  const [dzHovered, setDzHovered] = useState(false)
  const [dzDragging, setDzDragging] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)
  const segRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const pillRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const movePill = useCallback((key: ToolKey) => {
    const seg = segRef.current
    const pill = pillRef.current
    if (!seg || !pill) return
    const idx = TOOL_ORDER.indexOf(key)
    const item = itemRefs.current[idx]
    if (!item) return
    const sr = seg.getBoundingClientRect()
    const er = item.getBoundingClientRect()
    pill.style.width = er.width + 'px'
    pill.style.transform = `translateX(${er.left - sr.left - 3}px)`
  }, [])

  useEffect(() => { movePill(active) }, [active, movePill])

  useEffect(() => {
    const handler = () => movePill(active)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [active, movePill])

  const tool = TOOLS[active]
  const isSoon = 'soon' in tool && tool.soon
  const activeTool = tool as ActiveTool

  function openFilePicker() {
    if (!isSoon) fileInputRef.current?.click()
  }

  function handleFileChosen(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) return
    setPendingFile(file)
    router.push(activeTool.href)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileChosen(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDzDragging(false)
    if (isSoon) return
    const file = e.dataTransfer.files[0]
    if (file) handleFileChosen(file)
  }

  // V6: dropzone border color
  const borderColor = dzDragging
    ? (isSoon ? 'rgba(255,255,255,.18)' : activeTool.accentColor)
    : (isSoon ? 'rgba(255,255,255,.08)' : activeTool.accentColor)

  const dzBg = dzHovered && !isSoon
    ? 'rgba(255,255,255,.04)'
    : 'rgba(255,255,255,.025)'

  const btnShadow = btnHovered && !isSoon
    ? `0 4px 16px ${activeTool.glowColor}`
    : 'none'

  return (
    <>
      {/* V6 fadeUp keyframes — injected once */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hub-eyebrow { animation: fadeUp .4s ease .05s both; }
        .hub-h1      { animation: fadeUp .4s ease .1s  both; }
        .hub-body    { animation: fadeUp .4s ease .16s both; }
      `}</style>

      <section
        style={{
          padding: '60px 0 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Indigo radial glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: -60, left: '50%',
            transform: 'translateX(-50%)',
            width: 560, height: 320,
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,.09) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', width: '100%' }}>

          {/* Eyebrow — V6 fadeUp */}
          <p
            className="hub-eyebrow"
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.28)',
              marginBottom: 14,
              position: 'relative',
            }}
          >
            100% local &nbsp;·&nbsp; zero uploads &nbsp;·&nbsp; works offline
          </p>

          {/* H1 — V6 fadeUp */}
          <h1
            className="hub-h1"
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(38px, 6vw, 62px)',
              fontWeight: 400,
              lineHeight: 1.06,
              letterSpacing: '-.5px',
              marginBottom: 10,
              position: 'relative',
            }}
          >
            Edit PDFs.<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.45)' }}>Your file stays here.</em>
          </h1>

          {/* Segmented control + dropzone — V6 fadeUp container */}
          <div className="hub-body">

            {/* Segmented control */}
            <div style={{ width: '100%', marginTop: 32, marginBottom: 10 }}>
              <div
                ref={segRef}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'stretch',
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.09)',
                  borderRadius: 10,
                  padding: 3,
                  position: 'relative',
                }}
              >
                {/* Animated pill */}
                <div
                  ref={pillRef}
                  style={{
                    position: 'absolute',
                    top: 3, left: 3,
                    height: 'calc(100% - 6px)',
                    background: '#fff',
                    borderRadius: 7,
                    boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                    transition: 'transform .26s cubic-bezier(.34,1.56,.64,1), width .26s cubic-bezier(.34,1.56,.64,1)',
                    pointerEvents: 'none',
                    willChange: 'transform, width',
                  }}
                />

                {TOOL_ORDER.map((key, idx) => {
                  const t = TOOLS[key]
                  const isSoonTool = 'soon' in t && t.soon
                  const isActive = active === key

                  return (
                    <div
                      key={key}
                      ref={el => { itemRefs.current[idx] = el }}
                      onClick={() => {
                        setActive(key)
                        setBtnHovered(false)
                      }}
                      style={{
                        flex: 1,
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        padding: '7px 8px',
                        cursor: 'pointer',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '.07em',
                        color: isActive ? '#0b0d14' : 'rgba(255,255,255,.38)',
                        borderRadius: 7,
                        whiteSpace: 'nowrap',
                        transition: 'color .18s',
                        opacity: isSoonTool ? 0.28 : 1,
                        userSelect: 'none',
                      }}
                      onMouseEnter={e => {
                        if (!isActive && !isSoonTool)
                          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.6)'
                      }}
                      onMouseLeave={e => {
                        if (!isActive && !isSoonTool)
                          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.38)'
                      }}
                    >
                      {SEG_ICONS[key]}
                      {t.label}
                      {isSoonTool && (
                        <span style={{
                          fontSize: 7, fontWeight: 700, letterSpacing: '.05em',
                          textTransform: 'uppercase',
                          background: 'rgba(255,255,255,.1)',
                          padding: '1px 4px', borderRadius: 3,
                        }}>SOON</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Unified drop zone */}
            <div
              onClick={openFilePicker}
              onDragOver={e => { e.preventDefault(); if (!isSoon) setDzDragging(true) }}
              onDragLeave={() => setDzDragging(false)}
              onDrop={handleDrop}
              onMouseEnter={() => setDzHovered(true)}
              onMouseLeave={() => { setDzHovered(false); setDzDragging(false) }}
              style={{
                width: '100%',
                border: `1.5px solid ${borderColor}`,
                borderRadius: 12,
                background: dzBg,
                overflow: 'hidden',
                cursor: isSoon ? 'default' : 'pointer',
                transition: 'border-color .2s, background .2s',
              }}
            >
              {/* Tool identity strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 20px 14px',
                borderBottom: '1px solid rgba(255,255,255,.07)',
                textAlign: 'left',
              }}>
                <div style={{
                  width: 34, height: 34,
                  borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  background: isSoon ? 'rgba(255,255,255,.07)' : activeTool.iconBg,
                  transition: 'background .2s',
                }}>
                  {tool.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.04em', color: '#f4f6fc', lineHeight: 1.1 }}>
                    {tool.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.4, marginTop: 2 }}>
                    {isSoon ? 'Not available yet' : activeTool.desc}
                  </div>
                </div>
              </div>

              {/* Active tool — drop + CTA */}
              {!isSoon && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '32px 24px 28px',
                }}>
                  <svg
                    style={{ marginBottom: 4, opacity: dzHovered ? .36 : .22, transition: 'opacity .18s' }}
                    width="44" height="52" viewBox="0 0 44 52" fill="none"
                  >
                    <rect x="1" y="1" width="42" height="50" rx="5" stroke="white" strokeWidth="1.5"/>
                    <path d="M28 1v12h12" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M9 24h16M9 31h12M9 38h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
                  </svg>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,.5)' }}>
                    {dzDragging ? 'Drop it!' : activeTool.dropLabel}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,.26)' }}>
                    {activeTool.dropSub}
                  </p>
                  <button
                    onClick={e => { e.stopPropagation(); openFilePicker() }}
                    onMouseEnter={() => setBtnHovered(true)}
                    onMouseLeave={() => setBtnHovered(false)}
                    style={{
                      marginTop: 6,
                      padding: '9px 28px',
                      borderRadius: 7,
                      background: btnHovered ? activeTool.btnHover : activeTool.btnColor,
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      letterSpacing: '.02em',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background .14s, box-shadow .14s',
                      boxShadow: btnShadow,
                    }}
                  >
                    Open PDF
                  </button>
                </div>
              )}

              {/* Soon state */}
              {isSoon && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '32px 24px 28px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.3)',
                    background: 'rgba(255,255,255,.06)',
                    border: '1px solid rgba(255,255,255,.09)',
                    padding: '3px 9px',
                    borderRadius: 20,
                    marginBottom: 4,
                  }}>
                    Coming soon
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', textAlign: 'center', lineHeight: 1.55, maxWidth: 300 }}>
                    {(tool as SoonTool).soonText}
                  </p>
                </div>
              )}
            </div>

          </div>{/* /hub-body */}
        </div>
      </section>
    </>
  )
}
