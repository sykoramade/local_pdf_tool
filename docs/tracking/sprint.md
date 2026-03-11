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

## Sprint 3 — Up Next
**Goal:** Polish, error handling, mobile, and first real-world testing.

### To Do
- [ ] Mobile layout review — test PdfViewer on small screens, text layer tap targets
- [ ] Keyboard accessibility — tab through editable text items
- [ ] Loading skeleton for PDF viewer (prevent layout jump)
- [ ] Handle password-protected PDFs gracefully (current: shows error, needs clear message + retry)
- [ ] Handle oversized files (>20MB warning before attempting load)
- [ ] "Edited" badge per page — show how many edits on each page in toolbar
- [ ] Google Search Console setup instructions (docs/tracking/)
- [ ] Vercel deployment config (vercel.json)

### Backlog (not this sprint)
- PDF Merge / Split
- Word ↔ PDF convert
- Auth (Supabase)
- Billing (Stripe) — needed before 6-month check-in
- PDF → JPG, JPG → PDF
- Bold/italic preservation in saved PDF (known gap)
- OCR for scanned documents
