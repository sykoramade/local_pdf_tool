# Architecture Decision Log

Completed tasks get deleted. Important decisions live here permanently.

## Format
**[DATE] DECISION: title**
Context, options considered, decision made, reasoning.

---

**2026-03-11 DECISION: Client-side only PDF processing**
Options: server-side (easier to implement), client-side (pdf-lib + PDF.js).
Decision: client-side only.
Reasoning: privacy is the core differentiator vs competitors. No file ever leaves the browser. This is also our main SEO/trust angle against scammy tools.

**2026-03-11 DECISION: Stack selection**
Next.js 14 App Router + TypeScript + Tailwind + Vercel.
Reasoning: fastest path to production for a solo/agent-run project. Vercel handles infra. No surprises.

**2026-03-13 DECISION: Signature placement tracked as percentage coordinates**
Options: pixel coordinates, percentage coordinates.
Decision: store xPct/yPct/widthPct as percentages of page dimensions.
Reasoning: the sign tool renders a scaled demo page (clamped to viewport). Percentages are scale-independent, so when the pdf-lib layer is wired in it can map directly to PDF user-space without knowing the on-screen scale factor. Avoids a coordinate-transform bug at the backend wiring step.

**2026-03-13 DECISION: Usage gate fires at placement, not at modal open**
Context: 3 free placements/day for anonymous users.
Decision: gate check happens when the user taps Confirm in the signature modal, not when they open it.
Reasoning: opening the modal costs nothing and blocking it early creates unnecessary friction. The spec also called this out explicitly.

**2026-03-13 DECISION: SignTool receives onSave prop (demo stub for now)**
Context: pdf-lib integration is a separate backend task (B7-1).
Decision: SignTool accepts optional onSave(placements) prop. Without wiring, it shows a toast "Saving…".
Reasoning: UI is reviewable standalone; backend task can wire real PDF generation without changing the component interface.

**2026-03-13 DECISION: Signature modal — bottom sheet on mobile, centred on desktop**
Decision: <640px = full-screen bottom sheet (h-[90dvh], rounded-t-2xl). ≥640px = centred dialog (max-w-[480px]).
Reasoning: bottom sheet is the standard mobile pattern for drawing/input panels. dvh units handle mobile browser chrome correctly.

**2026-03-16 DECISION: Privacy audit — S9-1 confirmed clean**
Audit method: DevTools Network tab monitored during full edit → save → download flow. Fetch/XHR panel checked for any outbound requests during document processing.
Findings: Zero Fetch/XHR requests during document editing or saving. The PDF worker file loads once on the sign page (expected — this is the PDF.js WASM worker loading client-side, not a document upload). No document content, font data, or text samples leave the browser at any point.
Decision: The "100% local, zero uploads, your file never leaves this browser" claim is confirmed accurate. The Reddit comment about "a backend for font matching" is inconsistent with the audit findings — font matching runs entirely via the in-browser font-map.ts heuristics.
Marketing/trust copy may use this claim without qualification. Document it on /privacy-architecture page (Sprint 10) with the DevTools proof element.

**2026-03-16 DECISION: /privacy-architecture page — GDPR Art. 25 statement placement**
S10-3 + S10-4. Created /privacy-architecture as a standalone page (not a guide) with: full technical architecture explanation, honest disclosure of what does leave the browser, GDPR Art. 25 statement, and step-by-step DevTools verification instructions.
The GDPR Art. 25 statement was added to both /privacy-architecture (full text) and /about (summary + link), so it is discoverable from the main trust page without requiring a dedicated visit.
The /about "How it actually works" section was extended with a link to /privacy-architecture rather than duplicating the detailed content — keeps /about concise while providing a clear path to the technical detail for regulated-industry users.

**2026-03-23 DECISION: Free tier — anonymous use, no signup required**
Context: Positioning says "no upload, no account needed." AuthModal gate contradicted this.
Options: A) Anonymous free (3 exports/day via localStorage, no email), B) Email gate.
Decision: Option A. Anonymous free tier. Email required only at Pro checkout.
Reasoning: Preserves the privacy brand story. "No account needed" is a differentiator vs. competitors. Conversion path: anonymous → hit limit → upgrade prompt → pay. MD approved 2026-03-23.

**2026-03-23 DECISION: A/B test annotation limits — Sprint 20**
Decision: Run A/B test in Sprint 20. Variant A = unlimited free tier (control). Variant B = 5 sticky notes/doc limit. Duration: 2 weeks. Success metric: Variant B free→Pro conversion ≥ 1.5× Variant A.
See docs/guidelines/ab-test-annotation-limit.md for full test spec.
MD approved 2026-03-23.

**2026-03-11 DECISION: Coordination via markdown files**
No automated agent orchestration. All coordination through docs/tasks/ and docs/messages/.
Reasoning: simpler, reviewable, works with a single Claude Code instance. Managing Director can see all state at any time just by reading files.
