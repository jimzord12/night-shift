# Review round 2: TASK-33

Snapshot: `7551a1f..51b7953` (round fixes) and `c3f335d..51b7953` (whole change), worktree, feat/notify at 51b7953, clean. Lead lenses: 6 failure handling, 2 correctness.

Coverage: `close` and the hook both reach `notifyNightEnded` and both catch a rejection. Timeout and exit-status handling right; the stderr cleanup wrong (R2-F1). `close` exits 0 whatever the toast does; the hook keeps its other lines. Worst-case wait about 15.4 s, under the hook's default 60 s. No test covers a failure path (R2-F2).

## Findings
- **R1-F1 Material (carried, narrowed):** nobody has clicked the toast yet. Proven now: Windows' notification history for PowerShell's app id holds the lead's test toast ("Night Shift: a test notification", `launch="http://127.0.0.1:4812/"`), so the toast reaches the notification centre and is not suppressed. Still unproven: that clicking it opens the report. Closes with the owner's look.
- **R2-F1 Minor:** the CLIXML cleanup leaves raw XML as the failure reason. Fix (verified): `$ProgressPreference = 'SilentlyContinue'`, wrap the script in `try { … } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 }`, keep the first stderr line.
- **R2-F2 Minor:** no test for "the notification fails, `close` still succeeds". Add one through the `--command` seam with an exiting command.
- N1: `notify test` exits 0 on failure.
- N2: `cwd: installRoot()` on a folder that does not exist yet gives a misleading ENOENT.

## Checks rerun
`node --test tests/notify.test.ts` 2/2; `npx tsc --noEmit -p .` exit 0; probes reproducing R2-F1 and confirming its fix; a read-only query of PowerShell's toast history.

## Limitations
The time Claude Code gives a SessionEnd hook when the app closes (as opposed to `/exit`) is unverified; the night is already written by then, so only the toast would be lost.

## Verdict: FINDINGS (only R1-F1 remains Material, closable only by the owner's look)

## Dispositions (lead)
- R1-F1: open; the owner is asked to run `night-shift notify test`, click the toast, and look after a real night.
- R2-F1: fixed as suggested; a failure now reads as the exception message.
- R2-F2: fixed; a test with a command that exits 3: `close` and the hook exit 0 and say "The notify command failed (exit 3)", `notify test` exits 1.
- N1: fixed (`notify test` exits 1 on failure). N2: fixed (the install folder is created first).
- A real `notify test` after the fixes printed "Notified" and exited 0.
