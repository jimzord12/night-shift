---
id: TASK-36
title: 'Idea: multi-select questions (GitHub #3)'
status: Active
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-29 21:57'
labels:
  - cli
  - skills
  - viewer
dependencies: []
references:
  - 'https://github.com/jimzord12/night-shift/issues/3'
priority: low
type: feature
ordinal: 36000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Feedback from a real Adopter's night, sent by the owner as issue #3: keep/drop questions are naturally multi-select (keep A and B, drop C), but ask takes one recommended option, so the agent recommended one and left the rest to a note. Proposal: a multiple flag with a recommended list. Touches the file shapes and the question deck, like the D24 question tasks. Discuss with the owner before implementing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The owner has decided whether and how to build it
- [ ] #2 ask takes multiple: true with a recommended list (ids or labels, [] for none); a single-choice question refuses a list and a list needs multiple (tested)
- [ ] #3 The answer API saves a list of distinct options on a multiple-choice question and refuses anything else; the follow-up item names every chosen option (tested)
- [ ] #4 The deck shows tick boxes with the recommended set ticked; click, number keys and Enter on an option tick or untick; Save keeps the list (browser test; screenshots at laptop and phone width)
- [ ] #5 night@4 (D34): a night started by an older release refuses a multiple-choice question; older night files still read
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
2026-09-29: the owner said yes: build it.
<!-- SECTION:NOTES:END -->
