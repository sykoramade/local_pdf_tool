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

---

## 2026-03-18 — Sprint Board Not Updated After Autonomous Sessions (CEO Failure)

**What went wrong:** S11 (annotation tool) and S12 (homepage hub) were fully implemented and committed, but `docs/tracking/sprint.md` was never updated. The board still showed S11 as QUEUED and had no S12 entry. When Sprint 13 began in a new session, the incorrect board implied 2 sprints of work had never happened. The Managing Director had zero visibility into what had shipped.

**Root cause:** Context compaction (`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: 50`) + autonomous multi-sprint mode. The "close the sprint" step lives at the tail of working memory and is the first thing dropped when context compacts mid-session. No enforcement mechanism existed.

**Rating:** 4/10 — Code delivered, coordination fidelity failed.

**Rule going forward:**
- The sprint board MUST be updated to COMPLETE **before** any new sprint begins. This is not optional and not deferrable.
- After every commit that completes a sprint's last task, immediately update `docs/tracking/sprint.md` — mark the sprint COMPLETE with date and full done list — as part of the same work block, not at end of session.
- In autonomous multi-sprint mode: treat sprint board update as a hard gate. Do not begin the next sprint until the board reflects the completed state of the current one.
- If context limits force a stop mid-sprint: write a `docs/messages/` note to self with the pending board update so the next session can recover it.

---

## 2026-03-19 — WorkspaceShell Built from Memory Instead of V2 Spec (Design Failure)

**What went wrong:** WorkspaceShell was implemented as an IDE-style layout (left sidebar tool rail 56px + left contextual panel 220px + center canvas + right page rail 92px) and marked COMPLETE. None of this exists in V2. The actual V2 workspace has a horizontal segmented pill selector at the top, an inline L3 strip below it, a LEFT 64px page rail, and a RIGHT canvas. The error was caught by the Managing Director when he ran the app — not by any internal check.

**Root cause (two failures):**
1. `localpdf_v2.html` was NOT read before implementation. Layout was invented from general IDE conventions rather than derived from the spec.
2. Sprint was marked COMPLETE after TypeScript passed. The app was never opened in a browser to verify it actually rendered correctly.

**Rating:** 2/10 — File was written, spec fidelity and verification both failed completely.

**Rules going forward (added to CLAUDE.md as mandatory quality gates):**
- **Read `localpdf_v2.html` before writing any new screen or layout component.** Never invent layout. Quote specific CSS classes from V2 in the implementation comments to prove it was read.
- **No sprint COMPLETE without browser verification.** Run `npm run dev`, navigate to the route, confirm it renders. TypeScript passing ≠ working.
- **code-reviewer agent is mandatory for any file >300 lines** before marking a task done.
- When in doubt about a layout detail, ask the Managing Director before building — wasted implementation is more expensive than a clarifying question.

---

## 2026-03-19 — Full Development Pipeline Skipped (Process Failure)

**What went wrong:** The mandatory development pipeline (read V2 → break down tasks → write to `docs/tasks/` → coordinate via `docs/messages/` → build) was skipped entirely for Sprint 16. No task breakdown was written. No V2 analysis was documented. Code was written directly from assumptions. `docs/tasks/frontend.md` was never updated from Sprint 7. When asked why, there was no good answer.

**Root cause:** In autonomous sessions, the pipeline steps that produce documentation artifacts (task files, messages) are silently dropped in favour of writing code faster. There is no enforcement mechanism that blocks implementation if the task file doesn't exist first.

**Rating:** 1/10 — The pipeline exists precisely to prevent this class of failure. Skipping it without reason is not acceptable.

**Rules going forward:**
- Before writing a single line of implementation code for any new screen or feature: read V2, extract requirements, write tasks to `docs/tasks/frontend.md`. This is a hard gate, not a suggestion.
- The task file must exist and be reviewed by the Managing Director before implementation begins on any sprint involving a new layout component.
- Confidence must be rated on every answer. If confidence is below 8/10, bring in the co-CEO and project manager agents before proceeding.
- "No good answer" for skipping a mandatory step is a signal to stop and ask, not to continue.

