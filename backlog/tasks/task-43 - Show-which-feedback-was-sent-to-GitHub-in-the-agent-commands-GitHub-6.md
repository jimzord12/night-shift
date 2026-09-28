---
id: TASK-43
title: 'Show which feedback was sent to GitHub in the agent commands (GitHub #6)'
status: Queued
assignee: []
created_date: '2026-09-28 10:24'
labels:
  - cli
dependencies: []
references:
  - 'https://github.com/jimzord12/night-shift/issues/6'
priority: medium
type: enhancement
ordinal: 43000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GitHub #6 (missing-block, from an Adopter's night 2026-09-28-a). Send to GitHub writes feedback[].sent = {at, via, url} into the night file, but no command shows it, so an agent cannot tell sent feedback from feedback awaiting the developer without reading the JSON (in practice an agent reported a sent item as awaiting). Show feedback state in night-shift status (for example 'Feedback: F1 sent (#4), F2 awaiting the developer'), optionally a feedback list command.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 night-shift status shows, per night with feedback, which items were sent (with the issue link) and which await the developer (test on real files)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->
