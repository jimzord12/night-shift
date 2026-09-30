# Code review round 3: TASK-40 batch 1 (base 5a2df7d, head ec9ade3)

Verdict: FINDINGS. Lead lenses: the `data-leave` exemption and `disarm()`; the media viewer's root
click change. Probes P1-P4 ran on a built `git archive` copy.

## Findings

- R3-1 Material (QuestionDeck.tsx:248, :266, :149, :212): the warning disappears but stays armed.
  A key on the focused X skips the reset; moving on (→, N, a save) clears the text but not the
  ref, so one Esc or one click on the gate's leave button then drops the note without a word.
  Arm from what is on screen, exempt only Enter and Space on a leave control, let Enter press a
  clicked leave control; test X, then →, then Esc.
- R3-2 Minor (:264, :311): a held Esc, or a held Enter on X, warns and then leaves on the repeat.
  Ignore the repeat, as the gate already does for Enter and S.
- R3-3 Minor (tests/ui/deck.test.ts): the root's `stopPropagation`, the video wrapper's close and
  the gate's second Enter fail no test; nothing clicks a backdrop or works from the report drawer.
- R3-4 Note: Tab on a focused X does not take the warning back (fixed with R3-1).
- R3-5 Note: on a `page` kind the caption and the gap under the iframe no longer close the viewer.

Lens 2 held for every media kind, from the deck and from the report drawer.

Checks: `npm run check` 87/87; `npm run test:ui` 9/9; probes P1-P4.
