# Visual review round 2: TASK-46

**Verdict: PASS.** All four findings from round 1 are fixed. I found no new Blocking or Material problems. Two Notes remain.

**Setup**
- Viewer: dev · 95ea2e8, from the `night-shift.worktrees/ci` worktree after a fresh `npm run build`, on port 4911.
- Data: a scratch `NIGHT_SHIFT_ROOT` built with `.local/evidence/2026-09-28-decisions/setup.ts`, giving two repositories (shop and blog). I reset the data from a clean copy before the phone-width run, the fresh-Report check and the keyboard run.
- The real install was not touched, and the server is stopped.
- Screenshots: `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-visual-decisions-r2\`. File names start with the width (1440 or 390), then the journey letter.

## Journeys (all walked to the end)

**Morning (journey a), at 1440 and 390**
- The Inbox shows "2 decisions to review" and "1 question, 2 decisions, 1 save · about 3 min". The deck runs the question first, then the two decisions.
- Keeping a decision works. Choosing "I disagree" without a note shows "A disagreement needs a note…"; with a note it saves.
- The save screen shows "You disagree: <note>".
- Screenshots: `*-a-01..06`

**Withdrawing a disagreement (b, c, d), at 1440 and 390**
- Before saving: "See decisions" → change the disagreement to "Fine, keep it" → the save screen shows Fine.
- From the task drawer, opening the decision and disagreeing again brings the earlier note back.
- After saving: withdrawing from the Report's decision row changes the saved row to "withdrawn: you kept the decision", and the open count drops from 2 to 1.
- Screenshots: `*-b-*`, `*-c-*`, `*-d-*`

**Keyboard, at 1440**
- Enter, 2, Enter, 1, Enter, then D, typing a note, Ctrl+Enter, and S on the save screen: all keys work and the night saves.
- Screenshots: `1440-k-*`

**History, Next night and the blog Report, at both widths**
- Screenshots: `*-e-*`, `*-h-01-history-fresh.png`

## Round 1 fixes checked

- **V1 fixed.** The saved row now shows "The agent decided: Put the invoice number in the file name" and "Your note: …", on both shop and blog. Screenshots: `1440-d-01-report-saved.png`, `1440-d-04-saved-section-withdrawn.png`, `390-d-04-saved-section-withdrawn.png`, `1440-e-03-blog-report.png`
- **V2 fixed.** A withdrawn disagreement reads "withdrawn: you kept the decision". On phone width it wraps under the row cleanly.
- **V3 fixed.**
  - On a fresh night, "Review decisions" opens a deck of only the two unreviewed decisions (0 / 2 → 1 / 2 → the save screen). The question is not inside it.
  - "See decisions", the Report's decision rows and the drawer's decision rows all open a decision-only deck (3 / 3).
  - Screenshots: `1440-f-02..04`, `1440-c-02-drawer-to-deck.png`
- **V4 fixed.** The save screen shows the note. The Report's Save row says "Answer and review what you can first". Screenshots: `1440-a-06-after-decisions.png`, `1440-f-01-report-fresh.png`
- **History counts.** The shop row shows "1 open question · 2 decisions to review" at both widths.

## Findings

### V6 Note: the decisions-only deck ends on "One step left" while the question is still unanswered
- Journey/step: fresh Report → Review decisions → keep both.
- Width: 1440.
- Saw: the save screen invites saving, and lists "Which invoice layout? not answered: the next agent asks again".
- Expected: this is honest, so it is not a failure. But the owner came to review decisions and is nudged to save with a question open.
- Screenshot: `1440-f-04-review-deck-end.png`
- Fix: optional. When the night still has open questions, offer "Answer the question" beside Save.

### V7 Nit: a withdrawn row still shows "Your note: …" at full brightness
- Journey/step: after withdrawing, Report → Saved for the next agent, row A2.
- Width: both.
- Screenshot: `1440-d-04-saved-section-withdrawn.png`
- Fix: dim the note on a withdrawn row, or hide it.

**Pre-existing, not from this task**
- The History status pill says "New" for blog while its Report says "Waiting for an agent" (unread takes priority over the step).
- On a phone, the only way to move between cards is the 8 px progress bars.

## Console

Clean. No console errors or warnings, page errors, failed requests or 4xx/5xx responses in any run, and the server log shows no errors.

## Verdict: PASS
