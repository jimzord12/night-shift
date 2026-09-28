# Visual review round 4: TASK-34

**Verdict: PASS.** V10, V11 and V12 are fixed. All four journeys reached their end, and every Enter saved exactly the answer shown as checked. There are no Blocking findings, one Nit, and the console was clean.

Viewer: `dev · 2fb4e5c` on port 4941, built with `npm run build` in `night-shift.worktrees\ci`. It is stopped now.

Data: a fresh copy of the round-3 set in `scratchpad\kb34r4\`, with `kb34r4-pristine` as the reset copy and the scripts in `scratchpad\r4k\`. That is 9 questions across 6 nights. I reset the data before every run.

Screenshots are in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-keyboard-r4\`.

## Journeys

- **(a) Whole morning by keyboard, 1440:** walked to the end (`a-01` to `a-12`).
  - Keys used: Tab and Enter on Start my morning, then Enter, N, "1" then Enter, D with a note and Ctrl+Enter, Enter on the next four, and N on the last waiting question.
  - The gate listed the question left unanswered. S five times reached All clear, and Enter went back to the Inbox.
  - The night files on disk match what was chosen: `payments Q1 = a`, where "1" moved the focus onto "One retry" and Enter saved it; `Q2 = discuss` with the note.
- **(b) Round-3 repros, 1440:**
  - **V10 fixed.** Clicking "use it" then Enter saved the recommended answer and moved on. It works with both locator clicks and the real mouse.
  - **V11 fixed, mouse.** Clicking "Weekly", then 2, moved the check and the focus to "Monthly"; Enter saved `b`.
  - **V11 fixed, keyboard.** Tab onto "One retry", then 3, moved the focus to "No retries"; Enter saved `c`.
  - **V12 fixed.** After Ctrl+Enter from a note, the next question's Save button reads "Save Enter".
- **(c) Mixed mouse and keyboard, 1440:** all passed (`c4-01` to `c4-08`).
  - Click "7 days", then 2, then Enter: saved `b`, and the check and the focus ring were on "14 days" (`c4-02`).
  - Press 2 (Intercom), click "use it", then Enter: saved `a` (Crisp).
  - Click "Show in folder" (stubbed), then Enter: exactly one `/reveal` request and one answer saved (`design = a`), and the deck moved on.
  - Click Next, Tab once to Not now, then Enter: nothing saved, and the deck moved to the next waiting question.
  - Tab onto "Show in folder", then Enter: one `/reveal`, nothing saved, still on the question. A button the keyboard reached still presses itself.
  - Extra check: click "use it", then ArrowRight, then Enter saved the new question (`Q2 = a`). A leftover click state does no harm.
- **(d) Phone, 390 x 844, touch:** walked to the end (`d4-01` to `d4-11`).
  - Tapped "30 days" and Save; the footer showed "Your answer: 30 days".
  - Tapped let's discuss: the note got the cursor. Save with an empty note showed a clear red message and saved nothing (`d4-04`). After typing, Save saved the note.
  - Tapped Not now on "Which docs host?": nothing saved. The gate named it "not answered: the next agent asks again" (`d4-08`).
  - Six more Saves, then five "Save for the next agent" taps, reached All clear; "Back to the Inbox" went back.
  - No sideways scrolling at any step.

## Findings

### V13 Note, Nit: the focus ring on Not now is hard to see
Journey/step: (c), Tab onto Not now - Width: 1440 - Saw: the only focus mark is the browser's 1px light outline on the cream button, so Not now looks almost the same focused as unfocused. - Expected: a ring as clear as the violet one on the answer options. - Screenshot: `e4-footer-notnow-focused.png` beside `e4-footer-unfocused.png`, and `c4-07-not-now-tabbed.png` - Fix: give the round footer buttons a `focus-visible` ring in the accent colour. This round's change did not cause it; it is a matter for `design-reviewer`.

V5 (focus falls to the page body after a save) is as before, not worse. V4, V7 and V9 did not come up.

## Console
Clean in every run: no errors, no warnings, no failed requests and no responses of 400 or above.

## Verdict: PASS
