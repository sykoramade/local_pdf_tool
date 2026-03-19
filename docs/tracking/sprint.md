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

## Backlog
- Word ↔ PDF convert
- PDF → JPG, JPG → PDF
- Bold/italic preservation in saved PDF (known gap)
- OCR for scanned documents
- Bulk processing (Pro feature)
- Stripe/Supabase env var setup (MD action — deferred from Sprint 6)
- Free placement mode (drag signatures off-grid — Pro feature)
- Encrypted PDF unlock flow

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
