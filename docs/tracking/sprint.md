# Sprint Board

## Sprint 1 — COMPLETE ✅
**Completed:** 2026-03-11
**Goal:** Upload PDF → edit text inline → download with edits applied.

### Done
- [x] Font matching spike (~85% coverage confirmed)
- [x] lib/pdf/types.ts, font-map.ts, save.ts
- [x] Next.js 14 scaffold (TypeScript, Tailwind, App Router)
- [x] PdfDropzone, PdfViewer, PdfTextLayer, PdfEditor components
- [x] Full edit → save → download flow working
- [x] SEO metadata on page.tsx
- [x] Coordination layer (CLAUDE.md, docs/, /go skill)

---

## Sprint 2 — COMPLETE ✅
**Completed:** 2026-03-11
**Goal:** Get indexed. One additional tool. SEO foundation.

### Done
- [x] robots.txt
- [x] app/sitemap.ts (dynamic, all routes)
- [x] Root layout with metadataBase + shared OG defaults
- [x] /about page (trust + privacy explanation)
- [x] /guides/pdf-editor-no-upload (SEO content page)
- [x] /guides/mybestpdf-alternative (SEO content page)
- [x] /guides/edit-pdf-text-free (SEO content page)
- [x] lib/pdf/compress.ts (pdf-lib compression)
- [x] /compress page + CompressTool component
- [x] Homepage nav (Editor | Compress | About)

---

## Sprint 3 — COMPLETE ✅
**Completed:** 2026-03-12
**Goal:** Polish, error handling, mobile, and first real-world testing.

### Done
- [x] Mobile layout review — responsive scale (0.65×–1.5×) based on viewport width
- [x] Keyboard accessibility — tabIndex, role="button", Enter/Space to activate text items
- [x] Loading skeleton for PDF viewer — A4-shaped skeleton pages with animated shimmer
- [x] Handle password-protected PDFs gracefully — clear error message + "use Back button" hint
- [x] Handle oversized files (>20MB) — warning screen with "Load anyway" / "Choose another" options
- [x] "Edited" badge per page — per-page edit count badge above each page in viewer
- [x] Google Search Console setup instructions — docs/tracking/gsc-setup.md
- [x] Vercel deployment config — app/vercel.json with security headers

---

## Sprint 4 — COMPLETE ✅
**Completed:** 2026-03-12
**Goal:** PDF Merge tool + SEO content gap fill.

### Done
- [x] lib/pdf/merge.ts — in-browser PDF merge via pdf-lib
- [x] /merge page + MergeTool component (multi-file drop, reorder with ↑↓, merge, download)
- [x] Nav updated across all pages (Editor | Compress | Merge | About)
- [x] /guides/merge-pdf-free — SEO guide page
- [x] /guides/compress-pdf-free — SEO guide page (gap from Sprint 2)
- [x] sitemap.ts updated with all new routes

---

## Sprint 5 — COMPLETE ✅
**Completed:** 2026-03-12
**Goal:** Auth (Supabase) + soft usage gate. Email capture + conversion signal before billing.

### Done
- [x] @supabase/supabase-js + @supabase/ssr installed
- [x] lib/auth/client.ts — Supabase browser client (gracefully disabled if env vars absent)
- [x] lib/usage.ts — anonymous usage gate (3 uses/day, localStorage, resets midnight)
- [x] hooks/useUser.ts — React hook for session state + onAuthStateChange
- [x] components/AuthModal.tsx — email magic link + Google OAuth sign-in modal
- [x] components/NavBar.tsx — shared nav: active link, Sign In button, email display, usage counter
- [x] Usage gate wired into PdfEditor, CompressTool, MergeTool (download/merge action)
- [x] /account page — email, plan, usage today, sign out
- [x] All main pages switched to NavBar component (eliminates duplicated nav HTML)
- [x] .env.local.example — documents required env vars for Supabase + Stripe

