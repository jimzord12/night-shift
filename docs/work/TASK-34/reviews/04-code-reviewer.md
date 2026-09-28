# Review round 4: TASK-34

Snapshot: worktree `night-shift.worktrees/ci`, head 2fb4e5c, base 863fdef. I read the whole diff, the round-3 fix diff 3124c4d..2fb4e5c, all of `QuestionDeck.tsx`, and the focus code in `Gate.tsx`, `Evidence.tsx` (MediaViewer) and `Explainer.tsx`. I exported the snapshot to scratch with `git archive`. There is an untracked `04-visual-reviewer.md` in the worktree; I did not read it.

Lead lenses: (1) how long the `clicked` flag lives; (2) whether any path saves an answer other than the checked one, or presses a control the owner did not aim at.

Coverage:
1. Wiring: I drove the real deck keydown listener in Chromium, Firefox and WebKit against the built `web/dist`.
2. Correctness: Tab, a number key and a click each set or clear the flag correctly. The flag stays set through arrows, N, a save and D, but none of those gives a button the focus. Gate and explainer: n/a, the gate path returns before the flag is read, and the overlay renders outside the deck. Touch: a tap sets `clicked`, and Enter then saves (probe P7). The one thing the flag does not reach is the thumbnail (F2).
3. Data: I found no path that saves an answer other than the checked one. After a number key, a mouse click on the other option saves the clicked one in all three engines (P3). A Tab onto an option still saves that option, which was settled in round 2.
4. Contracts: n/a. No API or file-shape change.
5. Tests: the new test fails without the focus move (M2) or the clicked guard (M3). It still passes without the Tab reset (F1).
6. Failure: unchanged from round 3 (N1, N2 were settled).
7. Simplicity: fine. `clicked.current = false` in the number-key path is redundant but harmless, because the option rule runs first.
8. Repo: LF endings, `git diff --check` clean. The round-3 disposition says "removing either fix fails it". That is true, but the Tab reset is not covered.

## Findings
### F1 Material: nothing tests that Tab clears `clicked`; without it a skip becomes a saved answer
Anchor: web/src/QuestionDeck.tsx:181; tests/ui/deck.test.ts:125-168
Scenario: mutant M1 deletes line 181. All 3 UI tests still pass. Probe P1 on that mutant: click "use it", Tab to Not now, press Enter.
Expected: Not now is pressed and nothing is saved. That is what happens at 2fb4e5c.
Actual on M1: the recommended answer `b` is saved and the deck moves on.
Impact: the only guard on a wrong-data regression is a line no test covers. This is the same pattern as round 2's F3, which was recorded as fixed without a test.
Smallest fix: one step in the mixed test. After a click in the deck (for example "use it" on Q2, before Enter), Tab to Not now, press Enter, and assert that question stays `null`. Confirm it fails with line 181 removed.

### F2 Minor: a mouse-clicked option thumbnail still presses itself on Enter (V10's sibling)
Anchor: QuestionDeck.tsx:205-208 (the `[role=button]` branch runs before the `clicked` check)
Scenario (P2, Chromium): an option with an image. Click its thumbnail, press Esc, press Enter.
Expected: Enter saves, as it does after a clicked View button.
Actual: the image opens again. Nothing is saved and the focus stays on the SPAN (`shots/p2-after-enter.png`).
Impact: in a mixed mouse-and-keyboard morning with picture options, Enter keeps reopening the image. No wrong data.
Smallest fix: `if (t.matches('[role=button]:not(button)') && !clicked.current)`. When `clicked` is set, fall through to Save.

### N1 Note: a progress segment reached by keyboard keeps the focus across the arrow keys
P6: Tab to a segment, Enter, then →, then Enter jumps back to that segment's question. This follows the settled rule that a keyboard-reached button presses itself, and the header is not re-mounted. The fix could come with TASK-40 V5.

### N2 Note: the Save hint can stay stale after the gate
The `inNote` reset only runs when the index changes. If the owner saves the last question from the note, then clicks the same question's segment on the gate, the hint can still read Ctrl+Enter. This is a rare path and only affects the hint.

## Checks rerun
- `npm run check` on the scratch copy: exit 0, 60 of 60 tests, build OK. Log: `t34r4/check.log`.
- `npm run test:ui`: exit 0, 3 of 3 tests. Log: `t34r4/ui.log`.
- Mutants, each a fresh copy with `test:ui` rebuilding `web/dist`:
  - M1 (no Tab reset): 3 of 3 pass (`m1-ui.log`). P1 then saved `b` (`m1-probe.log`).
  - M2 (no focus move): the mixed test fails.
  - M3 (always press): the mixed test fails.
- Probes: `t34r4/base/tests/ui/probe.test.ts`, output in `probe.log`, screenshots in `shots/`. P3 ran in all three engines and saved `a` each time. P8 shows a clean focus ring on the option a number key picked.

Scratch root: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t34r4`

## Evidence inspected
All at 2fb4e5c:
- `web/src/QuestionDeck.tsx`, `Gate.tsx`, `Evidence.tsx`, `Explainer.tsx`
- `tests/ui/deck.test.ts`
- reviews 03-code and 03-visual
- the TASK-34 notes

## Limitations
- I did not open "Show in folder", because it would open Explorer.
- The touch probe is Playwright's `tap` in Chromium, not a real device.
- The WebKit build on Windows only approximates Safari.

## Verdict: FINDINGS
