---
id: TASK-30
title: 'Let questions carry the files they point at, with Show in folder'
status: Queued
assignee: []
created_date: '2026-09-27 21:42'
updated_date: '2026-09-27 21:54'
labels:
  - viewer
  - skills
  - cli
dependencies:
  - TASK-29
priority: medium
type: feature
ordinal: 30000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. A question like: Which of the three 2026-09-25 design concepts do we keep developing into templates? made the owner go hunting for the files. The skill requires a question that points at files to carry them (options already take an image; add references for any file). The Viewer shows them in its media viewer and offers Show in folder, which the local server opens in the file manager (Windows first; a browser link cannot open Explorer). Paths stay inside the repository. File-shape change (update the owner's Adopters, CHANGELOG).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A question with file references shows them, and Show in folder opens Explorer on the file (Windows, screenshot)
- [ ] #2 A reference outside the repository is refused by the tool with a clear message (test)
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
D24: the three file-shape changes (TASK-26 summary headline, TASK-29 discuss kind, TASK-30 file references) land together as one versioned change under the AGENTS.md rule; TASK-29 carries the version change and this task ships in the same release. The summary limit applies to new nights only, so older night files stay valid.
<!-- SECTION:NOTES:END -->
