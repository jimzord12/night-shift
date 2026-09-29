# Code review round 1: TASK-22 (feat/start-check, aa5fa09)

Verdict: FINDINGS. Lead lenses: versioning and compatibility; whether the rule stops a careless
agent and whether the tests fail without it.

## Findings

- B1 Blocking (SKILL.md:60-61, 83; design.md plan.json example; scripts/sandbox/scenarios.ts:74;
  D33): `git commit --dry-run --allow-empty -m "start check"` exits 1 on a clean tree, with only
  unstaged changes, and in a repository without commits (git 2.47; `--dry-run` ignores
  `--allow-empty`); it also skips pre-commit hooks. An honest agent is refused every night; one
  that "fixes" it fabricates exit 0. Fix: a real empty commit on the night's branch.
- M1 Material (SKILL.md:62-69; D33): a permission approved once passes the check and prompts
  again at night; the agent cannot see the wait. Have the agent tell the developer to answer
  prompts with "don't ask again"; record the limit in D33.
- m1 Minor: design.md:181, glossary.md:19, AGENTS.md:164 still say the plan is @2.
- m2 Minor (src/night.ts:169, schemas/plan.schema.json:27, src/store.ts:254): a @1/@2 input is
  stored as plan@3 without start_checks; a bad @2 input is told it "does not match plan@3".
  Low impact: nothing reads plan.json back.
- m3 Minor: src/night.ts:146 `}  const ids` on one line; SKILL.md:71 no blank line after the
  heading; decisions.md and tests/night.test.ts lack a final newline.
- N1 Note: `[{ "command": "true", "exit_code": 0, "excerpt": "" }]` or a plan written at @2
  passes; accepted by the settled design. A minimum excerpt length is cheap. The checks live only
  in the git-ignored plan.json; the developer never sees them in the morning.

Compatibility: older plans still start; an older release refuses plan@3 through the schema enum;
the Viewer, `check` and history copies read no plan. Both new tests fail with the guard deleted
or applied to every version.

## Checks rerun

`npm run check` exit 0, 82 tests; the dry-run commit on clean, unstaged, staged, empty-repo and
failing-hook trees in a scratch repository (results as in B1).
