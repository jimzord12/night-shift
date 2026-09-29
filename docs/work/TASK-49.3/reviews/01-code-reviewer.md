# Code review round 1: TASK-49.3 (feat/sandbox-kit, 8356f75 against main 34b4d73)

Verdict: FINDINGS. Lead lenses: safety and process hygiene; tests that pass with the feature broken.

## Findings

- F1 Material (scripts/sandbox.ts:136-146, 78-81): `<scenario> --port P` with P already served by
  another Viewer (another sandbox, `npm run view` on 4748, the installed Viewer on 4747): the child
  exits with "port P is taken", but the other server answers, so the kit reports exit 0 and records
  the dead child's pid. Reproduced in a scratch sandbox. A reviewer could drive real nights, and
  `stop` could kill a reused pid. Fix: an exited child is a failure; `stop` confirms the Viewer
  serves this sandbox's repositories before killing.
- F2 Minor (tests/ui/scenarios.test.ts:24,35-37; tests/sandbox.test.ts:65): the UI check for
  second-night passes with the scenario gutted (the shared install shows "Night of" from
  morning); `nights[1].counts.done === 2` also holds for the first night. Assert text unique to
  the second night on its own page; pick the night by id.
- F3 Minor: parallel reviewers collide on one sandbox home; the briefs end with a bare `stop`.
  Give each reviewer its own NIGHT_SHIFT_SANDBOX, or at least `stop <scenario>`.
- F4 Minor (scripts/sandbox.ts:16, 213): `clean` deletes whatever NIGHT_SHIFT_SANDBOX names.
  Remove only the kit's own subfolders, then the home if empty.

## Notes

- N1 `shot` writes to the sandbox's shots/, which clean deletes; add `--out` or say "copy them".
- N2 three media files duplicate examples/sample-repo blobs (about 260 KB).
- N3 flags accepted on every verb; `stop ../x` joins a path outside the home; fixed clock times can
  be in the future; the second night starts before the morning that fed it is saved; the ended pid
  999999 carries the Linux pid_max assumption into CI.

## Checks rerun

`npm run check` 80/80, `npm run test:ui` 6/6. Mutations in a copy of 8356f75: no media copied
(caught), running built as ended (caught), second night records nothing (caught only by the
next-night test), feedback removed (not caught), second-night gutted (UI test passes). Sandbox demo
in a scratch home: F1 reproduced; re-running a scenario replaced its Viewer; stop and clean exit 0.
No Viewer left running.
