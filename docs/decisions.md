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

**2026-03-11 DECISION: Coordination via markdown files**
No automated agent orchestration. All coordination through docs/tasks/ and docs/messages/.
Reasoning: simpler, reviewable, works with a single Claude Code instance. Managing Director can see all state at any time just by reading files.
