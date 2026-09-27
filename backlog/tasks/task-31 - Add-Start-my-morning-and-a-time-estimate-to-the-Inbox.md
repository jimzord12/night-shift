---
id: TASK-31
title: Add Start my morning and a time estimate to the Inbox
status: Queued
assignee: []
created_date: '2026-09-27 21:42'
updated_date: '2026-09-27 21:49'
labels:
  - viewer
dependencies:
  - TASK-25
  - TASK-28
priority: medium
type: feature
ordinal: 31000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24; replaces the Questions tab. On top of the Inbox, an estimate (about 4 minutes: 3 questions, 2 saves) and Start my morning: one run through every open question across repositories, ending on each repository's Save for the next agent gate.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With open questions in two repositories, Start my morning walks through all of them in one deck and ends on both gates (video)
- [ ] #2 The estimate counts questions and saves correctly for the sample nights (test)
- [ ] #3 The Questions tab is gone; the navigation shows Inbox and History only (screenshot)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
