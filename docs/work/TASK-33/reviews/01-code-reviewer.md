# Review round 1: TASK-33

Snapshot: `c3f335d..7551a1f` (feat/notify, worktree, clean). Lead lenses: 6 failure handling, 1 wiring.

Coverage: `close` and the `meter` SessionEnd hook both reach `notifyNightEnded`; the launcher runs `node <release>\src\cli.ts`, so the Viewer spawn starts that release's Viewer; `NIGHT_SHIFT_ROOT` is inherited; the URL matches `parseRoute` and the Host allow-list; no double notification (after `close`, the hook sees `complete`). Message and tally correct; the EncodedCommand is ~3-4k characters against a 32k limit. `onClosed` fires after `finish`, metrics still measured. Tests go through the real CLI and fail if the close call, the hook callback or the `enabled` check is removed. The toast and `ensureViewer` paths are untested (the desktop boundary).

## Findings
- **F1 Material:** acceptance criterion 1 is unverified; the toast and its click have never been seen. The owner runs `night-shift notify test`, clicks the toast, and a real `close` does the same.
- **F2 Minor:** no `'error'` listener on the two spawns; a failed spawn throws "Unhandled 'error' event" after the night is closed and breaks "never disturb the harness".
- **F3 Minor:** "Notified" is printed whether or not the toast worked, so `notify test` cannot diagnose anything. Run PowerShell with `spawnSync` and report its exit code and stderr.
- **F4 Minor:** the hook-started Viewer inherits the repository as its working directory and holds the folder on Windows. Pass `cwd: installRoot()`.
- **F5 Minor:** recovery is excluded, which contradicts the task text ("session-end hook or recovery"); reasonable, record it.
- N1: the developer command runs with piped stdio; `stdio: 'ignore'` avoids a grandchild holding it past the timeout.
- N2: the tally code is duplicated in `close()` and `nightMessage`; the title uses the folder name.
- N3: in `commandMeter`, a throw from `notifyNightEnded` drops the other output lines.
- N4: a checkout's `close` starts the checkout's Viewer on 4747, and the installed Viewer then finds the port taken.

## Checks rerun
`node --test tests/notify.test.ts`: 2/2. A PowerShell probe read the notifier `Setting` = `Enabled` for the app id and built the same toast XML. Full `npm run check` not rerun (it writes `web/dist`).

## Verdict: FINDINGS

## Dispositions (lead)
- F1: open until the owner looks; asked in the end-of-work report (`night-shift notify test`).
- F2: fixed; the Viewer spawn has an error listener, and the toast now runs with `spawnSync` (no spawn event can escape).
- F3: fixed; the toast waits for PowerShell (15 s timeout) and reports its error; `notify test` printed "Notified" after a real run here.
- F4: fixed; both processes start in the install folder.
- F5: recorded on the task: recovery runs where the owner already is (the Viewer, a start), so it does not notify.
- N1: fixed. N3: fixed (the hook catches a notify failure). N2, N4: no change.
