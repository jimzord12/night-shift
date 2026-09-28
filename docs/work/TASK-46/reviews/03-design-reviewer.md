# Design review round 3: TASK-46

Images inspected: all 12 PNGs in C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-decisions\r2\ (1440: 01 to 07; 390: 01 to 05). They were written at 22:54:30, 16 s after head bdd05d5 was committed at 22:54:14. The build label reads `dev · bdd05d5`, so round 2's D3 is fixed. log.txt: no errors, and scrollWidth equals the viewport width at both widths. I reviewed the diff `95ea2e8..bdd05d5 -- web/` against the code (3 files, 4 lines).

First impression: the Inbox tells me at once that I owe 1 answer and 2 reviews. On a decision card I choose between two options, and I type a note only when I disagree.

## Round 2 follow-ups
- Card note (the new change): fixed. 1440-04 and 390-04 show "Fine, keep it" selected with no "+ add a note" link. With "I disagree" selected, the note box still appears (1440-05, 390-05). A locked card still shows its saved note.
- Round 2 D1 (Save row starting in lower case): fixed in code (Report.tsx:256). It now reads "Review what you can first" when only decisions are open, and "Answer and review…" when both are. The shots show only the "Answer and review" case (1440-02, 390-02), and that reads correctly.
- Round 2 D2 (Next night line had no label): fixed. 1440-07 reads "The agent decided: Show the sign-up form at the end of each post", then "Your note: …". This now matches the Report's "Saved for the next agent" row (1440-06).
- Round 2 D3 (build label on the evidence): fixed (see above).

## Findings

### D1 Note: two changed states are not in the shots
Image: none. Where: Report.tsx:118 (the note on a withdrawn saved row is dimmed to `text-white/40`) and Report.tsx:256 (the Save row when only decisions are open). Problem: both are visible changes in this round, but no screenshot shows them. I checked them in code only. Both are small, and the dimmed note follows the same pattern as the rest of the withdrawn row, so this does not block. Fix: none needed now. Next time, add a shot of each state to shots.mjs.

### D2 Note: Nit: the "New" status pill on the Inbox cards
Image: 1440-01-inbox.png compared with 390-01-inbox.png. Where: the shop and blog cards. Problem: the 1440 shot shows "New · Read the report". The 390 shot, taken after the reports were opened, shows "Needs answers · Answer 1 · review 2" for shop, but blog still says "New". This behaviour predates the change and was already accepted in round 1 (D-note) and noted by the visual reviewer in round 2. I mention it only so it is not lost. Fix: none in this task.

What holds: the cards still follow D12. The blue "A decision the agent took for you" label, moon-shaped Not now and next buttons, and the dashed "I disagree" option that turns amber keep the game feel. The phone layouts wrap cleanly: no count is split from its noun, and there is no sideways scroll. The numbers agree everywhere: 2 on the Inbox tile, "2 decisions to review / 1 of 3 reviewed", "2 to review", and the T1 pill. The sample data (shop, blog, pdfkit) is plainly synthetic. As the owner settled, the decision cards come after the questions.

## Verdict: PASS
There are no Blocking or Material findings. D1 and D2 are notes only.
