# Review round 1: TASK-47

Snapshot: worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`, branch fix/waiting-carried, `git diff bcfaef2..935d475` (head 935d475 confirmed, tree clean)
Lead lenses: (1) consumers of an item's status; (2) skills/design text and how the answer reaches the next agent
Coverage:
1. Wiring: the fix is on the path both real closes take (`finish()` → `applyNightToFollowUps`, night.ts:391), so it covers recovery closes too.
2. Correctness: two new defects, F1 and F2.
3. Data integrity: F1. A later answer can leave two open decisions that disagree.
4. Contracts: no schema change. Viewer lock (`isOpenQuestionIn`, QuestionDeck `lock`), `followAnswer`, `takenRefs` and `start()`'s missing-items check all read `status === 'open'` the same way.
5. Tests: removing the new line fails test 1; removing the ask-match fails test 2. Neither test covers F1's usual order or F2.
6. Failure handling: the `try/catch` around `checkRef` behaves as before.
7. Simplicity: a small change in the module that owns this code.
8. Docs: F3 and F4.

## Findings
### F1 Material: an answer given before the next save is copied into the new follow-up while the original stays open
Anchor: src/followup.ts:30-33 (the `priors` filter) with :175
Scenario: night 1 asks Q1 about T1 and the owner does not answer it. Night 2 plans the item, T1 ends partial, and the item stays open (the new behaviour). The next morning the owner answers Q1 on night 1, then saves night 2 ("answer first, save after", the order the tests call usual). `buildFollowUp` takes night1/A1 as a prior because it is now `kind: 'decision'`. It never checks the prior's status, so night 2's follow-up gets a carried copy. Night1/A1 stays `open` and can still be answered.
Expected: one live decision per question.
Actual (scratch probe, rerun by me): night 2's follow-up is `[A1 decision "Detailed" open]`. The owner then changes night 1's answer (the server accepts it, 200). Open items are then `2026-09-26-a/A1 decision "Compact"` and `2026-09-27-a/A1 decision "Detailed"`. That is two opposite decisions for T1, and the next plan must take both.
Impact: the next agent receives contradicting decisions. Before the fix this could not happen, because the item was locked.
Smallest fix: in `priors`, keep only earlier items this night carried: `i?.status !== 'open'`. Add a test for answer-then-save.

### F2 Material: "asked again" only counts when the wording is identical, and no agent-facing text says so
Anchor: src/followup.ts:175; src/night.ts:182; skills/start-night-shift/SKILL.md:44-45
Scenario: the agent follows the skill ("ask again … record the task `blocked`") but rewords the question with what it learned tonight, which is likely. `q.ask !== item.question`, so the old item stays open and the new question goes into night 2.
Expected: one open question.
Actual: the owner is asked the same thing in two nights. Both can be answered, possibly differently, and the next night inherits both. Before the fix, a reworded question locked the old one cleanly.
Smallest fix: the start message quotes the waiting question and says to ask it again word for word. Say the same in the skill and in design.md.

### F3 Minor: the design's "Item status" bullet is out of date
Anchor: docs/design.md:363-366
The `carried` line says any task that ends other than done/skipped carries the item. It should add the waiting exception. The new sentence also says "or its task is done", but a `skipped` task locks the question too.

### F4 Minor: acceptance criterion and decision record don't match the code
Anchor: task-47 AC#1; docs/decisions.md
AC#1 says the question "reaches the next follow-up as waiting". The code keeps it open where it was asked. That choice is sound (a copied question could not be answered), but amend AC#1 and add D30 before closing, as DoD #4 requires.

### N1 Note: the same kind of loss when a waiting item is skipped
If a plan skips a waiting item ("not tonight", which is what the fixtures use), it is resolved `skipped` and locked, and nobody hears the question. This was already the case before this change. Consider telling agents in the skill to skip a waiting item only when the question no longer matters.

### N2 Note
Test 1 assigns `const s` and never uses it. With `q.task === t.id` removed, both tests still pass.

## Checks rerun
- `npm run typecheck`: exit 0
- `npm test`: exit 0, 62 pass, 0 fail
- `node --test probe.test.ts` in the scratch folder `...\scratchpad\task47-r1\`: exit 0; output in the F1 bullets
- `npm run build` was not run because it writes `web/dist` in the worktree.

## Evidence inspected
All at 935d475:
- src/followup.ts
- src/night.ts:123-191 and 382-394
- src/server.ts:100-230
- src/types.ts:285-356
- src/cli.ts:146-169
- web/src/{QuestionDeck,Report,Gate,App}.tsx (status consumers)
- skills/*/SKILL.md
- docs/design.md:350-372
- tests/shapes.test.ts
- tests/helpers.ts
- the task-47 file

## Limitations
- No Viewer run. The change has no visible part beyond which questions are open.
- An earlier scratch file of mine was deleted by a failed chained PowerShell command. It was only mine, in scratch.
- Items the old code already marked `carried` in real Adopters stay locked. The fix does not repair them.

## Verdict: FINDINGS
