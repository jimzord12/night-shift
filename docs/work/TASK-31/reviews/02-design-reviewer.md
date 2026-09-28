# Design review round 2: TASK-31

Images inspected:
- The author's shots at 76d9cb7 (the header reads `dev · 76d9cb7`; taken 16:02:57 to 16:03:05, after the 16:02:50 commit): `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-estimate\r2\inbox-{320,390,768,1024,1440}.png`
- My fresh shots at 6d317ec (the same web code; that commit only adds backlog files), taken on a scratch copy built with setup.ts and served on port 4937. I have stopped that Viewer. The shots are `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-estimate-design-r2\inbox-640.png`, `inbox-1000.png`, `inbox-1023.png` and `loading-320.png`.
- I also measured the button at 13 widths from 320 to 1440 px.

First impression: at every width I see "Start my morning", then 2 questions in 2 repositories, 1 save, about 3 minutes. It reads as one clear call to act.

## Findings

### D1 (round 1) resolved: the title no longer wraps
Image: `r2\inbox-768.png`, plus my `inbox-640.png`, `inbox-1000.png` and `inbox-1023.png`.
- **Measured:** the title span is 40 px tall (one line) at every width I measured: 320, 360, 390, 500, 640, 700, 768, 900, 1000, 1023, 1024, 1100 and 1440.
- **Layout:** below 1024 px the button stacks, with "about 3 min" on its own line. From 1024 px up it is one row with a middle dot. No width scrolls sideways (scrollWidth equals the viewport everywhere).
- **Round-1 nits:** D2 (the dangling dot) and D3 (the title wrapping at 320 px) are fixed too.

### D2 Note: Nit, the loading label overflows the button padding at 320 to about 380 px
Image: `...\2026-09-28-estimate-design-r2\loading-320.png`, the button title while it loads.
- **Problem:** `whitespace-nowrap` now also applies to "Getting the questions…". That label is 281 px wide, but the button's content box is only 233 px at 320 and 272 px at 360. At 320 px the text therefore runs from one border to the other.
- **Why it is not Blocking:** nothing is clipped, and the state lasts only while the questions load.
- **Fix:** apply `whitespace-nowrap` to the "Start my morning" label only, or to both labels only from `sm:` up.

### D3 Note: rubric checks that passed
- **Does its job:** the action and its cost are visible first at phone, tablet and laptop widths.
- **House style:** the violet button (`cta`), the moon-yellow sparkle and the estimate at white/80 are unchanged.
- **Craft:** the ready state is centred and aligned at all widths, with no leftover debug text. The `dev · <sha>` label in the header is the existing version label, not debug output.
- **States:** the loading state is dimmed and disabled, and it already shows the estimate.
- **Honest:** "about" marks the time as an estimate, and "2 questions" matches the stat tile.

### D4 Note: Nit, the 640-1023 px button is tall
Image: `inbox-1000.png`.
- **Problem:** the stacked button is 175 px tall on a wide window, so it dominates the top of the screen. It is acceptable and consistent with the phone layout.
- **Fix:** none needed. It is the owner's call whether to try `md:` instead of `lg:` for the row layout later.

## Verdict: PASS
No Blocking findings remain. D2 is a one-class nit, worth doing if the author touches this button again.
