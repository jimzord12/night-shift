---
id: TASK-2
title: Write and resolve Questions with night-shift ask and resolve
status: Queued
assignee: []
created_date: '2026-09-25 17:59'
labels:
  - cli
dependencies: []
priority: high
type: feature
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`night-shift ask <project> --kind one --question …` picks the next id for the shift, writes the file and validates it; `night-shift resolve <project> <id> --into <url>` fills `resolved` for the asker.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ask writes a schema-valid question file with the next free id for the shift
- [ ] #2 resolve fills resolved and the app shows the Question as done
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
