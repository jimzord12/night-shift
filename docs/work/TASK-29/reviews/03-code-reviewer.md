# Review round 3: TASK-29 (with TASK-30, 39, 41, 44), file shapes v2

Snapshot: c2daac6..d66e137 (`feat/file-shapes` = d66e1376, clean worktree), with the focus on 6d06ec1..d66e137. I exported it with `git archive` into scratch `cr3-shapes`. For the merge question I also built a scratch clone with a trial merge into `main` 46b30b2 (`cr3-merge`).
Lead lenses: 3 data integrity, 5 tests
Coverage:
1. Wiring: the answer route reaches `followAnswer`. `start` reads the new items. The discuss line in `Views.tsx` renders, and the r4 shots show it.
2. Correctness: a re-asked question now hands over two contradicting decisions (m1).
3. Integrity: the waiting branch keeps every carried decision. So does the answered branch when the answer is an option. When the answer is "let's discuss", the carried decisions are split from the item that holds them (M1).
4. Contracts: `ask` refuses the option id `discuss`. The schemas did not change this round.
5. Tests: I ran 7 mutants and 6 are killed. The answered branch at build time survives (M2).
6. Failure handling: the reserved-id message is clear.
7. Simplicity: the `carried` helper is fine.
8. Docs: `design.md` now states the limit for older releases, which corrects the round-2 m1 disposition. The CHANGELOG entry is written at release, which matches the repo's convention.

## Findings
### M1 Material: a "let's discuss" answer leaves the task's carried decisions open to an unattended night
Anchor: `src/followup.ts:33-35`; `src/night.ts:146`; `skills/start-night-shift/SKILL.md:40-47`
Scenario (probe `cr3-shapes/probe/probe-discuss.ts`, output in `out/probe-discuss.txt`): T1 follows Detailed and Cookie. It asks "Which PDF library?" and ends blocked. The owner answers "let's discuss" with a note, then saves the follow-up. The new follow-up holds A1 `discuss`, A2 `decision` Detailed and A3 `decision` Cookie, all for T1. A next plan that leaves T1 out is refused: "open follow-up items are not in the plan: …/A2 …; …/A3".
Expected: no night acts on the task while its question waits for a talk (D24, AC #2), and the decisions stay available for after the talk.
Actual: the tool forces the night to choose one of two paths:
- It plans T1 through A2 and A3, which means working the very task the owner flagged. The skill says "follow it" for decision items.
- It skips them, and the decisions then drop out of every later plan.

Also, `onlyDiscussLeft` sees open decisions, so the card reads "waiting / start night shift" instead of the owner's turn.
Fix: in `start()`, treat an open item that shares its follow-up and `task` with an open `discuss` item as held with it: not required in the plan, refused if planned, and listed in the day-session message. Apply the same rule in `followUpDiscuss`. Add one line to both skills. Add a test.

### M2 Material: the main answered path of the round-2 M1 fix has no test
Anchor: `src/followup.ts:35`; `tests/shapes.test.ts:247`
Mutant A (delete `priors.forEach` in the `q.answer !== null` branch) leaves 54/54 passing. The new test builds the follow-up while Q1 is unanswered, then answers through `followAnswer`, so it only covers the waiting branch. In normal use the owner answers first and saves after, which is exactly round 2's reproduction.
Fix: answer Q1 before `createFollowUp` in a second repo, or in the same test before the first build, and assert pdfkit, Detailed, Cookie.

### m1 Minor: a re-asked question hands over both the old and the new answer
Anchor: `src/followup.ts:30-35`
Probe `probe-reask.ts`: night 2 asks "Which invoice layout?" again, and the owner now picks Compact. The follow-up holds Compact and also the carried Detailed for the same question, and `start` announces both as "the developer chose". Round 2's code dropped the prior here.
Fix: drop priors whose `question === q.ask`, and label carried decisions as earlier in the start message.

### N1 Note
A pre-existing gap: a task that follows a `waiting` item and ends without asking again loses that question (the item becomes `carried`, and the Viewer then locks it).

### N2 Note: merge readiness
The branch is not ready: M1 and M2 must be resolved first. Mechanically it is close. The trial merge with `main` has one textual conflict, in the TASK-40 notes (keep both paragraphs). On the merged tree, both typechecks exit 0 and the tests pass 56/56. Main's `nextStep` already covers a discuss-only follow-up, and its same-origin guard covers the new reveal POST. Nobody has seen the merged Viewer (step track plus the talk-through row); take one shot after merging.

## Checks rerun
- `node --test "tests/*.test.ts"` on the snapshot: exit 0, 54/54 (`scratchpad/cr3-shapes/out/baseline.txt`).
- Mutants A–G (`cr3-shapes/mut.sh`, `out/mut-*.txt`): B–G killed, A survives.
- `tsc --noEmit`, root and web, on the snapshot: exit 0.
- Trial merge: tests 56/56 (`cr3-shapes/out/merged-tests.txt`), both typechecks exit 0.
- Probes `probe-discuss.ts` and `probe-reask.ts`: exit 0.

## Evidence inspected
- At d66e137: `src/followup.ts`, `src/night.ts:123-190,290-300`, the `types.ts` helpers, `tests/shapes.test.ts`, both skills, `design.md:165-177`, the follow-up schema.
- The diffs 6d06ec1..d66e137 and c2daac6..main.
- `.local/evidence/2026-09-28-shapes/r4/next-night-discuss-{390,1440}.png`. They were taken at 16:49, before the 16:50 commit, so the build label reads 6d06ec1, but the text matches the committed `Views.tsx`.
- TASK-29 notes and the round-2 reports.

## Limitations
I did not run `vite build` or the UI tests (the linked `node_modules` points into the worktree), and I did not open a browser.

## Verdict: FINDINGS
