# Visual review round 4: TASK-28

Viewer: `dev · f02fe39`, on ports 4961-4967. HEAD moved from 76b46c8 to f02fe39 during the review. f02fe39 only changes the Report's sub-line (now "1 held by a running night") and a test.

Data: a fresh `setup.ts` scratch sample for every run, in my scratchpad as `v4-*`. For journey 4, `hold.ts` (blog `2026-09-26-a/A1`) and `hold2.ts` (crm) were running. All Viewers and holds are stopped; I checked that no node process is left.

Journeys, each walked at 1440 and 390:
1. **Inbox → Start my morning → gate → save → back:** walked to the end. The deck ran 0/2 → 1/2 → "One step left", and the first Save was focused. Enter saved and showed "All clear". "Back to the Inbox" landed on the Inbox (`#/`), which showed 0 questions without a reload.
2. **Report → deck → gate → close:** walked to the end.
   - docs: the gate offers "Not now, back to the report", and clicking it stays on `#/night/docs/2026-09-27-a`. I reopened the deck and pressed Enter, which saved. "Back to the report" returned to the Report, which shows "Every question answered" and the saved A1.
   - blog: the gate shows "All clear / Nothing new to save here". Enter closes it, and the page stays on the blog Report.
3. **Running nights, then Inbox, card, Report, deck:** walked to the end.
   - Inbox: "2 questions for you" (docs, plus the question from crm's running night). The 26 Sept blog night now sits in the strip, not as a Needs-answers card.
   - Blog Report: "Nothing waiting for you · 1 of 2 answered; 1 held by a running night". All three items show "Taken by a running night".
   - Deck: Q1 shows the owner's saved Giscus, locked. Q2 (Buttondown) is locked with **no option ticked**: both options are dimmed and only the recommendation's sparkle marks one. `aria-pressed` and checked count 0.
   - Gate: "All clear" with "A running night has taken on work from blog…", and "Back to the report" returns there.
   - Start my morning, then Enter: "Answers kept · Still running: crm". Enter does not leave; Esc closes. The Inbox then shows 0 questions.

Round 3 **V1 (Blocking) is fixed**: a held question no longer counts as the owner's turn, and no fake answer shows. **V2 (Blocking) is fixed**: the button's label matches where it goes, from both the Inbox and the Report.

## Findings

### V1 Note: the deck counter says the held question is done
Journey/step: 3, the deck opened from the blog Report. Width: 1440 and 390.
- Saw: the header says "2 / 2" on the first screen, and the progress bar is fully purple. The Report behind it says "1 of 2 answered".
- Expected: the counter agrees with the Report. For example "1 / 2", or a lock mark on the held question's segment.
- Screenshot: `j4-1440\05-blog-deck-0.png`
- Fix: count only `answer !== null || saved` in `answeredCount`, and render locked segments differently.

### V2 Note: "Waiting for an agent" beside "Taken by a running night"
Journey/step: 3, the Inbox strip and the Report header. Width: 1440 and 390.
- Saw: the 26 Sept blog night is labelled "Waiting for an agent", while every item it carries says "Taken by a running night".
- Expected: a state that says an agent has it, for example "An agent is on it".
- Screenshots: `j4-1440\02-inbox-strip.png`, `j4-1440\03-blog-report.png`
- Fix: this state comes from TASK-24; file it there rather than in this task. Not blocking.

### V3 Nit
- The Report's "3 open" count next to "Saved for the next agent" includes three items that are all taken (`j4-390\04-blog-report-items.png`). The pill already says they are taken.

## Console
Clean in all six runs: no console errors or warnings, no page errors, no failed requests, no 4xx/5xx. There was no sideways scroll at any step (`scrollWidth` equalled the viewport).

## Verdict: PASS
No Blocking finding remains. V1 and V2 are small Notes; V3 is a Nit.

Evidence is in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-gate-r4\`: the folders `j1-1440`, `j1-390`, `j2-1440`, `j2-390`, `j4-1440` and `j4-390`. Each holds numbered PNGs, a `log.txt` with every step and the console, and `video\`. The walk script is `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\v4walk.mjs`.
