# Review round 1: TASK-49.1

**Side effect, read first:** my own gate setup emptied `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\node_modules`. Before I made my own fresh folder, I ran `npm ci` in a scratch folder that already existed, `scratchpad\snap` (it came from an earlier session). Its `node_modules` was a junction (a Windows folder link) into this worktree. npm followed the link while removing it, and the worktree's `node_modules` has been empty since 13:19:08. No tracked file was touched, and the main checkout's `node_modules` is intact. Run `npm ci` in the worktree before using it. I did not fix it myself because I don't install packages in the source tree.

Snapshot: 812c092..031a55e (head 031a55e5c064), examined in a fresh clone at `scratchpad\t49-1-r1`
Lead lenses: (1) release script safety, launcher and CI; (2) the clean check's honesty
Coverage:
1. Wiring: the npm scripts, README, AGENTS and the CI `install v1` step reach the new verbs. OK.
2. Correctness: I ran scenarios A to E in scratch repositories with a bare origin. See F1 to F4.
3. Integrity: publish tags `m.commit`, is gated on origin/main and refuses an existing tag, local or remote. Holds. Number handling is in F1 and F2.
4. Contracts: `candidate?` is additive. `install.ts` and the launcher are unchanged. The `version.ts` REPO_ROOT has the same value as the one in `store.ts`, and a fresh clone runs `release build` with no `npm ci` (the PASS log proves it). OK.
5. Tests: the two author mutants are sound. See F6.
6. Failure handling: see F3.
7. Simplicity: fine.
8. Docs: see F5 and F7.

## Findings
### F1 Material: a candidate can never be rebuilt, and a stale candidate installs under a published number
Anchor: scripts/release.ts:104, :148-150
- **Scenario A:** I built candidate v1 at commit 5df2751. v1 was then published elsewhere at 1316605, and I fetched the tags. Results:
  - `install v1` exits 0 and runs 5df2751 as "v1".
  - `build v1` refuses with "never rebuilt".
  - `publish v1` refuses.
  - No command reaches the real v1.
- The same refusal hits the ordinary case: a candidate that fails its try cannot be rebuilt after a fix.
- Expected (D32: "tried before its number is used up"): a candidate folder can be replaced.
- Actual: the maintainer must delete the folder by hand or burn the number anyway.
- **Fix:** `build` empties and rebuilds a folder whose manifest has `candidate: true`, from the tag if one now exists. `install` refuses a candidate when tag vN exists locally. Add a test for both.

### F2 Minor: offline, a published number is built as a candidate
Anchor: scripts/release.ts:97-99, :106, :118
- **Scenario B:** a `--no-tags` clone with origin unreachable ran `build v1` and got a candidate under the already-published v1.
- Cause: `tagOnOrigin` returns `null` when offline, and the code treats that as false. The failed fetch of main is also ignored.
- Publish still refuses later.
- **Fix:** in the candidate branch, refuse when `tagOnOrigin` returns `null`.

### F3 Minor: a publish whose push was rejected can never be finished
Anchor: scripts/release.ts:161, :171-172
- **Scenario D:** the push was rejected. I followed the advice and ran `git push origin v1` myself, then reran `publish`. It refused with "tag v1 already exists here". The manifest keeps `candidate: true`, so `list` and `--version` call a published release a candidate forever.
- **Fix:** when the local tag already points at `m.commit`, push (again if needed) and rewrite the manifest.

### F4 Minor: a local-only tag counts as published
Anchor: scripts/release.ts:105
- **Scenario E:** tag v1 sat on an unpushed commit. It built as a release without the check gate, without the pushed check and without a candidate mark.
- The script also never compares a local tag with origin's tag of the same name.
- **Fix:** when origin is reachable, require it to report the same commit for the tag.

### F5 Minor: the check:clean usage line fails as written
Anchor: scripts/clean-check.ts:16; tests/release.test.ts:133 pins that string
- `npm run check:clean v18 --ref x` fails with `EUNKNOWNCONFIG --ref` (reproduced with `npm run release list --ref`).
- In PowerShell, npm.ps1 strips the `--` too, so the brief's own command fails there.
- **Fix:** document `npm run check:clean -- v18 --ref <branch>` and, for PowerShell, `node scripts/clean-check.ts v18 --ref <branch>`.

### F6 Minor: nothing tests "manifest written last"
Anchor: scripts/release.ts:142-143; tests/release.test.ts
- If `writeManifest` moved before `npm ci`, every test would still pass. The half-built-folder guarantee is unguarded.
- **Fix:** add one test where `build` fails and `install` then refuses.

### F7 Note
- smoke.sh `case "$version "*` also accepts "v18 candidate · …"; `"$version · "*` is tighter.
- The page check proves index.html is served, not that its assets load.
- Task 49.1 is still `Queued` and has no acceptance criteria.

## Checks rerun
- `npm run check` on the scratch clone at 031a55e: exit 0, 72/72 tests. Log: `scratchpad\t49-1-r1-check.log`
- `npm run test:ui`: exit 0, 5/5. Log: `...\tasks\bo50uko50.output`
- Scenarios A, B, D and E via `scratchpad\t49-1-exp\exp.mjs` against the snapshot's release.ts. Output is quoted in the findings.
- npm argument passing, in bash and in pwsh.

All runs used a scratch NIGHT_SHIFT_ROOT.

## Evidence inspected
- The diff 812c092..031a55e.
- scripts/release.ts, scripts/clean-check.ts, scripts/clean/{Dockerfile,smoke.sh}, src/version.ts, src/cli.ts, tests/release.test.ts, .github/workflows/check.yml, README, AGENTS, D32, glossary, all at 031a55e.
- `.local/evidence/2026-09-29-release/check-clean-031a55e.log` (PASS for v18) and `check-clean-bad-ref.log` (FAIL at clone).

## Limitations
- I did not rerun `check:clean`, because it contacts GitHub. My view of lens 2 comes from reading the check plus the author's logs. The check looks honest:
  - The container runs as a non-root user with an empty home and no npm cache.
  - It clones over public HTTPS.
  - It runs no `npm ci` at the clone root.
  - It only covers Linux; Windows (npm.cmd, tar, the .cmd launcher) is not covered, and the check's own docs say so.
- The CI launcher step can't run on Windows. I checked it by reading.
- The side effect at the top: the worktree's `node_modules` needs `npm ci`.

## Verdict: FINDINGS
