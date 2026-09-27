# Design review round 4: TASK-24

**Verdict: PASS.** No blocking findings. Both round-3 notes (D1) are fixed and look right at 1440 and 390, and nothing scrolls sideways at 390.

**Images inspected (all at cbca3ee):**
- **Your walk shots:** `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\r4-walk\` (01-legacy-open, 02-docs-after-legacy, 03-after-reload, plus walk.txt).
- **Your usual set:** `...\r4\`, all 9 shots. Every footer reads `dev · cbca3ee`. `web/dist` was built at 02:16:49, the commit was made at 02:17:01, and the shots were taken at 02:17:39 or later, so they show the current revision.
- **My own 390 shots:** `...\2026-09-28-owner-states\design-r4\`:
  - 01-morning-top-390
  - 02-unreadable-open-390 (the screen, plus a full-page version)
  - 03-docs-after-390
  - 04-billing-head-390

  They were taken on a fresh setup.ts scratch copy under the session scratchpad, served on port 4843 (now stopped). No originals were touched.

**First impression:** I tap the red chip. It gets the same violet ring as any opened night, and the banner starts with "legacy:", so I know right away which night is broken. When I pick docs, the banner goes away.

## Findings

### D1 Note: on a phone, the "could not be opened" line is still below the fold (carried from round 3's D2)
Image: `design-r4/02-unreadable-open-390-full.png`
- **Where:** the line sits at y≈1090, and the phone screen is 844 tall.
- **Problem:** none that blocks. The banner at the top already names the repository and the reason, so the owner learns what is wrong without scrolling.
- **Fix:** none now. TASK-25 already owns "opens on the chip list".

### D2 Note: the phone report shots in r4 cut off the Done badge
Images: `r4/03-report-billing-390.png`, `r4/04-report-mobile-390.png`
- **Problem:** as you flagged, `block: 'start'` puts the heading at the very top and cuts off the badge above it.
- **Fix:** `block: 'center'` fits the whole header. My `design-r4/04-billing-head-390.png` shows it complete:
  - the "BILLING" label with a single Done badge;
  - the title wrapping cleanly;
  - the stopped-early line wrapping inside the card.

### D3 Nit: "Not star..." is still truncated in the phone outcome grid
- This was there before this change. TASK-26 owns it.

## Verified
- **Banner:**
  - It starts with "legacy:" at both widths.
  - At 390 it wraps over four lines inside its rounded red card and does not overflow (`scrollWidth 390 / clientWidth 390`).
  - It is gone once docs is opened (my check found 0 banners; walk.txt says `banner=null`).
- **Selected ring:** the legacy chip gets the same violet ring as the other chips when opened, at 1440 and 390. When another night is picked, the ring moves to that chip and legacy goes back to a dimmed red chip.
- **Count and reload:** the heading reads "3 waiting for you" throughout. After a reload the legacy chip leaves Morning, as designed.
- **Unchanged screens:** History and Morning look the same as in round 3 at both widths.
  - Red appears only for "Cannot be read", "1 file problem" and the failed bar.
  - Each state keeps one colour.
- **Honesty:** the data is synthetic, and there is no debug or placeholder text.

## Verdict: PASS
