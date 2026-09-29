---
id: TASK-22
title: 'Idea: a preflight at start that the night can commit and reach its services'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-26 12:36'
updated_date: '2026-09-29 21:42'
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
- [x] #2 The night skill runs each kind of command the night needs once before planning (tests, a commit, its services) and stops and tells the developer when one fails or waits for a permission
- [x] #3 plan@3 lists start_checks; night-shift start refuses a plan@3 without them or with a failed one, and nothing is written; plan@1 and plan@2 still start (tested)
- [x] #4 The CLI docs, design, D33 and the sandbox scenarios use plan@3
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [x] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [x] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [x] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Idea: discuss with the owner before implementing.

2026-09-26: v11 adds night-shift allow (D23) for the tool's own permissions. The wider preflight (can the night commit, run tests, reach its services) is still open.

2026-09-29: the owner said yes, super important. Design choices to bring: how the check runs, and whether a failed check stops the night.

2026-09-30: the owner chose real commands at start and stop-and-tell on failure. The checks run through the agent's own tools, since only those meet the harness's permission prompts; the tool enforces that they were run and passed.

Review round 1 (docs/work/TASK-22/reviews/): code and context FINDINGS. Blocking: the dry-run commit check exits 1 on a clean tree (confirmed): the skill now makes a real empty commit on the night's branch, which also runs the hooks; examples, design and D33 follow. Material: a one-time yes passes a check: the agent first tells the developer to answer prompts with don't ask again, and reruns every check after a fix (limit recorded in D33); a red suite: run one passing test file; stale plan@2 pointers (design, AGENTS.md, glossary) fixed; the Lifecycle Start bullet now owns the behaviour; glossary Start check added. Minor: formatting, trailing newlines, the stored-@3 wording, the Skills table, an excerpt must not be empty, the shape error names the version range. Added beyond the reports: a refused start raises the desktop notification (tested), so a developer who has left still hears. Filed: showing the checks in the Night Report.

Review round 2 (docs/work/TASK-22/reviews/02-*): code and context FINDINGS, fixed: the check commit uses --only (staged work stays out and staged, tested by hand) and the repository's commit convention (chore: night-shift start check), on tonight's branch, and stays; a failed check is handed to night-shift start with tasks [] so the tool refuses and notifies, then the agent tells and stops (test uses that exact plan); the checks moved to step 2, before follow-ups, as the design says; a check allowed for good is simply rerun; enforcement applies to plan@3 and anything newer; notification docs name the refused start; D33 limits include a check stuck on a prompt; TASK-50 made an Idea.

Review round 3 (docs/work/TASK-22/reviews/03-*): code FINDINGS (M1 the example service check listed containers and passed with the database stopped: now a real ping, docker compose exec db pg_isready, and the rule says a listing is not enough; m1, m2 fixed), context FINDINGS (the glossary step number; the refusal message now says stop, then rerun after the fix; a refused-permission check is recorded with exit code 1; Skills table order; D33 wording; wraps; TASK-50 label). Also: step 2 is skipped when continuing an open night. Left as is: the toast button reads Open the report while a refused start opens the Viewer's home (cosmetic).

Review round 4 (docs/work/TASK-22/reviews/04-*): code PASS, context PASS. Fixed after: a failed start check refuses any plan version (m2, tested with plan@2); status says to run the start checks first (N2); the refusal test pins 'and stop' (N3); context minors (wraps, 'the agent then tells'). The service check was verified against a real Postgres container, running and stopped.
<!-- SECTION:NOTES:END -->
