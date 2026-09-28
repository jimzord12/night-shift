# Review round 2: TASK-25 (with TASK-26 #1 and the shipped part of TASK-31)

Snapshot: `git diff 8237af9 b38735b`, focused on `git diff 25c200d b38735b`. The working tree was clean at b38735b.
Lead lenses: 2 correctness, 6 failure handling
Coverage:
1. Wiring: routes, Back, the deck from a card, from Start my morning and from the report, and the conflict path in QuestionDeck (line 117) all traced into App.tsx. Sound, apart from F1.
2. Correctness: I traced the lifecycle of failedLoads, inFlight and failedKey, and walked it in a real browser. Reload, a forced reload on conflict, and a failed load followed by a successful one all work. Leaving a failed night and coming back is broken (F1). questionsReady and the numbers are sound when nothing fails.
3. Data integrity: no write paths changed. N2 is a narrow stale-response window.
4. Contracts: the server and API calls are unchanged. The metrics row now matches the `number | null` types. No secrets.
5. Evidence: the inbox-r3 log shows scrollWidth equal to the viewport at all three widths. I looked at 02-report-blog-360: the pills wrap cleanly and nothing overlaps. There are no web tests and none were claimed. The evidence does not walk any failure path.
6. Failure handling: F1 and F2.
7. Simplicity: the fix stays in App.tsx. Error state is now spread over three structures (failedKey, failedLoads, error), and that split causes both findings.
8. Docs and tasks: TASK-25 acceptance and the TASK-31 note now match D26 and D27. The dispositions are recorded. The prose uses the glossary's terms.

## Findings
### F1 Material: going back to a night that failed shows "Loading the night…" forever
Anchor: web/src/App.tsx:143 (`failedLoads.has(selected)` stops the fetch), :148-153 (leaving the night clears `failedKey`), :250 (`failed={selected === failedKey}`)
- Scenario: open the unreadable legacy night from the strip, press ← Inbox, then browser Back, or History and legacy.
- Expected: the error again, or a fresh attempt.
- Actual (reproduced): step A3/A4 in walk.txt shows `body= Inbox Loading the night…` and `banner=null`. Only one GET for legacy was made. The night is in failedLoads, so it is never fetched again. failedKey was cleared on leaving, so the page does not know the load failed.
- Impact: a regression from 25c200d, where a return fetched again and showed the error. A failure now looks like a load that never finishes until Reload. Back from the Inbox to a failed night is an ordinary move.
- Smallest fix: remember failures per night, for example `Map<key, message>`. The report page's `failed` and the banner then read `failures.get(selected)`, and Reload clears the map. Or drop `selected` from failedLoads when the route enters it. If you do that, make adding a failure a no-op when the key is already there, otherwise a failing night re-renders and re-fetches in a loop.

### F2 Minor: a failed background load is silent, and Start my morning looks ready while it misses a night
Anchor: App.tsx:110-112 together with :148-153 (with `selected` null on the Inbox, the error is cleared at once), :182; Inbox.tsx:41, 44-48
- Scenario: the Inbox's prefetch of a night with questions fails. A Viewer restart or a network blip is enough. I simulated it with a 500 on docs.
- Actual (reproduced, B1-B3):
  - No banner appears.
  - The button reads "Start my morning · 2 questions in 2 repositories", but the deck shows 0/1 (only blog).
  - After that deck, the button still counts 1 question, and pressing it does nothing (`openDeck([])`).
  - The docs card opens to the same endless "Loading the night…".
- The same effect also clears the error from a failed forced reload on conflict when the deck was opened from the Inbox. The deck then says "showing the new version" when no new version arrived.
- Impact: partial work looks complete, and the failure leaves no trace. The trigger is uncommon and Reload recovers, so this is Minor. The F1 fix (per-night failures) should also cover it if the Inbox shows the failure next to the button, for example "docs could not be loaded — Reload".

### Notes
- N1: a forced reload that succeeds after a failed one clears failedLoads but leaves failedKey and the banner. The report page then shows a stale error above a working night (App.tsx:107-108).
- N2: `load()` does not reset `inFlight`. A GET still in flight during Reload lands in the fresh `details`, and if it fails, it adds its key back to failedLoads.
- N3: a forced load that runs while an ordinary one is in flight removes the in-flight mark early (`finally`). This is harmless today.

## Checks rerun
- `npm run typecheck`: exit 0, no errors.
- `npx vite build --config web/vite.config.ts --outDir <scratchpad>/r2-build`: exit 0. The assets `index-BZoLQquo.js` and `index-_ce9muOB.css` match `web/dist`.
- Failure walk: I built a fresh synthetic sample with `setup.ts` (`NIGHT_SHIFT_ROOT=<scratchpad>/r2-root`) and ran the Viewer `dev · b38735b` on port 4861, stopped afterwards. My Playwright script (`<scratchpad>/walk/walk.mjs`) blocks read marks and fails the first docs GET. Output: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\walk\out2\` (walk.txt, A3-back-to-legacy.png, B1-inbox.png, B2-deck.png, B3-docs.png).
- `npm test` not rerun: the author reports 33 passing, and neither the server nor the tests changed.

## Evidence inspected
- At b38735b: web/src/App.tsx, Inbox.tsx, Report.tsx (ReportPage, NightView, NeedsYou, TaskRow), QuestionDeck.tsx (conflict path), styles.css, src/types.ts (`readable`, `inMorning`, metrics types), src/server.ts (night routes), src/store.ts (`saveNight`: atomic write), the TASK-25 and TASK-31 files.
- The round-1 reports and dispositions. inbox-r3/log.txt and 02-report-blog-360.png (taken 10:52:39, after f3a50c8; web source unchanged in b38735b).

## Limitations
- I did not re-walk the layout at 390 or 360, nor the happy paths; the design and visual reviewers cover those.
- F2's trigger was simulated by stubbing one browser request. That stub is only a way to reproduce the failure; it is not part of any test.

## Verdict: FINDINGS
One Material finding (F1).
