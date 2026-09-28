# Design review round 5: TASK-29

**Verdict: PASS.** No blocking findings. There are three notes; D1 and D2 are the ones worth doing.

**Images inspected** (all in `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\shapes\.local\evidence\2026-09-28-shapes\r5\`):
- `next-night-held-1440.png`
- `next-night-held-390.png`
- `report-held-1440.png`
- `report-held-390.png`
- `log.txt`

All were written at 18:38, one minute after head cfa72f3 (18:37), so they show the current revision.

**First impression:** "One talk about PDF invoices, and the two decisions under it wait for that talk." It reads correctly. The amber is heavy but honest.

## Rubric
1. **At a glance: pass.** The discuss item is on top with its own line, and the held decisions say why they wait.
2. **House style: pass.** The amber matches the existing "Let's discuss" chip, the chip shape matches the kind chips, and nothing looks borrowed from another app.
3. **Craft: pass.** Wrapping at 390 is clean and nothing is clipped. `log.txt` records no console errors, and page width equals window width at 1440 and 390.
4. **States and sizes: pass.** There is no sideways scrolling at 390. The long-content risk is covered in D1.
5. **Honest: pass.** Held items still show their recorded answers ("→ Detailed", "→ Cookie session"), and nothing claims they are settled.

## Findings

### D1 Note: the amber line repeats on Next night
- **Image:** `next-night-held-390.png`
- **Where:** under A2 and A3.
- **Problem:** The same 11-word amber sentence appears under every held decision. With A1's own amber line, the card is three amber paragraphs at phone width, about 60% of its height. A task carrying five decisions would repeat the sentence five times. That drifts toward the "walls of text" D12 replaced, and it is not yet a fail.
- **Fix:** Shorten the held line so it points at the talk item rather than restating the rule, for example "Waits for your talk (A1)." A1 already says that no night works on it.

### D2 Note: the Report chip hides that the item is a decision
- **Image:** `report-held-1440.png`
- **Where:** the A2 and A3 chips.
- **Problems:**
  - "Waits for your talk" replaces "Your decision", so the Report no longer says what kind of item A2 and A3 are.
  - At a glance the rows show three amber chips, which reads like three things to discuss rather than one talk and two decisions that depend on it.
  - This is also inconsistent with Next night, which keeps the "Your decision" chip and adds the amber line.
- **Fix:** Keep the "Your decision" chip and add a small amber "waits" marker beside it or under the row, mirroring Next night. If space at 390 is the concern, keep the kind chip and move the waiting state onto the arrow text, for example "→ Detailed · waits for the talk".

### D3 Note (Nit): "3 open" on the Report
- **Image:** `report-held-390.png`
- **Where:** the section header.
- **Problem:** "3 open" counts the held items as open, which is technically true. Seen next to the chips, the owner might expect three actions when only one is needed.
- **Fix:** Optional: "3 open · 1 talk".

## Verdict: PASS
