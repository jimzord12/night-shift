# Code review round 1: TASK-40 batch 1 (fix/viewer-polish-1, 0f8e4f9)

Verdict: FINDINGS. Lead lenses: side effects of inert, focus return and the Esc warning; whether
the test fails with each fix reverted (it does: no inert, "Tab 11 left the deck"; no focus
return, "the focus did not return"; no warning, a timeout). The deck and the explainer sit
outside the inert region and the media viewer inside the deck.

## Findings

- R1-1 Material (QuestionDeck.tsx:239-245, message drawn only in the question footer): on the
  gate the first Esc with an unsaved note is swallowed silently and the second drops the note.
  Show the message on the gate; add a gate step to the test.
- R1-2 Minor (:226, :248): the armed warning outlives a mouse action that clears it; reset it
  where the message is cleared or on pointerdown.
- R1-3 Minor (Inbox.tsx:60, Report.tsx:159): the focus falls to `body` when the opener is gone
  (Start my morning after everything is answered); focus a stable fallback.
- R1-4 Minor (:359): the X button still drops a typed note without a word; route it through the
  same check.
- R1-5 Note: the focus assertion compares text, not the element.
- R1-6 Note: a saved note cleared to empty is not warned about; nothing is lost.

Checks: vite build and the new test on the head and three single-fix reverts; `node --test
tests/ui/*.test.ts` 8/8; the web typecheck; a throwaway probe for R1-1 to R1-4. No Viewer left
running.
