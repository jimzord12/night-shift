# Visual review round 1: TASK-46

Viewer: dev · dfb222a (worktree `night-shift.worktrees/ci`, `npm run build`), port 4917, scratch `NIGHT_SHIFT_ROOT` with the decisions set (shop, blog) plus the owner-states set (registered as shop-2, blog-2 and others). I reset the data before each journey. The server is stopped.
Screenshots: `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-visual-decisions\` (prefixes 1440-/390-, then a-, b-, c-, d- for each journey). Scripts are in my scratchpad.

Journeys:
- **(a) Morning, 1440 and 390: walked to the end.**
  - Inbox shows "2 decisions to review" and Start my morning says "3 questions, 2 decisions…". The deck runs 5 cards: questions first, then decisions.
  - Keep and disagree both work. Save without a note shows "A disagreement needs a note…". Saving with a note works.
  - The save screen lists all 3 decisions. Save and leave work.
  - Afterwards the decisions tile is gone and the Report shows "Every decision reviewed; you disagree with 1".
- **(b) From the Report, 1440 and 390: walked to the end.**
  - Review decisions, the task pills ("2 to review") and the drawer's decision list all work. The drawer card shows "reviewed; you can change it".
  - Disagree → fine → disagree: the saved item follows each change (open, then skipped, then open). The earlier note is kept when you disagree again.
  - The Next night page shows the decision and the note.
- **(c) Keyboard only, 1440: walked to the end.** Tab to Start, then `2`+Enter, N, N, Enter keeps, D focuses the note, Ctrl+Enter with no note shows the error, Esc leaves the note, ←/→ keep the draft, Enter saves, S saves on the gate.
- **Extra check:** once the question is answered but decisions are still open, the night stays amber ("Needs answers") and its Inbox card says "Review 2 decisions".

## Findings

### V1 Blocking: a saved disagreement does not say what you disagreed with
Journey/step: (a) end and (b) every change, Report → Saved for the next agent. Width: 1440 and 390.
- Saw: `A2 Add PDF invoices to the checkout · You disagree`. This is just the task title: no decision text, no note. On the shop night the A1 row above it has the same title. It reads as if the owner disagrees with the task. The blog night's A1 has the same problem.
- The follow-up file does carry `question` (the decision) and `owner_note`, and the Next night page shows both.
- Expected: the row names the decision and your note, as the Next night page does.
- Screenshots: `1440-11-a-report-after.png`, `390-11-a-report-after.png`, `1440-09-b-report-to-disagree.png`
- Fix: in `web/src/Report.tsx` around lines 112-114, render `i.question` when `decision_label` is missing, and `i.owner_note`, the way `Views.tsx:60-62` does.

### V2 Note: a withdrawn disagreement shows the raw word "skipped"
Journey/step: (b), after changing disagree → fine. Width: both.
- Saw: `A2 Add PDF invoices to the checkout   skipped`. This reads as if the agent skipped work.
- Expected: wording that is true, such as "withdrawn: you kept the decision", or hide the row.
- Screenshot: `1440-06-b-report-to-fine.png`

### V3 Note: from the Report, the deck puts the question between the decisions and moves on to it
Journey/step: (b) Review decisions, and a decision opened from the drawer.
- Saw: Review decisions opens the order pdfkit decision → layout question → file-name decision. Saving a decision opened from the drawer moves on to the question instead of returning to the Report.
- D31 says decision cards come after the questions.
- Screenshots: `1440-02-b-review-deck.png`, `1440-05-b-after-to-fine.png`
- Fix: from Review decisions, open only the night's decisions (or keep questions first); from the drawer, close after the save.

### V4 Nit: two lines leave the decisions out
- The save screen says "You disagree: the next agent revisits it" but not the note (`1440-07-a-gate.png`).
- On the Report, the Save row says "1 unfinished task and 1 question" while 2 decisions are still unreviewed and never mentions them (`390-01-b-report-fresh.png`).

### V5 Note, older behaviour, not from this task: Enter on the save screen can save the next night by surprise
- After S saves shop, the focus moves to the docs night's Save button. Enter then saves docs with its question unanswered.
- This comes from the save-screen work (TASK-28), not TASK-46; it needs its own task.

Layout at 390: no sideways scrolling on any screen (scrollWidth 390 everywhere). Cards, drawer, save screen and Report reflow cleanly, and the drawer and deck close.

## Console
Clean: no console errors, page errors, failed requests or 4xx/5xx responses in any run.

## Verdict: FINDINGS
One Blocking finding (V1). It is a small rendering fix in the Report's "Saved for the next agent" rows.
