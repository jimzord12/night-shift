---
id: TASK-36
title: 'Idea: multi-select questions (GitHub #3)'
status: Active
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-29 22:29'
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
- [x] #2 ask takes multiple: true with a recommended list (ids or labels, [] for none); a single-choice question refuses a list and a list needs multiple (tested)
- [x] #3 The answer API saves a list of distinct options on a multiple-choice question and refuses anything else; the follow-up item names every chosen option (tested)
- [x] #4 The deck shows tick boxes with the recommended set ticked; click, number keys and Space on an option tick or untick; Save or Enter keeps the list (browser test; screenshots at laptop and phone width)
- [x] #5 night@4 (D34): a night started by an older release refuses a multiple-choice question; older night files still read
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [x] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-29: the owner said yes: build it.

Review round 1 (docs/work/TASK-36/reviews/01-*): code FINDINGS (F1 Enter after a tick unticked it: Enter now saves on a multiple choice and Space ticks, the browser test covers click then Enter and Space; F2 phone footer says None of them; F3 comment), visual FINDINGS (V1 the same Enter bug, V2 the footer; V3: the button reads 'Save: none' with nothing ticked), design PASS (D1 = F2), context FINDINGS (design's answer definition, the deck description, a wrap, a wording tip in the skill: fixed). Left as is: let's discuss then an option starts from an empty set ('use it' restores it); night@4 for every new night (D24 versioning); the Next night tab repeating a question (predates this change).

Review round 2 (docs/work/TASK-36/reviews/02-*): code PASS (R2-1 AC and comment say Space; R2-2 wraps: fixed), visual PASS (every key path checked in night.json at 1440 and 390). Evidence: screenshots at laptop and phone width, looked at by the author and two reviewers.
<!-- SECTION:NOTES:END -->
