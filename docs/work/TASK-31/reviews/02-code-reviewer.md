# Review round 2: TASK-31

Snapshot: 9821646..6d317ec2ddb09ac7c61bdbdc3119fc8efbb026c1 (feat/estimate). I focused on ee9a89f..6d317ec (76d9cb7 holds the code fixes). **The `ci` worktree is no longer on feat/estimate.** It is on `main` at 73c6192, where TASK-28 is merged. So I exported 6d317ec with `git archive` into scratch and reviewed that copy. I also applied the branch's code diff onto current `main` in scratch to check the merge.
Lead lenses: 5 tests, 2 correctness
Coverage:
1. The Inbox passes the nights that loaded into `morningEstimate`, and the button shows the result. Fine.
2. The save rule matches `gateState().toSave` on main: the closed nights that need a hand-over, among the nights the deck walks. On main, `questions_open` already leaves out questions held by a running night (`taken`), so the estimate and the deck agree. `reachable` equals `estimate.questions`. `saves > 0 &&` never renders a stray "0".
3. n/a: display only.
4. No contract change. The patch applies cleanly on main.
5. See M1. The screenshots are of 76d9cb7, the fix commit, at 320, 390, 768, 1024 and 1440. The earlier wrapping is gone, and "about 3 min" sits on its own line when the button stacks.
6. Unchanged since round 1. Nights that failed to load are left out and named.
7. Fine.
8. Task notes and dispositions are coherent.

## Findings
### M1 Material: the test still passes when a save costs a full minute
Anchor: tests/server.test.ts (the last test, the `two` case, and its comment "not 2 or 4"); src/types.ts `morningEstimate`.
- **Scenario:** I ran the test against mutated copies of the snapshot.
  - Counting saves over all nights: fails. Good, round-1 M1 part (a) is fixed.
  - No saves in the minutes: fails.
  - A full minute per save (`Math.ceil(questions + saves)`): **passes**.
- **Why:** with exactly one save, ceil(q + 0.5) = q + 1 = q + s. Both cases use one save: 3q+1s gives 4 and 2q+1s gives 3 under either formula. The comment's claim that a full minute would give 4 is wrong (2 + 1 = 3). Round 1's suggested numbers had the same arithmetic slip.
- **Impact:** lead lens 5 asks exactly this, and the answer is no. The half-minute rule is unpinned.
- **Smallest fix:** add one case with two saves, for example the task's own "3 questions, 2 saves, about 4 min" (a full minute gives 5). It can be a direct call such as `morningEstimate([{questions_open:1,status:'complete',hand_over:true},{questions_open:1,status:'complete',hand_over:true}])`, which should give `minutes: 2` (a full minute gives 4). Correct the comment.

### N1 Note: two surviving changes that make no difference
Swapping `Math.round` for `Math.ceil`, and dropping `status !== 'open'`, both pass the test. Neither changes any result: q + s/2 always ends in .0 or .5, and JavaScript rounds .5 up; an open night never has `hand_over`. No action.

### N2 Note: acceptance #2 says "for the sample nights"
The test builds its own nights. The sample nights are covered only by the screenshots, which show 2 questions, 1 save, 3 min, and the "search" night that is ready to save but has no questions is correctly not counted. Acceptable.

### N3 Note: I left stray files in the main checkout; the lead needs to clean them up
A scratch script of mine had a variable-name clash (PowerShell treats `$D` and `$d` as the same variable), and it copied files into `C:\Users\jimzord12\Documents\GitHub\night-shift` (branch feat/save-gate). These are all untracked; no tracked file changed:
- `src/src/`, `tests/tests/`, `schemas/schemas/`, `skills/skills/`, `examples/examples/`, each with nested copies
- `examples/package.json` and `examples/tsconfig.json`
- `examples/node_modules`, a **junction** to `night-shift.worktrees\ci\node_modules`

My rules forbid me deleting in the tree, so I left them. Remove the junction as a link (`cmd /c rmdir C:\Users\jimzord12\Documents\GitHub\night-shift\examples\node_modules`), never by a recursive delete. A recursive delete could follow the junction and delete the `ci` worktree's `node_modules`. Then delete the other listed paths. No test ran from them.

## Checks rerun
All output is in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r2\`.
- On the snapshot copy `snap\`: `npm run typecheck`, exit 0; `node --test "tests/*.test.ts"`, exit 0, 42 pass (`snap-test.txt`).
- Mutants, estimate test only:
  - saves counted over all nights: fail (`a-all-nights.txt`)
  - a full minute per save: **pass** (`b-full-minute.txt`)
  - `Math.round` instead of `Math.ceil`: pass (`c-round.txt`)
  - no saves in the minutes: fail (`d-no-saves.txt`)
  - no status check: pass (`e-no-status.txt`)
- Branch applied on main 73c6192 (`onmain\`): typecheck exit 0; tests exit 0, 43 pass (`onmain-test.txt`).
- An earlier typecheck and test run in the `ci` worktree tested `main`, not the snapshot; I discarded it.

## Evidence inspected
- At 6d317ec: `src/types.ts`, `web/src/Inbox.tsx`, `tests/server.test.ts`, TASK-31 record, round-1 reports.
- At main 73c6192: `web/src/App.tsx`, `web/src/Gate.tsx` (`gateState`), `src/server.ts` (`questions_open`, `hand_over`), `src/types.ts` (`isOpenQuestionIn` with `taken`).
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-estimate\r2\inbox-{320,390,768,1024,1440}.png`, all headed `dev · 76d9cb7`.

## Limitations
- I did not drive the Viewer or rebuild `web/dist`.
- The worktree named in the brief was on `main`, so the snapshot came from `git archive`.
- The stray files in N3 are my doing and are still in place.

## Verdict: FINDINGS
