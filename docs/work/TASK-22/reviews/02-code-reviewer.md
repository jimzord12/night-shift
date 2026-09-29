# Code review round 2: TASK-22 (feat/start-check, 1aac8cc)

Verdict: FINDINGS. Lead lenses: the refused-start notification path; whether skill step 3 passes
on a normal healthy repository.

## Findings

- M1 Material (SKILL.md:69-71; design plan example; scripts/sandbox/scenarios.ts:73): the check
  commit sweeps the developer's staged work into itself (git 2.47.1: `1 file changed`); hooks run
  against it. Fix: `git commit --allow-empty --only -m …` (tested: exit 0, hooks run, empty,
  staged file stays staged), as src/repo.ts `commitPath` already does.
- M2 Material (SKILL.md:70): `night-shift: start check` fails a conventional-commits commit-msg
  hook (tested with its header pattern); `chore: night-shift start check` passes. Tell the agent
  to follow the repository's commit convention.
- M3 Material (SKILL.md:75-79 against design.md:78-81, decisions.md:486-487,
  src/cli.ts:235-244): the refused-start notification is unreachable for an agent that follows
  the skill, which says not to run `start`. Have the agent run `start` with the failed check, or
  drop the claim.
- m1 Minor (SKILL.md:69): no instruction to create or switch to tonight's branch before the
  commit check (an agent alone commits on whatever is checked out).
- m2 Minor (design.md:502-512; src/cli.ts:39, 316; src/notify.ts:1): notification docs say only
  "when a night ends".
- N1 `plan.schema === PLAN_SCHEMA` ties enforcement to the newest version; a future @4 would stop
  checking @3. A check stuck on a prompt never returns (the D33 limit). Each night leaves an empty
  commit. The tool's own history commits would also fail a commitlint hook (predates this change).

Round-1 dispositions B1, M1, red suite, m1-m3 verified. Notification path: exit 1 and the refusal
on stderr with notifications unset, on with a failing command, on with an unknown command, and on
with a working command; no other refusal notifies; the name matches the night-ended one and no
registry is written on a refusal.

## Checks rerun

`npm run check` exit 0, 83 tests; the CLI with a scratch NIGHT_SHIFT_ROOT in four notify states;
commit variants in scratch repositories (commitlint simulated by a commit-msg hook).
