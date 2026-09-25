---
id: TASK-9
title: Review v5 once more against the review practice
status: Queued
assignee: []
created_date: '2026-09-25 17:59'
labels:
  - release
dependencies: []
priority: medium
type: chore
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The fixes after the first review, the practices port and the media viewer had one independent review each; no second round ran on the fix batches. Run one fresh review of v5 against docs/practices/review.md.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A fresh review report of v5 is stored and its Blocking/Material findings are fixed or tracked
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
