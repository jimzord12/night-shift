---
id: TASK-47
title: >-
  A waiting question is lost when the task that followed it ends without asking
  again
status: Done
assignee: []
created_date: '2026-09-28 14:04'
updated_date: '2026-09-28 19:00'
labels:
  - bug
dependencies: []
priority: medium
ordinal: 46000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in TASK-29 review round 3 (N1), present before that change. A follow-up item of kind waiting (a question the developer has not answered yet) can be planned by a night. If that task ends without asking the question again, buildFollowUp turns the item into carried and the Viewer then locks the question, so the developer can no longer answer it and the next agent never hears the question. Consequence: an open question silently disappears. Suggested fix: when a task that followed a waiting item ends without a new question, carry the waiting item forward as waiting (same question), and add a test.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A waiting item whose task ends without the question asked again (word for word) stays open where it was asked, answerable in the Viewer, and the next night must plan or skip it; an answer given later is not copied into another follow-up (D30)
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
Review round 1 (01-code-reviewer.md): FINDINGS. Dispositions: F1 fixed (buildFollowUp carries only decisions this night took over; an item still open is not copied; test answers before the next save). F2 fixed (the start message quotes the waiting question and says to ask it again word for word; the skill says the tool matches the wording and to skip a waiting item only when the question no longer matters). F3 fixed (design: done or skipped locks; the Item status bullet names the exception). F4 fixed (AC reworded; D30 added). N1 fixed with F2's skill line. N2 fixed (unused variable).

Review round 2 (02-code-reviewer.md): PASS. After the verdict: M1 fixed (a night copies only decisions it carried itself: status carried and resolved by that night). M2 fixed (asked again also matches the question the task was blocked by; one askedAgain helper for both places). N1 no action (the skill and the Item status bullet already say a skipped question is closed).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
A question the developer has not answered is no longer lost when a night works on its task without asking it again: the follow-up item stays open where it was asked, answerable in the Viewer, and the next night must plan or skip it (D30). Asked again word for word, or the task done or skipped, it is closed as before. An answer stays where it was given; a night copies only the decisions it carried itself. The start message quotes the waiting question; the start skill says to ask it word for word and to skip a waiting item only when it no longer matters. Two review rounds, round 2 PASS; reports in docs/work/TASK-47/reviews. npm run check 62/62. Not done yet: the CHANGELOG entry lands with release v16 (DoD 4). Items older releases already marked carried stay locked.
<!-- SECTION:FINAL_SUMMARY:END -->
