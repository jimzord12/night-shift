---
id: TASK-27
title: Show a step track on every Night Report and card
status: Review
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 13:24'
labels:
  - viewer
dependencies:
  - TASK-24
priority: medium
type: feature
ordinal: 27000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. The owner cannot tell where a night stands or what comes next. A step track (the TASK-24 labels: Running, New, Needs answers, Ready to save, Waiting for an agent, Done) sits on top of every report: the current step glows, finished steps are ticked, the next-step button sits under it, and it animates on when a step completes, in D12's style. Cards carry a small version. Every state also shows one Next: line, with a phrase to copy where one exists. Chosen over a per-night animated graph on its own tab.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Answering the last question visibly moves the track to Ready to save without a reload (short video)
- [ ] #2 Each card shows its small track and the report shows one Next: line per state (screenshot)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built on feat/step-track: web/src/StepTrack.tsx (StepTrack, nextStep, NextLine). The report shows the track under its summary with one Next: line (a phrase to copy for discuss and waiting); each Inbox card shows the small track. Evidence: .local/evidence/2026-09-28-step-track/r2-{1440,390}/ (log.txt: 6 of 6 cards carry a track; answering docs' last question moves the report from Needs answers to Ready to save without a reload; video in the same folder).
<!-- SECTION:NOTES:END -->
