# Review round 2: TASK-8

Snapshot: `e56fdbf..fe928cd` (branch test/deck-ui, clean worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`). I focused on `3a63569..fe928cd`.
Lead lenses: 5 tests, 6 failure handling.
Coverage:
1. Wiring: unchanged since round 1. The test still goes through the real `createApp`, node-server, the built app, Report, the deck and `postAnswer`, and CI runs `test:ui` after `check`.
2. Correctness: the new `recover(repo)` takes the same path the Meter takes at session end. After it runs, the Viewer's `/api/overview` → `recover()` does nothing for this night (`src/night.ts:409-417`: status is `complete` and `metrics` is set). No other GET or auto-POST the deck triggers writes `night.json` (`/read` writes Viewer state, `/follow-up` writes the follow-up file).
3. Data integrity: n/a, because no product code changed.
4. Contracts: n/a. No boundary changed. `findTranscript('s')` only reads the config folder.
5. Tests: the flake is gone for the right reason, because the race's cause (an unmeasured night) is removed in setup rather than hidden by a retry or a longer wait. `assert.ok(...metrics)` makes that precondition loud. The assertions on answer, note and `answered_at` are unchanged, so round 1's analysis still holds: the test fails if Save is gutted, the write is removed or the note is dropped. My conflict probe showed a broken save fails within 10 s and names the reason.
6. Failure handling: F2 is fixed. With no browser installed, the test fails in 1 s and the process exits. The `.catch` rethrows, so a timeout cannot turn green.
7. Simplicity: the change is +13/-6 in one file and adds no mocks.
8. Docs and task: the F3 note is recorded, and TASK-29 and TASK-34 carry the "update this test" note. The round-1 report is stored verbatim with dispositions on the task. Line endings are LF.

## Findings

### N1 Note: the TASK-44 reference points to a task that is not on main yet
Anchor: `tests/ui/deck.test.ts:20-21` and the TASK-8 notes.
TASK-44 exists only on `feat/save-gate` and `feat/explainer`. If TASK-8 merges first, `main` refers to a task it does not contain until `feat/save-gate` lands. No action is needed if both merge; otherwise carry the TASK-44 record over.

### N2 Note: a remaining, unlikely way for the test to hang
Anchor: `tests/ui/deck.test.ts:28-30`.
If `serve` emits `error` instead of `listening`, the promise never settles and the open browser keeps the process alive. With port 0 on 127.0.0.1 this is very unlikely. I am not asking for a fix. If it ever matters, race the promise against `server.once('error', reject)`.

### N3 Note: `DEAD_PID` on Linux CI
`999_999` can in principle be a live PID on an Ubuntu runner (`pid_max` is 4194304). This is an existing helper, not new here. The new `assert.ok(metrics)` would fail loudly rather than flake.

## Checks rerun
- `node --test "tests/ui/*.test.ts"` ×8 against the worktree's existing `web/dist` (built 14:58; `web/` is unchanged in `e56fdbf..fe928cd`): all eight exited 0. Output: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r2\ui-{1..8}.txt`. Round 1 on the same machine: 2 of 3 failed.
- `npx tsc --noEmit -p tsconfig.json`: exit 0 (`...\scratchpad\r2\tsc.txt`).
- No-browser run (`PLAYWRIGHT_BROWSERS_PATH` set to an empty scratch folder): exit 1 after 1 s with "Executable doesn't exist". The process exited and nothing hung (`...\scratchpad\r2\nobrowser.txt`).
- Conflict probe: a scratch copy of the test that appends a space to `night.json` before Save. It exited 1 after the 10 s wait and printed "the deck shows: the night changed since you opened it; showing the new version" (`...\scratchpad\r2\probe\conflict.test.ts`, `conflict.txt`).

## Evidence inspected
At `fe928cd`:
- `tests/ui/deck.test.ts`, `tests/helpers.ts`
- `src/night.ts` (`finish`, `close`, `recover`, `onSessionEnd`, `sessionRunning`), `src/meter.ts` (`findTranscript`, `measure`), `src/server.ts` (overview, detail, answer, read, follow-up), `src/followup.ts` (`createFollowUp`)
- `web/src/QuestionDeck.tsx` (`save`, error rendering), `web/src/api.ts`
- `.github/workflows/check.yml`, `package.json` scripts
- The TASK-8, TASK-29 and TASK-34 records and `docs/work/TASK-8/reviews/01-code-reviewer.md`
- TASK-44 at `feat/save-gate`

## Limitations
- I did not run `npm run test:ui` or `npm run check`, because both rebuild `web/dist` inside the worktree.
- I did not look at CI for PR #9 (no contact with external systems), so the Linux result is unverified by me.
- All runs were on Windows only.
- I did not repeat round 1's mutation checks against the server or the deck, because they would need source edits. The assertions they relied on are unchanged.

## Verdict: PASS
