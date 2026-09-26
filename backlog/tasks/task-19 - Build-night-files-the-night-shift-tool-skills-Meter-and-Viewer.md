---
id: TASK-19
title: 'Build night files, the night-shift tool, skills, Meter and Viewer'
status: Queued
assignee: []
created_date: '2026-09-26 11:40'
labels:
  - feature
dependencies: []
priority: high
ordinal: 19000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement docs/design.md: plan, night and follow-up schemas; night-shift start/record/ask/feedback/close/status/meter/follow-up/check/install/view; the start-night-shift and do-night-shift-follow-up skills; the Claude Code session-end hook; the Viewer over every registered repository.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 An agent can run a night end to end with only the skill and the tool
- [ ] #2 The Viewer shows every registered repository's nights, answers questions, creates follow-ups and sends feedback
- [ ] #3 Metrics come from Claude Code's own session logs; missing ones show as unknown
- [ ] #4 Tests exercise the real files, git and server; mocks only for gh
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
