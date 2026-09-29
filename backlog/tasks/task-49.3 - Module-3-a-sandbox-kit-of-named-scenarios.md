---
id: TASK-49.3
title: 'Module 3: a sandbox kit of named scenarios'
status: Queued
assignee: []
created_date: '2026-09-29 08:36'
labels:
  - enhancement
dependencies: []
parent_task_id: TASK-49
priority: high
ordinal: 51000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
npm run sandbox <scenario>: an isolated install folder it always sets itself, scenarios built through the real tool, a fresh Viewer build on a free port, its own processes tracked and stopped, one clean command outside .local. The UI tests (one install folder each) and reviewer briefs use the same scenarios; Playwright from the repository's own dependency.
<!-- SECTION:DESCRIPTION:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
