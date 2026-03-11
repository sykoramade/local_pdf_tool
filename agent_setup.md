2. Docker — The Safe Sandbox
bash# Clone the sandbox
git clone https://github.com/yury-egorenkov/claude-code-docker
cd claude-code-docker

# Create your local secrets file (never committed)
cp .env.default.properties .env.properties
```

Edit `.env.properties`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
WORKSPACE_DIR=../pdf-tool
Then add your project shortcuts to a local.makefile (not committed):
makefilepdf:
    $(MAKE) docker.run WORKSPACE_DIR=../pdf-tool

ceo:
    $(MAKE) docker.run WORKSPACE_DIR=../pdf-tool

build:
    $(MAKE) docker.run.d WORKSPACE_DIR=../pdf-tool
Run it: make pdf — Claude Code launches inside the container, mounted to your project, with network locked down to GitHub + npm + Anthropic only. Your host machine is untouched.

3. The CLAUDE.md — The Agents' Constitution
This is the most important file. Every agent reads it before doing anything. Put it at the root of pdf-tool/:
markdown# PDF Tool — Operating Manual

## What We're Building
A browser-based PDF editor. Text editing preserves layout.
All PDF processing runs CLIENT-SIDE only. Files never touch our servers.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind
- pdf-lib + PDF.js (client-side, WebAssembly)
- Stripe (billing), Supabase (auth + user data only)
- Vercel (deploy)

## Architecture Rules — Non-Negotiable
1. PDF files NEVER get uploaded to any server. Ever.
2. All pdf-lib processing lives in /lib/pdf/ — isolated, testable
3. Stripe webhooks require explicit CEO approval before changes
4. No new npm package added without checking bundle size impact

## Git Rules
- Branch from `develop`, never from `main`
- Conventional commits: feat:, fix:, chore:, docs:
- PR to `develop` only — CEO agent reviews before merge

## CEO Decision Authority
The CEO agent (see /agents/ceo.md) has final say on:
- Architecture changes
- New dependencies
- Anything touching billing or auth
- Scope changes to current sprint

When in doubt, STOP and ask the CEO agent.

## Current Sprint Goal
Build the text editor tool: user uploads PDF → edits text inline 
→ layout preserved → downloads. Nothing else yet.

4. The Subagents — Your Actual Team
Create a folder in your project: pdf-tool/.claude/agents/
CEO Agent — the decision-maker:
markdown# .claude/agents/ceo.md
---
name: ceo
description: Use when a decision needs to be made about architecture, 
  scope, dependencies, or priorities. Always consult before major changes.
tools: Read, Glob, Grep
model: claude-sonnet-4-6
---

You are the CEO of this PDF tool project. You are not a coder — 
you are a decision-maker and product strategist.

When consulted:
1. Read CLAUDE.md first, always
2. Ask: does this decision move us toward the sprint goal?
3. Ask: does this add complexity we don't need yet?
4. Ask: is there a simpler way?

You can say NO. That is your most valuable function.

Default answer for scope creep: "Not in this sprint."
Default answer for new dependencies: "Do we already have something 
that does this?"

Output a clear DECISION: APPROVED / REJECTED / NEEDS MORE INFO
followed by one paragraph of reasoning. Nothing more.
PDF Builder — the technical specialist:
markdown# .claude/agents/pdf-builder.md
---
name: pdf-builder  
description: Use for all PDF processing tasks using pdf-lib and PDF.js.
  Browser-side only. Never suggest server-side file handling.
tools: Read, Write, Edit, Bash, Glob
---

You are a specialist in browser-based PDF manipulation with pdf-lib 
and PDF.js. Your constraint: files never leave the browser.

Before writing code:
1. Check /lib/pdf/ for existing utilities
2. Check bundle size impact of any new import
3. Write a test alongside every utility function

Key patterns for this project:
- Load PDFs with PDF.js for rendering
- Modify with pdf-lib for saving
- Keep font handling isolated — it's the trickiest part
UI Builder:
markdown# .claude/agents/ui-builder.md
---
name: ui-builder
description: Use for React components, Tailwind styling, and UX flows.
tools: Read, Write, Edit, Glob
---

You build clean, functional UI. No animations until the tool works.
No design system until we have 3+ reusable components.
Tailwind only — no CSS-in-JS.
Mobile-responsive from the start, not retrofitted later.
Reviewer:
markdown# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Use after any significant feature is built to review 
  before merging to develop.
tools: Read, Grep, Glob, Bash
---

You review code. You do NOT write code.
You report issues back to the builder agent.

Check for:
- Client-side PDF processing violations (files going to server?)
- Missing TypeScript types
- Missing error states (what happens when PDF is malformed?)
- Bundle size regressions
- Security: no user data leaked in console.logs

Output: APPROVED or list of issues with file:line references.

6. The Interaction Model — When a Request Comes In
Say a user reports: "When I edit text near the bottom of the page, it shifts the whole layout."
Here's how the team handles it:
You type into Antigravity's Agent Manager:

"Bug report: text editing near page bottom shifts layout. Consult CEO agent on priority, then have pdf-builder diagnose and fix."

What happens:

CEO agent spins up first (Opus model, read-only tools). Reads the bug, reads CLAUDE.md, checks current sprint goal. Outputs: DECISION: APPROVED — this is core to our value prop. Fix before adding any new feature.
PDF-builder agent spawns in its own worktree (isolated git branch, feat/fix-layout-shift). Subagents can use worktree isolation to work in parallel without conflicts — each gets its own worktree that's automatically cleaned up when finished. Claude It digs into /lib/pdf/, finds the coordinate system bug, fixes it, writes a test.
Antigravity shows you an Artifact: a task list, the diff, and a browser recording of the tool working before and after. You read it. If it looks right, you approve.
Code-reviewer agent runs on the diff — read-only, reports back any issues.
If clean: pdf-builder opens a PR to develop. You merge it.


The CEO as Decision Filter
The key configuration is making the CEO agent the required first step for anything ambiguous. In Antigravity you can encode this as a workflow rule:
In .antigravity/rules.md:
markdown# Workflow Rules

Before any of the following, consult the CEO agent first:
- Adding a new npm package
- Creating a new page/route
- Changing the Stripe integration
- Any task not in the current CLAUDE.md sprint goal

CEO agent output of APPROVED required before work begins.
This means when you (or anyone) fires a request at the team, the CEO agent acts as the first filter. It either approves the work, rejects it as out of scope, or asks a clarifying question — all before a single line of code gets written.

The Day-to-Day Loop
Once this is running, your actual interaction is minimal:

Morning: Open Antigravity Manager View, see what agents completed overnight if you left tasks running
New feature: Type the request in plain English → CEO approves → builders execute in parallel → reviewer signs off → you merge
Bug: Same flow, faster — CEO decides priority, builder fixes
You never need to touch the Docker terminal once it's running — Antigravity's Manager View is your dashboard