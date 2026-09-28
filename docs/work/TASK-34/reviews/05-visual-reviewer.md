# Visual review round 5: TASK-34

**Verdict: PASS.** The thumbnail fix works. After a mouse click on a thumbnail and Esc, Enter saves the checked answer. When the keyboard reaches a thumbnail, Enter opens the image and saves nothing. All three journeys reached their end, and every answer on disk matches what the screen showed as chosen. There are no Blocking findings, one Note, and the console was clean.

**Viewer:** `dev · 4d26f27` on port 4951, built with `npm run build` in `night-shift.worktrees\ci`. It is stopped now.

**Data:**
- A fresh copy of the round-4 set, with the registry paths rewritten: `scratchpad\kb34r5\`, reset copy `kb34r5-pristine`. That is 9 questions across 6 nights, including brand "Which app icon?" with image options.
- Scripts are in `scratchpad\r5k\`, where scratchpad is `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad`. I reset the data before every run.

**Screenshots:** `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-keyboard-r5\`

## Journeys (1440)

- **(a) Whole morning by keyboard:** walked to the end (`a-01` to `a-*`).
  - Keys: Tab and Enter on Start my morning, then Enter, N, "1" then Enter, D with a note and Ctrl+Enter, Enter four times (brand saved `b` this way), and N on the last question.
  - The gate named "Which chat widget? not answered". S five times reached All clear, and Enter went back to the Inbox.
  - On disk: `support Q1=b`, `payments Q1=a, Q2=discuss + note, Q3=a`, `docs b`, `design a`, `brand b`. A follow-up was written for each of the 5 nights.
- **(b) Thumbnails:**
  - **Click, Esc, Enter:** clicking the Blue thumbnail opened the zoom (`b51-02`). Esc closed it, and the focus stayed on the thumbnail (`b51-03`). Enter made exactly one save, `answer=b` (the checked Green, which is the recommended one), and the deck moved on. I ran it three times, all the same.
  - **Pick Blue first:** clicking the Blue row, then its thumbnail, Esc, Enter saved `a` (`b52-*`).
  - **Keyboard:** Tab onto the thumbnail, then Enter, opened the zoom with no save (`b53-02`, `b53-03`). Esc, then Enter again, reopened it with no save. A third Esc closed the deck.
  - **Click, Esc, then Tab and Shift+Tab back to the thumbnail:** Enter opened the image and saved nothing (`b54-*`). A Tab gives Enter back to the thumbnail.
  - **Zoom closed with its X button instead of Esc:** Enter saved `b`, once.
- **(c) Mixed:** clicked "use it" on "How many retries", Tab reached Not now in one step, Enter. Nothing was sent to the server, the deck moved to the next question, and the file on disk still has `Q1=null` (`c5-*`).
- **Extra, phone (390 x 844, touch):** tapped the thumbnail, the zoom opened, and its close button worked. There was no sideways scrolling (page width 390). Tapping Blue and then Save saved `a` (`p5-*`).

## Findings

### V14 Note: after a click and Esc, the thumbnail shows the same ring as a keyboard-reached one, but Enter does something different
Journey/step: (b), click the Blue thumbnail, Esc - Width: 1440
- Saw: after Esc the browser counts the focus as keyboard focus, so the Blue thumbnail gets the same white ring as when Tab reaches it (`b51-03` beside `b53-02`). Enter then saves Green (checked) in the first case, and opens the image in the second.
- The screen still marks the saved choice clearly: the check and violet border are on Green, and Save shows "Enter". This follows the round-4 rule for buttons ("a clicked control leaves Enter to Save"), so it is consistent, not wrong.
- Screenshot: `b51-03-after-esc.png`, `b53-02-thumb-tabbed.png`
- Fix (optional, for TASK-40 or `design-reviewer`): move the focus to the option row when the zoom closes after a mouse click, or suppress the ring on a clicked thumbnail.

**Not a finding:** the deck order of the five nights from 27 Sept changed between resets. They share the same times in this sample data, so the order ties. Within a session the order was stable, and a save always moved to the next question in the progress bar.

V4, V5, V7, V9 and V13 are unchanged and deferred to TASK-40. V5 (the focus falls to the page body after a save) is still visible.

## Console
Clean in every run: no errors, no warnings, no failed requests and no responses of 400 or above.

## Verdict: PASS
