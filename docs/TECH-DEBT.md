# Tech Debt

## ESLint @typescript-eslint rule suppressed

**Files affected:** `AnnotateTool.tsx`, `CanvasTextLayer.tsx`, `PdfViewer.tsx`, `SigOverlay.tsx`, `PageRail.tsx`, `SignTool.tsx`, `redact.ts` — 35 `eslint-disable-next-line @typescript-eslint/no-explicit-any` comments.

**Why Option 2 over Option 1:** Option 1 (activate the rule) would block every commit until all 35 `any` usages are typed or individually justified. Option 2 (declare plugin, set rule off) unblocks the hook immediately with zero source changes. The disable comments remain as in-code markers of where `any` is used.

**Cleanup:** Install `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` as peer deps, change the rule to `"error"`, then fix or justify each of the 35 sites. Estimated: ~1 sprint block.
