---
id: TASK-31
title: Add Start my morning and a time estimate to the Inbox
status: Review
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 12:33'
labels:
  - viewer
dependencies:
  - TASK-25
  - TASK-28
priority: medium
type: feature
ordinal: 31000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24; replaces the Questions tab. On top of the Inbox, an estimate (about 4 minutes: 3 questions, 2 saves) and Start my morning: one run through every open question across repositories, ending on each repository's Save for the next agent gate.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With open questions in two repositories, Start my morning walks through all of them in one deck and ends on both gates (video)
- [ ] #2 The estimate counts questions and saves correctly for the sample nights (test)
- [ ] #3 The Questions tab is gone; the navigation shows Inbox and History only (screenshot)
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
2026-09-28: Start my morning (one deck across every open question) and the numbers on top of the Inbox shipped with TASK-25 (D27), and the Questions tab is gone. Still here: the time estimate, and ending the run on each repository's save gate (needs TASK-28).

Acceptance #3 is superseded: D26 and D27 make the navigation Inbox, Next night and History.

Estimate built on feat/estimate: morningEstimate() in src/types.ts (questions walked; saves = closed unsaved nights among them; about 1 min a question + 30 s a save, rounded up), shown on Start my morning. The run ending on each repository's gate shipped with TASK-28. Evidence: .local/evidence/2026-09-28-estimate/inbox-{1440,390}.png; test in tests/server.test.ts (3 questions, 1 save, 4 min from real nights).
<!-- SECTION:NOTES:END -->
