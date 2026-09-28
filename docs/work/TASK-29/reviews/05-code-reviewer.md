# Review round 5: TASK-29 (with TASK-30, 39, 41, 44), file shapes v2

Snapshot: `feat/file-shapes` at cfa72f3, exported with `git archive` to scratch `cr5/src-tree`. I read abb593b, the merge 3732df0 (the code auto-merged; no conflict outside backlog) and cfa72f3. I also read main's c2daac6..b1f0d6c source diff (TASK-27, 31, 45) against the branch.
Lead lenses: (1) the merge with main, (2) the `NextNightItem.held` contract and the other consumers of /api/next-night
Coverage:
1. Wiring: the server sets `held` from `forTalk`, NextNightView reads it, and the Report chip calls `forTalk` itself. Main's same-origin guard is a global `app.use('*')`, so it now also covers the branch's POST `…/files/:i/reveal`. Good.
2. Correctness: M1 and round-4 m1 are fixed. Probe P1 finds one merge interaction (m1 below).
3. Integrity: no item can be lost. A held item cannot be taken, so the "Taken" chip and the held chip never compete.
4. Contracts: `held` is required and typed, and the web typecheck passes. Two other consumers ignore it (m2).
5. Tests: the task-guard, status-guard and m1-revert mutants are now killed. `held: true` survives (m3). The screenshots match the code at 1440 and 390.
6. Failure handling: unchanged. The refusals are clear.
7. Simplicity: one helper, sitting in its owning module.
8. Docs: design.md and both skills state the rule. Two stale lines remain (Notes).

## Findings
### m1 Minor: while a night runs, the Report tells the owner to start an agent when what is left waits for their talk
Anchor: `src/types.ts:333` (`onlyDiscussLeft`), `web/src/Report.tsx:69`, `web/src/StepTrack.tsx:70`
Scenario (probe P1): Q1 is answered "discuss" and Q2 with a decision, then saved. A night starts and takes A2 (the only item it may take).
Actual: while it runs the summary shows open 2, discuss 1, state `waiting`, and "all open taken" is false. The Next line reads "start an agent in this folder… say start night shift". The same page's What needs you says "1 point to talk through".
Expected: the only work left for anyone but the running night is the talk.
Impact: a contradictory line, and only while a night is running. It corrects itself when the night closes (state becomes `needs_answers`). This comes from combining main's TASK-27 `held` logic with the branch's discuss items.
Fix: in `onlyDiscussLeft`, or in the Report's `held` argument, don't count open items taken by a running night. Alternatively, record it with TASK-40.

### m2 Minor: two other readers of /api/next-night still treat held items as the next night's work
Anchor: `web/src/App.tsx:186-188`, `web/src/Inbox.tsx:53`
Scenario: the r5 evidence setup (a discuss item plus 2 held decisions).
Actual: the Inbox says "3 for the next night", and the nav badge is blue because `nextWaits` checks only `kind === 'waiting'`.
Expected: this is the same claim round-4 M1 removed from the page itself.
Impact: low. The night card correctly shows Needs answers / Talk it through.
Fix: count `!i.held`, and make `nextWaits` true on `held || kind === 'waiting'`.

### m3 Minor: nothing asserts `held: false` through the API
Anchor: `tests/shapes.test.ts:313-314`
The mutant `held: true` in `src/server.ts:219` leaves 60/60 passing. The unit test at :349 covers `forTalk`, not the route.
Fix: after the day `resolveItem` at :316, fetch /api/next-night again and assert A2 and A3 are `held: false`.

### N1 Note
The comment at `src/types.ts:225` ("Open items of kind discuss…") predates `forTalk`. The glossary's `Owner state` row still says "once TASK-29 adds it".

### N2 Note
"held" now means three things in the web code: held for the talk (`NextNightItem.held`), held by a running night (Report.tsx:153), and all items taken (the `nextStep` argument).

## Checks rerun
- `npm run check` in `cr5/src-tree`: exit 0, 60/60 pass, typechecks and build pass (`cr5/check.txt`).
- `node --test tests/ui/*.test.ts`: exit 0, 1/1 pass (`cr5/ui.txt`).
- Mutants (`cr5/mut-*.txt`): held-true survives. held-kind, task-guard, status-guard and m1-revert are killed.
- Probe P1 (`cr5/src-tree/probe/probe.test.ts`): exit 0, output in `cr5/probe.txt`.

Scratch root: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\cr5`

## Evidence inspected
At cfa72f3:
- Source: `src/types.ts:241-340`, `src/server.ts:95-230,360-370`, `src/followup.ts`
- Web: `web/src/Views.tsx:15-70`, `web/src/Report.tsx:55-210`, `web/src/StepTrack.tsx`, `web/src/App.tsx:180-260`, Inbox
- Tests: `tests/shapes.test.ts:247-353`, `tests/server.test.ts:169-199,337-353`
- Docs: both skills, `docs/design.md`, `docs/glossary.md`, `04-code-reviewer.md`, TASK-29 notes
- Evidence: `.local/evidence/2026-09-28-shapes/r5/` in the worktree (log.txt, next-night-held-1440.png, report-held-390.png)

## Limitations
- I did not open a browser. m1 and m2 are established from the API output (P1) and the JSX.
- An untracked `05-design-reviewer.md` from a parallel round is in the worktree. I did not rely on it.

## Verdict: PASS
