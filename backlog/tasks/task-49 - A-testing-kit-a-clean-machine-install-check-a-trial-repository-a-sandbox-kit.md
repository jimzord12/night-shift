---
id: TASK-49
title: >-
  A testing kit: a clean-machine install check, a trial repository, a sandbox
  kit
status: Queued
assignee: []
created_date: '2026-09-29 08:36'
labels:
  - spike
dependencies: []
priority: high
ordinal: 48000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Hand-testing rebuilds its setup every time: about 65 throwaway setup, walk, screenshot and probe scripts in one session; reviewers risk the owner's real install when NIGHT_SHIFT_ROOT is missed; scripts borrow Playwright from another project; stray Viewer servers; sample nights in the oldest file format; and no real night has exercised decisions or the new save gate. Three modules, one at a time, simplest first (the owner, 2026-09-29): (1) a clean-machine container proving a fresh clone installs a release (TASK-21); (2) a trial repository, a small real project with a Docker Compose database and deliberately open tasks, for real nights and TASK-22's check; (3) a sandbox kit: named scenarios built through the real tool, served by the Viewer on a free port, cleaned in one command, used by the UI tests and reviewer briefs. Docker belongs in (1) and (2), not in (3), which must match Windows and start in seconds.
<!-- SECTION:DESCRIPTION:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
