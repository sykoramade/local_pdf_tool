'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { EditMap, ExtractedTextItem, SigEntry, Annotation, ImageEntry, FabricLayerRef, CommittedEdit } from '@/lib/pdf/types'
import type { ToolDef, SigMode, AMode } from '@/app/workspace/workspace-types'

interface ActionsInput {
  activeTool: ToolDef
  file: File | null
  pdfBytes: Uint8Array | null
  activePage: number
  editMap: EditMap
  textItems: ExtractedTextItem[]
  fabricLayerRefs: React.MutableRefObject<Map<number, FabricLayerRef>>
  committedEdits: Map<number, Map<string, CommittedEdit>>
}

export function useWorkspaceActions({
  activeTool,
  file,
  pdfBytes,
  activePage,
  editMap,
  textItems,
  fabricLayerRefs,
  committedEdits,
}: ActionsInput) {
  /* Zoom */
  const [scale, setScale] = useState(1.5)
  const handleZoomIn = useCallback(() => setScale(s => Math.min(3, Math.round((s + 0.25) * 100) / 100)), [])
  const handleZoomOut = useCallback(() => setScale(s => Math.max(0.75, Math.round((s - 0.25) * 100) / 100)), [])
  const handleZoomReset = useCallback(() => setScale(1.5), [])

  /* Sign */
  const [sigMode, setSigMode] = useState<SigMode>('idle')
  const [sigModalOpen, setSigModalOpen] = useState(false)
  const [pendingSigPayload, setPendingSigPayload] = useState<Pick<SigEntry, 'text' | 'drawingDataUrl'> | null>(null)
  const [sigs, setSigs] = useState<SigEntry[]>([])

  const handleOpenSigModal = useCallback(() => setSigModalOpen(true), [])
  const handleSigModalConfirm = useCallback((sig: Pick<SigEntry, 'text' | 'drawingDataUrl'>) => {
    setPendingSigPayload(sig)
    setSigModalOpen(false)
    setSigMode('placing')
  }, [])
  const handleCancelSig = useCallback(() => {
    setSigMode('idle')
    setPendingSigPayload(null)
  }, [])
  const handleSigPlace = useCallback((pageNum: number, xPct: number, yPct: number) => {
    if (!pendingSigPayload) return
    setSigs(prev => [...prev, { id: crypto.randomUUID(), ...pendingSigPayload, pageNum, xPct, yPct, widthPct: 20 }])
    setSigMode('idle')
    setPendingSigPayload(null)
  }, [pendingSigPayload])
  const handleSigMove = useCallback((id: string, xPct: number, yPct: number) => {
    setSigs(prev => prev.map(s => s.id === id ? { ...s, xPct, yPct } : s))
  }, [])
  const handleSigDelete = useCallback((id: string) => {
    setSigs(prev => prev.filter(s => s.id !== id))
  }, [])

  /* Annotate */
  const [annotateMode, setAnnotateMode] = useState<AMode>('yellow')
  const [annotations, setAnnotations] = useState<Annotation[]>([])

  const handleAnnotateModeChange = useCallback((m: AMode) => setAnnotateMode(m), [])
  const handleAnnotate = useCallback((ann: Annotation) => {
    setAnnotations(prev => {
      if (ann.type === 'highlight' && ann.itemId) {
        const exists = prev.find(a => a.type === 'highlight' && (a as typeof ann).itemId === ann.itemId)
        if (exists) return prev.filter(a => a.id !== exists.id)
      }
      return [...prev, ann]
    })
  }, [])
  const handleAnnotationMove = useCallback((id: string, xPct: number, yPct: number) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, xPct, yPct } : a))
  }, [])
  const handleAnnotationDelete = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
  }, [])

  /* Images */
  const [images, setImages] = useState<ImageEntry[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleInsertImageClick = useCallback(() => {
    imageInputRef.current?.click()
  }, [])
  const handleImageFileSelect = useCallback((f: File) => {
    const mimeType: ImageEntry['mimeType'] = f.type === 'image/png' ? 'png' : 'jpeg'
    const reader = new FileReader()
    reader.onload = () => {
      setImages(prev => [...prev, {
        id: crypto.randomUUID(),
        dataUrl: reader.result as string,
        mimeType,
        page: activePage,
        xPct: 50,
        yPct: 50,
        widthPct: 30,
      }])
    }
    reader.readAsDataURL(f)
  }, [activePage])
  const handleImageMove = useCallback((id: string, xPct: number, yPct: number) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, xPct, yPct } : img))
  }, [])
  const handleImageResize = useCallback((id: string, widthPct: number) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, widthPct } : img))
  }, [])
  const handleImageDelete = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }, [])

  /* Draw */
  const [drawMode, setDrawMode] = useState(false)
  const handleDrawClick = useCallback(() => setDrawMode(prev => !prev), [])
  const handleDrawDone = useCallback((dataUrl: string) => {
    setImages(prev => [...prev, {
      id: crypto.randomUUID(),
      dataUrl,
      mimeType: 'png' as const,
      page: activePage,
      xPct: 50,
      yPct: 50,
      widthPct: 100,
    }])
    setDrawMode(false)
  }, [activePage])

  /* Compress */
  const [compressEnabled, setCompressEnabled] = useState(true)
  const [compressStats, setCompressStats] = useState<{ original: number; compressed: number; pct: number } | null>(null)
  const [compressLoading, setCompressLoading] = useState(false)

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

  /* Redact */
  const [redactTargets, setRedactTargets] = useState<string[]>([])
  const [redactInput, setRedactInput] = useState('')

  /* Download */
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
      const canvasTextboxes = Array.from(fabricLayerRefs.current.values())
        .flatMap(layer => layer.getTextboxes())
      // Fallback: if CanvasTextLayer is unmounted (tool switched away), use committedEdits
      if (canvasTextboxes.length === 0 && committedEdits.size > 0) {
        committedEdits.forEach(pageMap => {
          pageMap.forEach(edit => {
            canvasTextboxes.push({
              text: edit.text,
              anchorItem: edit.anchorItem,
              blockBounds: edit.blockBounds,
              fontSize: edit.fontSize,
              fontFamily: edit.fontFamily,
              fontWeight: edit.fontWeight,
              fontStyle: edit.fontStyle,
              fill: edit.fill,
            })
          })
        })
      }
      if (canvasTextboxes.length > 0) {
        const { applyCanvasEditsAndSave } = await import('@/lib/pdf/canvas-save')
        outputBytes = await applyCanvasEditsAndSave(outputBytes, canvasTextboxes, scale)
        outputName = file.name.replace(/\.pdf$/i, '_edited.pdf')
      }
      if (sigs.length > 0) {
        const typedSigs = sigs.filter(s => s.text)
        const drawnSigs = sigs.filter(s => s.drawingDataUrl)
        if (typedSigs.length > 0) {
          const { embedTypedSignature } = await import('@/lib/pdf/signature')
          outputBytes = await embedTypedSignature(
            outputBytes,
            typedSigs.map(s => ({
              pageNum: s.pageNum,
              xPct: s.xPct,
              yPct: s.yPct,
              text: s.text!,
              widthPct: s.widthPct,
            })),
          )
        }
        if (drawnSigs.length > 0) {
          const { applySignatures } = await import('@/lib/pdf/signature')
          outputBytes = await applySignatures(
            outputBytes,
            drawnSigs.map(s => ({
              pageNum: s.pageNum,
              xPct: s.xPct,
              yPct: s.yPct,
              widthPct: s.widthPct,
              dataUrl: s.drawingDataUrl!,
            })),
          )
        }
        if (outputName === file.name) {
          outputName = file.name.replace(/\.pdf$/i, '_signed.pdf')
        }
      }
      if (images.length > 0) {
        const { embedImages } = await import('@/lib/pdf/image')
        outputBytes = await embedImages(outputBytes, images)
        if (outputName === file.name) {
          outputName = file.name.replace(/\.pdf$/i, '_edited.pdf')
        }
      }
      if (annotations.length > 0) {
        const { applyAnnotations } = await import('@/lib/pdf/annotate')
        outputBytes = await applyAnnotations(outputBytes, annotations)
        if (outputName === file.name) {
          outputName = file.name.replace(/\.pdf$/i, '_annotated.pdf')
        }
      }
      if (activeTool.key === 'redact' && redactTargets.length > 0) {
        const { redactPdf } = await import('@/lib/pdf/redact')
        const result = await redactPdf(outputBytes, redactTargets)
        outputBytes = result.bytes
        outputName = file.name.replace(/\.pdf$/i, '_redacted.pdf')
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
  }, [pdfBytes, file, editMap, textItems, fabricLayerRefs, committedEdits, sigs, images, annotations, compressEnabled, activeTool.key, redactTargets, scale])

  return {
    /* Zoom */
    scale,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    /* Sign */
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
    /* Annotate */
    annotateMode,
    annotations,
    handleAnnotateModeChange,
    handleAnnotate,
    handleAnnotationMove,
    handleAnnotationDelete,
    /* Images */
    images,
    imageInputRef,
    handleInsertImageClick,
    handleImageFileSelect,
    handleImageMove,
    handleImageResize,
    handleImageDelete,
    /* Draw */
    drawMode,
    setDrawMode,
    handleDrawClick,
    handleDrawDone,
    /* Compress */
    compressEnabled,
    compressStats,
    compressLoading,
    handleToggleCompress,
    /* Redact */
    redactTargets,
    setRedactTargets,
    redactInput,
    setRedactInput,
    /* Download */
    downloadError,
    handleDownload,
  }
}
