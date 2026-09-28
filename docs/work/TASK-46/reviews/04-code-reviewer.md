# Review round 4: TASK-46

Snapshot: `b273f6f..2f17f60` (round-3 fixes `bdd05d5..2f17f60`). Exported with `git archive 2f17f60` to scratch `t46r4/snap`, with node_modules junctioned read-only from the worktree (no install). Worktree clean before and after.
Lead lenses: (1) acceptance criteria end to end; (2) composition of `agent_decisions` / `disagreed` across schema, types, store, server and Viewer.
Coverage:
1. Wiring: I ran the real CLI in a scratch git repo. `start`, then `decide --file` recorded AD1 in a `night@3` file with `review:null`. `status` lists "Decisions taken for the developer: AD1". An empty `decision` is refused with exit 1. The Viewer posts to `/decision` through `postReview` (api.ts:39), and the body matches the server contract (server.ts:266-285).
2. Correctness: I checked the sibling paths:
   - `followAnswer` vs `followDecision`: same locks; taken-back items reopen.
   - `start` refuses a non-open or held-for-talk `disagreed` item, same as other kinds.
   - `buildFollowUp` carries `disagreed` priors without `agent_decision`.
   - `applyNightToFollowUps` treats it like `decision`.
3. Data integrity: the server validates, then `saveNight` runs its shape check, and only then is the follow-up saved. A note over the schema's 2000 characters gets a 422 before anything is written.
4. Contracts (lead 2): the layers agree.
   - `AgentDecision` in types.ts:107 matches the night schema:134-146 field for field, including `reviewed_at`.
   - `ItemKind` and `agent_decision` match the follow-up schema:22,29.
   - `nightProblems` (store.ts:168-175) adds what the schema cannot say: duplicate ids, unknown task, a disagreement without a note, and decisions in a pre-@3 file.
   - `decide` refuses an @2 open night. `followDecision` and `followAnswer` lift the follow-up to @3 before writing a new kind.
   - Every Viewer read goes through `agentDecisions()` or `?? 0`, so @1/@2 files render (the Report section is hidden when empty).
   - An older release refuses @3 files outright, by design (N2).
5. Tests: both round-3 fixes hold.
   - The day-skill assertions (shapes.test.ts:213-214) match real one-line text (SKILL.md:40-45). Deleting either sentence fails the test.
   - I re-ran the round-3 m1 mutant: removing the `item.decision && draft.answer !== TALK && !lock ? null :` clause at QuestionDeck.tsx:429. The D31 UI test now fails on the new `+ add a note` count assertion (deck.test.ts:236), so the mutant is killed.
6. Failure handling: stale reviews get a 409; a held item gets a 409 with the running night named; `decide` failures print "refused:" and exit 1.
7. Simplicity: fine; no scope growth since round 3. Round 3 changed only docs, skills and tests; no code in `src/` or `web/src`.
8. Repo/docs: AGENTS.md (one writer per field; @3), the glossary (`Agent decision`), D31 and design.md are current. CHANGELOG is due at release time.

Lead 1, the three acceptance criteria:
- **AC#1:** the Inbox count and Start my morning are covered by the UI test (deck.test.ts:223-227). The per-task pills, the Report section and the drawer are covered by `r2/1440-02-report.png`, `1440-01-inbox.png` and `1440-03-drawer.png`. They are stamped `dev · bdd05d5`, and no `web/src` file changed after that commit, so they show the reviewed UI.
- **AC#2:** covered by decisions.test.ts:47-140 through the real server and files, and by the UI test through the real deck (:238-250). `r2/1440-07-next-night.png` shows the disagreement handed on.
- **AC#3 as amended:** the night-skill text (SKILL.md:136-192) and the day-skill text are both present and tested.

## Findings
None Blocking or Material.

### N1 Note: the `decide` CLI case has no automated test
Anchor: src/cli.ts:222-224. Tests call `decide()` directly. My probe shows the wiring works. The sibling `ask` and `record` cases have the same gap. Not worth a test on its own.

### N2 Note: an older release refuses @3 files
Anchor: schemas/night.schema.json:47. A Viewer or launcher still on v16 shows an @3 night as "Cannot be read", and fails `follow-up list` on an @3 follow-up. This is intended ("refuses rather than misreads"). The release's CHANGELOG entry should say: switch, re-install, and restart a running `view` before the first @3 night.

### N3 Note: an asymmetry in how early versions are checked
Anchor: store.ts:175 vs follow-up schema:22. A night file below @3 that holds decisions is reported. A follow-up file below @3 that holds a `disagreed` item is not. The tool never writes the latter, so this is harmless.

Earlier notes still stand and are dispositioned: the hidden note saved on a quick switch, a non-string note returning 500, the read-modify-write race.

## Checks rerun
Logs are under `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\t46r4\`.
- `npm run check` on the snapshot: exit 0; 68/68 tests pass; the build passes (`check.log`).
- `npm run test:ui`: exit 0; 4/4 pass (`ui.log`).
- The m1 mutant under `test:ui`: exit 1; the D31 test fails as it should (`mut-ui.log`). I restored the source and confirmed its hash matches the worktree. `snap/web/dist` still holds the mutant build, in scratch only.
- CLI probe (`start`, `decide` ok, `decide` refused, `status`) in `t46r4\probe` with `NIGHT_SHIFT_ROOT=t46r4\root`: the results are as listed above.

## Evidence inspected
All at 2f17f60:
- src/types.ts, store.ts:98-179, server.ts:259-286, followup.ts, night.ts:130-185 and 324-352, cli.ts diff, api.ts diff.
- web/src/Report.tsx:90-130, QuestionDeck.tsx:429-433, Inbox.tsx and Views.tsx greps.
- Both schemas, both SKILL.md files.
- tests/decisions.test.ts, tests/ui/deck.test.ts:203-255, the shapes.test.ts diff.
- AGENTS.md, glossary and D31 diffs; the task record.
- Reports 01-03.
- Screenshots `.local/evidence/2026-09-28-decisions/r2/1440-01`, `-02` and `-07`.

## Limitations
- I did not drive the Viewer at phone width. The visual reviewer did in round 2.
- I did not exercise the CLI `follow-up list` output for a `disagreed` item. Tests cover it at the function level.
- I did not look at a running v16 Viewer against @3 files; N2 is reasoned from the schema enums.

## Verdict: PASS
