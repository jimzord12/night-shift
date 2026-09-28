# Review round 1: TASK-34

Snapshot: worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`, branch feat/keyboard-morning, `git diff 863fdef..6d26cce` (head 6d26cce36921, clean tree). Files: web/src/QuestionDeck.tsx, web/src/Gate.tsx, tests/ui/deck.test.ts.
Lead lenses: (1) key conflicts and focus; (2) tests that would pass with the feature broken.
Coverage:
1. Product fit and wiring: the Inbox's Start my morning opens the real deck, which ends on the Gate. Every key the task names works: Enter, D, the arrows, S, and the hints. The Night Report's own Save has no S key, which is fine: the morning path is Inbox, then deck, then gate.
2. Correctness: I read these paths.
   - Typing: text boxes and inputs return before any letter key, and S also checks `!typing`.
   - Explainer overlay: its capture-phase listener on window calls stopPropagation, so D, N and S never reach the deck.
   - Media viewer (zoom): the handler returns early on `if (zoom)`.
   - Locked question: `if (lock) return` sits before D; N moves on, as the old D did.
   - Gate with several nights: S clicks only the first card (`data-gate-save`). After a save the next card becomes first and takes focus.
   - Save in flight on the gate: `:not(:disabled)` stops a double post.
   - Ctrl+Enter still works, because the Enter branch runs before the modifier guard.
   - D still calls preventDefault, so no "d" lands in the note that opens focused.
3. Data integrity: the new test checks the night file answers `[['b',null],['discuss',note]]` and the follow-up items.
4. Contracts and privacy: n/a. No API or schema change. The all-clear.png path is under `.local/` only.
5. Tests and evidence: see F2. The screenshots in out3 show this version (D and N hints, the S hint, the Enter hint on Back, the Ctrl+Enter/Esc hint). They are from 19:15, and the commit is from 19:16:52.
6. Failure handling: when a gate save fails, the button comes back enabled, so S retries. Nothing new here.
7. Simplicity and ownership: the small edits sit in the files that own the behaviour. No scope creep.
8. Repository and docs: no doc names the old keys (0, or D for Not now). The CHANGELOG entry is written at release. The task status is still Queued (F5).

## Findings
### F1 Minor: D, N and S do nothing when a non-Latin keyboard layout is active
Anchor: web/src/QuestionDeck.tsx:177, :193, :198
Scenario: the owner has the Greek layout active in the browser and presses D, N or S.
Expected: the shortcut works.
Actual: `e.key` is 'δ', 'ν' or 'σ', so nothing happens. Enter, the arrows and the digit keys still work, and the old key 0 worked in any layout.
Impact: the keyboard morning breaks at "discuss" and "save" for this owner whenever that layout is on.
Smallest fix: also accept `e.code === 'KeyD'`, `'KeyN'` and `'KeyS'`.

### F2 Minor: no test covers the new modifier-key guard
Anchor: QuestionDeck.tsx:192 and the `!e.ctrlKey…` checks at :177
Scenario: delete the guard. By reading, the new test still passes: it never presses a modifier with a letter or digit.
Impact: low. Ctrl+D would pick discuss again as well as bookmarking, and Ctrl+1 would pick an option as well as switching tabs.
Smallest fix: one step in the existing keyboard test. Press `Control+d` on Q1 before Enter and assert Q1 still saves as 'b'. Or record why not.

For the rest of lens 2: the new test's final assertions make it fail if D is reverted to 0. In the old code d means Not now, so Q2 stays null. It also fails if D picks discuss but does not focus the note (the typed text is lost, and the 'n' in "change" skips ahead). It fails if the S handler is removed, because nothing leaves the gate, and if preventDefault is dropped, because the note gets a stray "d". The old test is unchanged and still covers click-to-answer plus the note.

### F3 Note: S always saves the first night, wherever focus is
Anchor: QuestionDeck.tsx:179
If the owner tabs to the second card's Save and presses S, the first card saves. This matches the hint, which is shown only on the first card. Enter on the focused button saves that card.

### F4 Note: sibling paths that already behaved this way
Anchor: QuestionDeck.tsx:190-197
- N and the digit keys are not blocked while a save is in flight (`busy`). The old D had the same gap, and save() works out its next step again when it finishes, so the effect is low.
- Alt+Left and Alt+Right move the deck and also trigger browser Back or Forward, because the guard sits after the arrow keys.

### F5 Note: the task status is out of step
Anchor: backlog/tasks/task-34 (status: Queued, no assignee)
The work is under review, so by backlog/README.md the status should be Active or Review.

## Checks rerun
- `npm run check`: exit 0. 60 tests, 60 pass, web build OK. Log: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r1-task34\check.log`
- `npm run test:ui`: exit 0. 2 pass: the deck test and the new keyboard-only morning. Log: `ui.log` in the same folder.
- Both ran with TMP set to that scratch folder. The tree stayed clean afterwards; only the ignored web/dist was rebuilt.

## Evidence inspected
- The diff 863fdef..6d26cce.
- In full: web/src/QuestionDeck.tsx, web/src/Gate.tsx and tests/ui/deck.test.ts at 6d26cce.
- The overlay and viewer key handling in Explainer.tsx:91-176 and Evidence.tsx:27-39.
- Inbox.tsx:47-70, App.tsx for key listeners, tests/helpers.ts.
- `.local/evidence/2026-09-28-keyboard/out3/{question,discuss-note,gate,all-clear}.png` and video.ts.

## Limitations
- I did not run any mutants: that means editing the source tree. The claims about which changes make the tests fail come from reading the code.
- I did not watch the webm video. The screenshots and video.ts show the same keyboard-only script.
- Per AGENTS.md this visible, behaviour-changing change also needs `design-reviewer` and `visual-reviewer`. That is outside this review.

## Verdict: PASS
