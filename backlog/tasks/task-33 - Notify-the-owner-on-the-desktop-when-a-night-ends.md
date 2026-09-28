---
id: TASK-33
title: Notify the owner on the desktop when a night ends
status: Review
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 11:24'
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
- [ ] #1 Closing a night on Windows raises a notification naming the repository and its open questions; clicking it opens the report (screenshot)
- [ ] #2 With notifications off, closing a night raises nothing (test)
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
Recovery does not notify: it runs inside the Viewer and night-shift start, where the owner already is (code review r1 F5). Only close and the session-end hook do.
<!-- SECTION:NOTES:END -->
