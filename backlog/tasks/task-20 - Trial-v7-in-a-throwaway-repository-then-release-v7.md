---
id: TASK-20
title: 'Trial v7 in a throwaway repository, then release v7'
status: Queued
assignee: []
created_date: '2026-09-26 11:40'
updated_date: '2026-09-26 12:42'
labels:
  - release
dependencies: []
priority: high
type: spike
ordinal: 20000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Copy a small todo-list example app into a throwaway repository, install Night Shift, and run realistic nights and follow-ups with agents acting as the night workers and the lead acting as the developer. Release v7 only after that passes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 At least two nights and one follow-up ran through the real tool, skills and hook
- [ ] #2 Friction found in the trial is fixed or filed
- [ ] #3 v7 is tagged, installed and current
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
