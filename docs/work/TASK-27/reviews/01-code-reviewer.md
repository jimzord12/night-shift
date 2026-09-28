# Review round 1: TASK-27

Snapshot: 3b03475..d95e58c (one commit, d95e58c; worktree clean at that HEAD)
Lead lenses: 2 correctness (is each Next line true for its state), 1 wiring
Coverage:
1. Wiring: the report computes `ownerState({...summary, read:true})` (Report.tsx:51). Cards use `ownerState(n)` on App's live summary (Inbox.tsx:136). Both read App's `overview` memo (App.tsx:45-65), which recomputes `questions_open`, `hand_over` and `follow_up_open` from details, so they update live. Wiring is correct.
2. Correctness: F1, F2 and F4 are false Next lines. N1 covers unreachable branches.
3. Data integrity: n/a. The change is display only and writes nothing.
4. Contracts: no API or shape change. `nextStep` only needs `questions_open`.
5. Tests and evidence: F3. No test touches the change; that is acceptable for UI proven by screenshots, but the screenshots cover only 2 of 6 states.
6. Failure handling: a clipboard failure is swallowed silently (`() => {}`). That is minor, the same as the Gate's phrases.
7. Simplicity: this is a small, well-placed new module. The small track duplicates the badge's information, as intended.
8. Docs: design.md has been updated (line 385 is over-long, a trivial issue). CHANGELOG changes are per release, and the task notes are current.

## Findings

### F1 Material: "then save for the next agent" shows when the night is already saved
Anchor: web/src/StepTrack.tsx:59
- Scenario: the owner saves at the gate with one question left unanswered (the deck and the report both allow this). Later they open the report. `questions_open` = 1, so the state is Needs answers.
- Expected: "answer its question; your answer reaches the next agent". An answer rewrites the saved follow-up (src/followup.ts:93-102), and there is no Save row (`needsHandOver` is false).
- Actual: "answer its question, then save for the next agent." After answering, the track jumps to Waiting and never passes Ready to save.
- Impact: the one line meant to guide the owner asks for a step that does not exist.
- Fix: add `follow_up` to the `Pick` and branch the text on it.

### F2 Material: Running says "the report fills in as it goes", but the page never refreshes
Anchor: web/src/StepTrack.tsx:55
- Scenario: the owner opens a running night and waits.
- Expected: the text matches the behaviour. Nothing in web/src polls or streams, so the detail loads once and changes only on Reload. The Running state also covers a night whose session has died and is waiting for recovery (types.ts:287).
- Actual: the text promises live filling-in, and says "the agent is still working" even when it is not.
- Fix: "an agent is on it; reload to see its progress."

### F3 Material: acceptance #2 was checked on only 2 of the 6 states; the copy button was never seen
Anchor: TASK-27 AC #2; .local/evidence/2026-09-28-step-track/r2-{1440,390}/
- Scenario: the screenshots show only Needs answers and Ready to save. Nobody saw the report for Running, Waiting (the new copy-phrase button), or Done. The 390 "after" shot is scrolled past the track.
- Impact: per review.md, a visible change nobody looked at is Material. The phrase button (a new control that must wrap at 390px) is untested visually.
- Also: the Viewer in the shots reads `dev · 3b03475`, and the shots were taken about 40 s before the commit, so they are of the uncommitted tree.
- Fix: capture report screenshots of the sample `api` (Running), `mobile` (Waiting, click Copy) and a Done night at 1440 and 390, from the committed build.

### F4 Minor: Waiting tells the owner to start an agent while a running night already holds the items
Anchor: web/src/StepTrack.tsx:63
- Scenario: a night runs and takes on the previous night's follow-up (every D25 night does). `follow_up_open` still counts those items, so the earlier report shows Waiting. The Next line says "start an agent… say start night shift", while the same page shows "Taken by a running night" (Report.tsx:100-102).
- Impact: this is transient. The advice is wrong and a second start would be refused.
- Fix: pass `detail.taken`. When every open item is taken, say "a running night is working on it."

### N1 Note: the "discuss" branch and the report's "new" branch cannot run
`ownerState` returns `needs_answers` only when `questions_open > 0` (types.ts:300), so the discuss branch at StepTrack.tsx:59 is dead at this snapshot. The lead's premise ("needs_answers with no open questions is the discuss case") holds only once TASK-29 changes `ownerState`. The report also forces `read:true`, so `new` never reaches `nextStep`. Keep both, but TASK-29 must exercise the discuss branch.

### N2 Note: skipped steps are ticked
A night with no questions and nothing owed ticks New, Needs answers, Ready to save and Waiting on its way to Done. The code comment says this is deliberate.

## Checks rerun
- `npm run typecheck`: exit 0.
- `npm test`: exit 0, 43 of 43 pass.
- Output is in C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\task27-r1\
- `npm run build` was not run (brief: do not rebuild web/dist).

## Evidence inspected
At d95e58c:
- web/src/StepTrack.tsx, Report.tsx, Inbox.tsx, App.tsx, ui.tsx
- src/types.ts, src/server.ts (summarise, takenRefs), src/followup.ts
- docs/decisions.md D24, docs/design.md, the task-27 record

In the main checkout:
- r2-1440/{02,03}.png, r2-390/{01,02,03}.png, both log.txt

## Limitations
- I did not play the videos or drive the Viewer myself.
- The web build was not rerun.

## Verdict: FINDINGS
