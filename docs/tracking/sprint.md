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

## Sprint 8 — IN PROGRESS
**Goal:** PDF Split UI + multi-page signing + localized SEO pages

### In Progress
- [ ] /split page + SplitTool component (lib/pdf/split.ts already done)
- [ ] Multi-page signature support — page detection so users can sign any page, not just page 1
- [ ] /guides/hipaa-friendly-pdf-editor — HIPAA-friendly positioning guide
- [ ] /guides/de/datenschutz-pdf-editor — German SEO page (GDPR market)
- [ ] /guides/fr/editeur-pdf-sans-telechargement — French SEO page

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
