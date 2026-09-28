# Review round 1: TASK-45

Snapshot: c8f52c2..980d267 on fix/same-origin (one commit: src/server.ts +14, tests/server.test.ts +16). Worktree HEAD was 980d267 and clean.
Lead lenses: 4 contracts and access, 5 tests
Coverage:
1. Wiring: the middleware is `app.use('*')`, registered before every route in `createApp`. It therefore covers answer, read, follow-up and feedback/send, plus the `/api/*` 404 fallback. `cli.ts view` uses this same `createApp`. The tool never POSTs to the server; only `web/src/api.ts` `post()` does.
2. Correctness: I probed a real Node server (see Checks). Own page (Chrome headers): allowed. Opaque origin (`Origin: null`, which is what the sandboxed HTML evidence sends): refused. Cross-site OPTIONS and PUT: refused. `none`: allowed. No headers: allowed.
3. Integrity: a refused request is stopped before the body is read. The test confirms the answer stays null after three refusals.
4. Access: the rule is implemented as briefed. Sec-Fetch-Site decides when it is present; otherwise Origin must equal the Host-derived origin. `same-site` (for example another localhost port) is refused. The Vite proxy is fine on modern browsers (N1).
5. Tests: the new test fails if the middleware is gutted (the first 403 assert) or if the Origin fallback is removed (the second). The browser test still saves through the real page with Chromium's real headers. There is a gap on the Origin-only allow path (m2).
6. Failure handling: a clear 403 JSON error; no partial writes are possible.
7. Simplicity: one small middleware in its owning module, placed beside the Host check. Scope did not grow.
8. Repo and docs: LF line endings; `git diff --check` is clean. D11 is not updated (m1). The task record lives on another branch (N3).

## Findings
### m1 Minor: the new access rule is not recorded beside D11
Anchor: docs/decisions.md D11 (lines 80-86)
- Scenario: D11 is the list of the Viewer's security rules (Host check, sandboxing). This change adds a third access rule, but D11 and the decisions log do not mention it. Task DoD #4 asks that decisions be current.
- Impact: the next reader of D11 believes the Host check is the whole access story.
- Fix: append D<n+1> (decisions.md is append-only): "non-GET requests a browser marks as coming from another site are refused (Sec-Fetch-Site, else Origin)".

### m2 Minor: the Origin-only allow path is untested
Anchor: tests/server.test.ts, the new test (+337-351); src/server.ts:155
- Scenario: a browser that sends Origin but no Sec-Fetch-Site (Safari before 16.4) saves from the Viewer's own page. The only positive case in the test also sends `Sec-Fetch-Site: same-origin`, which short-circuits the Origin comparison.
- Expected: a regression in that comparison turns the test red.
- Actual: the test stays green even if every request carrying an Origin is refused.
- Fix: one assert, `post({ Origin: 'http://127.0.0.1:4747' })` → 200, placed before the same-origin save (or with a fresh baseHash).

### N1 Note: the Vite dev proxy and Origin-only browsers
Anchor: web/vite.config.ts:11
- `changeOrigin` rewrites Host to 127.0.0.1:4747 but leaves `Origin: http://localhost:5173`. With Sec-Fetch-Site present (Chrome, Firefox 90+, Safari 16.4+) the request passes; the probe returned 404, not 403. An Origin-only browser under `npm run dev` gets a 403. This is dev-only and acceptable.
- Pre-existing: the proxy targets 4747 (the installed release), not this checkout's `npm run view` on 4748. So `npm run dev` exercises the installed server's rules, not the checkout's.

### N2 Note: side effects on GET routes
Anchor: src/server.ts:175
- `GET /api/overview` runs `recover()`, so a cross-site `<img>` can trigger it. The effect is the same as opening the Viewer, so no action is needed. `?fresh` on proposals only asks gh.

### N3 Note: the reveal route and the task record live on feat/file-shapes
- The global middleware covers the reveal route once the branches meet; no per-route test is needed because the mechanism is route-independent.
- TASK-45 is Queued on feat/file-shapes and absent here, so the lead must close it on the branch where it lives.
- Side benefit: sandboxed HTML evidence can no longer POST to the app, which makes D11's "can never act on this app" claim true.

## Checks rerun
All runs had TEMP/TMP pointed at `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t45r1\tmp`.
- `node --test tests/server.test.ts`: exit 0, 18/18 pass. Output: `…\scratchpad\t45r1\server-test.txt`
- `node --test "tests/ui/*.test.ts"`: exit 0, 1/1 pass, using the existing web/dist (not rebuilt). Output: `…\scratchpad\t45r1\ui-test.txt`
- Scratch probe `…\scratchpad\t45r1\probe.ts`: a real `@hono/node-server` on a scratch port with the Host check on, sending 12 header combinations to an unknown endpoint (404 = allowed, 403 = refused). Exit 0. Output: `…\scratchpad\t45r1\probe.txt`
- `git diff --check c8f52c2 980d267`: exit 0.
- `npm run check` was not rerun because its web build writes web/dist.

## Evidence inspected
All at 980d267:
- src/server.ts (whole file), web/vite.config.ts, web/src/api.ts, src/cli.ts (view/port wiring), src/night.ts `recover`, tests/ui/deck.test.ts, tests/helpers.ts, docs/decisions.md D11, CHANGELOG.md head.
- Task record and origin N2 on the shapes worktree.

## Limitations
- I did not drive `npm run dev` in a real browser; the Vite proxy behaviour is reasoned from its config plus the probe's simulated headers.
- Fetch-metadata values for opaque origins are taken from the Fetch Metadata spec, not observed in a browser.
- A slip, reported honestly: one probe command briefly created and at once deleted `node_modules/.probe-tmp.ts` in the worktree. Nothing remains, and git status is clean.

## Verdict: PASS
