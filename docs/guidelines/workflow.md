# Workflow Guidelines

## Task Size Rule
Every task must be small enough to review in one pass (~15-30 min of work).
If you can't describe the task in 3 sentences, break it down further.

## Before Writing Any Code
1. Read CLAUDE.md
2. Read docs/lessons-learned.md
3. Read your task file (docs/tasks/frontend.md or backend.md)
4. Check if the thing you're about to build already exists in the codebase

## Completing a Task
1. Implement
2. Self-review: does it match the acceptance criteria exactly?
3. Update docs/decisions.md if an architectural choice was made
4. Delete the task from your task file
5. If a follow-on task is needed for another agent, write it to their task file

## When Blocked or Uncertain
Write a message to docs/messages/ with format:
`NNN-YYYY-MM-DD-from-to-topic.md`
Example: `001-2026-03-11-frontend-md-auth-question.md`
Wait. Do not guess. Do not proceed past your uncertainty.

## Scope Discipline
- Sprint goal is the only goal
- New ideas go to backlog in docs/tracking/sprint.md — never into the current sprint without CEO approval
- Managing Director approves scope changes
