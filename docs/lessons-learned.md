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
