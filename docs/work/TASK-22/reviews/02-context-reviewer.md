# Context review round 2: TASK-22 (feat/start-check, 1aac8cc)

Verdict: FINDINGS. Round-1 findings fixed as described; two new problems from the fixes.

## Material

1. SKILL.md:69-71: the "empty" commit includes staged work: with a file staged,
   `git commit --allow-empty -m "night-shift: start check"` commits it (checked). Same command in
   the plan example (SKILL.md:94), design, scripts/sandbox/scenarios.ts, D33. Fix:
   `git commit --allow-empty --only -m "night-shift: start check"` (empty commit, index kept).
2. SKILL.md:75-79 against design.md:79-82, D33 decisions.md:486-488, src/cli.ts:53-54: the
   notification never fires for a compliant agent, since the skill says not to run `start`. Fix:
   list the failed check with its real exit code and run `start` anyway (the tool refuses and
   notifies), then tell the developer and stop; or drop the promise.

## Minor

3. SKILL.md:75-79: "stop" and "run every check again" pull against each other on a first night
   where checks prompt and are then allowed for good.
4. design.md:77-82 runs the checks before the follow-ups; SKILL.md the other way round. The
   design's order serves the aim better.
5. design.md:79-81: the notification needs "when notifications are on".
6. decisions.md:490 is 125 characters; `don't ask again` as code where the skill quotes it.
7. design.md:82-83 ragged wrap.
8. TASK-50: no area label, no acceptance criteria; an undecided visible change should be an
   `Idea:` at Low priority, discussed with the owner first.

## Notes

- Every night leaves a start-check commit; say it stays, do not undo it.
- A check that hangs on a prompt after the developer left blocks the agent before `start`; D33's
  Limit could say so.
- The refusal message agrees with the skill; design defers to the Lifecycle without duplication;
  the CLI docs and the glossary row are accurate.
