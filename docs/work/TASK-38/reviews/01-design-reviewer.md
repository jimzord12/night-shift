# Design review round 1: TASK-38

Images inspected:
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\next-r1\` (01-nav and 02-next-night at 1440 and 390). The footer says "dev · 00359e3" and the shots are 12 s older than the 26c7f04 commit, so they were taken from the working tree just before that commit. My own shots match them.
- Fresh shots at 26c7f04, taken on scratch copies with synthetic data: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\next-design-r1\`
  - `full-next-{1440,390,360}.png`
  - `full-nav-scrolled-390.png`
  - `empty-next-{1440,390,360}.png`: the empty state, made from `setup.ts … waiting` with mobile's A1 and A2 resolved in the scratch copy.
  - `empty-nav-scrolled-390.png`

Measured: page scrollWidth equals the viewport at 1440, 390 and 360, so there is no sideways page scroll. The tab bar overflows inside itself by 56 px at 390 and 86 px at 360.

First impression: "Two repos, five things queued, one of them waits on me (the amber pill)." The page reads in seconds and fits D12/D24.

## Findings

### D1 Blocking: the night link is centred once it wraps on a narrow phone
Image: `next-design-r1\full-next-360.png`. Where: "From the Night of Thu 24 Sept ›" and "…Sat 26 Sept ›" at the top of each card.
Problem: at 360 px the label wraps to two lines. The `<button>` keeps the browser's default centred text, so the label sits centred and the chevron floats alone at the right edge. Everything else on the card is left-aligned. 360 px is a common Android width.
Fix: add `text-left` to that button (Views.tsx, `NextNightView`). Optionally keep the chevron inline with the last word.

### D2 Note: nothing shows that Trends is off-screen at 390
Image: `next-r1\02-next-night-390.png`, `next-design-r1\full-nav-scrolled-390.png`. Where: the tab bar.
Problem: at 390, "History" ends exactly at the edge, so nothing hints that Trends is further right. At 360 the clipped "Hist…" does give that hint. This matters little because Trends is empty (D24).
Fix: a right-edge fade mask on the nav, or scroll the active tab into view.

### D3 Note (Nit): the Next night count is blue while one queued item is amber
Where: the tab badge. The 5 includes "Needs your answer", which is the owner's turn under D24. A split count, or amber when any item is `waiting`, would be truer to "colour means whose turn".

### D4 Note (Nit): "Left: Screenshot attached: the screenshot"
Two colons in a row are hard to parse. The text is the done_when plus its note, taken straight from the file (followup.ts:30). A label such as "Still to do:" and an en dash between criterion and note would read better. Part of the awkwardness is the synthetic data.

### D5 Note (Nit): the decision looks like a link but is not one
"→ Giscus" uses the same accent colour as the real "From the Night…" link. A non-link colour (white/85, semibold) would stop it inviting a tap.

### D6 Note (Nit): the item ids take the eye first
The A1/A2/A3 chips are the first thing on each row but mean nothing to the owner. Consider smaller or fainter chips, or dropping them.

### D7 Note (Nit): the phone tab labels are small
The labels are 13 px, below the house "+20%" scale. This predates the change, but the new count badge adds to the crowding.

Checked and fine:
- Colours match D24: "Unfinished" and "Your decision" blue, "Needs your answer" amber.
- The empty state is clear at every width, with a dashed card and a moon icon.
- There is no debug text, and the sample is synthetic scratch data, not presented as real.
- The dark band under the first viewport in full-page phone shots comes from the fixed-background capture, not from the page.

## Verdict: FINDINGS
One Blocking finding (D1, a one-class fix). Everything else is a Note.
