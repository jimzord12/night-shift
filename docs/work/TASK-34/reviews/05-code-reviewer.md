# Review round 5: TASK-34

Snapshot: `night-shift.worktrees/ci`, head 4d26f27, base 863fdef. I read the whole diff, the round-4 fix diff 2fb4e5c..4d26f27, all of `QuestionDeck.tsx`, the MediaViewer key handling in `Evidence.tsx`, `deck.test.ts` and the TASK-34 notes. I exported the snapshot with `git archive` into scratch. There is an untracked `05-visual-reviewer.md` in the worktree; I did not read it.

Lead lenses: (1) the Enter rule as one piece; (2) the tests as a set, one mutant per rule.

Coverage:
1. Wiring: I drove the real deck listener against the built `web/dist` in Chromium.
2. Correctness: I found no path at 4d26f27 that saves an answer other than the checked one, beyond the settled rule that a keyboard-focused option saves itself. I also found no path that presses a control the owner did not aim at. The probes covered five cases. A keyboard-reached thumbnail opens on Enter, and opens again after Esc. A clicked thumbnail, then Esc, then Enter saves the checked answer. After Tab to Not now, a click on the heading or on the disabled Next moves the focus to the deck, and Enter then saves. Both are correct.
3. Data: the same probes wrote nothing on Enter over a thumbnail. The 409 behaviour is unchanged (settled round-3 N2).
4. Contracts: n/a. No API or file-shape change.
5. Tests: F1, F2 and N1 below.
6. Failure: unchanged since round 3.
7. Simplicity: fine.
8. Repo: `git diff --check` is clean and the files use LF. The round-4 disposition ("removing the Tab reset fails it") is confirmed.

## Findings
### F1 Material: neither thumbnail rule has a test, and deleting the branch saves an answer the owner never chose
Anchor: web/src/QuestionDeck.tsx:205-208; tests/ui/deck.test.ts (no option has an image)
Scenario: mutant M4 deletes the `[role=button]` branch. All 3 UI tests pass. My probe on M4 then ran this: an option with a picture, Tab to Pic A's thumbnail, press Enter.
Expected (and actual at 4d26f27): the picture opens and nothing is saved.
Actual on M4: `b` is saved. That is the recommended answer, not even the option whose picture had the focus. The deck then moves on.
Mutant M5 drops `&& !clicked.current` on line 205. All 3 tests still pass, and the round-4 F2 bug comes back: the probe reopened the image and saved nothing.
Impact: this is the pattern round 4 called Material under F1. The only guard against an unintended save is code no test covers, and picture options are real in design questions.
Smallest fix: add one image option to the mixed test, with a PNG under the night's `evidence/`. Tab to its thumbnail, press Enter, and assert the viewer is open and the answer is `null`. Then Esc, click the thumbnail, Esc, Enter, and assert the answer is saved. Confirm that M4 and M5 each make it fail.

### F2 Minor: the keyboard test is flaky under load because a late focus timer pulls the cursor back into the note
Anchor: QuestionDeck.tsx:253 (`setTimeout(() => noteRef.current?.focus(), 0)`); deck.test.ts:103-107
Scenario: D, Esc, 1, D. On a busy machine the timer set by the first D fires after Esc or after 1. The next keys then land in the note as text.
Actual: 3 of 10 full-suite runs failed while jobs ran in parallel. The notes read `'1dDoes…'` or `'dDoes…'`, the latter with answer `a`. None of 12 idle runs failed, 6 of them on base. The flake also made mutants M1 and M7 look as if they failed the keyboard test.
Impact: a gate that fails at random. For the owner, it is at worst stray characters in a note they can see. Nothing is saved on its own.
Smallest fix: cancel the pending focus when Esc leaves the note (`clearTimeout`), or skip the timer once the note is drawn.

### N1 Note: Enter on let's discuss with no note (lines 210-218) has no test
Mutant M7 passes the suite when run alone. Without the branch, `save()` still picks let's discuss and focuses the note, but it also shows the "needs a note" message. The difference is small.

## Checks rerun
- `npm run check`: exit 0, 60 of 60 tests, build OK (`t34r5c/check.log`).
- `npm run test:ui` on base: exit 0, 3 of 3 (`base-ui.log`). Six more full runs on base: all pass (`base-full-*.log`).
- Mutants, each a fresh copy with `web/dist` rebuilt:
  - M1 (Tab reset) fails the mixed test: `'a'` where `null` was expected. It passes the keyboard test 3 of 3 when run alone.
  - M2 (clicked guard on buttons) and M3 (focus move on a number key) each fail the mixed test.
  - M6 (option rule) fails 2 tests.
  - M4, M5 and M7 pass everything.
- Probe `base/tests/ui/probe5.test.ts`; output in `probe.log`, `m4-probe.log` and `m5-probe.log`, screenshots in `shots/`.

Scratch root: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t34r5c`

## Evidence inspected
At 4d26f27: `web/src/QuestionDeck.tsx`, `web/src/Gate.tsx` (diff), `web/src/Evidence.tsx`, `tests/ui/deck.test.ts`, `src/night.ts` (`ask`), the round-3 and round-4 code reports, and the TASK-34 notes.

## Limitations
- Chromium only this round. Firefox and WebKit were covered in rounds 3 and 4.
- The flake rate depends on machine load, and other agents may have been running at the same time.
- I did not rerun the mutant for the link rule; the author and round 3 did.

## Verdict: FINDINGS
