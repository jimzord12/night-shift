# Review round 2: TASK-42 (GitHub #5), TASK-43 (GitHub #6)

Snapshot: feat/issues-5-6 at a7c0c3b (clean tree, HEAD verified). Examined `47a3683..a7c0c3b -- src tests` (round-2 fixes) against the full `7ccabb9..a7c0c3b` change, plus backlog task state.
Lead lenses: 6 failure handling, 1 wiring
Coverage:
1. Wiring (lead): `close` and `status` in the CLI still reach `commitPath` and `feedbackOfEarlierNights`. `status` now passes the night objects it already loaded (`all`). In the open case, `all.filter((x) => x !== n)` works by identity because `n` comes from `all`. `refreshHistory` gets the larger buffer too, but still ignores a refusal (N4, accepted).
2. Correctness: the tail caps each line at 500 characters. I probed a hook that prints one 3,000-character line: the message is 522 characters and ends in "…", and the full 3,001 characters stay in `output`. The silent-hook case gives "(no output; exit 1)". `output` is `undefined` when empty, so no empty log file is written.
3. Data integrity: with the 256 MiB buffer, the false "refused" report after the commit actually landed (round-1 M1) can now only happen above 256 MiB of hook output. That is not a realistic case.
4. Contracts: `CommitResult` shape unchanged. `sent` still has one writer.
5. Tests: each fix has a test that would fail without it. The megabyte test fails without `maxBuffer`: I confirmed on this machine that the same hook under the default buffer gives `status null, ENOBUFS, stderr 1,114,112`, so `committed` would be false. `output.length > 2 MiB` and the "not ok 60001" match would also fail on a truncated stream. The silent-hook regex fails without the "(no output…)" fallback. The m2 addition fails if the "latest night even when fully sent" rule or the `by link` label is removed: in the open case `first` is the only earlier night, and all its feedback is sent. The 500-character cap has no test (N5).
6. Failure handling (lead): the spawn error text now joins `output`, so an ENOBUFS above 256 MiB or a spawn failure is named, not silent. No regression in the other `git()` callers: `rev-parse`, `check-ignore`, `ls-files`, `add` and `diff --cached --quiet` print little. `maxBuffer` is an upper limit, not memory reserved up front.
7. Simplicity: small, and in the owning modules. The second read of every night is gone (N3).
8. Repo/docs: both tasks are in Review with `@claude` (m3 resolved). LF line endings, and `git diff --check` is clean. The design.md wording ("the last lines", `history-commit.log`) still holds.

## Findings
### N5 Note: the 500-character line cap has no test
Anchor: src/repo.ts:67. If the `.map` cap were removed, every test would still pass. The probe shows it works, and the risk is low. It does not block.

### N6 Note: output above 256 MiB still goes back to the round-1 behaviour
Anchor: src/repo.ts:10. Beyond the buffer, git is killed and a commit that landed can still be reported as refused. The spawn error text now says ENOBUFS, so the failure is at least named. Not realistic for hooks; no change suggested.

## Checks rerun
- `npx tsc --noEmit -p tsconfig.json`: exit 0, no errors.
- `node --test "tests/*.test.ts"`: exit 0, 36 of 36 pass (temp dirs only). The tree was clean afterwards.
- `git diff --check 47a3683 a7c0c3b -- src tests`: exit 0.
- Scratch probe (`<scratchpad>/r2/probe.ts`) against fresh temp git repos: the test's 60,000-line passing hook under the default buffer gives `status null, error ENOBUFS`, which proves the new test depends on the fix; the real `commitPath` with one 3,000-character line is capped as described above.
- Not rerun: the web typecheck and `npm run build` (the web code did not change).

## Evidence inspected
All at a7c0c3b: src/repo.ts, src/night.ts (status, feedbackLine, feedbackOfEarlierNights, close, refreshHistory, copyHistory), tests/night.test.ts, tests/helpers.ts, backlog task-42 and task-43 front matter, docs/design.md:179-181, and the round-1 report with its dispositions.

## Limitations
- Probed on Windows only (Git for Windows sh).
- No Viewer change, so no screenshot was needed.

## Verdict: PASS

## Dispositions (lead)
- N5, N6: no change.
