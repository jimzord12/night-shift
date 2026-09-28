# Review round 3: TASK-46

Snapshot: `b273f6f..bdd05d5` (the round-2 fixes are `95ea2e8..bdd05d5`). I exported it with `git archive bdd05d5` into scratchpad `t46r3/snap` and tested there. The worktree also has uncommitted edits that are not part of this snapshot (docs/decisions.md, docs/design.md, both SKILL.md files, and new 03-context and 03-design reports), so I did not review them.

Lead lenses: (1) the review write path end to end; (2) regression of the question flow from the shared deck changes.

Coverage:
1. Wiring: only the deck posts to `/decision` (api.ts:39, QuestionDeck.tsx:186). The Report rows, the drawer, Review/See decisions and Start my morning all reach it.
2. Correctness (lead 1): I drove the full cycle in a real browser (probe A). It is correct at every step:
   - Pressing D opens the note box with the "needed" placeholder and puts the cursor in it. After Esc and then 1, the note box is gone, and Enter saves `ok` with `note: null`.
   - Reopening a decision reviewed "Fine" shows no note box. D opens an empty one. Ctrl+Enter with no note gives the "needs a note" message and focuses the note. With a note it saves `disagree`.
   - Saving creates a `disagreed` item with the note. Switching to Fine skips it as taken back, and the night's note becomes null. Disagreeing again reopens the item with the new note.
   - The `was` and `baseHash` values refresh after each save, because App rebuilds the items from the returned detail.
3. Data integrity: server.ts:278 drops a note unless the review is `disagree`. followDecision's locks are unchanged since round 2, and I rechecked them.
4. Contracts: no change since round 2. The @3 files, the @2 reads and the `decide` refusal all still hold.
5. Tests: the round-2 fixes hold. There is a test for the `left` field on a carried disagreement (decisions.test.ts:139), for the notification count (notify.test.ts:48) and for the night skill's `decide` text (shapes.test.ts:216-218). Two gaps, M1 and m1 below.
6. Failure handling: fine. A save error shows in the deck, and a conflict (409) reloads the night.
7. Simplicity: the talk option (let's discuss / I disagree) and its keyboard handling are shared by questions and decisions. The one special case is the decision condition at QuestionDeck.tsx:429.
8. Docs and task: acceptance criterion #3 is still short on the day-skill side (M1). CHANGELOG is written at release time, so no entry is expected yet.

Lead 2 (regression): question cards are unaffected. Probe B picked "let's discuss", typed a note, pressed Esc and then 2. The note box stayed, now with the "(optional)" placeholder, and Enter saved `b` with the note. UI test 1 (deck.test.ts:38-48) covers a note given with an ordinary answer, and the keyboard tests pass.

## Findings

### M1 Material: acceptance criterion #3, the day-skill half has neither the text nor the test the amendment claims
Anchor: skills/do-night-shift-follow-up/SKILL.md:40-42; tests/shapes.test.ts:212-213
- **Scenario:** criterion #3 asks for the night skill's rule to record every decision **and** the day skill's instructions for redoing a disagreed one, both "(skill text, test)". The amendment adds "so the day skill asks instead".
- **Actual:** the day skill has the `disagreed` redo text. But no test checks it: the only day-skill assertion is about `discuss`. The day skill also says nothing about asking the developer instead of deciding for them; it only says to ask about `waiting` items.
- **Smallest fix:** add `assert.match(day, /Redo that part their way/)`. Then either add one sentence to the day skill ("a choice that belongs to the developer: ask them in the conversation") or reword the amendment.

### m1 Minor: the deck's round-2 fix (a note only with "I disagree") has no UI test
Anchor: web/src/QuestionDeck.tsx:429; tests/ui/deck.test.ts:233-235
I ran a mutant that removed the `item.decision && draft.answer !== TALK && !lock ? null :` clause, and `tests/ui/deck.test.ts` still passed 4/4. The server guard keeps the data clean. If the clause regresses, though, the deck invites a note under Fine that is then dropped without a word (round-2 M1). Fix: on the pdfkit card, assert that `+ add a note` and `textarea` both have a count of 0.

### Notes
- If the owner writes a note under "I disagree", switches to Fine, then tabs to "I disagree" and presses Enter, the deck saves straight away with the hidden note (QuestionDeck.tsx:243-253). It is the owner's own note, so this is harmless.
- When a disagreement is taken back, the skipped follow-up item keeps its old `owner_note` while the night's note is null. The Report dims it (V7). This is intended.
- Two earlier notes still stand: a non-string `note` returns a 500, and the Viewer and the tool can race on the same file (read, change, write).

## Checks rerun
All paths are under `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t46r3\`.
- `npm ci`, then `npm run check` on the snapshot: exit 0. 68 tests, 68 pass; the build passed. Log: check.log.
- `npm run test:ui`: exit 0, 4 of 4 pass. Log: ui.log.
- Probe `snap/tests/ui/probe-r3.test.ts` (real files, server and Chromium): 2 of 2 pass. Log: probe.log.
- Mutant from m1: the UI tests still pass 4/4 (mut-ui.log). I restored the file and rebuilt afterwards.

## Evidence inspected
At bdd05d5:
- web/src/QuestionDeck.tsx in full.
- The diffs of App.tsx, Gate.tsx and api.ts.
- server.ts:236-285.
- followup.ts:1-181.
- tests/ui/deck.test.ts, decisions/notify/shapes tests.
- Both SKILL.md files.
- The task record.
- Round-1 and round-2 code reports.
- `.local/evidence/2026-09-28-decisions/r2/1440-04-card.png`, taken after the bdd05d5 commit: no note box shows under Fine.

## Limitations
- I did not review the uncommitted worktree edits.
- I did not drive the phone width myself.
- I ran no mutants beyond m1.

## Verdict: FINDINGS
