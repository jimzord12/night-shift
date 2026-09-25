---
id: TASK-16
title: 'Track work in Backlog.md, read Backlog.md boards, adopt the .local convention'
status: Review
assignee:
  - '@claude'
created_date: '2026-09-25 18:11'
labels:
  - app
  - practices
  - templates
dependencies: []
priority: high
type: feature
ordinal: 16000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner request 2026-09-25: run this repository on Backlog.md (replacing docs/backlog.md), add a Backlog.md board adapter so projects without Trello can use the Morning Review, and merge the best agent-context conventions of the owner's other projects (.local folder, owner file and profile, senior-developer Git autonomy, reviewer agents) into this repository and its templates.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every open item of docs/backlog.md is a Backlog.md task and docs/backlog.md is gone
- [ ] #2 night-shift serve on a project with board.type backlog shows its night-ready tasks as the queue and its outcome comments as shifts, with evidence
- [ ] #3 A test through the real server reads files written by the Backlog.md 1.52 CLI
- [ ] #4 AGENTS.md, docs/owner.md, the practices and the templates carry the .local convention, the backup-tag rule and the reviewer agents
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Backlog.md init and migration
2. BacklogBoard adapter, schema, types, demo, tests
3. Practices, owner file, profile, agents, templates
4. check, screenshot, closed review loop, merge, release v6
<!-- SECTION:PLAN:END -->
