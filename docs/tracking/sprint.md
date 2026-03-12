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

## Sprint 6 — Up Next
**Goal:** Billing (Stripe). Pricing page, Pro plan, checkout, webhook.

### To Do
- [ ] Pricing page (/pricing) — Free vs Pro comparison, clear about what's paid
- [ ] Stripe product + price created in Stripe dashboard (MD action)
- [ ] Stripe Checkout integration — redirect to Stripe-hosted checkout
- [ ] Stripe webhook handler — /api/stripe/webhook (update user record in Supabase on payment)
- [ ] Pro plan benefits: remove usage gate, early access to new tools
- [ ] Supabase: add `is_pro` boolean to user profile table
- [ ] Nav: "Upgrade" CTA for free signed-in users
- [ ] Post-payment success page (/billing/success)

### Pre-conditions
- Sprint 5 env vars must be configured (Supabase project live)
- MD approval required before touching Stripe (CLAUDE.md rule)

---

## Backlog (not this sprint)
- PDF Split (separate pages into individual files)
- Word ↔ PDF convert
- Billing (Stripe) — Sprint 6
- PDF → JPG, JPG → PDF
- Bold/italic preservation in saved PDF (known gap)
- OCR for scanned documents
