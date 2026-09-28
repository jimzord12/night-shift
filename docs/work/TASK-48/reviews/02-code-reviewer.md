# Review round 2: TASK-48

Snapshot: `c9753f9..7a82675` (fix/gate-enter). I examined it as a `git archive 7a82675` copy in `scratchpad\code-t48-r2\snap`, with node_modules junctioned to the worktree's. SHA-256 of the reviewed files: Gate.tsx `3197C157…A9F4`, QuestionDeck.tsx `F9BC78C2…7271`, tests/ui/deck.test.ts `4C1B5C18…AE22`.
Lead lenses: (1) the state-keyed arming in Gate.tsx; (2) keyboard regressions from the `e.repeat` guard and the focus change.
Coverage:
1. Wiring: Gate is reached from QuestionDeck.tsx:328. The S key clicks `[data-gate-save]:not(:disabled)` at :231. Enter reaches the focused Save through the native button. Both paths reach the change.
2. Correctness: the arming derives per state in render (Gate.tsx:72-74), so a new first card is disabled from the same commit it appears in. F3 is resolved. The timer is cleared when the state changes and on unmount. Leaving the gate for a question and coming back remounts it and re-arms it.
   - A failed save keeps its state and stays armed, and the 0 ms refocus retries the same night.
   - A 409 where the night really was saved elsewhere drops the count, so the gate re-arms.
   - "All clear" and "Answers kept" have no Save, so arming there is harmless.
   - See N1 and N2.
3. Data integrity: the unintended hand-over is closed for the second press, S and a held key (the mutants below).
4. Contracts: n/a. No API or file-shape change.
5. Tests: F1 is resolved. Every mutant fails at the right assertion (see Checks). The existing tests' new `:not(:disabled)` waits reflect the intended half-second.
6. Failure handling: unchanged and sound (see 2).
7. Simplicity: about 20 lines, in the owning modules.
8. Repo: `git diff --check` is clean. The task is Active with AC #1 unticked, which is expected before the gate. A CHANGELOG entry comes at the release, per its convention.

## Findings

### N1 Note: arming can take the focus from where a quick Tab put it
Anchor: web/src/Gate.tsx:81-83
- Scenario: the owner presses Tab within 500 ms of a state appearing, for example to "Not now". At 500 ms the focus jumps to Save, so the next Enter saves a night instead of leaving.
- Status: I did not reproduce it. It is unlikely, because a Tab press lands that fast only by chance.
- Fix, if wanted: focus only when `document.activeElement` is `body` or null.

### N2 Note: the state key cannot tell two different first nights apart when the count is the same
Anchor: web/src/Gate.tsx:72
- If one night left `toSave` and another joined it in the same render, `armed` would stay true and the new first Save would be live immediately.
- This cannot happen today. App does not poll: only a gate save or a 409 reload changes `deckNights`, and each moves the count one way.
- `nightKey(toSave[0])` in the key would make it exact at no cost.

### N3 Note: with preventScroll, a long first card on a laptop can put the focused Save below the fold
Anchor: web/src/Gate.tsx:82
- The heading and the top of the card stay in view, which is the point of F2. Enter then saves a card whose button is off-screen.
- This is acceptable. It was already accepted in round 1.

The earlier checks hold:
- **F1:** resolved.
- **F2:** resolved. At 390×844 with two nights of 3 questions and 3 tasks, `scrollTop` stays 0 at +100 ms and +900 ms, both when the gate opens and after the first save. At +900 ms the focus is on Save. Screenshots: `scratchpad\code-t48-r2\phone-open-900.png`, `phone-saved-900.png`.
- **F3:** resolved (see Coverage 2).
- **V1:** resolved by the `e.repeat` guard (QuestionDeck.tsx:222).
  - It only runs on the gate (`finished`), so the question deck's keys are untouched.
  - The S check uses `e.code`, so a held σ on a Greek layout is ignored too.
  - Escape runs before the guard, so it still closes.
  - Blocking the default on the window listener also cancels the native Enter activation of a focused button (the norepeat mutant shows it is load-bearing).

## Checks rerun
All logs are in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\code-t48-r2\`.

| Check | Result | Log |
|---|---|---|
| `npm run check` on the snapshot | exit 0, 68/68, build OK | `check.log` |
| `npm run test:ui` on the snapshot | exit 0, 5/5 | `ui.log` |
| deck.test.ts again on the snapshot, 3 runs | 3/3 pass | `ui-snap-{1..3}.log` |
| Mutant: Gate.tsx from c9753f9 | fails 3/3 at deck.test.ts:304, `2 !== 1` | `ui-pre-*.log` |
| Mutant: `e.repeat` line deleted | fails 3/3 at :309, `2 !== 1` (the held Enter) | `ui-norepeat-*.log` |
| Mutant: `ARM_MS = 0` (AC #1's "no wait" mutant) | fails 3/3 at :304, `2 !== 1` | `ui-zero-*.log` |
| Phone probe: my own throwaway `snap/tests/ui/zz-probe.test.ts`, scratch copy only | pass | results in F2 above |

## Evidence inspected
All at 7a82675:
- web/src/Gate.tsx (full)
- web/src/QuestionDeck.tsx:180-340
- web/src/App.tsx:150-200 (to confirm there is no polling)
- tests/ui/deck.test.ts
- tests/helpers.ts
- the TASK-48 record
- docs/work/TASK-48/reviews/01-code-reviewer.md and 01-visual-reviewer.md
- docs/practices/review.md
- CHANGELOG.md (head)

## Limitations
- N1 comes from reading the code only.
- I did not walk the laptop width by hand. The UI tests run at 1280.
- A folder `scratchpad\t48r2\` (probe/, setup.ts) already existed and is not mine. I left it alone and worked in `code-t48-r2\`.
- The builds wrote Vite's cache into the worktree's `node_modules/.vite-temp` through the junction. That folder is git-ignored.

## Verdict: PASS
