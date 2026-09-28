---
id: TASK-38
title: 'Show what the next night will pick up, across repositories'
status: Ready
assignee:
  - '@claude'
created_date: '2026-09-28 06:45'
updated_date: '2026-09-28 07:08'
labels:
  - viewer
dependencies:
  - TASK-24
priority: high
ordinal: 38000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner request 2026-09-28, after previewing TASK-24: 'we also need a nav tab for the follow-ups, so I can instantly know what is scheduled for the next night shift'. Today the Viewer shows which nights are Waiting for an agent, but not the open follow-up items themselves across repositories; the owner has to open each night. Shape not decided: the agent recommends a 'Next night' section at the top of the Inbox (D24 cut the navigation to Inbox and History); the owner asked for a tab. Decide the shape with the owner before building. Reads existing follow-up files only (open items, their kind, decision and source night); no file-shape change. Sure: the gap is seen on the owner's real Viewer.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Opening the Viewer shows, per repository, every open follow-up item the next night will plan (title, kind, the owner's decision if any, the night it came from), in one place (screenshot on sample and on real data)
- [x] #2 An item done, skipped or carried leaves that list without a reload of the files by hand (test on real files)
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
Review round 1 (docs/work/TASK-38/reviews/01-*.md): code FINDINGS, design FINDINGS, visual FINDINGS. Dispositions:
- visual V1 Blocking (phone tabs clipped, no hint): fixed; the phone label is Next, tighter padding, and the empty Trends tab is left off a phone (D24 removes it); nav fits at 360 and 390 with counts (next-r2c).
- design D1 Blocking (wrapped night link centred): fixed; left aligned with the arrow inline.
- code F1 Material (no real-data screenshot): taken on the owner's install with the read request blocked in the browser (next-real/, log.txt: no night marked read). The real install has no open items right now (its only open item was done by day at 09:57), so it shows the empty state; the filled list is on the sample.
- code F2 Minor (a running night's items listed as next): fixed; items a running night planned or skipped are left out; tested (start, then close without starting it).
- design D3 / code N4 (count blue with an item needing an answer): fixed, amber then. D5 (decision looked like a link): fixed. D4 / visual V3 ('Left:' run-on): 'Still to do:' joined with dots. visual V4 (order): newest follow-up first.
- visual V2 (Morning stale after items resolved elsewhere): not changed; Morning never refreshed on its own, the reload button refreshes both; TASK-25 rebuilds that page.
- code N1 (route repeats openItems), N2 (extra fetches), N3, design D2, D6, D7: no change.

Review round 2 (docs/work/TASK-38/reviews/02-*.md): code PASS, design PASS, visual PASS; loop stopped. Dispositions (no code change, so the PASS snapshot 3ab0d73 stands):
- code M3 (a real repository named in these notes): fixed; the notes reworded and the pushed commit replaced before main (backup tag kept locally).
- code M1 (an open night whose session is gone still hides its items until the overview's recovery runs): kept; any reload runs recovery and the session-end hook closes such nights; narrow.
- code M2 (the skipped_follow_ups line and the repository sort have no test): kept untested; both were walked in visual round 2 (a skipped item left the list; order search, blog, mobile).
- design D1 / visual V1 (arrow wraps alone at 360), design D3-D5, code N1-N2: no change, cosmetic.
- visual V2 (Morning keeps the old night Waiting for an agent while a running night has its items): belongs to the owner state (TASK-24) and Morning (TASK-25); noted for TASK-25.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
A Next night tab (D26, the owner's choice) lists every open follow-up item across the registered repositories: per repository, newest follow-up first, grouped by the night it came from with a link back, each with its kind (Your decision and Unfinished blue, Needs your answer amber), the decision, the owner's note and what is still to do; the tab count turns amber when an item needs an answer. Items a running night has taken on are left out. New route GET /api/next-night; follow-up files that cannot be read show as problems. Also npm run view: this checkout's Viewer on the real install, port 4748. Checks: npm run check exit 0 (33 tests, one through the new route covering creation, answer, a running night, resolution and a broken file); screenshots at 1440, 390 and 360 on a synthetic sample, and on the real install (empty now: nothing open). Review: 2 rounds x 3 reviewers, round 2 all PASS. Not verified: the filled tab on real data (nothing is open there today).
<!-- SECTION:FINAL_SUMMARY:END -->
