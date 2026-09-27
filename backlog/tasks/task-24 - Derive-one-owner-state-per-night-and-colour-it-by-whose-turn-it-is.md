---
id: TASK-24
title: Derive one owner state per night and colour it by whose turn it is
status: Active
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-27 22:51'
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
<!-- SECTION:NOTES:END -->
