# UI Consistency Audit — 2026-03-13

From: ui-designer
To: Managing Director
Re: Cross-page layout consistency against compress reference

---

## Reference: Compress Page Pattern

File: `app/app/compress/page.tsx`

The compress page establishes the following structural pattern that all tool pages should follow:

| Element | Classes |
|---|---|
| Page background | `min-h-screen bg-gray-50` on `<main>` |
| Outer container | `max-w-2xl mx-auto px-4 py-16` |
| Heading block | `text-center mb-10` wrapper |
| H1 | `text-3xl font-bold text-gray-900 mb-3` |
| Subtitle | `text-gray-600` (plain `<p>`) |
| Badge row | `mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500` |
| Badge check mark | `<span className="text-green-500">✓</span>` |
| Bottom cross-link block | `mt-12 text-center` with `text-sm text-gray-500 mb-3` label and `text-indigo-600 hover:text-indigo-800 text-sm font-medium underline` link |

---

## Page-by-page findings

### Landing / Editor Page (`app/app/page.tsx` + `PdfEditor.tsx`)

The page shell (`page.tsx`) renders only `<NavBar>` and `<PdfEditor>` — no wrapper at all. The header and container logic lives entirely inside `PdfEditor.tsx`.

**Idle state (the landing/hero):**

1. **Background color — matches.** `bg-gray-50` is used. OK.

2. **Outer container — diverges.** Compress uses `max-w-2xl mx-auto px-4 py-16` as a single wrapping div. PdfEditor uses `flex flex-col items-center justify-center` on `<main>` and then a separate inner `max-w-2xl w-full` div. The centering mechanism is different (flexbox centering vs margin-auto), and `py-16` is on `<main>` rather than on the container div — functionally similar but structurally inconsistent.

3. **Heading block spacing — diverges.**
   - Compress: `mb-10` on heading block wrapper.
   - Editor: heading block has no explicit bottom margin class; the `mb-4` on h1 and `mb-2` on subtitle are inline, but the dropzone sits directly below with no wrapping `mb-10`.
   - Recommended fix: add `mb-10` to the heading wrapper `div` and remove the ad-hoc `mb-2`/`mb-4` pattern, or align to the compress model.

4. **H1 typography — diverges.**
   - Compress: `text-3xl font-bold text-gray-900 mb-3`
   - Editor: `text-4xl font-bold text-gray-900 mb-4`
   - Issue: editor is one size step up (`text-4xl` vs `text-3xl`) and uses `mb-4` instead of `mb-3`. This is a deliberate marketing choice (bigger hero headline) but it breaks visual consistency across tool pages. If the intent is a unified tool family, this should be `text-3xl mb-3`.
   - Recommended fix (if aligning): change `text-4xl` to `text-3xl` and `mb-4` to `mb-3` on the h1.

5. **Subtitle typography — diverges.**
   - Compress: single `<p className="text-gray-600">` with no size modifier (inherits `text-base`).
   - Editor: `text-lg text-gray-600 mb-2` for primary subtitle, then a secondary `text-sm text-gray-400` line.
   - Issue: `text-lg` is larger than the compress baseline. The two-line subtitle structure is unique to the editor.
   - Recommended fix (if aligning): change `text-lg` to the default (`text-base` or remove size class) and `mb-2` to match the compress pattern, or accept the editor as a special case and document the exception.

6. **Badge row — partially diverges.**
   - Compress: `mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500`
   - Editor: `max-w-2xl w-full mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-500`
   - Issues: `mt-6` vs `mt-8` (2 units short), `gap-6` vs `gap-5` (1 unit wider), and the editor wraps the row in a `max-w-2xl w-full` div that compress does not use (compress inherits the outer container width).
   - Recommended fix: change `mt-6` to `mt-8` and `gap-6` to `gap-5`. Remove the redundant `max-w-2xl w-full` wrapper since the outer container already constrains width.

