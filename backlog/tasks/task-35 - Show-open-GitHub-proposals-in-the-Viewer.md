---
id: TASK-35
title: Show open GitHub proposals in the Viewer
status: Queued
assignee: []
created_date: '2026-09-27 21:42'
labels:
  - viewer
dependencies: []
priority: medium
type: feature
ordinal: 35000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner request 2026-09-28 (D24). Feedback sent from the Viewer becomes GitHub issues labelled proposal, but nothing in the Viewer shows which are still open (issue #3 sat open unnoticed). A small header indicator with the count of open proposal issues on the Night Shift Repo, read through gh by the server (credentials stay with the tool), linking to the list; hidden when gh is missing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With one open proposal the header shows 1 and links to the issue list; with gh missing nothing shows and nothing breaks (screenshot, test)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
