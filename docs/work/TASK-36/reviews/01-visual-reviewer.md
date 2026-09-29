# Visual review round 1: TASK-36 (feat/multi-select, f807d97)

Verdict: FINDINGS (V1 Blocking on f807d97; the uncommitted working tree fixes V1 and V2). Viewer
dev · f807d97 on the `morning`, `follow-up` and `second-night` sandboxes, then on a rebuild from
the working tree (Space ticks, Enter saves). Screenshots kept privately in the evidence folder.

Journeys at 1440 and 390: tick, untick, none of them, change it (file ends `[]`, then
`["a","c"]`); let's discuss with a note, then back to ticks (refused without a note; ticking drops
let's discuss and keeps the note as optional; file `["c"]` plus the note); the save screen and
report read "JSON, Plain text", the Next night tab "→ JSON, XML", second-night's skipped item is
off the tab and "skipped" in the report; a one-choice question unchanged (1 then Enter saves;
Tab to an option then Enter saves it).

## Findings

- V1 Blocking (f807d97): Enter reverses the last tick instead of saving, after a number key or a
  click. The working tree (Enter saves, Space ticks) fixes it: `2`, Space, Enter saved
  `["a","c"]`; click then Enter saved on phone. Commit it, with a test for the keys.
- V2 Note (f807d97): at 390 no "Your answer" line when nothing is ticked; the working tree shows
  "Your answer: None of them".
- V3 Note: on laptop nothing warns that Save with every box empty means keep none; label the
  button "Save: none of them" (optional).
- V4 Nit (predates this change): each follow-up item repeats the question.

No sideways scrolling, nothing clipped, a clean console (no errors, warnings or failed requests).
