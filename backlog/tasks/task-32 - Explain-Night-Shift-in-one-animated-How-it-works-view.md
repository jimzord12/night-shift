---
id: TASK-32
title: Explain Night Shift in one animated How it works view
status: Queued
assignee: []
created_date: '2026-09-27 21:42'
updated_date: '2026-09-27 21:49'
labels:
  - viewer
dependencies:
  - TASK-28
priority: medium
type: feature
ordinal: 32000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. The owner forgets the concepts between mornings (what a follow-up or hand-over is). One animated view of the whole loop: an agent works overnight, a Night Report appears, the owner answers, saves for the next agent, starts that agent, and the loop repeats. Shown on the first run (no nights) and behind a ? beside the few terms that need it: save for the next agent, the six outcomes, stopped early. No docs page.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With no nights the Viewer shows the explainer; the ? beside Save for the next agent opens it at that step (screenshot)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
