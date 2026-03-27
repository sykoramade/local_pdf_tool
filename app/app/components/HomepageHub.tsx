'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { setPendingFile } from '@/lib/pending-file'
import { TOOL_HEX, type ToolKey } from '@/lib/ui/tool-colors'

/* ─── Types ─── */
type MoreKey = 'merge' | 'split'

interface ToolDef {
  color: string
  name: string
  desc: string
  hint: string
  href: string | null  // null = PRO gate, no navigation
  pro?: boolean
}

interface MoreTool {
  name: string
  desc: string
  hint: string
  href: string
}

/* ─── Tool data (v2 TM spec) ─── */
const TOOLS: Record<ToolKey, ToolDef> = {
  edit:     { color: TOOL_HEX.edit,     name: 'Edit',     desc: 'Click any text to edit it directly',       hint: 'contracts · invoices · forms · CVs',         href: '/workspace?tool=edit' },
  sign:     { color: TOOL_HEX.sign,     name: 'Sign',     desc: 'Draw and place your signature',             hint: 'contracts · agreements · forms',               href: '/workspace?tool=sign' },
  annotate: { color: TOOL_HEX.annotate, name: 'Annotate', desc: 'Highlight text · sticky notes · flags',     hint: 'research · reviews · legal documents',         href: '/workspace?tool=annotate' },
  redact:   { color: TOOL_HEX.redact,   name: 'Redact',   desc: 'Permanently remove sensitive content',      hint: 'GDPR · HIPAA · legal redaction',               href: '/workspace?tool=redact' },
  compress: { color: TOOL_HEX.compress, name: 'Compress', desc: 'Reduce file size before sharing',           hint: 'any PDF · any size',                           href: '/workspace?tool=compress' },
}

const MORE_TOOLS: Record<MoreKey, MoreTool> = {
  merge: { name: 'Merge', desc: 'Combine multiple PDFs into one',     hint: 'combine multiple files into one', href: '/' },
  split: { name: 'Split', desc: 'Extract pages or split into parts',  hint: 'extract pages · create sections', href: '/' },
}

const TOOL_ORDER: ToolKey[] = ['edit', 'sign', 'annotate', 'redact', 'compress']
const MORE_ORDER: MoreKey[] = ['merge', 'split']

/* ─── Inline SVG defs (reusable via <use href="#ic-..."/>) ─── */
const SVG_DEFS = `
<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="ic-edit" viewBox="0 0 16 16"><path d="M11.5 1.5a1.5 1.5 0 0 1 2.12 2.12l-8.5 8.5-2.83.71.71-2.83 8.5-8.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="ic-sign" viewBox="0 0 16 16"><path d="M2 12c2-3 4-5 5-5s1 2 2 2 2-1 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M13 12h1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></symbol>
  <symbol id="ic-annotate" viewBox="0 0 16 16"><rect x="2" y="5" width="8" height="1.5" rx=".75" fill="currentColor" opacity=".5"/><rect x="2" y="8" width="10" height="1.5" rx=".75" fill="currentColor" opacity=".5"/><rect x="2" y="11" width="6" height="1.5" rx=".75" fill="currentColor" opacity=".5"/><rect x="1" y="4" width="3" height="9" rx="1.5" fill="currentColor"/></symbol>
  <symbol id="ic-redact" viewBox="0 0 16 16"><rect x="2" y="5" width="12" height="6" rx="1.5" fill="currentColor"/><line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></symbol>
  <symbol id="ic-compress" viewBox="0 0 16 16"><path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="ic-pages" viewBox="0 0 16 16"><rect x="2" y="3" width="7" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="7" y="4" width="7" height="9" rx="1" fill="currentColor" opacity=".25"/><rect x="7" y="4" width="7" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/></symbol>
  <symbol id="ic-upload" viewBox="0 0 24 24"><path d="M12 15V3M7 8l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
</svg>
`

const TOOL_ICON_IDS: Record<ToolKey, string> = {
  edit: 'ic-edit', sign: 'ic-sign', annotate: 'ic-annotate',
  redact: 'ic-redact', compress: 'ic-compress',
}

