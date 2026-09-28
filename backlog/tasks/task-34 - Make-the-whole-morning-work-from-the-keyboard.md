---
id: TASK-34
title: Make the whole morning work from the keyboard
status: Done
assignee: []
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 18:37'
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
- [x] #1 A full morning (answer, discuss one, save) is done without the mouse (video)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
tests/ui/deck.test.ts (TASK-8) clicks through the deck; update it if this changes what it clicks.

Review round 1 (docs/work/TASK-34/reviews/01-*): code PASS, design PASS, visual FINDINGS. Dispositions: V1 fixed (a question left with Not now is not asked again in this deck; one moveOn rule for Not now and for after a save; N on the last waiting question opens the gate, which lists it as not answered). V2 fixed (Enter on a focused button in the deck presses it; on an answer option it still saves). V3 fixed (D puts the cursor in the note at once when it is open, and once drawn when new). Code F1 fixed (D, N, S by key position, so a Greek layout works). Code F2 fixed (the keyboard test presses Ctrl+D and still keeps the recommended answer). V6 fixed (Save's hint reads Ctrl+Enter while the cursor is in the note). Design D4 fixed (S hint normal weight). The browser test now also covers Not now by a focused button, D twice, S on a Greek layout; removing V1, V2, V3, F1 or the modifier guard each fails it. To TASK-40: V4 (Esc twice drops a typed note), V5 (focus can leave the deck; after Esc it does not return to the opener), V7 (question order differs between loads), D6 (the n / m counter reads like a position). No action: D5, F3, F4. F5 done (status Active).

Review round 2 (02-*): design PASS, code FINDINGS, visual FINDINGS. Dispositions: code F1 and visual V8 fixed (Enter on a link the keyboard reached, the file's Open, presses it). Code F2 fixed (Enter on a focused answer option saves that option; on let's discuss with no note it picks it and puts the cursor in the note, as D does). Code F3 fixed (a link or button presses itself on Enter only when it holds the keyboard focus, :focus-visible; a clicked one leaves Enter to Save); not covered by a test, the browser test drives the keyboard only. Code F4 fixed (the test focuses Compact while Detailed is picked and asserts Compact). Code F5 fixed (Enter on an option's thumbnail opens it). Removing the option or the link rule fails the keyboard test. No action: code F6, design D3, D4. To TASK-40: visual V9 (a Not now in a night saved earlier is not named on the gate).

Review round 3 (03-*): code FINDINGS, visual FINDINGS. Dispositions: visual V10 and code F2 fixed (the deck remembers whether the focus came from a click, pointerdown, cleared by Tab; a clicked button or link leaves Enter to Save; :focus-visible dropped, Chromium marks a clicked button focus-visible on keydown; the round-2 F3 disposition was wrong, this replaces it). Visual V11 and code F1 fixed (a number key moves the focus to the option it picked, so Enter saves the checked answer). Visual V12 fixed (Save's hint returns to Enter when the question changes). New browser test: click an option then 2 then Enter, click use it then Enter, focus one option then 2 then Enter; removing either fix fails it. No action: code N1 (Enter during a save is swallowed), N2 (after a conflict a second Enter saves the kept draft; as before this change), N3 (WebKit).

Review round 4 (04-*): visual PASS, code FINDINGS. Dispositions: code F1 fixed (the mixed test clicks use it, Tabs to Not now, presses Enter and asserts the question stays unanswered; removing the Tab reset fails it). Code F2 fixed (a clicked thumbnail leaves Enter to Save, like a clicked button). No action: N1 (a keyboard-reached progress segment keeps the focus; with TASK-40 V5), N2 (a rare stale Ctrl+Enter hint after the gate). To TASK-40: visual V13 (the focus ring on the cream footer buttons is hard to see).

Review round 5 (05-*): visual PASS, code FINDINGS. Dispositions: code F1 fixed after the round (the mixed test adds a question with picture options: a thumbnail reached by keyboard opens on Enter and answers nothing; a clicked one, after Esc, leaves Enter to Save; removing either thumbnail rule fails it). Code F2 fixed after the round (a note focus still pending is cancelled by Esc; five back-to-back UI runs pass). N1 (Enter on let's discuss with no note untested) and visual V14 (a clicked thumbnail shows the keyboard ring after Esc) no action. The round cap (5, attended) is reached with these fixes unreviewed: not reported as done; a sixth round needs the owner's go.

Review round 6 (06-*), cap extended to 8 by the owner: code PASS, visual PASS. After the verdict: code F1 fixed (the refusal path's note focus uses the same cancellable timer, so Esc cancels it too). F2 (no test for the Esc cancel; the race reproduces only with synthetic key events) and N1 no action.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
A whole morning works from the keyboard: Enter keeps the recommended answer, 1-9 pick, D picks let's discuss with the cursor in the note (Ctrl+Enter saves), N leaves a question for now (the deck does not come back to it; the gate names it), arrows move, S on the gate saves for the next agent, Enter leaves once all is clear. D, N and S work by key position, so a Greek layout works. Enter on a control reached by keyboard does its own job; a clicked one leaves Enter to Save; a number key moves the focus to its pick. Six review rounds (owner extended the cap to 8); round 6 code and visual PASS; reports in docs/work/TASK-34/reviews. Checks: npm run check 60/60, npm run test:ui 3/3 (a keyboard-only morning, a mixed mouse-and-keyboard morning with picture options, and the original deck test). Video: .local/evidence/2026-09-28-keyboard/out4/keyboard-morning.webm in the ci worktree. Deferred to TASK-40: Esc twice drops a note, focus leaving the deck, question order ties, the counter wording, a Not now in an earlier-saved night, the footer focus ring. Not done yet: the CHANGELOG entry lands with release v16 (DoD 4).
<!-- SECTION:FINAL_SUMMARY:END -->
