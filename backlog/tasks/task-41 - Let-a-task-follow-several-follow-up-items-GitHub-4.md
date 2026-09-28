---
id: TASK-41
title: 'Let a task follow several follow-up items (GitHub #4)'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-28 10:24'
updated_date: '2026-09-28 16:00'
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
- [x] #1 A plan whose task names two follow-up items is accepted, and closing the night resolves both (test on real files)
- [x] #2 Existing plans with a single follow_up still validate and run
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Integrated to main after five review rounds (reports in docs/work/TASK-29/reviews; dispositions in TASK-29 notes; round 5 code, design and visual PASS). npm run check and npm run test:ui pass on the merged revision. Screenshots looked at: .local/evidence/2026-09-28-shapes/r5, r6 in the shapes worktree. Show in folder: POST reveal returned 200 and Explorer opened a window on the file's folder (seen in the shell window list, not in a screenshot). Not done yet: the CHANGELOG entry lands with release v16 (DoD 4).
<!-- SECTION:FINAL_SUMMARY:END -->
