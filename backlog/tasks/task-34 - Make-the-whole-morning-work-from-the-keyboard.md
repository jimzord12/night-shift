---
id: TASK-34
title: Make the whole morning work from the keyboard
status: Active
assignee: []
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 16:33'
labels:
  - viewer
dependencies:
  - TASK-28
  - TASK-29
priority: medium
type: enhancement
ordinal: 34000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24, laptop first. Enter accepts the recommended answer (exists for Save today), D opens let's discuss, arrows move between questions, S saves for the next agent; small key hints show them.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A full morning (answer, discuss one, save) is done without the mouse (video)
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
tests/ui/deck.test.ts (TASK-8) clicks through the deck; update it if this changes what it clicks.

Review round 1 (docs/work/TASK-34/reviews/01-*): code PASS, design PASS, visual FINDINGS. Dispositions: V1 fixed (a question left with Not now is not asked again in this deck; one moveOn rule for Not now and for after a save; N on the last waiting question opens the gate, which lists it as not answered). V2 fixed (Enter on a focused button in the deck presses it; on an answer option it still saves). V3 fixed (D puts the cursor in the note at once when it is open, and once drawn when new). Code F1 fixed (D, N, S by key position, so a Greek layout works). Code F2 fixed (the keyboard test presses Ctrl+D and still keeps the recommended answer). V6 fixed (Save's hint reads Ctrl+Enter while the cursor is in the note). Design D4 fixed (S hint normal weight). The browser test now also covers Not now by a focused button, D twice, S on a Greek layout; removing V1, V2, V3, F1 or the modifier guard each fails it. To TASK-40: V4 (Esc twice drops a typed note), V5 (focus can leave the deck; after Esc it does not return to the opener), V7 (question order differs between loads), D6 (the n / m counter reads like a position). No action: D5, F3, F4. F5 done (status Active).
<!-- SECTION:NOTES:END -->
