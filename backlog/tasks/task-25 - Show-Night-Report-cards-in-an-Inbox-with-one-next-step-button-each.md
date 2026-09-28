---
id: TASK-25
title: Show Night Report cards in an Inbox with one next-step button each
status: Active
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 07:39'
labels:
  - viewer
dependencies:
  - TASK-24
priority: high
type: feature
ordinal: 25000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. Morning has no hierarchy: nights are a thin chip row and the first night opens in full below, so with three repositories the owner cannot see at a glance which reports need them. Rename Morning to Inbox; one Night Report card per night needing the owner (repository, date, state badge, one-line result, one button with the next step, for example Open report, Answer N questions, Save for the next agent, or a phrase to copy such as work on the follow-up). No night opens until picked. Settled and Waiting-for-an-agent nights drop to a slim strip and stay visible (the D22 no-vanish rule kept). The Trends tab goes; the Questions tab goes with TASK-31, once Start my morning replaces it. Laptop first, three cards across; phone one per row.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With nights in three repositories, the Inbox shows three cards, each with its state and one next-step button, and no report opened below (screenshot at laptop and phone width)
- [ ] #2 The Trends tab is gone from the navigation; the Questions tab stays until TASK-31 replaces it (screenshot)
- [ ] #3 A night saved for the next agent stays visible in the strip until it reaches Done (test on real files, screenshot)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Strip rule (review R4): a night that reaches Done stays in the strip until the next reload (D22's fixed list); a Waiting for an agent night stays in it across reloads until it reaches Done.
<!-- SECTION:NOTES:END -->
