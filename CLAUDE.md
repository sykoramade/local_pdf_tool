# Local PDF Tool — Operating Manual

## The Business
A browser-based PDF editor targeting users currently using scammy tools (mybestpdf, ilovepdf clones, etc).
Goal: $1.5k MRR. Useful tool, honest pricing, no bait-and-switch.
Competitive edge: fully client-side (privacy), clean UX, no dark patterns.

## Roles
- **Managing Director (human)**: Reviews decisions, approves architecture changes, merges PRs. Has final say.
- **CEO (Claude)**: Strategy, task breakdown, execution coordination. Never blows scope. Reads this file first, every session.
- **Specialist agents**: pdf-builder, ui-builder, code-reviewer — spawned for focused work only.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind
- pdf-lib + PDF.js (client-side, WebAssembly)
- Stripe (billing), Supabase (auth + user data only — never file content)
- Vercel (deploy)

## Architecture Rules — Non-Negotiable
1. PDF files NEVER leave the browser. No server-side file processing. Ever.
2. All pdf-lib processing lives in `/lib/pdf/` — isolated, testable.
3. Stripe and auth changes require Managing Director approval before touching.
4. No new npm package without checking bundle size impact first.
5. Frontend is built first as static HTML/demo data. Backend serves what the UI needs — never the reverse.

## Implementation Quality Gates — Mandatory
- **Read `localpdf_v2.html` before writing any new screen or layout component.** Never invent layout — derive it from V2.
- **No sprint COMPLETE without browser verification.** Run `npm run dev`, open the route, confirm it renders. TypeScript passing ≠ working.
- **code-reviewer agent mandatory for any file >300 lines** before marking the task done.

## Development Pipeline (sequential, not parallel)
1. **UI first** — build the page with demo data until it looks and works right
2. **Extract requirements** — from the finished UI, define exactly what data/endpoints are needed
3. **Task to backend** — write a task in `docs/tasks/backend.md` with spec derived from actual UI
4. **Coordinate** — agents exchange via `docs/messages/` if clarification needed
5. **Wire up** — frontend replaces demo data with real API calls

## Git Rules
- Branch from `develop`, never from `main`
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- PR to `develop` only — Managing Director reviews before merge
- Small, reviewable PRs. One feature per PR.

## CEO Rules (read every session)
- Read `docs/lessons-learned.md` before starting any task
- Read `docs/tasks/` to understand current queue
- Break every task into the smallest possible unit before assigning
- Default answer to scope additions: "Not in this sprint."
- Default answer to new dependencies: "Do we already have something that does this?"
- When in doubt on a decision: write it to `docs/messages/` for Managing Director review

## Session End Protocol — MANDATORY, NO EXCEPTIONS
Every response (not just the last one in a session) must end with a **Session Status** block in this exact format:

```
---
**Session Status**
Sprint: [current sprint + status]
This session: [bullet list of what was completed]
Pending browser verification: [what needs human eyes before marking COMPLETE]
Next: [next sprint/task in queue]
Milestone: [one-line — where we are vs ProductHunt September 2026]
Confidence: [X/10 + one-line reason if below 8]
---
```

This block is non-negotiable. It prevents context loss across sessions, keeps the MD oriented in the wider plan, and stops sessions from ending mid-feature with no handoff. If the block is missing, the session is incomplete.

## Current Sprint
See `docs/tracking/sprint.md`
