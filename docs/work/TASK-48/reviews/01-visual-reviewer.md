# Visual review round 1: TASK-48

The fix does what the task asks. On the save screen, pressing Enter or S again right after a save saved nothing more, at both widths, with the keyboard and with the mouse. The next night's Save worked once it was ready. The half-second dim did not feel broken or laggy.

**Setup:** Viewer `dev · 0b36518`, built from `fix/gate-enter` and served on ports 4931-4946. Each journey got its own scratch `NIGHT_SHIFT_ROOT` and its own synthetic repositories, made by `scratchpad/t48/setup.ts` through `src/night.ts` and `registerRepo`. The two-night journeys used shop and blog; the single-night gate used shop alone. Every night was closed with one open question. I drove it with the worktree's own Playwright.

## Journeys (all walked to the end at 1440 and at 390)

1. **Keyboard.**
   - On the last question I pressed Enter, then Enter again and S at once. That answered it and opened the save screen; nothing was saved.
   - The Save button came alive and took focus after about 280 ms at 1440 and about 405 ms at 390, measured from when the heading appeared.
   - Enter saved shop. An Enter and an S straight after it saved nothing: 480 ms later, shop was still the only night saved.
   - When blog's Save was ready, Enter saved it and the screen read "All clear". Enter then returned to the Inbox.
2. **Mouse.**
   - A click on Save while it was still dimmed did nothing.
   - A double-click saved shop only, and a click right after it where blog's Save now sat saved nothing (checked after 600 ms).
   - A click once it was ready saved blog; "Back to the Inbox" worked.
3. **Single night.** Frames at 0, 150 and 300 ms, then ready, then S saved it. The dim overlaps the screen's own pop-in animation, so the button just seems to "wake up" with its focus ring. It did not read as broken or slow.
4. **Esc and "Not now" during the wait.** Both closed the deck with nothing saved, whether pressed straight after the save screen opened or straight after the first save (only shop saved).
5. **Phone width.** No sideways scrolling or clipped text on the save screen in any state.

## Findings

### V1 Note: holding Enter, or tapping it about 3 times a second, still saves every night
Journey/step: keyboard, from the last answer - Width: 1440 - Saw: holding Enter down for 2.5 s (auto-repeat) saved shop, then blog, then closed the deck. Pressing Enter every 300 ms saved shop at about 0.9 s and blog at about 1.5 s. Each card is only on screen for about half a second before it saves - Expected: the acceptance only covers a second press "within a moment", which passes. This is the leftover edge of the same risk the task was filed for - Screenshot: `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-visual-gate-enter\hold-03-after-hold.png`, with the timings in `walk-log.txt` - Fix: on the save screen, ignore key presses that are auto-repeats (`e.repeat`) so the button does not fire on them. Tapping Enter over and over is deliberate pressing and can stay the author's call.

### V2 Nit: the dimmed Save still looks pressable
Journey/step: after the first save, during the wait - Width: 390 and 1440 - Saw: at 70% opacity with its gold edge, the waiting button looks nearly the same as the ready one. A tap in that half-second is silently ignored - Expected: acceptable for 0.5 s - Screenshot: `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-visual-gate-enter\mouse390-04-after-first-save-waiting.png` - Fix: none needed. Optionally dim it a little more.

## Console
Clean: no errors, warnings, failed requests or HTTP 4xx/5xx in any journey.

## Evidence
All screenshots are in `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-visual-gate-enter\`, together with `walk-log.txt` (each step's state and timings). File names start with the journey: `kb*`, `mouse*`, `one*`, `esc*`, `nn*`, `pe*`, `pn*`, `hold`, `tap`. Key pairs:
- Waiting vs ready at 1440: `kb1440-03-gate-waiting.png` and `kb1440-04-gate-ready.png`.
- Right after the first save: `kb1440-05-after-first-save-waiting.png` and `kb390-05-after-first-save-waiting.png`.
- Single-night frames: `one390-03-gate-{0,150,300}ms.png` and `one390-04-gate-ready.png`.

The setup and walk scripts are in the session scratchpad under `t48/`. I stopped all 16 servers, and the worktree has no changes.

## Verdict: PASS
No Blocking or Material findings. V1 is worth a one-line decision by the author.
