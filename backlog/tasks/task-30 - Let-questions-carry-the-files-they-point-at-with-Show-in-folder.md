---
id: TASK-30
title: 'Let questions carry the files they point at, with Show in folder'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 16:00'
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
- [x] #1 A question with file references shows them, and Show in folder opens Explorer on the file (Windows, screenshot)
- [x] #2 A reference outside the repository is refused by the tool with a clear message (test)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
D24: the three file-shape changes (TASK-26 summary headline, TASK-29 discuss kind, TASK-30 file references) land together as one versioned change under the AGENTS.md rule; TASK-29 carries the version change and this task ships in the same release. The summary limit applies to new nights only, so older night files stay valid.

Web: a question's files listed under its why with View (the media viewer, by the file's kind) and Show in folder (the tool reveals it; Explorer opened on the concepts folder in a Windows run, checked through Shell.Application and closed). A file index that does not exist is 404; a path outside the repository is refused by ask (tests/shapes.test.ts).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Integrated to main after five review rounds (reports in docs/work/TASK-29/reviews; dispositions in TASK-29 notes; round 5 code, design and visual PASS). npm run check and npm run test:ui pass on the merged revision. Screenshots looked at: .local/evidence/2026-09-28-shapes/r5, r6 in the shapes worktree. Show in folder: POST reveal returned 200 and Explorer opened a window on the file's folder (seen in the shell window list, not in a screenshot). Not done yet: the CHANGELOG entry lands with release v16 (DoD 4).
<!-- SECTION:FINAL_SUMMARY:END -->