7. **Bottom cross-links — missing on editor.**
   - Compress has a `mt-12 text-center` cross-link block.
   - Editor idle state has a "How it works" section below the badge row but no cross-links to other tools (compress, sign, merge, split).
   - Recommended fix: add a `mt-12 text-center` cross-link block below the "How it works" section, linking to `/compress`, `/sign`, and `/merge` in the compress link style.

**Viewing state (after PDF loaded):**

The viewing state switches to `bg-gray-100` and a full-screen toolbar + scroll layout — this is a separate UX mode, not a content page, so compress-pattern consistency does not apply here. No issues.

---

### Sign Page (`app/app/sign/page.tsx`)

The sign page uses `max-w-4xl` (wider container, intentional for PDF display), but the PAGE HEADER section should still follow the compress heading pattern within that container.

1. **Background color — matches.** `bg-gray-50` on `<main>`. OK.

2. **Outer container — diverges (intentionally wider, but header spacing also diverges).**
   - Compress: `max-w-2xl mx-auto px-4 py-16` — a single container div handles all spacing.
   - Sign: `max-w-4xl mx-auto` on outer container with NO `py` on it; instead the heading block uses `px-4 pt-10 pb-6`.
   - Issue: `pt-10` is meaningfully less than `py-16` (10 vs 16 units top padding). The heading block arrives 6 units too high on the page.
   - Recommended fix: change `pt-10 pb-6` to `pt-16 pb-0` on the heading block, giving `16` units of top padding matching compress. Bottom padding of the heading block is covered by `mb-10` if added (see next point).

3. **Heading block bottom margin — missing.**
   - Compress: `mb-10` on heading block wrapper.
   - Sign: heading block wrapper uses `px-4 pt-10 pb-6` — the bottom spacing is `pb-6` (padding inside the block), not `mb-10` (margin after the block). `pb-6` = 24px, `mb-10` = 40px. The tool card sits 16px too close to the heading.
   - Recommended fix: replace `pb-6` with `mb-10` on the heading block wrapper (or keep `pb-0` and add `mb-10`).

4. **H1 typography — matches.** `text-3xl font-bold text-gray-900 mb-3`. OK.

5. **Subtitle typography — matches.** `text-gray-600` with `max-xl mx-auto` for a narrower read width inside the 4xl container. OK. The `max-w-xl mx-auto` wrapper is a reasonable adaptation for wider containers.

6. **Badge row — diverges.**
   - Compress: `mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500` (no extra padding on the row itself — contained by the outer `px-4`).
   - Sign: `mt-8 pb-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500 px-4`
   - Issue: sign adds `pb-8 px-4` to the badge row itself rather than relying on the container. `gap-5` and `mt-8` match. The `pb-8` and `px-4` are workarounds for the missing container-level padding.
   - Recommended fix: if the container gains proper `px-4 py-16` padding (i.e. the structural fix above is applied), remove `pb-8 px-4` from the badge row so the row matches compress exactly: `mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500`.

7. **Bottom cross-link — missing.**
   - Compress has a `mt-12 text-center` cross-link block.
   - Sign page has no cross-link block at all.
   - Recommended fix: add a `mt-12 text-center` block with a link to `/compress`, `/merge`, or `/` in the compress link style.

---

### Merge Page (`app/app/merge/page.tsx`)

