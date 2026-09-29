# Review round 3: TASK-49.1

Snapshot: 812c092..f9a25d7 (head f9a25d71cf3d). I read the round-2 fixes as 7cb0af0..f9a25d7. I examined a fresh clone at `scratchpad\t491-r3`, checked out at f9a25d7, with its own `npm ci`. The worktree was only read and its `node_modules` was not touched. All runs used a scratch NIGHT_SHIFT_ROOT.

Lead lenses: (1) acceptance end to end, and the v19 maintainer flow against GitHub; (2) composition: whether the CI, README, AGENTS.md, owner.md and the three manuals match the code.

Coverage:
1. **Wiring:** `npm run release` / `check:clean`, CI `install v1`, and smoke.sh all reach the new verbs. A grep found no live `switch`, `install-launchers` or `release vN` outside dated records and D10. OK.
2. **Correctness:** traced the v19 flow step by step (details under Lens 1 below). OK.
3. **Integrity:** publish tags only `m.commit`, and only when it is on origin/main. A stale candidate is refused at install and publish. OK.
4. **Contracts:** `candidate?` is additive. smoke's `"$version · "` match rejects a candidate. OK.
5. **Tests:** R2-1..R2-4 hold. See R3-1 and N-a.
6. **Failure handling:** every refusal names the next step. N2 is accepted as dispositioned.
7. **Simplicity:** fine.
8. **Docs:** see Lens 2 below. `.gitattributes` forces LF, so the smoke.sh the container copies stays LF on Windows.

**Lens 1: acceptance end to end**
- **AC1:** `check-clean-f9a25d7.log` is PASS. It was written 13:57:01, and the push of f9a25d7 was 13:56:48, so the log is of the pushed commit. In the container the clone had v18 locally, so `build` compared it with ls-remote's peeled line over https from GitHub and they matched. That is the https ls-remote path, proven against GitHub itself.
- **AC2:** tests on real git with a bare origin. My mutants A, B and D are killed.
- **AC3:** the docs test also checks that AGENTS.md names all three manuals.
- **What is new against GitHub in the v19 flow:**
  - `git push origin refs/tags/v19`: an ordinary refspec with the same name on both sides.
  - `git fetch origin tag vN --no-tags`.
  - The peeled `^{}` pattern: proven by the container run and by test 8, which fails if the peel is wrong.
- **What is unchanged and proven by v1..v18:** the check gate, archive/tar, and `npm ci` through `npm_execpath`. Compared against 812c092:scripts/release.ts.

**Lens 2: composition:** the three manuals, README, AGENTS.md, owner.md, the glossary, D32, the CHANGELOG header and check.yml all describe the behaviour the code has.

**Round-2 dispositions, verified**
- **R2-1:** the whole suite passes with an empty global git config and no system config: 76/76, and `git config user.email` exits 1.
- **R2-2:** release.ts:125. Mutant B is killed.
- **R2-3:** release.ts:195-197. Mutant A is killed.
- **R2-4:** the test at release.test.ts:227-236. Mutant D is killed.
- **N1:** the fix is in, at release.ts:171. It has no test; see N-a.

## Findings
### R3-1 Minor: the candidate's check gate has no test
Anchor: scripts/release.ts:139-140; tests/release.test.ts:35
- **Scenario:** mutant E, `if (false) throw` on the gate.
- **Expected:** some release test fails.
- **Actual:** all 8 pass (exit 0). `scratch()` always uses `check: 'node -e 0'`.
- **Impact:** low. This is the behaviour D32 and the manual promise ("the check gate first"), and it was carried over unchanged from the old script, but a regression would go unnoticed.
- **Smallest useful fix:** let `scratch()` take a failing `check`, then assert that `build v1` exits 2 with "the check gate is red" and leaves nothing built.

### N-a Note: N1's order is not pinned by a test
Anchor: release.ts:171. Mutant C (`localTag || originTag`) survives. It was a Note, so optional.

### N-b Note: smoke.sh comes from this checkout, not from the cloned ref
Anchor: clean-check.ts:62; the manual line "checks what is published … not this checkout".
The Docker build context is the local `scripts/clean`. The container script is therefore local, even though release.ts is taken from the ref. This is harmless unless smoke.sh is edited and not pushed. It is worth one clause in the manual.

### N-c Note: two small gaps a stranger or the maintainer could hit
- README.md:45 `git tag … | head -1` is POSIX-only. In PowerShell `head` does not exist.
- clean-check.ts:56-58: offline, ls-remote fails and the message says "origin has no published release tag", which is misleading.

## Checks rerun
All outputs are in `scratchpad\t491-r3-out\`.
- `npm run check`: exit 0, 76/76 tests. `check.log`
- `npm run test:ui`: exit 0, 5/5. `testui.log`
- `npm test` with an empty global git config and no system config: exit 0, 76/76. `test-noident.log`
- Mutants on `node --test tests/release.test.ts`, one log each in `mutant-*.log`. The clone was restored afterwards and `git status` is clean.

| Mutant | Guard | Result |
|---|---|---|
| A | publish takes origin's tag | killed |
| B | offline candidate with a local tag | killed |
| C | install asks origin first | survived |
| D | differing tag refused at build | killed |
| E | candidate check gate | survived |

I did not run `check:clean`, which clones from GitHub.

`scratchpad` = `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad`.

## Evidence inspected
- **At f9a25d7:** scripts/release.ts, scripts/clean-check.ts, scripts/clean/{Dockerfile,smoke.sh}, tests/release.test.ts, src/version.ts, the cli.ts diff, .github/workflows/check.yml, and the README / AGENTS.md / owner.md / decisions.md / glossary / CHANGELOG diffs.
- 812c092:scripts/release.ts
- Both round-2 reports, and task 49.1's notes.
- `.local/evidence/2026-09-29-release/check-clean-f9a25d7.log`, checked against the reflog of the push to origin/feat/release-verbs.

## Limitations
- I did not contact GitHub. The push, the tag fetch and the https ls-remote were judged from the refspecs, the old script's record, and the container PASS.
- No real candidate build of this repository on Windows was run. That path's pieces are unchanged from v18's script, apart from the ls-remote arguments.
- AC1's PASS is of the branch ref. The run on `main` for v19 is part of the post-merge flow.

## Verdict: PASS
