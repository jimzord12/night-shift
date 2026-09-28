# Review round 4: TASK-29 (with TASK-30, 39, 41, 44), file shapes v2

Snapshot: `feat/file-shapes` at ae5ab86, exported with `git archive` to scratch `cr4/src-tree`. I read the whole change against the merge base c2daac6 and concentrated on d66e137..ae5ab86.
Lead lenses: (1) correctness of `forTalk` across callers and sibling paths, (2) tests that would pass with the feature broken
Coverage:
1. Wiring: `start()` and `followUpDiscuss` (server.ts:126 and App.tsx:60, which feed `ownerState`) use `forTalk`. Two Viewer paths that show held items still use `kind === 'discuss'` (M1).
2. Correctness: probe P1 confirms that resolving the discuss item by day releases A2 and A3: the next plan requires them and accepts them, with the decisions announced. P2 confirms that a task-less discuss item does not hold a task-less decision. P3 finds a narrower sibling of m1 (m1 below).
3. Integrity: no item can be lost. Held items stay open, and a running night still refuses answer changes on items it took on (`followAnswer`).
4. Contracts: no schema change this round.
5. Tests: of 10 mutants, 8 are killed. The two survivors are the status guard, which does the release after the talk, and the task guard (m2).
6. Failure handling: the refusal "belongs to task T1, which the developer wants to discuss first" is clear.
7. Simplicity: one helper, sitting in its owning module. Good.
8. Docs: `docs/design.md:354-356` and one skill line still describe the old rule (m3). The TASK-29 dispositions are recorded.

## Findings
### M1 Material: the Viewer tells the owner that the next night picks up the decisions held for the talk
Anchor: `src/server.ts:205`, `web/src/Views.tsx:56`, `web/src/Report.tsx:85-98`
Scenario (probe P1): T1 follows Detailed and Cookie, asks "Which PDF library?", and the owner answers "let's discuss". `/api/next-night` returns A1 discuss, A2 decision and A3 decision, and the response has no held flag. The Next night page, headed "What the next night in each repository will pick up", shows A2 and A3 as plain Decision chips. Only A1 gets the "No night works on this" line that round-2 V9 added. The Report's "Saved for the next agent" list shows them the same way.
Expected: after M1, `forTalk` is "the one rule", so held items should read as waiting for the talk.
Actual: `start()` refuses those items, but the owner is told the next night will do them.
Impact: every "let's discuss" answer on a task that carried decisions shows the owner something that will not happen.
Fix: have the server mark each item with `forTalk(f, item)` (for example `held: true` on `NextNightItem`, or compute it in the web app from the open items in each group). Show the discuss line, or a "waits for your talk" chip, whenever the item is held, in both views. Add a screenshot and send it to the visual and design reviewers.

### m1 Minor: a carried question asked again as the task's second question still hands over both answers
Anchor: `src/followup.ts:33`
Probe P3: T1 is blocked by Q1 "Which PDF library?" and also asks Q2 "Which invoice layout?". The follow-up then holds A2 Detailed (carried) and A3 Compact (new), both for T1. The filter compares only against `q`, the blocking question.
Fix: drop a prior whose question matches any question of the task: `n.questions.some((x) => x.task === t.id && x.ask === i.question)`.

### m2 Minor: the release after the talk and the task guard are untested
Anchor: `src/types.ts:312`
Mutant b drops `o.status === 'open'`, so a resolved discuss item would hold its task's decisions forever. Mutant a drops `!!item.task`. Both leave 56/56 passing.
Fix: extend the new test. Resolve `A1` by day, then assert that a plan without A2 and A3 is refused and one with them is accepted (the P1 shape).

### m3 Minor: docs still state the old rule
Anchor: `docs/design.md:354-356` ("no night plans or skips it… while only `discuss` items are open"); `skills/do-night-shift-follow-up/SKILL.md:53-55` ("A `discuss` item left open stays…")
Fix: add "and the open items of its task" to both.

### N1 Note
`night-shift status` and `follow-up list` show held items as ordinary open items (`src/night.ts:347`, `src/cli.ts:151`). `start` refuses them loudly, so an agent recovers. Worth one word in the output later.

## Checks rerun
- `npm run check` in `cr4/src-tree`: exit 0, 56/56 tests, both typechecks pass, build passes (`cr4/check.txt`).
- Mutants a–j (`cr4/mut-*.txt`): c, d, e, f, g, h, i and j are killed. a and b survive.
- Probes `cr4/src-tree/probe/probe.test.ts`: exit 0, output in `cr4/probe.txt`.

Scratch root: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\cr4`

## Evidence inspected
At ae5ab86:
- Source: `src/types.ts:299-338`, `src/night.ts:123-191,340-357`, `src/followup.ts`, `src/server.ts:189-216`, `src/cli.ts:147-168`
- Web: `web/src/Views.tsx:25-70`, `web/src/Report.tsx:46-198`
- Tests: `tests/shapes.test.ts`
- Docs and task: both skills, `docs/design.md:345-365`, TASK-29 notes, `03-code-reviewer.md`

## Limitations
- I did not open a browser. M1 is established from the API output and the JSX.
- The UI tests were not run.
- The test helpers write temp repos under the OS temp folder, as the gate already does.

## Verdict: FINDINGS
