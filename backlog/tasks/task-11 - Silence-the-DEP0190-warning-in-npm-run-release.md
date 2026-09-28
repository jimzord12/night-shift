---
id: TASK-11
title: Silence the DEP0190 warning in npm run release
status: Done
assignee:
  - '@claude'
created_date: '2026-09-25 17:59'
updated_date: '2026-09-28 19:00'
labels:
  - release
dependencies: []
priority: low
type: bug
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`npm run release` prints Node's DEP0190 warning (npm spawned with `shell: true` on Windows); cosmetic.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 npm run release list prints no DEP0190 warning on Windows
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [x] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fixed in 95f24cc: npm runs through node with npm_execpath under npm run, else as one shell command line. Verified at the next release (v16), which runs npm three times.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
npm run release v16 ran without the DEP0190 warning (output: releasing, exported, ready; no deprecation line).
<!-- SECTION:FINAL_SUMMARY:END -->
