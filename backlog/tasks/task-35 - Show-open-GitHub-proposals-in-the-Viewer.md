---
id: TASK-35
title: Show open GitHub proposals in the Viewer
status: Done
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 12:13'
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
- [x] #1 With one open proposal the header shows 1 and links to the issue list; with gh missing nothing shows and nothing breaks (screenshot, test)
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
Review round 1 (docs/work/TASK-35/reviews/01-*): code FINDINGS, design FINDINGS. Dispositions: code F1 Material fixed: gh runs asynchronously for the count (one call, no separate auth check), one ask in flight, so /api/overview answered in 47 ms while a 3 s stand-in gh answered the count (was 6.1 s blocked). F2 fixed: the stand-in answers only the exact query. F3 fixed: sending feedback with gh clears the cache, and Reload asks again (?fresh). F4 fixed: status Review, one line in docs/design.md. F5 (the /api/gh check and sending are still synchronous) deferred: they run only when the developer acts. Design D1 Blocking fixed: GitHub mark plus an outward arrow at every width, 'on GitHub' in the label (.local/evidence/2026-09-28-proposals/r2/). D2 fixed: shots at the committed revision after the page settles. D3, D4 no action.

Review round 2 (02-*): code PASS, design PASS. Dispositions: M1 fixed (a spawn that throws resolves to no count; the ask clears in finally). M2 fixed: a test with a slow stand-in gh proves the overview answers first, the count is cached and ?fresh asks again. N2 fixed (a generation counter: an ask started before a send does not keep the old count). N1 no action: the pill refreshes on Reload or page load, which is enough for a count. N3 no action. Design D2-D4 no action. Final: npm run check 41 pass; screenshots .local/evidence/2026-09-28-proposals/r2 and the reviewers' folders. Unverified: the real gh against GitHub (stand-ins only).
<!-- SECTION:NOTES:END -->
