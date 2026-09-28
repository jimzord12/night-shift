---
id: TASK-46
title: Make the decisions an agent took on the owner's behalf first-class
status: Active
assignee: []
created_date: '2026-09-28 13:47'
updated_date: '2026-09-28 19:12'
labels:
  - viewer
dependencies: []
priority: high
type: feature
ordinal: 45000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner request 2026-09-28. When an agent works unattended it makes calls the owner would otherwise make (a default filled in, one option chosen over another, a step it would have asked about). Today these hide in evidence notes and summaries, so the owner cannot reliably see them when reviewing work. Make them a first-class part of the files and the Viewer:
- Files: a night records each decision taken on the owner's behalf as its own entry (what was decided, the options it weighed, why, which task it belongs to), written with the tool like a question (a new command, e.g. night-shift decide), so it is checked and cannot be skipped. File-shape change (versioning rule in AGENTS.md).
- Tasks: each task row and task drawer on the Night Report shows its decisions.
- Central hub: the Inbox (and the report's What needs you) surfaces them as their own item with a count, so the owner sees them before calling a night reviewed; the owner can mark each one seen, or turn it into a question for the next agent (disagree).
- Skills: the night and day skills require the agent to record every such decision; the follow-up carries a disagreed decision to the next agent.
Needs a design decision (D<n>) before building: where the owner marks seen or disagrees, and whether unseen decisions keep a night in the owner's turn.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A decision recorded by the tool appears on its task in the Night Report and as a counted item on the Inbox (test on real files, screenshot)
- [ ] #2 The owner can mark a decision seen or disagree; a disagreement reaches the next agent through the follow-up (test on real files)
- [ ] #3 The night and day skills tell the agent to record every decision taken on the owner's behalf (skill text, test)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
