---
id: TASK-6
title: Print practices and templates with night-shift docs
status: Queued
assignee: []
created_date: '2026-09-25 17:59'
labels:
  - cli
dependencies: []
priority: low
type: enhancement
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`night-shift docs` prints only protocol, contract and binding. Allow `night-shift docs practices/<name>` and `templates/<name>`; the name check in src/cli.ts is `^[a-z-]+$`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 night-shift docs practices/git prints the git practice; unknown names still fail with a clear message
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
