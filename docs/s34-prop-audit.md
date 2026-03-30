# S34 Prop Audit — Shell ↔ Child Interfaces

**Sprint:** S34
**Date:** 2026-03-28
**Status:** SIGN-OFF READY — TypeScript clean (`npx tsc --noEmit` = 0 errors)

This document lists every interface contract between `WorkspaceShell.tsx` and each hook/component it owns. Produced as the mandatory S34 gate item.

---

## Hooks

### `useWorkspaceFile()`

No input parameters. Returns:

| Name | Type | Source of truth |
|------|------|-----------------|
| `file` | `File \| null` | useState |
| `pdfBytes` | `Uint8Array \| null` | derived from file |
| `isDragging` | `boolean` | useState |
| `pageCount` | `number` | set by CanvasArea via onPageCount |
| `activePage` | `number` | IntersectionObserver sync |
| `pageRefsMap` | `MutableRefObject<Map<number, HTMLDivElement>>` | ref |
| `canvasScrollRef` | `RefObject<HTMLDivElement>` | ref |
| `handleDrop` | `(e: React.DragEvent) => void` | |
| `handleDragOver` | `(e: React.DragEvent) => void` | |
| `handleDragLeave` | `() => void` | |
| `handleFileSelect` | `(f: File) => void` | |
| `handleClearFile` | `() => void` | |
| `handlePageClick` | `(n: number) => void` | |
| `handleAddPage` | `(afterPage: number) => Promise<void>` | |
| `handlePageCount` | `(n: number) => void` | |

---

### `useWorkspaceEdit(file, activeTool)`

Input:

| Param | Type |
|-------|------|
| `file` | `File \| null` |
| `activeTool` | `ToolDef` |

Returns:

| Name | Type | Notes |
|------|------|-------|
| `editMap` | `EditMap` | Map<id, FieldData> |
| `textItems` | `ExtractedTextItem[]` | |
| `selectedFieldId` | `string \| null` | |
| `setSelectedFieldId` | `Dispatch<SetStateAction<string \| null>>` | |
| `hIdx` | `number` | history stack pointer |
| `histRef` | `MutableRefObject<EditMap[]>` | history stack |
| `hPush` | `(nextMap: EditMap) => void` | internal — not passed to children |
| `histUndo` | `() => void` | |
| `histRedo` | `() => void` | |
| `handleEdit` | `(id: string, fieldData: FieldData) => void` | |
| `handleFieldChange` | `(patch: Partial<FieldData>) => void` | |
| `handleTextItems` | `(items: ExtractedTextItem[]) => void` | |
| `fabricLayerRefs` | `MutableRefObject<Map<number, FabricLayerRef>>` | |
| `searchOpen` | `boolean` | |
| `setSearchOpen` | `Dispatch<SetStateAction<boolean>>` | |
| `searchQuery` | `string` | |
| `setSearchQuery` | `Dispatch<SetStateAction<string>>` | |

---

### `useWorkspaceActions({ activeTool, file, pdfBytes, activePage, editMap, textItems, fabricLayerRefs })`

Input interface `ActionsInput`:

| Param | Type |
|-------|------|
| `activeTool` | `ToolDef` |
| `file` | `File \| null` |
| `pdfBytes` | `Uint8Array \| null` |
| `activePage` | `number` |
| `editMap` | `EditMap` |
| `textItems` | `ExtractedTextItem[]` |
| `fabricLayerRefs` | `MutableRefObject<Map<number, FabricLayerRef>>` |

Returns:

