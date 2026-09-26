---
id: TASK-22
title: 'Idea: a preflight at start that the night can commit and reach its services'
status: Queued
assignee: []
created_date: '2026-09-26 12:36'
labels:
  - feature
  - skills
dependencies: []
priority: low
ordinal: 22000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Night 1 of the v7 trial found halfway through that git commit and docker needed permission approvals nobody could give, so nothing was committed and nothing ran against a database. A start-time check (or a documented checklist in the skill) would surface this while the developer is still awake. Raised by the agent as night feedback F2.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The owner decides whether start checks permissions, the skill documents a checklist, or neither
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
