# Design review round 3: TASK-25 (the Inbox alert for a night that could not be loaded)

**Verdict: PASS.** Nothing is Blocking. There are three Notes below.

**Images inspected**
- The author's shot, `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-owner-states\r2-fix-walk\C1-inbox-360-alert.png`. It is from the r2-fix walk, and its code matches 77fabbf.
- My own shots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-design-review-r3\`, taken at 77fabbf:
  - How they were made: fresh `npm run build`, a new sample from setup.ts in a scratch `NIGHT_SHIFT_ROOT`, the Viewer on port 4833 (stopped afterwards), and the first GET of `**/api/nights/docs/2*` failed with a 500.
  - `01-alert-1440.png` and `01-alert-390.png`: the Inbox showing the alert.
  - `02-deck-while-failed-390.png`: the deck opened while docs was still failed. It shows 0 / 1 and only the blog question.
  - `03-after-reload-390.png`: after pressing Reload.
  - `log.txt`: scrollWidth is 1440 and 390, so no sideways scroll. The button reads "1 question" while the tile reads 2. After Reload the alert is gone and the button reads "2 questions in 2 repositories".

**First impression:** one night didn't load, and the red line right under the big button tells me which one and gives me a button to retry. Clear enough.

## Findings

### D1 Note: the tile says 2, the button says 1, and nothing states the gap in numbers
- **Image:** `01-alert-390.png` and `01-alert-1440.png`, the stats row, the button and the alert.
- **Problem:** the alert sits directly under the button and names the missing repository, so the mismatch is explained where the eye lands next. I didn't find it confusing. Still, nothing says "1 question" is missing, so the owner has to work out the difference.
- **Nit:** put the count in the alert, for example "docs could not be loaded, so its 1 question is not in Start my morning."

### D2 Note: the Reload pill is a thin outline, not the house's secondary button style
- **Image:** `01-alert-1440.png`, next to the alert text.
- **Problem:** the pill is red with a thin red border. That matches the error colour and the other broken-state blocks, which use the same `bg-broken/15 text-broken` block as the App banner and the deck message. It is small but easy to tap at 390 (about 90x30). Acceptable as it is.
- **Nit:** a slightly filled background (`bg-broken/15`) would read more clearly as a button.

### D3 Note: I did not see the deck's "This night changed…" message on screen
- **Where:** the message only appears when a night changes and the new version then fails to load, which I could not set up here.
- **Judged from the text and code instead:** the wording is plain and gives one action ("Reload the Viewer and try again"). It uses the same red block as the deck's other messages (`QuestionDeck.tsx:280`). No concern.

## Rubric
1. **Does its job at a glance:** pass. The alert names the repository, the reason and the fix, and it sits right under the button it affects.
2. **Fits the house style:** pass. It uses the existing broken token and the rounded-2xl shape, with no borrowed styling.
3. **Craft:** pass. The text is readable pink-red on dark maroon and wraps cleanly at 360 and 390, and there is no debug text.
4. **States and sizes:** pass. The failed and after-Reload states were both seen, with no overflow at phone width. The deck shows only the questions it can reach (0 / 1).
5. **Honest:** pass. The alert says plainly that questions are missing rather than hiding them, and the tile still shows the true total.

## Verdict: PASS
