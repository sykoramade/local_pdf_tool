'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { consumePendingFile } from '@/lib/pending-file'
import { addBlankPage } from '@/lib/pdf/pages'

export function useWorkspaceFile() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [activePage, setActivePage] = useState(1)

  const pageRefsMap = useRef<Map<number, HTMLDivElement>>(new Map())
  const canvasScrollRef = useRef<HTMLDivElement>(null)

  /* Consume file handed off from homepage hub */
  useEffect(() => {
    const pending = consumePendingFile()
    if (pending) setFile(pending)
  }, [])

  /* Convert File → Uint8Array; reset derived state when file is cleared */
  useEffect(() => {
    if (!file) {
      setPdfBytes(null)
      setPageCount(0)
      pageRefsMap.current.clear()
      return
    }
    let cancelled = false
    file.arrayBuffer().then(buf => {
      if (!cancelled) setPdfBytes(new Uint8Array(buf))
    })
    return () => { cancelled = true }
  }, [file])

  /* Sync active page thumbnail when user scrolls canvas */
  useEffect(() => {
    if (!pageRefsMap.current.size) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const pageNum = Array.from(pageRefsMap.current.entries())
            .find(([, el]) => el === visible.target)?.[0]
          if (pageNum !== undefined) setActivePage(pageNum)
        }
      },
      { root: canvasScrollRef.current, threshold: [0.3, 0.6] },
    )
    pageRefsMap.current.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [pageCount]) // re-run when PDF loads (pageCount changes)

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

  const handleClearFile = useCallback(() => {
    setFile(null)
    setActivePage(1)
  }, [])

  const handlePageClick = useCallback((n: number) => {
    setActivePage(n)
    const el = pageRefsMap.current.get(n)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleAddPage = useCallback(async (afterPage: number) => {
    if (!pdfBytes) return
    const newBytes = await addBlankPage(pdfBytes, afterPage - 1)
    setPdfBytes(newBytes)
  }, [pdfBytes])

  const handlePageCount = useCallback((n: number) => setPageCount(n), [])

  return {
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
  }
}
