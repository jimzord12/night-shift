---
id: TASK-10
title: Exercise the POSIX launcher
status: Done
assignee: []
created_date: '2026-09-25 17:59'
updated_date: '2026-09-28 11:46'
labels:
  - release
dependencies: []
priority: low
type: spike
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`~/.night-shift/bin/night-shift` was written but only the `.cmd` launcher was exercised (Windows).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The POSIX launcher starts the current release on Linux or macOS, or the defect is filed
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
The POSIX launcher runs in CI on ubuntu-latest (check.yml, step 'POSIX launcher starts the current release'): a release folder from the commit, launchers written by npm run release install-launchers, night-shift --version prints 'v1 · <sha>'; a pinned missing version fails with 'release v9 is not installed'. First run: PR #8, run passed.
<!-- SECTION:FINAL_SUMMARY:END -->
