# Review round 2: TASK-24

Snapshot: `git diff af507d8 2baea99`. The round-1 fixes are `82f0151..2baea99`. The working tree was at 2baea99 and clean (an untracked `02-design-reviewer.md` appeared later from a parallel reviewer).
Lead lenses: 2 (correctness), 5 (tests and visible evidence)
Coverage:
1. Wiring: `/api/overview` feeds `ownerState` on chips, report and History. `NightBadge` is wired into the Morning chip and History. `pick` now scrolls to the top.
2. Correctness: I checked the unreadable-night path, the `openable` selection filter and all three heading branches against real data at head. See m1.
3. Data integrity: no write path changed. The one-writer rule holds.
4. Contracts: no change since round 1. `NightSummary` is shared, and the server and the web overrides agree.
5. Tests and evidence: the new `neverStarted` assertion (tests/server.test.ts:157) would fail if the `interrupted` check were deleted. There are no web tests, so `NightBadge`, the `openable` filter and the headings rest on screenshots. The author's r2 shots predate the commit (N1). My own shots at head cover the chip, History and the headings. See m2.
6. Failure handling: an unreadable night is now red everywhere it is listed. Clicking it still ends on a banner plus "Loading the night…" forever. That behaviour is older than this change (N2).
7. Simplicity: `NightBadge` belongs in ui.tsx, and one component now replaces two copies of the branch. No scope growth.
8. Docs: design.md (round-1 m4) and the glossary are current. No leftover `ownerSide`, `OwnerPill`, `NIGHT_STATUS` or `blocked`/`failed` colour tokens remain in src, web or skills. The m2 disposition is recorded on the task.

## Findings
### m1 Minor: the Morning count still counts an unreadable night as the owner's turn
Anchor: web/src/Morning.tsx:29,37; src/types.ts:272 (`ownerState`), :297 (`inMorning`); web/src/App.tsx:84
Scenario: one `night.json` is corrupt and unread, and the only other inbox night is waiting for an agent. I built this on scratch data and served it at `dev · 2baea99`.
Expected: the heading agrees with the chips and the card below it.
Actual: the heading reads "1 WAITING FOR YOU". The only chip it can mean is red "Cannot be read", which the selection skips. Below it, the card says "All caught up. Every night is read…". Once the chip is clicked (and so marked read), the heading flips to "IN PROGRESS". There is a related edge: a read, unreadable night that has a follow-up file becomes `waiting` by rule, so it stays in Morning on every load.
Impact: a contradictory morning, only when a night file is corrupt. That is rare but real, and it is the round-1 m1 fix stopping one step short: the shared rule still says `new`, while every surface says "Cannot be read".
Smallest fix: apply the `started_at` test once, shared. For example, `left` counts only `n.started_at` nights, and `inMorning` excludes unreadable nights that have been read. Or `ownerState` gets an explicit unreadable result that the UI maps to red. Add one case to the rule test.

### m2 Minor: the red "Cannot be read" chip is not in the author's evidence
Anchor: .local/evidence/2026-09-28-owner-states/setup.ts (no unreadable night)
It is a new visible element on the Morning chip. I looked at it myself (see Evidence), and it renders correctly at 1440. There is no 390 shot. Add a broken night to setup.ts so later rounds see it.

### N1 Note: the r2 shots are not byte-proven against 2baea99
They were taken at 01:58:45–01:59:01. The commit is 01:59:17, and web/dist was rebuilt at 02:00:01. The version labels read `dev · af507d8` (r2) and `dev · 82f0151` (r2-waiting). The content matches head's code ("3 WAITING FOR YOU", "IN PROGRESS"), and my own shots at `dev · 2baea99` agree.

### N2 Note: clicking an unreadable night never stops loading
`picking` stays true after the 422, so the page shows the error banner and "Loading the night…" indefinitely. This predates the change and is now easier to reach because the red chip invites a click.

### N3 Note: the heading follows what is open, not the state
With no owner's-turn nights, the heading reads "In progress" until any night is opened, then "All caught up", including beside a Running chip. This is a design call; it is TASK-25's to settle.

## Checks rerun
- `npm run typecheck` (NIGHT_SHIFT_ROOT set to scratch): exit 0.
- `npm test`: exit 0, 32 of 32 passed.
- `setup.ts <scratch> waiting`, plus my own broken-night script, then `cli.ts view --port 4833` on that scratch data (serving head's web/dist, version label `dev · 2baea99`), driven by Playwright. The server has been stopped.
- Output folder: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\code-r2-020133\` (typecheck.txt, test.txt, shots\01-morning.png, 02-after-click-broken.png, 03-history.png, console.txt).
- The web build was not rerun, because it writes into web/dist.

## Evidence inspected
- At 2baea99: src/types.ts, src/server.ts (`summarise`), src/store.ts, web/src/{App,Morning,Views,ui,QuestionDeck}.tsx, tests/server.test.ts, docs/design.md, docs/glossary.md, TASK-24, the round-1 reports.
- .local/evidence/2026-09-28-owner-states/: r2/01-morning-1440, r2-waiting/01-morning-1440 and 390, setup.ts, shots.mjs, console.txt.

## Limitations
- I did not look at the author's History shots at 390; phone layout belongs to the parallel visual and design reviewers.
- My own shots are 1440 only.

## Verdict: PASS
There is no open Blocking or Material finding. m1 and m2 are Minor: fix them, or record why not.
