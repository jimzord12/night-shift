# Visual review round 2: TASK-48

The fix works. Holding Enter or S, pressing a key twice fast, and double-clicking or double-tapping never saved more than one night per deliberate press. That held at 1440 and 390, on two-night and three-night gates. The phone gate stayed at its top when it opened and after every save.

Viewer: `dev · 7a82675`. I ran `npm run build`; the output was the same as the existing web/dist. The Viewers ran on ports 4950-4963, each on its own scratch `NIGHT_SHIFT_ROOT` under `scratchpad/t48r2/`. The test data was made by `t48r2/setup.ts` and I drove the pages with the worktree's Playwright. The long-card data had 3 questions and 4 unfinished tasks per night, with 2 or 3 nights (shop, blog, docs). The single-night journey had 1 question.

Journeys (all walked to the end at both widths unless noted):
- **Hold Enter.** From the last question, 3 s of Enter (71-79 keydowns, repeats confirmed) answered it and saved no night. A second 3 s hold saved shop only. A 2 s hold on S saved blog only. Holding Enter on "All clear" closed the deck.
- **Double press.** Enter, Enter, S on the last question saved nothing. At the gate, Enter saved one night, and an Enter + S straight after saved nothing (checked 1.3 s later). S then saved the second night.
- **Phone gate with long cards** (3 nights, 390; also 1440). The scroll position was 0 at 0, 250, 500, 700, 1000 and 1500 ms after the gate opened and after each of the 3 saves. Save switched from disabled to enabled at about 450-500 ms each time.
- **Mouse / touch.** A click or tap on Save during the wait did nothing. A double click or double tap plus a third click or tap saved one night only. The next Save worked when ready, and "Back to the Inbox" worked.
- **Single night.** Enter + S together saved nothing during the wait. Enter, Enter when ready saved the night and landed on "All clear" without closing it. Enter then closed the deck.
- **Esc / Not now.** Esc during the entry wait closed the deck with nothing saved. Esc straight after the first save closed it with only that night saved. "Not now" during the wait of the one-night gate opened from the report saved nothing. Enter on that gate's "All clear" returned to the report.

## Findings

### V1 Note: with long cards the focused Save, its key hint and the "Saved" line are off-screen
Journey/step: phone gate, open and after each save - Width: 390 and 1440 - Saw: Save sits at y=1723 on a 844 px phone and y=1123 at 1440, so Enter or S saves a card whose button and S hint the owner cannot see. After a tap-save far down, the screen jumps to the top and shows the next card. The "Saved for the next agent: shop" confirmation sits below that long card, so the only visible sign of the save is the card's name changing - Expected: this is the trade-off the task asked for (stay at the top). Nothing saves by surprise, because the card's name and content are at the top - Screenshots: `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-visual-gate-enter-r2\phone3-04-gate-1500ms.png`, `...\mouse390-03-after-first-save.png`, `...\kb1440-04-gate-ready.png` - Fix: optional. Show the just-saved line above the remaining cards, or name the night in the lead ("shop saved. Save blog for the next agent.").

### V2 Nit: "All clear" has no wait
Journey/step: last save, then a fast second Enter - Width: both - Saw: in my runs the second Enter arrived while the save was in flight and did nothing. An Enter that lands just after the switch to "All clear" closes the deck before the confirmation is read - Expected: harmless, because nothing is saved or lost - Fix: none needed.

N3 order is accepted: the first card differed between runs on the same data (esc390r saved blog first, kb390 saved shop first).

## Console
Clean in every journey: no errors, warnings, page errors, failed requests or HTTP 4xx/5xx.

## Evidence
Everything is in `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-visual-gate-enter-r2\`: screenshots are prefixed `hold*`, `kb*`, `phone3*`, `wide3*`, `mouse*`, `one*`, `esc*`, and the timings are in `walk-log-*.txt`. The scripts are in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t48r2\` (`setup.ts`, `walk.ts`, `esc2.ts`). I stopped all 14 servers. I made no changes to the worktree; the untracked `docs/work/TASK-48/reviews/02-code-reviewer.md` is not mine.

## Verdict: PASS
No Blocking or Material findings. V1 is an optional clarity note for the author.
