# Review round 4: TASK-24

**Snapshot:** I reviewed the whole change `af507d8..cbca3ee` and read the round-4 delta `d9c360e..cbca3ee` line by line. The working tree was at cbca3ee and clean, apart from an untracked `docs/work/TASK-24/reviews/04-design-reviewer.md` left by a parallel reviewer. `web/dist` was built at 02:16:49, 12 s before the commit, and the server label reads `dev · cbca3ee`.

**Lead lenses:** 2 (correctness) and 6 (failure handling).

**Coverage:**
1. **Wiring:** `failedKey` is set in `loadNight` (App.tsx:68) and reaches Morning as `failed` (App.tsx:178, Morning.tsx:56). `selected` drives the chip ring (Morning.tsx:41). History uses the same `pick`. The deck's `onConflict` and the Questions prefetch reach `loadNight` too.
2. **Correctness:** I drove every path in the running app (Checks). Open legacy, then Reload: the selection moves to docs and legacy leaves Morning, so m1 is fixed. The author's walk did not test this case, because it picked docs before reloading. From History, legacy keeps the banner and docs clears it. Questions, then back to Morning, still says "could not be opened". Clicking the legacy chip twice keeps the banner. A slow docs load after legacy now shows "Loading…" with no banner, so V10 is fixed. It holds at 390 too. The only leftover is a timing race (N1).
3. **Data integrity:** no write path changed in this round.
4. **Contracts:** `readable` (`!!started_at`) matches the server's 422 condition, since `summarise` leaves `started_at: ''` when `r.night` is null.
5. **Tests and evidence:** the change is web-only and there are no web tests. It is covered by the walks: the author's r4-walk and my six journeys. The server tests are unchanged, 32 of 32.
6. **Failure handling:** the error now belongs to the night that failed and names its repository. A night that failed never shows as "Loading…" forever, apart from N2.
7. **Simplicity:** the change is small and sits in App and Morning. Views.tsx:54 still has its own local `readable` (N3).
8. **Docs:** docs/design.md:391-393 states the rule. The TASK-24 notes carry the round-3 dispositions. Files use LF.

## Findings

### N1 Note: a failed load that is still in flight can re-raise a stale banner
- **Anchor:** web/src/App.tsx:64-70
- **Scenario:** click legacy, then docs before legacy's 422 arrives. I delayed the legacy request by 1.5 s to reproduce it (`D1-race.png`).
- **Actual:** docs' report shows under "legacy: night … invalid".
- **Impact:** a local 422 arrives in milliseconds, so the owner will practically never hit this. The banner also names legacy, so it identifies itself.
- **Optional fix:** in the catch, set the error only if that key is still the selected one (keep the selection in a ref).

### N2 Note: `failedKey` holds only one night
- **Anchor:** App.tsx:68, 119
- **Scenario:** legacy is selected and has failed. A Questions prefetch of another night then fails transiently and overwrites `failedKey`.
- **Actual:** Morning shows "Loading the night…" for legacy under the other night's banner.
- **Impact:** this needs a transient server failure. An unreadable night always has `questions_open` 0, so it is never prefetched.

### N3 Note: Views.tsx:54 recomputes `readable` locally
- **Anchor:** web/src/Views.tsx:54
- **Detail:** it re-derives `!!n.started_at` instead of importing the shared helper.

### N4 Note: the banner prefix is the repository id
- **Anchor:** App.tsx:69
- **Detail:** the prefix is the repository id (a lower-cased slug), not its display name. They only differ for folder names with capitals or punctuation.

## Checks rerun
Output folder: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\code-r4\`
- `npm run typecheck` with `NIGHT_SHIFT_ROOT=<scratch>\check-root`: exit 0 (typecheck.txt).
- `npm test`: exit 0, 32 of 32 pass (test.txt).
- `setup.ts` on a fresh `root`/`repos`, served with `cli.ts view --port 4881` (`dev · cbca3ee`). `walk.mjs` resets the read marks in scratch `viewer.json` before each of journeys A–F. Results are in `out/walk.txt` and the shots `A2-reload-after-legacy.png`, `C3.png`, `D1-race.png`, `F2-390.png`. The server is stopped.
- `npm run build` was not rerun, because it writes into `web/dist`.

## Evidence inspected
All at cbca3ee:
- web/src/App.tsx, web/src/Morning.tsx, web/src/Views.tsx:54, web/src/api.ts
- src/types.ts, src/server.ts (summarise, the detail route), src/store.ts (registerRepo)
- docs/design.md:385-393
- TASK-24 notes
- reviews 03-code-reviewer.md and 03-visual-reviewer.md
- `.local/evidence/2026-09-28-owner-states/r4/console.txt`, `r4-walk/walk.txt`, `r4-walk/01-legacy-open.png`, and `unreadable-walk.mjs`

## Limitations
- There are no web unit tests, so all lifecycle checks come from driving the browser.
- I did not re-walk the deck's 409-then-reload failure. Code reading shows Morning puts a loaded `detail` ahead of `failed`, so it cannot hide a loaded report.
- I did not look at the layout at 390 beyond the one shot.

## Verdict: PASS
No Blocking or Material findings. M1, V9 and V10 are fixed, and so are m1, m2 and N1 from round 3.
