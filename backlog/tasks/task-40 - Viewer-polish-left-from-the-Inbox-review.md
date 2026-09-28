---
id: TASK-40
title: Viewer polish left from the Inbox review
status: Queued
assignee: []
created_date: '2026-09-28 08:21'
updated_date: '2026-09-28 13:10'
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

From TASK-32 round 1: reduced motion still runs pop-in, the ring's glow and transitions; a text drag from the explainer onto its backdrop closes it; the page behind scrolls through the overlay.

From TASK-32 round 2: after a failed gate Save the focus returns behind an open explainer; the ring size follows a resize only on the next step; the ring's centre label is crowded at 390; the gate's Save wraps to two lines beside its ?; the Answer (note) and Report (file) icons look alike; the stopped-early ? sits 2 px low at 1440; step 2 of the explainer still scrolls on a phone.
<!-- SECTION:NOTES:END -->
