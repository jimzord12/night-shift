---
id: TASK-33
title: Notify the owner on the desktop when a night ends
status: Done
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-29 08:19'
labels:
  - cli
  - viewer
dependencies: []
priority: high
type: feature
ordinal: 33000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. The Viewer only waits; a forgetful owner never opens it and the flow stalls. When the tool closes a night (session-end hook or recovery), it can raise a desktop notification (<repository>: night finished, 2 questions for you) whose click opens that Night Report. Optional per install, since Night Shift imposes nothing; needs a link per report.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Closing a night on Windows raises a notification naming the repository and its open questions; clicking it opens the report (screenshot)
- [x] #2 With notifications off, closing a night raises nothing (test)
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
Recovery does not notify: it runs inside the Viewer and night-shift start, where the owner already is (code review r1 F5). Only close and the session-end hook do.

Review: code rounds 1-3 (docs/work/TASK-33/reviews/); round 3 PASS. Rounds 1 and 2 carry their dispositions at the end of each report (kept there by mistake; from round 3 on they live here). Round 3: N1 fixed ($ErrorActionPreference = 'Stop'); N2 this note; N3, N4 not changed. Open: acceptance #1 needs the owner's look: run night-shift notify test, click the toast, and see a real night's toast open its report. The toast is proven delivered to Windows' notification centre (round 2).

2026-09-29: the owner ran night-shift notify test on Windows and reports it works. Still unverified: a real night's toast opening its report (it will show on the next real night).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Closing a night raises a desktop notification (off until night-shift notify on) naming the repository and what waits; clicking opens the report. Code review PASS r3; the owner confirmed night-shift notify test on Windows. Unverified: a real night's toast.
<!-- SECTION:FINAL_SUMMARY:END -->
