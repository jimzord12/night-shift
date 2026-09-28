---
id: TASK-37
title: >-
  Find out why an Adopter's pre-commit hook failed the history commit from Git
  Bash
status: Done
assignee:
  - '@claude'
created_date: '2026-09-27 21:55'
updated_date: '2026-09-28 07:09'
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
- [x] #1 The cause is known and either fixed or recorded as a limitation with a workaround
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Reproduced 2026-09-28 in a scratch clone of the testing repository (0012298, pnpm install --frozen-lockfile), running the tool's exact call (spawnSync git commit --only -- .night-shift/history, no shell) with the hook's full output captured.
- Git Bash, first (cold) run: husky ran lint-staged (nothing to do) then pnpm test: 2 of 751 failed. One was scripts/local-postgres/core.test.ts 'uses a synthetic local user distinct from Playwright fixtures', 'Test timed out in 5000ms' (a plain dynamic import, 7.4 s under full-suite load; suite 10.9 s).
- The same test alone from Git Bash: passes twice. Three more full hook runs from Git Bash: no timeout (suite 7.8-8.4 s).
- The other failure (local-mailbox 'rejects a mailbox path that could clear unrelated files') failed in both shells only because the scratch clone lives inside the temp folder, which that test treats as safe: an artefact of the scratch location, not of the real repository.
- pnpm resolves 12.4.2 (the repository's packageManager) in both shells; PATH for pnpm was not the cause.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Cause: the testing repository's pre-commit hook runs its whole suite (751 tests) on every commit, the tool's history commit included, and one test with a 5 s timeout is load-sensitive: it timed out on a cold first run. The shell was a coincidence: Git Bash passed on three later runs, and Night Shift calls git the same way from either shell. Not a Night Shift defect. Limitation, recorded: a night's history commit runs the Adopter's hooks, so a slow or flaky hook leaves the history uncommitted; the tool says 'git commit failed: husky - pre-commit script failed (code 1)' and the files stay on disk. Workaround: commit them later with git commit --only -- .night-shift/history (hooks run; never --no-verify), or the Adopter's hook skips its test run when only .night-shift/ is staged. Checks: repro script with full hook output, 4 Git Bash runs, 1 PowerShell run, the timing-out test alone twice. Unverified: whether the original 2026-09-28 failure in the real repository was the same cold-run timeout (its output was not captured); the tool's one-line failure message hides the hook's reason (a possible later improvement, not filed).
<!-- SECTION:FINAL_SUMMARY:END -->
