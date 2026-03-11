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

**2026-03-11 DECISION: Coordination via markdown files**
No automated agent orchestration. All coordination through docs/tasks/ and docs/messages/.
Reasoning: simpler, reviewable, works with a single Claude Code instance. Managing Director can see all state at any time just by reading files.
