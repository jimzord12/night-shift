# Code review round 2: TASK-36 (feat/multi-select, f09bf27)

Verdict: PASS. Lead lenses: the deck's keyboard contract after the fix; whether the tests fail with
the fix reverted. Round-1 F1/V1, F2/V2/D1, F3 and V3 verified fixed.

## Findings

- R2-1 Minor: TASK-36 AC #4 and the `pickOption` comment (web/src/QuestionDeck.tsx:114) still say
  Enter ticks an option; say Space.
- R2-2 Minor: over-long new prose lines: SKILL.md:215, design.md:197 and 276, decisions.md:513.
- R2-3 Note: the committed test drives only click-then-Enter; the other paths share the branch
  (probed, all pass).
- R2-4 Note: repeated Enter on a Tab-reached "use it" presses it again; predates the change.

## Checks rerun

`npm run check` 87/87; `npm run test:ui` 7/7; a revert check (the f807d97 deck in an archive copy
of f09bf27: the multiple-choice deck test fails); an 8-case Chromium probe: `2` then Enter, click
then Enter, Space then Enter, Ctrl+Enter in the note, the talk card by keyboard with and without
a note, the talk card then a tick, "use it" by keyboard and by click, nothing ticked ("Save:
none", "Your answer: None of them", `[]` saved). All pass. No Viewer left running.
