# Design review round 1: TASK-36 (feat/multi-select, f807d97)

Verdict: PASS. At a glance the question takes several answers and shows which two the agent
wants to keep; it looks like the rest of the deck. Images: the author's four shots and fresh
shots at f807d97 (full deck, none ticked, let's discuss, a tick after let's discuss, "use it",
the one-choice neighbour, saved as none and reopened, the Next night tab and the report), kept
privately in the evidence folder.

## Findings

- D1 Note: on phone, the "Your answer" line disappears when nothing is ticked
  (QuestionDeck.tsx:472), although Save records "None of them". Show it for an empty multiple
  choice too.
- D2 Note: the locked answered state was not seen (no scenario reaches it); a locked "None of
  them" would fade every row with no lock icon, the banner above explaining it.
- D3 Nit: the Next night tab repeats a task-less question as title and body; predates this change.

## What passes

Square tick boxes against the round radios of the one-choice question, "Choose all that apply",
a ✦ on every recommended row and "Recommended: JSON, Plain text"; same card, accent, number
hints, moon buttons and recommendation strip; let's discuss keeps its round marker and clears
the ticks, and a tick clears it; nothing clipped at 390 px; none ticked, all ticked, reopened
after saving and "use it" all correct; honest sandbox data.
