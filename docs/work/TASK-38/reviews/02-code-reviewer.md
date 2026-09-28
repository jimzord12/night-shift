# Review round 2: TASK-38

Snapshot: `git diff 5e0b030 3ab0d73` (HEAD 3ab0d73, a clean tree apart from the untracked `docs/work/TASK-38/reviews/02-design-reviewer.md`, which is not part of the snapshot). I also read `git diff 26c7f04 3ab0d73` for the round-1 fixes.
Lead lenses: 2 (correctness), 5 (tests and evidence)
Coverage:
1. Wiring: the route is registered ahead of `/api/nights/:repo/:night`. `getNextNight` is fetched after the overview, when the tab opens and on `putDetail`. The tab, the count and the link back to the night all reach `NextNightView`.
2. Correctness: the running-night filter unions `tasks[].follow_up` and `skipped_follow_ups` across every open night, so several open nights are handled. A night file that cannot be read gives `night: null` and is skipped, the same as `followAnswer` does. `readNight` only throws on a missing file, and `listNightIds` rules that out. Refs match the `checkRef` format. The amber count, the repository sort (a repository with only problems sorts last) and the grouping are all correct. See M1 and M2.
3. Data integrity: the route only reads. `writeJson` writes atomically, so a half-written night cannot briefly show taken items as next.
4. Contracts and privacy: `NextNight` is shared by the server and the web app, and the Host check covers the route. See M3 for a real project name.
5. Tests and evidence: gutting the task filter fails the new assertion (`taken on by the running night`), and removing the `close` step would fail the reappearance check. The `skipped_follow_ups` line and the repository sort have no test (M2). The sample screenshots (next-r2c, 10:02:16) postdate f826f58 (10:02:12): Trends is off the phone nav, the link is left-aligned, and the count is amber with a waiting item. The real-data shots are from 10:00, before f826f58, and still show Trends at 360. The empty-state content is unchanged and next-r2c covers the nav, so this is a Note. I confirmed the empty state is right by reading the real follow-ups myself: every item in [a real repository] and night-shift-testing-repo is done or skipped, and night-shift has no follow-ups.
6. Failure handling: an unreadable follow-up file shows as a red problem line per file. A route failure shows the global banner.
7. Simplicity: the route still repeats `openItems` (N1 from round 1 was accepted). The `npm run view` script targets the real install, and its overview runs `recover()` on real repositories from an unreleased checkout. Note only.
8. Docs: D26, design.md and the glossary are coherent, but design.md does not mention the running-night exclusion (see M1's fix). M3 is a repository-rule breach.

## Findings
### M1 Minor: an open night whose session is gone still hides its items
Anchor: src/server.ts:175-180; tests/server.test.ts (the `start(..., DEAD_PID)` step)
- Scenario: a night crashes and its session no longer runs, but no `recover()` has run yet (`recover` only runs on the overview). The owner then switches to the Next night tab.
- Expected: `start` recovers first (night.ts:125), so the next night will pick these items up. The comment on the route also says "a running night".
- Actual: the filter tests `status === 'open'`, not whether the session runs, so the items stay hidden until a full reload. The test pins this: it uses `DEAD_PID` and asserts the item is hidden.
- Impact: narrow, because the session-end hook and every reload fix it.
- Smallest fix: also require `sessionRunning(repo.path, n)` (the overview's `running` already uses it). In the test, use a live pid. Add one line on this exclusion to design.md's Next night entry.

### M2 Minor: two behaviours have no test
Anchor: src/server.ts:180 (`skipped_follow_ups`) and :191-193 (sort)
- Deleting either line leaves the 33 tests green.
- Smallest fix: in the existing test, move one item into `skipped_follow_ups` in the plan and assert it is hidden. Register a second repository and assert the order.

### M3 Minor: a real project name is committed and pushed
Anchor: backlog/tasks/task-38 …md:43 (a real repository's name in "…'s A1 was done by day"). It is already on `origin/feat/next-night-tab`.
- D2 and AGENTS.md say this repository names no real project. `git grep <that name> 5e0b030` returns nothing, so this change introduces the first occurrence.
- Smallest fix: reword it to "the only open item on the real install was done by day at 09:57" before this reaches main.

### N1 Note
On a phone at 360 px, the chevron after "From the Night of Sat 26 Sept" wraps onto a line of its own. It is left-aligned and readable.

### N2 Note
Within a repository, the follow-up groups run oldest first, while repositories run newest first. The types.ts comment only mentions the first. `created_at` is compared as a local ISO string, so a daylight-saving offset change can swap two follow-ups written within an hour of each other.

## Checks rerun
Output is in `<scratchpad>/r2/`. NIGHT_SHIFT_ROOT pointed at a scratch folder.
- `tsc -p tsconfig.json`: exit 0 (tsc.txt)
- `tsc -p web/tsconfig.json`: exit 0 (tscweb.txt)
- `node --test tests/*.test.ts`: exit 0, 33/33 pass (test.txt)
- I did not rerun the web build, because it writes to web/dist in the tree.

## Evidence inspected
- At 3ab0d73: src/server.ts, src/types.ts, web/src/{App,Views,api}, tests/server.test.ts, the docs, package.json and the task file.
- Outside the diff: src/night.ts (start, recover, finish, sessionRunning), src/followup.ts (followAnswer, openItems, applyNightToFollowUps), src/store.ts.
- The round-1 reports.
- Evidence: .local/evidence/2026-09-28-owner-states/next-r2c/ (the 1440 and 360 Next night shots, console.txt) and next-real/ (the 360 shot, log.txt).
- The real ~/.night-shift/repos.json and the follow-up files of all three registered repositories, read-only.

## Limitations
I checked the untested lines by reading the code; I did not run mutated copies. I did not open the 390 and nav screenshots. I did not start a Viewer.

## Verdict: PASS
There is no open Blocking or Material finding. M1 to M3 are Minor: fix them or record why not. M3 should be fixed before this reaches main.

(The real repository's name in this report is replaced by "[a real repository]" to keep this public repository free of it, per M3; nothing else is changed.)
