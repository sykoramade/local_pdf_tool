CEO: Right, so the blog summary changes my position significantly. They're not lying. The document stays local, the one server call is font metadata — not content. That's a materially honest claim. Which puts us in an uncomfortable spot because I've been framing this as a clean win for us versus a cloud competitor. CTO — does this change our technical story?
CTO: Yes and no. Their claim holds up. Font matching via a lightweight server call is architecturally clever — you're sending "Helvetica Bold 12pt" not "here's my contract." No document content crosses the wire. Our "files never leave your computer" claim is still stronger in one specific sense — we make zero server calls, including for fonts. But that's also exactly why our text selection feels worse. We're not cheating on privacy, we're just carrying a heavier local processing burden without the font engine shortcut.
CEO: So to close the smoothness gap honestly, we either build our own client-side font matching, or we adopt their model — a thin server call for font metadata only. If we do the latter, can we still say "files never leave your computer"?
CTO: Technically yes, because files don't leave. But "zero server calls" becomes false. There's a meaningful distinction there that our compliance ICP will care about. A GDPR officer doing due diligence will ask "what data goes to your servers?" and "font properties from your document" is still metadata derived from their file. It's low risk but it's not zero. If we want to maintain the absolute claim — nothing, ever, not even metadata — we build it locally.
CEO: What does building it locally actually look like?
CTO: Three approaches. First — embed a curated font library directly in the app. We ship the 20-30 most common PDF fonts as web fonts, match locally against those. Covers maybe 80% of documents. Fast, zero calls, works offline. Second — use PDF.js's existing font extraction more aggressively. PDF.js already reads font data from the file. We're not fully utilising what it gives us for positioning and matching. Third — WebAssembly. We could compile a stripped-down font matching engine to WASM and run it client-side. More complex to build but closes the gap almost entirely. Their server call takes maybe 50ms. A well-optimised WASM implementation could hit similar speeds locally on modern hardware.
CEO: What's realistic for our sprint cycle?
CTO: Option one — embedded font library — is 1 sprint, maybe 1.5. Covers the most common cases and immediately improves text selection precision. Option two is partially done already, just needs engineering focus. Option three is a separate project, probably 3-4 sprints, post-launch. I'd sequence it: option one now, option two alongside it, option three as a future Pro differentiator we can market — "full offline, no metadata, no calls, ever."
CEO: That last point is actually the sharpest marketing angle we've had in this whole conversation. "Zero server calls — including for fonts" is a direct, verifiable differentiator over PDFNoLimit. Their developer was honest about the one backend they have. We can be honest that we have none. That's a meaningful gap for the compliance ICP.
CTO: Agreed. And it gives us a concrete technical claim we can back up — "open DevTools, check the Network tab during any operation. You'll see zero outbound requests." PDFNoLimit can say the same for document content but not for font calls. We can say it for everything. That's a real moat if we execute it.

CEO summary for the MD:
PDFNoLimit's privacy claims are largely true. The document never leaves the user's machine — they send only font metadata to a server for matching, which is how they achieve smoother text selection. This is honest and clever architecture.
What this means for our positioning:
We don't need to walk anything back. But we do need to stop assuming they're a cloud competitor — they're a close technical cousin with one architectural difference in our favour. The correct framing is "zero server calls, including for fonts — verifiable in DevTools" rather than "unlike cloud competitors."
The build priority that falls out of this:
Embed a curated font library client-side (1-1.5 sprints). This closes most of the smoothness gap, maintains our absolute zero-calls claim, and gives us a specific, verifiable differentiator we can put directly in our comparison blog posts and ProductHunt copy.
The compliance ICP specifically will respond to "font metadata never leaves your machine either" — because metadata derived from a sensitive document is still metadata, and their auditors will ask about it.
-- Conversation about what adding a new page does and the tools in edit mode

