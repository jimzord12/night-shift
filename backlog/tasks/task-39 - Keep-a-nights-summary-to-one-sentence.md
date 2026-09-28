---
id: TASK-39
title: Keep a night's summary to one sentence
status: Done
assignee:
  - '@claude'
created_date: '2026-09-28 07:39'
updated_date: '2026-09-28 19:00'
labels:
  - cli
  - skills
dependencies: []
priority: medium
ordinal: 39000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Split from TASK-26 on 2026-09-28. The Night Report and the Inbox cards show the agent's summary as a headline; long summaries read as a wall of text (D24). The tool refuses a summary over the headline limit when a night is closed (a check at close, not a tightened maxLength in night@1, so older files stay valid) and the skill tells the agent to write one sentence. File-shape change: update the owner's Adopters in the same change and say so in CHANGELOG.md.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The tool refuses a summary over the headline limit with a message that says so, and the skill tells the agent to write one sentence (test)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [x] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Integrated to main after five review rounds (reports in docs/work/TASK-29/reviews; dispositions in TASK-29 notes; round 5 code, design and visual PASS). npm run check and npm run test:ui pass on the merged revision. Screenshots looked at: .local/evidence/2026-09-28-shapes/r5, r6 in the shapes worktree. Show in folder: POST reveal returned 200 and Explorer opened a window on the file's folder (seen in the shell window list, not in a screenshot). Not done yet: the CHANGELOG entry lands with release v16 (DoD 4).
<!-- SECTION:FINAL_SUMMARY:END -->
