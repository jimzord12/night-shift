---
id: TASK-48
title: Enter on the save screen can save the next night by surprise
status: Active
assignee: []
created_date: '2026-09-28 19:42'
updated_date: '2026-09-28 20:44'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Review round 1 (0b36518): visual PASS (V1 held Enter still saved every night: taken, key repeats ignored on the gate; V2 dim level: no change). Code FINDINGS: F1 the test passed on the unfixed Gate (it pressed before the UI updated): now waits for the Saved line; pre-fix Gate fails 2/2 at the only-one-saved check, no-repeat-guard fails too. F2 the delayed focus scrolled the gate ~620px on a phone: focus({preventScroll}). F3 enabled for one render: armed is derived per state in render. N1 (deck double Enter), N2 (single-night confirmation skipped), N3 (order): pre-existing or accepted.
<!-- SECTION:NOTES:END -->
