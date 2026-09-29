# Code review round 2: TASK-49.3 (feat/sandbox-kit, 58f1957)

Verdict: PASS. Lead lenses: the ownership check (`serves`) and `stop`; Linux CI.

Round-1 F1-F4 and N1-N3 resolved as dispositioned. An 8.3 short-path home, a forward-slash home
and `all` all start, shoot, stop and clean. The taken-port test fails if `serves` goes back to a
bare `.ok`; the second-night checks fail with that scenario gutted.

## Findings

- R2-F1 Minor (scripts/sandbox.ts:79, 91-99, 239-244): once a sandbox's install lists a repository
  from outside it (the docs invite running the tool with its NIGHT_SHIFT_ROOT, e.g. `install
  <copy>`; or `forget` of the only repository), `stop` prints "not running", deletes sandbox.json
  and leaves the Viewer serving; `clean` then reports success. Fix: accept the Viewer when
  `repos.some(...)` points into the sandbox (a foreign Viewer never lists the sandbox's repos);
  when the address answers but fails the check, keep the state and say so.
- N1 the taken-port test proves `serves`, not the `exited` flag (without it the start still fails,
  after about 10 s).
- N2 `--port` at the owner's real Viewer makes the kit fetch its /api/overview (recovery runs, as
  when opening the page); refused correctly.

## Linux

Nothing Windows-only: realpathSync.native, path.sep and toLowerCase work on Linux; the child is
process.execPath without a shell, so process.kill ends it; ESRCH is caught; `--no-build` needs no
web/dist for the API.

## Checks rerun

`npm run check` 80/80, `npm run test:ui` 6/6; sandbox runs in scratch homes (all, a taken port, a
re-run replacing its Viewer, an 8.3 home, the R2-F1 reproduction). No Viewer of the review left
running.
