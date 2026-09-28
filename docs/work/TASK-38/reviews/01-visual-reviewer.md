# Visual review round 1: TASK-38

**Viewer:** dev · 26c7f04 (I rebuilt `web/dist` and got the same asset hashes, so the build matched head). Three servers on fresh `setup.ts` samples in my scratchpad:
- :4851 for 1440, full sample
- :4852 for 390, full sample
- :4853 for the empty state, `waiting` sample

All three servers are stopped. Playwright came from agentic-wave.

**Journeys:**
- **Tab and count on load:** walked, 1440 and 390. The tab shows "Next night 5".
- **The list:** walked, 1440 and 390.
  - mobile: A1 and A2 both show as Unfinished, with "Left:".
  - blog: A1 is "Your decision → Giscus" with "Your note: Keep it on GitHub.", A2 is "Needs your answer", A3 is Unfinished.
- **"From the Night of Sat 26 Sept" link:** walked, 1440 and 390. It opens blog's report on Morning, scrolled to the top.
- **Answer blog's question, then back to Next night:** walked, 1440 and 390. Picked Buttondown and saved. Without a reload, A2 now reads "Your decision · Which newsletter provider? → Buttondown", the count stays 5 and Questions drops from 2 to 1.
- **Create follow-up on search:** walked, 1440 and 390. The count goes from 5 to 6 at once. A search section appears with A1 "Filter by size".
- **Empty state:** walked, 1440 and 390. While the page stayed open I resolved items from the CLI (A1 done, then A2 skipped with `--reason`). After each change I switched tabs, with no reload:
  - after A1: the list showed 1 item and the badge 1;
  - after A2: "Nothing is scheduled…" and the badge disappeared.
- **Tab bar on a phone:** the journey finishes, but only by swiping a bar that gives no hint it scrolls (V1).
- **Sideways scroll:** none at 1440, 390 or 360 on any tab (the page width always equals the window width).

## Findings

### V1 Blocking: on a phone, Trends is hidden and History is cut off, with no hint that the tab bar scrolls
- **Journey/step:** load, then look at the tab bar.
- **Width:** 390 and 360.
- **Saw:**
  - At 390 with badges showing, the bar holds 350px but its content is 404px. "History" ends at the edge and Trends is completely out of view.
  - At 360 the label reads "Histo" and Trends is out of view.
  - The bar's scrollbar is hidden and there is no fade at the edge. Only a finger swipe on the bar reveals Trends (a simulated swipe scrolled it 54px).
  - When no badges show, all five tabs fit, so the problem appears exactly on mornings with open work.
- **Expected:** all five tabs visible, or an obvious sign that the bar scrolls.
- **Screenshots:**
  - `.local/evidence/2026-09-28-visual-next-night-r1/j390-01-load.png`
  - `tabs-360-01-load.png`
  - `tabs-390-05-finger-swipe.png`
  - `empty2-390-03-empty.png` (all five fit without badges)
- **Fix:** below `sm`, fit five tabs at 360 by showing "Next" instead of "Next night" and using `px-1.5`, then re-measure (about 83px has to go at 360). Failing that, add a fade on the right edge of the bar.

### V2 Note: Morning keeps showing an old state after follow-up items are resolved
- **Journey/step:** empty state, after resolving from the CLI and switching back to Morning.
- **Width:** 1440 and 390.
- **Saw:** the Morning chip still reads "mobile · Waiting for an agent · 3 days" while Next night says "Nothing is scheduled". `/api/overview` already reports `follow_up_open: 0`, so the Viewer is showing old data.
- **Screenshot:** `empty2-1440-04-morning.png`
- **Fix:** when the Next night fetch returns a different open count, also reload the overview. This existed before the change (Morning never refreshed on its own), but the two tabs now contradict each other on screen.

### V3 Nit: a failed task's "Left:" line runs the failure reason and the unmet criteria together
- **Saw:** "Left: failed: Sizes are free text in the catalogue; It works; Screenshot attached". It reads as one run-on sentence.
- **Screenshot:** `j1440-10-next-after-create.png`

### V4 Nit: the list is in registration order
- **Saw:** search lands between mobile and blog. It does not follow the order of the nights.

## Console
Clean. No console errors, page errors, failed requests or HTTP 4xx/5xx in any run. Logs are in the evidence folder: `j1440-log.txt`, `j390-log.txt`, `tabs-log.txt`, `empty2-log.txt`.

Other: `docs/work/TASK-38/` is untracked in the repository. I did not create it.

## Verdict: FINDINGS
One Blocking finding (V1). Everything in TASK-38 itself passes at both widths. Evidence folder: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-next-night-r1\`
