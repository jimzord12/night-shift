---
id: TASK-8
title: Cover the question deck with UI tests
status: Review
assignee:
  - '@claude'
created_date: '2026-09-25 17:59'
updated_date: '2026-09-28 11:58'
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

Went ahead before TASK-28/29/34 land: the deck's core (choose, note, Save writes the file) is stable across them, and a test now guards it. TASK-28's diff was checked and the test still fits; TASK-29 (note button) and TASK-34 (keyboard) must update tests/ui/deck.test.ts when they change what it clicks. Review round 1 (docs/work/TASK-8/reviews/01-code-reviewer.md): FINDINGS. F1 fixed: the night is measured (recover) before serving, as a real morning is, so the Viewer's recovery no longer rewrites it mid-test; the TASK-44 race stays with TASK-44; on failure the test prints the deck's error; 6/6 local runs green. F2 fixed: the browser launches before the server, and the server wait is inside try. F3 fixed: this note. N1 no action.
<!-- SECTION:NOTES:END -->
