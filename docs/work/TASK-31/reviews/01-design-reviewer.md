# Design review round 1: TASK-31

Images inspected:
- Author's shots: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-estimate\inbox-1440.png` and `inbox-390.png`. The header on these reads `dev · 12cb9e5`, so the running server was one commit behind. They were taken 2 s before ee9a89f was committed, so the nowrap fix was probably already in the working tree.
- My fresh shots at ee9a89f, taken on a scratch copy of the sample nights with the built `web/dist` served on port 4883: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-estimate-design-r1\inbox-1440.png`, `inbox-1024.png` (a crop), `inbox-768.png`, `inbox-390.png`, `inbox-320.png` and `loading-390.png`. I stopped my Viewer afterwards.

First impression: on phone and laptop I can see at once that the morning is 2 questions and 1 save and takes about 3 minutes. On a mid-width window the big button looks broken.

## Findings

### D1 Blocking: the button title breaks onto two lines from 640 px to about 1000 px
Image: `...\2026-09-28-estimate-design-r1\inbox-768.png`. Where: the Start my morning button.
- **Problem:** from the `sm` breakpoint (640 px) up, the button lays out in a row: sparkle, title, estimate. The longer estimate squeezes the title, so it reads "Start my / morning" on two lines, next to an estimate that also wraps to two lines ("… 1 save · / about 3 min"). The main button on the screen then looks like two ragged columns.
- **Measured:** the title span is 81 px tall (two lines) at 640, 700, 768, 820 and 900 px, and 40 px (one line) at 1024 and 1100 px. That range covers a laptop half-screen window and a tablet in portrait. This change caused it: before, the estimate text was shorter.
- **Fix, either one:** add `whitespace-nowrap` to the title span, or move the row layout from `sm:` to `lg:` (`lg:flex-row lg:py-4 lg:text-base`) so mid widths keep the stacked layout that already looks good on phones.

### D2 Note: Nit, a dangling middle dot on phones
Images: `inbox-390.png` and `inbox-320.png`, the button's second text line.
- **Problem:** the line ends with "1 save ·" and then wraps to "about 3 min", and "in 2 / repositories" also splits across lines.
- **Fix:** on phones, put "about 3 min" on its own line (a block span below `sm`, with the dot hidden there). Alternatively, use `whitespace-nowrap` on "in N repositories".

### D3 Note: Nit, "Start my / morning" also wraps at 320 px
Image: `inbox-320.png`.
- **Problem:** the title wraps even in the stacked layout. It stays centred and readable, so this is acceptable. D1's `whitespace-nowrap` on the title would also fix it, since "Start my morning" at text-lg fits in 320 px minus the padding.

### D4 Note: the loading state is fine
Image: `loading-390.png`. The button shows "Getting the questions…", dimmed and disabled, with the estimate already visible. That is honest and consistent.

### D5 Note: rubric checks that passed
- **House style:** the estimate uses the existing violet button (`cta`) at white/80, with nothing borrowed from another app.
- **Phone width:** no sideways scrolling (scrollWidth equals the viewport at 320, 390, 768 and 1440 px).
- **Honesty:** "about" marks the time as an estimate, and the counts match the stat tiles (2 questions).

## Verdict: FINDINGS
One Blocking finding (D1): the button title wraps between about 640 and 1000 px. A one-class fix should clear it. Please re-shoot at 768 px after the fix.
