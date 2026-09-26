---
id: TASK-20
title: 'Trial v7 in a throwaway repository, then release v7'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-26 11:40'
updated_date: '2026-09-26 14:34'
labels:
  - release
dependencies: []
priority: high
type: spike
ordinal: 20000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Copy a small todo-list example app into a throwaway repository, install Night Shift, and run realistic nights and follow-ups with agents acting as the night workers and the lead acting as the developer. Release v7 only after that passes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 At least two nights and one follow-up ran through the real tool, skills and hook
- [x] #2 Friction found in the trial is fixed or filed
- [x] #3 v7 is tagged, installed and current
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
Trial in a throwaway copy of a todo-list app: night 1 (18 min, 6.46 USD: 1 partial, 3 blocked on questions; git and Docker were blocked by an allow-list mistake in the trial set-up), night 2 (20 min, 6.51 USD: 4 done with screenshots, 1 blocked on a new question), and one day follow-up (7.58 USD) that resolved the last item by day. Metrics matched Claude Code's own totals exactly. Friction fixed: inline JSON blocked (input.json + --file), stale question badge, history copy vs a repository's formatter; filed: TASK-22 (preflight). Released v7 (b680823), installed and current; the trial repo now runs the installed night-shift command. Unverified: gh feedback sending (would create public issues).
<!-- SECTION:FINAL_SUMMARY:END -->
