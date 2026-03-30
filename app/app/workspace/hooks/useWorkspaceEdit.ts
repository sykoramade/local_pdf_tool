'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { EditMap, ExtractedTextItem, FieldData, FabricLayerRef, CommittedEdit } from '@/lib/pdf/types'
import type { ToolDef } from '@/app/workspace/workspace-types'

export function useWorkspaceEdit(file: File | null, activeTool: ToolDef) {
  const [editMap, setEditMap] = useState<EditMap>(new Map())
  const [textItems, setTextItems] = useState<ExtractedTextItem[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const histRef = useRef<EditMap[]>([new Map()])
  const [hIdx, setHIdx] = useState(0)
  const fabricLayerRefs = useRef<Map<number, FabricLayerRef>>(new Map())
  // committedEdits: outer key = pageNum, inner key = blockKey ('block_0', etc.)
  const [committedEdits, setCommittedEdits] = useState<Map<number, Map<string, CommittedEdit>>>(new Map())

  /* Reset edit state when file is cleared */
  useEffect(() => {
    if (file === null) {
      setEditMap(new Map())
      setTextItems([])
      histRef.current = [new Map()]
      setHIdx(0)
      setSelectedFieldId(null)
      setCommittedEdits(new Map())
    }
  }, [file])

  /* Functional-update hPush avoids stale hIdx closure */
  const hPush = useCallback((nextMap: EditMap) => {
    setHIdx(prev => {
      const newHist = histRef.current.slice(0, prev + 1)
      newHist.push(nextMap)
      histRef.current = newHist
      return newHist.length - 1
    })
  }, [])

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

  const handleTextItems = useCallback((items: ExtractedTextItem[]) => setTextItems(items), [])

  const handleCommit = useCallback((pageNum: number, blockKey: string, edit: CommittedEdit) => {
    setCommittedEdits(prev => {
      const next = new Map(prev)
      const pageMap = new Map(next.get(pageNum) ?? [])
      pageMap.set(blockKey, edit)
      next.set(pageNum, pageMap)
      return next
    })
  }, [])

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

  /* Keyboard handler for Ctrl+F search (edit mode only) */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && activeTool.key === 'edit' && file) {
        e.preventDefault()
        setSearchOpen(prev => !prev)
        if (searchOpen) setSearchQuery('')
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool.key, file, searchOpen])

  return {
    editMap,
    textItems,
    selectedFieldId,
    setSelectedFieldId,
    hIdx,
    histRef,
    hPush,
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
  }
}
