# Code review round 3: TASK-22 (feat/start-check, d6bf436)

Verdict: FINDINGS. Lead lenses: walking skill step 2 end to end in a scratch repository (healthy
and failure paths); regressions from the step renumbering. Tests and CLI runs repeated on a
`git archive d6bf436` export.

## Findings

- M1 Material (SKILL.md:103 plan example; scripts/sandbox/scenarios.ts:74; the rule at
  SKILL.md:56-57 "one command each that talks to it"): `docker compose ps --status running`
  exits 0 with the `db` container stopped (Docker 29.7.2; plain `docker compose ps` too), so the
  example records "the database is up" while it is down. `docker compose exec db pg_isready`
  exits 1 there. Use a command that talks to the service itself.
- m1 Minor: docs/glossary.md:20 points to step 3 (fixed in the working tree, uncommitted).
- m2 Minor: no exit code defined for a command whose permission was refused (fixed in the
  working tree, uncommitted).
- N1 The refusal message lacked "stop" (fixed in the working tree); "Before anything else"
  could make an agent continuing an open night run the checks again and commit again; the
  toast's button says "Open the report" but a refused start opens the Viewer's home; the tool's
  own history commits would fail a conventional commit-msg hook (pre-existing).

Round 2 verified: the `--only` commit is empty and leaves staged work staged; the conventional
message passes a commit-msg hook; the `tasks: []` hand-off through the real CLI exits 1 and
notifies once, silently when off; tonight's branch named; notification docs updated; @3 and newer
enforced. Renumbering: cross-references correct; the only stale pointer is m1.

## Checks rerun

`npm run typecheck && npm test` 83/83 on the checkout and on the d6bf436 export; the healthy path
(night branch, npm test, the `--only` commit under pre-commit and commit-msg hooks, `start` with
three passing checks); the failure path with a real failed `pg_isready` (notify on and off); the
Docker commands for M1.
