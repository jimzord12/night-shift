# Visual review round 3: TASK-40 batch 1 (ec9ade3)

Verdict: PASS. Walked on a clean build of ec9ade3, the `morning` sandbox with a video and a PDF
added to Q1 in the reviewer's copy, at 1440 and 390. Screenshots kept privately.

Works at both widths: note → X, X (warns on screen without naming Esc, then leaves, focus back);
the gate's leave button twice and Enter/Space on it; S then Enter, Enter on an "All clear" gate;
the media viewer from a question (video, PDF, picture) and from the report drawer (picture, PDF):
Tab stays in, a click on the picture toggles its size and never closes anything, Enter presses
nothing underneath, Esc closes only the viewer and returns the focus, the backdrop closes it;
multiple choice with Space and Enter; Tab never leaves the deck; accent focus ring; no sideways
scroll; no page or console errors (apart from headless Chromium's PDF `net::ERR_ABORTED`).

## Findings

- V1 Note: a key while the focus is on X or the leave button keeps the warning (same as R3-1).
- V2 Note: a click on the picture moves the focus behind the viewer; `tabIndex={-1}` on the root.
- V3 Note: earlier notes still present (viewer header at 390, focus on the page after S on the
  gate, the drawer's focus after Esc).
