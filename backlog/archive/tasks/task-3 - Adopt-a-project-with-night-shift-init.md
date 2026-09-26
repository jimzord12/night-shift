---
id: TASK-3
title: Adopt a project with night-shift init
status: Queued
assignee: []
created_date: '2026-09-25 17:59'
labels:
  - cli
dependencies: []
priority: high
type: feature
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`night-shift init <project>` writes `.night-shift/project.json` from prompts or flags (trello, backlog or file board), adds `.night-shift/` to `.gitignore`, copies the binding template to `docs/night-shift.md` and offers the practice files and agent templates.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Running init on an empty folder yields a project that passes night-shift check
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
