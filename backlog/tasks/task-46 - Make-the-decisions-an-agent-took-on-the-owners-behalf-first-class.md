---
id: TASK-46
title: Make the decisions an agent took on the owner's behalf first-class
status: Active
assignee: []
created_date: '2026-09-28 13:47'
updated_date: '2026-09-28 20:24'
labels:
  - viewer
dependencies: []
priority: high
type: feature
ordinal: 45000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner request 2026-09-28. When an agent works unattended it makes calls the owner would otherwise make (a default filled in, one option chosen over another, a step it would have asked about). Today these hide in evidence notes and summaries, so the owner cannot reliably see them when reviewing work. Make them a first-class part of the files and the Viewer:
- Files: a night records each decision taken on the owner's behalf as its own entry (what was decided, the options it weighed, why, which task it belongs to), written with the tool like a question (a new command, e.g. night-shift decide), so it is checked and cannot be skipped. File-shape change (versioning rule in AGENTS.md).
- Tasks: each task row and task drawer on the Night Report shows its decisions.
- Central hub: the Inbox (and the report's What needs you) surfaces them as their own item with a count, so the owner sees them before calling a night reviewed; the owner can mark each one seen, or turn it into a question for the next agent (disagree).
- Skills: the night and day skills require the agent to record every such decision; the follow-up carries a disagreed decision to the next agent.
Needs a design decision (D<n>) before building: where the owner marks seen or disagrees, and whether unseen decisions keep a night in the owner's turn.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A decision recorded by the tool appears on its task in the Night Report and as a counted item on the Inbox (test on real files, screenshot)
- [ ] #2 The owner can mark a decision seen or disagree; a disagreement reaches the next agent through the follow-up (test on real files)
- [ ] #3 The night skill tells the agent to record every decision taken on the owner's behalf, and the day skill how to redo a disagreed one (skill text, test). Amended 2026-09-28: a day session is attended and `decide` needs an open night, so the day skill tells the agent to ask the developer instead (skill text, test).
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
Review round 1 (dfb222a): design FINDINGS, code FINDINGS, visual FINDINGS (docs/work/TASK-46/reviews/01-*). Fixed in 07d4736: D1 ("N decisions to review"), D2 (no-break counts), D3/V4 (save row names review; gate shows the note), D4/V1 (saved disagreement shows decision and note), D6, D7, V2 (withdrawn label), V3 (decision rows open only decisions), M1 (exact locator), M2 (carried disagreements keep the note; test, mutant killed), M3 (all-done + disagreement test), m1 (NIGHT_SCHEMA; test), m2, m3, History counts decisions. D5: no change (order is the owner's choice, D31). D8: no action. V5 (gate Enter can save the next night) predates this task: filed separately.

Review round 2 (95ea2e8): design PASS, visual PASS, code FINDINGS (M1 a note kept with Fine reached no agent; M2 AC#3), context FINDINGS (4 Material doc gaps). Fixed: code M1 (deck offers a note only with I disagree; the server drops a note on ok; test, mutant killed), M2 (skill-text test for decide; AC#3 amended: the day session is attended and decide needs a night), m1 (left asserted), m2 (notification counts decisions, tested); context 1-4 (ask-or-decide split in the night skill; disagreed kind, Viewer screens in design.md; Needs answers in the glossary) and minors 5-10; design notes D1 (Review capitalised), D2 (Next night labels the decision); visual V7 (withdrawn note dimmed). V6: no change (the gate honestly lists the open question; saving stays the owner's call). Pre-existing notes (History New pill, phone card navigation) left.

Review round 3 (bdd05d5): design PASS; code FINDINGS (M1 AC#3 day half untested, m1 deck note fix untested); context FINDINGS (M1 ask-or-decide discriminator too narrow; minors 2-5; note 6). Fixed: ask when the task cannot go on or a wrong choice would be costly to undo, else decide and record (skill, D31); design.md overview rows and Inbox buttons; skill description; wraps; day skill tells the agent to ask the developer (text + test); UI test asserts no note under Fine (mutant killed). Code notes (hidden note saved on a quick switch; non-string note 500; file race) left: harmless or older.

Review round 4 (2f17f60): code PASS (notes N1-N3: CLI decide untested like ask/record; v16 refuses @3 files, CHANGELOG to say switch+reinstall+restart; asymmetric early-version check, harmless). Context FINDINGS: M1 docs/practices/task-flow.md still said never guess: fixed with the D31 rule; minors fixed (D31 scoped to a night, day asks; ask example names the costly-to-undo reason; day skill sentence moved to section 2 and phrased as an instruction; wraps; 'if the developer were here' in the skill and glossary).

Review round 5 (af12da5), the attended cap: context FINDINGS, M1 README.md still said 'asks instead of guessing' (and the Viewer bullet named no decisions). Fixed after the round, with the Explainer string (note 3) and the wrap drift (minor 2); .claude/skills copies refresh at release (note 4). Code PASS r4, design PASS r3, visual PASS r2. Unresolved at the cap: the round-5 fix is unreviewed; awaiting the owner's go for one more context round before merging.

Review round 6 (2005f23, one extra round the owner allowed): context PASS. Minor 1 (a short line in the night skill) fixed; note 2 checked: the Explainer at 390 wraps cleanly (.local/evidence/2026-09-28-decisions/r2/390-08-explainer.png). Gate passed: code r4, design r3, visual r2, context r6.
<!-- SECTION:NOTES:END -->
