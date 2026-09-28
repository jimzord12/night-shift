# Design review round 1: TASK-32

Images inspected:
- The author's `r2/1440` and `r2/390` sets, 01 to 05. They were taken at 15:28 on build `978a546`, one commit before `a77089e`. The 1440 report shot (03) caught the header mid-fade, so the outcome and stopped-early ? buttons are not visible in it.
- Fresh shots at `a77089e` (the header shows `dev · a77089e`) in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-explainer\design-r1c\` (e1/e2/e3 empty first run at steps 1, 2 and 5; f1 inbox; f2 search and mobile reports; f3 the overlay opened from each report ?; `log.txt`). `design-r1` and `design-r1b` next to it are failed partial runs. My permission to delete them was denied, so they are left there.
- Taken on scratch copies. Both Viewers I started (4851, 4852) are stopped. Port 4812 from your heads-up was never mine.

First impression: the ring and five short steps make the loop clear in well under a minute, and the ? buttons are quiet grey dots. But the ring's circles look tappable and do nothing.

## Findings

### D1 Blocking: the ring's step circles cannot be tapped
Image: `design-r1c/e2-step2-1440.png` - Where: the five circles around "Report" - Problem: each circle is a button with a label ("Step 2: …"), but the centre label `<div className="absolute inset-0 grid place-items-center">` (`Explainer.tsx:256`) covers them. Checked in a real browser: `elementFromPoint` at the Step 2 centre returns that DIV, and a real mouse click leaves the title on "An agent works through the night". A control that looks clickable but does nothing fails Craft, and on a phone the circles are the obvious thing to tap. - Fix: add `pointer-events-none` to that centre div.

### D2 Note: on a phone the "six outcomes" ? opens with the outcomes below the fold
Image: `design-r1c/f3-help-1-390.png` - Where: the overlay at 390x800 - Problem: the step 2 dialog is 1119px tall. The ring, the three-line title and the intro fill the screen, so only the "Done" row of the list is visible and the step arrows are two scrolls down. The ? answers its term only after scrolling. - Fix: a smaller ring below `sm` (for example 180px, r 62), or `text-xl` titles on a phone.

### D3 Note: on a phone the report's ? buttons drift away from their terms
Image: `design-r1c/f2-report-mobile-390.png` - Where: the header card - Problem: the outcome-count ? wraps alone onto its own line under "1 partial", and the stopped-early ? sits at the far right, apart from its wrapped text. They are still findable but read as loose. - Fix: keep each ? in a `whitespace-nowrap` span with the last word or chip before it.

### D4 Note: Nit: mixed quote marks
Image: `design-r1c/e2-step2-1440.png` - Where: step 2 body - Problem: `"Stopped early"` uses straight quotes, while step 5 and the empty state use curly ones. - Fix: use “Stopped early”.

### D5 Note: Nit: the outcome legend is ragged at laptop width
Image: `design-r1c/e2-step2-1440.png` - Where: the six-outcome grid - Problem: "Partial", "Not started" and "Skipped" wrap to two lines beside one-line rows, so the chips sit at uneven heights. - Fix: `items-start` on the rows, or one column.

### D6 Note: Nit: the Answer step's icon is a "?"
Where: the ring's third circle - Problem: it looks like the help ? buttons that open this very view. - Fix: consider a chat or check icon for Answer.

Everything else passes:
- **At a glance and house style:** night sky, moon buttons for prev/next, and the accent and moon colours from the tokens.
- **First run:** the empty Inbox shows the explainer above "No nights yet".
- **Where the ? sits:** Save opens at step 4, and stopped-early and outcomes open at step 2.
- **Phone width and overlay:** no sideways scroll at 390, and no console errors. The overlay now opens at its top on a phone.
- **Honest:** no demo data is shown as real.

## Verdict: FINDINGS
D1 is the one blocking finding, and its fix is one class. D2 is the one I would also fix before the owner opens it on a phone.
