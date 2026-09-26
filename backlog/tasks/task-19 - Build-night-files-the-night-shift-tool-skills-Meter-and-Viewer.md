---
id: TASK-19
title: 'Build night files, the night-shift tool, skills, Meter and Viewer'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-26 11:40'
updated_date: '2026-09-26 14:15'
labels:
  - viewer
  - cli
  - skills
  - meter
dependencies: []
priority: high
type: feature
ordinal: 19000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement docs/design.md: plan, night and follow-up schemas; night-shift start/record/ask/feedback/close/status/meter/follow-up/check/install/view; the start-night-shift and do-night-shift-follow-up skills; the Claude Code session-end hook; the Viewer over every registered repository.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 An agent can run a night end to end with only the skill and the tool
- [x] #2 The Viewer shows every registered repository's nights, answers questions, creates follow-ups and sends feedback
- [x] #3 Metrics come from Claude Code's own session logs; missing ones show as unknown
- [x] #4 Tests exercise the real files, git and server; mocks only for gh
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [x] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Built: plan/night/follow-up schemas, the night-shift tool (start, record, ask, feedback, close, follow-up, status, check, install, view, meter), two skills, the Meter reading Claude Code session logs, and the Viewer (Morning, Questions, History). Checks: npm run check green, 24 node tests on real files, git and the Hono server (no mocks; gh untouched); code review 6 rounds (R2, R5, R6 PASS), visual 6 rounds, design 7 rounds (R7 PASS); metrics matched Claude Code's own totals exactly in two live nights (6.46 and 6.51 USD). Unverified: sending feedback with gh (would create public issues); link mode marks an entry sent when the link opens.
<!-- SECTION:FINAL_SUMMARY:END -->
