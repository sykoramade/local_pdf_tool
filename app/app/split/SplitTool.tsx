'use client'

import { useState } from 'react'
import PdfDropzone from '@/app/components/PdfDropzone'
import AuthModal from '@/app/components/AuthModal'
import { useUser } from '@/hooks/useUser'
import { canUse, incrementUses } from '@/lib/usage'

type Mode = 'all-pages' | 'range'
type Status = 'idle' | 'splitting' | 'done' | 'error'

function downloadBytes(bytes: Uint8Array, name: string) {
  const blob = new Blob(
    [bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer],
    { type: 'application/pdf' }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  // Append to DOM for Safari compatibility, then remove
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Delay revoke so the browser has time to initiate the download
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function SplitTool() {
  const { user } = useUser()
  const [showAuthGate, setShowAuthGate] = useState(false)

  // File state
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [filename, setFilename] = useState('')

  // Options
  const [mode, setMode] = useState<Mode>('all-pages')
  const [fromPage, setFromPage] = useState(1)
  const [toPage, setToPage] = useState(1)

  // Process state
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [resultCount, setResultCount] = useState(0)

  function handleLoad(bytes: Uint8Array, name: string) {
    setPdfBytes(bytes)
    setFilename(name)
    setStatus('idle')
    setErrorMsg('')
  }

  function reset() {
    setPdfBytes(null)
    setFilename('')
    setMode('all-pages')
    setFromPage(1)
    setToPage(1)
    setStatus('idle')
    setErrorMsg('')
    setResultCount(0)
  }

  async function handleSplit() {
    if (!pdfBytes) return

    if (!user && !canUse()) {
      setShowAuthGate(true)
      return
    }

    // Client-side range validation before hitting the lib
    if (mode === 'range' && toPage < fromPage) {
      setErrorMsg('End page must be greater than or equal to start page.')
      setStatus('error')
      return
    }

    setStatus('splitting')
    setErrorMsg('')

    try {
      const { splitPdf } = await import('@/lib/pdf/split')

      const rangeArg =
        mode === 'range' ? { start: fromPage, end: toPage } : undefined

      const result = await splitPdf(pdfBytes, mode, rangeArg)

      // Download all files before marking done / incrementing usage
      if (result.files.length === 1) {
        downloadBytes(result.files[0].bytes, result.files[0].name)
      } else {
        for (let i = 0; i < result.files.length; i++) {
          await new Promise<void>(resolve => setTimeout(resolve, i * 200))
          downloadBytes(result.files[i].bytes, result.files[i].name)
        }
      }

      if (!user) incrementUses()
      setResultCount(result.files.length)
      setStatus('done')
    } catch (err) {
      setErrorMsg('Split failed. Please check your page range and try again.')
      setStatus('error')
    }
  }

  // ----------------------------------------------------------------
  // Dropzone screen
  // ----------------------------------------------------------------
  if (!pdfBytes) {
    return (
      <div className="max-w-xl mx-auto flex justify-center">
        <PdfDropzone onLoad={handleLoad} />
      </div>
    )
  }

  // ----------------------------------------------------------------
  // Options + action screen
  // ----------------------------------------------------------------
  return (
    <div className="max-w-xl mx-auto">
      {/* Filename bar */}
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-3 mb-4"
        style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
      >
        <button
          onClick={reset}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors shrink-0 rounded-lg hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,.4)' }}
          aria-label="Back to file selection"
        >
          ←
        </button>
        <span className="text-sm truncate flex-1" style={{ color: 'rgba(255,255,255,.7)' }} title={filename}>
          {filename}
        </span>
      </div>

      {/* Mode selector */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,.7)' }}>Split mode</p>

        <div className="space-y-3">
          {/* All pages option */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5 shrink-0">
              <input
                type="radio"
                name="split-mode"
                value="all-pages"
                checked={mode === 'all-pages'}
                onChange={() => setMode('all-pages')}
                className="w-4 h-4 accent-indigo-500"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-white block">All pages</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>
                Split every page into a separate PDF file (page-1.pdf, page-2.pdf, …)
              </span>
            </div>
          </label>

          {/* Page range option */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5 shrink-0">
              <input
                type="radio"
                name="split-mode"
                value="range"
                checked={mode === 'range'}
                onChange={() => setMode('range')}
                className="w-4 h-4 accent-indigo-500"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-white block">Page range</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>
                Extract a contiguous range of pages into one PDF
              </span>
            </div>
          </label>
        </div>

        {/* Range inputs — shown only when range mode selected */}
        {mode === 'range' && (
          <div className="mt-4 flex items-center gap-3 pl-7">
            <div className="flex flex-col gap-1">
              <label htmlFor="from-page" className="text-xs font-medium" style={{ color: 'rgba(255,255,255,.4)' }}>
                From page
              </label>
              <input
                id="from-page"
                type="number"
                min={1}
                value={fromPage}
                onChange={e => setFromPage(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 min-h-[44px] rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                style={{
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.15)',
                  color: 'rgba(255,255,255,.9)',
                }}
              />
            </div>
            <span className="text-sm mt-5" style={{ color: 'rgba(255,255,255,.4)' }}>to</span>
            <div className="flex flex-col gap-1">
              <label htmlFor="to-page" className="text-xs font-medium" style={{ color: 'rgba(255,255,255,.4)' }}>
                To page
              </label>
              <input
                id="to-page"
                type="number"
                min={1}
                value={toPage}
                onChange={e => setToPage(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 min-h-[44px] rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                style={{
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.15)',
                  color: 'rgba(255,255,255,.9)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status messages */}
      {status === 'error' && (
        <p className="text-sm text-red-400 text-center mb-4">{errorMsg}</p>
      )}

      {status === 'done' && (
        <div
          className="rounded-xl p-4 text-center mb-4"
          style={{ background: 'rgba(34,211,160,.08)', border: '1px solid rgba(34,211,160,.2)' }}
        >
          <p className="text-sm font-medium" style={{ color: '#22d3a0' }}>
            {resultCount === 1
              ? 'PDF extracted and downloaded.'
              : `Split into ${resultCount} files — downloads started.`}
          </p>
        </div>
      )}

      {/* Action button */}
      <div className="flex gap-3">
        <button
          onClick={handleSplit}
          disabled={status === 'splitting'}
          className="flex-1 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {status === 'splitting' ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Splitting…
            </>
          ) : (
            'Split PDF'
          )}
        </button>

        {status === 'done' && (
          <button
            onClick={reset}
            className="px-4 min-h-[44px] rounded-lg transition-colors text-sm"
            style={{ border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}
          >
            New file
          </button>
        )}
      </div>

      {showAuthGate && <AuthModal reason="gate" onClose={() => setShowAuthGate(false)} />}
    </div>
  )
}
