# Review round 2: TASK-49.1

Snapshot: 812c092..7cb0af0 (head 7cb0af0cc731), round-1 fixes 031a55e..7cb0af0. I examined a fresh clone at `scratchpad\t491-r2-fresh` with its own `npm ci`. The worktree was only read, and its `node_modules` was not touched.
Lead lenses: (1) the tag logic in scripts/release.ts; (2) the tests: would they catch a break, and how long do they take
Coverage:
1. Wiring: the npm scripts, README, owner.md, CI `install v1` and smoke.sh all reach the new verbs. No live old verbs remain outside dated task records. OK.
2. Correctness: I ran six tag scenarios against real git with a bare origin. See R2-2, R2-3 and N1.
3. Integrity: publish always tags `m.commit`, which must be on origin/main. I found no path that publishes the wrong commit.
4. Contracts: `candidate?` is additive. `--version` shows "vN candidate". The F7 smoke match `"$version · "` rejects a candidate. OK.
5. Tests: see R2-1 and R2-4. Runtime is fine (N3).
6. Failure handling: F3 and F6 hold. See R2-2 and N2.
7. Simplicity: fine.
8. Docs: F5 holds (`--` form, PowerShell form, and the test pins it). D32 now names D10. OK.

Round-1 findings: F1, F2, F3, F5, F6 and F7 are verified as dispositioned. F4 holds online, but its "differing tag" half has no test (R2-4), and offline it does not hold (R2-2).

## Findings
### R2-1 Material: the release tests need the machine's git identity, so the CI gate goes red
Anchor: tests/release.test.ts:44 (the `release` helper's env); scripts/release.ts:192 (`git tag -a`)
- **Scenario:** `npm run check` on a machine with no global `user.name`/`user.email`, such as a GitHub Actions runner. check.yml sets no identity, and the repo's own tests/helpers.ts:24-25 sets one per repo for this reason.
- **Expected:** 75/75 pass.
- **Actual:** with an empty global config (`GIT_CONFIG_GLOBAL` pointing at an empty file, `GIT_CONFIG_NOSYSTEM=1`), 3 release tests fail: `fatal: unable to auto-detect email address`. The other 72 tests pass. The scratch commits use `-c user.*`, but the script's own `git tag -a` does not.
- **Impact:** the every-commit gate fails on the first push to main or on a PR.
- **Fix:** add `GIT_COMMITTER_NAME`/`GIT_COMMITTER_EMAIL` to the `release` helper's env. That covers the `other` clone too.

### R2-2 Minor: offline, the tag a rejected push leaves turns a candidate into a "published" release
Anchor: scripts/release.ts:115
- **Scenario:**
  1. Build a candidate v1.
  2. Tag it locally (what a rejected push leaves).
  3. Go offline and run `build v1`. It exits 0 with "release v1 built", with no candidate mark.
  4. Back online, `publish v1` refuses with "nothing to publish".
- Origin never gets the tag, and `list` shows v1 as published. It is the same local-only tag F4 refuses online.
- **Fix:** when `remote === null` and `built?.candidate`, refuse, as the F2 path does. Keep the offline build from an already-fetched tag for a stranger.

### R2-3 Minor: publish makes its own tag object when origin already has the tag at the candidate's commit
Anchor: scripts/release.ts:191-194
- **Scenario:** the tag was pushed from another clone at the same commit, and this clone has no local tag. `publish` exits 0 but creates a local annotated tag (5d31108) that differs from origin's (1817fb3). `git fetch --tags` then exits 1 with "would clobber existing tag".
- **Fix:** when `!local && remote`, run `git fetch origin tag vN --no-tags` instead of `git tag -a`.

### R2-4 Minor: build's "local tag differs from origin's" refusal is untested
Anchor: scripts/release.ts:115-116; tests/release.test.ts:185
- **Mutant:** I changed the condition to `local && remote === ''`. All 7 release tests still pass (exit 0).
- **Fix:** add one assertion: with a local v1 on another commit while origin has v1, `build` refuses with "origin's names".

### N1 Note: install checks the local tag before origin's
Anchor: release.ts:167
- **Scenario:** the local tag names the candidate (a half-finished publish) while origin's v1 names another commit. `install` accepts the stale candidate (reproduced).
- **Fix:** ask origin first and fall back to the local tag only offline.

### N2 Note: a failed rebuild of the installed candidate breaks the command
Rebuilding the installed candidate empties the folder `current` points at before `npm ci`. If the rebuild fails, the `night-shift` command is broken until a good build.

### N3 Note: runtime is reasonable
- release.test.ts takes 35 s when run alone.
- Test files run in parallel. The whole suite took 56–85 s wall-clock on a loaded machine, and it does not dominate that time.
- Its `npm ci` installs a package with no dependencies.

`originTag` parsing is correct for lightweight and annotated tags, and `v1` does not match `v10` (checked with ls-remote output).

## Checks rerun
- `npm run check`: exit 0, 75/75. `scratchpad\t491-r2-check.log`
- `npm run test:ui`: exit 0, 5/5. `scratchpad\t491-r2-testui.log`
- `node --test tests/release.test.ts`: exit 0, 35 s. `scratchpad\t491-r2-release-test.log`
- `npm test` with no git identity: exit 1, 3 fail. `scratchpad\t491-r2-release-noident.log`, `tasks\bi584xz2c.output`
- F4 mutant: all tests pass. `scratchpad\t491-r2-mutant-f4.log`. The clone was restored after.
- Tag scenarios: `scratchpad\t491-r2-exp\exp.mjs`, output in `run1.log`.

All runs used a scratch NIGHT_SHIFT_ROOT. `scratchpad` = `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad`.

## Evidence inspected
- At 7cb0af0: scripts/release.ts, tests/release.test.ts, tests/helpers.ts, src/version.ts, src/cli.ts, scripts/clean-check.ts, scripts/clean/smoke.sh, .github/workflows/check.yml, and the diffs of README, owner.md and decisions.md.
- The task 49.1 notes and both round-1 reports.
- `.local/evidence/2026-09-29-release/check-clean-7cb0af0.log`: PASS on v18, run against feat/release-verbs, which origin has at 7cb0af0.

## Limitations
- I did not run on a GitHub runner. R2-1 was reproduced locally with no identity, and the claim that the runner has none rests on check.yml and helpers.ts.
- I did not rerun `check:clean`, because it contacts GitHub.

## Verdict: FINDINGS
