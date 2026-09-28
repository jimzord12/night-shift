# Review round 3: TASK-28

Snapshot: feat/save-gate, base c3f335d, head ead14d7 (the tree was clean before and after my checks). I read all of c3f335d..ead14d7 and went deep on e947ab9..ead14d7.
Lead lenses: 2 correctness, 5 tests and evidence
Coverage:
1. Wiring: the Report's `onReload` reaches `loadNight(..., true)` (App.tsx:259). The deck passes `onTop`, `celebrated` and `onCelebrated` to Gate (QuestionDeck.tsx:216). `data-gate-save` moves to the next card after a save because `first` is recomputed from the index.
2. Correctness: the focus on open (QuestionDeck.tsx:103-105) and `ownButton` with `preventDefault` (lines 154-161) are right. Enter on an opener behind the deck, on a nav link (anchor), or on the body can no longer act on the page behind. Round-2 m1, m2, m3 and m4 are fixed. See m1 and m2 below.
3. Data integrity: no new writes in this round. The double-save guard still holds, because a disabled button cannot be pressed and Enter on the body does nothing while `toSave` is non-empty.
4. Contracts: `taken` is always present in `detail()`. There were no src/ changes in this round.
5. Tests and evidence: this round changed only web/ and docs, so nothing outside the UI became newly testable (UI tests belong to TASK-8). One older gap remains (m3). There is one evidence gap (M1).
6. Failure handling: a failed or 409 gate Save now shows its error and never hangs. See m1 and m2.
7. Simplicity: the changes are small and in the owning components. Reusing `Saved` with `flat` is fine.
8. Repo and docs: `git diff --check` is clean, all files are LF, and the task notes carry the dispositions. See N1.

## Findings

### M1 Material: the Report's confirmation, where round-2 D1 (Blocking) was found, is not in the author's evidence
Anchor: web/src/Report.tsx:183 (`<Saved ... flat />`), web/src/Gate.tsx:175-177, 208
- **Scenario:** D1 (design r2) was the phrase overlapping Copy inside the Report's "What needs you" card at 360 and 390. This round changed that layout: `flat` drops the nested card's border and rounding, and the phrase now wraps.
- **Expected:** a screenshot of the Report's Save confirmation at 360 or 390, taken at ead14d7.
- **Actual:** r6/360 (14:56, commit at 14:57) shows only the deck's gate (`01-gate`, `02-saved`, `03-copied`). The gate's column is wider than the Report's, and `log-360.txt` reads "gate heading: Nights". No shot shows the Report confirmation after the fix.
- **Impact:** the Blocking fix and a visible layout change have not been looked at in the place where the defect was.
- **Smallest fix:** attach report-confirmation shots at 360 and 390. The round-3 design reviewer's `.local/evidence/2026-09-28-design-gate-r3/rep/` folder may already cover this. If so, cite it and close M1.

### m1 Minor: after a failed gate Save, Enter no longer retries
Anchor: web/src/Gate.tsx:121-131, 166
- **Scenario:** a Save fails (a network error, a 5xx, or a 409 on an unreadable follow-up). While busy the button is `disabled`, and focus fixup (from reading; not driven in a browser) moves focus to the body. `heading` and `toSave.length` do not change, so the refocus effect does not run again.
- **Actual:** the error shows, and Enter is swallowed (the deck's handler calls `preventDefault`, and `clear` is false). The owner has to Tab or click.
- **Fix:** refocus the button in the `catch` (a ref), or use `aria-disabled` with a busy guard instead of `disabled`.

### m2 Minor: after a 409, the Report keeps a red error for a state that has already resolved
Anchor: web/src/Report.tsx:143-147, 190
- **Scenario:** the follow-up was saved in another tab, then the owner presses Save on the Report.
- **Actual:** the reload removes the Save row and shows the follow-up, but "a follow-up for … already exists" stays in red under the card. The gate's sibling path drops it, because its card unmounts.
- **Fix:** render the error only while `save` still holds, or clear it after a successful reload.

### m3 Minor: `taken` from a skipped follow-up item is untested
Anchor: src/server.ts:129; tests/server.test.ts:251-252
- **Scenario:** if the `skipped_follow_ups` line in `takenRefs` were deleted, every test would still pass. Yet that line drives both the deck's lock for a night that skipped an item (AC #3, "picked up") and Next night's exclusion. `followAnswer`'s skip branch is also unasserted.
- **Fix:** add a skipped item to the running night's plan in the existing test, and assert that it appears in `taken`.

### N1 Note
- docs/design.md:409-410: "a night still running … is saved once it ends" reads as if the save happens automatically. The UI's "Save it once it ends" is the accurate wording.
- Gate.tsx:99 still says "An agent is working on X now" when the night only skipped the item. The deck's lock line was already reworded ("has taken this on", r2 V5).
- On the first gate, `focus()` without `preventScroll` right after `onTop()` can scroll a long card's Save into view past the heading on a phone. `autoFocus` did the same before, so this is not a regression.
- No focus trap: Shift+Tab can reach the page behind the deck, and Space there would press a button. Leave this to TASK-34.

## Checks rerun
Logs are in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r3-code-review\`.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0, 36 passed and 0 failed.
- `npx vite build --config web/vite.config.ts --outDir <scratch>/dist --emptyOutDir`: exit 0.
- `git diff --check c3f335d..ead14d7`: exit 0.

## Evidence inspected
- At ead14d7: web/src/Gate.tsx, QuestionDeck.tsx, Report.tsx (NeedsYou) and App.tsx (loadNight, deck and route wiring); src/server.ts:122-178; src/followup.ts:48-95; src/types.ts:271-281; tests/server.test.ts:213-266; docs/design.md; the TASK-28 notes; the round-2 code, design and visual reports.
- `.local/evidence/2026-09-28-save-gate/r6/360/` (all three PNGs and the log).

## Limitations
- I did not drive a browser. m1 depends on the browser's focus-fixup behaviour and comes from reading the code.
- The round-3 design and visual evidence folders were still being written while I reviewed. I did not rely on them.

## Verdict: FINDINGS
One Material finding (M1), and it is an evidence gap only. The code fixes for round 2 hold. m1 to m3 should be fixed or recorded.
