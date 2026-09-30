# Code review round 2: TASK-40 batch 1 (base 5a2df7d, head 05aacae)

Verdict: FINDINGS. Lead lenses: the media viewer's Tab trap and Enter swallow; whether each new test
fails with its fix reverted. Probes and single reverts ran in a `git archive` copy.

## Findings

- R2-1 Material (QuestionDeck.tsx:342, :253): X and the gate's leave button never leave with an
  unsaved note. Pointer-down and keydown reset the warning just before `leave()` runs, so every
  press warns again; only Esc gets out. Exempt the leave controls from the reset; test X twice.
- R2-2 Material (:262): Enter on an "All clear" gate calls `onClose()` and drops an unsaved note
  without a word. Call `leave()`, exempt from the reset; test it.
- R2-3 Material (tests/ui/deck.test.ts): the new tests pass with the viewer's focus-on-open, its
  Enter swallow, or the `main` fallback removed, and no test clicks X or the gate button. Assert
  the Close focus, press Enter on a deck control under the viewer, add the R2-1 and R2-2 steps.
- R2-4 Minor (:253, :342): the warning text stays after the warning is disarmed.
- R2-5 Note (Evidence.tsx:44-50): the trap treats a video as one stop; keys inside an iframe
  escape the trap (as before); Shift+Tab from outside lands on the second-to-last control.
- R2-6 Note (Evidence.tsx:61, :76; Report.tsx:330, predates the task): a click on the picture
  closes the viewer and the task drawer.

What holds: from the report drawer the viewer takes the focus, keeps Tab, Esc closes only the
viewer and the focus returns; in the deck Esc closes only the viewer.

Checks: `npm run check` 87/87; `npm run test:ui` 9/9; probes P1-P5 and five single-revert runs.
