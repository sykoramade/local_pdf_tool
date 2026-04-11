'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { TOOLS, SVG_DEFS, type ToolDef, type ToolKey } from '@/app/workspace/workspace-types'
import type { FieldData } from '@/lib/pdf/types'
import { formatBytes } from '@/lib/pdf/compress'
import SignatureModal from '@/app/components/SignatureModal'
import SelRail from '@/app/components/workspace/SelRail'
import L3Strip from '@/app/components/workspace/L3Strip'
import PageRail from '@/app/components/workspace/PageRail'
import CanvasArea from '@/app/components/workspace/CanvasArea'
import { useWorkspaceFile } from '@/app/workspace/hooks/useWorkspaceFile'
import { useWorkspaceEdit } from '@/app/workspace/hooks/useWorkspaceEdit'
import { useWorkspaceActions } from '@/app/workspace/hooks/useWorkspaceActions'

const DrawingCanvas = dynamic(() => import('@/app/components/DrawingCanvas'), { ssr: false })

export default function WorkspaceShell() {
  const searchParams = useSearchParams()

  const initialKey = (searchParams.get('tool') ?? 'edit') as ToolKey
  const initialTool = TOOLS.find(t => t.key === initialKey) ?? TOOLS[0]

  const [activeTool, setActiveTool] = useState<ToolDef>(initialTool)
  const [editMode, setEditMode] = useState<'select' | 'text'>('text')
  const [canvasSelectedField, setCanvasSelectedField] = useState<FieldData | null>(null)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  // ── Hooks ──
  const fileHook = useWorkspaceFile()
  const editHook = useWorkspaceEdit(fileHook.file, activeTool)
  const actionsHook = useWorkspaceActions({
    activeTool,
    file: fileHook.file,
    pdfBytes: fileHook.pdfBytes,
    activePage: fileHook.activePage,
    editMap: editHook.editMap,
    textItems: editHook.textItems,
    fabricLayerRefs: editHook.fabricLayerRefs,
    committedEdits: editHook.committedEdits,
  })

  const handleSelectTool = useCallback((key: ToolKey) => {
    const tool = TOOLS.find(t => t.key === key)
    if (tool && !tool.pro) setActiveTool(tool)
  }, [])

  const handleCanvasFieldChange = useCallback((patch: Partial<FieldData>) => {
    if (!canvasSelectedField) return
    // Update canvas selected field to trigger toolbar UI update
    const updated: FieldData = { ...canvasSelectedField, ...patch }
    setCanvasSelectedField(updated)
    // Apply the change to the active Fabric IText object on the current page
    const fabricLayerRef = editHook.fabricLayerRefs.current.get(fileHook.activePage)
    fabricLayerRef?.applyFieldChange(patch)
  }, [canvasSelectedField, editHook.fabricLayerRefs, fileHook.activePage])

  const handleUndoSnapshot = useCallback((pageNum: number, snapshot: string) => {
    // Push snapshot to undo stack and clear redo stack
    setUndoStack(prev => [...prev, snapshot])
    setRedoStack([])
  }, [])

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return
    const fabricLayerRef = editHook.fabricLayerRefs.current.get(fileHook.activePage)
    if (!fabricLayerRef) return
    const fc = fabricLayerRef.getFabricCanvas()
    if (!fc) return

    // Get the state to redo
    const currentState = JSON.stringify(fc.toObject())

    // Pop from undo stack
    const snapshotToRestore = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    setRedoStack(prev => [...prev, currentState])

    // Load the canvas state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fc.loadFromJSON(JSON.parse(snapshotToRestore), () => {
      fc.renderAll()
    })
  }, [undoStack, editHook.fabricLayerRefs, fileHook.activePage])

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return
    const fabricLayerRef = editHook.fabricLayerRefs.current.get(fileHook.activePage)
    if (!fabricLayerRef) return
    const fc = fabricLayerRef.getFabricCanvas()
    if (!fc) return

    // Get the current state to push to undo
    const currentState = JSON.stringify(fc.toObject())

    // Pop from redo stack
    const snapshotToRestore = redoStack[redoStack.length - 1]
    setRedoStack(prev => prev.slice(0, -1))
    setUndoStack(prev => [...prev, currentState])

    // Load the canvas state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fc.loadFromJSON(JSON.parse(snapshotToRestore), () => {
      fc.renderAll()
    })
  }, [redoStack, editHook.fabricLayerRefs, fileHook.activePage])

  /* Keep ?tool= URL param in sync — use history API to avoid React remounting */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tool', activeTool.key)
    window.history.replaceState(null, '', `/workspace?${params.toString()}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool.key])

  const {
    file,
    pdfBytes,
    isDragging,
    pageCount,
    activePage,
    pageRefsMap,
    canvasScrollRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileSelect,
    handleClearFile,
    handlePageClick,
    handleAddPage,
    handlePageCount,
  } = fileHook

  const {
    editMap,
    selectedFieldId,
    setSelectedFieldId,
    hIdx,
    histRef,
    histUndo,
    histRedo,
    handleEdit,
    handleFieldChange,
    handleTextItems,
    fabricLayerRefs,
    committedEdits,
    handleCommit,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    textItems,
  } = editHook

  const {
    scale,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    sigMode,
    sigModalOpen,
    setSigModalOpen,
    sigs,
    handleOpenSigModal,
    handleSigModalConfirm,
    handleCancelSig,
    handleSigPlace,
    handleSigMove,
    handleSigDelete,
    annotateMode,
    annotations,
    handleAnnotateModeChange,
    handleAnnotate,
    handleAnnotationMove,
    handleAnnotationDelete,
    images,
    imageInputRef,
    handleInsertImageClick,
    handleImageFileSelect,
    handleImageMove,
    handleImageResize,
    handleImageDelete,
    drawMode,
    setDrawMode,
    handleDrawClick,
    handleDrawDone,
    compressEnabled,
    compressStats,
    compressLoading,
    handleToggleCompress,
    redactTargets,
    setRedactTargets,
    redactInput,
    setRedactInput,
    downloadError,
    handleDownload,
  } = actionsHook

  // Compute per-target match counts from extracted text items
  const redactMatchCounts: Record<string, number> = {}
  if (redactTargets.length > 0 && textItems.length > 0) {
    for (const target of redactTargets) {
      const tLower = target.toLowerCase().trim()
      if (!tLower) continue
      let count = 0
      for (const item of textItems) {
        const s = item.str.toLowerCase()
        let pos = 0
        while ((pos = s.indexOf(tLower, pos)) !== -1) { count++; pos += tLower.length }
      }
      redactMatchCounts[target] = count
    }
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: SVG_DEFS }} />

      <SignatureModal
        open={sigModalOpen}
        onClose={() => setSigModalOpen(false)}
        onConfirm={handleSigModalConfirm}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleImageFileSelect(f)
          e.target.value = ''
        }}
      />

      {drawMode && (() => {
        const pageEl = pageRefsMap.current.get(activePage)
        const rect = pageEl?.getBoundingClientRect()
        if (!rect) return null
        return (
          <DrawingCanvas
            pageRect={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
            onDone={handleDrawDone}
            onCancel={() => setDrawMode(false)}
          />
        )
      })()}

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
        {/* ── Header: back arrow | filename | zoom | search | download ── */}
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

          {file && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.75}
                aria-label="Zoom out"
                style={{ background: 'none', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6, color: scale <= 0.75 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.6)', cursor: scale <= 0.75 ? 'default' : 'pointer', fontSize: 14, fontWeight: 700, lineHeight: 1, padding: '3px 8px' }}
              >−</button>
              <button
                onClick={handleZoomReset}
                aria-label="Reset zoom"
                style={{ background: 'none', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6, color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '3px 7px', minWidth: 44, textAlign: 'center' }}
              >{Math.round(scale * 100)}%</button>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 3}
                aria-label="Zoom in"
                style={{ background: 'none', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6, color: scale >= 3 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.6)', cursor: scale >= 3 ? 'default' : 'pointer', fontSize: 14, fontWeight: 700, lineHeight: 1, padding: '3px 8px' }}
              >+</button>
            </div>
          )}

          {file && activeTool.key === 'edit' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              {searchOpen ? (
                <>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Find text…"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    style={{
                      fontSize: 12,
                      padding: '3px 8px',
                      background: 'rgba(255,255,255,.07)',
                      border: '1px solid rgba(255,255,255,.18)',
                      borderRadius: 6,
                      color: 'rgba(255,255,255,.85)',
                      outline: 'none',
                      width: 160,
                    }}
                  />
                  <button
                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                    aria-label="Close search"
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}
                  >×</button>
                </>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Find text (Ctrl+F)"
                  title="Find text (Ctrl+F)"
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6, color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 12, padding: '3px 8px' }}
                >Find</button>
              )}
            </div>
          )}

          {downloadError && (
            <span style={{ fontSize: 11, color: '#f87171', maxWidth: 220 }} title={downloadError}>
              ⚠ Download failed
            </span>
          )}
        </header>

        {/* ── L2: tool selector rail + L3 contextual strip ── */}
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
              editMode={editMode}
              onEditModeChange={setEditMode}
              selectedField={activeTool.key === 'edit' ? (canvasSelectedField ?? (selectedFieldId ? editMap.get(selectedFieldId) ?? null : null)) : (selectedFieldId ? editMap.get(selectedFieldId) ?? null : null)}
              editCount={editMap.size}
              canUndo={canvasSelectedField ? undoStack.length > 0 : hIdx > 0}
              canRedo={canvasSelectedField ? redoStack.length > 0 : hIdx < histRef.current.length - 1}
              onFieldChange={canvasSelectedField ? handleCanvasFieldChange : handleFieldChange}
              onUndo={canvasSelectedField ? handleUndo : histUndo}
              onRedo={canvasSelectedField ? handleRedo : histRedo}
              compressEnabled={compressEnabled}
              compressStats={compressStats}
              compressLoading={compressLoading}
              onToggleCompress={handleToggleCompress}
              sigMode={sigMode}
              sigCount={sigs.length}
              onOpenSigModal={handleOpenSigModal}
              onCancelSig={handleCancelSig}
              annotateMode={annotateMode}
              onAnnotateModeChange={handleAnnotateModeChange}
              imageCount={images.length}
              onInsertImageClick={handleInsertImageClick}
              drawMode={drawMode}
              onDrawClick={handleDrawClick}
              redactTargets={redactTargets}
              redactMatchCounts={redactMatchCounts}
              redactInput={redactInput}
              onRedactInputChange={setRedactInput}
              onRedactTargetsChange={setRedactTargets}
            />
          </div>
        </div>

        {/* ── ws-body: [page-rail LEFT 64px] [canvas RIGHT flex:1] ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <PageRail
            pageCount={pageCount}
            activePage={activePage}
            onPageClick={handlePageClick}
            onAddPage={handleAddPage}
            pdfBytes={pdfBytes}
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
            onBlockSelect={setCanvasSelectedField}
            pageRefs={pageRefsMap}
            sigMode={sigMode}
            onSigPlace={handleSigPlace}
            sigs={sigs}
            onSigMove={handleSigMove}
            onSigDelete={handleSigDelete}
            isPro={false}
            canvasScrollRef={canvasScrollRef}
            annotateMode={annotateMode}
            onAnnotate={handleAnnotate}
            annotations={annotations}
            onAnnotationMove={handleAnnotationMove}
            onAnnotationDelete={handleAnnotationDelete}
            images={images}
            onImageMove={handleImageMove}
            onImageResize={handleImageResize}
            onImageDelete={handleImageDelete}
            onRedact={(item) => {
              const txt = item.str.trim()
              if (txt && !redactTargets.includes(txt)) setRedactTargets([...redactTargets, txt])
            }}
            redactTargets={redactTargets}
            fabricLayerRefs={fabricLayerRefs}
            scale={scale}
            searchQuery={searchQuery}
            editMode={editMode}
            committedEdits={committedEdits}
            onCommit={handleCommit}
            onUndoSnapshot={handleUndoSnapshot}
          />
        </div>
      </div>

      {/* Floating Save PDF button */}
      {file && (
        <button
          aria-label="Save PDF"
          onClick={handleDownload}
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 40,
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            padding: '14px 28px',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '.02em',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(99,102,241,.45)',
            transition: 'background .2s, box-shadow .2s, transform .1s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#4f46e5'
            e.currentTarget.style.boxShadow = '0 6px 32px rgba(99,102,241,.6)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#6366f1'
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,.45)'
            e.currentTarget.style.transform = 'none'
          }}
        >
          Save PDF
        </button>
      )}
    </>
  )
}
