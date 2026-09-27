# Design review round 3: TASK-24

**Verdict: PASS.** Nothing blocking. Both visible changes read correctly at 1440 and 390, and nothing scrolls sideways.

**Images inspected:**
- The author's 9 shots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\r3\`. Every footer reads `dev · d9c360e`.
- `web/dist` was built at 02:12, after the commit at 02:11, and contains the new "could not be opened" string. So the shots show the current revision.
- My own shots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\design-r3\`:
  - Served at d9c360e on port 4831 (now stopped), on a fresh scratch copy built by setup.ts. The originals were not touched.
  - They are: 01-morning-top-390, 02-unreadable-open-390 (viewport and full page), 03-morning-after-390, 04-billing-head-390.

**First impression:** "3 waiting for you" now matches exactly the three nights that need me: docs, search and crm. The broken night is marked red but not counted as my job. Opening it shows me why, instead of loading forever.

## Findings

### D1 Note: the opened unreadable night has no selected ring, and the banner names the file, not the repository
Images: `r3/05-unreadable-open-1440.png`, `design-r3/02-unreadable-open-390-full.png`
- **Where:** the chip row and the red banner.
- **Problem:** every other opened night gets the violet ring on its chip. The legacy chip gets none; it only dims. The banner says "night 2026-09-23-a is invalid…", which does not say it is the legacy night. The owner can still work it out from the one red chip, so this is not blocking.
- **Fix:** give the chip the selected ring, or start the banner with the repository name. TASK-25 could take either.

### D2 Note: on a phone the "could not be opened" line is below the fold
Image: `design-r3/02-unreadable-open-390-full.png`
- **Where:** the line at y≈1090. The viewport is 844 high.
- **Problem:** the red banner at the top already explains what went wrong, so the owner is not left guessing. The line itself only appears after scrolling past the seven chips. This is the same "opens on the chip list" issue as round 2's D1, which TASK-25 owns.
- **Fix:** none needed now.

### D3 Note: the shot script still does not show the phone report headers
Images: `r3/03-report-billing-390.png`, `r3/04-report-mobile-390.png`
- **Problem:** `scrollIntoViewIfNeeded` does nothing when the `h1` is already partly in view. At 390 the heading sits at y≈740 of 844, so both shots still end mid-header.
- **Fix:** use `scrollIntoView({ block: 'start' })`. My `design-r3/04-billing-head-390.png` shows the header as intended: one Done badge, and the stopped-early line wrapping inside the card.

### D4 Nit: "Not star..." is still truncated in the phone outcome grid
- This was already there before this change. TASK-26 owns it.

## Verified
- **Heading counts:**
  - Before opening anything, the 1440 page reads "3 waiting for you" with the red legacy chip present, and the 390 page reads 3 as well.
  - After the unreadable night is opened and the page reloaded, the heading still reads 3 and the legacy chip is gone from Morning, as designed.
- **The new line:** it is centred, in muted grey, and sits under a red banner that wraps cleanly at 390. Neither it nor the banner overflows (`scrollWidth 390 / clientWidth 390`). The console's single 422 is the expected response for the corrupt file.
- **History:** unchanged from round 2 at both widths. Red "Cannot be read" appears with "1 file problem", and the stopped-early lines wrap.
- **Colours:** still one colour per state, with red used only for the unreadable state and the failed bar.
- The data is synthetic, and there is no debug text.

## Verdict: PASS
