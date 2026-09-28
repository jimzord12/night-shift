# Design review round 2: TASK-46

Images inspected: all 12 PNGs in C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-decisions\r1\. They were taken at 22:42:14–24. The fix commit 07d4736 landed at 22:42:35 and head 95ea2e8 only adds the backlog note. The build label still reads `dev · dfb222a`, so the shots were taken from the uncommitted working tree. They do show the 07d4736 changes (the new D1 wording, the "The agent decided:" line, the decisions-only deck), so I accept them as head. log.txt: no errors, and scrollWidth equals the viewport width at 1440 and at 390.

First impression: I can see straight away that I owe 1 answer and 2 reviews, and the numbers now agree everywhere on the Report.

## Round 1 fixes
- D1 (Blocking): fixed. The row now reads "2 decisions to review / 1 of 3 reviewed". That matches the Inbox tile, the "2 to review" aside and the T1 pill.
- D2: fixed. At 390 the button reads "1 question, 2 decisions, / 1 save / about 3 min"; no count is split from its noun.
- D3: fixed. The Save row now says "Answer and review what you can first".
- D4: fixed on the Report ("The agent decided: … / Your note: …"). Not done on Next night (see D2 below).
- D5: resolved. Opening a deck from "Review decisions" now shows only the 2 decisions ("0 / 2", two segments), so there is no ordering question left.
- D6: fixed. The compass icon is now `size-3.5` and reads distinctly from the blocked icon.
- D7: fixed. The drawer rows no longer repeat the task tag.
- D8: no action, as agreed.

## Findings

### D1 Note: the Save row can start a sentence in lower case
Image: none (this state is not in the shots). Where: C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\web\src\Report.tsx:256. Problem: `[openQ && 'Answer', decisionsOpen(n) && 'review']` produces "…1 unfinished task. review what you can first; nothing runs…" when decisions are open but no questions are. That is the D3 case this fix was meant to cover. Fix: capitalise the first word after the join, e.g. use 'Review' when `openQ` is false.

### D2 Note: Next night still shows the decision line without a label
Image: 1440-07-next-night.png. Where: blog item A1. Problem: under "Add a newsletter sign-up · You disagree" the line "Show the sign-up form at the end of each post" still has no label. The Report now labels the same line "The agent decided:". Fix: add the same prefix in the Next night item.

### D3 Note: Nit: build label on the evidence
Image: every screenshot, top right. Problem: the shots show `dev · dfb222a` although they contain the 07d4736 changes. Fix: next time, take the screenshots after committing so the label matches the revision under review.

What holds: the cards still follow D12. Moon-shaped secondary buttons, the blue "A decision the agent took for you" label, and the dashed "I disagree" option that turns amber keep the game feel. The phone layouts (390-02, 04, 05) wrap cleanly. The "Your note" line in 1440-06 makes the disagreement unmistakable. The data is plainly synthetic.

## Verdict: PASS
No Blocking or Material findings remain. D1 is a one-word fix and worth doing in passing.
