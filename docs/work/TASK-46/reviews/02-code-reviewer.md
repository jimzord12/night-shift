# Review round 2: TASK-46

Snapshot: `95ea2e8` (base `b273f6f`), taken with `git archive` into a scratch folder and tested there. The worktree `night-shift.worktrees/ci` picked up uncommitted edits while I was reviewing (skills, docs, Report.tsx, Views.tsx, and new files `02-context-reviewer.md` and `02-design-reviewer.md`). I did not review those edits. My first `npm run check` ran in that dirty tree and failed in the shapes skill-text test, so I discarded it.

Lead lenses: (1) data flow across the follow-up chain; (2) tests that would pass with the feature broken, and wiring of the Viewer's decision flow.

Coverage:
1. Wiring: the paths from the Inbox, Start my morning, the Report rows, the drawer and the Gate all reach the deck and `/decision`. The round-1 V3 fix (decision rows open a deck of decisions only) is wired at App.tsx:278.
2. Correctness: the chain A→B→C holds (probe). The only defect is M1.
3. Integrity: `followDecision` locks correctly when an item was carried, when a night skipped it, and while a night is running (probe). A carried copy leaves out `agent_decision`, so a night's own disagreement cannot collide with it. Verified.
4. Contracts: @3 is written, and older files still read. A @2 night file that holds decisions is reported, and `decide` refuses a @2 night.
5. Tests: the round-1 M1, M2, M3, m1 and m2 fixes hold, and the mutants for M2 and M3 are killed. One new mutant survives (m1 below).
6. Failure handling: fine.
7. Simplicity: fine.
8. Docs and task: acceptance criterion #3 is not met (M2).

## Findings

### M1 Material: a note written under "Fine, keep it" reaches no agent, although the card calls it "A note for the agent"
Anchor: web/src/QuestionDeck.tsx:433 and :437, src/followup.ts:60, src/followup.ts:165-170
- **Scenario:** the owner keeps a decision, clicks "+ add a note" and types "Fine, but ask me before adding a dependency", then saves.
- **Expected:** the note reaches the next agent, or the card does not invite one.
- **Actual (probe P1):** the server stores `note` with `review: 'ok'`. But `buildFollowUp` and `followDecision` only turn a `disagree` into an item, so the follow-up is `[unfinished]` with no note. The DecisionRow on the Report (Report.tsx:260) shows a note only for a disagreement, so this note is visible nowhere except back in the deck.
- **Impact:** an instruction from the owner is dropped without a word. This is the same class as round-1 M2.
- **Smallest fix:** on a decision card, offer the note only for "I disagree", and have the server drop the note when the review is `ok`. Alternatively, say plainly that it is a private note.

### M2 Material: acceptance criterion #3 is not met (day skill and test)
Anchor: skills/do-night-shift-follow-up/SKILL.md:39-41; tests/shapes.test.ts:211-217
- **Scenario:** criterion #3 reads "The night and day skills tell the agent to record every decision taken on the owner's behalf (skill text, test)".
- **Actual:** the day skill only explains how to read a `disagreed` item. It says nothing about recording decisions (and `decide` needs an open night). No test checks the skill text for `decide`.
- **Smallest fix:** add one assertion on the night skill's `{{cli}} decide` instruction. Then either add the day-skill text or amend criterion #3 with the reason: a day session is attended, and `decide` needs a night.

### m1 Minor: the `left` carried on a disagreement is untested
Anchor: src/followup.ts:43 (`...extra`)
When a carried disagreement is the task's first earlier item, it holds the only record of the work left. I removed `...extra` from the disagreed branch in a mutant and the suite still passed 68/68 (mut1.log). Assert `left` in decisions.test.ts:137.

### m2 Minor: the decision count in the desktop notification is untested
Anchor: src/notify.ts:306-308. tests/notify.test.ts covers only questions.

### Notes
- Probe P2: when a task takes an `unfinished` item and a `disagreed` item together and ends partial, the next follow-up holds only a `disagreed` item, with the unfinished work in its `left`. The Report's "Saved for the next agent" row does not render `left`. This follows the existing pattern for decisions carried from earlier nights, so it is a design choice, not a regression.
- The Viewer and the tool both read, change and write the night file, so one can overwrite the other's write. This existed before this change (round-1 Note).
- Criterion #1 ("on its task"): the task pill and drawer are covered only by screenshots, not by the UI test.

## Checks rerun
- `npm run check` on the snapshot copy: exit 0; 68 tests, 68 pass; the build passed. Log: scratchpad/t46r2/check-snap.log.
- `npm run test:ui` on the snapshot copy: exit 0; 4 tests, 4 pass. Log: ui-snap.log.
- Probe `snap/tests/probe-r2.ts` (real git, files and server): confirms M1. The chain A→B→C keeps the decision and the note, and a night's own disagreement is kept apart from a carried one. A review is refused once its item was carried or skipped by a night. Log: probe.log.
- Mutants on the snapshot copy: mut1 (drop `left` on a carried disagreement) survives 68/68. mut2 (`takenBack` always false) is killed, 67/68.

Every path above is under `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t46r2\`.

## Evidence inspected
- The diff `b273f6f..95ea2e8` for src, schemas, web/src, tests and skills, plus D31 and the design.md and glossary edits.
- Full reads of followup.ts, server.ts (the routes), the helpers in types.ts, QuestionDeck.tsx, Gate.tsx, and the deck wiring in App.tsx.
- The round-1 reports and the dispositions in the task notes.

## Limitations
I did not look at the screenshots (that is the visual and design reviewers' lane), and I did not run mutants on the Viewer. The uncommitted worktree edits made during my review are not covered by this report.

## Verdict: FINDINGS
