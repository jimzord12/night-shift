---
id: TASK-45
title: Refuse cross-site POSTs to the Viewer's API
status: Queued
assignee: []
created_date: '2026-09-28 13:28'
labels:
  - triage
dependencies: []
priority: medium
type: spike
ordinal: 45000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Code review of file shapes v2 (docs/work/TASK-29/reviews/01-code-reviewer.md N2): the Viewer's POST routes (answer, reveal, follow-up, send) take no body check against another origin, so any web page open in the same browser could post to 127.0.0.1:<port>. The Host check stops DNS rebinding, not cross-site requests. Consequence: a hostile page could write an answer or open a file manager window. Suggested next step: require a same-origin header (Origin or Sec-Fetch-Site) on every POST and a test per route.
<!-- SECTION:DESCRIPTION:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
