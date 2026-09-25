---
id: TASK-17
title: Name only the missing file when compare evidence is incomplete
status: Queued
assignee: []
created_date: '2026-09-25 18:18'
labels:
  - app
dependencies: []
priority: low
type: bug
ordinal: 17000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in review of TASK-16 (existing behaviour, src/overview.ts): when one file of a compare pair is missing, the Outcome's problem names both files ('checkout-before.svg, checkout-after.svg is not on the card'). It should name only the missing one.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Removing only the before file of a compare pair gives a problem naming only that file
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
