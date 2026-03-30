'use client'
import React from 'react'
import type { FieldData } from '@/lib/pdf/types'

interface EditToolbarProps {
  selectedField: FieldData | null
  editCount: number
  canUndo: boolean
  canRedo: boolean
  onFieldChange: (patch: Partial<FieldData>) => void
  onUndo: () => void
  onRedo: () => void
  hoveredFont?: string | null
}

const FONT_FAMILIES = ['Helvetica', 'Arial', 'Times New Roman', 'Courier', 'Georgia']

export default function EditToolbar({
  selectedField,
  editCount,
  canUndo,
  canRedo,
  onFieldChange,
  onUndo,
  onRedo,
  hoveredFont,
}: EditToolbarProps) {
  const isDisabled = selectedField === null

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 transition-opacity"
      style={{
        background: 'rgba(255,255,255,.03)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 9,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Font family — or hover hint when no field active */}
      {isDisabled && hoveredFont ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            height: 28,
            padding: '0 7px',
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 6,
            fontSize: 11,
            color: 'rgba(255,255,255,.35)',
            maxWidth: 96,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 10 }}>~</span>
          {hoveredFont}
        </div>
      ) : (
      <select
        disabled={isDisabled}
        value={selectedField?.family ?? 'Helvetica'}
        onChange={e => onFieldChange({ family: e.target.value })}
        onMouseDown={e => { if (!isDisabled) e.stopPropagation() }}
        style={{
          background: 'rgba(255,255,255,.07)',
          border: '1px solid rgba(255,255,255,.14)',
          borderRadius: 6,
          color: '#f4f6fc',
          fontSize: 11,
          padding: '4px 7px',
          height: 28,
          outline: 'none',
          cursor: isDisabled ? 'default' : 'pointer',
          maxWidth: 96,
        }}
      >
        {FONT_FAMILIES.map(f => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      )}

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.14)', flexShrink: 0 }} />

      {/* Size controls */}
      <div className="flex items-center gap-0.5">
        <button
          disabled={isDisabled}
          onMouseDown={e => e.preventDefault()}
          onClick={() => {
            const current = selectedField?.size ?? 12
            onFieldChange({ size: Math.max(6, current - 1) })
          }}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,.14)',
            borderRadius: 5,
            width: 22,
            height: 28,
            color: 'rgba(255,255,255,.5)',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDisabled ? 'default' : 'pointer',
          }}
          title="Decrease size"
        >
          −
        </button>
        <input
          disabled={isDisabled}
          type="number"
          value={selectedField?.size ?? 12}
          min={6}
          max={72}
          onChange={e => {
            const v = parseInt(e.target.value)
            if (!isNaN(v)) onFieldChange({ size: v })
          }}
          style={{
            width: 36,
            background: 'rgba(255,255,255,.07)',
            border: '1px solid rgba(255,255,255,.14)',
            borderRadius: 5,
            color: '#f4f6fc',
            fontSize: 11,
            textAlign: 'center',
            height: 28,
            outline: 'none',
            padding: '0 4px',
          }}
        />
        <button
          disabled={isDisabled}
          onMouseDown={e => e.preventDefault()}
          onClick={() => {
            const current = selectedField?.size ?? 12
            onFieldChange({ size: Math.min(72, current + 1) })
          }}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,.14)',
            borderRadius: 5,
            width: 22,
            height: 28,
            color: 'rgba(255,255,255,.5)',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDisabled ? 'default' : 'pointer',
          }}
          title="Increase size"
        >
          +
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.14)', flexShrink: 0 }} />

      {/* Color */}
      <label
        title="Text color"
        onMouseDown={e => e.preventDefault()}
        style={{
          position: 'relative',
          width: 24,
          height: 24,
          borderRadius: '50%',
          cursor: isDisabled ? 'default' : 'pointer',
          border: '2px solid rgba(255,255,255,.2)',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: selectedField?.color ?? '#000000',
            borderRadius: '50%',
          }}
        />
        <input
          disabled={isDisabled}
          type="color"
          value={selectedField?.color ?? '#000000'}
          onChange={e => onFieldChange({ color: e.target.value })}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: isDisabled ? 'default' : 'pointer',
            width: '100%',
            height: '100%',
          }}
        />
      </label>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.14)', flexShrink: 0 }} />

      {/* Bold */}
      <button
        disabled={isDisabled}
        onMouseDown={e => e.preventDefault()}
        onClick={() => onFieldChange({ bold: !selectedField?.bold })}
        title="Bold"
        style={{
          background: selectedField?.bold ? 'rgba(129,140,248,.18)' : 'none',
          border: selectedField?.bold ? '1px solid rgba(129,140,248,.5)' : '1px solid rgba(255,255,255,.08)',
          borderRadius: 6,
          width: 28,
          height: 28,
          color: selectedField?.bold ? '#818cf8' : 'rgba(255,255,255,.5)',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'Georgia,serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .15s',
          cursor: isDisabled ? 'default' : 'pointer',
        }}
      >
        B
      </button>

      {/* Italic */}
      <button
        disabled={isDisabled}
        onMouseDown={e => e.preventDefault()}
        onClick={() => onFieldChange({ italic: !selectedField?.italic })}
        title="Italic"
        style={{
          background: selectedField?.italic ? 'rgba(129,140,248,.18)' : 'none',
          border: selectedField?.italic ? '1px solid rgba(129,140,248,.5)' : '1px solid rgba(255,255,255,.08)',
          borderRadius: 6,
          width: 28,
          height: 28,
          color: selectedField?.italic ? '#818cf8' : 'rgba(255,255,255,.5)',
          fontSize: 13,
          fontStyle: 'italic',
          fontFamily: 'Georgia,serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .15s',
          cursor: isDisabled ? 'default' : 'pointer',
        }}
      >
        <em>I</em>
      </button>

      {/* Underline */}
      <button
        disabled={isDisabled}
        onMouseDown={e => e.preventDefault()}
        onClick={() => onFieldChange({ underline: !selectedField?.underline })}
        title="Underline"
        style={{
          background: selectedField?.underline ? 'rgba(129,140,248,.18)' : 'none',
          border: selectedField?.underline ? '1px solid rgba(129,140,248,.5)' : '1px solid rgba(255,255,255,.08)',
          borderRadius: 6,
          width: 28,
          height: 28,
          color: selectedField?.underline ? '#818cf8' : 'rgba(255,255,255,.5)',
          fontSize: 13,
          fontFamily: 'Georgia,serif',
          textDecoration: 'underline',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .15s',
          cursor: isDisabled ? 'default' : 'pointer',
        }}
      >
        U
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.14)', flexShrink: 0 }} />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Edit badge */}
      {editCount > 0 && (
        <>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 11px',
              borderRadius: 20,
              background: 'rgba(99,102,241,.15)',
              color: '#818cf8',
            }}
          >
            {editCount} edit{editCount !== 1 ? 's' : ''}
          </span>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.14)', flexShrink: 0 }} />
        </>
      )}

      {/* Undo */}
      <button
        disabled={!canUndo}
        onMouseDown={e => e.preventDefault()}
        onClick={onUndo}
        title="Undo (Cmd+Z)"
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,.14)',
          borderRadius: 6,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: !canUndo ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.5)',
          transition: 'color .15s, opacity .15s',
          opacity: !canUndo ? 0.4 : 1,
          cursor: !canUndo ? 'default' : 'pointer',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7H10a4 4 0 0 1 0 8H6" />
          <polyline points="3,4 3,7 6,7" />
        </svg>
      </button>

      {/* Redo */}
      <button
        disabled={!canRedo}
        onMouseDown={e => e.preventDefault()}
        onClick={onRedo}
        title="Redo (Cmd+Shift+Z)"
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,.14)',
          borderRadius: 6,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: !canRedo ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.5)',
          transition: 'color .15s, opacity .15s',
          opacity: !canRedo ? 0.4 : 1,
          cursor: !canRedo ? 'default' : 'pointer',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 7H6a4 4 0 0 0 0 8h4" />
          <polyline points="13,4 13,7 10,7" />
        </svg>
      </button>
    </div>
  )
}
