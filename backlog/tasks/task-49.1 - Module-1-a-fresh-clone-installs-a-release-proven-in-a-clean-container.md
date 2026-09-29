---
id: TASK-49.1
title: 'Module 1: a fresh clone installs a release, proven in a clean container'
status: Queued
assignee: []
created_date: '2026-09-29 08:36'
labels:
  - chore
dependencies: []
parent_task_id: TASK-49
priority: high
ordinal: 49000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Absorbs TASK-21. Today npm run release builds only a new tag and switch needs an existing build, so a stranger who clones cannot get a night-shift command. Add an install of an existing tag, point the README at it, and prove it in a fresh Linux container that clones the public repository, installs the tag, and runs a smoke night (install, start, close, the Viewer answering).
<!-- SECTION:DESCRIPTION:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