### Setup required before auth works
MD needs to: create Supabase project → copy URL + anon key → create `.env.local` from `.env.local.example`

---

## Sprint 6 — COMPLETE ✅
**Completed:** 2026-03-12
**Goal:** Billing (Stripe). Pricing page, Pro plan, checkout, webhook.

### Done
- [x] stripe server SDK installed
- [x] lib/stripe/server.ts — Stripe client (server-side only, never bundled to client)
- [x] /api/stripe/create-checkout — POST: creates Stripe Checkout session for signed-in user
- [x] /api/stripe/webhook — POST: handles checkout.session.completed + subscription.deleted
- [x] useUser hook extended with isPro from user_profiles Supabase table
- [x] /pricing page — Free vs Pro comparison, Stripe checkout redirect
- [x] /billing/success page — post-payment confirmation
- [x] docs/supabase/schema.sql — user_profiles table + RLS + auto-create trigger
- [x] NavBar: Pricing link added
- [x] sitemap.ts: /pricing added
- [x] .env.local.example: all Sprint 6 env vars documented

### Setup required before billing works (MD actions)
1. Create Supabase project → run docs/supabase/schema.sql in SQL editor
2. Fill in .env.local from .env.local.example (Supabase URL, anon key, service role key)
3. Create Stripe product ($9/month Pro) → copy STRIPE_PRICE_ID to .env.local
4. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env.local
5. Register webhook URL in Stripe: https://yourdomain.com/api/stripe/webhook
   Events to listen for: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed

---

---

## Sprint 7 — COMPLETE ✅
**Completed:** 2026-03-13
**Goal:** Signature tool (privacy-first, mobile-first) + PDF Split lib + SEO guides.

### Done
- [x] lib/pdf/coords.ts — single source of truth for all coordinate math
- [x] lib/pdf/signature.ts — embed PNG signature into PDF at pct-based coordinates
- [x] lib/pdf/grid.ts — extract layout grid (baselines/columns) + snapToGrid utility
- [x] lib/pdf/split.ts — split PDF into pages or extract a range
- [x] /sign page + SignTool component
  - Real PDF.js page rendering (replaced demo placeholder pages)
  - Draw signature on canvas, drag-to-place overlay, commit + download signed PDF
  - Mobile-first: bottom sheet modal, touch events with preventDefault, FAB
  - Usage gate at placement; Pro resize handle; loading spinner + error states
- [x] NavBar: Sign link added
- [x] guides/sign-pdf-without-uploading — SEO guide
- [x] guides/gdpr-pdf-editor — SEO guide

---

## Sprint 8 — COMPLETE ✅
**Completed:** 2026-03-13
**Goal:** PDF Split UI + multi-page signing + localized SEO pages

### Done
- [x] /split page + SplitTool component (wires lib/pdf/split.ts)
  - All-pages and page-range modes, client-side validation, staggered downloads
  - Safari-compatible download, usage gate + AuthModal
- [x] Multi-page signing via IntersectionObserver active-page tracking
- [x] /guides/hipaa-friendly-pdf-editor — HIPAA-friendly positioning guide with disclaimer
- [x] /guides/de/datenschutz-pdf-editor — German SEO page (DSGVO/GDPR market)
- [x] /guides/fr/editeur-pdf-sans-telechargement — French SEO page (RGPD market)
- [x] NavBar: Split link added; Sitemap: 4 new routes

---

---

## Sprint 9 — COMPLETE ✅
**Completed:** 2026-03-14
**Goal:** Bug clearance + privacy audit

### Done
- [x] S9-1: Privacy audit — confirmed 100% client-side, logged in decisions.md
- [x] S9-2: French UI strings — none found in codebase, closed
- [x] S9-3: Undo state freeze — undo stack + document Ctrl+Z handler added to PdfEditor.tsx
- [x] S9-5: Main thread block on save — double-rAF yield before pdf-lib serialisation
- [x] S9-7: Font regression — useObjectStreams: false applied to save.ts, signature.ts, merge.ts, split.ts

