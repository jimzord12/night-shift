# Review round 2: TASK-27

Snapshot: 3b03475..93f047c (feat/step-track). I focused on d95e58c..0d10dd1, the fixes in web/src/StepTrack.tsx and web/src/Report.tsx. 93f047c adds only the task notes and the round-1 reports. The worktree was clean. web/dist (16:30:41, 19 s before 0d10dd1) contains the new strings.
Lead lenses: 2 correctness, 5 evidence
Coverage:
1. Wiring: the report still feeds `nextStep` the live `overview` summary (App.tsx:45-65). `held` comes from `detail.follow_up` and `detail.taken`, the same inputs as the "Taken by a running night" chip (Report.tsx:100). Its key `${n.night}/${i.id}` matches takenRefs (server.ts:124-132, 179).
2. Correctness: I checked every branch against its state. F1: `summary.follow_up` is true, and buildFollowUp gives every question an item, so followAnswer carries the answer. F4 `held`: start() makes a night take every open item (night.ts:137-148), so a follow-up is taken all or nothing, except in R2-F1. Running on a dead session: the overview load recovers it to `interrupted` (seen below), so the round-1 concern does not persist.
3. Data integrity: n/a, display only.
4. Contracts: `nextStep` gains the optional `follow_up` and `held` inputs. There is no API change.
5. Evidence: r3 covers all nine sample nights at 1440 and 390 and the clipboard, and its Next lines match the new code. The held branch is not in the author's evidence (R2-F2). I walked it on the committed build.
6. Failure handling: an unreadable follow-up gives `held=false` and the "start an agent" line. That is acceptable.
7. Simplicity: the `held` expression sits inline in JSX (N1).
8. Docs: the task notes match the fixes, and both files are LF.

## Findings

### R2-F1 Minor: Waiting still says "say start night shift" when a night is running that did not take this follow-up
Anchor: web/src/StepTrack.tsx:70; web/src/Report.tsx:68
- Scenario: night X closes, night Y starts, then the owner saves X at the gate while Y runs. None of X's items are taken.
- Expected: no instruction the tool would refuse.
- Actual: "start an agent … tonight, say `start night shift`". While Y runs, start() refuses with "one night at a time per repository" (night.ts:129). Seen in the `late-*` shots.
- Impact: low. The advice becomes true once Y closes, and "tonight" softens it.
- Smallest fix: when any night in the repo is open, say "a night is running now; once it closes, say …". Or record why not.

### R2-F2 Minor: the author's evidence never shows the new held branch
Anchor: TASK-27 notes (F4 disposition); .local/evidence/2026-09-28-step-track/r3/log.txt
- No sample night is held, so r3 shows only the non-held Waiting line (mobile).
- I built a held night on the committed build. It renders "Next: a running night is working on what it carried." with "Taken by a running night" below it, at 1440 and 390, with no page errors.
- Smallest fix: cite this walk in the task notes, or add a held repo to the setup script.

### N1 Note: `held` is untested and inline
There is no test for `nextStep` or `held`: the suite is still 43 tests, as in round 1. Moving the expression into a named helper beside `isOpenQuestionIn` in src/types.ts would make it readable and testable. This does not block.

## Checks rerun
- `npm run typecheck`: exit 0. Output: C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\task27-r2\typecheck.txt
- `npm test`: exit 0, 43 of 43 pass. Output: …\scratchpad\task27-r2\test.txt
- Viewer walk: `node src/cli.ts view --port 4981` from the worktree, with NIGHT_SHIFT_ROOT set to a scratch folder, on synthetic repos made by …\scratchpad\task27-r2\setup.ts:
  - held: a night saved, then a running night took its item.
  - late: a follow-up saved after a running night started.
  - stale: an open night on a dead pid, recovered to `interrupted` on load.
  - Shots and log are in …\scratchpad\task27-r2\shots\ (held-1440/390, late-1440/390, log.txt). I stopped the Viewer afterwards.
- I did not rerun the web build (per the brief).

## Evidence inspected
- At 0d10dd1 / 93f047c:
  - web/src/StepTrack.tsx, Report.tsx, App.tsx
  - src/types.ts, server.ts, night.ts, followup.ts
  - the task-27 record and docs/work/TASK-27/reviews/01-*.md
- In the main checkout, .local/evidence/2026-09-28-step-track/r3/: log.txt and blog-1440.png, whose Next line matches the F1 fix.

## Limitations
- I did not open every r3 image. For those I relied on log.txt, which the committed strings corroborate.
- I did not replay the acceptance #1 video.

## Verdict: PASS
There is no open Blocking or Material finding. Round 1's F1–F4 are resolved as dispositioned, and R2-F1 and R2-F2 are Minor: fix them or record why not.
