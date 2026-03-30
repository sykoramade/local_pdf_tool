'use client'

import { useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { ToolDef, SigMode, AMode } from '@/app/workspace/workspace-types'
import type {
  EditMap,
  FieldData,
  ExtractedTextItem,
  SigEntry,
  Annotation,
  ImageEntry,
  FabricLayerRef,
  CommittedEdit,
} from '@/lib/pdf/types'

const PdfViewer = dynamic(() => import('@/app/components/PdfViewer'), { ssr: false })

function SvgIcon({ id, size = 16, style }: { id: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} style={style} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}

export default function CanvasArea({
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
  sigMode,
  onSigPlace,
  sigs,
  onSigMove,
  onSigDelete,
  isPro,
  canvasScrollRef,
  annotateMode,
  onAnnotate,
  annotations,
  onAnnotationMove,
  onAnnotationDelete,
  images,
  onImageMove,
  onImageDelete,
  onRedact,
  redactTargets = [],
  fabricLayerRefs,
  scale = 1.5,
  searchQuery = '',
  editMode,
  committedEdits,
  onCommit,
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
  sigMode?: SigMode
  onSigPlace?: (pageNum: number, xPct: number, yPct: number) => void
  sigs: SigEntry[]
  onSigMove: (id: string, xPct: number, yPct: number) => void
  onSigDelete: (id: string) => void
  isPro: boolean
  canvasScrollRef?: React.RefObject<HTMLDivElement>
  annotateMode?: AMode | null
  onAnnotate?: (ann: Annotation) => void
  annotations?: Annotation[]
  onAnnotationMove?: (id: string, xPct: number, yPct: number) => void
  onAnnotationDelete?: (id: string) => void
  images?: ImageEntry[]
  onImageMove?: (id: string, xPct: number, yPct: number) => void
  onImageDelete?: (id: string) => void
  onRedact?: (item: ExtractedTextItem) => void
  redactTargets?: string[]
  fabricLayerRefs?: React.MutableRefObject<Map<number, FabricLayerRef>>
  scale?: number
  searchQuery?: string
  editMode?: 'select' | 'text'
  committedEdits?: Map<number, Map<string, CommittedEdit>>
  onCommit?: (pageNum: number, blockKey: string, edit: CommittedEdit) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (!pageRefs || !onSigPlace) return
    const pages = pageRefs.current
    for (const [pageNum, el] of Array.from(pages.entries())) {
      const rect = el.getBoundingClientRect()
      if (e.clientY >= rect.top && e.clientY <= rect.bottom &&
          e.clientX >= rect.left && e.clientX <= rect.right) {
        const xPct = ((e.clientX - rect.left) / rect.width) * 100
        const yPct = ((e.clientY - rect.top) / rect.height) * 100
        onSigPlace(pageNum, Math.max(0, Math.min(100, xPct)), Math.max(0, Math.min(100, yPct)))
        return
      }
    }
    // Fallback: use page 1
    const first = pages.get(1)
    if (first) {
      const rect = first.getBoundingClientRect()
      const xPct = ((e.clientX - rect.left) / rect.width) * 100
      const yPct = ((e.clientY - rect.top) / rect.height) * 100
      onSigPlace(1, Math.max(0, Math.min(100, xPct)), Math.max(0, Math.min(100, yPct)))
    }
  }, [pageRefs, onSigPlace])

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
      <PdfViewer
        pdfBytes={pdfBytes}
        scale={scale}
        editMap={readOnlyMap}
        onEdit={noOpEdit}
        onLoad={onPageCount}
        onTextItems={onTextItems}
        pageRefs={pageRefs}
        sigs={[]}
        onSigMove={() => {}}
        onSigDelete={() => {}}
        isPro={isPro}
        images={images}
        onImageMove={onImageMove}
        onImageDelete={onImageDelete}
        onRedact={onRedact}
        redactTargets={redactTargets}
      />
    )
  } else {
    /* All tools (edit, sign, annotate, compress) render the PDF canvas via PdfViewer */
    const isEdit = activeTool.key === 'edit'
    toolContent = (
      <PdfViewer
        pdfBytes={pdfBytes}
        scale={scale}
        editMap={isEdit ? editMap : readOnlyMap}
        onEdit={isEdit ? onEdit : noOpEdit}
        onLoad={onPageCount}
        onTextItems={onTextItems}
        onFieldSelect={isEdit ? onFieldSelect : undefined}
        pageRefs={pageRefs}
        sigs={sigs}
        onSigMove={onSigMove}
        onSigDelete={onSigDelete}
        isPro={isPro}
        annotateMode={activeTool.key === 'annotate' ? annotateMode : null}
        onAnnotate={onAnnotate}
        annotations={annotations}
        onAnnotationMove={onAnnotationMove}
        onAnnotationDelete={onAnnotationDelete}
        images={images}
        onImageMove={onImageMove}
        onImageDelete={onImageDelete}
        useCanvasLayer={isEdit}
        fabricLayerRefs={isEdit ? fabricLayerRefs : undefined}
        searchQuery={isEdit ? searchQuery : undefined}
        editMode={isEdit ? editMode : undefined}
        committedEdits={isEdit ? committedEdits : undefined}
        onCommit={isEdit ? onCommit : undefined}
      />
    )
  }

  return (
    <div
      ref={canvasScrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 14px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ ...cardStyle, position: 'relative' }}>
        {toolContent}
        {sigMode === 'placing' && (
          <div
            onClick={handleOverlayClick}
            style={{
              position: 'absolute',
              inset: 0,
              cursor: 'crosshair',
              zIndex: 10,
              background: 'rgba(34,211,160,.03)',
              border: '2px solid rgba(34,211,160,.35)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                background: 'rgba(34,211,160,.92)',
                color: '#0b0d14',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                pointerEvents: 'none',
                userSelect: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,.3)',
              }}
            >
              Click to place signature
            </span>
          </div>
        )}
        {activeTool.key === 'annotate' && (annotateMode === 'note' || annotateMode === 'check') && onAnnotate && (
          <div
            onClick={(e: React.MouseEvent) => {
              if (!pageRefs) return
              const pages = pageRefs.current
              for (const [pageNum, el] of Array.from(pages.entries())) {
                const rect = el.getBoundingClientRect()
                if (e.clientY >= rect.top && e.clientY <= rect.bottom &&
                    e.clientX >= rect.left && e.clientX <= rect.right) {
                  const xPct = ((e.clientX - rect.left) / rect.width) * 100
                  const yPct = ((e.clientY - rect.top) / rect.height) * 100
                  if (annotateMode === 'note') {
                    onAnnotate({ type: 'sticky-note', id: crypto.randomUUID(), pageNum, text: '', xPct, yPct })
                  } else {
                    onAnnotate({ type: 'check', id: crypto.randomUUID(), pageNum, xPct, yPct })
                  }
                  return
                }
              }
            }}
            style={{
              position: 'absolute',
              inset: 0,
              cursor: 'crosshair',
              zIndex: 10,
            }}
          />
        )}
      </div>
    </div>
  )
}