### Deferred (not applicable to this project yet)
- S9-4: Bold bleed — revisit when bold/italic preservation is tackled (backlog)
- S9-6: French encoding bug — revisit when i18n/translation work begins

---

## Sprint 10 — COMPLETE ✅
**Completed:** 2026-03-16
**Goal:** Trust design + homepage overhaul

### Done
- [x] .impeccable.md — design context + brand brief (4 mockup iterations, v4 approved)
- [x] S10-1: Homepage redesign — dark navy hero, tool switcher (6 tabs, inline SVG icons), DevTools proof, pricing
- [x] S10-2: DevTools proof panel inlined in PdfEditor idle state (component extraction → backlog)
- [x] S10-3: /privacy-architecture page — technical explanation + GDPR Art. 25 + verification steps
- [x] S10-4: GDPR Art. 25 statements on /about + /privacy-architecture
- [x] S10-5: Brand name resolved — LocalPDF (confirmed, already in codebase)
- [x] S10-6: Sign page consistency — max-w-4xl → max-w-2xl
- [x] DM Serif Display font via next/font/google (--font-display CSS variable)
- [x] Heroicons-style inline SVG icons — no new npm dependency
- [x] sitemap.ts — /privacy-architecture added

---

## Sprint 11 — COMPLETE ✅
**Completed:** 2026-03-17
**Goal:** Annotation + highlighting (the daily-use feature gap)

### Done
- [x] S11-1: lib/pdf/annotate.ts — annotation data model + applyAnnotations() with % coordinates
- [x] S11-2: Highlight tool — text selection + color overlay (yellow/green/pink, baked into PDF on save)
- [x] S11-3: Sticky note / comment tool (free=5/doc gate, pro=unlimited) inside AnnotateTool.tsx
- [x] S11-4: /guides/annotate-pdf-free — SEO guide page
- [x] /annotate page + AnnotateTool component (564 lines, full highlight + sticky note UI)
- [x] lib/pdf/types.ts — extended with annotation types
- [x] sitemap.ts — /annotate + /guides/annotate-pdf-free added
- [x] NavBar.tsx — current prop widened to accept all tool names
- [x] PdfEditor.tsx — annotate tab unlocked

---

## Sprint 12 — COMPLETE ✅
**Completed:** 2026-03-17
**Goal:** v6 design system foundations + homepage hub

### Done
- [x] localpdf-v6.html — approved v6 mockup (623 lines)
- [x] docs/guidelines/design-system.md — full token reference (143 lines)
- [x] app/app/globals.css — CSS custom properties for all design tokens
- [x] app/app/layout.tsx — Instrument Serif + DM Sans + JetBrains Mono via next/font/google
- [x] app/tailwind.config.ts — font utility classes extended
- [x] components/NavBar.tsx — v6 redesign (Pricing/Privacy/Blog/About links)
- [x] components/Footer.tsx — new global footer component
- [x] HomepageHub.tsx — segmented control 6 tabs, animated spring pill (444 lines)
- [x] /edit page — PDF editor moved from / to /edit
- [x] / (homepage) — now the hub with tool switcher
- [x] sitemap.ts — /edit added

---

## Sprint 13 — COMPLETE ✅
**Completed:** 2026-03-18
**Goal:** Dark theme unification — convert all remaining light-theme pages to the dark navy `#0b0d14` design system.

