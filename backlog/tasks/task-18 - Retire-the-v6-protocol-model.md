---
id: TASK-18
title: Retire the v6 protocol model
status: Active
assignee:
  - '@claude'
created_date: '2026-09-26 11:40'
updated_date: '2026-09-26 12:48'
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
- [ ] #1 No file describes or implements the v6 protocol (cards, headers, bindings, board reading)
- [ ] #2 npm run check passes with the kept server and app
- [ ] #3 Superseded tasks are archived
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
