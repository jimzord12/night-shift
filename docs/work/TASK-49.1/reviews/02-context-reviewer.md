Context review, round 2, TASK-49.1 (812c092..7cb0af0; fixes in 031a55e..7cb0af0). Worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`.

What I expected before reading the diff: releases are three separate verbs (D32). Every script agents run prints its own manual when given `docs`. One short rule in AGENTS.md sends agents to that manual and binds new scripts. No live file still names the old commands. The manuals match the code.

## Round-1 fixes: all verified

- M1 `docs/owner.md:57` now names build, install and publish.
- M2 `docs/decisions.md:475`: D32 now says it replaces D10. D10 itself is untouched.
- M3 `AGENTS.md:106-109`: the rule is scoped to `scripts/` and the CLI, and binds new scripts (but see Minor 2).
- M4: the check:clean manual and its usage refusal both show `--`, plus the PowerShell form.
- Minors fixed:
  - 5: `AGENTS.md:179` wording.
  - 6: `Candidate` in backticks at `AGENTS.md:170`.
  - 7: glossary date says "redefined".
  - 9: `npm ci # once` added to README Develop.
- Both notes were taken: the newest-tag command in README, and the releasing row in "Read when" now points at `npm run release docs`.

## The manuals against the round-1 code changes

All three `docs` outputs agree with the code.

- **Release manual.** "a candidate may be built again, a published release never" matches `build()`: it refuses only a manifest without `candidate`. "A publish that stopped half way is finished by running publish again" matches `publish()`: it skips the tag or the push when that part already names `m.commit`, and the push-failure message says to rerun.
- **Refusals not in the manual.** The new refusals (a candidate while offline, a tag only on this machine, a stale candidate at install) each say what to do next, so the manual does not need to list them.
- **check:clean manual.** Its steps match `scripts/clean/smoke.sh`, and the default version matches `clean-check.ts:55-60`.
- **CLI manual.** `night-shift docs` matches `src/cli.ts`.
- **Glossary.** `candidate: true` matches `src/version.ts:14`.

## Material

1. **`CHANGELOG.md:3`: a broken pointer that round 1 missed.** The header still reads "`npm run release vN` cuts them". That command now refuses to run. This line is the file's standing rule, not a dated entry, so correcting it does not edit history. Every future release entry is written under it. Smallest fix: "One entry per release tag (`npm run release publish vN`); tags are never moved." Leave the entries below it alone.

## Minor

1. **`README.md:51` and `:83` send a stranger to `night-shift docs`.** The newest published tag is still v18, and v18 has no `docs` command. `git show v18:src/cli.ts` shows the "unknown command … run night-shift --help" fallback, so a stranger hits that error. This is the half of round-1 finding 8 that is still open. The error does redirect the reader, so no one is misled for long. Fix: publish v19 before this reaches `main`, or name `--help` until then. I am not asking for more than that.
2. **`AGENTS.md:106`: "Each script in `scripts/`" also covers `scripts/clean/smoke.sh`.** That script runs only inside the container and does not answer `docs`, so the rule is false as written. Fix: "`npm run release`, `npm run check:clean` and the `night-shift` CLI answer `docs` (…); a new script agents run answers it too."
3. **`AGENTS.md:179` is 86 characters.** The paragraph wraps at about 76. Rewrap it.

## Note

- AC #3 says "(test)", but `tests/release.test.ts:122-140` only checks the three manuals. Nothing checks that AGENTS.md tells agents to use them. That is the code reviewer's area; I note it only so the AC is not ticked on the strength of that test.
- The release manual's maintainer steps end at publish plus the CHANGELOG entry. `npm run check:clean` appears only in its own manual ("once per release, after … publish") and in AGENTS.md. Adding it as a fourth line under "Cutting a new release" would put the whole sequence in one place. Optional.
- Checked and fine:
  - No live references to the old verbs remain. The only hits are D32's "Rejected" text, the rename messages in `release.ts` and their test.
  - `.claude/agents/`, `skills/`, `docs/practices/` and `docs/design.md` need no change.
  - Every touched file has LF line endings (0 CR bytes).
  - No real names appear. `docs/work/` review files follow the existing convention.
  - The D32 heading follows the file's format.

Verdict: FINDINGS
