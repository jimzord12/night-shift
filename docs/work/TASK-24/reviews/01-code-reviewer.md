# Review round 1: TASK-24

Snapshot: `git diff af507d8 82f0151` (HEAD 82f01518, branch night/2026-09-28). The only difference in the working tree is an unrelated task-37 backlog file.
Lead lenses: 2 (correctness and edge cases), 5 (tests and visible evidence)
Coverage:
1. Product fit and wiring: `/api/overview` summarise fills both new fields on both branches. App.tsx applies live overrides. Morning, the report and History all use `ownerState` and `StateBadge`. Initial selection is correct: `shop` (New) is chosen over the newer `api` (Running).
2. Correctness: I checked precedence, the live overrides in App.tsx (a new follow-up, and a follow-up the server cannot read), `picking` and CaughtUp, and whether any removed names are still used (none outside history docs). See M1, m1, m2.
3. Data integrity: no write paths changed. The one-writer rule holds.
4. Contracts: `NightSummary` gained two fields, filled by the server and by the web overrides, from one shared `types.ts`. No secrets exposed.
5. Tests: rerun, all pass. Most assertions would fail if the code were gutted. Gaps are in m3 and M1.
6. Failure handling: see m2 (a broken follow-up reads as "Waiting").
7. Simplicity: the rule sits in the owning module, and the web app and server share it. Scope matches the plan.
8. Repository and docs: see m4.

## Findings
### M1 Material: the "every night waiting for an agent" Morning state was never looked at
Anchor: web/src/Morning.tsx:37,57; web/src/App.tsx:83
Scenario: the owner saves follow-ups for every night, then reloads. Every entry in the inbox is `waiting`, so `selected` is null and `picking` is false. Morning then shows dimmed chips under the label "All caught up" and, below them, the new CaughtUp card, which also reads "All caught up".
Expected: a screenshot of this branch. It is new visible behaviour: before this change, a non-empty inbox always had a selection. It will also be a common morning state.
Actual: setup.ts builds no all-waiting sample. The r1 screenshots cover only the path where something is selected. The heading may appear twice.
Impact: review.md says a visible change nobody looked at is Material.
Smallest fix: add an all-waiting (or waiting-plus-done) sample, take a screenshot at 1440 and 390, and drop one of the two "All caught up" labels if it reads doubled.

### m1 Minor: an unreadable night file shows a different state on the chip than in History
Anchor: src/types.ts:272-278; web/src/Morning.tsx:65; web/src/Views.tsx (`readable`)
Scenario: `night.json` is corrupt. History shows a red "Cannot be read". The Morning chip for the same night shows "New" (purple) while it is unread, and "Waiting for an agent" once read if a follow-up exists. If it is the newest New night, the initial selection lands on it: the detail request returns 422, and the page shows an error banner with "Loading the night…" forever. That loading behaviour is not new.
Expected, per AC#3 and the implementation notes: the same label on every surface, with red for an unreadable file.
Smallest fix: move the `started_at` check into the shared rule (for example, `ownerState` returns a non-owner result that the UI renders red), or at least skip unreadable nights when choosing the initial selection.

### m2 Minor: a follow-up file that cannot be read shows as blue "Waiting for an agent"
Anchor: src/types.ts:282 (`follow_up_open !== 0` with null); tests/server.test.ts:114
The choice is deliberate and tested. It still contradicts "red only when something broke", and the report's follow-up card offers **Create follow-up**, which returns 409. Record the choice, or show it as broken.

### m3 Minor: the stopped-early condition in `neverStarted` is never tested
Anchor: src/types.ts:300; tests/server.test.ts:83,106,127
No test has a `complete` night with `not_started` tasks. If `s.status === 'interrupted'` were deleted, every test would still pass. Add one assertion.

### m4 Minor: docs and one leftover red
- docs/design.md, around line 397, still says the one `Owner state` is "not built yet".
- web/src/QuestionDeck.tsx:209 now draws the question's task pill in `broken` red. That task is usually blocked, which is amber under D24.

### N1 Note
The screenshots show `dev · af507d8`. They were taken from the uncommitted working tree 53 seconds before 82f0151 was committed. The views match the diff, but they are not byte-proven against the commit.

## Checks rerun
- `npm run typecheck` with NIGHT_SHIFT_ROOT set to a fresh scratch folder: exit 0.
- `npm test`: exit 0, 32 of 32 pass.
- Output is in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r1-check\`.
- The web build was not rerun, because it writes `web/dist` inside the source tree.

## Evidence inspected
- At 82f0151: src/types.ts, src/server.ts, src/night.ts (`recover`, `sessionRunning`), src/store.ts, web/src/{App,Morning,Views,ui,QuestionDeck}.tsx, web/src/styles.css, tests/server.test.ts, docs/design.md, docs/glossary.md, docs/decisions.md (D24), TASK-24.
- `.local/evidence/2026-09-28-owner-states/r1/` (01 at 1440 and 390, 02 at 1440, 03 at 1440 and 390, console.txt), plus setup.ts and shots.mjs.

## Limitations
- There are no web tests, so the live overrides in App.tsx are verified only by reading the code and the screenshots.
- I did not drive the Viewer myself.
- I did not open 04-report-mobile or 02-history-390.

## Verdict: FINDINGS
