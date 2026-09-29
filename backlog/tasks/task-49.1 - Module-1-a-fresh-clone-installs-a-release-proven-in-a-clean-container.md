---
id: TASK-49.1
title: 'Module 1: a fresh clone installs a release, proven in a clean container'
status: Active
assignee: []
created_date: '2026-09-29 08:36'
updated_date: '2026-09-29 10:36'
labels:
  - chore
dependencies: []
parent_task_id: TASK-49
priority: high
ordinal: 49000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Absorbs TASK-21. Today npm run release builds only a new tag and switch needs an existing build, so a stranger who clones cannot get a night-shift command. Add an install of an existing tag, point the README at it, and prove it in a fresh Linux container that clones the public repository, installs the tag, and runs a smoke night (install, start, close, the Viewer answering).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A fresh clone builds and installs a published release with npm run release build/install, proven by npm run check:clean in a clean container (PASS log)
- [ ] #2 Build, install and publish are separate verbs; publish tags exactly the commit the candidate was built from; a candidate can be rebuilt, a published release never (tests on real git with a bare origin, mutants)
- [ ] #3 Every script answers docs, and AGENTS.md tells agents to use it (test)
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
Review round 1 (031a55e): context FINDINGS (owner.md old commands, D32 names D10, the docs rule scoped to scripts/ and the CLI and binding new scripts, check:clean needs --; minors: old wording, Candidate term, glossary dates, README night-shift docs/--help, npm ci in Develop; notes taken: newest-tag command, releasing row points at npm run release docs). Code FINDINGS: F1 candidate never rebuilt / stale candidate installs under a published number: build rebuilds a candidate, install refuses a candidate whose number was published from another commit (test, 2 mutants killed); F2 offline candidate refused; F3 half-finished publish finished by publishing again; F4 a tag only here (or differing from origin's) refused by build; F5 -- documented, PowerShell form added; F6 failed build leaves nothing to install (test); F7 smoke version match tightened; asset check left (index.html served, assets not fetched). A reviewer's scratch npm ci emptied the worktree's node_modules through a junction; restored with npm ci.
<!-- SECTION:NOTES:END -->
