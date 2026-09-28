# Visual review round 1: TASK-25 / TASK-26 (Inbox and Night Report page)

**Viewer:** `dev · 25c200d`, rebuilt with `npm run build`. Ports 4811 to 4815. Five fresh samples made with `setup.ts`: one each for 1440 and 390, one `waiting` sample per width, and one for 360. All servers are stopped.

**Journeys:** all eight were walked to the end at 1440 and at 390. Script: `.local/evidence/2026-09-28-visual-inbox-r1/walk.mjs`. Logs: `log-1440.txt` and `log-390.txt` in the same folder.

1. **Load:** passed. No night opens by itself (no h1). The numbers read 2 / 5 / 5. There are 6 cards; the strip holds mobile and legacy.
2. **Start my morning:** passed. It walked blog and docs (2 of 2) and ended on All clear. Without a reload, the numbers went to 0 / 4, blog moved to the strip and docs became Ready to save.
3. **A card's next step:** passed.
   - Answer 1 question opens the docs deck, and Escape closes it.
   - Save for the next agent opens the search report. After Save the night shows Waiting for an agent, and Next night goes from 5 to 6 in the tab and in the number.
   - Read the report moves shop and crm to the strip as Done.
4. **A night page:** passed.
   - ← Inbox, Back and Forward all work, and a reload on a night's address reopens that night.
   - Addresses for an unknown repository or an unknown night show a visible message plus a banner.
5. **Billing drawer:** passed. The before/after pair measures 748x540 at 1440 and 331x414 at 390, so it fits. The slider drags from 50% to 20%, and Escape closes the drawer.
6. **All caught up:** passed. Open the last night goes to infra. ← Inbox and Back both return, and the History button works.
7. **Unreadable night (legacy):** passed. It shows a red banner and "This night could not be opened". Picking another night clears the banner.
8. **Next night and History:** passed. Both link to reports, and Back returns to the tab.

## Findings

### V1 Blocking: the Inbox scrolls sideways at 360 when a card offers "Save for the next agent"
- **Where:** Journey 1, Inbox, width 360 (390 is fine).
- **Saw:** the page is 380px wide in a 360px window, and every card's right edge is cut off.
- **Cause:** the button is 311px wide and `whitespace-nowrap`. The card grid's single column is `1fr`, which cannot shrink below its content, so the column grows to 360.7px inside a 321.6px grid. The same overflow is measured behind the question deck.
- **Screenshots:** `45-inbox-360-search-card.png`, `40-inbox-360.png`.
- **Smallest fix:** add `min-w-0` to the card `article` (or use `grid-cols-[minmax(0,1fr)]` on the phone grid), or let the step button wrap.

### V2 Note: the question deck's end screen still uses the old words
- **Where:** Journey 2, both widths.
- **Saw:** "Create the follow-up so the next agent picks them up." and a "Back to the morning" button. It is shown even when blog was already saved.
- **Expected:** "Save for the next agent" and "Back to the Inbox".
- **Screenshot:** `06-morning-end-1440.png`.
- **Fix:** change the wording now, or leave it to TASK-28's gate.

### V3 Note: an error banner stays on the Inbox after leaving the night that failed
- **Where:** Journeys 4 and 7, both widths.
- **Saw:** after ← Inbox from legacy, or after an address for a night that does not exist, the Inbox keeps the red "legacy: … not valid JSON" or "night 2020-01-01-z does not exist" banner until another night is opened.
- **Screenshot:** `20-legacy-open-1440.png`.
- **Fix:** clear the error when leaving a night page.

### V4 Note: an unreadable night leaves the Inbox after one visit
- **Where:** Journey 7, then a reload.
- **Saw:** opening legacy marks it read, so after the next load it is gone from the strip. It stays red in History.
- **Expected:** the owner may want it kept in view until someone fixes it.
- **Fix:** do not mark a failed night read, or keep unreadable nights in the strip.

### V5 Note: a night's address loaded directly fetches the night twice
- **Where:** Journey 4, both widths.
- **Saw:** after a reload on `#/night/nope/…`, `GET /api/nights/nope/2026-01-01-a` returned 404 twice. The first load (`setDetails({})`) re-runs the night-loading effect.
- **Fix:** skip the second fetch while the first is in flight or has failed.

### V6 Nit: the save row is cramped on a phone
- **Saw:** the "Save for the next agent" row squeezes its explanation into a column about 110px wide beside the Save button.
- **Screenshot:** `08-report-search-before-save-390.png`.

## Console
There were no page errors and no other console errors. The only failed requests are the expected ones:
- **Unknown-address check:** `GET /api/nights/nope/2026-01-01-a` and `/api/nights/api/2020-01-01-z` returned 404 (3 times and once per width; see V5 for the duplicate).
- **Legacy (Journey 7):** `GET /api/nights/legacy/2026-09-23-a` returned 422, which is the designed failure and shows visibly.

## Verdict: FINDINGS
One Blocking finding: V1, sideways scroll at 360.

Evidence is in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-inbox-r1\`: screenshots 01 to 26 at each width, 30 to 31 for Read the report at 1440, and 40 to 45 for the 360 check.
