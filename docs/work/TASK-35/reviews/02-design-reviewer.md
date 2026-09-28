# Design review round 2: TASK-35

Images inspected:
- Author's shots: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-proposals\r2\header-1440.png` and `header-390.png`, with one proposal. Their footer reads `dev · 37f76b7`, not d1941b2. The only App.tsx change between the two revisions is how Reload re-fetches the count. The markup is identical, so the shots are right in substance.
- My fresh shots at d1941b2 (footer confirms it), with 128 proposals, in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-proposals-design-r2\`: `header-1440.png`, `header-390.png`, `header-320.png` and `hover-1440.png`. I served them on scratch data, with no originals touched, and stopped the Viewer afterwards.

First impression: "(GitHub mark) 1 proposal ↗". It's a count of things on GitHub, and it opens GitHub. Clear on both laptop and phone.

## Findings

### D1 (round 1 Blocking): resolved
At every width the pill now shows the GitHub mark, the count and an outward-arrow icon. The word "proposals" joins from `sm` up. On a phone, "(GitHub) 128 ↗" reads as GitHub items that open outside the Viewer. The link opens in a new tab (`target=_blank`), and the tooltip/label says "on GitHub (the Night Shift Repo)".

### D2 Note: the pill wraps to its own row on a phone once the count is large
Image: `2026-09-28-proposals-design-r2\header-390.png`, `header-320.png`. Where: the header's right cluster.
- With one proposal at 390, the pill sits beside "Night Shift" on the same row.
- With 128 proposals, the pill and the reload button drop to a second row, right-aligned, above the tab bar. Page width stays exactly 390 / 320, so nothing scrolls sideways and nothing clips.
- The cost is about 40px of extra header height on a phone. That's acceptable and not blocking, because a count in the hundreds is unlikely in practice.
- Nit: if you want it to stay on one row, tighten the pill's padding or gap below `sm`.

### D3 Nit: no visible hover change
Image: `hover-1440.png`. The pill looks the same when hovered. The reload button beside it behaves the same way, so this is consistent with the house style and irrelevant on a phone. Leave it.

### D4 Note: shoot at the committed revision
The author's r2 shots show 37f76b7. There's no visual difference this time, but the evidence should carry the reviewed revision.

What passes:
1. **Glance:** the pill says what it counts and where it goes, at 1440, 390 and 320.
2. **House style:** neutral glass with a white label matches the reload button. It is a secondary, moon-like control and not amber, which is correct per D24.
3. **Craft:**
   - The icon, count and arrow sit on one baseline, and the pill's height matches the reload button.
   - A three-digit count fits without clipping.
   - The "1 proposal" / "128 proposals" plural is correct.
4. **States and sizes:**
   - With zero proposals or no `gh`, the pill is hidden. That was checked in round 1, and the markup hasn't changed since.
   - Large counts and a 320px width cause no overflow.
5. **Honest:** it is a live count from GitHub, with nothing presented as real that isn't.

## Verdict: PASS
