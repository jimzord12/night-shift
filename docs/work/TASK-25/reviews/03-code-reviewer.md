# Review round 3: TASK-25 (with TASK-26 #1 and the shipped part of TASK-31)

Snapshot: 77fabbf on feat/inbox-report. I focused on `git diff b38735b 77fabbf` (c926c10, 77fabbf) and read App.tsx, Inbox.tsx and the QuestionDeck conflict path in full at 77fabbf. The served bundle on :4799 (`index-Bv3t2kaH.js`) is byte-identical by name to my own build of 77fabbf.
Lead lenses: 6 failure handling, 2 correctness
Coverage:
1. Wiring: the `failures` map feeds four places: the night-page banner, `ReportPage failed`, the Inbox `unloaded` alert with its Reload, and the deck's `onConflict` → `loadNight(force)` → boolean. All are traced and reached from real routes.
2. Correctness: I traced the lifecycle of generation, inFlight and failures through Reload, direct address, prefetch and forced reload. R2 F1/V7, N1, N2 and V8 are resolved. One edge case gives inconsistent numbers (F1 below).
3. Data integrity: no write paths changed. Stale loads are now dropped by generation, so an old response cannot land in fresh state.
4. Contracts: `onConflict` is now `Promise<boolean>` on both sides. Server and API are unchanged. No secrets.
5. Evidence: the author's walk.txt covers A1-A4, B1, B3 and C1-C2. B2 (the deck count) logged `undefined`, so the deck side of F2 was never actually observed; my D3 covers it. I looked at the C1 360 screenshot: the alert wraps cleanly. There are no web tests, per settled decision.
6. Failure handling: return-to-failed, background failure, Reload racing a slow failing load, and a 409 followed by a failed reload were all walked. See F1.
7. Simplicity: state is now one map plus two refs, down from three structures, and it all stays in App.tsx. Good.
8. Repo/docs: commit scope is coherent and LF. Round-2 dispositions are not yet on the TASK-25 record, which only has round 1 at line 44 (N2).

## Findings
### F1 Minor: after a 409 whose forced reload fails, the Inbox says the night is out of Start my morning, but the deck still walks it
Anchor: web/src/App.tsx:190 (`unloaded` = `questions_open > 0 && failures.has(key)`, ignoring `details[key]`); Inbox.tsx:38-40 (`reachable`); App.tsx:187 (`openItems` still has the stale detail)
- Scenario: open Start my morning from the Inbox. Save gets a 409, and the forced reload of that night fails. The stale detail stays in `details` and the key goes into `failures`.
- Expected: the alert, the button count and the deck agree.
- Actual (reproduced, D2/D3):
  - The alert says "docs could not be loaded, so its questions are not in Start my morning".
  - The button reads "1 question".
  - Pressing it opens the deck at "0 / 2", with docs still in it.
  - On that night's page, the failure banner would sit above the stale report.
- Impact: the numbers are wrong only after two failures in a row. The deck already tells the user to reload the Viewer, which recovers everything. Low impact.
- Smallest fix: count a night as unloaded only when it has no detail: `failures.has(key) && !details[key]` at App.tsx:190. Optionally do the same for the banner at :191.

### Notes
- N1: at App.tsx:140, `setDetails({})` runs when the overview lands, including on first load. A night whose GET finishes before the overview does gets wiped and fetched a second time. This showed in E as docsGETs=2 (one stale load plus one refetch, which is correct there), and it can happen for a fast direct address. Harmless.
- N2: the round-2 dispositions (F1, F2, N1-N3, V7-V9, D1-D4 deferred) should go on the task, as review.md "Storage" requires. At present they appear only in the brief.
- N3 (carried): a forced and an ordinary load of the same night in the same generation can still race. If the ordinary load fails after the forced one succeeded, it records a failure over a good detail. Rare. This was accepted in round 2.

## Checks rerun
- `npm run typecheck`: exit 0. Output: `<scratchpad>/r3/typecheck.txt`.
- `npx vite build --config web/vite.config.ts --outDir <scratchpad>/r3/build`: exit 0. The assets `index-Bv3t2kaH.js` and `index-C6wOCAFD.css` match `web/dist` and what :4799 serves.
- Playwright walk `<scratchpad>/r3/walk3.mjs` against the author's :4799. The mark-read and answer POSTs were intercepted, so nothing was written. Output is in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r3\out\` (walk3.txt, D1-deck.png, D2-inbox.png, D3-deck.png).
  - D1: the deck shows "This night changed, and the new version could not be loaded…". This is correct.
  - D2/D3: F1.
  - E: a slow docs GET fails after Reload is pressed. The failure is dropped: no alert, the button reads "2 questions in 2 repositories". The generation guard works.
- `npm test`: not rerun. The server and tests are unchanged, and the author reports 33 passing.

## Evidence inspected
- At 77fabbf: web/src/App.tsx, Inbox.tsx, QuestionDeck.tsx (save and conflict), Report.tsx (ReportPage), web/src/api.ts, src/server.ts:200-206 (the 409 message), src/types.ts `readable`.
- The six reports 01-* and 02-*.
- The author's walk: .local/evidence/2026-09-28-owner-states/r2-fix-walk/ (walk.mjs, walk.txt, C1-inbox-360-alert.png).

## Limitations
- The 409 and the 500s were simulated by stubbing browser requests. That is only a way to reproduce the failures.
- I did not re-walk the happy paths or the layouts at 390 and 1440; the visual and design reviewers cover those.

## Verdict: PASS
There is no open Blocking or Material finding. F1 is Minor: fix it or record why not.
