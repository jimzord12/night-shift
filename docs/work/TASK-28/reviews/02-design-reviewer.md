# Design review round 2: TASK-28

Images inspected:
- The author's shots in `.local/evidence/2026-09-28-save-gate/r5/`: `k1-gate.png`, `k2-after-save.png`, `k3-after-second-enter.png`, `lock-390.png`.
- My own shots at e947ab9 (fresh build, two fresh setup.ts samples in scratch roots, served on ports 4830 and 4831, with hold.ts and hold2.ts running), in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-design-gate-r2\`:
  - `a-*`: the clean gate and "All clear", at 390 and 1440.
  - `b-*`: the lock and "Answers kept", at 390 and 1440.
  - `c-report-*-360.png` and `d-report-*-390*.png`: the report's Save.
- The servers and hold processes are stopped.

First impression: the round-1 blocker is fixed. The locked question now looks locked at a glance (lock box, dimmed Substack, lock on the chosen option). The gate and the confirmation both say "nothing runs yet". One layout slip is left on the report's confirmation.

## Findings

### D1 Blocking: phrase text runs into its Copy button in the report's confirmation
Image: `d-report-saved-390-view.png` and `c-report-saved-360.png`. Where: the phrase boxes inside "What needs you" after pressing the report's Save.
Problem: the D4 fix (`nowrap` on the phrases) plus the extra padding of the report's card leaves the phrase column 205px wide at 390 and 175px at 360. "work on the follow-up" needs 233px, so it overlaps "Copy" at both widths, and at 360 "start night shift" touches it too. This fails criterion 3 (overflowing text) at phone width. The deck's own confirmation fits at 390, but only just (`b-kept-390-bottom.png`: about 8px spare).
Fix: let the Copy button sit below the phrase when space is short (flex-wrap), or stack the phrases in one column and drop the nested card padding on narrow screens. Keep `nowrap` on the phrase itself.

### D2 Note: the confirmation keeps the gate's scroll position
Image: `b-kept-390.png`. If the owner scrolls down on the gate (to read the "Still running" lines) and then presses Save, the new screen opens mid-page with the "Answers kept" heading cut off. Nit: scroll the deck to the top when the gate changes state.

### D3 Note: three date styles on one screen
Image: `b-gate-390-bottom.png`, `b-lock-390.png`. The same screens show "Night of Sun 27 Sept", "crm (28 Sept)" and "the night of Mon 28 Sept". Nit: pick one short form for the inline mentions.

### D4 Note: "0 questions" on the report's save row
Image: `c-report-search-360.png`. It reads "1 unfinished task and 0 questions. Nothing runs until you start an agent." Nit: drop the part that counts zero.

### D5 Note: card inside a card on the report
Image: `c-report-saved-360.png`. The green confirmation sits inside the "What needs you" card, which costs about 20px of width on a phone (this is part of the cause of D1). Nit: let the confirmation replace the card instead of nesting in it.

Checked and fine:
- The lock box wraps into a normal rounded box at 390, and its sentence uses the house date.
- The unchosen options are dimmed and the chosen one carries a lock icon, at both widths.
- The gate's shorter lead puts the primary button inside the first 390×800 viewport.
- The "All clear" subtitle carries the fact: "Saved. Nothing runs until you start an agent."
- "Answers kept" with a clock icon is honest when crm is still running, and the "An agent is working on blog" line is plain.
- The folder has its own Copy button, and the phrases no longer break mid-word inside the deck.
- There is no sideways scrolling (scrollWidth equals the viewport at 360, 390 and 1440), and the house style fits.
- The long path in these shots comes from the scratch location, not the product.

## Verdict: FINDINGS
One Blocking finding (D1: phrase text overlapping Copy in the report's confirmation at 390 and 360). D2 to D5 are Notes.
