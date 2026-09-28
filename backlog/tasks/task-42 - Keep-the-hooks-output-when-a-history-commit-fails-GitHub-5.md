---
id: TASK-42
title: 'Keep the hook''s output when a history commit fails (GitHub #5)'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-28 10:24'
updated_date: '2026-09-28 10:37'
labels:
  - cli
  - git
dependencies: []
references:
  - 'https://github.com/jimzord12/night-shift/issues/5'
priority: medium
type: bug
ordinal: 42000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GitHub #5 (tool-bug, night 2026-09-28-a; the night feedback F1). When an Adopter's pre-commit hook fails the history commit, the tool reports only git's last line (for example 'husky - pre-commit script failed (code 1)'), so the cause (a failing test, a timeout) is lost. Keep the last lines of the hook's output in the error, and save the full output to a file in the night folder.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A history commit refused by a pre-commit hook reports the hook's last lines and the path of a file with its full output (test with a real git repository and a failing hook)
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
Shipped in v15. Review: code rounds 1 (FINDINGS: M1 hook output over 1 MiB) and 2 (PASS), docs/work/TASK-42/reviews/. npm run check passes (36 tests); tests use a real git repository with failing and noisy pre-commit hooks. Unverified: an Adopter's real hook on POSIX.
<!-- SECTION:FINAL_SUMMARY:END -->
