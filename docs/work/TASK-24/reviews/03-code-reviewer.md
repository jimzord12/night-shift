# Review round 3: TASK-24

Snapshot: I checked the whole change with `git diff af507d8 d9c360e`, working mostly from the round-3 delta `git diff 2baea99 d9c360e`. The working tree was at d9c360e and clean, apart from an untracked `docs/work/TASK-24/reviews/03-design-reviewer.md` left by a parallel reviewer.
Lead lenses: 2 (correctness of the unreadable-night path) and 5 (tests and evidence at this head).
Coverage:
1. Wiring: the `failed` prop goes from App.tsx:170 to Morning.tsx:55. `readable` and `inMorning` in src/types.ts reach Morning's list (App.tsx:53) and the heading count (Morning.tsx:30).
2. Correctness: on real data, the count leaves out the red chip ("3 waiting for you" beside legacy). The red chip leaves Morning after a reload once it has been opened. The `failed` branch replaces "Loading…" as intended. However, the error lifecycle is wrong once another night is picked (M1), and after a reload (m1).
3. Data integrity: no write path changed. markRead on an unreadable night still succeeds, which is what the rule relies on.
4. Contracts: `readable` and `inMorning` are shared by the server and the web app, so both sides agree.
5. Tests and evidence: the new assertion at tests/server.test.ts:156 fails if `inMorning` is reverted: case 2 comes out `waiting`, so the result would be true. It also fails if `readable` is gutted. `left` and the `failed` branch have no test, because there are no web tests. The r3 shots are labelled `dev · d9c360e` and do show the red chip and opening it at 1440. At 390 the chip in Morning is not in the author's set. I looked at it myself (see Checks), so that gap is closed.
6. Failure handling: see M1. The banner names the night by id only, not by repository (Note).
7. Simplicity: small and in the owning modules. App.tsx:84 still filters with `n.started_at` rather than the new `readable` (Note).
8. Docs: the task notes record the round-2 dispositions. docs/design.md:378 still says Morning lists "every night whose Owner state is not Done" and has no line on the unreadable-night rule (m2). Line endings are LF.

## Findings
### M1 Material: the unreadable night's error follows the owner to the next night
Anchor: web/src/App.tsx:126-130 (`pick` never clears `error`), :170 (`failed = !!selected && !detail && !!error`), :62-68
Scenario: in Morning, click the red "legacy · Cannot be read" chip, then click "search · Ready to save". I served this at `dev · d9c360e` and drove it with Playwright, adding a 1.5 s delay on GET /api/nights to make the in-between state visible.
Expected: while search loads, the page says "Loading the night…". Once search is open, no red banner.
Actual: while search loads, the page says "This night could not be opened; the message above says why." (shots/c-picking-1440.png). After search loads, its report appears under the red banner "night 2026-09-23-a is invalid: not valid JSON…". The banner stays until Reload (shots/d-search-loaded-1440.png).
Impact: this is the journey the round-2 fix itself sets up. The red chip is meant to be clicked once, and the natural next step is another chip. After that the owner sees a healthy report beneath an error that seems to be about it. The stale banner is older than this task, but the `failed` branch that keys on the global `error` is new this round, and it produces the false message.
Smallest fix: call `setError(null)` in `pick`, before `setSelected`. That fixes both symptoms. Optionally, tie the failure to the key (store `failedKey` in `loadNight`'s catch and compare it with `selected`).

### m1 Minor: after Reload, Morning still shows the unreadable night it just removed
Anchor: web/src/App.tsx:79-80
Scenario: open legacy, then press Reload.
Actual: legacy has left the chip row (read), but the selection is kept, so Morning refetches it and shows the banner plus "could not be opened", with no chip highlighted (shots/e-reload-1440.png).
Fix: keep `current` only when it is still `readable`, and otherwise fall through to `openable`.

### m2 Minor: design.md does not state the unreadable-night rule
Anchor: docs/design.md:378-382
Fix: add one clause saying that a night file that cannot be read shows red, stays in Morning until it has been opened once, and remains in History.

### N1 Note
When the unreadable night is selected, its chip gets no active outline, because `active` is derived from `detail` (Morning.tsx:40).

## Checks rerun
Output folder: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\code-r3-021257\`
- `npm run typecheck` with NIGHT_SHIFT_ROOT set to scratch: exit 0 (typecheck.txt).
- `npm test`: exit 0, 32 of 32 passed (test.txt).
- `setup.ts` built two fresh scratch roots. `cli.ts view` served them on ports 4834 and 4835 (web/dist was built after d9c360e, and the label reads `dev · d9c360e`). drive.mjs and phone.mjs covered the journeys. The results are in shots/ (a-e at 1440, f and g at 390) and drive-log.txt. At 390 the red chip and the opened state render with a scrollWidth of 390 (g-legacy-open-390.png). Both servers have been stopped.
- `web build` was not rerun, because it writes into web/dist.

## Evidence inspected
- At d9c360e: src/types.ts, web/src/App.tsx, web/src/Morning.tsx, tests/server.test.ts, docs/design.md, and TASK-24 with its notes.
- docs/work/TASK-24/reviews/02-code-reviewer.md.
- .local/evidence/2026-09-28-owner-states/r3/: 01-morning 1440 and 390, 02-history-390, 05-unreadable-open-1440, console.txt, plus setup.ts and shots.mjs.

## Limitations
There are no web unit tests, so I verified the `left` and `failed` logic only by driving the running app. I did not re-examine phone layout beyond the unreadable chip.

## Verdict: FINDINGS
M1 is open. The fix is one line in `pick`; the review will need a fresh round on the new snapshot.
