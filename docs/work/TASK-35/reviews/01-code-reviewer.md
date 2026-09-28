# Review round 1: TASK-35

Snapshot: e56fdbf..d243045 (9783de5 server, d243045 web), worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\misc`, branch feat/proposals, clean tree.
Lead lenses: 1 wiring, 6 failure handling
Coverage:
1. Wiring: the route is reached from the header on every mount. The gh stand-in, the cache and the fetch all work. See F1 for the cost.
2. Correctness: a count of zero hides the badge, and `--limit 200` caps the count. The singular/plural wording is right. Staleness is covered in F3.
3. Data integrity: n/a. This is a read-only gh query that writes nothing.
4. Contracts, access and privacy: the server returns only `{open,url}` or null, so no gh token reaches the browser. The Host check covers the new route. `api.ts` `call` handles a `null` body with status 200.
5. Tests and evidence: the test runs a real process and fails if the route, `openProposals` or the `ghReady` guard is gutted. It would not catch a wrong query (F2). Screenshots are present, see Limitations.
6. Failure handling: gh missing, logged out and bad JSON all return null. The blocking behaviour is F1.
7. Simplicity: the code sits in the modules that own it. The `.mjs` branch in `gh()` is a small test seam, acceptable.
8. Repository and docs: the task state and the design doc are stale (F4).

## Findings

### F1 Material: a gh call freezes the whole Viewer server, and the header asks for it first on every open
Anchor: src/server.ts:240-244, src/github.ts:13-15 and 30-32, web/src/App.tsx:288-291
- **Scenario:** on a cold cache, which means the first request after `view` starts (including a Viewer opened from a notification) and any request more than 5 minutes after the last refresh, `/api/proposals` runs `gh auth status` and then `gh issue list` through `spawnSync`. Each call has a 30 s timeout. `spawnSync` blocks Node's event loop, so no other request is served meanwhile. React runs a child's effect before its parent's, so `<Proposals/>` sends `/api/proposals` before `App` sends `/api/overview`. The Inbox waits behind GitHub.
- **Expected:** the comment's promise, "never blocking the page".
- **Actual:** I measured it with a stand-in gh that sleeps 3 s per call, against the real `node src/cli.ts view --port 4791` on a scratch root. `/api/overview`, sent 0.1 s after `/api/proposals`, took **6.13 s** (the proposals request took 6.28 s). With the real gh that is two GitHub round trips on each cold open, typically 1-3 s. On a hanging network it is up to 60 s with no Inbox.
- **Impact:** the Inbox, the product's main page, loads visibly slower, sometimes badly so, to feed a secondary badge.
- **Smallest fix:** make the gh calls asynchronous (`execFile`/`spawn` behind a promise) for this path. Serve the cached value (or null) at once and refresh in the background, with one refresh in flight at a time. Alternatively, have the client fetch proposals after the overview lands. Only the async version stops the stall for every request.

### F2 Minor: the gh stand-in ignores the arguments it is given
Anchor: tests/server.test.ts:321-326
The fake returns N issues for any `issue …` call. The test still passes if `--label proposal`, `--state open` or `--repo` is dropped or wrong, and that is the query the feature rests on. Fix: have the fake exit non-zero unless argv contains `--label proposal --state open --repo <ISSUES_REPO>`.

### F3 Minor: the count goes stale after sending
Anchor: web/src/App.tsx:288-291, src/server.ts:239
The badge is fetched only on mount, and Reload does not refresh it. After "Send to GitHub" the server keeps the old count for up to 5 minutes. Fix: clear the server cache in the feedback-send route, and refetch when Reload is clicked.

### F4 Minor: the task record and design doc are behind the code
Anchor: backlog/tasks/task-35 (Status: Queued, no holder); docs/design.md "Viewer" and "Feedback to the Night Shift Repo"
- The task is under review but still marked Queued. Set it to Review with a holder.
- Add one line to the design doc saying the header shows the count of open `proposal` issues when gh is ready, linking to the list. The rest is covered: D24 already records the decision, and CHANGELOG waits for the release.

### F5 Note: the same blocking already exists next door
Anchor: src/server.ts:236 (`/api/gh`), and the feedback send path
Both call `spawnSync` gh inside a request handler. They run only when the user acts, so their impact is lower. They are worth moving to the same async helper if F1 is fixed there.

## Checks rerun
- `npm run typecheck`: exit 0. Output in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r1\typecheck.txt`.
- `npm test`: exit 0, 40 pass. Output in `...\scratchpad\r1\test.txt`.
- F1 probe: stand-in `...\scratchpad\r1\slowgh.mjs` against a scratch `NIGHT_SHIFT_ROOT`. Timings above; server log and response in `...\scratchpad\r1\`. I stopped the probe server afterwards.
- I did not rerun the web build, because it writes into `web/dist` in the tree.

## Evidence inspected
- The e56fdbf..d243045 diff.
- At d243045: `src/github.ts`, `src/server.ts` (the route plus the Host middleware), `src/cli.ts` (`view`), `web/src/App.tsx`, `web/src/api.ts`, `tests/server.test.ts`, `docs/design.md`, `docs/decisions.md` D24 and `backlog/README.md`.
- Screenshots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-proposals\one\header-1440.png`, `one\header-390.png` and `none\header-390.png`. With one proposal the badge reads "1 proposal", or "1" on a phone. With gh missing nothing shows.

## Limitations
- The screenshots show `dev · 9783de5` and were taken 12-34 s before d243045 was committed. They match the web commit's content, but I cannot prove they are byte-identical.
- I did not run the real `gh`, because the rules bar contacting external systems. Real latency is inferred: `gh auth status` and `gh issue list` both go to the GitHub API.

## Verdict: FINDINGS
