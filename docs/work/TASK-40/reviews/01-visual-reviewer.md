# Visual review round 1: TASK-40 batch 1 (fix/viewer-polish-1, 0f8e4f9)

Verdict: FINDINGS. Everything the batch set out to do works at 1440 and 390: Tab and Shift+Tab stay
in the deck; the explainer from the gate keeps its keys and returns the focus to the "?"; the Esc
sequence with a note warns, then closes, and the focus goes back to Start my morning; X returns the
focus to Start my morning or Start answering; the moon buttons show a 3 px accent ring. No
sideways scrolling; a clean console. Screenshots kept privately in the evidence folder.

## Findings

- V1 Blocking (predates this commit, breaks its rule): with the media viewer opened from inside
  the deck, the focus stays on the thumbnail and Tab walks the deck under the viewer; Enter on
  the hidden Not now skipped the question. Keep the keys in the viewer and return the focus to
  the thumbnail.
- V2 Note: X with a typed note drops it without a word.
- V3 Note: after the last save "Back to the Inbox" puts the focus on the page itself.
- V4 Nit: at 390 the warning pushes the note out of view.
- V5 Nit: Save, X, the leave button and the "?" keep the thin browser outline.