I could only inspect the public editor page shell and indexed page content, not operate the live canvas UI. So this is a constrained teardown of the blank-document flow on [pdfnolimit.com/editor.html](https://www.pdfnolimit.com/editor.html), with implementation notes marked as inference where needed.

**Overall Experience**

The editor is positioned as a browser-local PDF studio: “modify text, annotate, sign, or create new documents,” with “100% private” processing in-browser. The blank-page entry point is `Nouveau PDF`, which appears to start from a white A4 page rather than a template-driven flow. The UI looks like a single-canvas editor with a left or top tool rail, contextual controls for the selected object, and modal panels for more complex insertions like tables and signatures.

The experience seems optimized for lightweight document composition rather than full desktop-PDF-authoring depth. The tool list is broad enough to cover common markup and form-like tasks, but the surface suggests a simplified model: add/select/move/style/export, not deep layout, layers, guides, or advanced typography.

**By Tool / Section**

`Document`
- Likely the default/root context for page-level actions.
- The visible page title `Nouveau Document.pdf`, an `Information` area, and `100%` zoom control suggest this section governs document metadata, page navigation, and zoom.
- `+ Page` indicates multi-page authoring is supported from the blank-doc flow.

`Select`
- Standard object selection/edit mode.
- Expected behavior: click an element, get resize/rotate handles, then edit style or position.
- The presence of `Texte original Non sélectionné` suggests object state reflects whether an imported text layer is selected; on a blank page this probably stays inactive.

`Texte`
- Text insertion tool with font family dropdown and inline formatting controls.
- Visible fonts: `Arial`, `Helvetica`, `Times New Roman`, `Courier New`, `Verdana`, `Georgia`.
- Styling controls shown: `B`, `I`, `U`.
- This looks like a simple text-box model rather than paragraph styles or rich layout. I’d expect click-to-place, then direct typing with a bounding box.

`Dessin`
- Freehand drawing/annotation mode.
- Since it is split out from shapes, it likely supports pen strokes rather than vector primitives.
- The duplicated compact toolbar entry (`Dessin`) suggests there may be both a main rail and a mobile/secondary quick-action strip.

`Formes`
- Shape insertion group with `Rectangle`, `Cercle`, `Ligne`, `Flèche`, `Triangle`, `Tableau`.
- This likely opens either immediate insertion or a shape picker overlay.
- The inclusion of `Tableau` inside shapes implies the internal model may treat tables as positioned vector/text objects, not semantic table structures.

`Rectangle`, `Cercle`, `Ligne`, `Flèche`, `Triangle`
- Standard annotation/diagram primitives.
- Expected interaction: choose tool, drag onto canvas, then adjust stroke/fill/size.
- Since no advanced geometry controls are surfaced in the indexed text, the shape system is probably intentionally minimal.

`Tableau`
- The indexed modal exposes:
  - `Colonnes`
  - `Lignes`
  - `Largeur cell.`
  - `Hauteur cell.`
  - `Couleur lignes`
  - `Remplissage en-tête`
  - `En-tête`
- This is one of the more structured tools in the editor. It likely generates a table object from parameters rather than allowing spreadsheet-like editing first.
- The workflow seems modal: open table dialog, configure dimensions and header styling, then `Insérer`.

`Signer`
- Signature creation modal is visible with:
  - drawing/signature input area
  - `Effacer`
  - `Vos signatures récentes`
  - `Garder en mémoire pour plus tard`
- This suggests a stored-signature UX in local storage or browser persistence, then insertion as a reusable image/vector object.
- For a lightweight PDF tool, this is a strong convenience feature.

`Image`
- There is an image insertion tool and a `Remplacer l'image` action.
- That implies inserted images remain editable objects with source replacement, not flattened immediately.
- On a blank page, this would likely be one of the main composition paths: posters, flyers, forms, cover sheets.

`+ Page`
- Adds a blank page to the document.
- Given the product framing, I’d expect same-size page duplication or fresh A4 insertion rather than mixed page presets.

`Main`
- Likely the hand/pan tool.
- Usually used when the canvas is zoomed in and object editing is not desired.

`Enregistrer PDF`
- Export/save action.
- Since the site repeatedly claims browser-local processing, export is almost certainly client-side generation and download, not a server save.

**Likely Interaction Model**

The page content strongly suggests a canvas-based editor with object tools layered on top of PDF/page rendering. Blank-document mode is probably simpler than imported-PDF mode because there is no need to preserve original text operators or parse embedded fonts. In blank mode, the system can treat everything as placed objects on pages, then serialize that into a downloadable PDF.

The UX appears to rely on:
- one main canvas/document viewport
- a current-tool state
- contextual top controls for selected object styling
- modal dialogs for complex objects like tables and signatures
- local export/download rather than account-based persistence

**How It Was Probably Built**

Direct evidence from the public page is limited, so the following is inference from the UI structure and marketing claims.

Most likely stack:
- `pdf.js` or equivalent for rendering imported PDF pages into the browser
- a canvas/object layer such as `Fabric.js`, `Konva`, or a custom HTML canvas/SVG layer for editing objects
- `pdf-lib` or `jsPDF` for generating/exporting the final PDF client-side
- browser storage (`localStorage` or `IndexedDB`) for recent signatures and maybe session state

Why that inference fits:
- “100% private” and “processing local in browser” strongly imply no upload-required processing for core features.
- The editor mixes text, drawing, shapes, signatures, images, and tables, which is a common fit for an object model over canvas.
- `Remplacer l'image` and selection modes imply objects remain mutable after insertion.
- Signature persistence is a typical `localStorage` feature in browser-first tools.

**What I Could Not Verify**

I could not directly inspect:
- actual JavaScript bundle names
- console commands or runtime logs
- network requests
- DOM behavior after clicking tools
- whether text editing on imported PDFs edits original operators or overlays new text objects
- exact library choices

That limitation is because this session can fetch page content, but it does not have an interactive browser/devtools session against the live app.

**Bottom Line**

From the blank-page flow, pdfnolimit’s editor looks like a compact in-browser PDF composition and annotation studio with the strongest tools being text, shapes, tables, signatures, images, and page addition. The experience appears intentionally simple and task-oriented rather than professional-layout-heavy. The implementation is very likely a client-side canvas/object editor plus browser-side PDF export.

Sources:
- [Editor page](https://www.pdfnolimit.com/editor.html)
- [Site overview snippet](https://www.pdfnolimit.com/de/)