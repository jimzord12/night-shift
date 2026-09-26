---
id: TASK-1
title: Post outcomes with a night-shift outcome command
status: Queued
assignee: []
created_date: '2026-09-25 17:58'
labels:
  - cli
dependencies: []
priority: high
type: feature
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Builders must post the `night-shift outcome/1` block and upload evidence; today they need the project's own board tooling for that. Add `night-shift outcome <project> <card> --status … --line … --evidence image:after.png …` that posts through the `Board Adapter` (Trello: comment plus attachment upload; Backlog.md: append to the task's implementation notes and copy files to the attachments folder), so every project gets it for free.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Posting through the command produces an Outcome the Morning Review shows, on a Trello board and on a Backlog.md board
- [ ] #2 Evidence files named in the command appear as resolvable evidence in the app
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
