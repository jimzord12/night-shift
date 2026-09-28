# Visual review round 4: TASK-24

**Verdict: PASS.** No Blocking findings. V9, V10 and the ring nit from round 3 are fixed at every width I walked.

**Setup.** Viewer `dev · cbca3ee`. `web/dist` is newer than `App.tsx` and `Morning.tsx`, so it matches this head. Each width ran on its own fresh `setup.ts` sample in the session scratchpad: 1440x900 on port 4871, 390x844 on 4872, 360x844 on 4873. All three servers are stopped. The first 1440 run used a banner selector that matched nothing, so I rebuilt that sample and walked 1440 again. The evidence is in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-owner-states-r4\` (54 files): screenshots named `NN-step-<width>.png`, step logs `walk-<width>.txt` and `console-<width>.txt`.

## Journeys (all walked to the end at 1440, 390 and 360)

- **Morning on load:** the heading reads "3 waiting for you". shop opens first with its ring and turns Done. legacy shows as a red "Cannot be read" chip.
- **Open legacy:** the banner reads "legacy: night 2026-09-23-a is invalid: not valid JSON…". legacy gets the ring (nit fixed). The page says "This night could not be opened; the message above says why." (`02-legacy-open-*`)
- **Then docs from its chip:** the banner is gone, docs has the ring and its report shows. On a phone the top of the screen no longer reads as "docs failed". **V9 fixed** (`03-docs-after-legacy-390.png`).
- **Then docs from History:** no banner, and the report shows (`05-*`).
- **V10 check:** I opened legacy, then search with its detail request delayed 1.5 s. The page said "Loading the night…", with no banner and no "could not be opened" line. **V10 fixed** (`06-search-loading-after-legacy-1440.png`).
- **legacy, then the Reload button:** no banner. legacy and shop leave Morning, and docs is selected (`08-*`).
- **legacy from History, then a browser reload:** before the reload the banner and message show, with no ring because legacy is no longer in Morning (`09-*`). After it there is no banner, legacy is not in Morning, and docs is selected (`10-*`). History still shows legacy as a red row: "Cannot be read · 1 file problem" (`11-history-*`).
- **docs question deck:** "Start answering", then `2` and `Enter`, shows All clear. `Escape` closes the deck. The chip turns "Ready to save" without a reload, and the heading stays at 3, which is right because it is still the owner's turn (`13-*`, `14-*`).
- **search, Create follow-up:** the chip turns "Waiting for an agent" without a reload. The heading drops to "2 waiting for you", and the follow-up card reads "Handed to the next agent" (`16-*`).
- **Sideways scrolling:** none. Page width equalled screen width at every step and every width, including with the deck open.

## Findings

### V11 Note: the legacy banner still shows on the History tab while legacy is the selected night
- Where: open legacy, then press the History tab (not a pick). Seen at 1440, 390 and 360.
- Saw: the red "legacy: …" banner sits above the History list (`04-history-legacy-chosen-390.png`).
- Expected: this is acceptable. legacy is still the chosen night, the banner names it, and its red History row agrees. It clears as soon as any other night is picked.
- Fix: none needed.

Nit: at 390, when legacy is opened from History, the "could not be opened" line sits below the fold, under the chips. This is the same issue as V7, which TASK-25 owns (`09-legacy-from-history-390.png`).

## Console

The journeys were clean: no page errors, no failed requests, and the deck and follow-up saves returned no 4xx or 5xx. The only entries are one 422 on `GET /api/nights/legacy/2026-09-23-a` for each time legacy was opened (5 per width), each followed by the browser's "Failed to load resource" line. That is the server correctly rejecting the corrupt file, as in round 3, so it does not count against criterion 5.
