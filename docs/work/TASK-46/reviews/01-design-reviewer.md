# Design review round 1: TASK-46

Images inspected: all 12 PNGs in C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-decisions\r0\ (the build shows `dev · a070095`, taken 22:24, before dfb222a). Setup and shot scripts were read. The Next line in 1440/390-02-report.png is the old text. I judged the new text from the dfb222a diff instead ("answer its question and review the 2 decisions the agent took for you, then save for the next agent."), and it reads fine.

First impression: I can see straight away that the agent chose things for me and how many are left. The cards feel like part of the same game, and the colours are consistent. One count on the Report is wrong.

## Findings

### D1 Blocking: the "What needs you" row gives the wrong number of decisions
Image: 1440-02-report.png, 390-02-report.png, 1440-03-drawer.png. Where: What needs you, second row. Problem: it says "2 decisions the agent took for you" with "1 of 3 reviewed" underneath, and the section below lists 3. The agent took 3 decisions; 2 are still to review. The owner sees two different numbers on the most important row (criterion 1). The question row avoids this because "waiting for you" makes clear it counts what is left. Fix: in Report.tsx:235, write `${n} decision(s) to review`. That also matches the Inbox tile and the "2 to review" pill.

### D2 Note: "Start my morning" breaks badly at phone width
Image: 390-01-inbox.png. Where: the "Start my morning" button. Problem: the text wraps as "1 question, 2 decisions, 1 / save / about 3 min", so the "1" of "1 save" ends up on the line above "save". The new "2 decisions" part is what pushes it into the wrap. Fix: put a non-breaking space inside each count (`1\u00a0save`), or break before "1 save".

### D3 Note: the Save row does not mention decisions
Image: 1440-02-report.png. Where: the "Save for the next agent" row. Problem: it asks "Answer what you can first" only when questions are open. If a night has decisions to review and no questions, the row says "Nothing runs…" and does not point the owner at the decisions. Fix: when decisions are open, say "Answer and review what you can first".

### D4 Note: a saved disagreement reads as disagreeing with the whole task
Image: 1440-06-blog-report.png. Where: the "Saved for the next agent" row "A1 Add a newsletter sign-up · You disagree". Problem: it looks as if the owner disagrees with the task itself. The Next night page (1440-07) shows the decision on a second line, but that line has no label. Fix: add a line or prefix that names the decision, for example "Agent chose: Show the sign-up form at the end of each post", in both places.

### D5 Note: first card in the deck
Image: 1440-04-card.png. Where: the progress segments. Problem: the deck has 3 cards (1 question and 2 decisions), and the first segment is lit while a decision is on screen. So the decision is card 1 of 3, although D31 says decisions come after the questions. That is fine if opening from "Review decisions" is meant to put the decision first. If not, it is the visual reviewer's to confirm.

### D6 Note: Nit: the compass icon at pill size
Image: 1440-02-report.png. Where: the "2 to review" and "1 decision" pills. Problem: at 12px it reads as a circle with a slash, close to the ⊗ "blocked" icon in the same row. Fix: a size up (`size-3.5`) is enough.

### D7 Note: Nit: repeated task tag in the drawer
Image: 1440-03-drawer.png. Where: the decisions list in T1's drawer. Problem: each row repeats the "T1" tag although the drawer is already T1. The second row also looks highlighted, probably a hover left over from the click. Fix: drop the tag inside the drawer.

### D8 Note: Nit: the Inbox before the report is opened
Image: 1440-01-inbox.png compared with 390-01-inbox.png. Where: the shop card. Problem: before the report is opened, the card shows "New · Read the report", although it holds 1 question and 2 decisions. After opening, it shows "Needs answers · Answer 1 · review 2". This is how the Inbox already behaved before this change, and "Start my morning" covers it, so I am not asking for a fix here.

What works: decisions look clearly different from questions. They have a blue "A decision the agent took for you" label, two fixed answers, and a dashed "I disagree" option that turns amber when chosen. The colours hold on every screen: amber for "Not reviewed" and "to review", blue for "You disagree", green for "Fine". The fourth Inbox number fits the 2×2 grid at 390 without overflow; the log shows scrollWidth equal to the viewport width at both sizes. "Every decision reviewed" with "See decisions" follows the existing "Every question answered" / "Review answers" pattern. The data is plainly synthetic and not shown as real.

## Verdict: FINDINGS
The only blocker is D1, a one-line wording fix in C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\web\src\Report.tsx:235. I also recommend fixing D2 in the same round.
