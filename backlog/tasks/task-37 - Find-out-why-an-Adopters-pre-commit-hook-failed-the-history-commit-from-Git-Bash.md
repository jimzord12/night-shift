---
id: TASK-37
title: >-
  Find out why an Adopter's pre-commit hook failed the history commit from Git
  Bash
status: Queued
assignee: []
created_date: '2026-09-27 21:55'
labels:
  - triage
  - cli
dependencies: []
priority: low
type: spike
ordinal: 37000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Seen 2026-09-28: refreshing the testing repository's history through the tool's commitPath (node, started from Git Bash) failed with 'husky - pre-commit script failed (code 1)'; the same git commit --only from PowerShell passed (lint-staged, then 751 tests). A night's own history commit runs the same way, so a night could close with its history uncommitted. Unconfirmed cause (PATH for pnpm under Git Bash is the first guess). Next step: reproduce with the hook's output captured.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The cause is known and either fixed or recorded as a limitation with a workaround
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
