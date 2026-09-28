# Review round 1: TASK-38

Snapshot: `git diff 5e0b030 26c7f04`. HEAD was 26c7f04 and the tree was clean. `web/dist` has the same bundle hashes as my scratch build of 26c7f04 (index-CMXV0gZk.js, index-C7uy0sy7.css).
Lead lenses: 1 (wiring), 5 (tests and evidence)
Coverage:
1. Wiring: the route, `getNextNight`, the three fetch triggers, the count and the link back all trace through to the running app. I walked the refetch after an answer myself (see Checks).
2. Edge cases: I found a running night's items counted as the next night's (F2). A missing repository is dropped silently, which is consistent with the header count.
3. Data integrity: the route only reads. Nothing new writes.
4. Contracts and access: `NextNight` is shared by server and web. The global Host middleware (src/server.ts:127) covers the new route. `RepoRef.path` was already exposed by the overview.
5. Tests: the new test goes through the real route and would fail if the code were gutted. A missing route gives a 404, so `json()` throws. Without the `status==='open'` filter, "settled item leaves" fails. Without the try/catch, the problems assertion fails. The client-side refetch has no test (the repo has no web tests), but I walked it. The real-data screenshot the acceptance criteria require is missing (F1).
6. Failure handling: an unreadable follow-up file shows as a red problem. The whole route is not lost. If the first fetch fails, the tab says "Loading…" until it is reopened, with the error banner showing. That is acceptable.
7. Simplicity: the route repeats `openItems` (src/followup.ts:112) with per-file tolerance (N1).
8. Repository and docs: D26, design.md, glossary, AGENTS.md and the task file are coherent. LF endings, `git diff --check` is clean, and no real names appear.

## Findings
### F1 Material: acceptance criterion #1's real-data screenshot is missing
Anchor: TASK-38 AC #1 "(screenshot on sample and on real data)"; `.local/evidence/2026-09-28-owner-states/next-r1/`
- Scenario: the task is closed on the current evidence.
- Expected: one screenshot of the Next night tab on the real install. `npm run view` was added for exactly this.
- Actual: every screenshot is from the synthetic setup.ts sample.
- Impact: AC #1 is not shown to be met. The real follow-up files are the ones the owner will read.
- Smallest fix: run `npm run view` and take one screenshot of the tab, or record the owner's own look. Be aware that `load()` automatically picks the newest night that is the owner's turn and marks it read (existing behaviour, App.tsx:95-126). The owner's real state will change.

### F2 Minor: items a running night has taken on are counted as the next night's
Anchor: src/server.ts:168-183
- Scenario: a night is running. `start` requires every open item to be planned or skipped (src/night.ts:~138-147). Items stay `open` until `close` → `applyNightToFollowUps`.
- Expected: the tab reflects what the next night will pick up.
- Actual: during a running night, all of those items are listed and counted under "Next night".
- Impact: the list is misleading only while a night runs, and it corrects itself at close.
- Smallest fix: skip refs found in an open night's `tasks[].follow_up` or `skipped_follow_ups`, as `followAnswer` already does (src/followup.ts:74-84). Or label those items "in progress in <night>".

### N1 Note: duplicate of `openItems`
src/server.ts:173-176 repeats src/followup.ts:112-119. The tolerance for broken files is justified. A shared helper that takes an `onProblem` callback would keep one definition of "open".

### N2 Note: extra fetches
`putDetail` refetches on every detail load that has a follow-up, not only on saves (App.tsx:68-71). In the walk, opening the Questions tab caused one extra GET. Parallel responses are not ordered, but their content is the same, so the effect is harmless.

### N3 Note: evidence header shows the older version
The next-r1 header reads "dev · 00359e3" because the server started before the fix commit. The bundle does match 26c7f04 (scrollWidth=390 confirms the nav fix).

### N4 Note: phone navigation
At 390 px, "Trends" is off-screen in a bar that scrolls with no visible scrollbar. The badge on "Next night" is blue, but its count includes "Needs your answer" items, which are the owner's turn (amber).

## Checks rerun
All output is under C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r1\
- `npm run typecheck`: exit 0 (typecheck.txt)
- `npm test`: exit 0, 33/33 pass (test.txt)
- `vite build --outDir <scratch>/dist`: exit 0, same hashes as web/dist (build.txt)
- Walk:
  - Setup: `NIGHT_SHIFT_ROOT=<scratch>/ns node setup.ts <scratch>/repos`, then `view --port 4811`, then Playwright walk.mjs. I stopped the server afterwards.
  - Result: `POST .../blog/2026-09-26-a/answer` was followed immediately by `GET /api/next-night`. Item A2 changed from "Needs your answer" to "Your decision … → Buttondown". The Questions count went from 2 to 1, and the Next night count stayed at 5. No page errors.
  - Output: walk-out.txt, walk/01-next-before.png, walk/02-next-after.png

## Evidence inspected
- The diff 5e0b030..26c7f04: src/server.ts, src/types.ts, web/src/{App,Views,api}.ts(x), tests/server.test.ts, the docs, package.json, AGENTS.md.
- Code outside the diff: src/followup.ts, src/night.ts start, src/store.ts, src/cli.ts, skills/*.
- The author's next-r0 and next-r1 screenshots and console.txt, plus shots-next.mjs and setup.ts.

## Limitations
I checked mutation robustness by reading the code, not by running mutated copies. I walked at 1440 px only. I did not look at real data.

## Verdict: FINDINGS
