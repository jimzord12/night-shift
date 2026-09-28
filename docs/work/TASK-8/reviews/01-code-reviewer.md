# Review round 1: TASK-8

Snapshot: `e56fdbf..3a63569` (test/deck-ui HEAD), worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`, clean tree.
Lead lenses: 5 tests, 1 wiring.
Coverage:
1. Wiring: the test goes through the real server (`createApp` plus node-server), the built app, Report's "Start answering", the deck and `postAnswer`. CI wiring and the scripts are correct. `npm test`'s glob does not recurse into `tests/ui`. `tsconfig` includes `tests/`.
2. Correctness: the Save locator is scoped to the deck, and the chosen option `b` differs from the recommended `a`. A race was found, see F1.
3. Data integrity: n/a. Nothing in the product changed.
4. Contracts: the Host check is off because `port` is unset, and the test does not rely on it. No secrets or names.
5. Tests: the test would fail if Save were gutted, if the server write were removed, if the note were dropped or if the wrong option were sent. It is flaky, see F1.
6. Failure handling: see F2.
7. Simplicity: one file with no mocks, placed where it belongs.
8. Docs and task: AGENTS.md rows are fine. The task-note deviation is F3.

## Findings

### F1 Material: the test is flaky because it hits the TASK-44 409 race
Anchor: `tests/ui/deck.test.ts:15-19` (night set up with `session('s', DEAD_PID)` and closed with `metrics: null`), which fails at `:37`.
Scenario: when the app opens `#/night/...`, it fetches `/api/overview` and `/api/nights/...` at the same time. The overview runs `recover()` (`src/night.ts:413-416`). That measures this unmeasured night and rewrites `night.json`, which changes its hash. If the detail request is served first, the deck holds the old hash, so Save gets a 409 and the question stays on screen.
Expected: the test passes every time on a correct app.
Actual: I reran `node --test "tests/ui/*.test.ts"` three times. Runs 1 and 2 failed with `locator.waitFor: Timeout 30000ms exceeded ... to be detached`, and run 3 passed. A scratch probe (a copy of the test with request logging) confirmed the cause. In 1 of 4 runs the night detail came back before the overview, then `POST /answer` returned 409, the deck showed "the night changed since you opened it", and the answer in the file stayed `null`.
Impact: CI (the automated check run on GitHub) and local runs go red at random, and one green CI run proves little. Each failure costs 30 seconds and says nothing about the cause.
Smallest fix: build a realistic morning, where the Meter has already run at session end. Call `recover(repo)` (or `onSessionEnd`) after `close` and before serving, then check that `metrics` is set. The product race stays with TASK-44, whose test can use exactly this unmeasured setup. Optionally, on failure, print the deck's error text (`.text-broken`) so a 409 is visible.

### F2 Minor: if the browser fails to launch, the test run hangs
Anchor: `tests/ui/deck.test.ts:22-26`. The server is started before `chromium.launch()`, and the launch sits outside the `try`.
Scenario: Chromium is not installed (the "once" step in AGENTS.md was skipped) or a system dependency is missing. The launch throws, the server is never closed, and the `node --test` process never exits. I reproduced this with a scratch test: after the failure the process was still running at 25 s until `timeout` killed it. In CI this lasts until the job's 6-hour limit.
Smallest fix: launch the browser before `serve`, or put the launch inside the `try` and guard `browser?.close()`, or add `--test-force-exit` to `test:ui`.

### F3 Minor: the task's own note is overridden without a record
Anchor: the TASK-8 Implementation Notes ("write these tests against the new deck, not the current one").
TASK-28 (on its branch), TASK-29 and TASK-34 are still to come. TASK-29 will likely remove the hidden "+ add a note" button this test clicks. I checked TASK-28's deck diff and the test still fits it.
Smallest fix: note in the task why it went ahead now, and that TASK-29 and TASK-34 must update this test.

### N1 Note: the release script and CI cost
Releases are unaffected. `playwright` and `playwright-core` 1.63.0 have no install scripts: both show `scripts: {}` in `node_modules`, and there is no `hasInstallScript` in the lock file. So `npm ci` in `scripts/release.ts:95` downloads no browser, only a few MB of packages. `test:ui` rebuilds the web app a second time in CI after `check`. That costs seconds and is acceptable.

## Checks rerun
- `node --test "tests/ui/*.test.ts"` ×3 against the worktree's existing `web/dist` (built at 14:49:09; `web/` is unchanged in `e56fdbf..HEAD`). Exits were 1, 1, 0. Output: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r1\ui-{1,2,3}.txt`.
- `npx tsc --noEmit -p tsconfig.json` exited 0 (`...\scratchpad\r1\tsc.txt`).
- Scratch probe `...\scratchpad\probe\probe.test.ts` ×4: 3 saves returned 200 and 1 returned 409.
- Leak experiment `...\scratchpad\leak\leak.test.mjs`: the process hung until `timeout` killed it at 25 s (exit 124).

## Evidence inspected
All at `3a63569` unless noted:
- `tests/ui/deck.test.ts`, `tests/helpers.ts`, `package.json`, `package-lock.json`, `.github/workflows/check.yml`, `AGENTS.md`, `tsconfig.json`
- `src/server.ts`, `src/night.ts` (`recover`, `close`, `finish`), `web/src/App.tsx`, `web/src/QuestionDeck.tsx`, `scripts/release.ts`
- The TASK-8, TASK-29 and TASK-34 records
- `feat/save-gate` (`e947ab9`): the `QuestionDeck.tsx` diff and the TASK-44 record

## Limitations
- I did not run `npm run test:ui` as written, because it rebuilds `web/dist` inside the worktree (not a fresh folder).
- I did not run `npm run check`, did not look at the CI logs for PR #9, and did not run on Linux.
- The failure rate was measured on Windows only.

## Verdict: FINDINGS
