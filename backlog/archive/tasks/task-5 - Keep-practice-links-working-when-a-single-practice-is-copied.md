---
id: TASK-5
title: Keep practice links working when a single practice is copied
status: Queued
assignee: []
created_date: '2026-09-25 17:59'
labels:
  - practices
dependencies: []
priority: medium
type: bug
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Copying one practice file into a project breaks its relative links to sibling practices (review.md links evidence.md, idea-loop.md links proposals.md). Make the links absolute GitHub URLs or install all practices together.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A practice copied alone into another repository has no broken links
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
