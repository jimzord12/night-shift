# Review round 1: TASK-25 / TASK-26 (#1) / TASK-31 (shipped part)

Snapshot: `git diff 8237af9 25c200d` (working tree clean at 25c200d)
Lead lenses: 1 wiring, 2 correctness
Coverage:
1. Wiring: routes, Back, deep links, read marks, the deck from a card, from Start my morning and from the report, and live updates all traced. The core paths are sound.
2. Correctness: I checked which nights become cards and which go to the strip, the three numbers against the sample (2 / 5 / 5, all correct), the unreadable night, the running night and the failed-load state. Findings F2, F3, F4.
3. Data integrity: no writes changed. N1 is a narrow stale-GET race.
4. Contracts: the server is unchanged and the client uses the same API calls. No secrets.
5. Evidence: the shots postdate the source, and a rebuild of HEAD gives the same asset hashes as `web/dist`. But the author's own log shows an overflow at 360 (F1). There are no web tests, and none were claimed.
6. Failure handling: F3 and F4.
7. Simplicity: `HistoryView.selected` is now dead (N3).
8. Docs and tasks: F5.

## Findings
### F1 Material: the Inbox scrolls sideways at 360 px
Anchor: web/src/Inbox.tsx:136-141 (card button `whitespace-nowrap`), :57 (`grid` with no explicit column)
- Scenario: a phone 360 px wide, with a night in Ready to save.
- Expected: one card per row inside the viewport. Inbox r1 measured 360.
- Actual: `inbox-r2/log.txt` reads `[360] inbox: scrollWidth=380`. In `01-inbox-360.png`, every card sticks out past the stats row. The widest content is the "Save for the next agent ›" button (about 311 px plus 40 px of card padding), which forces the implicit auto grid column wider than the viewport.
- Impact: the owner's phone pans sideways, which breaks D24's "phone keeps working" and TASK-25 acceptance #1. The evidence recorded it but it was not addressed.
- Fix: `grid-cols-1` (minmax(0,1fr)) on the grid, and let the button wrap or shrink below `sm`. Re-shoot at 360.

### F2 Minor: the "questions for you" number opens a partial deck
Anchor: Inbox.tsx:41
- The Stat calls `onStartMorning` while `questionsReady` is false, but the big button is disabled in that state. A quick tap opens a deck holding only the nights already loaded.
- Fix: pass `questionsReady ? onStartMorning : undefined`.

### F3 Minor: one failed background load disables Start my morning until Reload
Anchor: App.tsx:138-141, 157
- Scenario: `getNight` fails for one readable night that has questions.
- Result: `questionsReady` never becomes true and the button stays "Getting the questions…". The error banner names a night the owner never picked. Each later change to `details` retries that night.
- Fix: leave failed keys out of `questionsReady`, or show a retry on the button.

### F4 Minor: the error banner outlives its page
Anchor: App.tsx:160-166, 225 (`onBack`), tab `<a>` links
- Only `pick` clears `error`. Open the unreadable "legacy" night, then press ← Inbox or a tab: the red banner stays on the Inbox until another night is picked or the page reloads.
- Before this change the error lived on the same page as its night. Now it is orphaned.
- Fix: clear the error when the route leaves the failed night.

### F5 Minor: task text contradicts what shipped
Anchor: TASK-25 AC #2 ("Questions tab stays until TASK-31"); TASK-31 AC #3 ("Inbox and History only")
- D27 drops the Questions tab now, and D26 makes three tabs. The ACs still say otherwise.
- Fix: add a note to the ACs, or edit them, so closing the tasks is not ambiguous.

### Notes
- N1: the effect at App.tsx:138 re-fires on every change to `details`, so it sends duplicate GETs for nights still loading. A late duplicate can overwrite a detail just saved from a card's deck; the owner then gets a 409 and the deck reloads. The window is narrow, and the Questions view already had this.
- N2: the deck from Start my morning is ordered by fetch completion, not newest first.
- N3: `HistoryView.selected` is now always undefined, so History no longer highlights the last night opened.
- N4: `TaskRow` dropped the old "from <follow-up>" pill.
- N5: the Feedback section keeps the old heading style, not `Section` (D27 asks for consistent section boundaries).
- N6: an empty "What happened" list renders as a bordered sliver on a running night with no tasks yet.
- N7: a deep link to a night started after the Viewer loaded says "not in the list any more", but it is new.
- N8: a malformed `%` escape in `#/night/...` makes `decodeURIComponent` throw during the first render, which blanks the app.
- N9: images now sit on a dark background, so transparent PNGs lose their white backing.
- N10: browser Back to the Inbox scrolls to the top.
- N11: `CaughtUp` says "every night is read" while the strip can show "Cannot be read".

## Checks rerun
- `npm run typecheck`: exit 0.
- `npx vite build --config web/vite.config.ts --outDir <scratchpad>/r1-build`: exit 0. The asset hashes (`index-Z31orKeC.js`, `index-BkvDo9BL.css`) match `web/dist`.
- Tests not rerun: the author reports 33 passing, and the server is unchanged.

## Evidence inspected
- At 25c200d: web/src/App.tsx, Inbox.tsx, Report.tsx, Views.tsx, Evidence.tsx, src/types.ts (state helpers), src/server.ts (overview, detail, read), docs/decisions.md D22-D27, docs/design.md, docs/glossary.md, TASK-25/26/31/39.
- At 8237af9: web/src/Morning.tsx and web/src/App.tsx.
- `.local/evidence/2026-09-28-owner-states/inbox-r2/`: log.txt, 01-inbox-360, 02-report-blog-1440, 04-drawer-compare-390; also shots-inbox.mjs and inbox-r1/log.txt.

## Limitations
- I did not run a Viewer or drive the flows myself; wiring was judged from code and the author's shots and log.
- I cannot prove which build the Viewer served at 10:40. `web/dist` was rebuilt at 10:41, but its hashes match HEAD and the shots match current source.
- The shot script blocks read marks, so I have not seen marking a night read in the browser.

## Verdict: FINDINGS
One Material finding (F1). Anchors are relative to C:\Users\jimzord12\Documents\GitHub\night-shift.
