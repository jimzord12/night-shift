---
id: TASK-44
title: >-
  Measuring a night in the Viewer must not make the first answer fail with a
  conflict
status: Review
assignee:
  - '@claude'
created_date: '2026-09-28 11:33'
updated_date: '2026-09-28 13:20'
labels:
  - viewer
  - meter
dependencies: []
priority: low
type: bug
ordinal: 44000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by TASK-28's visual review round 1 (V5): on a fresh install the first /api/overview writes Meter metrics into closed nights that have none; a deck opened on details loaded just before gets a 409 'the night changed since you opened it' on its first save (2 of 4 tries on fresh samples). The second Enter saves. Either measure before details are served, or let an answer merge when only metrics changed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On a fresh sample, answering the first question right after the Viewer opens saves on the first try (test on real files)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
