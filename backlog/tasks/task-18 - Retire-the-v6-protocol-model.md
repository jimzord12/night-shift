---
id: TASK-18
title: Retire the v6 protocol model
status: Done
assignee:
  - '@claude'
created_date: '2026-09-26 11:40'
updated_date: '2026-09-26 14:15'
labels:
  - practices
dependencies: []
priority: high
type: chore
ordinal: 18000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D20 changed direction; nobody depends on v6 (the one earlier `Adopter` trial is removed). Delete the protocol, contract, binding, board adapters, parsers, queue and buffer screens, v6 schemas, demos and templates; trim the practices and the kept server and app code; archive superseded tasks. The approved keep/delete/trim list is in the session of 2026-09-26.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 No file describes or implements the v6 protocol (cards, headers, bindings, board reading)
- [x] #2 npm run check passes with the kept server and app
- [x] #3 Superseded tasks are archived
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [x] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
v6 retired: protocol, contract, binding, board adapters, parsers, Queue/buffer screens, templates, old schemas and demos deleted; practices trimmed; TASK-1,2,3,4,5,6,9,12,13,14,17 archived; the earlier Adopter trial's files were archived outside the repository. Checks: npm run check green (24 tests); four context-review rounds (R4 PASS) confirmed no agent-facing text describes v6 as current. Unverified: nothing known.
<!-- SECTION:FINAL_SUMMARY:END -->
