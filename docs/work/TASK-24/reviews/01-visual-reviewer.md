# Visual review round 1: TASK-24

Viewer: dev · 82f0151 (web rebuilt from head). Two scratch Viewers on the synthetic sample from `setup.ts`: port 4833 for 1440x900 and port 4834 for 390x844. Scratch roots are under the session scratchpad, not ~/.night-shift. Both servers are stopped.

Journeys:
- **Morning on load, both widths:** walked to the end. The six nights that are not Done show as chips, each with one badge. The Viewer opened on shop, the newest night that was the owner's turn (New), and it turned Done as soon as it opened. The mobile chip reads "Waiting for an agent · 3 days", plus "1 never started" at 1440 only (hidden on the phone by design).
- **History, both widths:** the badges match the chips. billing shows Done plus a grey "Stopped early: 2 tasks never started". infra (stopped early, every task finished) shows Done with no such line. It breaks on the phone (V1).
- **docs deck, both widths:** walked to the end. Keys `2` then `Enter` saved the answer, and All clear showed. Without a reload, the chip and the header moved from Needs answers to Ready to save.
- **search, Create follow-up, both widths:** walked to the end. It moved to "Waiting for an agent" live (no days count, correctly, since the follow-up is new). The same worked on docs.
- **crm (New):** opening it showed Done live. With nothing left on the owner's side, the label changed to "All caught up".
- **billing, mobile and infra reports, both widths:** badge, the grey line and the follow-up items are all correct.
- **Reload:** crm (now Done) dropped out of Morning as expected.

## Findings

### V1 Blocking: History scrolls sideways on a phone
Journey/step: History - Width: 390 (also 360) - Saw: `document.scrollWidth` is 406. The "Stopped early: 2 tasks never started" line runs past the billing card's edge and is cut off ("never sta…"). mobile's line (right edge at 394px) overflows the same way. At 360 wide the line is still 406px, so it never shrinks. - Expected: no sideways scroll; the line wraps or truncates inside the card. - Screenshot: `.local/evidence/2026-09-28-visual-owner-states-r1/02-history-390.png`, `16-history-billing-card-390.png` - Fix: in `web/src/Views.tsx:77` make the wrapper `flex min-w-0`. The alternative is `max-w-full` on the `StoppedEarly` span in `ui.tsx`. Truncate cannot work today because an `inline-flex` inside a block div is as wide as its content.

### V2 Note: a night opened from History starts mid-page on the phone
Journey/step: History → billing - Width: 390 - Saw: the report opens with the page still scrolled (scrollY 1785; the h1 is about 1087px above the screen), so the owner lands in "What happened" with no badge or header in view. - Expected: the report opens at its top. - Screenshot: `12-report-billing-390.png` (landing view), `17-report-billing-top-390.png` (after scrolling up) - Fix: `scrollTo(0, 0)` when a night is picked. Probably older than this task.

### V3 Note: "Waiting for you" heads chips that are not the owner's turn
Journey/step: Morning - Width: both - Saw: "WAITING FOR YOU" labels a row that starts with api (Running) and also holds mobile (Waiting for an agent) and shop (Done). - Expected: a label that fits the whole list, or "N waiting for you". - Screenshot: `01-morning-1440.png`

### V4 Note: the task tag in the question deck is red
Journey/step: docs deck - Width: both - Saw: the "T2" tag is now `broken` (red). That task is blocked, and D24 says red only when something broke. - Screenshot: `04-deck-1440.png` - Fix: use a neutral or amber tag. This is for `design-reviewer` to confirm.

### V5 Note: the sample script has closing times in the future
Seen on reload (`15-morning-reload-*.png`). shop's closing time is `2026-09-28T02:00` and docs' is 03:00, both later than the run clock (about 01:54). The read mark written on open is earlier than `ended_at`, so after a reload shop counts as New again and Morning reopens on it. This is a data artifact, not a product defect; move the setup times into the past.

Nit: the metrics row shows "unknown unknown" on every synthetic night. It is true, but noisy (older than this task).

## Console
Clean at both widths: no console messages, no page errors, no failed requests, no HTTP 4xx or 5xx (`console-1440.txt`, `console-390.txt`).

## Verdict: FINDINGS
One Blocking finding (V1: sideways scroll in History on a phone); everything else in TASK-24 behaved as specified. Evidence folder: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-owner-states-r1\`