### Done
- [x] /pricing — dark theme
- [x] /account — dark theme
- [x] /billing/success — dark theme
- [x] /guides/pdf-editor-no-upload — dark theme
- [x] /guides/mybestpdf-alternative — dark theme
- [x] /guides/edit-pdf-text-free — dark theme
- [x] /guides/compress-pdf-free — dark theme (green/neutral 2-col card grid, feature list)
- [x] /guides/merge-pdf-free — dark theme (step circles, `<strong>` emphasis)
- [x] /guides/sign-pdf-without-uploading — dark theme (step circles, FAQ h3s)
- [x] /guides/hipaa-friendly-pdf-editor — dark theme (amber disclaimer, multi-link nav separator, 2-col CTA grid)
- [x] /guides/gdpr-pdf-editor — dark theme (multi-link nav separator, sub-h3s, 2-col CTA grid)
- [x] /guides/de/datenschutz-pdf-editor — dark theme (multi-link nav separator, sub-h3s, 2-col CTA grid)
- [x] /guides/fr/editeur-pdf-sans-telechargement — dark theme (multi-link nav separator, sub-h3s, 2-col CTA grid)
- [x] /privacy-architecture — dark theme (`code` tags, border-left items, footer border, `strong` text)

---

## Sprint 15 — COMPLETE ✅
**Completed:** 2026-03-19
**Goal:** Homepage v2 redesign — match v2 home screen: 5-tab selector, dashed drop zone, tool descriptor line, More Tools drawer (Merge/Split), trust row.

### Done
- [x] S15-1: HomepageHub — replace 6-tab segmented control with 5-tab v2 selector (Edit/Sign/Annotate/Redact PRO/Compress)
- [x] S15-2: HomepageHub — replace current drop zone with v2 dashed-border style (tool-color icon, title, hint, Browse files button)
- [x] S15-3: HomepageHub — add tool descriptor line below drop zone
- [x] S15-4: HomepageHub — add More Tools expandable drawer (Merge/Split sub-selector + drop zone)
- [x] S15-5: HomepageHub — add trust row at bottom

---

## Sprint 16 — REBUILT ✅
**Completed:** 2026-03-19 (rebuilt after V2 design failure)
**Goal:** WorkspaceShell — full-screen workspace at `/workspace` matching V2 HTML spec exactly.

### Done
- [x] app/app/workspace/page.tsx — server component wrapper with Suspense (for useSearchParams)
- [x] app/app/workspace/WorkspaceShell.tsx — correct V2 layout (789 lines):
  - Nav (50px): ← back | filename + size (flex:1) | ↓ Download (indigo, dimmed when no file)
  - L2 bar: `rgba(11,13,20,.92)` + blur(14px) · max-width 600px inner
  - SelRail: spring pill (cubic-bezier(.34,1.56,.64,1)) · 5 tabs Edit/Sign/Annotate/Redact PRO/Compress · role="tablist" + keyboard nav
  - L3Strip: per-tool inline strip (edit hint / sign button / annotate sub-rail / redact pro bar / compress toggle)
  - AnnotateSubRail: nested spring pill (Yellow/Green/Pink/Note/Flag) with keyboard nav
  - ws-body flex row: PageRail LEFT 64px (border-right, A4 aspect-ratio thumbnails) + CanvasArea RIGHT flex:1
- [x] ?tool= query param drives initial active tool; URL stays in sync on switch
- [x] consumePendingFile() on mount — homepage hub file hand-off works
- [x] Drag-and-drop + Browse files opens PDF into workspace
- [x] ARIA: role="tablist/tab", aria-selected, aria-label, keyboard Enter/Space handlers, aria-hidden on decorative elements
- [x] Legacy route redirects: /edit /sign /annotate /compress → /workspace?tool=X; /merge /split → /
- [x] HomepageHub hrefs updated: all tool tabs now navigate to /workspace?tool=X
- [x] CLAUDE.md updated: 3 mandatory quality gates (read V2 before building, browser verify before COMPLETE, code-reviewer for >300 line files)

---

## Sprint 17 — COMPLETE ✅
**Completed:** 2026-03-21
**Goal:** WorkspaceShell rich edit toolbar + PageRail scroll-to-page + type model upgrade.

