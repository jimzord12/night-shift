# Visual review round 3: TASK-25

**Verdict: PASS.** No Blocking finding is left. V7 and F2 are fixed at all three widths. There are three Notes: one is V8 again, which is only partly fixed.

**Viewer:** snapshot 77fabbf, built from a `git archive` export in scratch (bundle `index-Bv3t2kaH.js`, shown as "dev · unknown"). It ran on ports 4871 to 4880, one fresh `setup.ts` sample per run: main at 1440, 390 and 360, `waiting` at 1440, 390 and 360, one for the direct-address checks, and one failure sample per width. All servers are stopped. I never used the real install or port 4799.

## Journeys
1. **Load:** passed at 1440, 390 and 360. The numbers read 2 / 5 / 5, there are 6 cards and the strip holds mobile and legacy. The page is exactly the window width everywhere.
2. **Start my morning:** passed. It walked docs then blog, 2 of 2, and ended on "All clear". The Inbox updated without a reload.
3. **A card's Answer, Save and Read the report:** passed. Escape closes the deck. After Save, Next goes from 5 to 6. After Read the report, shop moves to the strip as Done.
4. **Night page:** passed. ← Inbox, Back, Forward and a reload on a night all work. The missing-repository address shows the reason, and Back to it still shows the reason.
5. **Drawer compare:** passed. It measures 748x540 at 1440, 331x414 at 390 and 301x376 at 360. The slider moves from 50% to 80% and Escape closes the drawer.
6. **All caught up:** passed.
7. **Legacy:** V7 is fixed. Reopening from the strip (`19-legacy-reopen-390.png`), Back (`20-legacy-back-*.png`) and History all show "This night could not be opened" with the reason, and fetch nothing new.
8. **Next night and History:** passed.

**Failure journeys** (`fail.mjs`: the docs night's first GET returns 500 once):
- **Inbox:** the red alert reads "docs could not be loaded, so its questions are not in Start my morning. Reload". The button says "1 question" (`F01-inbox-docs-failed-360.png`).
- **Deck:** it holds only blog (0 / 1).
- **The docs night:** the card, Back and History all show the reason (`F06-docs-failed-page-390.png`), and docs was fetched once in total.
- **Reload:** the alert's Reload removes the alert and the docs night then opens. The header Reload on the failed page also recovers the night on a second try.
- **Save conflict with a failed reload:** I edited the docs night on disk while the deck was open and failed its reload. The deck says "This night changed, and the new version could not be loaded. Reload the Viewer and try again." (`F12-deck-conflict-reload-failed-360.png`).

## Findings
### V8 Note: a night opened by its address is still sometimes fetched twice
- **Where:** `gets.mjs` opens each address in a fresh tab, 4 tries each (direct load, then browser reload). Width 390.
- **Saw:** 1 or 2 GETs per load, depending on timing. This now also happens to real nights: api, crm and shop were fetched twice in some tries. Round 2 fetched real nights once. The nope address got 2 GETs in the walk at all three widths.
- **Expected:** one GET.
- **Likely cause:** `load()` bumps `generation` and empties `inFlight` while the night's first GET is still in flight. That GET is then dropped when it lands, and the night is fetched a second time.
- **Evidence:** `log-gets.txt`, and line 84 of `run-390.txt`.
- **Fix:** skip the bump on the first load, or keep in flight a key that the new generation still wants.

### V10 Note: "All clear" says every question is settled while a night was left out
- **Where:** F2, all three widths.
- **Saw:** "Every question is settled…" (`F04-deck-end-1440.png`), while docs' question is unanswered. The Inbox alert does say so straight afterwards.
- **Fix:** on the end screen, name the night that was left out, or soften the wording.

### V11 Note: after a failed conflict reload, the Inbox alert contradicts the card
- **Where:** F6.
- **Saw:** the alert says docs' questions are not in Start my morning, but the docs card still offers "Answer 1 question" from the old version, and the button is gone (`F13-inbox-after-conflict-1440.png`).
- **Rare:** Reload fixes it.

### Nits
- **V9 still stands:** confetti covers the "All clear" text for about the first second.
- It also keeps drifting over the next page for a moment (`F06-docs-failed-page-390.png`).

## Console
There were no page errors and no failed requests. The only "Failed to load resource" lines come from the failures we expected:
- 404 for `nope` and `api/2020-01-01-z`
- 422 for legacy
- the simulated 500 on docs
- the real 409 from the conflict

## Files
Everything is in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-inbox-r3\`:
- **Scripts:** `walk.mjs`, `direct.mjs`, `fail.mjs`, `gets.mjs`
- **Logs:** `run-1440.txt`, `run-390.txt`, `run-360.txt`, `log-1440.txt`, `log-390.txt`, `log-360.txt`, `log-fail-1440.txt`, `log-fail-390.txt`, `log-fail-360.txt`, `log-direct.txt`, `log-gets.txt`
- **Screenshots:** `01-…23-*-<width>.png` for the eight journeys, `F01-…F13-*-<width>.png` for the failure journeys

## Verdict: PASS
