---
id: TASK-7
title: Run npm run check in CI on every push to main
status: Done
assignee: []
created_date: '2026-09-25 17:59'
updated_date: '2026-09-28 11:43'
labels:
  - ci
dependencies: []
priority: medium
type: chore
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
No CI yet. Add a GitHub Actions workflow that runs `npm ci && npm run check` on push to main (Node 24).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A push to main shows a CI run by commit SHA that passes
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
CI: .github/workflows/check.yml runs npm ci and npm run check on Node 24 for pushes to main and pull requests. PR #7 passed (run 36415277430); the push to main at 7f4c70c passed (run 36415350465).
<!-- SECTION:FINAL_SUMMARY:END -->
