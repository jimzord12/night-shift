# Design review round 3: TASK-28

**Verdict: PASS.** Round 2's one Blocking finding (D1) is fixed. Nothing new is Blocking.

Images inspected:
- The author's shots at 360: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-save-gate\r6\360\01-gate-360.png`, `02-saved-360.png`, `03-copied-360.png`. They were written at 14:56, just before the ead14d7 commit at 14:57.
- My own shots at ead14d7, in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-design-gate-r3\`. I rebuilt `web/dist` first. The data was three fresh `setup.ts` scratch roots, served on ports 4861-4863.
  - `g390\` and `g1440\`: the gate, the "All clear" confirmation, and the phrase after Copy was pressed.
  - `rep\`: the Night Report for search. `r0-inbox-390`, `r1-report-*` and `r2-saverow-*` are before Save; `r3-saved-*` is the confirmation, at 390 and 360.
  - `lock390\lock-390.png` and `lock1440\lock-1440.png`: a question locked while `hold.ts` kept a night running on blog item `2026-09-26-a/A1`.
- The hold process and all three Viewers are stopped.

First impression: at the end of the deck I see one question: save this for the next agent. One big button does it. Afterwards the screen says plainly that nothing runs until I start an agent, and gives me the words to say. A locked answer reads as locked straight away.

## Findings

### D1 Note: the round-2 blocker is fixed
Images: `rep\r3-saved-360.png`, `rep\r3-saved-390.png`.
- "work on the follow-up" now breaks between words and keeps "follow-up" whole. "start night shift" fits on one line. Neither touches Copy at 360 or 390.
- Measured: the phrase column ends at 251 and Copy starts at 265 at 360 (281 and 295 at 390).
- The green confirmation now replaces the "What needs you" card instead of sitting inside it. That also settles round 2's D5.

### D2 Note: round 2's D2 and D4 are fixed
- D4: the save row reads "1 unfinished task. Nothing runs until you start an agent." (`rep\r2-saverow-360.png`). The "0 questions" is gone.
- D2 (the new screen opening mid-page instead of at the top) is fixed in the code: `Gate.tsx` scrolls back to the top when the heading changes. In my walks the confirmation opened at the top (`g390\02-saved-390.png`).

### D3 Note: the inline dates are more consistent
The gate now writes "blog (night of Sat 26 Sept)" for named nights. The lock box still says "the night of Mon 28 Sept", which matches. Round 2's D3 is deferred to TASK-40 and has not got worse.

### D4 Note: the save button is a little tall on phones
Images: `g390\01-gate-390.png`, `r6\360\01-gate-360.png`. Nit: at phone width "Save for the next agent" wraps onto two lines, which makes the button about 70px tall with the small arrow floating to its left. It still reads fine. A shorter label on narrow screens, or slightly smaller text, would keep it on one line.

### D5 Note: the scratch folder path dominates the confirmation
Images: `g390\02-saved-390.png`, `rep\r3-saved-360.png`. The long folder path fills six to nine lines. It comes from where the scratch data lives, not from the product; a real repository path will be much shorter. No action.

## Checked and fine
- No sideways scrolling: page width equals screen width at 360, 390 and 1440.
- The primary action is visible without scrolling at 390×800. The gate subtitle says "Nothing runs until you start one."
- Copy turns to "Copied", and the clipboard held "start night shift".
- The lock box wraps cleanly at 390. Substack is dimmed and the chosen option carries a lock icon. The wording is "has taken this on".
- The confetti falls away and does not cover the text in the settled shot at 1440.
- Nothing presents demo data as real. The colours, the pill buttons and the night sky match D12.

## Verdict: PASS