---

## 2026-03-24 — Tool Switch Cleared Loaded PDF (React Routing Regression)

**What went wrong:** Clicking a tool button in the workspace (Edit → Sign, Sign → Annotate, etc.) caused the loaded PDF to disappear and the drop-zone to reappear, as if the user had just landed on the workspace with no file. This was a regression from the initial tool implementation.

**Root cause:** A `useEffect` that synced the active tool to the URL query param (`?tool=sign` etc.) used `router.replace()` from Next.js App Router. This triggered a soft navigation, which caused React to remount the `WorkspaceShell` component inside its Suspense boundary — resetting all local state including `file`, `pdfBytes`, `editMap`, `sigs`, etc.

**How it should have been caught:** An E2E test for the basic workspace flow:
1. Load a PDF
2. Switch to each tool tab
3. Assert the document is still visible (no drop zone shown, page count unchanged)

This is a two-minute manual smoke test and a straightforward Playwright spec. Neither existed. The bug shipped and was caught by the Managing Director on first use.

**Fix:** Replace `router.replace()` with `window.history.replaceState()`. The History API updates the URL bar without going through React's routing machinery, so no Suspense boundary remount occurs.

**Rules going forward:**
- Never use `router.replace()` or `router.push()` to sync UI state to URL params inside a component that holds critical session state (loaded files, edit history, etc.). Use `window.history.replaceState()` instead.
- The workspace smoke test (load PDF → switch tools → verify document still present) is now a mandatory manual check before any sprint involving WorkspaceShell is marked COMPLETE.
- Any future E2E spec for the workspace MUST include: load file → switch to every tool → assert file name still visible + drop zone hidden.

---

## S25–S29: Canvas Layer Pivot Degraded Text Editing UX (2026-03-26)

**What happened:** S25–S29 replaced the working `PdfTextLayer` (per-item span clicking) with a new `CanvasTextLayer` backed by Fabric.js. The canvas layer grouped individual text items into "blocks" using Y-band + X-gap heuristics, then rendered invisible Rect hit targets per block. Clicking a block replaced the rect with a Fabric Textbox containing all block text joined with spaces.

**Why it was worse than the original:**
- The old layer let users click individual text spans precisely. The new layer groups unrelated text into blocks — multi-column layouts, headers, and tables collapse into wrong groupings.
- Hit zones were invisible until hover. The old layer's spans were always visible and obviously clickable.
- Several sprints of work produced a regression: text editing felt noticeably worse, not better.

**How it should have been caught:** A before/after UX comparison on a representative PDF (multi-column, table, form) before marking any canvas sprint COMPLETE. The MD never got a side-by-side demo — the change shipped into the default `useCanvasLayer={true}` path without explicit sign-off on UX quality.

**Fix:** Removed `useCanvasLayer` from `PdfEditor.tsx`. NOTE: `PdfEditor.tsx` is dead code — see the entry below for the bigger architecture mistake this exposed.

**Rules going forward:**
- Any sprint that replaces a working UX component requires a before/after demo reviewed by the MD before the flag is flipped in production code.
- `useCanvasLayer` remains `false` until the canvas layer UX is demonstrably better than `PdfTextLayer` on a multi-column PDF test case.
- New architecture investments (Fabric.js, block detection) must not degrade existing features. When in doubt, gate behind a feature flag and default to the proven path.

---

## S30B: Entire Sprint Delivered to Dead Component — PdfEditor.tsx Orphaned (2026-03-26)

**What happened:** S30B (and prior session work) wired the redact feature into `PdfEditor.tsx`. This component is not imported anywhere in the live app. The live app runs through `WorkspaceShell.tsx` at `/workspace`. When the user ran the app, they saw zero changes despite the code being correct, because the code was in the wrong file.

**Root cause:** The architecture shifted from `PdfEditor.tsx` → `WorkspaceShell.tsx` during a prior sprint (V6 design audit / homepage V3). `PdfEditor.tsx` was left in `app/components/` as an orphan. No agent checked whether `PdfEditor.tsx` was actually imported before spending multiple sessions modifying it.

