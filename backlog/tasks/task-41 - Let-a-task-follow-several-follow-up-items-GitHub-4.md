---
id: TASK-41
title: 'Let a task follow several follow-up items (GitHub #4)'
status: Queued
assignee: []
created_date: '2026-09-28 10:24'
labels:
  - cli
  - schemas
dependencies: []
references:
  - 'https://github.com/jimzord12/night-shift/issues/4'
priority: medium
type: feature
ordinal: 41000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GitHub #4 (bad-fit, from an Adopter's night on v12). A plan task takes a single follow_up ref, so two open items that belong to one piece of work force the plan to split the task. Accept a list of follow-up refs per task. This changes the plan file shape (night-shift/plan): a new @2 that keeps reading @1, or update the owner's Adopters in the same change (AGENTS.md versioning rule); the night's resolution of items and the Viewer's from-follow-up pill must follow.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A plan whose task names two follow-up items is accepted, and closing the night resolves both (test on real files)
- [ ] #2 Existing plans with a single follow_up still validate and run
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
