# Design review round 2: TASK-32

**Images inspected:**
- The author's `r3/1440` and `r3/390` sets, 01 to 04 (`C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-explainer\r3\`). They were taken at 16:00, just before commit `42f9163` at 16:01. The header reads `dev · a77089e` because the Viewer was started before that commit. The screens do show the round 1 fixes.
- My own fresh shots at `42f9163` (the Viewer reported `dev · 42f9163`), taken on an empty first run at 390 and 1440: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-explainer\design-r2\step3-390.png` and `step5-390.png`. Findings from them:
  - Real clicks on all five ring circles land on the right step at both widths.
  - `scrollWidth` equals the viewport width (no sideways scroll).
  - No console errors.
- The Viewer I started on port 4887 is stopped.

**First impression:** the loop is still clear at a glance, and the circles now respond to taps. On a phone a step's opening lines now fit in one screen.

## Round 1 dispositions checked
- **D1** (circles could not be tapped): fixed. Every circle takes a real click at both widths.
- **D2** (phone overlay): fixed. At 390 the ring is smaller and titles are `text-xl`. When the stopped-early ? opens the overlay, the Done and Partial rows show without scrolling (`r3/390/03`).
- **D3** (loose ? buttons): fixed. At 390 the stopped-early ? wraps together with "started", and the outcome ? sits right after "2 not started" (`r3/390/02`).
- **D4** (quote marks): fixed. The quotes are curly now.
- **D5** (ragged outcome legend): improved. With `items-start` the chips line up at the top of each row.
- **D6** (Answer's ? icon): changed, but see D3 below.

## Findings

### D1 Note: on a phone the ring's centre label only just fits
Image: `design-r2/step3-390.png`, the ring's centre label. "Answer" and "Report" sit 1 to 2px from the Start and Report circles; I measured the gap between their boxes. Nothing is hidden, but it looks crowded next to the roomy laptop ring. Fix: make the label `text-base sm:text-lg`.

### D2 Note: on a phone the Save button's text wraps to two lines
Image: `r3/390/04-gate-390.png`, the gate card. The ? beside the button takes enough width to break "Save for the next agent" into two lines, and the arrow is left alone on the left. It is still readable and tappable. Fix: tighten the button's horizontal padding below `sm` (`px-4`), or put the ? inside the card's top-right corner.

### D3 Note: Nit: the Answer and Report icons now look alike
Image: `design-r2/step3-390.png`, the ring's 2nd and 3rd circles. The new `note` icon and the Report `file` icon are both page shapes. The labels carry the meaning, but at a glance they read as the same thing twice. Fix: use a speech-bubble or check icon for Answer, if one exists in `Icon`.

### D4 Note: Nit: at 1440 the stopped-early ? sits slightly low
Image: `r3/1440/02-report-stopped-early-1440.png`. The dot sits about 2px below the text's baseline, while the outcome-row ? is centred. Fix: in `StoppedEarly`, align the wrapper `align-text-bottom` or give it a small negative translate.

Everything else still passes:
- **House style:** night sky, moon buttons for previous and next, colours from the tokens.
- **First run:** the explainer sits above "No nights yet".
- **Honest:** no demo data is presented as real.

## Verdict: PASS
No Blocking finding remains. D1 and D2 are cheap phone polish worth doing if the author touches these files again.
