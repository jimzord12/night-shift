---
id: TASK-25
title: Show Night Report cards in an Inbox with one next-step button each
status: Active
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 07:53'
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
- [ ] #2 A night saved for the next agent stays visible in the strip until it reaches Done (test on real files, screenshot)
- [ ] #3 The navigation is Inbox, Next night and History: Trends and Questions are gone, Start my morning and the numbers replace Questions (D26, D27) (screenshot)
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

Review round 1 (docs/work/TASK-25/reviews/01-*.md; also covers TASK-26 and the shipped part of TASK-31): code FINDINGS, design FINDINGS, visual FINDINGS. Dispositions:
- design D1 / code F1 / visual V1 (Inbox 380 wide at 360): fixed; the grid column may shrink and the step button wraps; scrollWidth 360 (inbox-r3/log.txt).
- design D2 Blocking (saved-item titles one word per line, overlap at 360): fixed; the kind pill wraps under the title. D3 (task rows): pills go under the line on a phone.
- code F2 (the questions number opens a partial deck): only clickable once every question is loaded. F3 (a failed load holds Start my morning back): failed loads are left out and not retried in a loop. F4 / visual V3 (the banner outlives its night page): leaving the failed night clears it. F5: TASK-25 acceptance #2 rewritten to D26 and D27; TASK-31 noted.
- visual V2 (deck end screen in the old words): now speaks of saving for the next agent and goes back to the Inbox. V5 / code N1 (duplicate fetches): in-flight and failed loads are remembered. V6 (cramped save row): roomier, wraps.
- design D4 (unknown metrics): the report shows only measured duration, cost and sub-agents. D5 (tight numbers at 360): smaller labels on a phone. D6 (tall pill): Start my morning is a rounded block on a phone. code N4: the from-follow-up pill is back on task rows. N6: an empty task list says so. N8: a malformed address falls back to the Inbox.
- Not changed: visual V4 / code N11 (an unreadable night leaves the strip once opened: the TASK-24 rule, reviewed in four rounds; History keeps it red); code N2 (deck order), N3 (History highlight), N5 (feedback heading), N7 (a night newer than the load reads as not in the list; Reload fixes it), N9 (dark backing behind transparent images), N10 (Back scrolls to top); design D7.
<!-- SECTION:NOTES:END -->
