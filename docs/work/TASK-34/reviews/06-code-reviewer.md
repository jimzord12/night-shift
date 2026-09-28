# Review round 6: TASK-34

Snapshot: worktree `night-shift.worktrees/ci`, head 767ce4c, base 863fdef. I exported it with `git archive 767ce4c` into scratch. I read the whole diff and the round-5 fix diff 4d26f27..767ce4c. I also read all of `web/src/QuestionDeck.tsx`, `MediaViewer` in `web/src/Evidence.tsx`, `tests/ui/deck.test.ts`, the round-5 code report and the TASK-34 notes.

Lead lenses: (1) `focusNoteSoon` and its timer; (2) how flaky the UI suite is under load, and any rule still without a failing test.

Coverage:
1. Wiring: the real deck key listener ran against the built `web/dist` in Chromium, through the real server and real night files.
2. Correctness: `focusNoteSoon` has two callers, D (line 261) and Enter on let's discuss with no note (line 226). Both behave correctly. Esc now cancels a focus still pending, and I proved it deterministically (probe P1 below). A question change and an unmount are harmless: arrow keys are ignored while the note has the cursor, and after unmount `noteRef` is null. The refusal path inside `save()` still has the same race: F1.
3. Data: in my probes, Enter over a thumbnail wrote nothing. Answers are unchanged from round 5.
4. Contracts: n/a. There is no API or file-shape change.
5. Tests: removing either thumbnail rule (M4, M5) fails the mixed test at the intended step, as the author said. Removing the Esc cancel (M8) is caught by no test: F2.
6. Failure: no change since round 3.
7. Simplicity: `focusNoteSoon` is small and sits where it belongs. F1's fix would reuse it.
8. Repo: `git diff --check` is clean, all 17 changed files use LF, and the task notes record the round-5 dispositions. There are no names of real projects in the diff.

## Findings
### F1 Minor: the timer in `save()`'s refusal path still pulls the cursor back into the note after Esc
Anchor: web/src/QuestionDeck.tsx:155-158 (its own `setTimeout`), set against lines 191-194 (Esc clears only `noteFocus`).
Scenario: let's discuss is picked and the note is empty. Ctrl+Enter or Enter is refused, then Esc and 1 arrive before the 0 ms timer fires. That is the round-5 F2 race on its sibling path.
Expected: the focus stays on option 1.
Actual (probe P2 at head, synthetic keys in one task): after Esc the focus is on BODY, after 1 on BUTTON, and after the timer back in TEXTAREA. The keys that follow land in the note as text.
Impact: this only happens when the machine is busy. The owner sees stray characters in a visible note; nothing is saved on its own.
Smallest fix: keep that timer's id in `noteFocus.current` too, for example by calling `focusNoteSoon()` and then `scrollIntoView` inside the same timer. Esc then cancels both.

### F2 Minor: the rule that Esc cancels a pending note focus has no test that fails without it
Anchor: QuestionDeck.tsx:192; deck.test.ts:103-107
Scenario: mutant M8 removes `clearTimeout(noteFocus.current)`. It passed all 8 of my runs: 1 during the mutant batch, 4 under parallel load and 3 with CDP CPU throttling at 10x.
Probe P1 does fail on it: synthetic D, a microtask flush, then Esc on the note and 1, all in one task. At head the focus ends on BUTTON; on M8 it ends on TEXTAREA. So a deterministic test can be written.
Impact: the round-5 fix is correct, but nothing guards it. Given F2's Minor severity, this stays Minor.
Smallest fix: add P1's `page.evaluate` sequence to the keyboard test, or record why not.

### N1 Note: the D-path timer is now mostly a backstop
A key event dispatched from `window` renders in a microtask, so `autoFocus` focuses a newly drawn note before the 0 ms timer runs (probe: after D the focus is already on TEXTAREA). The timer is harmless now that Esc cancels it.

## Checks rerun
- `npm run check` on the snapshot copy: exit 0, 60 of 60 tests, build OK (`logs/check.log`).
- `npm run test:ui` on the snapshot copy: exit 0, 3 of 3 (`logs/head-test-ui.log`).
- Flakiness at head: 13 full UI-suite runs, all 3 of 3 (39 test runs, 0 failures):
  - the gate run above;
  - 3 run in parallel with the mutants (`head-par-*`);
  - 6 in parallel beside 4 M8 runs (`head-load-*`, about 29 s each against the usual ~10 s);
  - 3 with CPU throttling at 10x, run in parallel (`hthr-*`).
- Mutants, each a fresh copy with `web/dist` rebuilt:
  - M4 (thumbnail branch deleted): the mixed test fails at deck.test.ts:186, where the viewer never opens.
  - M5 (`!clicked.current` dropped on the thumbnail): the mixed test fails at line 195, because Enter reopens the picture instead of saving.
  - M8: passes all runs (F2).
- Probe: `head/tests/probe/probe6.test.ts` and the same file under `m8/`. Output is in `logs/head-probe.log` and `logs/m8-probe.log`.

Scratch root: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t34r6` (TMP/TEMP pointed there as well).

## Evidence inspected
At 767ce4c: `web/src/QuestionDeck.tsx`, `web/src/Gate.tsx` (diff), `web/src/Evidence.tsx` (`MediaViewer`), `tests/ui/deck.test.ts`, `tests/helpers.ts`, `docs/work/TASK-34/reviews/05-code-reviewer.md`, the TASK-34 task file and the head of `CHANGELOG.md`.

## Limitations
- Chromium only.
- Probes P1 and P2 use synthetic key events to force the timing. Real key presses did not reproduce the race on this machine, even under throttling.
- I did not rerun mutants M1-M3, M6 or M7. Round 5 covered them, and the code they touch did not change.

## Verdict: PASS
