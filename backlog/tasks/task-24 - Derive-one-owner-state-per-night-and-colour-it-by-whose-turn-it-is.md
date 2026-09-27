---
id: TASK-24
title: Derive one owner state per night and colour it by whose turn it is
status: Active
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-27 22:59'
labels:
  - viewer
dependencies: []
priority: high
type: feature
ordinal: 24000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. Today a night shows two axes at once (how it ended as a coloured dot, what it needs as a pill and a tick), so a settled night that stopped early shows a tick beside an orange dot; the owner read it as something wrong (seen 2026-09-27 on a real Adopter's chip). Replace ownerSide/inMorning (src/types.ts) with one ordered state: Running, New, Needs answers, Ready to save, Waiting for an agent (Follow-up file with open items), Done; the same labels on cards, the report, the step track and History. A follow-up whose open items are all discuss is the owner's turn: it shows Needs answers (amber, a card), next step: work on the follow-up in a terminal session (this clause lands with TASK-29, which adds the discuss kind). Done means every item done, skipped or carried, or nothing was owed. Waiting for an agent is new: it reads follow-up item statuses and says so after two days. Colour: purple new, amber the owner's turn (the blocked outcome too), blue the agent's turn, green tick only when nothing is left, red only when something broke. How a night ended becomes a grey warning only when it cost work. Server and web app keep sharing one rule.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A night that stopped early with tasks never started, now settled, shows one green Done badge and a grey Stopped early: N tasks never started line, never an orange dot beside a tick; a night that stopped early at no cost shows no such line (screenshot)
- [ ] #2 A night whose follow-up has open items, not all discuss, shows Waiting for an agent in blue, and after two days says how long it has waited (test on real files, screenshot)
- [ ] #3 Every state maps to exactly one colour and label, used alike on cards, the report and History (tests on the shared rule)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. One ordered ownerState in src/types.ts shared by server and web, with OWNER_STATE labels/colours. 2. Summary carries follow_up_open and follow_up_at. 3. One StateBadge on chips, report and History; grey StoppedEarly line. 4. Colours: blue agent token, blocked outcome amber, failed red, partial blue. 5. Tests through the real overview route; screenshots on a scratch sample.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
State definitions (review R4): New = closed and unread; it wins over the states after it until opened. Needs answers = an open question (isOpenQuestionIn), or a follow-up whose open items are all discuss. Ready to save = today's needsHandOver with no open question. Running, New, Needs answers and Ready to save are cards; Waiting for an agent and Done sit in the strip. Stopped, not closed yet (open, session gone) shows as Running until recovery closes it. Red is not an owner state: it marks failed tasks and an unreadable night file inside the report and on the card's one-line result.

Review round 1 (reports in docs/work/TASK-24/reviews/01-*.md). Dispositions:
- design D1 / visual V1 Blocking (stopped-early line overflows on a phone): fixed, the line wraps inside its card; History at 390 is 390 wide (r2/02-history-390.png).
- code M1 Material (all-waiting Morning never seen): fixed and shot (r2-waiting/); the chip row now reads 'N waiting for you', 'All caught up' with a night open, else 'In progress', so the heading never doubles the caught-up card (also design D3, visual V3).
- code m1 Minor (unreadable night file differs between chip and History): fixed, one NightBadge for chips and History shows red 'Cannot be read'; the first night opened skips unreadable ones.
- code m2 Minor (unreadable follow-up shows as Waiting): kept deliberately; a follow-up that exists but cannot be read still blocks a second one, so an agent's turn is the honest state. The known v10 gap (Create follow-up returns 409 there) stays as the handoff records it.
- code m3 Minor (neverStarted condition untested): fixed, the table test asserts interrupted 2, complete 0, open 0.
- code m4 Minor: design.md note updated; the deck's task tag is amber (also visual V4).
- design D2 / visual V2 Note: a picked night scrolls to the top of its report.
- visual V5 Note: sample close times moved into the past.
- design D4, D5, visual nit, code N1: no change (D5 and the metrics row are older, report layout is TASK-26).
<!-- SECTION:NOTES:END -->
