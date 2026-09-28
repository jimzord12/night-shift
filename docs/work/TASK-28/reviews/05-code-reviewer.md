# Review round 5: TASK-28

Snapshot: feat/save-gate, base c3f335d, head cad2c8e (HEAD confirmed and the tree was clean). I went deep on 76b46c8..cad2c8e: f02fe39 changes Report.tsx and tests/server.test.ts, and cad2c8e changes the TASK-28 and TASK-40 notes.
Lead lenses: 5 tests and visible evidence, 8 repository, docs and task record
Coverage:
1. Wiring: `NeedsYou` in Report.tsx is the only place the subtitle is shown. `detail.taken` is always sent (server.ts `detail()`), and it is scoped to this night's follow-up.
2. Correctness: `held` counts only unanswered questions whose handed item is in `taken`. The key `${n.night}/${h.id}` equals `isOpenQuestionIn`'s `${f.from_night}/${h.id}`, because followup.ts sets `from_night` to the night's own id. The subtitle's `!openQ && answered < total` branch only covers unanswered questions that are held or settled, so the wording is truthful. There is one mixed case, see N1.
3. Integrity: n/a. Round 5 is read-only UI text plus a test.
4. Contracts: no change to types or the file shape.
5. Tests: see Checks. The new assertion would catch the round-4 m1 mutant: I killed it in a scratch copy. The Report's `held` text has no automated test, because UI tests belong to TASK-8. It was seen on f02fe39 in the visual round-4 run (j4-390/03-blog-report.png: "1 of 2 answered; 1 held by a running night"). The visual report header names `dev · f02fe39`.
6. Failure handling: unchanged in round 5.
7. Simplicity: small, and in the owning component. The duplicate held-key rule is covered in N2.
8. Repository and docs:
   - The task notes record the round-4 verdicts and dispositions accurately.
   - The deferrals I checked are all present in the TASK-40 notes: code N1, design D2 and D4, and visual V1 and V2.
   - design.md covers the gate and the lock.
   - No CHANGELOG entry is due before release.
   - `git diff --check` is clean.
   - TASK-44 exists on the branch and main's deck test already cites it, so the two agree once merged.

## Findings

None Blocking, Material or Minor.

### N1 Note: the subtitle can be half-right when held and settled questions mix
Anchor: web/src/Report.tsx:169
- **Scenario:** 3 questions: 1 answered, 1 held by a running night, 1 settled elsewhere.
- **Actual:** "1 of 3 answered; 1 held by a running night". The settled one goes unmentioned.
- **Impact:** rare. What it does say is true.
- **Fix, if wanted:** name both counts. It can go to TASK-40.

### N2 Note: the "held" rule now lives in two places
Anchor: src/types.ts:270, web/src/Report.tsx:140-143
- The Report rebuilds the taken-key check that `isOpenQuestionIn` already does.
- A small exported `heldBy(q, f, taken)` in types.ts would keep one rule.
- This is taste, not a defect.

### N3 Note (merge readiness): main has moved since the base
- **What changed:** main is at 9821646. Since c3f335d it gained TASK-8, TASK-33 and TASK-35, including `tests/ui/deck.test.ts`, a real-browser test of this very deck, run by `npm run test:ui`.
- **Overlapping files, edited on both sides:** src/server.ts, tests/server.test.ts, web/src/App.tsx, web/src/ui.tsx and docs/design.md.
- **What I did not check:** I did not trial the merge, because that would write into .git. By reading the code, main's deck test should still pass: after the last Save the heading detaches because the gate replaces it, and `/^Save/` matches only the answer button on the question screen. That is not proven.
- **Push state:** origin/feat/save-gate is stale at e947ab9.

The branch is therefore ready to merge in review terms, but not yet in practice. First:
1. Fetch.
2. Merge main in, resolving the five overlaps.
3. Run `npm run check` and `npm run test:ui` on the integrated revision (DoD #2).
4. Push, and watch CI by SHA (docs/practices/git.md).

A conflict resolution that touches server.ts `summarise`/`detail` or App.tsx `openDeck` would invalidate this PASS for those lines. A mechanical merge would not.

## Checks rerun
Output folder: C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r5-code-review\
- `npm run typecheck`: exit 0 (typecheck.txt)
- `npm test`: exit 0, 37 passed, 0 failed (test.txt)
- `npx vite build --config web/vite.config.ts --outDir <scratch>/dist --emptyOutDir`: exit 0 (build.txt)
- `git diff --check c3f335d cad2c8e`: exit 0
- Mutation test, run on a `git archive cad2c8e` copy in `mut\` with a junction to node_modules. The target was the test "…skips a follow-up item…":
  - Baseline: 1 passed.
  - With types.ts:270 changed to `if (taken && Object.keys(taken).length) return false;`: 1 failed, actual `[0, 0]`, expected `[0, 1]`. Round-4 m1 is closed.
- I did not run `npm run test:ui`, because the snapshot does not contain it.

## Evidence inspected
- At cad2c8e: src/types.ts:257-303, src/server.ts:65-200, tests/server.test.ts:200-285, web/src/Report.tsx:136-170, web/src/QuestionDeck.tsx:190-318, web/src/Gate.tsx:153, and the docs/design.md diff.
- The task notes for TASK-28 and TASK-40, and the review reports 04-code, 04-visual (header) and 04-design (header).
- At main 9821646: tests/ui/deck.test.ts and the package.json scripts.
- Screenshots: .local/evidence/2026-09-28-visual-gate-r4/j4-1440/log.txt, j4-390/03-blog-report.png and .local/evidence/2026-09-28-design-gate-r4/deck2-360.png. The deck2-360 shot shows Q2 locked with no option chosen, and the log reads `selected=0`, which confirms round-4 M1 is closed.

## Limitations
- I did not drive a browser. The Report subtitle was checked from the visual reviewer's screenshot and log.
- I did not trial the merge with main.
- The scratch `mut\node_modules` is a junction into the real node_modules. Remove it with `Remove-Item` on the link itself, not a recursive delete that could follow it.

## Verdict: PASS
There is no open Blocking or Material finding at cad2c8e. For merging, see N3: integrate main, then run `npm run check` and `npm run test:ui` on the merged revision before pushing to main.
