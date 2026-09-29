# Code review round 1: TASK-36 (feat/multi-select, f807d97)

Verdict: FINDINGS. Lead lenses: every reader of `answer`/`recommended`; the deck's keyboard and
draft logic, and whether the tests bite.

## Findings

- F1 Material (web/src/QuestionDeck.tsx:270-274 with 296-299): on a multiple-choice question,
  Enter after a click or a number key unticks the option instead of saving (reproduced in
  Chromium: click PDF, Enter: PDF unticked, answer stays null; `2`, Enter: same). Toggle on Enter
  only for a Tab-reached option, or let Enter always save and Space tick; add a browser case.
- F2 Minor (QuestionDeck.tsx:472): the phone footer says nothing when no option is ticked; show
  "None of them".
- F3 Note: src/types.ts:366 comment now sits above `labelsOf`, not `answerLabel`.
- F4 Note: let's discuss, then an option, starts from an empty set; "use it" restores the
  recommendation. Acceptable.
- F5 Note: every new night is night@4, so an older Viewer cannot read it; inherent to D24's
  versioning.

Readers checked: an empty list is truthy everywhere it matters (server, Gate, Report, follow-up
label); `decision: ''` with `decision_label: 'None of them'` is valid and no reader tests
`decision` for truthiness; schema, nightProblems, server and `ask` agree; night@3 refuses
`multiple`; the single-choice path refuses a list; `was` compares lists by JSON. The server tests
bite; the deck test fails with toggling removed.

## Checks rerun

`npm run check` 87/87; `npm run test:ui` 7/7; a Chromium probe against the built Viewer (click +
Enter, 2 + Enter, D then click then Save, untick all at phone width, the Gate summary, reopening):
F1 and F2 reproduced; the talk switch-back saves `['b']`; an empty save stores `[]`; the Gate reads
"None of them". No Viewer left running.
