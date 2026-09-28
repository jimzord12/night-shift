# Review round 2: TASK-47

Snapshot: worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`, branch fix/waiting-carried. I confirmed head e95e828 with a clean tree, and read `git diff bcfaef2..e95e828` and `935d475..e95e828`. I ran the checks and probes on a `git archive e95e828` copy in my scratch folder.
Lead lenses: (1) how the priors filter affects the carried-decision paths from TASK-29; (2) whether the agent-facing text reads as one rule.
Coverage:
1. Wiring: `close`, `recover` and `onSessionEnd` all go through `finish()`, which runs `applyNightToFollowUps` before `saveNight`. `createFollowUp` refuses a night that is still `open`. So in every caller order, a decision a night took on is already `carried` when its follow-up is built, and the new filter never drops a real TASK-29 carry. `followAnswer` agrees: an open waiting item turns into a decision, a running night gets 409, and `carried` waiting now only means "asked again".
2. Correctness: M1 and M2 below.
3. Data integrity: M2 can bring back the round-1 F2 outcome, the same question open in two places.
4. Contracts: no schema change. `isOpenQuestionIn`, `ownerState` (night 1 goes back to Needs answers) and `/api/next-night` all read `status === 'open'` the same way.
5. Tests: removing `i.status !== 'open'` fails test 1 (actual `[['decision','Detailed']]`, expected `[['unfinished',null]]`). The server test regex pins the new start message. Nothing covers M1 or M2.
6. Failure handling: the new `checkRef` sits inside the existing try/catch and behaves as before.
7. Simplicity: small, in the owning module.
8. Docs: F2, F3 and F4 are fixed. D30, both skills, the start message and design.md tell one story. The glossary has no entry that contradicts it. CHANGELOG is written at release. LF endings, `git diff --check` clean. N1 below.

## Findings
### M1 Minor: the priors filter also copies items that another night or a day session settled
Anchor: src/followup.ts:34
Scenario: night 1 asks Q1 about T1 and the owner does not answer. Night 2 takes A1 and ends partial without asking, so A1 stays open. The owner does not save night 2. The owner answers Q1. Night 3 takes A1 and ends partial, so A1 is carried by night 3. The owner then saves night 3, then night 2.
Expected: only the night that carried A1 copies it.
Actual (probe A): both follow-ups hold `A1 decision "Detailed" open`. Night 2's copy has night 2's `left`, which is out of date. Probe B: A1 resolved `done` by day before night 2 is saved also gets copied into night 2 as an open decision.
Impact: the next plan sees the same decision twice. The answer is the same in both, the copies cannot be answered, and night 2's T1 would be handed over anyway (as `unfinished`), so the harm is noise.
Smallest fix: `i.status === 'carried' && i.resolved?.by === n.night`. That is what the comment "this night's to carry" already says.

### M2 Minor: re-asking only matches on `q.task`, while `buildFollowUp` links the task's question through `blocked_by` first
Anchor: src/followup.ts:34 and :176; src/night.ts:182
Scenario: night 2 asks Q1 again word for word but leaves out `"task"`, then records T1 `blocked`, `blocked_by: "Q1"`. The tool accepts this.
Actual (probe D): night 1's A1 stays `open waiting`. Night 2's follow-up gets `waiting "Which invoice layout?" T1`. The question is open in two places and can be answered two ways, which is the round-1 F2 outcome by another route.
Impact: agents following the skill's example include `task`, so this is unlikely. The code is still inconsistent within this change. The round-1 N2 half ("the `q.task` match is untested") is still open.
Smallest fix: in both places match `(q.task === t.id || q.id === t.blocked_by) && q.ask === item.question`. Or say "ask it again word for word as T1's question (`"task": "T1"`)" in the start message and the skill.

### N1 Note: design.md's lock sentence leaves out `skipped_follow_ups`
Anchor: docs/design.md:358-359
"Or its task ends done or skipped" does not mention that a plan's skip also locks the question. The Item status bullet and the skill ("a skipped question is closed") already cover it.

## Checks rerun
- `npm run check` in the scratch copy: exit 0. Typecheck clean, 62 pass, 0 fail, build ok. Output: `...\scratchpad\t47r2\check.log`
- Mutation (filter removed) in the scratch copy: test 1 fails. Restored copy: exit 0. Output: `mut1.log`, `mut0.log`
- Probes A, B, C and D: exit 0. Output: `probe-a.log`, `probe.log`, `probe-d.log`. C confirms the start message quotes the question.

## Evidence inspected
All at e95e828:
- src/followup.ts (all)
- src/night.ts:123-191 and 380-481
- src/server.ts:234-273
- src/types.ts:285-356
- src/store.ts:190-200
- both skills
- docs/design.md:320-372
- docs/decisions.md D30
- docs/glossary.md
- CHANGELOG.md head
- tests/shapes.test.ts
- tests/server.test.ts:244
- tests/night.test.ts carried and recovery tests
- the task-47 file
- docs/work/TASK-47/reviews/01-code-reviewer.md

## Limitations
- I did not run the Viewer. The only visible change is which questions stay answerable.
- The build ran in the scratch copy, which uses the worktree's `node_modules` through a junction.
- Items that older releases already marked `carried` stay locked (as in round 1).

## Verdict: PASS

There is no Blocking or Material finding left. The round-1 fixes F1 to F4 and N2 (the unused variable) are verified. M1 and M2 are Minor: fix each or record why not.

Relevant paths:
- C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\src\followup.ts
- C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\src\night.ts
- C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\docs\design.md
- C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t47r2\ (check and probe logs)