| Name | Type | Domain |
|------|------|--------|
| `scale` | `number` | Zoom |
| `handleZoomIn` | `() => void` | Zoom |
| `handleZoomOut` | `() => void` | Zoom |
| `handleZoomReset` | `() => void` | Zoom |
| `sigMode` | `SigMode` | Sign |
| `sigModalOpen` | `boolean` | Sign |
| `setSigModalOpen` | `Dispatch<SetStateAction<boolean>>` | Sign |
| `sigs` | `SigEntry[]` | Sign |
| `handleOpenSigModal` | `() => void` | Sign |
| `handleSigModalConfirm` | `(sig: Pick<SigEntry, 'text' \| 'drawingDataUrl'>) => void` | Sign |
| `handleCancelSig` | `() => void` | Sign |
| `handleSigPlace` | `(pageNum: number, xPct: number, yPct: number) => void` | Sign |
| `handleSigMove` | `(id: string, xPct: number, yPct: number) => void` | Sign |
| `handleSigDelete` | `(id: string) => void` | Sign |
| `annotateMode` | `AMode` | Annotate |
| `annotations` | `Annotation[]` | Annotate |
| `handleAnnotateModeChange` | `(m: AMode) => void` | Annotate |
| `handleAnnotate` | `(ann: Annotation) => void` | Annotate |
| `handleAnnotationMove` | `(id: string, xPct: number, yPct: number) => void` | Annotate |
| `handleAnnotationDelete` | `(id: string) => void` | Annotate |
| `images` | `ImageEntry[]` | Images |
| `imageInputRef` | `RefObject<HTMLInputElement>` | Images |
| `handleInsertImageClick` | `() => void` | Images |
| `handleImageFileSelect` | `(f: File) => void` | Images |
| `handleImageMove` | `(id: string, xPct: number, yPct: number) => void` | Images |
| `handleImageDelete` | `(id: string) => void` | Images |
| `drawMode` | `boolean` | Draw |
| `setDrawMode` | `Dispatch<SetStateAction<boolean>>` | Draw |
| `handleDrawClick` | `() => void` | Draw |
| `handleDrawDone` | `(dataUrl: string) => void` | Draw |
| `compressEnabled` | `boolean` | Compress |
| `compressStats` | `{ original: number; compressed: number; pct: number } \| null` | Compress |
| `compressLoading` | `boolean` | Compress |
| `handleToggleCompress` | `() => void` | Compress |
| `redactTargets` | `string[]` | Redact |
| `setRedactTargets` | `Dispatch<SetStateAction<string[]>>` | Redact |
| `redactInput` | `string` | Redact |
| `setRedactInput` | `Dispatch<SetStateAction<string>>` | Redact |
| `downloadError` | `string \| null` | Download |
| `handleDownload` | `() => Promise<void>` | Download |

---

## Components

### `<SelRail />`

Props passed from Shell:

| Prop | Type | Value |
|------|------|-------|
| `activeTool` | `ToolDef` | Shell's `activeTool` state |
| `onSelect` | `(key: ToolKey) => void` | Shell's `handleSelectTool` |

---

### `<L3Strip />`

Props passed from Shell:

| Prop | Type | Source hook |
|------|------|-------------|
| `activeTool` | `ToolDef` | Shell state |
| `selectedField` | `FieldData \| null` | editHook |
| `editCount` | `number` | `editMap.size` |
| `canUndo` | `boolean` | `hIdx > 0` |
| `canRedo` | `boolean` | `hIdx < histRef.current.length - 1` |
| `onFieldChange` | `(patch: Partial<FieldData>) => void` | editHook |
| `onUndo` | `() => void` | editHook |
| `onRedo` | `() => void` | editHook |
| `compressEnabled` | `boolean` | actionsHook |
| `compressStats` | `{ original, compressed, pct } \| null` | actionsHook |
| `compressLoading` | `boolean` | actionsHook |
| `onToggleCompress` | `() => void` | actionsHook |
| `sigMode` | `SigMode` | actionsHook |
| `sigCount` | `number` | `sigs.length` |
| `onOpenSigModal` | `() => void` | actionsHook |
| `onCancelSig` | `() => void` | actionsHook |
| `annotateMode` | `AMode` | actionsHook |
| `onAnnotateModeChange` | `(m: AMode) => void` | actionsHook |
| `imageCount` | `number` | `images.length` |
| `onInsertImageClick` | `() => void` | actionsHook |
| `drawMode` | `boolean` | actionsHook |
| `onDrawClick` | `() => void` | actionsHook |
| `redactTargets` | `string[]` | actionsHook |

---

### `<PageRail />`

Props passed from Shell:

| Prop | Type | Source hook |
|------|------|-------------|
| `pageCount` | `number` | fileHook |
| `activePage` | `number` | fileHook |
| `onPageClick` | `(n: number) => void` | fileHook |
| `onAddPage` | `(afterPage: number) => void` | fileHook (optional) |
| `pdfBytes` | `Uint8Array \| null` | fileHook (optional) |

---

### `<CanvasArea />`

Props passed from Shell (22 props):

