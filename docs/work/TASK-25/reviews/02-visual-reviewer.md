# Visual review round 2: TASK-25 (Inbox and Night Report page)

**Verdict: FINDINGS.** One Blocking finding (V7), and it is new in this round.

**Viewer:** snapshot b38735b (bundle `index-BZoLQquo.js`). The `Viewer` shows "dev · unknown" because it ran from a `git archive` export in scratch. Ports 4841 to 4846. Six fresh `setup.ts` samples: one each for 1440, 390, 360 and the direct-address check, plus `waiting` for 1440 and 390. All servers are stopped.

**Why an export:** during my first pass the working tree changed under me. `App.tsx`, `Inbox.tsx` and `QuestionDeck.tsx` have uncommitted edits, and `web/dist` was rebuilt from them at 11:00:59. I set that pass aside in `first-pass-mixed-build/` and re-ran everything on the export. The results match the first pass. The uncommitted edits are not reviewed here.

## Journeys (1440, 390 and 360)
1. **Load:** passed. No night opens by itself. The numbers read 2 / 5 / 5. There are 6 cards; the strip holds mobile and legacy.
2. **Start my morning:** passed. It walked 2 of 2 and ended on the new wording with "Back to the Inbox". The Inbox updated without a reload.
3. **A card's Answer, Save and Read:** passed. Escape closes the deck. After Save, Next night goes from 5 to 6. Read the report moves shop to the strip as Done.
4. **Night page:** ← Inbox, Back, Forward and a reload on a night all pass. It breaks on Back to a failed address (V7).
5. **Drawer compare:** passed. It measures 748x540 at 1440, 331x414 at 390 and 301x376 at 360. The slider moves from 50% to 80% and Escape closes the drawer.
6. **All caught up:** passed. Open the last night, ← Inbox, Back twice and History all work.
7. **Legacy:** it breaks on reopen (V7). V3 is fixed: the banner is gone after ← Inbox, after the Next night tab, and after Back from History. Reload on the Inbox passes: after the Reload button and after a browser reload, legacy is not reopened and not fetched again, and the Inbox stays with no night open.
8. **Next night and History:** passed.

## Round-1 findings
- **V1:** fixed. The page is exactly the window width at 360 on the Inbox, the deck, both reports, History, Next and the drawer (`01-inbox-load-360.png`).
- **V2:** fixed.
- **V3:** fixed.
- **V5:** partly fixed (see V8).
- **V6:** fixed. The Save button now sits below its explanation (`09-save-row-390.png`).

## Findings

### V7 Blocking: a night that failed to load shows "Loading the night…" forever when opened again
- **Where:** Journey 7 (and 4). All three widths.
- **Steps:** open legacy from the strip, which shows the correct error. Then ← Inbox, and tap legacy again in the strip, or use browser Back to return to it.
- **Saw:** "Loading the night…" with no banner and no request. It is still there 5 seconds later. The same happens on Back to `#/night/nope/...`.
- **Expected:** "This night could not be opened" plus the reason.
- **Cause:** leaving the night clears `failedKey` and the error. But `failedLoads` still blocks a new fetch, so `failed` is false and `picking` is true.
- **Screenshots:** `19-legacy-reopen-390.png`, `20-legacy-back-*.png`, `14-night-missing-back-again-*.png`, `50-legacy-back-after-5s-390.png`.
- **Smallest fix:** keep the reason for each failed night and derive `failed` and the banner from the night on screen, not from a cleared `failedKey`. The uncommitted `failures` Map appears to head that way, but I have not checked it.

### V8 Note: a failing night address loaded directly is still fetched twice
- **Where:** `direct.mjs`, a fresh tab per address.
- **Saw:** `nope/...` and `legacy/...` were each fetched twice. Real nights (docs, crm) and `api/2020-01-01-z` were fetched once.
- **Cause:** the fetch fails before the overview arrives, and `load()` then resets `failedLoads`, so the night is fetched again.

### V9 Nit: the confetti covers the "All clear" text
- **Where:** the deck's end screen, for about the first second (`06-morning-end-390.png`).

## Console
There were no page errors, no failed requests, and no console errors apart from the "Failed to load resource" lines for these expected failures:
- 404 for `nope/2026-01-01-a`: twice at 390, three times at 1440 and 360. This count includes one fetch from the hash change; the clean count is in V8.
- 404 for `api/2020-01-01-z`: once per width.
- 422 for `legacy/2026-09-23-a`: once when opened, and once more when opened from History after a reload.

## Files
Everything is in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-inbox-r2\`:
- **Scripts:** `walk.mjs`, `direct.mjs`
- **Logs:** `log-1440.txt`, `log-390.txt`, `log-360.txt`, `log-direct.txt`, `run-390.txt`, `run-360.txt`
- **Screenshots:** the numbered PNG files per width
- **Set aside:** `first-pass-mixed-build/`
