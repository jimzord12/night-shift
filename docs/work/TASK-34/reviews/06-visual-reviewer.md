# Visual review round 6: TASK-34

**Verdict: PASS.** The timing fix holds. I sent D, Esc and the next keys with no pause between them, including one run where the whole sequence went out in a single batch. The cursor never went back into the note, the note held exactly what was typed, and every saved answer matched the screen at the moment of the save. There are no Blocking findings and no new Notes. The console was clean.

**Viewer:** `dev · 767ce4c` on port 4961, built with `npm run build` in `night-shift.worktrees\ci`. It is stopped now.

**Data:**
- A fresh copy of the round-5 set with the registry paths rewritten: `scratchpad\kb34r6\`, reset copy `kb34r6-pristine`. That is 9 questions across 6 nights.
- Scripts are in `scratchpad\r6k\`, where scratchpad is `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad`. I reset the data before every run.

**Screenshots:** `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-keyboard-r6\`

## Journeys (1440)

- **(a) Whole morning by keyboard:** walked to the end (`a-01` to `a-12`).
  - Keys: Tab and Enter on Start my morning, Enter, N, "1" then Enter, D with a typed note and Ctrl+Enter, Enter four times, and N on the last waiting question.
  - The gate named "Which chat widget? not answered". S five times reached All clear, and Enter went back to the Inbox.
  - On disk: `support Q1=b, Q2=null`, `docs a`, `design discuss` with note "Can we talk about cost first?", `payments b / b / a`, `brand b`. A follow-up was written for each of the 5 nights.
  - The deck order differs from round 5 because nights with the same times tie, as noted then.
- **(b) Fast sequences, three ways:**
  - **Pressed one after another with no pauses** (`f6await-*`).
  - **Whole sequence sent in one batch**, in order, with nothing waited for between keys (`g6-*`). This is the hardest case for the timer.
  - For every save I held the save request and captured the screen while it was in flight (`*-saveN.png`).
  - **D, Esc, 1, D, type, Ctrl+Enter (twice):**
    - Saved `discuss` with note "only this text", and `discuss` with note "second note".
    - Nothing else got into the note (no "1", no "d"), and the screen showed the same (`g6-save1`, `g6-save3`).
  - **D, Esc, N (twice):** nothing was sent to the server, the deck moved to the next question, and the file on disk stayed `null`. The deck stayed open, so Esc never closed it.
  - **D, Esc, 2, Enter (twice):** saved `b` ("Three retries over a week", then "Monthly") with an empty note, and option 2 was the checked row on screen (`g6-save2`, `g6-save4`).
  - On disk after the batch run: `support Q1=discuss` with note "only this text", `payments Q1=b, Q2=discuss` with note "second note", `Q3=b`, and `docs` and `design` still `null` (passed with N).
  - A third try used Playwright's own keyboard calls running at the same time. Two saves carried only the first letter of the note ("o" and "s"), because Playwright sent Ctrl+Enter before typing finished. That run did not keep the real key order, so it is not a Viewer fault. Even there, the saved note matched what the screen showed (`f6burst-save1`, `f6burst-save3`).

## Findings

None new. V4, V5, V7, V9 and V13 are unchanged and stay deferred. V14 needs no action. V5 is still visible: the focus falls to the page body after a save.

## Console
Clean in every run: no errors, no warnings, no failed requests and no responses of 400 or above.

## Verdict: PASS
