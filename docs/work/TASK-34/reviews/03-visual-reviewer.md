# Visual review round 3: TASK-34

**Verdict: FINDINGS.** V8 is fixed: Enter on the Open link now opens the file and saves nothing. Journeys (a), (b) and (c) pass. Journey (d), mixed mouse and keyboard, breaks in two places (V10 and V11).

Viewer: `dev · 3124c4d` on port 4931, built with `npm run build` in `night-shift.worktrees/ci`.

Data: a fresh copy of the round-2 set in `scratchpad\kb34r3\`, with `kb34r3-pristine` as the reset copy and the scripts in `scratchpad\r3k\`. It is the owner-states set-up, `extra.ts` and `extra2.ts` (the `design` night, whose question points at files), plus a new `brand` night (`r3k/extra3.ts`) whose options carry image thumbnails. That makes 9 questions.

Screenshots are in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-keyboard-r3\`. I tested at 1440 only, as the brief asked.

## Journeys
- **(a) Whole morning by keyboard:** walked to the end, keyboard only. Tab and Enter on Start my morning, then Enter, N, 1 then Enter, D with a typed note and Ctrl+Enter, Enter on the next three, and N on the last waiting question. The gate listed the question left unanswered; S five times reached All clear, and Enter went back to the Inbox. That wrote 7 answers and 5 follow-ups (`a-01` to `a-12`).
- **(b) V8 repro:** fixed. Tab onto Open, then Enter, opened the file in a new tab showing "# Brief"; nothing was saved and the deck stayed on the question (`b-02`, `b-03`, `b-open-tab.png`).
  - Enter on View opened the image, and Esc brought focus back to View.
  - Enter on an option's thumbnail opened that image, and Esc closed it with nothing saved (`b-06`, `b-07`, `b-08`).
- **(c) Focused option and "let's discuss":** passes.
  - Tab onto "7 days" (recommended was "14 days"), then Enter, saved `a` (`c-01`, `c-02`).
  - Tab onto "let's discuss", then Enter, checked it and put the cursor in the note with nothing saved; typing and Ctrl+Enter saved it with the note (`c-03` to `c-05`).
- **(d) Mixed mouse and keyboard:** broke at "use it" (V10).
  - Passed: clicking an option then Enter saved it; clicking Next then Enter saved the question shown; clicking Previous then Enter saved; clicking "let's discuss" then typing and Ctrl+Enter saved.

## Findings

### V10 Blocking: after clicking "use it" or "Show in folder", Enter presses that button again instead of saving
Journey/step: (d), "Which chat widget?". I clicked "use it", then pressed Enter, and again. - Width: 1440 - Saw: no request was sent and the deck stayed put: Enter just pressed "use it" again. With "Show in folder", each Enter sent another `/reveal`, which on a real machine opens another Explorer window. - Expected: a button that has focus only from a click leaves Enter to Save, as this round's change promises. - Screenshot: `d2-01-use-it-clicked.png`, `d2-02-after-enter.png` - Cause: Chromium marks the clicked button `:focus-visible` as soon as a key is pressed; my capture listener logged `fv=true` for that keydown. So the `:focus-visible` guard on `QuestionDeck.tsx:217` cannot tell a click from a Tab. - Fix: have the deck track how focus arrived. Set a ref on `pointerdown`, clear it on a Tab keydown, and treat the element as keyboard-reached only when the ref is clear. Add "click use it, then Enter saves" to `tests/ui/deck.test.ts`.

### V11 Blocking: Enter saves the focused option, not the one checked on screen
Journey/step: (d), "Which currency on invoices?". I clicked "Always EUR", then pressed 2. - Width: 1440 - Saw: the check moved to "The customer currency", then Enter saved `answer=a` ("Always EUR"). The same happens by keyboard alone: in (c), Tab onto "One retry", then 3, then Enter, saved "One retry" while "No retries" was checked. - Expected: Enter saves the answer the screen shows as chosen. - Screenshot: `d2-04-clicked-a-then-2.png`, `c-06-focus-one-picked-three.png` - Fix: when 1-9 or D picks an answer, move focus to the button just picked (or blur a focused option). The V10 fix alone covers only the mouse case.

### V12 Note: the Save button keeps saying "Ctrl+Enter" after a note is saved
After Ctrl+Enter from a note, the next question, which has no note open, shows "Save Ctrl+Enter". Plain Enter still saves. The cause: the note is removed while it has focus, so its blur never runs and `inNote` stays true. This came in with 06598b8 on this branch. - Screenshot: `c-06`, `d2-05-hint-after-note-save.png` - Fix: reset `inNote` when the question changes.

### Also seen, as designed
After View or a thumbnail, Esc then Enter reopens the image. Esc gives focus back to that control, so that fits "a control the keyboard reached".

V5, V7 and V9 look the same as in round 2 (focus still falls to the page body after a save), not worse.

## Console
Clean: no errors, no failed requests and no responses of 400 or above in any run.

## Verdict: FINDINGS
V10 and V11 are Blocking. The Viewer on port 4931 is stopped.
