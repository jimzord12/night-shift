---
id: TASK-28
title: End the question deck on a Save for the next agent gate
status: Review
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 11:12'
labels:
  - viewer
dependencies:
  - TASK-24
priority: high
type: feature
ordinal: 28000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. After the last answer nothing happens; Create follow-up sits in a side card, and the owner forgot what hand-over means (nothing runs until they start an agent). The deck's last screen lists the answers and the unfinished tasks with one button, Save for the next agent, which creates the Follow-up file. A confirmation says nothing runs yet and gives the phrase to copy: start night shift, or work on the follow-up by day, in the named repository. Until an agent picks the work up, a changed answer rewrites the follow-up; after that it is locked. Picked up means a started night's plan links the item (a task with follow_up, or skipped_follow_ups) or the item has left open; confirm this signal is enough while building.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Answering the last question lands on the gate; pressing it creates the follow-up and shows the confirmation with a working copy button (video)
- [ ] #2 Editing an answer after saving, before any agent picked it up, updates the follow-up file (test on real files)
- [ ] #3 Once an agent has picked an item up, its answer is locked with a line saying why (test on real files, screenshot)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
