---
id: TASK-49.3
title: 'Module 3: a sandbox kit of named scenarios'
status: Active
assignee:
  - '@claude'
created_date: '2026-09-29 08:36'
updated_date: '2026-09-29 20:28'
labels:
  - enhancement
dependencies: []
parent_task_id: TASK-49
priority: high
ordinal: 51000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
npm run sandbox <scenario>: an isolated install folder it always sets itself, scenarios built through the real tool, a fresh Viewer build on a free port, its own processes tracked and stopped, one clean command outside .local. The UI tests (one install folder each) and reviewer briefs use the same scenarios; Playwright from the repository's own dependency.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 npm run sandbox <scenario> builds a named scenario through the tool's own code in an install folder it always sets itself and serves the freshly built Viewer on a free port; the real install and repositories are never touched (tested)
- [ ] #2 npm run sandbox stop and clean stop every Viewer the kit started and delete its folders; list and docs describe it; flags and stray words are refused (tested)
- [ ] #3 Scenarios cover the Viewer's states: empty, a full morning (every outcome, evidence block, question kind, decisions, feedback), two nights, running, interrupted, a saved follow-up, a second night that took items, an unreadable file
- [ ] #4 The UI tests and the reviewer briefs use the same scenarios; screenshots with Playwright from this repository's own dependency
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
Review round 1 (docs/work/TASK-49.3/reviews/). Code FINDINGS: F1 a port another Viewer holds was reported as a start and stop could kill a reused pid: the child exiting is a failure, and start, stop and shot accept only a Viewer that serves this sandbox's own repositories (tested with a taken port); F2 the second-night checks passed with it gutted: the UI test reads its own page for its own text, the API test picks it by id; F3 briefs give each reviewer its own NIGHT_SHIFT_SANDBOX and stop <scenario>; F4 clean removes only the kit's folders and keeps a home holding anything else (tested); N1 shot --out; N2 screenshots read from examples/ instead of copies; N3 names are plain words (stop ../x refused), clock times never in the future; the flags-on-every-verb, feedback-unpinned and pid notes accepted as they are. Context FINDINGS: M1 shot --out and briefs save evidence in .local/evidence; M2 the sample-repo Layout row; m1 stop <scenario>; m2/m3 the rewrapped line uses the term; N1 sample README points at the sandbox; N3 shots at 1440; N4 Chromium once.
<!-- SECTION:NOTES:END -->
