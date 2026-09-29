---
id: TASK-22
title: 'Idea: a preflight at start that the night can commit and reach its services'
status: Active
assignee:
  - '@claude'
created_date: '2026-09-26 12:36'
updated_date: '2026-09-29 21:16'
labels:
  - skills
dependencies: []
priority: low
type: feature
ordinal: 22000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Night 1 of the v7 trial found halfway through that git commit and docker needed permission approvals nobody could give, so nothing was committed and nothing ran against a database. A start-time check (or a documented checklist in the skill) would surface this while the developer is still awake. Raised by the agent as night feedback F2.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The owner decides whether start checks permissions, the skill documents a checklist, or neither
- [ ] #2 The night skill runs each kind of command the night needs once before planning (tests, a commit, its services) and stops and tells the developer when one fails or waits for a permission
- [ ] #3 plan@3 lists start_checks; night-shift start refuses a plan@3 without them or with a failed one, and nothing is written; plan@1 and plan@2 still start (tested)
- [ ] #4 The CLI docs, design, D33 and the sandbox scenarios use plan@3
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
Idea: discuss with the owner before implementing.

2026-09-26: v11 adds night-shift allow (D23) for the tool's own permissions. The wider preflight (can the night commit, run tests, reach its services) is still open.

2026-09-29: the owner said yes, super important. Design choices to bring: how the check runs, and whether a failed check stops the night.

2026-09-30: the owner chose real commands at start and stop-and-tell on failure. The checks run through the agent's own tools, since only those meet the harness's permission prompts; the tool enforces that they were run and passed.

Review round 1 (docs/work/TASK-22/reviews/): code and context FINDINGS. Blocking: the dry-run commit check exits 1 on a clean tree (confirmed): the skill now makes a real empty commit on the night's branch, which also runs the hooks; examples, design and D33 follow. Material: a one-time yes passes a check: the agent first tells the developer to answer prompts with don't ask again, and reruns every check after a fix (limit recorded in D33); a red suite: run one passing test file; stale plan@2 pointers (design, AGENTS.md, glossary) fixed; the Lifecycle Start bullet now owns the behaviour; glossary Start check added. Minor: formatting, trailing newlines, the stored-@3 wording, the Skills table, an excerpt must not be empty, the shape error names the version range. Added beyond the reports: a refused start raises the desktop notification (tested), so a developer who has left still hears. Filed: showing the checks in the Night Report.
<!-- SECTION:NOTES:END -->
