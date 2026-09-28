# Review round 4: TASK-28

Snapshot: feat/save-gate, base c3f335d, head 76b46c8. The tree was clean before and after my checks. I went deep on ead14d7..76b46c8 (3901b95 and 76b46c8).
Lead lenses: 3 data integrity and consistency, 5 tests
Coverage:
1. Wiring: `openDeck` sets `from` from `route.page`. The deck has only two openers, Inbox and Report (App.tsx:198, 250, 253, 259), so the "Back to the report" label always matches where closing goes.
2. Correctness: for an unanswered question a running night holds, `settledHere` now includes `takenBy`, so the draft is `''` and no option is ticked (QuestionDeck.tsx:70-71, 241). Report's `answered` counts real answers. The "Nothing waiting for you" branch can only be reached when a follow-up exists.
3. Integrity: every caller of `isOpenQuestionIn` passes `taken`. That covers server.ts:110, App.tsx:52/187/250, QuestionDeck.tsx:40, Report.tsx:137/289 and Gate.tsx:153. Gate.tsx:153 only renders for nights with no follow-up, where `taken` is empty, so it is harmless. The key forms agree everywhere:
   - `isOpenQuestionIn` builds `${f.from_night}/${h.id}`.
   - The deck and Report build `${night}/${item}`.
   - `takenRefs` and Next night use `${followUpId}/${item}`.
   - These match because `buildFollowUp` sets `id = from_night = n.night` (followup.ts:45).
   - The overview builds `taken` once per repository (server.ts:164), so keys cannot collide across repositories.
   - Next night excludes held items, the owner state falls to `waiting`, and `followAnswer` refuses with the same plan/skip rule.
   - The Inbox, cards, Report, deck, History and Next night therefore agree.
4. Contracts: the `taken` parameter is optional, and `detail()` always sends the field. No change to the file shape.
5. Tests: the new test fails if the `taken` argument in `summarise` or types.ts:270 is removed, and it closes round-3 m3 (`skipped_follow_ups`). Two gaps: see m1 and M1.
6. Failure handling: unchanged by 76b46c8. The 3901b95 refocus and error guard read correctly.
7. Simplicity: small changes in the owning modules, and the lookup is computed once per repository.
8. Repository and docs: `git diff --check` is clean. The design.md wording is fixed and the task notes carry the round-3 dispositions. No CHANGELOG is due before release.

## Findings

### M1 Material: nobody has looked at the screen for the "no fake answer" half of V1 (Blocking)
Anchor: web/src/QuestionDeck.tsx:70-71; .local/evidence/2026-09-28-save-gate/r7/03-locked-{390,1440}.png
- **Scenario:** V1 (visual round 3) was about blog's unanswered Q2 ("Choose the newsletter provider"). It showed a ticked recommendation while locked.
- **Expected:** a screenshot of that same locked, unanswered question with no option ticked.
- **Actual:** both `03-locked` shots show Q1, "Which comment system?". Q1 has a real answer (Giscus, with the note "Keep it on GitHub"), and the first progress segment is the current one. The log's "pressed options: 0" reads 0 even on this screen where Giscus is visibly ticked, so it proves nothing. No shot shows Q2.
- **Impact:** the Blocking fix is verified only by reading the code. The code looks right, but the rule is that a visible change must be seen.
- **Smallest fix:** a 390 and a 1440 shot of Q2 in the deck, reached through its progress segment. Or cite the round-4 visual reviewer's shot of it.

### m1 Minor: the new test cannot catch an exclusion that is too broad
Anchor: tests/server.test.ts:267-281
- **Scenario:** `closedNight` has only one question. A bug that hides every open question once any `taken` entry exists (for example `if (taken && Object.keys(taken).length) return false`) still takes the count from 1 to 0, so the test passes.
- **Fix:** add a second unanswered question whose item is not held, and assert the count goes 2 → 1.

### N1 Note
- The Report's "Saved for the next agent · 3 open" sits above three "Taken by a running night" badges (02-blog-report-1440). It is true, but it reads mixed. This can go to TASK-40.
- The r7 screenshots show `dev · 3901b95`. They were taken from the uncommitted tree about 30 s before 76b46c8 (they include its "Taken by a running night"). I cannot prove that tree was byte-identical to 76b46c8.

## Checks rerun
Output is in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r4-code-review\`.
- `npm run typecheck`: exit 0
- `npm test`: exit 0, 37 passed, 0 failed
- `npx vite build --config web/vite.config.ts --outDir <scratch>/dist --emptyOutDir`: exit 0
- `git diff --check c3f335d 76b46c8`: exit 0

## Evidence inspected
- At 76b46c8: src/types.ts:257-318, src/server.ts:65-242, src/followup.ts:40-104, tests/server.test.ts:1-70 and 205-281, web/src/App.tsx:30-260, QuestionDeck.tsx:36-295, Gate.tsx:1-170, Report.tsx (NeedsYou and follow-up rows), the Inbox.tsx and Views.tsx count sites, docs/design.md.
- The TASK-28 notes, and the round-3 code and visual reports.
- In `.local/evidence/2026-09-28-save-gate/r7/`: log.txt, 01-inbox-390, 02-blog-report-1440, 03-locked-390 and 03-locked-1440.

## Limitations
I did not drive a browser. The client-side counts and the deck's draft were checked by reading the code, because UI tests belong to TASK-8. I did not see hold.ts or the capture script.

## Verdict: FINDINGS
One Material finding, M1, and it is evidence only. The code for V1 and V2 looks right, and the counts agree across the Inbox, cards, Report, deck, History and Next night. m1 should be fixed or recorded.
