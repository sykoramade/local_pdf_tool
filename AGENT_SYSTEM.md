# Agent System — Operating Manual & Replication Guide

> How this project runs with Claude Code + multi-agent coordination.
> Copy this file (plus CLAUDE.md) to any new project to replicate the setup.

---

## 1. What This Is

A structured multi-agent development system running inside **Claude Code** (CLI).
One human (Managing Director) steers strategy and approves decisions.
One primary AI session (CEO) breaks down work and coordinates specialists.
Specialist agents are spawned for focused, bounded tasks — never for open-ended exploration.

All coordination happens through markdown files in `docs/`. No external orchestration tool. No automation. Everything is readable, auditable, and reversible.

---

## 2. Role Structure

| Role | Who | Responsibilities | What They Don't Touch |
|---|---|---|---|
| **Managing Director** | Human | Approves PRs, architecture decisions, billing/auth changes, sprint scope | Never writes code |
| **CEO** | Claude (primary session) | Reads all state files, breaks tasks into smallest units, assigns to specialists, maintains coordination docs | Never blows scope; default is "no" to additions |
| **ui-builder** | Spawned agent | Frontend components, layouts, styling — UI first with demo data | No backend wiring until MD approves UI |
| **pdf-builder** | Spawned agent | pdf-lib processing, lib/pdf/* utilities — isolated, testable | No UI code |
| **code-reviewer** | Spawned agent | Read-only review after any file >300 lines; reports issues only | Never fixes directly |
| **security-reviewer** | Spawned agent | Pre-commit security audit | Never fixes directly |

---

## 3. Coordination Layer

```
docs/
├── tasks/
│   ├── frontend.md       — ui-builder task queue (delete tasks when done)
│   └── backend.md        — pdf-builder task queue
├── messages/             — async comms (format: NNN-YYYY-MM-DD-from-to-topic.md)
├── decisions.md          — permanent architecture decision log
├── lessons-learned.md    — every agent reads this before starting work
├── tracking/
│   └── sprint.md         — sprint board (source of truth for status)
└── guidelines/
    └── workflow.md       — task sizing rules, completion protocol
```

**How tasks flow:**
1. MD describes the feature or problem in the chat session
2. CEO reads V2 spec + lessons-learned + sprint board
3. CEO writes tasks to `docs/tasks/frontend.md` or `backend.md`
4. MD reviews task file and confirms scope before implementation starts
5. Specialist agent executes (spawned via Agent tool or manually)
6. Output committed; sprint board updated; task deleted
7. MD reviews PR

**Inter-agent messages** follow the naming convention `NNN-YYYY-MM-DD-from-to-topic.md`.
They exist for async handoffs (e.g. "UI complete, backend can now wire the API").
MD can read any message file at any time — no hidden state.

---

## 4. Session Start Protocol — `/go` Skill

Every session begins with `/go`. This skill:
1. Reads `CLAUDE.md` (project rules, roles, architecture constraints)
2. Reads `docs/lessons-learned.md` (known failure patterns)
3. Reads `docs/tracking/sprint.md` (current state)
4. Reads `docs/tasks/frontend.md` + `backend.md` (pending work)
5. Reports: current sprint status, last completed task, recommended next action
6. **Waits for MD confirmation before doing anything**

The CEO never starts work until MD confirms the recommended action.

---

## 5. Mandatory Quality Gates

These are non-negotiable. They exist because each one maps to a real failure that happened.

| Gate | Rule | Why It Exists |
|---|---|---|
| **Read V2 before building** | Read `localpdf_v2.html` (or your project's spec file) before writing any new screen or layout component | S16 was implemented from memory. Layout was wrong. MD caught it by running the app. |
| **Browser verify before COMPLETE** | Run `npm run dev`, open the route, confirm it renders. TypeScript passing ≠ working. | S11 + S12 shipped unverified. Board was wrong for two sprints. |
| **code-reviewer for >300 lines** | Mandatory code-reviewer agent on any file over 300 lines | Large files accumulate subtle bugs and stale closures that don't surface in TypeScript |
| **Sprint board updated before next sprint** | Update `sprint.md` to COMPLETE immediately after last task commit | S11/S12 were shipped but board never updated. S13 started with wrong state. |
| **Confidence rating on every answer** | Rate X/10. Below 8/10 → bring in co-CEO + PM agents before proceeding | Prevents overconfident autonomous decisions on ambiguous scope |
| **Tasks written before code** | `docs/tasks/` must be written and MD-approved before implementation begins | S16 — no task file. No V2 analysis. Code written from assumptions. |

---

## 6. Architecture Non-Negotiables (Project-Specific)

Adapt these for each project. The pattern (not the specifics) is what matters.

```
1. PDF files NEVER leave the browser — client-side only, always
2. All pdf processing in /lib/pdf/ — isolated, testable, no UI imports
3. Stripe + auth changes require MD approval before touching
4. No new npm package without bundle size check first
5. UI built first with demo data — backend serves what the UI needs, never the reverse
```

The key principle: **every non-negotiable exists to protect the project's core differentiator or to prevent a class of mistake that already happened**.

---

## 7. Git Rules

```
- Branch from `develop`, never from `main`
- Conventional commits: feat: / fix: / chore: / docs: / refactor:
- PR to `develop` only — MD reviews before merge
- Small, reviewable PRs — one feature per PR
- No force-push to main
- No --no-verify
```

Commit messages explain *why*, not *what*. The diff shows what.

---

## 8. Development Pipeline (sequential, not parallel)

```
1. Research      — GitHub search + docs before writing anything new
2. Plan          — CEO writes task file; MD approves
3. UI first      — build with demo data until it looks and works right
4. Requirements  — derive backend spec from finished UI, not the other way
5. Backend task  — write to docs/tasks/backend.md with UI-derived spec
6. Wire up       — frontend replaces demo data with real API calls
7. Review        — code-reviewer agent; address CRITICAL + HIGH
8. Verify        — browser test; zero console errors
9. Commit        — sprint board updated same block as commit
```

Steps are gates, not suggestions. Skipping a step is not faster — it creates rework.

---

## 9. Guardrails Summary

**What the CEO can do autonomously:**
- Read any file
- Write tasks and messages to `docs/`
- Spawn specialist agents
- Write and edit code within the confirmed sprint scope
- Run `npm run dev` / `npm run build` to verify

**What always requires MD approval:**
- Stripe, auth, or billing changes
- Adding a new npm dependency
- Changing the git branching strategy
- Any scope addition to the current sprint
- Architectural decisions (logged to `decisions.md` first)
- Merging to `main`

**Default answers:**
- Scope additions during a sprint: **"Not in this sprint. Added to backlog."**
- New dependencies: **"Do we already have something that does this?"**
- Decisions under 8/10 confidence: **"Flagging to MD before proceeding."**

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Layout built from memory, not spec** | High (happened once) | High — full rework | Mandatory V2 read gate; quote spec CSS in comments |
| **Sprint marked complete before browser verify** | High (happened twice) | Medium — stale board, bugs in prod | Hard gate: browser verify is part of the task, not optional |
| **Stale context window causing silent omissions** | Medium | Medium — coordination drift | `/go` skill re-reads all state at session start; sprint board updated same block as commit |
| **Scope creep mid-sprint** | Medium | High — diluted sprint, missed delivery | CEO default is "no"; backlog exists for a reason |
| **Stale closure bugs in React** | Low-Medium | Medium — subtle runtime bugs | code-reviewer agent on large files; deps arrays checked |
| **New npm package breaks bundle** | Low | Medium | Bundle size check required before adding |
| **Stripe/auth change breaks billing** | Low | High | MD approval gate; never touched without explicit sign-off |
| **PDF content leaving browser** | Very low | Critical | Architecture constraint + privacy audit (S9-1 confirmed clean) |

---

## 11. Learnings (Key Failures and Their Rules)

### Sprint 11/12 — Board not updated (2026-03-18)
Two full sprints shipped. Board never updated. Next session started with wrong state. MD had zero visibility.
**Rule**: Sprint board updated before next sprint starts. Same work block as the last commit. Not deferrable.

### Sprint 16 — Layout built from memory (2026-03-19)
WorkspaceShell implemented as IDE layout. None of it matched V2 spec. Caught by MD running the app.
**Rule**: Read `localpdf_v2.html` before writing any new screen. Never invent layout.

### Sprint 16 — Pipeline skipped (2026-03-19)
No task file written. No V2 analysis. Code written from assumptions. No good justification.
**Rule**: Task file must exist and be MD-approved before implementation begins on any sprint involving a new layout component.

### Sprint 18 — Stale closure in React (2026-03-21)
`sigs` array missing from `useCallback` deps in `handleDownload`. Caught by code-reviewer before merge.
**Rule**: code-reviewer agent is mandatory for any file >300 lines. Run it before marking the task done.

---

## 12. Conversation Rules (How to Talk to the CEO)

These rules govern how the MD communicates with Claude in this project. Apply them in any similar setup.

**Starting a session:**
- Type `/go` — do not describe the task yet. Let the CEO read state first.
- After the CEO reports status, confirm or redirect. Only then describe the task.

**Describing tasks:**
- Describe the *outcome*, not the implementation. "Users should be able to drag signatures" not "add a mousedown handler".
- Scope boundaries matter. Say what is explicitly NOT in scope if there's ambiguity.
- If you have a spec file, say so. "Derive from V2" is enough.

**Approvals:**
- "Looks good" = approved to proceed. CEO treats this as a green light.
- Silence after a plan is NOT approval. CEO will wait.
- If you want to defer something: "backlog" or "not this sprint". CEO will log it and move on.

**When CEO asks for clarification:**
- Answer directly. The question exists because confidence is below 8/10.
- Don't ask the CEO to "figure it out" on ambiguous scope — that's how scope creep happens.

**When something is wrong:**
- Say it plainly: "that's wrong" / "revert that" / "start over on X".
- CEO will stop, diagnose, and propose a corrected approach before touching code again.

**What not to do:**
- Don't describe a full system in one message and expect it to be built in one session.
- Don't add scope mid-sprint casually — it gets logged to backlog, not picked up immediately.
- Don't approve something you haven't read. The task file exists so you can read it.

---

## 13. Replicating This Setup in a New Project

1. **Copy `CLAUDE.md`** — update: business description, stack, architecture non-negotiables, role names.
2. **Copy this file (`AGENT_SYSTEM.md`)** — update sections 6 (non-negotiables) and 10 (risk).
3. **Create `docs/` structure**:
   - `docs/tasks/frontend.md` — task queue
   - `docs/tasks/backend.md` — task queue
   - `docs/messages/` — empty directory
   - `docs/decisions.md` — empty log
   - `docs/lessons-learned.md` — empty, add entries as mistakes happen
   - `docs/tracking/sprint.md` — start Sprint 1
4. **Install the `/go` skill** — or write a simple version that reads CLAUDE.md + lessons-learned + sprint.md and reports status.
5. **Define your spec file** — equivalent of `localpdf_v2.html`. This is the source of truth for all UI. Nothing gets built without consulting it.
6. **First session**: type `/go`, confirm the setup, create Sprint 1 task file together with the MD.

The system works at any scale. The overhead is low (reading 3-4 files per session). The payoff is that context is never lost between sessions and the MD always has full visibility.

---

## 14. Haiku Quality Control — Junior Dev Review

Haiku is treated as a capable junior developer: fast, instruction-following, but needs review before merge.

**Full protocol**: `docs/guidelines/haiku-review.md`

**Flow:**
```
Haiku executes task
    ↓
Haiku writes self-report (files changed / decisions made / uncertain / spec deviations)
    ↓
Sonnet reads self-report + diffs changed files + runs 5-section checklist
    ↓
ACCEPT → commit + update sprint board
RETURN TO HAIKU → re-run with specific correction note
ESCALATE TO SONNET → Sonnet fixes + logs pattern to haiku-review.md
```

Sprint board is **not updated** until Sonnet accepts the output.

**Most common Haiku failure patterns:**
- Stale closures — state captured without being in `useCallback` deps array
- Missing `useEffect` cleanup (listeners, observers, timers)
- Direct Map mutation instead of `new Map(prev).set(k, v)`
- Hardcoded colors instead of design tokens / CSS variables
- Missing `Array.from()` on Map iterators (tsconfig target incompatibility)

**Which tasks go to Haiku:**
- Checklist execution (browser verify steps)
- New components where props interface is fully defined in the task file
- Single-file changes where the exact code is written in the task spec
- All `docs/` file writes (sprint board, task files, messages)

**Which tasks stay on Sonnet:**
- Multi-file coordination requiring judgment about existing code
- State machine logic in WorkspaceShell (800+ lines, too much context required)
- Any task where the spec has gaps that require design decisions
- All code-reviewer passes

**Review overhead**: ~5k tokens per Haiku task (self-report + diff read). Far cheaper than Sonnet debugging a subtle stale closure two sprints later.

---
