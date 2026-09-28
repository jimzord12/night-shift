# Review round 1: TASK-31

Snapshot: 9821646..ee9a89f (12cb9e5, ee9a89f) in `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`, HEAD confirmed ee9a89f7ce5e4ff59b2f9b08c1dce8a1fda556ea. For the gate the saves are meant to match, I read TASK-28 at feat/save-gate f02fe39.
Lead lenses: 2 correctness, 5 tests
Coverage:
1. Wiring is fine. App passes `overview` and `unloaded` into Inbox, which calls `morningEstimate` on the nights that did not fail to load. The total uses the same `questions_open` as `reachable`.
2. The logic is correct. A save counts only when the night is closed, has `hand_over` set, and has at least one open question (so the deck walks it). On feat/save-gate the gate's `toSave` is `needsHandOver` over the deck's nights, which is the same set. Nights that failed to load are left out. A night that failed only on reload keeps its old detail and is still counted, which matches what the deck walks. Running nights are left out. Rounding: 3 questions and 2 saves gives 4 min, as the task description says.
3. n/a: display only, nothing is written.
4. No API or file-shape change. The helper sits in shared `src/types.ts` and works on the existing `NightSummary` fields.
5. See M1. The screenshots were looked at.
6. Before `questionsReady`, the estimate uses the server's counts. A failed load is named and excluded.
7. The helper sits in its owning module. The `status !== 'open'` check is redundant, because `hand_over` already implies a closed night. Harmless.
8. See m1 and N1.

## Findings
### M1 Material: the new test passes with the "only nights the deck walks" rule removed, and with the half-minute weighting removed
Anchor: tests/server.test.ts:380-396; src/types.ts:320-323
Scenario: I ran the test's inputs through two changed versions of the function, in a scratch script:
- (a) `saves` counted over all nights, not only `walked`
- (b) a full minute per save instead of half

Expected: the test fails on both. Actual: both return `{questions:3, saves:1, minutes:4}`, the same as the real code, so the test passes either way. When I add a closed night with no open questions and `hand_over` set, version (a) gives `saves:2` and the real code gives `saves:1`. That night is exactly like the "search: Ready to save" card in the author's own screenshot.
Impact: the rule this task is about (a save counts only for a night the deck walks, lead lens 2) is not pinned. A regression would show "2 saves" while the gate asks for one. Acceptance #2 ("counts … saves correctly") is only partly proven.
Smallest useful fix: in the same test, add a closed night that is ready to save but has no open questions (only unfinished work). Make the numbers separate the minute formula: for example 2 questions and 1 save gives 3 min, where a full minute per save would give 4 and `Math.round` would also differ. Or assert `minutes` for a case with an odd number of saves where `ceil(q + s/2) ≠ q + s`.

### m1 Minor: the save count describes a gate that is not on main yet
Anchor: web/src/Inbox.tsx:61; the task-31 notes ("The run ending on each repository's gate shipped with TASK-28")
Scenario: feat/estimate is merged before feat/save-gate. The button says "1 save", but on main the deck ends on "All clear … Open the night and save it", with no save step. The note says the gate "shipped", but TASK-28 is not on main and shows Queued on this branch.
Fix: merge TASK-28 first, or together with this change, and word the note as "on feat/save-gate, not yet integrated".

### N1 Note: the 1440 screenshot is of 12cb9e5, not the head
Its header reads "dev · 12cb9e5". ee9a89f only adds `whitespace-nowrap` around "about N min", which does not change the wide layout. The 390 screenshot shows the phrase kept on one line. Acceptable.

### N2 Note: one small mismatch in a TASK-28 edge case
If a follow-up file exists but cannot be read, the estimate counts no save (`follow_up` is true, so `hand_over` is false). The TASK-28 gate's `needsHandOver(d.night, d.follow_up)` sees null and shows a Save card. The estimate is the more accurate side here; this is for TASK-28 to track.

## Checks rerun
- `npm run typecheck` at ee9a89f: exit 0 (scratchpad `r1\typecheck.txt`)
- `npm test` at ee9a89f: exit 0, 42 pass, 0 fail (scratchpad `r1\test.txt`)
- Mutant comparison `r1\mutant.ts`: output shown under M1

The scratchpad is `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r1\`. I did not run the web build (as instructed), and the worktree is still clean.

## Evidence inspected
- At ee9a89f: `src/types.ts`, `web/src/Inbox.tsx`, `web/src/App.tsx`, `src/server.ts` (hand_over and questions_open), `tests/server.test.ts`, `tests/helpers.ts`, the TASK-31 record
- At feat/save-gate f02fe39: `web/src/Gate.tsx`, and the changes to `web/src/QuestionDeck.tsx`, `web/src/App.tsx` and `src/types.ts`
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-estimate\inbox-1440.png` and `inbox-390.png`. They are in the main checkout's `.local`, not the worktree's.

## Limitations
- I did not drive the Viewer myself; I judged the UI from the author's screenshots.
- I did not check the estimate against the merged TASK-28 code at runtime. I compared the two by reading the code.

## Verdict: FINDINGS