**How it should have been caught:**
- Run `grep -rn "PdfEditor" app/app/` before touching the file. Zero import hits = dead code.
- The component tree check (page.tsx → HomepageHub → /workspace → WorkspaceShell) takes 2 minutes and would have revealed this immediately.

**Fix:** Wired redact (`redactPdf`, state, UI panel, download button) directly into `WorkspaceShell.tsx`. `PdfEditor.tsx` left in place as dead code — will be deleted in a future cleanup sprint.

**Rules going forward:**
- **Before modifying any component, verify it is imported in the live app.** Run `grep -rn "ComponentName" app/app/` and trace to a page route. If no route imports it, it is dead code.
- `PdfEditor.tsx` is confirmed dead code. Do not modify it.
- The live editor entry point is `app/app/workspace/WorkspaceShell.tsx` rendered at `/workspace`.
- Session start checklist must include: confirm which component is actually rendered at the route being worked on.

---

## HomepageHub Redact Still Pro-Gated After Feature Was Built (2026-03-26)

**What happened:** S30B built and wired redact into WorkspaceShell. But `HomepageHub.tsx` still had `redact: { href: null, pro: true }` — so navigating to Redact from the homepage silently did nothing. The workspace was only reachable by typing `/workspace` directly.

**Root cause:** Feature was delivered in two halves (WorkspaceShell + HomepageHub) but the HomepageHub half was never updated. No end-to-end test of the user flow (homepage → drop file → click Redact → workspace).

**Fix:** Changed HomepageHub redact to `href: '/workspace?tool=redact'` with no `pro` flag.

**Rules going forward:**
- Every new tool unlock requires TWO changes: WorkspaceShell (remove pro gate) AND HomepageHub (update href, remove pro flag). Treat them as a pair.
- Completion test for any tool unlock: start at homepage, drop a file, click the tool, confirm it reaches the workspace with the correct tool active.

---

## PdfTextLayer Hit Zones Were Invisible — Text Editing Felt Broken (2026-03-26)

**What happened:** `PdfTextLayer` rendered hit zones with `color: transparent` and `hover:bg-indigo-50/40`. Users had no visual signal that text was clickable. This was the actual cause of "clicking text feels like shit" — not the canvas layer.

**Root cause:** The transparent color is intentional (don't overlay the rendered PDF text) but the hover state was too subtle to be meaningful feedback.

**Fix:** Added `borderBottom: '1px solid rgba(99,102,241,0.25)'` to all inactive text items (permanent subtle underline showing editable zones) and strengthened the hover state to `hover:bg-indigo-100/60 hover:border-b-2 hover:border-indigo-400`.

**Rules going forward:**
- Any text interaction component must be tested on a real PDF with a non-developer. "Users can find and click editable text without being told where to click" is the acceptance criterion.
- The canvas layer experiment (S25–S29) is permanently shelved. The problem it tried to solve (invisible hit zones) is now fixed in PdfTextLayer directly.

---

## 2026-03-26 — Prop Threading Never Verified (Mandatory Prop Audit Rule)

**What went wrong:** `fabricLayerRefs` was defined in `WorkspaceShell` but never added to `CanvasArea`'s prop type or call site. Enabling `useCanvasLayer={true}` would have activated the canvas UI but silently discarded every edit on download, because the save pipeline (`getTextboxes → applyCanvasEditsAndSave`) was unreachable. TypeScript didn't catch it — the prop was optional. The same class of failure caused S30B to be delivered to a dead component.

**Pattern:** Feature built at definition site. Prop not threaded through intermediate component. Feature silently does nothing at runtime. TypeScript passes. No warning.

**Rule going forward — Mandatory Prop Audit before marking any task done:**
1. Run `grep -rn "PropName" app/app/` — confirm it appears at: (a) definition, (b) type signature of every component it passes through, (c) each call site, (d) usage in render or handler.
2. If the receiving component is not directly rendered by a page route, trace one level up: confirm the parent threads it through too.
3. If no page route imports the component being modified, stop — it is dead code. Do not proceed.
4. This audit takes 3 minutes. The cost of skipping it is a sprint of invisible work.
