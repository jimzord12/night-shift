# Design review round 1: TASK-24

**Images inspected:**
- All 8 images in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\r1\` (taken 01:51, from the working tree that became 82f0151; the footer reads `dev · af507d8` because the commit came after the shots) and `r0\02-history-390.png`.
- Fresh shots I took from 82f0151 on a scratch copy made by setup.ts, served on port 4817 (now stopped): `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\design-r1\report-billing-head-390.png`, `report-mobile-head-390.png` (plus two `-top-390` shots).

**First impression:** On a laptop, one badge per night and the colours read right away. No tick sits beside an orange dot, and "Waiting for an agent · 3 days" reads clearly. On a phone, the new grey line runs off the edge of its card.

## Findings

### D1 Blocking: "Stopped early" line overflows its card at phone width
Images: `r1/02-history-390.png` (billing and mobile cards), `design-r1/report-billing-head-390.png`, `design-r1/report-mobile-head-390.png`. Where: the grey "⚠ Stopped early: N tasks never started" line.

Problem:
- The text runs past the card's right border in History and in the report header.
- History at 390 is 406 px wide: the PNG is 406 wide, and a measurement gives `scrollWidth 406 / clientWidth 390`. So the page scrolls sideways. Criteria 3 and 4 fail.
- The r0 phone History has the same 406 width, so the r1 fix for the crushed chip name did not cover this.
- Cause: in `web/src/ui.tsx` `StoppedEarly`, the outer span is `inline-flex`. Its `truncate` child never gets a width limit, so the text stays on one line and pushes out of the card.

Fix: give the outer element `flex max-w-full` (or `max-w-full` plus `min-w-0` inside a flex parent) so the text truncates. Better still, drop `truncate` for the long form so it wraps, since this line is the whole message. Then re-check that History at 390 measures 390 wide.

### D2 Note: phone report shots miss the header
Images: `r1/03-report-billing-390.png`, `r1/04-report-mobile-390.png`. Problem: `shots.mjs` takes these as viewport shots, which keep the scroll position from History. They show only the follow-up and the task cards, not the badge or the stopped-early line that acceptance #1 and #2 depend on. Fix: in shots.mjs, scroll to the `h1` (or take full-page shots) before shooting the report.

### D3 Note: "Waiting for an agent" listed under "WAITING FOR YOU"
Image: `r1/01-morning-*`. Problem: the row heading says it is the owner's turn, yet it now holds a blue agent's-turn badge and a Done night. At a glance these contradict each other. D24 fixes this with the Inbox and the settled strip in TASK-25, so this is not blocking here. Fix, if cheap before TASK-25: a neutral heading such as "Recent nights".

### D4 Note: phone chip hides the stopped-early hint
Image: `r1/01-morning-390.png`, mobile chip. The laptop chip shows "⚠ 1 never started" but the phone chip drops it on purpose (code comment: the report says it). This is acceptable, since the chip keeps room for the name.

### D5 Nit: "Not star..." truncated in the phone outcome grid
Image: `design-r1/report-billing-head-390.png`. This truncation was already there before this change, and the report layout belongs to TASK-26.

Everything else passes: one badge per night everywhere; colours match D24 (blue for Running and Waiting, purple New, amber for Needs answers, Ready to save and blocked, green tick only on Done, red only for failed); the grey line appears only where work was lost; no debug text; the data is clearly synthetic.

## Verdict: FINDINGS
D1 is the only blocking finding.