1. **Background color — matches.** `bg-gray-50`. OK.
2. **Outer container — matches.** `max-w-2xl mx-auto px-4 py-16`. OK.
3. **Heading block — matches.** `text-center mb-10`. OK.
4. **H1 — matches.** `text-3xl font-bold text-gray-900 mb-3`. OK.
5. **Subtitle — matches.** `text-gray-600`. OK.
6. **Badge row — matches.** `mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500`. OK.
7. **Bottom cross-links — present but structurally richer than compress.**
   - Compress: single link in `mt-12 text-center`.
   - Merge: `mt-12 text-center space-y-2` with two links in a flex row (`flex justify-center gap-4 text-sm`).
   - This is a reasonable evolution of the pattern (more tools to cross-link). The outer `mt-12 text-center` matches. The `text-sm` on the link container means links inherit size from the container rather than each link — both links lack `font-medium underline` that the compress link uses.
   - Recommended fix: add `font-medium underline` to both `<Link>` elements to match the compress link style:
     - Current: `className="text-indigo-600 hover:text-indigo-800 font-medium underline"`... the merge links already have this. On inspection, they do match. OK — no fix needed here.

Merge page is the closest to the reference. No structural issues.

---

### Split Page (`app/app/split\page.tsx`)

1. **Background color — matches.** `bg-gray-50`. OK.
2. **Outer container — matches.** `max-w-2xl mx-auto px-4 py-16`. OK.
3. **Heading block — matches.** `text-center mb-10`. OK.
4. **H1 — matches.** `text-3xl font-bold text-gray-900 mb-3`. OK.
5. **Subtitle — matches.** `text-gray-600`. OK.
6. **Badge row — matches.** `mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500`. OK.
7. **Bottom cross-links — matches pattern, two links (same structure as merge).**
   - Same note as merge: the link elements include `font-medium underline` and use `text-indigo-600 hover:text-indigo-800`. OK.

Split page matches the reference in all evaluated dimensions. No issues.

---

### NavBar (`app/app/components/NavBar.tsx`)

The NavBar is shared infrastructure, not a tool page, so compress-pattern rules do not directly apply. Observations for completeness:

1. Nav uses `px-6 py-4` — no issues, this is independent of page content spacing.
2. All tool links are present and active-state is handled via `current` prop. OK.
3. No mobile menu / hamburger is present — the nav items are displayed inline at `text-sm` with `gap-4`. On narrow screens this will overflow. This is a pre-existing issue outside the scope of this audit but worth noting for a future sprint.

---

## Summary: Recommended Changes (prioritized)

**Priority 1 — Structural (affects perceived vertical rhythm most)**

1. **Sign page: fix top padding.** `pt-10` on heading block → `pt-16`. The sign page header arrives 6 units too high compared to every other tool page.

2. **Sign page: fix heading block bottom gap.** Replace `pb-6` on the heading block wrapper with `mb-10` (and `pb-0`) to match the 40px gap compress uses before the tool component.

**Priority 2 — Spacing details (noticeable on side-by-side comparison)**

3. **Editor idle state: fix badge row spacing.** Change `mt-6` to `mt-8` and `gap-6` to `gap-5` on the trust badge row in `PdfEditor.tsx` (lines 126-132).

4. **Sign page: clean up badge row.** After fixing the container structure (items 1-2), remove `pb-8 px-4` from the badge row so it reads `mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500`.

**Priority 3 — Typography scale (visible but potentially intentional)**

5. **Editor idle state: h1 size.** `text-4xl mb-4` → `text-3xl mb-3` if a unified tool-family heading scale is desired. If the editor is intentionally a bigger marketing headline, document this exception in `docs/decisions.md` so it is not treated as a bug in future audits.

6. **Editor idle state: subtitle size.** `text-lg text-gray-600` → `text-gray-600` (remove `text-lg`) if aligning to compress baseline.

**Priority 4 — Missing cross-links**

7. **Sign page: add cross-link block.** Add `mt-12 text-center` block with link(s) to complementary tools after the badge row, matching the compress / merge / split pattern.

8. **Editor idle state: add cross-links.** Add `mt-12 text-center` block after the "How it works" section with links to `/compress`, `/sign`, `/merge`.

---

**Pages with no issues:** Merge, Split.
**Pages with minor issues:** Editor idle state (badge spacing, h1 size, missing cross-links).
**Pages with structural issues:** Sign (top padding, heading gap, badge row padding, missing cross-link).
