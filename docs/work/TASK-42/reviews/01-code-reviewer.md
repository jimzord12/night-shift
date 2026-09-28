# Review round 1: TASK-42 (GitHub #5), TASK-43 (GitHub #6)

Snapshot: feat/issues-5-6 at 47a3683 (clean tree). I examined the code diff `7ccabb9..259da84 -- src tests skills docs/design.md`, and 47a3683, which only adds the backlog tasks.
Lead lenses: 2 correctness, 6 failure handling
Coverage:
1. Wiring: the CLI `close` and `status` reach both changes (src/cli.ts:202, :221). Meets both issues. #6 shows more than the issue asked for.
2. Correctness (lead): see M1, m1 and m2. The CRLF case is handled (`trimEnd`). Stdout/stderr order is fine in practice: git sends hook stdout to stderr, so the order inside stderr is kept.
3. Data integrity: `history-commit.log` sits in the ignored `nights/<id>/` folder. `copyHistory` copies only `night.json`, so the log is never committed. See M1 for a false "refused" report.
4. Contracts: `CommitResult.output` is optional and backward compatible. `sent` still has one writer. No secrets involved.
5. Tests: both new tests fail if their feature is gutted. The old one-line message would fail the regex, and a removed log write would fail `Full output`. The status test fails if either helper is removed. See m2 for untested branches.
6. Failure handling (lead): M1 and m1.
7. Simplicity: small and in the owning modules. `status` now reads every night twice (N3).
8. Repo/docs: design.md and SKILL.md are updated. Task state is out of date (m3). CHANGELOG is written at release.

## Findings
### M1 Material: hook output over 1 MiB is cut off, and git is killed partway through the commit
Anchor: src/repo.ts:9 (`git()` has no `maxBuffer`), used at :69.
Scenario: `spawnSync` keeps at most 1 MiB of output by default. When a hook prints more than that, git is killed (ENOBUFS). I reran this on this machine in scratch repos (about 30,000 lines, roughly 2 MiB):
- Failing hook: `output` stops at 1,048,696 bytes. The "REAL REASON" line on stderr is lost. The message shows six lines from the middle of the output, the last one cut mid-line. Nothing says the output was cut.
- Passing hook: `commitPath` returns `committed:false, "git commit failed: …"`, yet 8 s later `git log` shows the commit `m` landed. On Windows the killed wrapper leaves the real git running. `close` would then write `history-commit.log` and tell the agent the commit was refused when it actually succeeded.

Expected: the hook's last lines and the full log, and no false failure.
Impact: #5's fix silently fails for large hook output, which is the "thousands of lines" case in the brief once it passes about 1 MiB. Unattended, the agent gets a false refusal. The root cause predates this diff, but this change now builds on it.
Smallest fix: add `maxBuffer: 256 * 1024 * 1024` (or `Infinity`) in `git()`, and add `commit.error?.message` to `output` when it is set. Add one test with a hook printing more than 1 MiB.

### m1 Minor: a hook that fails silently gives an empty reason
Anchor: src/repo.ts:71-72, src/night.ts:383-393
Scenario: a hook that runs just `exit 1` (probe rerun). The message becomes `History: git commit failed:\n  .` and no log is written. Fix: when the output is empty, say "(no output; exit N)".

### m2 Minor: two status branches have no test
Anchor: src/night.ts:340-341, :348
If the "latest night even when fully sent" rule or the `by link` label were removed, the test would still pass: the first night is shown anyway because it has unsent F2. Fix: in the existing test, mark F2 as sent via `link` and assert `F2 sent (by link)` still appears for that night.

### m3 Minor: tasks still Queued with no assignee while in review
Anchor: backlog task-42 and task-43 front matter; docs/practices/task-flow.md "Stages". Fix: move both to the Review stage with a holder.

### N1 Note: the tail limits lines, not line length
A single huge line, such as minified or JSON reporter output, goes whole into the close message. You could cap each line at about 500 characters.

### N2 Note: unsent feedback stays in `status` forever
The `Viewer` has no way to dismiss feedback. Feedback the developer chose not to send stays under "awaiting the developer" in every later `status`. This matches the Viewer's own `feedback_unsent` count.

### N3 Note: status reads every night twice
`status` already `loadNight`s every night and throws on a broken one, which is not new. So `readNight` in `feedbackOfEarlierNights` never meets a broken file. Passing the already-loaded nights in would avoid the second read.

### N4 Note: a refusal at night start is still silent
`refreshHistory` (src/night.ts:481) still swallows a refused commit, as the brief says. The close commit covers the same path, so the refusal surfaces there.

## Checks rerun
- `npx tsc --noEmit -p tsconfig.json`: exit 0, no errors.
- `node --test "tests/*.test.ts"`: exit 0, 35 of 35 pass (temp dirs only).
- Scratch probes of `commitPath` against temp git repos (silent hook, 2 MiB failing hook, 2 MiB passing hook, then `git log`). The scripts are in the scratchpad folder: probe.ts, probe2.ts, probe3.ts.
- Not rerun: the web typecheck and `npm run build`, because the build writes `web/dist` in the tree.

## Evidence inspected
All at 259da84 unless noted: src/repo.ts, src/night.ts (status, close, refreshHistory, copyHistory), src/store.ts (readNight, listNightIds), src/types.ts, src/server.ts (feedback/send), src/github.ts, src/cli.ts, tests/night.test.ts, tests/helpers.ts, skills/start-night-shift/SKILL.md, docs/design.md, backlog task-42 and task-43 (47a3683), GitHub issues #5 and #6.

## Limitations
- POSIX behaviour of M1 (SIGTERM, lock cleanup) is reasoned, not run; only Windows was probed.
- No web changes, so no screenshot was needed.

## Verdict: FINDINGS

## Dispositions (lead)
- M1: fixed; `git()` gets a 256 MiB buffer and a spawn error joins the output. New test: a hook printing about 2.3 MiB passes and the commit is reported as committed; with a refusal the reason on stderr is kept. The test fails with the buffer removed (checked).
- m1: fixed; "(no output; exit N)", tested.
- m2: fixed; the test marks F2 sent by link and asserts the fully sent night still shows.
- m3: fixed; both tasks in Review.
- N1: fixed; each tail line is capped at 500 characters.
- N3: fixed; status passes the nights it already loaded.
- N2, N4: no change (N2 matches the Viewer; N4 surfaces at close).
