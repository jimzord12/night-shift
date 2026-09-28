# Design review round 2: TASK-38

Images inspected:
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\next-r2c\` (01-nav and 02-next-night at 1440, 390 and 360). Written at 10:02:16–22, after f826f58 (10:02:12), the last Viewer commit. The phone nav has no Trends tab, so the shots show f826f58. The "dev · c515d04" footer only reflects when the server started.
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\next-real\` (next-night-real at 1440, 390 and 360, empty state). Written at 10:00, which is before f826f58. The 360 shot still shows Trends in the phone nav. The empty-state content did not change in f826f58, and the r2c set covers the nav, so this counts as a Note, not INCOMPLETE.
- console.txt and log.txt: page scrollWidth equals the viewport at every width. The nav fits without scrolling at 390 and 360 (scroll width equals client width).

First impression: "Five things queued across blog and mobile, and the amber 5 says one waits on me." The page reads at a glance on a phone.

## Findings

### D1 Note: at 360 the night-link arrow drops onto a line of its own
Image: `next-r2c\02-next-night-360.png`. Where: "From the Night of Sat 26 Sept" and "…Thu 24 Sept" at the top of each card.
Problem: the round-1 Blocking is fixed, because the label is now left-aligned. At 360, though, the chevron wraps alone onto a second line. That contradicts "arrow inline", and a stray "›" looks unfinished.
Fix: in `NextNightView` (`web/src/Views.tsx`), wrap the last word of the title and the `<Icon>` in `<span className="whitespace-nowrap">`. The simplest option is to wrap the whole date part, e.g. "Sat 26 Sept ›".

### D2 Note: the real-data shots predate the final nav change
Image: `next-real\next-night-real-360.png`. Where: the tab bar, which still shows Trends.
Problem: the shots are two minutes older than f826f58. The empty state itself is unchanged and looks right: dashed card, moon, readable copy, no sideways scroll.
Fix: re-shoot next-real on f826f58 or later if these shots will be cited as final evidence.

### D3 Note (Nit): "→" is stranded at the end of a line at 390
Image: `next-r2c\02-next-night-390.png`. "Which comment system? →" / "Giscus". Put a no-wrap span around the arrow and the decision.

### D4 Note (Nit): the double colon is still there
"Still to do: Screenshot attached: the per-tag feeds". The new label helps, but the criterion and its note still meet at a colon. An en dash between them would read better. The synthetic data adds to the effect.

### D5 Note (Nit): the phone tab labels are still 13 px
Images: `01-nav-360.png`, `01-nav-390.png`. The labels fit now but read small on a phone. Unchanged from round-1 D7, and it predates this task.

Checked and fine:
- The amber count on Next when an item needs an answer is truer to D24's "colour means whose turn". It stays readable on the active purple pill at 1440.
- "→ Giscus" now reads as plain text in bold white, so it no longer competes with the real link.
- The pills keep D24 colours: "Your decision" and "Unfinished" blue, "Needs your answer" amber.
- Newest follow-up first puts blog (26 Sept) above mobile (24 Sept), which is correct.
- On a phone, four tabs with counts fit at 360 and 390 without clipping. Dropping the empty Trends tab is consistent with D24.
- At 1440 the header shows five tabs with the full label "Next night".
- No debug or placeholder text. The sample data is synthetic scratch data and is not presented as real.

## Verdict: PASS
No Blocking findings remain. D1 is a one-span fix worth doing, but it does not block.
