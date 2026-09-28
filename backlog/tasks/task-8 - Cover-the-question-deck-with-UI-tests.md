---
id: TASK-8
title: Cover the question deck with UI tests
status: Review
assignee:
  - '@claude'
created_date: '2026-09-25 17:59'
updated_date: '2026-09-28 11:49'
labels:
  - viewer
dependencies: []
priority: medium
type: enhancement
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The web UI has no tests beyond typecheck and build. Add a few Playwright checks for the question deck, the owner's most-used screen, against a copy of examples/sample-repo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A test answers a question in the deck through the real app and reads the answer back from the file
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
2026-09-28: TASK-28, TASK-29 and TASK-34 rewrite the question deck (D24); write these tests against the new deck, not the current one.
<!-- SECTION:NOTES:END -->
