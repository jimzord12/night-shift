# Visual review round 2: TASK-32

Viewer: dev · 42f9163. This is the feat/explainer worktree, and its web/dist was built at 16:00, after the commit. I ran five Viewers:
- 4911: an empty NIGHT_SHIFT_ROOT.
- 4912 and 4913: a fresh owner-states `setup.ts` sample for each width.
- 4914 and 4915: fresh samples for the leak check at each width.

All the data was scratch copies in `scratchpad\vr32r2\`. All five Viewers are stopped (the ports no longer answer).

Journeys:
1. **First run: walked to the end at both widths.** The Inbox shows the explainer, and autoplay moves 1→2 after about 6 s. It holds after a manual step. The arrow buttons and the ArrowRight/ArrowLeft keys move it, and Previous wraps from 1 to 5. **Clicking a ring step now jumps to it**:
   - At 1440, step 2 was reached by click; `elementFromPoint` at the step's centre now returns the step's own icon, no longer the centre label.
   - At 390, tapping steps 4, 2 and 5 each landed on that step's button and moved there.
   - The first 390 walk logged "lands on: undefined" for the ring. That came from my script: the page had scrolled the ring off-screen before the coordinate click. `ring390.mjs` rechecked it with the ring on screen.
2. **Header ?: walked to the end.** It opens at Step 1. The inline explainer behind it does not move on arrows. A click on ring step 4 inside the dialog works. Esc closes it, and focus returns to the header ?.
3. **Night Report: walked to the end.** The Save ? opens Step 4. The outcomes ? and the stopped-early ? open Step 2. The top-left backdrop, the bottom-right backdrop and the Close button all close it, and focus returns to the ? that opened it.
4. **Gate: walked to the end.** The ? opens Step 4 over the deck. ArrowRight goes to 5 and ArrowLeft twice goes to 3. Enter on the dialog changes nothing and does not save. Esc closes only the explainer, then Enter on Save saves and Esc closes the deck back to the report.

**Leak check (V2), both widths:**
- 50 Tabs: 0 left the dialog and 0 reached the gate's `[data-gate-save]`. Focus cycles Close > Step 1-5 > Previous > Next > Close.
- 50 Shift+Tabs: 0 left the dialog, cycling in reverse.
- Enter afterwards pressed the focused Next button inside the dialog and saved nothing (saved=0).
- After Esc the trap is removed: Tab reaches the gate's "Not now" normally.
- Enter and Space on the explainer's own buttons still work: Next, a ring step, and Close.

## Findings

### V1 (round 1, Blocking): fixed
You can now click or tap the ring steps at both widths, inline and in the dialog. Screenshots: `1440-03-j1-ring-step2-outcomes.png` (Step 2 selected by click), `390-ring-tap-step5.png`.

### V2 (round 1, Note): fixed
Tab and Shift+Tab stay inside the explainer, and the gate is not saved from behind it. Screenshots: `1440-leak-after-100-tabs.png`, `390-leak-after-100-tabs.png`, `1440-leak-after-esc.png`, `390-leak-after-esc.png`.

### V3 Note: on a phone, Step 2 is shorter but still taller than the screen
Journey/step: J3, outcomes ?. Width: 390.
- Saw: the dialog runs from y 14 to 1041 on an 844-high screen; in round 1 it reached 1134. The smaller ring fits the centre label cleanly. The last outcome rows and the arrows still need a scroll, and scrolling works from the top.
- Screenshot: `390-08-j3-outcomes-help.png`.
- Fix: none needed. Optionally, a one-column legend with tighter row spacing below `sm`.

### V5 (round 1, Nit): fixed
Each ? now sits with its words: the stopped-early ? follows "never started", and the outcomes ? follows "2 not started". Screenshot: `390-09-j3-report-billing.png`.

No sideways scrolling: scrollWidth equals the viewport width on every screen at both widths, and nothing inside the dialogs is off-screen.

## Console
Clean at both widths across the walk, leak, key and ring scripts: no console errors, no page errors, no failed requests, no HTTP 4xx/5xx.

Evidence: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-explainer-r2\`
- 32 walk screenshots
- the leak screenshots, and `390-ring-tap-step5.png`
- `1440-keys-after-close.png`, `1440-focus-tab3.png`, `1440-focus-tab8.png`
- `log-1440.txt`, `log-390.txt`

Scripts: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\vr32r2\` (`walk.mjs`, `leak.mjs`, `ring390.mjs`, `keys.mjs`, `focus.mjs`).

## Verdict: PASS
No Blocking finding remains. V3 is a Note only.
