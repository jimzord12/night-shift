---
id: TASK-48
title: Enter on the save screen can save the next night by surprise
status: Active
assignee: []
created_date: '2026-09-28 19:42'
updated_date: '2026-09-28 20:32'
labels:
  - bug
dependencies: []
ordinal: 47000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-46 visual review (V5), older than it (TASK-28): after saving one night in the gate, Enter on the next card saves that one too without the owner seeing it first. Consequence: a night saved for the next agent the owner did not mean to hand over. Next step: require a focus or a short delay before Enter saves the next card.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 After saving one night on the gate, a second Enter or S within a moment does not save the next night; the next Save works once it is ready (UI test, mutant with no wait fails)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
