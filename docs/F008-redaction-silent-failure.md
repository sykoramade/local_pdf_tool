# F008 — HIGH: Redaction silently skips content streams with unsupported or corrupt filters

**Severity:** HIGH
**Component:** `app/lib/pdf/redact.ts`

## Summary

`redactPdf` processes only FlateDecode and uncompressed page content streams. When a stream uses any other filter (LZW, JBIG2, CCITTFax, etc.) or when FlateDecode decompression fails, the function silently skips that stream via `continue` and includes it **unchanged** in the saved output. The caller receives no error or warning — `totalReplacements` simply reflects zero matches on the skipped stream. A user who redacts a document containing affected streams believes redaction succeeded when it did not.

## Reproduction

1. Open a PDF whose page content stream uses LZWDecode or any non-FlateDecode filter (common in pre-2000 PDFs), or a PDF with a corrupt FlateDecode stream.
2. Enter target text that appears on an affected page and click Redact.
3. Save the output. Inspect with a PDF reader or `pdfinfo`/`pdftk`.
4. The target text remains in the output file data layer.

## Code location

`app/lib/pdf/redact.ts`
- Line 202–204: FlateDecode decompression failure → `continue`
- Line 208–210: Unsupported filter → `continue`
- Line 232: `pdfDoc.save()` serializes all streams including unmodified skipped ones

## Expected behavior

Redaction either blanks the target text in every content stream on the page, or refuses to proceed and tells the user why.

## Actual behavior

Streams with unsupported or corrupt filters are silently preserved in the output. No error is thrown, no warning is surfaced, and the returned `RedactResult` gives no indication of which streams were skipped.

## Suggested fix directions

1. **Fail loudly:** throw before saving if any stream was skipped (`skippedStreams > 0 → Error`). Prevents false-confidence output at the cost of hard-blocking on unprocessable PDFs.
2. **Warn in UI:** surface a banner/toast listing affected pages. Lets the user decide but requires the caller to handle a new `skippedStreams` field in `RedactResult`.
3. **Exclude affected pages from output:** omit pages with skipped streams entirely. Safest from a data-leakage standpoint; may surprise users who expected those pages in the output.
4. **Combination:** Option 1 for corrupt streams (unrecoverable), Option 2 for known-unsupported filters (operator can advise).

## Decision points before a fix lands

- Should `redactPdf` know about page numbers, or should the caller map `skippedStreams` back to pages for the UI warning?
- Is hard-blocking on unsupported filters acceptable UX, or does the product need graceful degradation?
- LZWDecode support could be added (libraries exist); is that in scope for v1?

---

## v1 Launch Blocker Assessment

**Recommendation: YES, blocker — but a one-line mitigation is available.**

There is no way to detect affected PDFs upfront without scanning every stream at load time (expensive). No test PDF fixtures exist in the repo to gauge real-world prevalence, but LZWDecode in older PDFs is common enough that a redaction tool shipping silently cannot be considered safe. The minimum fix for v1 is to add a `skippedStreams` counter and throw (or return an error flag the UI surfaces as a hard warning) if any stream was skipped — this changes no redaction logic, takes ~5 lines, and makes the failure visible rather than silent.
