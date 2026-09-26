---
id: TASK-21
title: Install a tagged release from a fresh clone
status: Queued
assignee: []
created_date: '2026-09-26 12:36'
labels:
  - release
dependencies: []
priority: medium
ordinal: 21000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
npm run release builds a tag only when the tag is new, and switch needs an existing ~/.night-shift/releases/vN. A stranger who clones the repository cannot get a night-shift command on PATH; the README tells them to run node src/cli.ts from the clone. Add a way to install an existing tag (for example npm run release install vN) and point the README at it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 From a fresh clone, one documented command puts a working night-shift for the latest tag on PATH
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