export default function HomepageHub() {
  const router = useRouter()
  const [active, setActive] = useState<ToolKey>('edit')
  const [moreActive, setMoreActive] = useState<MoreKey>('merge')
  const [moreOpen, setMoreOpen] = useState(false)
  const [dzHovered, setDzHovered] = useState(false)
  const [dzDragging, setDzDragging] = useState(false)
  const [moreDzHovered, setMoreDzHovered] = useState(false)
  const [moreDzDragging, setMoreDzDragging] = useState(false)

  // Main selector pill
  const segRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const pillRef = useRef<HTMLDivElement>(null)

  // More tools selector pill
  const moreSegRef = useRef<HTMLDivElement>(null)
  const moreItemRefs = useRef<(HTMLDivElement | null)[]>([])
  const morePillRef = useRef<HTMLDivElement>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const moreFileInputRef = useRef<HTMLInputElement>(null)

  const tool = TOOLS[active]
  const moreTool = MORE_TOOLS[moreActive]

  const movePill = useCallback((
    key: string,
    order: string[],
    segEl: HTMLDivElement | null,
    pillEl: HTMLDivElement | null,
    refs: (HTMLDivElement | null)[],
  ) => {
    if (!segEl || !pillEl) return
    const idx = order.indexOf(key)
    const item = refs[idx]
    if (!item) return
    const sr = segEl.getBoundingClientRect()
    const er = item.getBoundingClientRect()
    pillEl.style.width = er.width + 'px'
    pillEl.style.transform = `translateX(${er.left - sr.left - 3}px)`
  }, [])

  useEffect(() => {
    movePill(active, TOOL_ORDER, segRef.current, pillRef.current, itemRefs.current)
  }, [active, movePill])

  useEffect(() => {
    if (moreOpen) {
      setTimeout(() => {
        movePill(moreActive, MORE_ORDER, moreSegRef.current, morePillRef.current, moreItemRefs.current)
      }, 50)
    }
  }, [moreActive, moreOpen, movePill])

  useEffect(() => {
    const handler = () => {
      movePill(active, TOOL_ORDER, segRef.current, pillRef.current, itemRefs.current)
      if (moreOpen) {
        movePill(moreActive, MORE_ORDER, moreSegRef.current, morePillRef.current, moreItemRefs.current)
      }
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [active, moreActive, moreOpen, movePill])

  function openFilePicker() {
    if (!tool.pro) fileInputRef.current?.click()
  }

  function openMoreFilePicker() {
    moreFileInputRef.current?.click()
  }

  function handleFileChosen(file: File, href: string) {
    if (!file.name.toLowerCase().endsWith('.pdf')) return
    setPendingFile(file)
    router.push(href)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && tool.href) handleFileChosen(file, tool.href)
    e.target.value = ''
  }

  function handleMoreInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileChosen(file, moreTool.href)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDzDragging(false)
    if (tool.pro || !tool.href) return
    const file = e.dataTransfer.files[0]
    if (file) handleFileChosen(file, tool.href)
  }

  function handleMoreDrop(e: React.DragEvent) {
    e.preventDefault()
    setMoreDzDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileChosen(file, moreTool.href)
  }

  // Drop zone border/bg derived from tool color
  const dzBorderColor = dzDragging
    ? tool.color
    : dzHovered ? tool.color : 'rgba(255,255,255,.14)'
  const dzBg = (dzHovered || dzDragging) && !tool.pro
    ? `${tool.color}0f`
    : 'rgba(255,255,255,.025)'

  const moreDzBg = (moreDzHovered || moreDzDragging)
    ? 'rgba(251,146,60,.07)'
    : 'rgba(251,146,60,.025)'

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hub-eyebrow { animation: fadeUp .22s ease .05s both; }
        .hub-h1      { animation: fadeUp .22s ease .1s  both; }
        .hub-body    { animation: fadeUp .22s ease .16s both; }
        .dz-btn-main { font-family: var(--font-sans); }
        .dz-btn-main:hover { transform: translateY(-1px); }
        .dz-btn-main:active { transform: scale(.98); }
        .more-toggle:hover { opacity: .8; }
        .trust-item:nth-child(1) { animation: fadeUp .22s ease .55s both; opacity:0; }
        .trust-item:nth-child(2) { animation: fadeUp .22s ease .62s both; opacity:0; }
        .trust-item:nth-child(3) { animation: fadeUp .22s ease .69s both; opacity:0; }
        .trust-item:nth-child(4) { animation: fadeUp .22s ease .76s both; opacity:0; }
      `}</style>

      {/* SVG icon defs */}
      <div dangerouslySetInnerHTML={{ __html: SVG_DEFS }} />

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleInputChange} />
      <input ref={moreFileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleMoreInputChange} />

      <section
        style={{
          padding: '72px 0 64px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Radial glow */}
        <div aria-hidden style={{
          position: 'absolute', top: -60, left: '50%',
          transform: 'translateX(-50%)',
          width: 700, height: 400,
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', width: '100%' }}>

          {/* Eyebrow */}
          <p className="hub-eyebrow" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11, letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,.28)',
            marginBottom: 14, position: 'relative',
          }}>
            100% local &nbsp;·&nbsp; zero uploads &nbsp;·&nbsp; works offline
          </p>

          {/* H1 */}
          <h1 className="hub-h1" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 7vw, 52px)',
            fontWeight: 400, lineHeight: 1.08, letterSpacing: '-.4px',
            marginBottom: 32, position: 'relative',
          }}>
            Edit PDFs.<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.28)' }}>Your file stays here.</em>
          </h1>

          <div className="hub-body">

            {/* ── 5-tab selector ── */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <div
                ref={segRef}
                style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 11, padding: 3, position: 'relative',
                }}
              >
                {/* Animated pill */}
                <div
                  ref={pillRef}
                  style={{
                    position: 'absolute', top: 3, left: 3,
                    height: 'calc(100% - 6px)',
                    background: tool.color + '33', borderRadius: 8,
                    border: `1px solid ${tool.color}55`,
                    boxShadow: 'none',
                    transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), width .28s cubic-bezier(.34,1.56,.64,1), background .18s, border-color .18s',
                    pointerEvents: 'none', zIndex: 0,
                  }}
                />

                {TOOL_ORDER.map((key, idx) => {
                  const t = TOOLS[key]
                  const isActive = active === key
                  return (
                    <div
                      key={key}
                      ref={el => { itemRefs.current[idx] = el }}
                      onClick={() => setActive(key)}
                      style={{
                        flex: 1, position: 'relative', zIndex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 6, padding: '10px 8px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
                        textTransform: 'uppercase',
                        color: isActive ? t.color : 'rgba(255,255,255,.3)',
                        cursor: 'pointer', userSelect: 'none',
                        transition: 'color .18s', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.65)'
                      }}
                      onMouseLeave={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.3)'
                      }}
                    >
                      <svg
                        width="14" height="14"
                        viewBox="0 0 16 16"
                        style={{
                          flexShrink: 0,
                          color: isActive ? t.color : 'currentColor',
                          opacity: isActive ? 1 : 0.7,
                        }}
                      >
                        <use href={`#${TOOL_ICON_IDS[key]}`} />
                      </svg>
                      {t.name}
                      {t.pro && (
                        <span style={{
                          fontSize: 7, fontWeight: 700,
                          background: isActive ? 'rgba(249,112,102,.18)' : 'rgba(249,112,102,.12)',
                          color: isActive ? '#f97066' : 'rgba(249,112,102,.6)',
                          padding: '1px 4px', borderRadius: 3, marginLeft: 2,
                        }}>PRO</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Drop zone ── */}
            {tool.pro ? (
              /* Redact PRO placeholder */
              <div style={{
                borderRadius: 16,
                border: '1.5px dashed rgba(249,112,102,.25)',
                background: 'rgba(249,112,102,.03)',
                padding: '52px 32px',
                textAlign: 'center',
                marginBottom: 14,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                  background: 'rgba(249,112,102,.12)',
                }}>
                  <svg width="26" height="26" viewBox="0 0 16 16" style={{ color: '#f97066' }}>
                    <use href="#ic-redact" />
                  </svg>
                </div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 17, fontWeight: 500, color: 'rgba(255,255,255,.55)', marginBottom: 8,
                }}>
                  Permanent redaction
                </div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13, color: 'rgba(255,255,255,.28)', marginBottom: 22,
                }}>
                  GDPR · HIPAA · legal redaction
                </div>
                <span style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                  textTransform: 'uppercase', color: '#f97066',
                  background: 'rgba(249,112,102,.1)',
                  border: '1px solid rgba(249,112,102,.2)',
                  padding: '5px 14px', borderRadius: 20,
                }}>
                  Pro feature — coming soon
                </span>
              </div>
            ) : (
              <div
                onClick={openFilePicker}
                onDragOver={e => { e.preventDefault(); setDzDragging(true) }}
                onDragLeave={() => setDzDragging(false)}
                onDrop={handleDrop}
                onMouseEnter={() => setDzHovered(true)}
                onMouseLeave={() => { setDzHovered(false); setDzDragging(false) }}
                style={{
                  borderRadius: 16,
                  border: `1.5px ${dzDragging ? 'solid' : 'dashed'} ${dzBorderColor}`,
                  background: dzBg,
                  padding: '52px 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color .25s, background .25s',
                  position: 'relative', overflow: 'hidden',
                  marginBottom: 14,
                }}
              >
                {/* Tool color icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                  background: `${tool.color}25`,
                  transition: 'background .25s',
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" style={{ color: tool.color }}>
                    <use href="#ic-upload" />
                  </svg>
                </div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 17, fontWeight: 500, color: 'rgba(255,255,255,.85)',
                  marginBottom: 8, letterSpacing: '-.1px',
                }}>
                  {dzDragging ? 'Drop it!' : 'Drop your PDF here'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13, color: 'rgba(255,255,255,.28)', marginBottom: 22,
                }}>
                  {tool.hint}
                </div>
                <button
                  className="dz-btn-main"
                  onClick={e => { e.stopPropagation(); openFilePicker() }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 26px', borderRadius: 9,
                    fontSize: 13, fontWeight: 600, letterSpacing: '.02em',
                    color: active === 'annotate' ? '#0b0d14' : '#fff',
                    background: tool.color,
                    border: 'none', cursor: 'pointer',
                    transition: 'transform .15s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" style={{ color: active === 'annotate' ? '#0b0d14' : '#fff' }}>
                    <use href="#ic-upload" />
                  </svg>
                  Browse files
                </button>
              </div>
            )}

            {/* ── Tool descriptor line ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-sans)',
              fontSize: 13, color: 'rgba(255,255,255,.5)',
              padding: '2px 0 16px', textAlign: 'left',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${tool.color}22`, flexShrink: 0,
              }}>
                <svg width="13" height="13" viewBox="0 0 16 16" style={{ color: tool.color }}>
                  <use href={`#${TOOL_ICON_IDS[active]}`} />
                </svg>
              </div>
              <span style={{ fontWeight: 600, color: tool.color }}>{tool.name}</span>
              <span>— {tool.desc}</span>
            </div>

            {/* ── More Tools section ── */}
            <div style={{ height: 1, background: 'rgba(255,255,255,.07)', margin: '4px 0 0' }} />

            <div
              className="more-toggle"
              onClick={() => setMoreOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 4px', cursor: 'pointer', userSelect: 'none',
                transition: 'opacity .15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12, fontWeight: 600, letterSpacing: '.14em',
                color: 'rgba(255,255,255,.55)',
              }}>MORE TOOLS</span>
              <svg
                width="16" height="16" viewBox="0 0 14 14"
                style={{
                  color: 'rgba(255,255,255,.5)',
                  transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)',
                  transform: moreOpen ? 'rotate(180deg)' : 'none',
                }}
              >
                <polyline points="2,4 7,9 12,4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* More Tools drawer */}
            <div style={{
              overflow: 'hidden',
              maxHeight: moreOpen ? '400px' : '0',
              opacity: moreOpen ? 1 : 0,
              transition: 'max-height .3s cubic-bezier(.4,0,.2,1), opacity .25s',
            }}>
              <div style={{ paddingBottom: 14 }}>

                {/* Merge/Split sub-selector */}
                <div
                  ref={moreSegRef}
                  style={{
                    display: 'flex',
                    background: 'rgba(255,255,255,.05)',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 11, padding: 3, position: 'relative',
                    marginBottom: 12,
                  }}
                >
                  <div
                    ref={morePillRef}
                    style={{
                      position: 'absolute', top: 3, left: 3,
                      height: 'calc(100% - 6px)',
                      background: 'rgba(251,146,60,.20)', borderRadius: 8,
                      border: '1px solid rgba(251,146,60,.35)',
                      boxShadow: 'none',
                      transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), width .28s cubic-bezier(.34,1.56,.64,1)',
                      pointerEvents: 'none', zIndex: 0,
                    }}
                  />
                  {MORE_ORDER.map((key, idx) => {
                    const t = MORE_TOOLS[key]
                    const isActive = moreActive === key
                    return (
                      <div
                        key={key}
                        ref={el => { moreItemRefs.current[idx] = el }}
                        onClick={() => setMoreActive(key)}
                        style={{
                          flex: 1, position: 'relative', zIndex: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 6, padding: '10px 8px',
                          fontFamily: 'var(--font-sans)',
                          fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          color: isActive ? '#fb923c' : 'rgba(255,255,255,.3)',
                          cursor: 'pointer', userSelect: 'none',
                          transition: 'color .18s', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.65)'
                        }}
                        onMouseLeave={e => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.3)'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>
                          <use href="#ic-pages" />
                        </svg>
                        {t.name}
                      </div>
                    )
                  })}
                </div>

                {/* More Tools drop zone */}
                <div
                  onClick={openMoreFilePicker}
                  onDragOver={e => { e.preventDefault(); setMoreDzDragging(true) }}
                  onDragLeave={() => setMoreDzDragging(false)}
                  onDrop={handleMoreDrop}
                  onMouseEnter={() => setMoreDzHovered(true)}
                  onMouseLeave={() => { setMoreDzHovered(false); setMoreDzDragging(false) }}
                  style={{
                    borderRadius: 16,
                    border: `1.5px ${moreDzDragging ? 'solid' : 'dashed'} rgba(251,146,60,${moreDzHovered || moreDzDragging ? '.5' : '.25'})`,
                    background: moreDzBg,
                    padding: '36px 28px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color .25s, background .25s',
                    marginBottom: 8,
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                    background: 'rgba(251,146,60,.15)',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" style={{ color: '#fb923c' }}>
                      <use href="#ic-upload" />
                    </svg>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,.75)', marginBottom: 6,
                  }}>
                    {moreDzDragging ? 'Drop it!' : `Drop PDFs here to ${moreActive}`}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12, color: 'rgba(255,255,255,.28)', marginBottom: 18,
                  }}>
                    {moreTool.hint}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); openMoreFilePicker() }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '9px 20px', borderRadius: 8,
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12, fontWeight: 600, color: '#fff',
                      background: '#fb923c', border: 'none', cursor: 'pointer',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" style={{ color: '#fff' }}>
                      <use href="#ic-upload" />
                    </svg>
                    Browse files
                  </button>
                </div>

                {/* More descriptor line */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13, color: 'rgba(255,255,255,.5)',
                  padding: '8px 0 2px', textAlign: 'left',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(251,146,60,.15)', flexShrink: 0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" style={{ color: '#fb923c' }}>
                      <use href="#ic-pages" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 600, color: '#fb923c' }}>{moreTool.name}</span>
                  <span>— {moreTool.desc}</span>
                </div>

              </div>
            </div>

            {/* ── Trust row ── */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
              gap: '6px 18px', marginTop: 28,
            }}>
              {[
                ['Files never uploaded', '#22d3a0'],
                ['No account required', '#22d3a0'],
                ['No watermark',         '#22d3a0'],
                ['Free to use',          '#22d3a0'],
              ].map(([text, color]) => (
                <span
                  key={text}
                  className="trust-item"
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <span style={{ color, fontSize: 12 }}>✓</span>
                  {text}
                </span>
              ))}
            </div>

          </div>{/* /hub-body */}
        </div>
      </section>
    </>
  )
}
