# Review round 3: TASK-33

Snapshot: `51b7953..0dab830` (this round's fixes) and `c3f335d..0dab830` (whole change), worktree, HEAD 0dab830, clean.
Lead lenses: 6 failure handling, 5 tests
Coverage:
1. Wiring: `close` and the `meter` hook both reach `notifyNightEnded`, and both wrap it in `.catch`. `notify test` now exits based on the result.
2. Correctness: `result.startsWith('Notified')` matches both success strings in `raise`. The install folder is now created before either spawn.
3. Data integrity: the night is finished and written before any notification runs, so a failed notification cannot lose it.
4. Contracts: `notify.json` has one writer. Tests use a temporary `NIGHT_SHIFT_ROOT` (`tests/helpers.ts:11`), so they never touch the real install.
5. Tests: the new test would fail if the failure report were dropped, if close/hook returned non-zero, or if `notify test` went back to exit 0.
6. Failure handling: probed. Terminating PowerShell errors now come back as one plain line.
7. Simplicity: the fixes are small and sit in `notify.ts` and `cli.ts`.
8. Repository/docs: LF endings, AGENTS.md row and design.md paragraph are current. One process deviation (N2).

## Findings

### N1 Note: a toast Windows accepts but does not show still prints "Notified"
Anchor: src/notify.ts:109-116. If notifications are turned off for the PowerShell app id, or Focus Assist is on, `Show()` does not throw, so PowerShell exits 0; the tool cannot tell this from a shown toast. The same applies to any non-terminating PowerShell error (a probe with `Write-Error` inside the `try` exited 0). No impact on the current script. Optional fix: add `$ErrorActionPreference = 'Stop'` next to `$ProgressPreference`.

### N2 Minor: dispositions are written inside the stored reports
Anchor: docs/work/TASK-33/reviews/01-code-reviewer.md:23, 02-code-reviewer.md:22. review.md (Storage) says to store reports verbatim and put dispositions on the task. Fix: move the dispositions to the TASK-33 notes, or record why they were kept in the reports.

### N3 Note: the `.catch` paths in close and the hook are untested
Anchor: src/cli.ts:232, 184. The new test covers a failure returned as a string; nothing covers a rejection. Each `.catch` is one line and easy to read.

### N4 Note: capitalisation in the hook line
Anchor: src/notify.ts:63, src/cli.ts:184. The hook line reads "…closed as interrupted; The notify command failed (exit 3)." Cosmetic.

## Checks rerun
- `node --test tests/notify.test.ts`: exit 0, 3/3 pass.
- `npx tsc --noEmit -p .`: exit 0.
- Probe of the round-3 PowerShell script through the same `spawnSync` options, with invalid XML and bad types so no toast was shown: `LoadXml` failure → status 1 with the exception as the first line; unknown type → status 1 with the message; non-terminating `Write-Error` → status 0 (N1).
- Full `npm run check` not rerun (it writes `web/dist`).

## Limitations
- R1-F1 is not carried as a code finding. Nobody has yet clicked a real toast and seen the report open; the owner's `night-shift notify test` click and a look after a real night still close acceptance criterion 1 before the task is Done.
- I did not raise a real toast. The author's "Notified" run was not reproduced.
- How long Claude Code gives the SessionEnd hook when the app is closed (rather than `/exit`) is still unverified.

## Verdict: PASS
No open Blocking or Material code finding for this snapshot. The owner's observation (R1-F1) is still needed before the task closes.
