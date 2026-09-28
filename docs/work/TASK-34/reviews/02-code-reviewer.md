# Review round 2: TASK-34

Snapshot: worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`, branch feat/keyboard-morning, head 06598b8, base 863fdef. I read the whole diff and the round-1 fix diff 6d26cce..06598b8. The tree was clean apart from an untracked `02-design-reviewer.md`.
Lead lenses: (1) the new navigation state; (2) Enter on focused buttons.
Coverage:
1. Wiring. The deck is mounted as `{deck && <QuestionDeck/>}` in App.tsx:280, so reopening the deck clears `passed`. I checked this in the browser (P5).
2. Correctness. Checked in a browser: passed questions, arrows back, answering a passed question later, N on the last waiting question. Locked Next, Enter and N keep the old browse path (`browse=true`). On a 409 conflict the deck stays on the question and `passed` is unchanged. The gaps are F1 to F3.
3. Data. F1 and F2 save an answer the owner did not choose. It stays changeable until an agent takes the question.
4. Contracts: n/a. There is no file-shape or API change.
5. Tests. The round-1 mutants are credible when I read the test. The `data-option` exception has no test (F4). The out4 screenshots and video are from 19:35-19:36, after the commit at 19:34:32.
6. Failure: no new path.
7. Simplicity: the single `moveOn` rule is clean.
8. Docs and task: the task notes record the dispositions. The TASK-40 deferrals are recorded.

## Findings
### F1 Material: Enter on a focused "Open" file link saves the answer instead of opening the file
Anchor: web/src/QuestionDeck.tsx:191-197 (and :420)
Scenario: the question names a file the Viewer cannot display (README.md, .ts, .json). The owner Tabs to its "Open" link and presses Enter.
Expected: the file opens in a new tab.
Actual: the target is an `<a>`, not a button, so the Enter handler calls `preventDefault()` and `save()`. In probe P1 no tab opened, the recommended answer "b" was saved and the deck moved to the next question.
Impact: from the keyboard you can never open such a file, and the question is answered without the owner choosing.
Smallest fix: let any focused control press itself: `e.target.matches('button:not([data-option]), a[href], [role=button]')` inside the scroller, instead of `instanceof HTMLButtonElement`.

### F2 Material: Enter on a Tab-focused option saves a different option
Anchor: QuestionDeck.tsx:191 (the `data-option` exception)
Scenario: "Detailed" is recommended and preselected. The owner Tabs to "Compact" (the focus ring is on it) and presses Enter.
Expected: "Compact" is chosen. This is what V2 expected for options.
Actual: probe P2 saved `b` (Detailed) and moved on.
Impact: a wrong decision is saved from the keyboard, with nothing saying so.
Smallest fix: on Enter over a `data-option`, save that option's id: select it, then save. After a mouse click, the focused option and the selected option are the same, so the reason for the exception still holds. For the discuss option, select discuss and let the existing note-required path run.

### F3 Minor: a button the mouse clicked keeps Enter
Anchor: QuestionDeck.tsx:192
Scenario: in Chromium, clicking "use it" or a progress segment gives that button the focus. Enter then presses it again, so nothing is saved, while the Save chip says "Enter". Confirmed by probe P3.
Fix: in the question view only, press the button only when it `matches(':focus-visible')`. Keep the gate as it is: it focuses its Save button from code.

### F4 Minor: the `data-option` exception has no test
If the exception is removed, no test fails. The test for the F2 fix would cover it.

### F5 Note: the option thumbnail is not usable from the keyboard
The thumbnail (`span role="button" tabIndex=0`, :294) is nested inside the option button and has no key handler, so Enter on it saves the answer. This predates the change.

### F6 Note: Show in folder
Enter presses it natively. I checked this by reading the code only; I did not run it, because it opens the machine's file manager.

## Checks rerun
- `npm run check`: exit 0, 60 of 60 pass, build OK. Log: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r2\check.log`
- `npm run test:ui`: exit 0, 2 of 2 pass. Log: `...\scratchpad\r2\ui.log`
- My own probes, `...\scratchpad\r2\probe.test.ts` (P1, P2, P3, P5): real server, built web/dist, Chromium, temporary repositories. All four probes ran, one process each. Results:
  - P1: `[["b",null],…]`, no new tab.
  - P2: `b` saved with the focus on Compact.
  - P3: nothing saved after "use it" or a progress segment.
  - P5: navigation and reopening were correct.

## Evidence inspected
- `web/src/QuestionDeck.tsx`, `Gate.tsx`, `App.tsx`, `Explainer.tsx` (HelpDot), `Evidence.tsx` (mediaKind), `tests/ui/deck.test.ts`, `tests/helpers.ts`, all at 06598b8.
- Round-1 reports and the round-2 design report.
- The TASK-34 and TASK-40 notes.
- File times in `.local/evidence/2026-09-28-keyboard/out4`.

## Limitations
- I did not build a locked question: I checked locked navigation by reading the code.
- I did not look at 390 px width.
- I did not open the video.

## Verdict: FINDINGS
