# Code review round 4: TASK-22 (feat/start-check, f50f3e4)

Verdict: PASS. No Blocking or Material finding open. Lead lenses: whether step 2 fails on a healthy
repository or passes on a broken one; whether the refusal message and the skill agree. Walked
step 1, step 2 and start through the real CLI in a scratch repository with a real Postgres
container: the healthy and refused paths work end to end.

## Findings

- m1 Minor (round 3's M1): verified closed. `docker compose exec db pg_isready` exits 0 with the
  database running (PowerShell and Git Bash, no TTY) and 1 with it stopped; `docker compose ps
  --status running` still exits 0 with it stopped, so the skill's warning is accurate.
- m2 Minor (src/night.ts:148-154, 179, 212): a plan@2 carrying a failed start check opens the night,
  prints "Start checks passed" and stores a plan@3 with the failed check. Check failed entries
  whenever `start_checks` is present; keep "must be present" for @3 and newer.

## Notes

- N1 a freshly created Postgres volume answers pg_isready with exit 2, then one transient exit 1,
  for a second or two after `up`; rerunning the checks covers it.
- N2 after a refused start, `status` says "Start a night with: night-shift start", skipping the
  checks.
- N3 no test pins "and stop" in the refusal message.
- N4 each rerun adds another empty check commit; harmless.
- N5 "don't ask again" on one command may save a narrower rule than the night needs; covered by
  D33's limits.

Round-3 dispositions verified. Tests fail with the guard gutted, the notify call removed or the
guard moved after "no tasks".

## Checks rerun

`npm run typecheck && npm test` 83/83; a CLI walk on a `git archive f50f3e4` export with a scratch
NIGHT_SHIFT_ROOT and a recorder command (status, branch, the `--only` commit with staged work,
pg_isready against a stopped database then `start` with `tasks: []`: exit 1, one notification, no
night; database restarted, checks rerun, start: exit 0; the plan@2 case); the Docker comparisons.
