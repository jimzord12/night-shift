---
id: TASK-49.3
title: 'Module 3: a sandbox kit of named scenarios'
status: Active
assignee:
  - '@claude'
created_date: '2026-09-29 08:36'
updated_date: '2026-09-29 20:14'
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
