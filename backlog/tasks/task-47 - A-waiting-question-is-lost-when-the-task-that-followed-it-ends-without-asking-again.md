---
id: TASK-47
title: >-
  A waiting question is lost when the task that followed it ends without asking
  again
status: Active
assignee: []
created_date: '2026-09-28 14:04'
updated_date: '2026-09-28 18:42'
labels:
  - bug
dependencies: []
priority: medium
ordinal: 46000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in TASK-29 review round 3 (N1), present before that change. A follow-up item of kind waiting (a question the developer has not answered yet) can be planned by a night. If that task ends without asking the question again, buildFollowUp turns the item into carried and the Viewer then locks the question, so the developer can no longer answer it and the next agent never hears the question. Consequence: an open question silently disappears. Suggested fix: when a task that followed a waiting item ends without a new question, carry the waiting item forward as waiting (same question), and add a test.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A waiting item followed by a task that ends without a new question reaches the next follow-up as waiting, answerable in the Viewer
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
