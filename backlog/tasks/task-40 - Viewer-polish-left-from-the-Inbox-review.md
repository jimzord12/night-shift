---
id: TASK-40
title: Viewer polish left from the Inbox review
status: Queued
assignee: []
created_date: '2026-09-28 08:21'
updated_date: '2026-09-28 20:55'
labels:
  - viewer
dependencies: []
priority: low
ordinal: 40000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Notes deferred from TASK-25's review rounds 2 and 3 (docs/work/TASK-25/reviews/): History rows show 'unknown · unknown' for unmeasured metrics (design r2 D1; the report already hides them); the deck end screen says 'the night' after several (r2 D2) and says All clear when a night was left out of the deck (visual r3 V10); 'Save for the next agent' wraps to two lines on phone cards (r2 D3); kind pill alignment on phone report rows, done/skipped labels not pills, the compare 'before' label covering the image (r2 D4); confetti over the end text and drifting onto the next page (V9); a forced and an ordinary load of one night can race (code N3).
<!-- SECTION:DESCRIPTION:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
From TASK-28 visual review round 1, V4: a night whose follow-up items a running night took on still reads 'Waiting for an agent' in the Inbox and the report, and the saved list shows them as open without naming the running night.

From TASK-28 design review round 2: D3 three date styles on one gate screen (pick one); D5 the Report's save confirmation is a card inside a card.

From TASK-28 round 4: the deck counter and progress bar count questions held by a running night as done ('2 / 2' on the first screen); the Report's 'N open' above follow-up items that are all 'Taken by a running night'; a night whose items a running night holds still reads 'Waiting for an agent' (consider 'An agent is on it', an owner-state change per D24).

From TASK-28 round 5: the Report subtitle names only 'N held by a running night' when held and settled questions mix; name both.

From TASK-32 round 1: reduced motion still runs pop-in, the ring's glow and transitions; a text drag from the explainer onto its backdrop closes it; the page behind scrolls through the overlay.

From TASK-32 round 2: after a failed gate Save the focus returns behind an open explainer; the ring size follows a resize only on the next step; the ring's centre label is crowded at 390; the gate's Save wraps to two lines beside its ?; the Answer (note) and Report (file) icons look alike; the stopped-early ? sits 2 px low at 1440; step 2 of the explainer still scrolls on a phone.

From file shapes round 1: the media viewer's header wraps into blobs at 390 (buttons, close, caption dropped); a file deleted after its question shows a broken image instead of 'file not found'; with three files a question's options start below the fold.

At 768 px the header's version and proposals pill wrap to a second row under the tabs (seen in TASK-31 round 2 shots).
From file shapes round 5: while a night runs and has taken the only plannable item, the Report's next line says 'start night shift' although only a talk with the developer is left (onlyDiscussLeft ignores items a running night took); the state 'Needs answers' reads oddly when every question is answered and only a talk waits (a wording like 'Needs you').
From TASK-34 round 1: in the deck, Esc twice closes it and drops a typed note without a word; Tab can leave the deck for the page behind, and after Esc the focus does not return to the button that opened it; the question order can differ between two loads of the same data; the n / m counter counts answered questions but reads like a position.
From TASK-34 round 2: a question left with Not now in a night saved earlier is not named on the gate (it says only that the answers reach the next agent).
From TASK-34 round 4: the focus ring on the deck's cream footer buttons (Not now, Previous, Next) is the browser's thin outline, hard to see; give them an accent focus-visible ring.

From the TASK-48 visual review (V1): with long cards the gate's focused Save and the 'Saved for the next agent' line sit below the fold; name the saved night in the lead or show the saved line above the remaining cards.
<!-- SECTION:NOTES:END -->
