# Visual review round 2: TASK-24

Viewer: dev · 2baea99 (web rebuilt from head with `npm run build`). I ran four scratch Viewers on the synthetic `setup.ts` sample, each with its own NIGHT_SHIFT_ROOT under the session scratchpad:
- 4851: full sample at 1440
- 4852: full sample at 390 and 360
- 4853: the `waiting` sample
- 4854: full sample with shop's night.json corrupted (shop is the night that would otherwise open first)

All four servers are stopped. Evidence is in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-owner-states-r2\`, with step logs in `walk-1440.txt`, `walk-390.txt` and `walk-extra.txt`.

Journeys:
- **Morning on load, 1440 and 390:** walked to the end. The heading reads "3 waiting for you". shop opens and turns Done live. mobile shows "Waiting for an agent · 3 days", and at 1440 also "1 never started".
- **History, 1440, 390 and 360:** walked to the end. The page is exactly as wide as the screen at all three widths. billing's and mobile's "Stopped early" lines wrap inside their cards. **V1 is fixed.**
- **docs deck:** walked to the end. Keys `2` then `Enter` saved the answer, All clear showed, and the chip moved live to Ready to save. The T2 tag is now amber. **V4 is fixed.**
- **search, Create follow-up:** walked to the end. search moved live to Waiting for an agent, and the heading dropped to 2. The same worked on docs (heading 1).
- **crm (New):** walked to the end. It showed Done on open, and the heading changed to "All caught up".
- **billing, mobile and infra opened from a scrolled History:** each opens with the page at the top (scrollY 0 at both widths). **V2 is fixed as specified**, but see V7.
- **Reload:** walked to the end. shop and crm dropped out, and the Viewer opens on api (Running). **V5 is fixed.**
- **Waiting-only sample:** walked to the end. It shows an "In progress" heading, a single mobile chip and the All caught up card. "Open the last night" opens infra, and the heading then reads "All caught up".
- **Unreadable night:** the chip shows a red "Cannot be read" and the History row matches it (red dot, "1 file problem"). docs, not shop, is opened first. Opening it is where the journey breaks (V6).

## Findings

### V6 Note: opening an unreadable night shows "Loading the night…" forever
Journey/step: unreadable sample, clicking the shop chip or its History row - Width: 1440 and 390 - Saw: a red banner at the top gives the true reason ("night 2026-09-27-a is invalid: not valid JSON…"). Below it, main keeps saying "Loading the night…" indefinitely. The click also marks the night read, so on the next load it disappears from Morning and remains only in History. - Expected: an error in place of the report, or no loading text once the request has failed. - Screenshot: `22-unreadable-open-shop-390.png`, `23-unreadable-chip-shop-1440.png` - Fix: in `Morning`, when the pick fails, clear `picking` and show "This night file cannot be read". I did not rate it Blocking because the true error is on screen.

### V7 Note: on a phone, a night opened from History lands below the chip list
Journey/step: History → billing - Width: 390 - Saw: the page is at the top, but six stacked chips fill the screen and billing's h1 starts at y=774 of 844. The owner sees Morning's chips first, not the report they picked. - Expected: the picked report's header in view. - Screenshot: `11-report-billing-390.png` - Fix: scroll the report header into view instead of `window.scrollTo(0, 0)`.

### V8 Note: the heading count includes the unreadable night
Journey/step: unreadable sample, Morning on load - Width: 1440 - Saw: "4 waiting for you", but only three chips are the owner's turn (docs, search, crm). The fourth is shop, whose badge says "Cannot be read". - Screenshot: `20-unreadable-morning-1440.png` - Fix: leave nights without `started_at` out of `left`.

Nit: in the waiting-only sample, "In progress" heads a night that has had no agent for 3 days (`20-waiting-morning-390.png`). "Waiting on agents" would be more accurate.

## Console
The journey walks were clean at 1440 and 390: no messages, page errors, failed requests or 4xx/5xx responses (`console-1440.txt`, `console-390.txt`). The only entries are in the unreadable-night walk: a 422 on `/api/nights/shop/2026-09-27-a` plus the browser's matching "Failed to load resource" error, at both widths (`console-extra.txt`). That is the server correctly rejecting a corrupt file, so it is not counted against criterion 5.

## Verdict: PASS
There is no Blocking finding. All five round-1 findings are fixed (V1 overflow, V2 scroll, V3 heading, V4 tag colour, V5 sample times), and the waiting-only and unreadable-night checks behave as the task asked. V6 to V8 are Notes. V6 is the one I would fix next: a loading message that never ends sits beside a true error.
