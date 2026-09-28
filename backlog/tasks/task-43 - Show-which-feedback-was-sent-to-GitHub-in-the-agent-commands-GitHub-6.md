---
id: TASK-43
title: 'Show which feedback was sent to GitHub in the agent commands (GitHub #6)'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-28 10:24'
updated_date: '2026-09-28 10:37'
labels:
  - cli
dependencies: []
references:
  - 'https://github.com/jimzord12/night-shift/issues/6'
priority: medium
type: enhancement
ordinal: 43000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GitHub #6 (missing-block, from an Adopter's night 2026-09-28-a). Send to GitHub writes feedback[].sent = {at, via, url} into the night file, but no command shows it, so an agent cannot tell sent feedback from feedback awaiting the developer without reading the JSON (in practice an agent reported a sent item as awaiting). Show feedback state in night-shift status (for example 'Feedback: F1 sent (#4), F2 awaiting the developer'), optionally a feedback list command.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 night-shift status shows, per night with feedback, which items were sent (with the issue link) and which await the developer (test on real files)
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
