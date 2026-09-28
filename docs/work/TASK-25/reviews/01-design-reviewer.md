# Design review round 1: TASK-25 / TASK-26 (Inbox and Night Report page)

**Images inspected:**
- All 18 PNGs and log.txt in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\inbox-r2\`. They show bce8cec plus the 25c200d web changes; `web/dist` was built at 10:41, after 25c200d at 10:40.
- r4 (v13), for comparison.
- My own shots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-design-review-r1\`, taken at 25c200d on scratch copies:
  - 10: All caught up
  - 11: Inbox at 360
  - 12: the deck opened from Start my morning
  - 13/14: the drawer compare, scrolled
  - log.txt

**First impression:** at 1440 this is what I asked for. Three numbers, one big button and big cards tell me in five seconds where to go. On a small phone, though, the cards run off the screen, and on the report the item rows turn into one word per line.

## Findings

### D1 Blocking: Inbox night cards overflow at 360 px (sideways scroll)
- **Image:** `inbox-r2\01-inbox-360.png` (the capture is 380 wide) and `design-review-r1\11-inbox-viewport-360.png`.
- **Where:** every night card.
- **Problem:** log.txt reports `[360] inbox: scrollWidth=380`. In my run, all 6 `article` elements end at x=380, and the Running badge touches the screen edge. The likely cause is the `whitespace-nowrap` added to the card button in 25c200d: "Save for the next agent" plus the card padding no longer fits in 360. The stats row and the slim strip stay inside, so the page shifts sideways.
- **Fix:** let the button wrap or shrink below about 380 (drop the nowrap, or `max-w-full` with wrapping), or give the grid item `min-w-0`. Check that scrollWidth equals 360.

### D2 Blocking: report item rows squeeze titles to one word per line, and overlap at 360
- **Image:** `02-report-blog-360.png` and `-390.png` ("Saved for the next agent" section), and `03-report-mobile-360.png`.
- **Problem:** the new kind pill (`shrink-0 whitespace-nowrap`) takes most of the row. At 360, the A2 title "Choose" runs underneath the "Needs your answer" pill (overlapping text). A1 and A2 break one word per line at both phone widths.
- **Fix:** at phone width, put the pill on its own line under the title, as the Inbox cards and Next night already do (`flex-wrap`, or a column layout below `sm`).

### D3 Note: "What happened" rows wrap badly at phone width
- **Image:** `02-report-blog-360.png`.
- **Problem:** T1 and T2 titles wrap to one or two words per line next to the ?Q1 pill, and "Blocked · 0 of 2 checks met" breaks mid-phrase. This is readable but ugly; the same fix as D2 would help.

### D4 Note: metrics row shows placeholders
- **Image:** every report header and History.
- **Problem:** "unknown · unknown · 0 sub-agents" is shown twice per night. This was already there in v13, but D24 says counts show only non-zero values. Nit: hide unknown cost and duration and zero sub-agents.

### D5 Note: the metric boxes are tight at 360
- **Image:** `11-inbox-viewport-360.png`.
- **Problem:** "questions" touches the tile's right edge.
- **Nit:** shrink the label size at phone width, or stack the three numbers as rows.

### D6 Note: Start my morning is a giant oval on phones
- **Image:** `01-inbox-390.png`.
- **Problem:** the fully rounded button wraps to three lines and becomes a lozenge about 180 px tall.
- **Nit:** at phone width, put the count on a smaller second line, or use a smaller radius.

### D7 Note: minor points
- On phones, the badge is on the right for Running/New but below the date for Needs answers/Ready to save. That is inconsistent, but acceptable.
- The docs summary is truncated mid-word ("choice o…").
- In the 390 compare, the "before" label covers the screenshot's title.

## Verified and fine
- **All caught up:** clear, numbers greyed at 0, the Waiting row still visible.
- **Report with nothing needing the owner:** "Nothing: no question was asked…", a slim block.
- **Deck from Start my morning:** house style, recommendation preselected, moon buttons.
- **Drawer compare:** it fits inside the drawer: 748x600 at 1440 and 331x414 at 390, fully visible once scrolled.
- **Pages:** Next night and History have no overflow, and there is a way back with a real URL.
- **Style:** no borrowed style, no debug text.

## Verdict: FINDINGS
D1 and D2 are Blocking. Both are phone-width layout regressions with small CSS fixes. Re-shoot at 360 and 390 afterwards.
