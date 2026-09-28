---
id: TASK-34
title: Make the whole morning work from the keyboard
status: Queued
assignee: []
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 11:58'
labels:
  - viewer
dependencies:
  - TASK-28
  - TASK-29
priority: medium
type: enhancement
ordinal: 34000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24, laptop first. Enter accepts the recommended answer (exists for Save today), D opens let's discuss, arrows move between questions, S saves for the next agent; small key hints show them.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A full morning (answer, discuss one, save) is done without the mouse (video)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
tests/ui/deck.test.ts (TASK-8) clicks through the deck; update it if this changes what it clicks.
<!-- SECTION:NOTES:END -->
