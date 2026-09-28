# Design review round 2: TASK-25 / TASK-26 (Inbox and Night Report page)

**Verdict: PASS.** Round 1's two Blocking findings are fixed and I found no new ones. What remains is four Notes.

**Images inspected:**
- All 18 PNGs and log.txt in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\inbox-r3\`.
  - They were taken at 10:52:26–45, after f3a50c8 (10:52:10), and the header reads "dev · f3a50c8".
  - `web/dist` was rebuilt at 10:53:58, so I checked against the current build with my own shots.
- My own shots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-design-review-r2\`, taken at b38735b on scratch copies (the Viewer served on ports 4821 and 4822, since stopped):
  - `10-caught-up-{1440,360}`: All caught up.
  - `11-inbox-top-{360,1440}`
  - `12-deck-360`
  - `13-deck-end-360`: the deck's end screen.
  - `14-inbox-after-360`: the Inbox after the deck.

**First impression:** I can act on this from my phone now. The cards fit, the report rows read as sentences, and the numbers tell me where to go.

## Round-1 findings, checked
- **D1 (cards overflow at 360): fixed.** `01-inbox-360.png` is 360 wide, and log.txt shows scrollWidth=360 on the Inbox, the report and History.
- **D2 (report item rows squeezed): fixed.** In `02-report-blog-360/390`, the kind pills sit on their own line under the titles, with no overlap.
- **D3 (task rows wrap badly): fixed.** The Q1/Q2 pills sit under each row.
- **D4 (placeholder metrics): fixed on the report.** The headers show no "unknown".
- **D5 (tight number tiles): fixed.** In `11-inbox-top-360`, "questions for you" fits inside its tile.
- **D6 (giant oval button): fixed.** Start my morning is now a rounded block on a phone.
- **Deck end screen:** it now speaks of saving for the next agent and has a "Back to the Inbox" button, which works. Afterwards the Inbox updates correctly: docs becomes Ready to save, blog drops to the Waiting strip, and Start my morning is hidden at 0 questions.
- **All caught up:** it reads clearly at both widths, with the Waiting strip still visible.

## Findings

### D1 Note: History still shows "unknown · unknown" on every night
- **Image:** `06-history-360.png`, and the same at 1440 and 390.
- **Problem:** the report hides unmeasured metrics now, but History still shows them twice per row.
- **Fix:** apply the same "only measured" rule to History's rows. This can be a follow-up.

### D2 Note: the deck's end message says "the night" when the deck spans several
- **Image:** `13-deck-end-360.png`.
- **Problem:** the text reads "Open the night and save it for the next agent" after a run across two repositories.
- **Nit:** say "Open each night that shows Save for the next agent", or name the repositories.

### D3 Note: "Save for the next agent" wraps to two lines on phone cards
- **Image:** `01-inbox-390.png` and `-360.png` (search card), and `14-inbox-after-360.png`.
- **Problem:** the button becomes a two-line pill with the chevron far off to the right. It reads fine but looks heavier than its neighbours.
- **Nit:** use a slightly smaller text size or less padding at phone width, or the shorter label "Save for next agent".

### D4 Note: minor points
- On phone report rows, the kind pill starts at the left edge rather than under the title, so it does not line up with the text above it (`02-report-blog-360`).
- Confetti briefly sits over the end-screen text (`13-deck-end-360`). It is momentary and on-brand.
- The done and skipped labels on saved items are plain lowercase grey text, not pills (`03b-report-billing`). This is carried over from before.
- The "before" label covers part of the compare image (`04-drawer-compare`). This is round-1 D7, unchanged.

## Verdict: PASS
No Blocking findings remain.
