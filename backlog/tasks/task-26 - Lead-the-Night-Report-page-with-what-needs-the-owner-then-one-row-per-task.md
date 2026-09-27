---
id: TASK-26
title: 'Lead the Night Report page with what needs the owner, then one row per task'
status: Queued
assignee: []
created_date: '2026-09-27 21:42'
updated_date: '2026-09-27 21:51'
labels:
  - viewer
  - skills
dependencies:
  - TASK-24
priority: high
type: feature
ordinal: 26000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. The report opens on the agent's summary paragraph (a wall of text the owner marked BAD), six outcome tiles mostly showing 0, and a full card for the question count. The owner liked the follow-up card's one-row-per-item list. New order: header strip; What needs you (questions as a compact row with a small ring, and the save for the next agent step); What happened as one row per task (outcome icon, title, one-line result; opening a row keeps today's drawer). Outcome counts only non-zero, on one line. The summary becomes a one-sentence headline: a check the tool makes when a night is closed (not a tightened maxLength in night@1, so older night files stay valid) and a skill rule, so this is a file-shape change (update the owner's Adopters in the same change, CHANGELOG).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The report shows What needs you above What happened, tasks as rows, and only non-zero outcome counts (screenshot of a sample night)
- [ ] #2 The tool refuses a summary over the headline limit with a message that says so, and the skill tells the agent to write one sentence (test)
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
D24: the three file-shape changes (TASK-26 summary headline, TASK-29 discuss kind, TASK-30 file references) land together as one versioned change under the AGENTS.md rule; TASK-29 carries the version change and this task ships in the same release. The summary limit applies to new nights only, so older night files stay valid.

Until TASK-28 lands, What needs you shows today's Create follow-up button.
<!-- SECTION:NOTES:END -->
