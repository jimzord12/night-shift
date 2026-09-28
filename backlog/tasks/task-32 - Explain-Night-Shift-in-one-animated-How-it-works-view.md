---
id: TASK-32
title: Explain Night Shift in one animated How it works view
status: Review
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 13:01'
labels:
  - viewer
dependencies:
  - TASK-28
priority: medium
type: feature
ordinal: 32000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. The owner forgets the concepts between mornings (what a follow-up or hand-over is). One animated view of the whole loop: an agent works overnight, a Night Report appears, the owner answers, saves for the next agent, starts that agent, and the loop repeats. Shown on the first run (no nights) and behind a ? beside the few terms that need it: save for the next agent, the six outcomes, stopped early. No docs page.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With no nights the Viewer shows the explainer; the ? beside Save for the next agent opens it at that step (screenshot)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built on feat/explainer (from feat/save-gate, since the ? sits on the gate). web/src/Explainer.tsx: HowItWorks (five steps on a ring, autoplay only on the first run and never with reduced motion), ExplainerOverlay (Esc and arrows captured so the deck behind never sees a key), HelpDot, explain() by a window event. Placed: the empty Inbox, the header ?, the gate's Save, the Report's Save row, its outcome counts and stopped-early line. Evidence: .local/evidence/2026-09-28-explainer/r2/{1440,390} (log.txt: the ? opens at Save, ArrowRight moves, Esc closes the explainer and leaves the deck open, no console errors, no sideways scroll).

Review round 1 (docs/work/TASK-32/reviews/01-*): code, design and visual FINDINGS. Dispositions: design D1 / visual V1 Blocking fixed (the ring's centre label no longer takes the clicks; steps 4 and 2 open by click). Visual V2 / code m1 fixed: Tab and Shift+Tab wrap inside the dialog (0 of 50 presses left it; the gate's Save stays unsaved). Code M1 fixed: evidence of the gate before its ?, and a settled report of a night that stopped early (.local/evidence/2026-09-28-explainer/r3/{1440,390}). Design D2 / visual V3 fixed: a 190 px ring and smaller titles below sm. Design D3 / visual V5 fixed: each ? sits with its words (inside the last outcome count, inline after the stopped-early text). D4 fixed (curly quotes); D5 fixed (legend rows align at the top); D6 fixed (Answer uses the note icon). Code N3 fixed ('they carry over once you save for the next agent'). Code N1 (no ? on Inbox cards and History) no action: the Report is where the terms are explained, the Inbox has the header ?. N2 (reduced motion beyond autoplay) and N4 (drag-select closes, background scroll, live region) deferred to TASK-40. Visual V4 (icons without words) no action: the centre names the current step.
<!-- SECTION:NOTES:END -->
