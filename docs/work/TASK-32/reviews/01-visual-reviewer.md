# Visual review round 1: TASK-32

Viewer: dev · a77089e (feat/explainer worktree, web/dist as built). I ran it on ports 4811 (an empty NIGHT_SHIFT_ROOT), 4812/4813 (a fresh owner-states `setup.ts` sample per width) and 4814 (a third fresh sample for the leak check). All the data was scratch copies in the session scratchpad, and all four Viewers are stopped. Your note about 4812: yes, that one was mine. I restarted it before the walk, so none of the results below come from that interruption.

Journeys:
1. First run: walked to the end at both widths. The Inbox shows the explainer, autoplay moves 1→2 after about 6 s, and it holds after a manual step. The arrow buttons and the ArrowRight/ArrowLeft keys move it, and Previous wraps. **Clicking the ring's steps does nothing (V1).**
2. Header ?: walked to the end. It opens at Step 1, the inline explainer behind it does not move on arrows, Esc closes it, and focus returns to the header ?.
3. Night Report: walked to the end. The ? beside Save opens Step 4. The ? beside the outcome counts and the ? beside "stopped early" open Step 2. The backdrop (top-left and bottom-right) and the Close button close it, and focus returns to the ? that opened it.
4. Gate: walked to the end. The ? opens Step 4 over the deck. ArrowRight goes to 5 and ArrowLeft twice goes to 3. Enter inside the explainer does nothing, and Esc closes only the explainer, so the gate stays. After that, Enter on Save saves and Esc closes the deck back to the report.

## Findings

### V1 Blocking: the ring's step buttons cannot be clicked
Journey/step: J1 "the ring's steps move it"; also inside the dialog (J2). Width: 1440 and 390.
- Saw: clicking any ring step (Step 2, 4 or 5) leaves the step unchanged. Playwright reports `<div class="absolute inset-0 grid place-items-center text-center">…</div> intercepts pointer events`. That is the centre label in `Loop` (web/src/Explainer.tsx), which covers the whole 260×260 ring and sits above the buttons in the DOM. `elementFromPoint` at a step's centre returns that div.
- Expected: tapping a step jumps to it.
- Screenshots: `1440-03-j1-ring-step2-outcomes.png` (still on Step 3 after clicking Step 2), `log-1440.txt` / `log-390.txt` ("ring step N click lands on: DIV.absolute inset-0 grid…").
- Fix: add `pointer-events-none` to the centre label div.

### V2 Note (high): focus leaves the explainer, and Tab+Enter saves the gate behind it
Journey/step: J2 and J4 with the explainer open. Width: 1440 (the same Tab order at 390).
- Saw: after the explainer's eight controls, Tab moves on to the page behind (Inbox, History…). After 24 Tabs from the gate's ?, focus lands on the deck's `[data-gate-save]` button. Pressing Enter then **writes the follow-up while the explainer is still open**: confetti shows behind it and "Saved for the next agent" appears. The capture handler stops propagation but not the key's default action.
- Expected: keys stay inside the modal.
- Screenshots: `1440-17-j4-tab-leak-focus-behind.png`, `1440-18-j4-saved-behind-explainer.png`.
- Fix: trap Tab inside the dialog (wrap from the last control back to the first), or mark the app root `inert` while the explainer is open.

### V3 Note: on a phone, Step 2 is taller than the screen
Journey/step: J3, outcomes ?. Width: 390.
- Saw: the dialog runs from y 14 to 1134 on an 844-high screen. It scrolls correctly from its top, but the arrows and half of the outcome list sit below the fold.
- Screenshot: `390-08-j3-outcomes-help.png`.
- Fix (optional): shrink the ring on narrow screens.

### V4 Nit: the ring steps have icons but no words
The icons alone (moon, file, ?, arrow, play) do not say which step is which until you select one. Screenshots: `1440-01`, `390-01`.

### V5 Nit: the ? sits on its own line or far from its text at 390
On the billing report, the outcomes ? wraps onto a line by itself under "1 done · 2 not started", and the stopped-early ? floats at the far right, away from its words.
- Screenshot: `390-09-j3-report-billing.png`.

No sideways scrolling anywhere: scrollWidth equals the viewport width on every screen at both widths, and nothing inside the dialogs is off-screen.

## Console
Clean at both widths: no console errors, page errors, failed requests or HTTP 4xx/5xx.

Evidence folder: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-explainer\` (32 walk screenshots, 2 leak screenshots, `log-1440.txt`, `log-390.txt`). Scripts are in the scratchpad at `vr32\walk.mjs` and `vr32\leak.mjs`.

## Verdict: FINDINGS
One Blocking (V1: the ring steps cannot be clicked). V2 is a Note, but I would fix it in the same pass because it can write the follow-up from behind the modal.
