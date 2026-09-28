# Design review round 1: TASK-35

Images inspected:
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-proposals\one\header-1440.png` and `one\header-390.png`, plus `none\header-1440.png` and `none\header-390.png`. The footer in these reads `dev · 9783de5`, so they were taken from the working tree before commit d243045.
- Fresh shots I took at d243045 with 12 open proposals, in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-proposals-design-r1\`: `header-1440.png`, `header-390.png`, `header-320.png` and `hover-1440.png`. They show the same pill as the author's. I served them on a scratch copy of the data and stopped the Viewer afterwards.

First impression: on a laptop, "12 proposals" says what it counts but not where it goes. On a phone, "(paper plane) 12" could be anything: unread messages, sent items, a queue.

## Findings

### D1 Blocking: nothing says the pill opens GitHub, and on a phone it doesn't say what it counts
Image: `one\header-390.png`, `2026-09-28-proposals-design-r1\header-390.png`, `header-1440.png`
Where: right side of the header, the pill next to the reload button.
Problem: the brief asks whether a developer can tell at a glance what the pill is and that it leads to GitHub. They can't.
- At 1440 the words "1 proposal" / "12 proposals" name what is counted. Nothing visible signals GitHub or a link that leaves the Viewer: no GitHub mark and no ↗ arrow. The tooltip says "on the Night Shift Repo", not GitHub, and tooltips don't exist on a phone anyway.
- Below the `sm` breakpoint the word is hidden, leaving a paper plane and a bare number. That breaks criterion 1 for the owner's main device. The only hint is that the paper plane also appears on the "Send N to GitHub" button in the report, which only someone who remembers that button will connect.

Fix (smallest): at every width, show a GitHub mark instead of the paper plane, or add a small ↗ after the count. Either one says "this opens GitHub" and makes the number read as issues. Also add "on GitHub" to the `title`/`aria-label` text. At 390 there is no room to keep the word visible (the "Night Shift" title ends about 35px before the pill), so the icon has to do the work.

### D2 Note: the author's screenshots predate the commit
Image: `one\*`, `none\*`
Problem: the footer reads `9783de5`, not `d243045`. My fresh shots at d243045 render the same way, so this is not stale in substance. Also, `one\header-1440.png` is missing the amber "5" badge on "Next night" that the other shots show. That looks like the screenshot script firing before the page finished loading, not a product bug.
Fix: in the next round, shoot at the committed revision and wait until the page has settled.

### D3 Note: 320px width
Image: `2026-09-28-proposals-design-r1\header-320.png`
The pill and reload button wrap onto their own row under the title. There is no sideways scroll (page width measured at 320). Acceptable.

### D4 Nit: colour choice
The neutral glass with white/75 text matches the reload button and fits D12's moon-like secondary buttons. I would keep it neutral rather than amber, because amber means "you must act" (D24).

What passes:
- **House style (2):** passes.
- **Craft (3):** the pill aligns with the reload button and nothing clips, even with a two-digit count.
- **States (4), apart from D1:** with gh missing or zero open proposals the pill is hidden and the header stays clean (`none\*`).
- **Honesty (5):** nothing is presented as real that isn't.

## Verdict: FINDINGS
