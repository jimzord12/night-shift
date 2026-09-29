# Visual review round 2: TASK-36 (feat/multi-select, f09bf27)

Verdict: PASS. Viewer dev · f09bf27 on fresh `morning` sandboxes per width and `follow-up`; every
save checked in night.json. Screenshots kept privately in the evidence folder.

Round-1 fixes verified at 1440: click then Enter saves `["a","b","c"]`; `2` then Enter saves
`["a","c"]`; Space ticks and unticks the focused option and Enter saves `["a","b"]`; untick all:
"Save: none", Enter saves `[]`; let's discuss with no note refused; Ctrl+Enter with a note, then a
tick and Enter saves `["c"]` with the note kept; one-choice questions unchanged. At 390: "Your
answer: None of them" and "Save: none", saved `[]`, the same after reopening; "Your answer: JSON,
XML"; let's discuss then a tick; a one-choice tap. The Next night tab reads "→ JSON, XML" at both
widths.

## Findings

- V1 Note: early screenshots caught a card mid-transition; not a defect.
- V2 Nit (predates this change): each follow-up item repeats the question under its title.

No sideways scrolling, nothing clipped, the footer covers no control; a clean console.
