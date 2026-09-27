# Design review round 2: TASK-24

**Verdict: PASS.** Nothing blocking is left. The round-1 blocker (D1) is fixed, and the other changes read correctly.

**Images inspected:**
- The author's shots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\r2\` (8 images) and `...\r2-waiting\` (01, 03 at both widths), all taken at 01:58.
  - The web build and the round-2 UI match 2baea99.
  - The footer reads `dev · af507d8` in r2 and `dev · 82f0151` in r2-waiting, because the server started before the commit. That is harmless.
- My own shots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\design-r2\`:
  - Served at 2baea99 on port 4823 (now stopped), on a scratch copy built by setup.ts, with a corrupt `night.json` added to `infra`.
  - They cover the Morning top, History, each report as opened and scrolled to its header, the Questions list, and the deck, at 390 and 1440.

**First impression:** On a phone the stopped-early line now wraps cleanly under the green Done badge, and nothing scrolls sideways. The row heading tells me how many nights are mine. The red "Cannot be read" badge stands out without clashing with anything else.

## Findings

### D1 Note: a picked night on a phone opens on the chip list, not the report
Images: `design-r2/03-report-mobile-as-opened-390.png`, `r2/03-report-billing-390.png`
- **Where:** the first screen after picking a night in History.
- **Problem:** `window.scrollTo(0, 0)` lands on the chip row. With seven chips on a phone, the report header starts at about y=820, so the badge and the stopped-early line sit below the fold. This is better than keeping History's scroll position, but "opens at the top" means the top of the page, not the top of the report. On a laptop it is fine.
- **Fix:** on narrow screens, scroll the report heading into view instead of 0. Or leave it to TASK-25, which replaces the chip row.

### D2 Note: the "N waiting for you" heading sits over a row with non-owner chips
Images: `r2/01-morning-1440.png`, `design-r2/01-morning-top-390.png`
- **Where:** the row heading.
- **Problem:** the count now makes it honest: 3, or 4 when the unreadable night is counted, and it matches the amber, purple and red chips. But the Running, Done and Waiting chips still sit under the heading. The "All caught up" and "In progress" variants in r2-waiting read correctly.
- **Fix:** none needed here. TASK-25's Inbox and settled strip resolve it.

### D3 Note: the author's shot script still misses the phone report headers
Images: `r2/03-*-390.png`, `r2/04-*-390.png`
- **Problem:** these are viewport shots, so they still show only the chip row. I checked the headers myself: `design-r2/04-report-billing-head-390.png` and `04-report-mobile-head-390.png` show one badge each, the grey line wrapping inside the card, and no overflow.
- **Fix:** have shots.mjs scroll to the `h1` before these shots.

### D4 Nit: "Not star..." still truncated in the phone outcome grid
Image: `design-r2/04-report-billing-head-390.png`
- This was already there before this change and belongs to TASK-26, which owns the report layout.

## Verified as fixed or correct
- History at 390 measures `scrollWidth 390 / clientWidth 390`, and so does Morning. The round-1 D1 overflow is gone: the stopped-early line wraps on its own lines in History and in both report headers.
- The unreadable night shows the red "Cannot be read" badge alike on its chip (both widths) and in History (with "1 file problem"). Red appears nowhere else as a state.
- The deck's T2 tag is amber (`design-r2/06-deck-390.png`), matching the owner's-turn colour, and no longer reads as an error.
- The all-waiting sample:
  - It shows "In progress" with the All caught up card and its two buttons, "Open the last night" and "History", with no doubled heading.
  - With a Done night open, it shows "All caught up".
  - Both work at 390.
- Colours still map one state to one colour everywhere: blue Running and Waiting, purple New, amber Needs answers and Ready to save, green tick only on Done.
- No debug text. The data is synthetic sample repositories and makes no claim to be real.

## Verdict: PASS
