# Design review round 4: TASK-28

**Verdict: PASS.** Nothing is Blocking. There are four Notes below.

## Images inspected
- **The author's r7 shots.** All eight are in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-save-gate\r7\`: 01 to 04, each at 390 and 1440.
  - They were written at 15:21 and 15:22. The 76b46c8 commit is from 15:22:35, and the page footer shows "dev · 3901b95". So they come from the working tree just before the commit.
  - 03-locked shows Q1, which was answered (Giscus). It does not show the unanswered locked question the brief describes.
- **My own shots at 76b46c8.** They are in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-design-gate-r4\`: `report-360/1440`, `deck1-*` (Q1), `deck2-*` (Q2, locked and unanswered) and `deck3-*` (the gate).
  - I rebuilt `web/dist` first.
  - The data was a new `setup.ts` scratch root in my scratchpad, with `hold.ts` holding `2026-09-26-a/A1`, served on port 4891. Both processes are stopped.
  - There is no sideways scrolling at 360 or 1440.

## First impression
The report says straight away that nothing is waiting for me. The blue pills say an agent is already on it. In the deck, the locked newsletter question has no option picked, so nothing looks like an answer I didn't give. The final button takes me back where I came from.

## Findings

### D1 Note: the new states read correctly
Images: `deck2-360.png`, `report-360.png`, `r7\04-gate-390.png`.
- On Q2, both options are dimmed and neither is chosen. The recommendation shows only in the "Recommended" card and as a small sparkle.
- The blue "Taken by a running night" pill uses the agent colour. It sits on its own line at phone width, does not clip, and matches the "Waiting for an agent" pill.
- "Back to the report" is a filled accent button, and it returns to the report.

### D2 Note: the header and pills disagree slightly
Image: `report-360.png`, top card and the "Saved for the next agent" header.
- The night's pill says "Waiting for an agent" and the section says "3 open". Yet every item says "Taken by a running night".
- The item pills are the truthful part, so this is not dishonest. It is still a small mixed message.
- Nit: say "3 taken by a running night" when every open item is held. The status pill belongs to the tool, so leave it.

### D3 Note: the subtitle hedges
Images: `report-360.png`, `r7\02-blog-report-1440.png`.
- "the rest are held by a running night or settled" is vague when the screen already knows which applies. At 360 it also wraps onto three lines.
- Nit: name the actual case, for example "the other is held by a running night".
- The ring reading "0" next to "1 of 2 answered" is fine.

### D4 Note: the step counter reads "2 / 2" on the first question
Images: `deck1-360.png` and `r7\03-locked-390.png` (the first screen); `deck2-360.png` (the second).
- The counter says "2 / 2" on both questions, while the white bar moves from the first segment to the second. On the first screen that reads as "last question".
- It looks like a count of questions answered or held, not the position in the deck, and it is probably older than this round.
- Nit: show the position, or drop the number when everything is locked.

## Checked and fine
- The "Nothing waiting for you" card uses the quiet glass button, not the accent one. That is right when nothing needs the owner.
- The lock box wraps cleanly at 360. "Your note" and the recommendation card scroll under the footer rather than being cut off.
- The night-sky style, the pill buttons and the moon-style Next/Done buttons match D12.
- No demo data is presented as real.

## Verdict: PASS
