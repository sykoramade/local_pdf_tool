# Lessons Learned

Every agent reads this file before starting work.
CEO updates this file whenever a mistake is resolved or a pattern is identified.

## Format
Each entry: what went wrong, what the fix was, and the rule going forward.

---

## 2026-03-11 — pdf-lib Italic Font Names

**What went wrong:** Italic standard font names for Helvetica and Courier use `Oblique` not `Italic` in pdf-lib. Constructing `Helvetica-Italic` or `Courier-Italic` throws at runtime.

**Rule:** Helvetica/Courier italic = `Oblique` (`Helvetica-Oblique`, `Helvetica-BoldOblique`, `Courier-Oblique`, `Courier-BoldOblique`). Times = `Italic` (`Times-Italic`, `Times-BoldItalic`).

---

## 2026-03-11 — Font Deduplication in pdf-lib

**What went wrong:** Calling `embedFont()` in a loop re-embeds the same font for every edit, bloating the output PDF.

**Rule:** Cache embedded fonts in a Map per save operation. Embed once per unique font name.

---

## 2026-03-11 — setTimeout for React DOM Sync

**What went wrong:** Using `setTimeout(..., 50)` to wait for canvas elements to mount after state update is unreliable on slow devices.

**Rule:** Use `useEffect` with a dependency on the state that needs to settle. Never use arbitrary timeouts for DOM sync.

---

## 2026-03-11 — pdfjs-dist Version Compatibility

**What went wrong:** pdfjs-dist v5 throws "Object.defineProperty called on non-object" when dynamically imported in Next.js 14 — pure ESM incompatibility with webpack bundling.

**Fix:** Pin to pdfjs-dist@3.11.174 (same version validated in spike). Worker file is `.js` not `.mjs`.

**Rules going forward:**
- Use pdfjs-dist@3.11.174 — do not upgrade without testing in Next.js first
- Worker file lives at `public/pdf.worker.min.js`
- workerSrc = `'/pdf.worker.min.js'`
- v3 render call: `page.render({ canvasContext: ctx, viewport: vp })` — no `canvas` param

---

## 2026-03-11 — Font Matching Spike Results

**What we learned:**
- 100% in-browser font matching works for ~85% of real-world PDFs
- Standard fonts (Helvetica, Arial, Times, Courier, Calibri, Georgia) match reliably
- Bold/italic style detection from font name heuristics works but bold is NOT preserved in the output yet — this needs a dedicated fix in the editor overlay
- Outlier fonts (heavily subsetted custom corporate fonts) fall back to Arial — rare in target use cases

**Rules going forward:**
- Always pass a `.slice(0)` copy of the ArrayBuffer to PDF.js — it may transfer (detach) the original to its worker thread
- pdf-lib `embedFont()` accepts standard font name strings directly (e.g. `'Helvetica-Bold'`) — no enum lookup needed
- Bold preservation is a known gap, NOT a blocker. Tracked in backlog.
- Font fallback on outliers is acceptable with a visible warning to the user