### Done
- [x] F17-0: Type model — `EditMap` upgraded from `Map<string,string>` to `Map<string,FieldData>` (value, family, size, color, bold, italic, underline)
- [x] F17-0: `lib/pdf/types.ts` — `FieldData` interface added, `EditMap` type updated
- [x] F17-0: `lib/pdf/save.ts` — loop updated to use `fieldData.value`, `fieldData.size`, `fieldData.color`
- [x] F17-0: `PdfViewer.tsx` — updated to read `.value` from FieldData; `onEdit` prop typed to `FieldData`
- [x] F17-0: `PdfTextLayer.tsx` — same pattern; `onFieldSelect` prop added
- [x] F17-1: `EditToolbar.tsx` (new, ~200 lines) — font family select, size stepper, color picker, bold/italic/underline toggles, edit count badge, undo/redo buttons
- [x] F17-1: `WorkspaceShell.tsx` — history stack (`histRef`, `hIdx`, `histUndo`, `histRedo`, `hPush`), `selectedFieldId` state, keyboard `Cmd+Z` / `Cmd+Shift+Z`
- [x] F17-2: PageRail scroll-to-page — `pageRefsMap` in WorkspaceShell, `pageRefs` prop on PdfViewer, `scrollIntoView` on thumbnail click
- [x] HomepageHub — tool-color pill highlight improvements
- [x] globals.css — animation tokens for secondary toolbar appear animation

---

## Sprint 18 — COMPLETE ✅
**Completed:** 2026-03-21
**Goal:** Sign tool (typed-name) wired into WorkspaceShell + shared color tokens.

