---
id: TASK-38
title: 'Show what the next night will pick up, across repositories'
status: Queued
assignee: []
created_date: '2026-09-28 06:45'
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
- [ ] #1 Opening the Viewer shows, per repository, every open follow-up item the next night will plan (title, kind, the owner's decision if any, the night it came from), in one place (screenshot on sample and on real data)
- [ ] #2 An item done, skipped or carried leaves that list without a reload of the files by hand (test on real files)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
