---
id: TASK-31
title: Add Start my morning and a time estimate to the Inbox
status: Done
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 13:19'
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
- [x] #1 With open questions in two repositories, Start my morning walks through all of them in one deck and ends on both gates (video)
- [x] #2 The estimate counts questions and saves correctly for the sample nights (test)
- [x] #3 The Questions tab is gone; the navigation shows Inbox and History only (screenshot)
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
2026-09-28: Start my morning (one deck across every open question) and the numbers on top of the Inbox shipped with TASK-25 (D27), and the Questions tab is gone. Still here: the time estimate, and ending the run on each repository's save gate (needs TASK-28).

Acceptance #3 is superseded: D26 and D27 make the navigation Inbox, Next night and History.

Estimate built on feat/estimate: morningEstimate() in src/types.ts (questions walked; saves = closed unsaved nights among them; about 1 min a question + 30 s a save, rounded up), shown on Start my morning. The run ending on each repository's gate shipped with TASK-28. Evidence: .local/evidence/2026-09-28-estimate/inbox-{1440,390}.png; test in tests/server.test.ts (3 questions, 1 save, 4 min from real nights).

Review round 1 (docs/work/TASK-31/reviews/01-*): code FINDINGS, design FINDINGS. Dispositions: code M1 fixed: the test adds a closed night with only unfinished work (ready to save, never walked) and a 2-question/1-save case that separates the half-minute rounding. m1: merge order handled: feat/save-gate (the gate) merges to main before this branch; the earlier note meant 'built on feat/save-gate', not yet integrated. N1 no action; N2 recorded for TASK-28's owner (the estimate is the more accurate side). Design D1 Blocking fixed: the button stacks until lg and the title never wraps (checked at 320, 390, 768, 1024, 1440: .local/evidence/2026-09-28-estimate/r2/). D2 fixed: the time takes its own line when stacked. D3 fixed with D1. D4, D5 no action.

Review round 2 (02-*): code FINDINGS, design PASS. Dispositions: code M1 fixed: a case with two saves (2 questions, 2 saves, 3 min; a full minute a save gives 4, none gives 2) and the comment corrected. N1, N2 no action. N3 (the reviewer's stray scratch copies in the main checkout) removed, the junction as a link. Design D2 fixed: the title stays on one line only when ready; 'Getting the questions…' may wrap. D4 no action. main merged in (TASK-28 and TASK-32 now there).

Review round 3 (03-code-reviewer.md): PASS. m1 fixed: the loading state seen at 320 and 1440 (.local/evidence/2026-09-28-estimate/r3/loading-*.png: it wraps inside the button, disabled, no sideways scroll). N1 (a third of a minute would also pass) no action: the figure says 'about'; N2, N3 no action. Final: morningEstimate in src/types.ts, shown on Start my morning; the run ends on each repository's gate (TASK-28, on main). AC #3 superseded (D26, D27).
<!-- SECTION:NOTES:END -->
