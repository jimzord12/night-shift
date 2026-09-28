# Visual review round 1: TASK-34

Viewer: `dev · 6d26cce` (worktree `night-shift.worktrees/ci`, `npm run build` run first), port 4911. Data: `owner-states/setup.ts` plus a scratch script that adds `payments` (3 questions) and `support` (2 questions). That makes 7 questions across 4 nights, with 3 nights to save. Everything lives in the scratchpad `kb/` folder and was reset between runs. Screenshots are in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-keyboard-r1\`.

Journeys:
- **(a) 1440, answering every question:** reached the end. Tab to Start my morning, then Enter, number keys, D with a note and Ctrl+Enter, arrows, S three times on the gate, Enter to leave. The night files hold the right answers and the discuss note, and the follow-ups were written.
- **(a) 1440, with one question left on N:** broke. The gate cannot be reached (V1).
- **(b) from the support Report:** reached the end. Start answering, then Enter and 1, S, Enter lands back on the Report showing "Waiting for an agent".
- **(c) mistakes:** mostly held. Letters, numbers and plain Enter typed in the note stay in the note. Esc leaves the note. Enter on a discuss with an empty note shows the error and puts the cursor in the note. With the save slowed by 2.5 s, a second S and an Enter during the save did nothing (1 POST). With the explainer open, S, 1 and Enter do nothing, arrows move its steps, and Esc closes only the explainer with focus back on `?`. Two breaks: V2 and V3.
- **390 touch:** reached the end by tapping. No key hint is visible anywhere, including the note hint and the S and Enter on the gate. No sideways scrolling.

## Findings

### V1 Blocking: "Not now" traps the deck in a loop
Journey/step: (a), N on one question, then answer the rest - Width: 1440 (the same logic runs at 390) - Saw: after the last save the deck goes back to the skipped question. From there N goes to the next answered question, and N again comes back. Six N presses bounced between "Close tickets…" and "Which chat widget?" and stayed at 6/7. The gate is reachable only by answering the skipped question, unless it happens to be last in order. - Expected: N on the last open question leads to "One step left", where the gate lists it as "not answered: the next agent asks again". - Screenshot: `a-08-after-last.png`, `a-09-gate.png` - Fix: `advance()` has not changed on this branch, but this task's journey runs into it. In `advance()`, count the questions passed with N in this deck as handled for navigation, and go to the gate when nothing open is ahead.

### V2 Blocking: Enter ignores the focused control in the deck
Journey/step: (c), Tab onto "Not now", then Enter - Width: 1440 - Saw: the question was saved with the recommended answer (1/7 became 2/7), not skipped. The same handler catches Enter on a focused option, "use it", "+ add a note" and the Close button. - Expected: Enter presses the button that has the focus. - Screenshot: `c-08-tab-on-not-now.png` - Fix: give the deck the same `ownButton` guard the gate already has.

### V3 Blocking: D does not put the cursor in the note when the note is already open
Journey/step: (c), D, Esc, 2, D again, then type "not sure" - Width: 1440 - Saw: D selected discuss but the note did not get the focus. The "n" in the typed text fired Not now and the deck jumped to another question. The discuss draft was left without a note. - Expected: D always puts the cursor in the note. - Screenshot: `c-04-d-again.png`, `c-09-d-again-typed.png` - Fix: in the D handler, focus `noteRef` directly (after render) instead of relying on `autoFocus`.

### V4 Note: pressing Esc twice throws away a typed note
Esc leaves the note, and a second Esc closes the deck. On reopening, the draft is gone: the note is empty and the recommended answer is selected again. Nothing warns first. Screenshot: `c-05-after-second-esc.png`, `c-06-reopened.png`.

### V5 Note: focus leaves the deck
Tab moves into the page behind the overlay: focus landed on the hidden "legacy 23 Sept" button. After Ctrl+Enter, or Esc from the note, the focus is on the page body. After Esc closes the deck, focus does not return to Start answering: it took 9 Tabs to get back to it instead of 3.

### V6 Nit: the Save button's key hint is wrong while typing a note
With the cursor in the note, the Save button still shows `Enter`, but Enter makes a new line. The hint under the note correctly says Ctrl+Enter. Screenshot: `a-05-q3-discuss.png`.

### V7 Nit: question order is not stable
The same data opened with payments first in one run and support first in another.

## Console
Clean in every run: no errors, no failed requests, no responses of 400 or above.

## Verdict: FINDINGS
V1 to V3 are blocking. The rest (keeping the recommended answer, number keys, D on a fresh question, Ctrl+Enter, S on the gate, Enter to leave, the explainer, and the phone) works as briefed. The Viewer on 4911 is stopped.
