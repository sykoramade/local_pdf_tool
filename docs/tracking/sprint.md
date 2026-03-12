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

## Sprint 5 — Up Next
**Goal:** Auth (Supabase) + soft usage gate. Email capture + conversion signal before billing.

### To Do
- [ ] Supabase project setup + env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Auth UI — Sign In / Sign Up modal (email magic link + Google OAuth)
- [ ] Session handling — useUser hook, persist session client-side
- [ ] Soft usage gate — anonymous users: 3 free tool uses per day; signed-in: unlimited free
- [ ] Usage counter — stored in localStorage for anonymous, Supabase for signed-in
- [ ] /account page — show email, usage today, sign out
- [ ] Nav update — Sign In button (anonymous) / email avatar (signed-in)

---

## Backlog (not this sprint)
- PDF Split (separate pages into individual files)
- Word ↔ PDF convert
- Billing (Stripe) — Sprint 6
- PDF → JPG, JPG → PDF
- Bold/italic preservation in saved PDF (known gap)
- OCR for scanned documents