### Done
- [x] Pre-S18 micro-refactor: `lib/ui/tool-colors.ts` — single source of truth for TOOL_HEX + TOOL_BG; resolves annotate color mismatch (#fbbf24 canonical per V2 spec)
- [x] `HomepageHub.tsx` — removed local ToolKey type, imports TOOL_HEX from tool-colors.ts
- [x] `WorkspaceShell.tsx` — imports TOOL_HEX/TOOL_BG, replaces local TOOL_COLORS const
- [x] `lib/pdf/signature.ts` — added TypedSignatureEntry interface + embedTypedSignature() (TimesRomanItalic, auto-sizes font to fit widthPct, Y-axis flip, useObjectStreams:false)
- [x] Sign state machine: SigMode (idle → naming → placing → idle) + SigEntry[] state in WorkspaceShell
- [x] L3Strip sign section: 3-phase UI — idle (button + count badge), naming (input + live serif preview + Place button), placing (pulsing dot + instruction)
- [x] CanvasArea: transparent crosshair overlay in placing mode; click resolves page + % coords via pageRefs getBoundingClientRect()
- [x] Download handler: embedTypedSignature() applied if sigs.length > 0; dynamic import for code splitting; output renamed _signed.pdf
- [x] Bug fixes from code review: `sigs` added to handleDownload deps array (stale closure fix); empty text guard in embedTypedSignature; Array.from() fix for MapIterator TS error

---

## Sprint 19 — COMPLETE ✅
**Committed:** 2026-03-22 (`fece287`)
**Goal:** Signature modal (draw + type), SigOverlay drag/delete, PageRail scroll sync, annotate tool fully wired.

### Done
- [x] S19-2/3: `SignatureModal.tsx` — Draw tab (quadratic Bezier canvas) + Type tab; typed name stored as `SigEntry.text`
- [x] S19-4: `SigOverlay.tsx` — drag-to-reposition + × delete button + `widthPct` resize handle (Pro-gated)
- [x] S19-5: `IntersectionObserver` scroll sync — PageRail active thumbnail tracks canvas scroll in real time
- [x] S19-6: Annotate tool fully wired:
  - `CheckAnnotation` type + `annotate.ts` drawLine ✓ (avoids WinAnsi U+2713 encoding issue)
  - `PdfTextLayer`: `annotateMode` + `onHighlight` props, crosshair cursor, conditional click routing
  - `PdfViewer`: annotation overlays per page (highlight rect, sticky note box, check mark)
  - `WorkspaceShell`: `AMode` lifted, `annotations[]` state, note/check click overlay, `applyAnnotations()` in download chain

---

## Sprint 20 — LAUNCH READY 🚀
**Reframed:** 2026-03-23 — MD directive: stop polishing, ship to paying users.
**Goal:** Minimum viable launch. Auth pages, Stripe sandbox E2E, annotation/sig stability, line-grouping text editor, 1 real blog post. Drop S20-11 to backlog.

### Haiku delegation protocol: docs/guidelines/haiku-confidence.md
### Cost estimate: ~$3.50–$4.50 total (6 Haiku tasks + 5 Sonnet tasks)
### Token estimate: ~15,000–18,000 tokens

---

### Bug Fixes — 🟡 Haiku (review gate: Sonnet before merge)

- [x] S20-1: Typed signature → true black — `rgb(0,0,0)` in `lib/pdf/signature.ts` + canvas stroke in `SignatureModal.tsx`
  **Model:** 🟡 Haiku | **Confidence:** 9/10 | **Tokens:** ~100
  **Verify:** Place typed sig → download → confirm black in PDF

- [x] S20-4: Highlight deduplication — check `annotations[]` for existing highlight on same `itemId` before adding; toggle off on re-click
  **Model:** 🟡 Haiku | **Confidence:** 8/10 | **Tokens:** ~150
  **Verify:** Click same text item twice → second click removes highlight

- [x] S20-5: Bold/italic retention — use `mapFont(item.fontName).bold/.italic` as fallback in `PdfTextLayer.handleBlur` instead of hardcoded `false`
  **Model:** 🟡 Haiku | **Confidence:** 8/10 | **Tokens:** ~120
  **Verify:** Open a bold-text PDF → click field → first edit preserves bold

- [x] S20-6: Checkmark color → black — CSS overlay `color: #111` in `PdfViewer.tsx` + `drawLine` color param in `annotate.ts`; use `var(--tx)` where possible
  **Model:** 🟡 Haiku | **Confidence:** 9/10 | **Tokens:** ~100
  **Verify:** Place checkmark → confirm visually black overlay + black in downloaded PDF

---

### Annotation Overlay — 🟡 Haiku (7/10, Sonnet review mandatory before browser test)

- [x] S20-2: `AnnotationOverlay` component (~120 lines) — drag-to-move + × delete for sticky notes and checkmarks; follows SigOverlay pattern from S19-4
  **Model:** 🟡 Haiku | **Confidence:** 7/10 | **Tokens:** ~400
  **Risk:** drag boundary clamping, z-index layering, scroll offset
  **Verify:** Drag sticky note on 3-page PDF (scroll to page 2 first) → confirm position holds; × deletes

- [x] S20-3: Wire `onAnnotationMove` / `onAnnotationDelete` to `WorkspaceShell`; remove + re-add annotation on move
  **Model:** 🟡 Haiku | **Confidence:** 7/10 | **Tokens:** ~350
  **Risk:** stale refs to `annotations[]`, scroll-relative coords
  **Verify:** Move annotation → scroll canvas → confirm overlay position correct; delete → not in downloaded PDF

---

### Launch Gaps — 🔵 Sonnet only

- [x] S20-7: Off-center text investigation — inspect `canvasY: tx[5] - canvasFontSize` in PdfViewer; compare against PDF.js canvas render; determine if fix is safe
  **Model:** 🔵 Sonnet | **Confidence:** 5/10 for Haiku | **Tokens:** ~1,500
  **Note:** Research task. May produce a fix or a documented decision to defer.

- [x] S20-8/9/10: Line-grouping text editor (3 tasks as one Sonnet session)
  - Group `ExtractedTextItem[]` by Y-proximity (tolerance: `canvasFontSize × 0.6`)
  - Click any item → activates whole line as single `<textarea>` spanning bounding box
  - On save → distribute replacement: first item = new value, remaining items = `''`
  **Model:** 🔵 Sonnet | **Confidence:** 2–4/10 for Haiku | **Tokens:** ~6,000
  **Verify:** Edit a line of text → download → confirm full line replaced, no orphan characters

- [x] S20-A: Auth pages — `/login` and `/signup` dedicated routes (currently modal-only)
  - `/login` — magic link + Google OAuth, redirect back to `/workspace` or referring page
  - `/signup` — same form, different heading, email confirmation state
  - Magic link callback route must handle redirect correctly (Supabase `/auth/callback`)
  - Password reset page (`/auth/reset-password`)
  **Model:** 🔵 Sonnet | **Confidence:** auth is security-adjacent | **Tokens:** ~3,000
  **Verify:** Sign up with email → receive magic link → click → land on `/workspace`; Google OAuth full round-trip

- [ ] S20-B: Stripe sandbox E2E test + fix
  - Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
  - Complete checkout with Stripe test card `4242 4242 4242 4242`
  - Verify: `checkout.session.completed` webhook fires → `user_profiles.is_pro = true` in Supabase
  - Test subscription cancel → `is_pro` reverts
  - Test failed payment card `4000 0000 0000 9995` → user NOT upgraded
  - Fix any webhook or DB issues found
  **Model:** 🔵 Sonnet | **Confidence:** integration test | **Tokens:** ~2,000
  **Note:** MD must have `stripe` CLI installed and `.env.local` populated before this task runs

- [x] S20-C: Blog seed post — 1 real article (not "Coming soon")
  - Title: "Why your PDF editor shouldn't need a server" (privacy + trust angle)
  - ~600 words, dark-themed, matches design system
  - Proper meta/OG tags, canonical URL, sitemap updated
  **Model:** 🟡 Haiku (content only) | **Confidence:** 8/10 | **Tokens:** ~500
  **Verify:** `/blog` renders article, not "Coming soon" stub

---

### Moved to Backlog
- S20-11: Drag-select sweep — too complex for launch sprint, deferred

---

## Sprint 21 — COMPLETE ✅
**Committed:** `faf0974`, `992a818` (2026-03-23)
**Goal:** Sig overlay stability + workspace state fixes.

### Done
- [x] S21: Sig stroke color fix (black rendered correctly)
- [x] S21: Center-anchor sig overlay (transform: translate(-50%, -50%))
- [x] S21: pageRef-based placement coordinates (accurate pct coords)
- [x] S21: Tool-switch PDF state reset (switching tools no longer loses edits)
- [x] S21: Floating "Save PDF" button in CanvasArea
- [x] S21: Compress default-on behaviour

---

## Sprint 22 — COMPLETE ✅
**Committed:** `c0f97fb`, `4e8af4f`, `41d3bd8`, `33f3651` (2026-03-23)
**Goal:** Save quality fixes + stored signatures + blank page insert.

### Done
- [x] S22-1: Bold/italic preserved in saved PDF via `resolveStandardFont()` (fixes long-standing font regression)
- [x] S22-2: Proportional descender mask in `save.ts` + full Y-position audit
- [x] S22-3: Stored signatures — `localStorage` persistence + signature picker in SignatureModal
- [x] S22-4: Blank page insertion via PageRail + button (pdf-lib `addPage`)

---

## Sprint 23 — COMPLETE ✅
**Committed (S23-1):** `81c8ede` (2026-03-24)
**Goal:** Image insertion + freehand drawing tools.

### Done
- [x] S23-1: Image insertion — drag-to-place `ImageOverlay`, `ImageEntry` type, `embedImages()` in `lib/pdf/image.ts`, wired into WorkspaceShell (insert button + download chain)
- [x] S23-2: Freehand drawing — `DrawingCanvas` full-viewport canvas overlay (pen colors, sizes, dpr-aware crop to page rect); stored as `ImageEntry` with `widthPct: 100`; "Draw" toggle in L3Strip sign-idle section; dynamic import (`ssr: false`)
- [x] S23-3: Pro gate audit — image insert and draw are free features; `isPro={false}` hardcode correct until MD populates `.env.local` for real auth (S20-B blocked on MD)

---

## Sprint 24 — COMPLETE ✅
**Committed:** 2026-03-25
**Goal:** PDF text overlay fidelity — metric-compatible font embedding.

### Done
- [x] S24-1: Investigated `canvasWidth` formula (`raw.width * scale`) — source analysis of PDF.js v3.11 worker confirmed `raw.width` is in PDF user-space (points). Formula `raw.width * scale` is mathematically correct. No change needed. (CTO agent Option 0 was incorrect; applying `tx[0]` would multiply font size twice.)
- [x] S24-2: Added Arimo, Tinos, Cousine (metric-compatible fonts) via `next/font/google` in `layout.tsx`. CSS variables: `--font-arimo`, `--font-tinos`, `--font-cousine`. Applied to `<body>` so they cascade into PDF viewer overlays.
- [x] S24-3: Updated `font-map.ts` CSS stacks to prefix metric-compatible fonts: `var(--font-arimo)` for Helvetica/Arial, `var(--font-tinos)` for Times, `var(--font-cousine)` for Courier. System font fallbacks preserved. Build passes.

---

## Backlog
- Word ↔ PDF convert
- PDF → JPG, JPG → PDF
- Bold/italic preservation in saved PDF (known gap)
- OCR for scanned documents
- Bulk processing (Pro feature)
- Stripe/Supabase env var setup (MD action — deferred from Sprint 6)
- Free placement mode (drag signatures off-grid — Pro feature)
- Encrypted PDF unlock flow
- **Workspace text editing — full word selection** — PDF.js extracts text in small sub-word chunks; clicking a "word" only activates one chunk. Requires multi-chunk selection merge. Complex; deferred from S16.
- **Workspace Sign + Annotate full tools** — S18 COMPLETE (see Sprint 18)

---

## Sprint 14 — COMPLETE ✅
**Completed:** 2026-03-18
**Goal:** V6 design gap closure — eliminate click friction + visual consistency.

### Done
- [x] S14-1: HomepageHub — ANNOTATE tab activated (Sprint 11 shipped it; hub was still showing it as "soon")
- [x] S14-2: HomepageHub — drop zone now opens file picker directly; file stored in `lib/pending-file.ts` singleton and consumed by tool components on mount (zero double-drop friction)
- [x] S14-3: HomepageHub — fadeUp keyframe animations on eyebrow + h1 (matching V6 CSS spec)
- [x] S14-4: HomepageHub — drop zone hover background `rgba(255,255,255,.04)` + PDF icon opacity lift
- [x] S14-5: HomepageHub — per-tool `glowColor` on CTA button box-shadow (fixes static indigo for all tools)
- [x] S14-6: PdfEditor — wired to `consumePendingFile()` on mount
- [x] S14-7: CompressTool — wired to `consumePendingFile()` on mount
- [x] S14-8: SignTool — wired to `consumePendingFile()` on mount
- [x] S14-9: /edit page — added `<Footer />`, V6 per-tool header (indigo badge, Instrument Serif h1, trust row), wrapped in dark `<main>`
- [x] S14-10: /annotate page — fixed missing `current="annotate"` on NavBar; standardised to `max-w-2xl`
- [x] S14-11: /blog — new dark-themed stub page (fixes NavBar 404)
- [x] S14-12: All tool page h1s — changed `font-bold` → `font-normal` (V6 Instrument Serif weight 400 spec)
- [x] lib/pending-file.ts — module-level singleton for cross-route file passing
