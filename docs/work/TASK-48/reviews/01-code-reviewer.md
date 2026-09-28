# Review round 1: TASK-48

Snapshot: `c9753f9..0b36518` on fix/gate-enter, examined as a `git archive 0b36518` copy in my scratchpad, with node_modules junctioned to the worktree's.
Lead lenses: (1) the fix's real paths; (2) the new UI test: does it fail without the fix, and does it survive other tests' nights.
Coverage:
1. Wiring: Gate is reached from QuestionDeck:326. The S path goes through QuestionDeck:229. Enter goes through the ownButton branch at :221-226. Both are wired.
2. Correctness: I read the paths for entering from the last question, a failed save (still armed, refocused, retries the same night), a 409 (the card leaves, the state re-arms, the stale `button.current` is null so nothing happens), All clear / Answers kept (no Save; Enter closes), a single-night gate, a mouse click during the wait (disabled) and the phone (F2). A race remains (F3).
3. Data integrity: the fix narrows the unintended hand-over. The test does not prove it (F1).
4. Contracts: n/a. No API or file-shape change.
5. Tests: F1.
6. Failure handling: the error and 409 paths are fine (see 2).
7. Simplicity: small and in the owning module.
8. Repo: `git diff --check` is clean, the commit is scoped, the task is Active with its acceptance criteria open (expected at round 1).

## Findings

### F1 Material: the new test passes with the original, unfixed Gate.tsx
Anchor: tests/ui/deck.test.ts:298 (the `saved().some(Boolean)` disk poll)
Scenario: I put `git show c9753f9:web/src/Gate.tsx` into a copy, rebuilt it and ran `node --test tests/ui/deck.test.ts` 5 times. The TASK-48 test passed 5 out of 5.
- Why: the test sends the second Enter and the S as soon as the follow-up file is on disk, which is before the browser has the save response. At that moment the saved card's button is still `busy` (disabled) and the focus is on body, so the keys do nothing with or without the fix.
- The ARM_MS = 0 mutant does fail, but at line 307 (`[false, true]`, the final Save never happens), not at the "only one saved" check. With a 0 ms timer the arm/disarm updates batch, `armed` never changes, and the focus never moves. That mutant does not show that the defect is caught.

Expected: the test fails on the bug (AC #1). Actual: it does not.
Impact: the fix has no regression guard. AC #1 is not met.
Smallest fix: wait for the UI instead of the disk, then press:
```ts
await deck.getByText(/Saved for the next agent: gate-/).first().waitFor();
```
With only that line changed I checked both builds:
- pre-fix: fails 3 out of 3 at :302 (`2 !== 1`)
- fix: passes 3 out of 3

### F2 Material: on the phone, the gate now jumps down half a second after it opens and after each save
Anchor: web/src/Gate.tsx:79 (`focus()` without `preventScroll`)
Scenario: 390x844 viewport, two nights with 3 questions and 3 unfinished tasks each. I probed the deck's scroller:
- fix: at +100 ms `scrollTop 0`, Save disabled. At +800 ms `scrollTop 618`, Save focused.
- pre-fix: `scrollTop 628` from the start.

So the owner starts reading "One step left" and the card, then the view jumps about 620 px. It happens both when the gate opens and after every save. Screenshots: `snap-phone-s100.png` and `snap-phone-s800.png` in the scratchpad.
Expected: a state opens at the top (the comment at :67 says so) and stays there.
Impact: the jump is new with this change, the owner hits it on every phone use of the gate, and no phone screenshot was in the evidence.
Smallest fix: `focus({ preventScroll: true })`. Keyboard use is unchanged, because S and Enter still act on a focused button that is off-screen.

### F3 Minor: the button is still enabled for one render after the state changes
Anchor: web/src/Gate.tsx:71-77
Scenario: when the save response lands, the commit shows the next card as `first` with `armed` still true, so its Save is enabled. It only disarms in the passive effect afterwards. An S keydown handled in that gap would click it. The gap is short; I did not reproduce it.
Smallest fix: derive the flag in render, e.g. `armedFor === \`${heading}|${toSave.length}\``, or disarm in `useLayoutEffect`.

### N1 Note: the question deck has the same double-Enter shape
Anchor: QuestionDeck.tsx:257-261
A double Enter in the deck saves the next question's recommended answer. The impact is lower because answers stay editable. This is pre-existing.

### N2 Note: a double Enter on a single-night gate skips the confirmation
After Save leads to All clear, a quick second Enter closes the deck before the owner has seen the "Saved" confirmation and its phrases. This is pre-existing.

### N3 Note: the test depends on night order
The test assumes no other test's unsaved night sits between gate-a and gate-b. Night order follows the order the loads complete. This only bites if an earlier test left open questions.

## Checks rerun
- `npm run check` on the snapshot copy: exit 0, 68 tests passed, build OK (`scratchpad/check.log`).
- `npm run test:ui` on the snapshot copy: exit 0, 5 out of 5 (`scratchpad/ui-snap.log`).
- Pre-fix Gate.tsx with the new test, 5 runs: all pass (`ui-pre-1..5.log`).
- ARM_MS = 0 mutant, 5 runs: all fail at :307 (`ui-zero-*.log`).
- UI-wait variant: pre-fix fails 3 out of 3, fix passes 3 out of 3 (`ui2-*.log`).
- Phone probe (my own throwaway test, scratch copies only): `phone-pre.log`, `phone-snap.log`, `*-phone-*.png`.

All the files above are in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\`.

## Evidence inspected
All at 0b36518:
- web/src/Gate.tsx
- web/src/QuestionDeck.tsx (lines 55-330)
- web/src/App.tsx (putDetail, loadNight, deckItems)
- tests/ui/deck.test.ts
- tests/helpers.ts
- the task-48 record
- docs/practices/review.md

## Limitations
- F3 comes from reading the code and is not reproduced.
- I did not probe the laptop width for scroll.
- The builds wrote Vite's cache into the worktree's `node_modules/.vite-temp`, which is git-ignored.
- The author supplied no screenshots.

## Verdict: FINDINGS
