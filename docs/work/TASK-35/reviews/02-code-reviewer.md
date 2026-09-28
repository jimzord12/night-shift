# Review round 2: TASK-35

Snapshot: e56fdbf..d1941b2 (worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\misc`, branch feat/proposals, clean tree at HEAD d1941b2). Round focus: d243045..d1941b2 (37f76b7 pill, d1941b2 async gh).
Lead lenses: 6 failure handling, 2 correctness
Coverage:
1. Wiring: the header `<Proposals reloads>` calls `/api/proposals` on mount and `?fresh` on Reload. The route is inside the Host check.
2. Correctness (probed): two concurrent requests, one of them `?fresh`, start one gh call. A non-fresh request within 5 min is served from the cache. `?fresh` asks again (1 -> 3). A gh send clears the cache, and the next non-fresh request re-asks (4). Singular and plural forms are right, and a count of 0 hides the pill. There is a race across a send (N2).
3. Data integrity: n/a. The only new write is the in-memory cache reset; the night file handling in the send route is unchanged.
4. Contracts and access: the response is `{open,url}|null`, and no credential reaches the browser. `?fresh` only re-queries, one call at a time.
5. Tests and evidence: the changed stand-in now rejects a wrong query, which closes F2. The async, in-flight, fresh and reset behaviour has no test (M2). The screenshots at 37f76b7 are valid for d1941b2: its App.tsx diff touches only state, the effect and onClick, not the markup.
6. Failure handling: missing gh, logged out, non-zero exit, bad JSON and the 30 s timeout all resolve to null. One exception: a synchronous spawn throw leaves the route stuck (M1).
7. Simplicity: `ghCommand` is shared by the sync and async paths, and nothing is duplicated. F5 was deferred with a reason, which is acceptable.
8. Repo and docs: LF endings, `diff --check` clean, task set to Review with the round 1 dispositions, and a design.md line. CHANGELOG waits for the release.

## Findings
### M1 Minor: a rejected ask poisons the cache for the life of the server
Anchor: src/github.ts:25-27, src/server.ts:245-252
- **Scenario:** `execFile` throws synchronously inside the Promise executor. Reproduced on Windows with `NIGHT_SHIFT_GH=...\gh.cmd`, which gives `spawn EINVAL`. `openProposals` rejects, the `.then` never runs, and `asking` keeps the rejected promise.
- **Expected:** the result is null, as in the sibling `spawnSync` path, which returns `r.error`.
- **Actual:** every later request, `?fresh` included, gets `500 internal error: spawn EINVAL` plus a stack trace on the server console.
- **Impact:** low. The client catches the error and hides the pill, and the Inbox is unaffected. The trigger is a `.cmd`/`.bat` wrapper set as NIGHT_SHIFT_GH, or any future throw.
- **Fix:** wrap the `execFile` call in try/catch and `resolve(null)`, or clear `asking` in a `.finally`.

### M2 Minor: the round-1 fix has no regression test
Anchor: tests/server.test.ts:337-354
The proposals test fails if `openProposals` is gutted. It still passes if the code goes back to `spawnSync`, if the in-flight dedupe or `?fresh` is dropped, or if the reset after sending is deleted. The only proof is a manual timing probe.
- **Fix:** about 10 lines. Use a stand-in that sleeps about 1 s and assert `/api/overview` resolves before `/api/proposals`. Then change the stand-in's count and assert a plain request returns the cached value while `?fresh` returns the new one.

### N1 Note: the pill does not update after "Send to GitHub"
Anchor: web/src/App.tsx:289-293
The server cache is cleared, but the header only re-fetches on Reload or a page load. This matches the F3 disposition. Mention it if the owner expects a live count.

### N2 Note: an ask in flight across a send caches the pre-send count
Anchor: src/server.ts:246-249, 282
Reproduced: an ask was pending while a gh send ran (count 4 -> 5). The ask landed after the reset and cached 4 for 5 min, so a page reload showed 4 and only Reload corrected it. The window is narrow. A generation counter, so an old ask does not write the cache, would close it.

### N3 Note: the stand-in's temp folders are never removed
Anchor: tests/server.test.ts:323. Each run leaves `ns-gh-*` folders in the temp directory.

## Checks rerun
Outputs in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t35-r2-code\`:
- `npm run typecheck`: exit 0 (`typecheck.txt`).
- `npm test`: exit 0, 40 pass (`test.txt`).
- `vite build`: exit 0, with `--outDir` set to the scratch `dist\`, so `web/dist` was not touched (`build.txt`).
- `probe.ts` with the stand-in `gh.mjs`: exit 0 (`out.txt`, `err.txt`).
  - With a 1.5 s gh, `/api/overview` answered in 44 ms and the proposals requests in 1620 ms, from 1 gh call.
  - The cache, fresh and send-reset cases behave as in lens 2.
  - The race (N2) and the stuck 500 (M1) are reproduced there.
- `git status` was clean afterwards.

## Evidence inspected
- At d1941b2: src/github.ts, src/server.ts (onError, the proposals route, the feedback send route), tests/server.test.ts, tests/helpers.ts, web/src/App.tsx, web/src/api.ts, web/src/ui.tsx, web/src/Report.tsx (the send call site), docs/design.md, and the TASK-35 record.
- The round 1 reports: `01-code-reviewer.md` and `01-design-reviewer.md`.
- Screenshots: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-proposals\r2\header-1440.png` and `header-390.png` (footer `37f76b7`). They show the GitHub mark, the count and the outward arrow at both widths.

## Limitations
- I did not run the real `gh`, because that would contact GitHub. Real latency and the output format are taken from gh's documented `--json` behaviour.
- The 30 s timeout path was read, not exercised.
- I did not look at the visual design again; that belongs to design-reviewer.

## Verdict: PASS
No Blocking or Material findings. M1 and M2 need a fix or a recorded reason.
