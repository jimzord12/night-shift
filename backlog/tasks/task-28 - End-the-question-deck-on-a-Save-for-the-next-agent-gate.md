---
id: TASK-28
title: End the question deck on a Save for the next agent gate
status: Review
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 12:22'
labels:
  - viewer
dependencies:
  - TASK-24
priority: high
type: feature
ordinal: 28000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. After the last answer nothing happens; Create follow-up sits in a side card, and the owner forgot what hand-over means (nothing runs until they start an agent). The deck's last screen lists the answers and the unfinished tasks with one button, Save for the next agent, which creates the Follow-up file. A confirmation says nothing runs yet and gives the phrase to copy: start night shift, or work on the follow-up by day, in the named repository. Until an agent picks the work up, a changed answer rewrites the follow-up; after that it is locked. Picked up means a started night's plan links the item (a task with follow_up, or skipped_follow_ups) or the item has left open; confirm this signal is enough while building.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Answering the last question lands on the gate; pressing it creates the follow-up and shows the confirmation with a working copy button (video)
- [ ] #2 Editing an answer after saving, before any agent picked it up, updates the follow-up file (test on real files)
- [ ] #3 Once an agent has picked an item up, its answer is locked with a line saying why (test on real files, screenshot)
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
Review round 1 (docs/work/TASK-28/reviews/01-*.md): code FINDINGS (M1, M2), design FINDINGS (D1 Blocking), visual FINDINGS (V1 Blocking). Dispositions:
- code M1 (All clear while a night in the deck still runs): fixed; the gate names running nights ('Answers kept… Still running: crm') and is never clear while one runs.
- code M2 / visual V1 (Enter on the gate closes without saving): fixed; the first Save is focused, Enter presses it, and Enter leaves only when nothing is left to save.
- design D1 (the locked question does not look locked): fixed; a lock box with a sentence and the night's date, unchosen options dimmed with a not-allowed cursor, a lock icon on the chosen one.
- code m3 (409 leaves a stale card): the gate reloads the night on a 409. m4: one exported unfinishedList. m5: saved-now state kept by the deck. m6: the report's Save shows the same confirmation. N1: night dates next to repository names.
- design D2: the subtitle says 'Saved. Nothing runs until you start an agent.' D3: the folder has its own Copy button. D4: phrases do not wrap. D6: shorter lead. D5 (two meanings of Save): not changed; TASK-34 (keyboard) revisits the deck's buttons.
- visual V2 (Enter on a locked question): moves on. V3: confetti only when this deck saved something; a night an agent is working on is named plainly. V6: the lock line uses the date; the report's save row drops 'Answer what you can first' when all are answered.
- visual V4 (outside): added to TASK-40. V5 (a 409 on the first answer after the Meter writes metrics): filed as a bug task.
Evidence: .local/evidence/2026-09-28-save-gate/r5 (keys.mjs: Enter-only walk, the running night; lock-390.png).

Review round 2 (docs/work/TASK-28/reviews/02-*): code PASS; design FINDINGS; visual FINDINGS. Dispositions: m1 fixed (a failed Save shows its error instead of hanging); m2 fixed (a 409 on the Report's Save reloads the night); m3 fixed (says 'reach the next agent' only while follow-up items are open); m4 fixed (focus moves to the next Save card). D1/V1 Blocking fixed: the phrase wraps with non-breaking hyphens beside Copy; checked at 360 (.local/evidence/2026-09-28-save-gate/r6/360). D2 fixed (the gate scrolls to top when its heading changes). D3 and D5 deferred to TASK-40 (polish). D4 fixed (zero counts dropped). V2 fixed: the deck takes focus on open and Enter ignores buttons behind it. V3 fixed in the same change as the celebrated state. V4 fixed: 'Esc closes' hint on Answers kept. V5 fixed: lock text says 'has taken this on'.

Review round 3 (03-*): code FINDINGS (M1 evidence only), design PASS, visual FINDINGS. Dispositions: code M1 closed by the design reviewer's report-confirmation shots at 360/390 (.local/evidence/2026-09-28-design-gate-r3/rep/). m1 fixed (a failed Save refocuses its button). m2 fixed (the report's error hides once the night shows saved). m3 fixed (test: a skipped item is taken, locked, refused, and not counted open). N1 fixed (design.md wording; gate line for a night that took work on). Visual V1 Blocking fixed: isOpenQuestionIn takes the night's taken items, so a question held by a running night is not counted in the Inbox, cards, Report or deck, shows no recommendation as its answer, and the Report says 'Nothing waiting for you' with the follow-up items marked 'Taken by a running night'. V2 Blocking fixed: the gate's button says 'Back to the report' when the deck was opened from a report (it returns there). V3 resolved by V1. V4 nits: the two-line Save button at 390 left as is (reads fine per design r3 D4); U+2011 hand-selection kept (Copy gives '-'). Evidence: .local/evidence/2026-09-28-save-gate/r7/.
<!-- SECTION:NOTES:END -->
