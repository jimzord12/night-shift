---
id: TASK-27
title: Show a step track on every Night Report and card
status: Done
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 13:39'
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
- [x] #1 Answering the last question visibly moves the track to Ready to save without a reload (short video)
- [x] #2 Each card shows its small track and the report shows one Next: line per state (screenshot)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [x] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built on feat/step-track: web/src/StepTrack.tsx (StepTrack, nextStep, NextLine). The report shows the track under its summary with one Next: line (a phrase to copy for discuss and waiting); each Inbox card shows the small track. Evidence: .local/evidence/2026-09-28-step-track/r2-{1440,390}/ (log.txt: 6 of 6 cards carry a track; answering docs' last question moves the report from Needs answers to Ready to save without a reload; video in the same folder).

Review round 1 (docs/work/TASK-27/reviews/01-*): code FINDINGS, design PASS. Dispositions: code F1 fixed (a saved night with a question left says 'your answer reaches the next agent'); F2 fixed (Running: 'an agent is on it; reload to see how far it got'); F3 fixed: every state of the sample seen at 1440 and 390 from the committed build, and Copy checked on the clipboard (.local/evidence/2026-09-28-step-track/r3/, log.txt); F4 fixed (Waiting says 'a running night is working on what it carried' when every open item is taken). N1: the discuss branch comes alive with TASK-29 (feat/file-shapes), exercised there. N2 / design D3 (skipped steps ticked) no action: deliberate, the badge names the state. Design D1 fixed (on a phone: 'Step N of 6 · <state>' under the track). D2 closed by r3; D4, D5 no action.

Review round 2 (02-code-reviewer.md): PASS. R2-F1 no action: a follow-up saved while another night runs says 'tonight, say start night shift'; the tool refuses a second night only until the running one closes, and 'tonight' already points past it. R2-F2 closed by the reviewer's own walk of a held night on the committed build (scratchpad task27-r2/shots: 'a running night is working on what it carried' beside 'Taken by a running night', 1440 and 390). N1 no action. Final: StepTrack and Next line on every report, small track on every card; evidence .local/evidence/2026-09-28-step-track/r2-*, r3.
<!-- SECTION:NOTES:END -->
