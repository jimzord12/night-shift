# Review round 3: TASK-31

Snapshot: 8f6923ac1aab828cf8e9d3f5d9b87159d047cdfd (feat/estimate, checked out in `night-shift.worktrees\ci`; the worktree is clean). Its parents are 6d317ec (round 2) and c2daac6. c2daac6 equals `main` and is the merge-base, so `git diff main 8f6923a` holds only TASK-31's changes. I reviewed a `git archive` export of 8f6923a in scratch.
Lead lenses: 5 tests, 7 simplicity
Coverage:
1. `Inbox` still passes its loaded nights (the failed ones left out) to `morningEstimate`. Wiring on main is unchanged since round 2: `questions_open` still leaves out held questions (`taken`) in both `server.ts:111` and `App.tsx:54`, and `hand_over` still matches `gateState().toSave`.
2. The zero guard, `Math.max(1, …)` and the `saves > 0 &&` render all behave correctly.
3. n/a: display only, nothing persisted.
4. No contract change. `NightSummary` fields are only read.
5. The new two-save case fails when a save costs a full minute and when saves are left out (see Checks rerun). One residual gap, N1.
6. Unchanged. Unloaded nights are left out and named.
7. The function is 5 lines in `src/types.ts`, beside `ownerState` and `inMorning`, and used once. No scope growth. N2 is a small test nit.
8. LF endings in all three files. Task notes record the round-1 and round-2 dispositions. Commit shape: N3.

## Findings
### N1 Note: the test pins "at most half a minute a save", not exactly half
Anchor: tests/server.test.ts:427-429; src/types.ts:329
- **Scenario:** I changed the rule to a third of a minute a save (`saves / 3`) and reran the test.
- **Expected:** fail. **Actual:** pass. Both cases round up to the same whole minute: 3 + ⅓ gives 4, and 2 + ⅔ gives 3.
- **Impact:** low. The figure is labelled "about", and the brief's two mutants (a full minute, and no saves) are both caught.
- **Smallest fix, optional:** add a case with 1 question and 3 saves. Half a minute gives 3; a third gives 2.

### N2 Note: the `pair` construction is roundabout
Anchor: tests/server.test.ts:428
- `[id, id].map(() => overview.nights.find(...)!)` builds two copies of one summary.
- `const u = overview.nights.find(...)!; morningEstimate([u, u])` says the same thing more plainly.
- No behaviour impact.

### N3 Note: the round's fix lives inside a merge commit
Anchor: 8f6923a
- The test fix and the `Inbox.tsx` class change were committed as the resolution of "merge main". The commit message reads like an ordinary commit and does not say it is a merge.
- `git show 8f6923a` shows the fix only as a combined diff, so a later reader could miss it.
- Harmless now. A separate commit after the merge would read better next time.

### m1 Minor: the loading-label change has no screenshot
Anchor: web/src/Inbox.tsx:59
- **What changed:** "Getting the questions…" may now wrap. This follows round-2 design D2's own suggested fix.
- **The gap:** no shot of the loading state at 8f6923a exists. `.local/evidence/2026-09-28-estimate/` stops at `r2/` (76d9cb7).
- **Why only Minor:** the ready state's classes are unchanged, and the change applies only while questions load.
- **Fix:** a single `loading-320.png` at 8f6923a, or have the design reviewer confirm it next round.

## Checks rerun
All output is in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t31-r3-code\`. The snapshot copy is `snap\`, with `node_modules` as a junction to the ci worktree's.
- `tsc -p tsconfig.json`: exit 0. `tsc -p web/tsconfig.json`: exit 0.
- `node --test "tests/*.test.ts"`: exit 0, 43 pass, 0 fail (`snap-test.txt`).
- Mutants, estimate test only (`mut-*.txt`); `src/types.ts` was restored afterwards:

| Mutant | Result |
|---|---|
| a. a full minute a save | **fail**, at the pair assertion (line 429: 4 vs 3) |
| b. no saves in the minutes | **fail** (line 425) |
| c. saves counted over all nights | **fail** |
| d. `Math.round` instead of `Math.ceil` | pass (equivalent, as in round-2 N1) |
| e. `Math.floor` | **fail** |
| f. no status check | pass (equivalent) |
| g. no `hand_over` check | **fail** |
| h. no zero guard | **fail** (line 430) |
| i. a third of a minute a save | pass (N1) |

The web build was not run.

## Evidence inspected
- At 8f6923a: `src/types.ts`, `tests/server.test.ts`, `web/src/Inbox.tsx`, `web/src/App.tsx`, `web/src/Gate.tsx`, `src/server.ts`, and the merge's combined diff.
- The TASK-31 record, `docs/work/TASK-31/reviews/0{1,2}-*.md`, `docs/practices/git.md`.
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-estimate\` (listing only; the newest shots are `r2/`).

## Limitations
- I did not drive the Viewer or rebuild `web/dist`, so the loading-state change is unseen (m1).
- I did not rerun `npm run check` as a whole. Typecheck and tests were rerun separately; the web build was not.
- I wrote nothing into any checkout.

## Verdict: PASS
Round-2 M1 is resolved: the two-save case separates half a minute from a full minute and from none. There is no open Blocking or Material finding; m1 and the Notes are optional.
