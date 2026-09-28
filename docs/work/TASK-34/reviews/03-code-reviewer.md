# Review round 3: TASK-34

Snapshot: worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`, head 3124c4d, base 863fdef. I read the whole diff and the round-2 fix diff 06598b8..3124c4d. The tree was clean apart from an untracked `03-visual-reviewer.md` from another reviewer, which I did not read.

Lead lenses: (1) `save(answer)` and the draft; (2) `:focus-visible` in all three browser engines.

Coverage:
1. Wiring: the deck's keydown listener is the real path. I drove it in Chromium, Firefox and WebKit against the built `web/dist`.
2. Correctness: new wrong-answer path F1; F3 from round 2 is not fixed in Chromium (F2 below).
3. Data: F1 saves an answer the owner switched away from.
4. Contracts: n/a. No API or file-shape change; `postAnswer` gets the override correctly.
5. Tests: the option and link steps would fail if their rules were removed (checked by reading; the author ran those mutants). There is no test for the focus rule or for number key then Enter, which is how F1 and F2 got through.
6. Failure: the 409 path and a save in flight behave (N1, N2).
7. Simplicity: fine.
8. Docs and task: the task notes say code F3 is "fixed". That is not true in Chromium (F2). LF line endings; `git diff --check` is clean.

## Findings
### F1 Material: after a number key changes the pick, Enter saves the focused option, not the checked one
Anchor: web/src/QuestionDeck.tsx:213-216 (option rule) with :233 (a number key sets the draft but leaves the focus where it was)
Scenario: the owner clicks "Detailed", changes their mind and presses 1. "Compact" is now checked. Then Enter.
Expected: Compact (a) is saved.
Actual: probe B saved `b` in Chromium, and in Firefox too, where no focus ring is visible at any point (`fv=false`). WebKit saved `a`, because a click does not focus a button there. The same happens from the keyboard alone: Tab onto one option, press the other's number, Enter.
Impact: a wrong decision is saved silently. This is the same class of bug as round-2 F2, and it was introduced by that round's fix: before it, Enter on an option saved the draft.
Smallest fix: when a number key picks an option, move the focus to that option (`querySelector('[data-option="<id>"]')?.focus()`). Then the focused option and the checked one are always the same. Add this step to the keyboard test.

### F2 Minor: the `:focus-visible` guard does nothing in Chromium; round-2 F3 is still open
Anchor: QuestionDeck.tsx:217
Scenario: click "use it" (the same applies to a progress segment, Previous or Next), then press Enter.
Actual: in Chromium, "use it" does not match `:focus-visible` before the key (`fv=false`). It does match at keydown (`fv=true`), because Chromium marks the focus as keyboard focus before the page's listener runs. So the guard returns, Enter presses "use it" again, and nothing is saved while the Save chip says "Enter". Firefox saves and moves on. WebKit also saves, because the click never focused the button.
Impact: small, but the task notes record it as fixed, and Chromium is the browser the owner tests in.
Smallest fix: record `t.matches(':focus-visible')` in a `focusin` listener when the element gains focus, where the value is still accurate, and read that flag on Enter. Otherwise, reword the disposition. A Chromium test step for this is cheap: click "use it", press Enter, assert the answer was saved.

### N1 Note: a save in flight swallows Enter on an option
Probe C: I delayed the POST by 1.5 s. Enter on "Compact" during the save did nothing. `b` was saved, and Q2's draft was untouched. Harmless locally.

### N2 Note: after a conflict, a second Enter overwrites the other tab's answer and note
Probe D: the other tab saved `b` with the note "other tab". Enter on Compact returned 409 and showed its message. The second Enter saved `a` with no note, because the stale draft is kept. Clicking an option and then Save already did this before this change.

### N3 Note: WebKit
Tab skips the Open link (Safari's default for links). Reached by `focus()`, Enter opens it. `:focus-visible` exists in Safari 15.4 and later. On older versions, `matches` throws only on the button and link path, which falls back to the button's own press.

## Checks rerun
- `npm run check`: exit 0, 60 of 60 tests, build OK. Log: `...\scratchpad\t34r3\check.log`
- `npm run test:ui`: exit 0, 2 of 2 tests. Log: `...\scratchpad\t34r3\ui.log`
- Probes `...\scratchpad\t34r3\probe2.test.ts`, output in `probe2.log`: real server, temporary repositories, a separate `NIGHT_SHIFT_ROOT` per case. Cases A, B and E ran in Chromium, Firefox and WebKit; C, D and G in Chromium only. The Open link opened a tab in all three browsers with nothing saved. G (discuss with an empty note, then a typed note and Ctrl+Enter) saved `["discuss","why"]`. `probe.log` is an earlier run that shared one registry across cases; ignore it.

(scratchpad = `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad`)

## Evidence inspected
- `web/src/QuestionDeck.tsx`, `web/src/Gate.tsx`, `tests/ui/deck.test.ts`, `src/server.ts` (the answer route and its 409 rule), `src/store.ts` (`installRoot`), all at 3124c4d.
- The round-2 code and visual reports.
- The TASK-34 notes.

## Limitations
- Probe A2 (clicked Next, then Enter) failed on my locator (two "Next" matches). The code path is the same as A.
- I did not run mutants myself; the tree is read-only for me.
- No screenshots or video. There is no visible change in this round.
- The WebKit build under Playwright on Windows only approximates Safari.

## Verdict: FINDINGS
