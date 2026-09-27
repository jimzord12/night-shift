---
id: TASK-29
title: Let the owner answer a question with let's discuss
status: Queued
assignee: []
created_date: '2026-09-27 21:42'
updated_date: '2026-09-27 21:54'
labels:
  - viewer
  - skills
  - cli
dependencies:
  - TASK-24
priority: high
type: feature
ordinal: 29000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. The owner often does not understand a question or its options (for example: which logo direction do we keep?) and today can only pick, with the recommendation preselected and a hidden optional note, which invites rubber-stamping. Add a peer answer, I'm not sure, let's discuss, that needs a note. It is saved as a follow-up item of kind discuss: no unattended night acts on it; the day skill (do-night-shift-follow-up) raises it with the owner in the terminal first. The question's why shows up front in the deck. File-shape change to the night and follow-up files (update the owner's Adopters, CHANGELOG).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Choosing let's discuss without a note cannot be saved; with a note it saves and the follow-up carries a discuss item (test on real files, screenshot)
- [ ] #2 A night's plan may not work a discuss item as a task, and the day skill tells the agent to raise discuss items with the owner before anything else (test and skill text)
- [ ] #3 A follow-up whose open items are all discuss shows Needs answers, amber, as a card, with the next step work on the follow-up (test on real files, screenshot)
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
D24: the three file-shape changes (TASK-26 summary headline, TASK-29 discuss kind, TASK-30 file references) land together as one versioned change under the AGENTS.md rule. This task carries the version change (the new discuss kind and TASK-30's file references both break older readers; TASK-30 depends on this task); TASK-26 and TASK-30 ship in the same release. The summary limit applies to new nights only, so older night files stay valid.
<!-- SECTION:NOTES:END -->