| Prop | Type | Source hook | Notes |
|------|------|-------------|-------|
| `hasFile` | `boolean` | `!!file` | fileHook |
| `pdfBytes` | `Uint8Array \| null` | fileHook | |
| `activeTool` | `ToolDef` | Shell state | |
| `editMap` | `EditMap` | editHook | |
| `onEdit` | `(id, fieldData) => void` | editHook | |
| `onPageCount` | `(n: number) => void` | fileHook | |
| `onTextItems` | `(items) => void` | editHook | |
| `filename` | `string` | `file?.name ?? ''` | fileHook |
| `isDragging` | `boolean` | fileHook | |
| `onDrop` | `(e: React.DragEvent) => void` | fileHook | |
| `onDragOver` | `(e: React.DragEvent) => void` | fileHook | |
| `onDragLeave` | `() => void` | fileHook | |
| `onFileSelect` | `(file: File) => void` | fileHook | |
| `onFieldSelect` | `(id: string) => void` | editHook (`setSelectedFieldId`) | optional |
| `pageRefs` | `MutableRefObject<Map<number, HTMLDivElement>>` | fileHook | optional |
| `sigMode` | `SigMode` | actionsHook | optional |
| `onSigPlace` | `(pageNum, xPct, yPct) => void` | actionsHook | optional |
| `sigs` | `SigEntry[]` | actionsHook | |
| `onSigMove` | `(id, xPct, yPct) => void` | actionsHook | |
| `onSigDelete` | `(id) => void` | actionsHook | |
| `isPro` | `boolean` | hardcoded `false` | |
| `canvasScrollRef` | `RefObject<HTMLDivElement>` | fileHook | optional |
| `annotateMode` | `AMode \| null` | actionsHook | optional |
| `onAnnotate` | `(ann: Annotation) => void` | actionsHook | optional |
| `annotations` | `Annotation[]` | actionsHook | optional |
| `onAnnotationMove` | `(id, xPct, yPct) => void` | actionsHook | optional |
| `onAnnotationDelete` | `(id) => void` | actionsHook | optional |
| `images` | `ImageEntry[]` | actionsHook | optional |
| `onImageMove` | `(id, xPct, yPct) => void` | actionsHook | optional |
| `onImageDelete` | `(id) => void` | actionsHook | optional |
| `redactTargets` | `string[]` | actionsHook | optional, default `[]` |
| `redactInput` | `string` | actionsHook | optional, default `''` |
| `onRedactTargetsChange` | `(targets: string[]) => void` | actionsHook (`setRedactTargets`) | optional |
| `onRedactInputChange` | `(val: string) => void` | actionsHook (`setRedactInput`) | optional |
| `fabricLayerRefs` | `MutableRefObject<Map<number, FabricLayerRef>>` | editHook | optional |
| `scale` | `number` | actionsHook | optional, default `1.5` |
| `searchQuery` | `string` | editHook | optional, default `''` |

---

### `<SignatureModal />`

Props passed from Shell:

| Prop | Type | Source |
|------|------|--------|
| `open` | `boolean` | `sigModalOpen` — actionsHook |
| `onClose` | `() => void` | `() => setSigModalOpen(false)` — inline |
| `onConfirm` | `(sig: Pick<SigEntry, 'text' \| 'drawingDataUrl'>) => void` | `handleSigModalConfirm` — actionsHook |

---

### `<DrawingCanvas />` (dynamic, rendered conditionally in Shell)

Rendered in Shell JSX (not inside CanvasArea) when `drawMode === true`.

| Prop | Type | Source |
|------|------|--------|
| `pageRect` | `{ left, top, width, height }` | derived from `pageRefsMap.current.get(activePage)?.getBoundingClientRect()` |
| `onDone` | `(dataUrl: string) => void` | `handleDrawDone` — actionsHook |
| `onCancel` | `() => void` | `() => setDrawMode(false)` — actionsHook |

---

## Shell-owned elements (not delegated to components)

| Element | Responsibility |
|---------|---------------|
| Header bar | Filename, zoom buttons, Find search bar, download error badge |
| Hidden `<input type="file">` for images | `imageInputRef` from actionsHook |
| DrawingCanvas overlay | Conditionally rendered when `drawMode` |
| Floating "Save PDF" button | `handleDownload`, `activeTool.key`, `redactTargets` |
| `<div dangerouslySetInnerHTML={{ __html: SVG_DEFS }} />` | Injects SVG sprite |
| URL sync `useEffect` | `window.history.replaceState` on `activeTool.key` change |

---

## Verification

- `npx tsc --noEmit` → **0 errors** (confirmed at completion of S34)
- Shell line count: **~330 lines** (target was <400) ✓
- All 3 hooks extracted and independently importable ✓
- No cross-hook imports (hooks are flat, Shell is the sole coordinator) ✓
