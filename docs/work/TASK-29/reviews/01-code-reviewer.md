# Review round 1: TASK-29, TASK-30, TASK-39, TASK-41, TASK-44 (file shapes v2)

Snapshot: `git diff c2daac6 a4ea92e` in the worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\shapes` (HEAD a4ea92e2, tree clean before and after)
Lead lenses: 4 contracts, 3 data integrity, plus 5 tests as asked
Coverage:
1. Wiring: the deck reaches the answer route, the question files route and the reveal route. The Inbox card and Report reach `ownerState`. The Next night view shows `discuss` items, labelled.
2. Correctness: checked a `discuss` answer against the tool's own validation (B1).
3. Integrity: a task that follows several items and is carried (M1). The `was` guard is correct: it accepts only when answer and note match what the developer saw, and gives 409 otherwise.
4. Contracts: the schemas accept @1 and @2. The reveal route re-checks the path, runs no shell and uses `spawn` with an argument array. See m1 and m2.
5. Tests: see B1, M1 and m2.
6. Failure handling: refusals name their reason, and a refused close writes nothing.
7. Simplicity: `PLAN_SCHEMA` is exported but never used.
8. Docs: see m3.

## Findings
### B1 Blocking: a "let's discuss" answer breaks the night file's own validation, and a running night then cannot close
Anchor: `src/store.ts:161` (`nightProblems`: `answer "…" is not an option`), reached from `src/night.ts:410` (close)
Scenario: while a night runs, the developer answers its Q1 with "let's discuss". I ran this through the real server in a scratch repo.
Expected: the answer is valid, and the agent's `close` works.
Actual: `readNight().problems` = `['Q1: answer "discuss" is not an option']`. `close` refuses with `the night was not closed: Q1: answer "discuss" is not an option`, and only the Viewer can change an answer. Closed nights answered with discuss also show "This night file has problems" on the Report and "1 file problem" in History, and `night-shift check` flags them. Nobody walked the Report after a discuss save; the evidence stops at the gate.
Impact: an unattended night cannot close, and every discuss answer looks like file corruption.
Fix: in `nightProblems`, accept `q.answer === DISCUSS`. In the discuss test, assert that `readNight(...).problems` is empty after the answer, and that closing a running night with a discuss answer succeeds.

### M1 Material: a task that follows several decisions keeps only the first one when it is carried
Anchor: `src/followup.ts:34` and `:38`
Scenario, reproduced: T1 follows A1 ("Detailed") and A2 ("Cookie"). T1 ends partial and the night closes. A1 and A2 become `carried`. The new follow-up has a single decision item: "Detailed".
Expected: every decision the developer made reaches the next agent.
Actual: "Cookie" is dropped from the chain. The only place it remains is a `carried` item that no one reads again.
Impact: the developer's answer is silently lost. This is the main use case of GitHub #4 (several items, one piece of work) combined with a common outcome (partial).
Fix: emit one carried decision item per prior decision, or keep all of them on the item. Add a test with the partial outcome.

### m1 Minor: @1 files can take on v2-only content
Anchor: `src/server.ts:236`, `src/followup.ts:100`, `src/night.ts:155`
Scenario: the Viewer writes `discuss` into a `night@1` or `follow-up@1` file, or an agent sends a `plan@1` with an array `follow_up`, which `plan.json` stores as @1.
Impact: `design.md` says "an older release refuses a version 2 file rather than misread it". An older release reading such a night file would build `decision: "discuss"`.
Fix: stamp `plan.json` with `PLAN_SCHEMA`, and have `followAnswer` set the follow-up's schema to @2. Or state the limit in `design.md` and the CHANGELOG.

### m2 Minor: two guards have no test that would fail if they were removed
Anchor: `src/server.ts:346` (the `insideDir` check) and `:231` (the note half of `unchanged`)
Scenario: a night.json edited by hand with `files: [{ "path": "../secret.txt" }]`. Separately, a `was.note` that no longer matches the stored note.
Impact: deleting either guard leaves every test green. The first is the lead-lens boundary.
Fix: add one request per guard, expecting 404 and 409.

### m3 Minor: leftover @1 references
Anchor: `src/cli.ts:23` ("plan@1"), `docs/glossary.md:19,20,25`, `AGENTS.md:154`
Fix: update them to @2, or to "@1 or @2".

### N1 Note
Both `ask` and the question files route check the path by resolving it as text (`path.resolve`), so a symlink inside the repository that points outside passes. The evidence route has the same behaviour.

### N2 Note
The reveal route is a POST with no body, so any web page can trigger it cross-site: the Host check stops DNS rebinding, not cross-site requests. The answer route has the same exposure and it predates this change. Worth a spike.

### N3 Note
Node quotes `/select,<path>` as a whole when the path has spaces, and Explorer may then ignore the selection. This is harmless for the owner's current paths.

### N4 Note
`tests/shapes.test.ts` matches SKILL.md text including its line breaks, which is brittle.

## Checks rerun
- `node --test tests/shapes.test.ts` in the worktree, with TEMP/TMP pointed at the scratchpad: exit 0, 8/8 pass. Output: `…\scratchpad\shapes-test.txt`
- Scratch repro `…\scratchpad\repro.ts`, which imports the worktree's `src/` and `tests/helpers.ts`: confirmed B1 and M1 (output quoted above).
- `npm run check` and `test:ui` were not rerun: the web build writes `web/dist` inside the checkout.

## Evidence inspected
- The full diff c2daac6..a4ea92e.
- At a4ea92e: `src/server.ts`, `src/followup.ts`, `src/store.ts:100-200`, `src/night.ts:365-425`, `src/types.ts`, `web/src/Report.tsx`, `web/src/Views.tsx`, `tests/helpers.ts`.
- Walk logs and the screenshots `r2-1440/06-after-save-1440.png` and `01-discuss-card-read-1440.png` under `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-shapes\`.

## Limitations
- I did not read the task records (`backlog task view`); I took acceptance from the brief, the task notes in the diff and `design.md`.
- I did not open the Viewer in a browser.
- I did not check Explorer's behaviour with paths containing spaces (N3).

## Verdict: FINDINGS
