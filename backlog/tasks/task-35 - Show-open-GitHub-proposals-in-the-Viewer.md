---
id: TASK-35
title: Show open GitHub proposals in the Viewer
status: Review
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 12:07'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Review round 1 (docs/work/TASK-35/reviews/01-*): code FINDINGS, design FINDINGS. Dispositions: code F1 Material fixed: gh runs asynchronously for the count (one call, no separate auth check), one ask in flight, so /api/overview answered in 47 ms while a 3 s stand-in gh answered the count (was 6.1 s blocked). F2 fixed: the stand-in answers only the exact query. F3 fixed: sending feedback with gh clears the cache, and Reload asks again (?fresh). F4 fixed: status Review, one line in docs/design.md. F5 (the /api/gh check and sending are still synchronous) deferred: they run only when the developer acts. Design D1 Blocking fixed: GitHub mark plus an outward arrow at every width, 'on GitHub' in the label (.local/evidence/2026-09-28-proposals/r2/). D2 fixed: shots at the committed revision after the page settles. D3, D4 no action.
<!-- SECTION:NOTES:END -->
