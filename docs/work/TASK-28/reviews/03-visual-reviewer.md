# Visual review round 3: TASK-28

Viewer: `dev · ead14d7` for journeys 1-3. While I was reviewing, 3901b95 landed and `web/dist` was rebuilt, so journeys 4-5 ran on `dev · 3901b95`. That diff only changes one gate sentence, puts focus back after a failed Save, and adds an error-row guard on the report. It does not touch what journeys 1-3 walk.

Every run used a fresh `setup.ts` scratch sample under my scratchpad, on ports 4931-4940. For journey 4, `hold.ts` (blog A1) and `hold2.ts` (crm) were running. All Viewers and holds are stopped.

Journeys (1440 and 390, plus 360 for the phrase):
1. Inbox → Start my morning → Enter ×2 → gate → Enter saves → All clear → all three Copy buttons (clipboard correct) → Back to the Inbox: walked to the end. The Inbox updated without a reload (Next night 5 → 6).
2. Report → Start answering → gate → Enter: walked. blog gives "All clear / Nothing new to save", and Enter closes it. docs: Enter saves, the next Enter closes, and the Report shows it saved.
3. The report's own Save → confirmation → Copy → reload: walked. After the reload it shows "Waiting for an agent".
4. Running nights: walked. The locked question has disabled options, and the key 2 is ignored. Enter moves on to the gate. After Enter saves, the gate says "Answers kept"; Enter does not leave; "Esc closes" shows at 1440 (hidden at 390) and Esc closes. Two findings below.
5. The phrase and Copy at 360 and 390, on the gate and the report: fixed. "work on the follow-up" wraps to two lines, and the overlap with Copy/Copied is 0 px everywhere measured. No sideways scroll.

## Findings

### V1 Blocking: a question a running night took on before it was answered still reads as the owner's turn, and shows the recommendation as a locked answer
Journey 4 · Width 1440 and 390.

Saw:
- The Inbox says "1 question for you · Start my morning", and the blog card says "Needs answers · Answer 1 question".
- The Report says "1 question waiting for you… your answer still reaches the next agent · Start answering".
- Opening it shows "Locked: the night of Mon 28 Sept has taken this on", with **Buttondown ticked and a lock icon**. On disk, `Q2.answer` is `null`: that tick is only the recommendation, pre-selected as the draft.

Expected: a locked, unanswered question is not counted as waiting for the owner, and no option looks chosen.

The trigger is realistic: a night lists an unanswered question in `skipped_follow_ups`, and the owner looks while that night runs.

Screenshots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-gate-r3\`:
- `j4c\01-inbox-390.png`
- `j4b\01-blog-report-1440.png`
- `j4b\02-locked-390.png`
- `j4b\02-locked-1440.png`

Fix: exclude questions locked by `takenBy` from the Inbox, card and Report counts (or word those rows as "locked until … ends"). On a locked question, render the draft only when `answer !== null`.

### V2 Blocking: "Back to the Inbox" / "Not now, back to the Inbox" returns to the Night Report
Journey 2 · Width 390 (and 1440 by Enter).

Saw: I opened the deck from the docs Report and clicked "Not now, back to the Inbox". The deck closed, but the URL stayed `#/night/docs/2026-09-27-a`, on the Report.

Expected: the label matches where it goes.

Screenshots: `j2click\01-gate-390.png`, `j2click\02-after-not-now-390.png`.

Fix: when the deck is opened from a report, label the button "Back to the report" / "Not now". Or navigate to `#/` on close.

### V3 Note: the deck skips locked questions but counts them
Journey 4. Start my morning says "3 questions". The deck shows 1/3 and 2/3, then goes straight to the gate at 3/3; the locked one is only reachable through the progress bar. The gate line explains it. This will likely go away with V1.

### V4 Nit
- At 390 the gate's "Save for the next agent" wraps to two lines, with the icon floating on the left (`j1\03-gate-390.png`).
- The phrase uses U+2011 hyphens. Copy puts a normal "-" on the clipboard (checked), but text selected by hand keeps U+2011.

## Console
Clean in every run: no console errors, page errors, failed requests or 4xx/5xx. The two `ERROR` lines in `j2\log-*.txt` are my script's selector timeouts on the report's "Save" button; I re-walked that step in `j3`.

## Verdict: FINDINGS
Two Blocking findings: V1 (a locked, unanswered question shown as the owner's turn with a fake chosen answer) and V2 (the button label does not match where it goes). Round 2's V1 (the phrase overlapping Copy) and V2 (Enter from the Report) are fixed.

Evidence: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-gate-r3\` (the `j1`-`j5` folders, `j4b`, `j4c`, `j2click`; videos in `*\video\`; `log-<width>.txt` in each).
