# Visual review round 3: TASK-24

Viewer: dev · d9c360e (web rebuilt with `npm run build`). Three fresh `setup.ts` samples, one per width, each with its own NIGHT_SHIFT_ROOT under the session scratchpad. Ports: 4861 at 1440 (1440x900), 4862 at 390 (390x844), 4863 at 360. All three servers are stopped. Evidence is in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-owner-states-r3\`, with step logs in `walk-1440.txt`, `walk-390.txt` and `walk-360.txt`.

Journeys:
- **Morning on load, 1440 and 390:** walked to the end. The heading reads "3 waiting for you", so legacy is no longer counted (**V8 fixed**). legacy shows a red "Cannot be read" chip. shop opens first (the newest night that is the owner's turn) and turns Done live.
- **Opening legacy:** walked to the end. The red banner gives the reason, and the page below says "This night could not be opened; the message above says why." "Loading…" no longer hangs (**V6 fixed**). On a phone that line sits below the chips, the same issue as V7, which TASK-25 owns.
- **Picking another night after legacy:** the report shows, but **the banner stays** (V9).
- **In-app Reload and browser reload:** walked to the end. legacy and shop drop out of Morning. legacy stays in History as a red row ("Cannot be read", "1 file problem"). Opening legacy from History gives the same message and banner.
- **docs deck:** walked to the end at both widths. Start answering, then `2` and `Enter`, shows All clear. The chip moves live to Ready to save and the heading to "2 waiting for you".
- **search, Create follow-up:** walked to the end at both widths. The chip moves live to "Waiting for an agent" and the heading to 2.
- **Sideways scroll at 360:** none. Page width equals screen width on Morning, with legacy open, on the search report, History, and the billing and mobile reports.

## Findings

### V9 Blocking: the error banner for legacy stays on screen after another night is opened
Journey/step: open legacy, then tap docs (or search). Width: 1440 and 390.

Saw: docs' report opens, but the red "night 2026-09-23-a is invalid: not valid JSON…" banner stays above it. It also stays on History and every other tab until a reload. On a phone the report is below the fold, so all the owner sees is the red banner and the docs chip highlighted, and it reads as "docs failed to open". The banner names the night id but not the repository, so nothing ties it to legacy.

Expected: the banner belongs to the night that failed and goes away when another night is picked. As it is, a stale error shows as the current state (criterion 2).

Screenshots: `03-docs-after-legacy-390.png`, `03-docs-after-legacy-1440.png`, `05-history-390.png`

Fix: `setError(null)` in `pick` in `web/src/App.tsx`. Optionally, also name the repository in the 422 message.

### V10 Note: the stale error also makes a readable night say "could not be opened" while it loads
Journey/step: after legacy, tap search with its detail request delayed by 1.5 s. Width: 1440 and 390.

Saw: while search loads, the page says "This night could not be opened; the message above says why." `failed` in `App.tsx` reads the leftover error. Locally the load takes milliseconds, so the owner would hardly see this.

Screenshot: `04-search-loading-after-error-1440.png`

Fix: the V9 fix removes it.

Nit: the legacy chip gets no active ring while it is the chosen night (`active` needs a loaded detail): `02-legacy-open-1440.png`.

## Console
- The journey walks were clean: no page errors, no failed requests, and the deck and follow-up saves returned no 4xx or 5xx.
- The only entries are one 422 on `GET /api/nights/legacy/2026-09-23-a` per legacy open, each with the browser's "Failed to load resource" line. That is the server correctly rejecting the corrupt file, so it is not counted against criterion 5 (`console-1440.txt`, `console-390.txt`, `console-360.txt`).

## Verdict: FINDINGS
- V6 and V8 are fixed, and the round-2 journeys still hold at both widths.
- One Blocking finding remains, V9. It is a one-line fix that also clears V10.
