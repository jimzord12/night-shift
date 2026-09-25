---
id: TASK-16
title: 'Track work in Backlog.md, read Backlog.md boards, adopt the .local convention'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-25 18:11'
updated_date: '2026-09-25 18:24'
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
- [x] #1 Every open item of docs/backlog.md is a Backlog.md task and docs/backlog.md is gone
- [x] #2 night-shift serve on a project with board.type backlog shows its night-ready tasks as the queue and its outcome comments as shifts, with evidence
- [x] #3 A test through the real server reads files written by the Backlog.md 1.52 CLI
- [x] #4 AGENTS.md, docs/owner.md, the practices and the templates carry the .local convention, the backup-tag rule and the reviewer agents
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [x] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Backlog.md init and migration
2. BacklogBoard adapter, schema, types, demo, tests
3. Practices, owner file, profile, agents, templates
4. check, screenshot, closed review loop, merge, release v6
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Changed: Backlog.md tracks this repo (TASK-1..15 migrated, docs/backlog.md removed); BacklogBoard adapter (src/board/backlog.ts) with schema, types, UI label, examples/backlog-demo written by the 1.52 CLI; .local convention, docs/owner.md, practice upgrades (git backup tags, review depth, evidence honesty, board, local-folder), glossary terms, D16-D19, reviewer agents (code, design, research) in .claude/agents and templates; templates for owner profile and Backlog.md.
Checks: npm run check passes, 33 tests (7 in tests/backlog.test.ts through the real server); app walked on a copy of the demo at 3a9ce88, desktop and mobile, console clean (screenshots local); installed v6 `night-shift check --board` passes on this repo and on the demo.
Review: round 1 PASS (4 Minor, 4 Notes, fixed; one pre-existing defect filed as TASK-17), round 2 PASS (3 Minor wording, fixed on the small-change path).
Released v6 (83f4694). Unverified: a real night on a Backlog.md project (TASK-4); the Trello adapter was not touched.
<!-- SECTION:FINAL_SUMMARY:END -->
