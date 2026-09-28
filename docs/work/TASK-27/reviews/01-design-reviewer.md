# Design review round 1: TASK-27

**Images inspected:**
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-step-track\r2-1440\` and `r2-390\`: 01 Inbox, 02 report before answering, 03 report after answering. The web/dist they use was built at 16:23:57, from the working tree just before commit d95e58c. That is why the header shows "dev · 3b03475". The code shown is current.
- My own screenshots from d95e58c on a fresh scratch copy made with `setup.ts`, one report per state: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-step-track\design-r1\`
  - At 390: api (Running), shop (Done), crm, search (Ready to save), blog (Needs answers), mobile (Waiting for an agent).
  - At 1440: api only. The 1440 pass stopped after the first report, because opening a New night takes it out of the Inbox.
- I did not open the video. The before and after stills plus log.txt cover the move to Ready to save without a reload.

**First impression:** yes. I can see where the night stands (glowing step plus badge) and what to do next (the Next: line) without reading anything else.

## Findings

### D1 Note: at phone width the report track has no labels
Image: `design-r1\blog-390.png`, `r2-390\02-report-before-390.png`. Where: the step track in the report header. Problem: labels are `hidden sm:block`, so on a phone the track is six unnamed circles. The badge and the Next: line still carry the meaning, so this passes. But the track only says "step 3 of something", and screen readers get no step names because the hidden labels leave the accessibility tree. Fix: at phone width, show only the current step's label under its dot, or a single "Step 3 of 6 · Needs answers" line.

### D2 Note: the 390 "after" shot does not show the track
Image: `r2-390\03-report-after-390.png`. Where: the whole frame. Problem: the page is scrolled past the header, so the phone evidence for acceptance #1 shows the lower cards but not the track at Ready to save. log.txt also records an empty current step at 390, a side effect of D1. Fix: scroll the header into view before the after shot. My `design-r1\search-390.png` shows the Ready to save track correctly at 390.

### D3 Note: skipped steps show as ticked
Image: `design-r1\shop-390.png`. Where: the Done track. Problem: shop asked no question and never waited for an agent, yet "Needs answers", "Ready to save" and "Waiting for an agent" all show green ticks, as if they happened. The code comment says this is intended. Nit: a hollow or dimmed tick for a skipped step would be more honest.

### D4 Note: the same instruction appears twice on the report
Image: `r2-1440\02-report-before-1440.png`. Where: the Next: line and the "What needs you" rows just below. Problem: "answer its question, then save for the next agent" sits right above "1 question waiting" and "Save for the next agent", so the instruction is read twice. Nit: acceptable for now. If the owner finds it wordy, the Next: line could carry a button to the first action instead.

### D5 Note: the card track is very small
Image: `r2-1440\01-inbox-1440.png`. Where: the dot track under each card's date. Problem: the dots are 6px, and future steps are drawn at `#ffffff22`. They read as texture more than a track, but the badge beside them says the state, so the card works. Nit: none needed unless the owner wants the track to carry meaning on its own.

**Checked and fine:**
- House style: the glow in the whose-turn colour (blue Running, amber Needs answers and Ready to save, green Done) fits D12 and D24.
- Waiting for an agent shows the copyable `start night shift` chip, which does not break on the phone (`mobile-390.png`).
- No sideways scroll at 390 (log: scrollWidth=390).
- No clipped text, placeholder or debug content.
- The data is labelled synthetic in the setup.

## Verdict: PASS

No Blocking findings. D1 is the one worth fixing, since the owner mostly reads on a phone. I stopped the Viewer I started on port 4996 and edited nothing.
