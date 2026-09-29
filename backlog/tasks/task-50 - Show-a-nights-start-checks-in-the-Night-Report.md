---
id: TASK-50
title: Show a night's start checks in the Night Report
status: Queued
assignee: []
created_date: '2026-09-29 21:16'
labels:
  - enhancement
dependencies: []
priority: low
ordinal: 52000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D33 (TASK-22) records the start checks in the git-ignored plan.json only; the developer never sees in the morning what the night proved it could do. A short line in the Night Report (for example 'Checked at start: the tests run, commits run, the database is up') would show it. Raised by the TASK-22 code review, N1.
<!-- SECTION:DESCRIPTION:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
