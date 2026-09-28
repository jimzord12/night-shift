# Review round 1: TASK-46

Snapshot: worktree `night-shift.worktrees/ci`, `b273f6f..dfb222a` (688e768, a070095, dfb222a); tree clean at dfb222a98fa3.
Lead lenses: (1) one-writer rule and file versions; (2) the deck adapter and tests that pass with the feature broken
Coverage:
1. Product fit and wiring: CLI `decide` → night file → summary → Inbox, deck, Report, Gate and notify are all wired. The deck adapter (handedOf, isOpenItem, TALK, settled/takenBack, decisionItem) is consistent at every question-shaped site I found. Checked in depth under lens 2.
2. Correctness: carrying a disagreement into a later night drops the owner's note (M2).
3. Data integrity: follow-up ids use max+1, locks mirror followAnswer, and the night is saved only after followDecision passes. The race between a read, change and write by the Viewer and a concurrent write by the tool is the same as in the existing answer path (Note).
4. Contracts: the Viewer writes only review, note and reviewed_at. `decide` refuses a @2 night. An older release's schema enum rejects @3 files. A @2 night without `agent_decisions` goes through `agentDecisions()`/`decisionsOpen()` safely.
5. Tests and evidence: the UI gate fails at head (M1). One mutant survives (M3).
6. Failure handling: fine; a non-string `note` would give a 500, as in the answer route (Note).
7. Simplicity: fine; `decisionKey` in Report.tsx duplicates the key built by `decisionItem` (Note).
8. Docs: D31, design, glossary, skills and AGENTS.md are coherent. The AGENTS.md and skill edits may also need `context-reviewer` (lead's call).

## Findings
### M1 Material: `npm run test:ui` fails at the reviewed head; evidence predates it
Anchor: tests/ui/deck.test.ts:228; web/src/StepTrack.tsx:64 (dfb222a)
Scenario: dfb222a added the Next line "review the 2 decisions the agent took for you". `getByText('2 decisions the agent took for you')` now matches that line as well as the What needs you row, so Playwright reports a strict-mode violation.
Expected: 4 pass. Actual: 3 pass, 1 fail. It failed on 4 of 4 runs.
Impact: the claimed gate result is from before the last commit. The screenshots show `dev · a070095` in the header, so the new Next line was never seen.
Fix: make the locator exact (`{ exact: true }`, or scope it to the row), rerun `test:ui`, and retake the Report screenshot at head.

### M2 Material: a disagreement carried by a night that does not finish it loses the owner's note
Anchor: src/followup.ts:38 (the priors filter keeps only `kind === 'decision'`)
Scenario (probe run): night A has AD1 disagreed with the note "Use browser print to PDF; no library". A's follow-up gets A1 `disagreed`. Night B plans T1 from A/A1 and ends `partial`, so A/A1 becomes `carried` and locked. B's follow-up is then only `[{kind:'unfinished', left:[…]}]`.
Expected: the disagreement and its note are carried forward, as a `decision` item is.
Actual: the owner's instruction is gone from what the next agent reads, and the owner cannot restate it because the review is locked.
Fix: carry `disagreed` priors too, keeping kind, `question`, `agent_decision` and `owner_note`. Add a test for it.

### M3 Material: removing the hand-over branch for disagreements breaks no test
Anchor: src/types.ts:344 (`|| disagreed(n).length > 0`)
Scenario: I ran a mutant with that clause removed in a scratch copy: `node --test tests/*.test.ts` still gives 65/65. Every test night also has unfinished work or a question.
Impact: a night whose only hand-over content is a disagreement (all tasks done) would show Done and never be saved. No test guards this.
Fix: add one assertion to decisions.test.ts: all tasks done plus one disagreement gives `hand_over: true`, `ready_to_save`, and the follow-up holds the `disagreed` item.

### m1 Minor: the rule that decisions need a @3 file is untested and hard-codes the version string
Anchor: src/store.ts:175. Use `NIGHT_SCHEMA` and assert that a @2 file carrying `agent_decisions` reports the problem.

### m2 Minor: start message ends in ".." when the note ends with a period
Anchor: src/night.ts:183. Seen in the probe: "…no library.. Revisit it". Trim the trailing punctuation.

### m3 Minor: `follow-up list` shows a disagreed item as just the task title
Anchor: src/cli.ts:152. Append `question` or `owner_note` for the `disagreed` kind.

### Notes
- The History row (Views.tsx:121) counts open questions but not decisions.
- The Inbox alert reads "1 question or decision is".
- When `task` is null, title and question are the same text.
- Answers and reviews share the same read, change and write window against the tool.

## Checks rerun
- `npm run check` (PowerShell): exit 0; 65 tests, 65 pass. Log: scratchpad/t46r1/check2.log. An earlier Git Bash attempt returned exit 1 with an empty log; I put that down to the environment and did not count it.
- `npm run test:ui`: exit 1; 3 pass, 1 fail (M1). Log: scratchpad/t46r1/ui.log. `node --test tests/ui/deck.test.ts` three more times: fails every time (ui-deck-1..3.log).
- Probe scratchpad/t46r1/probe/carry.ts (real repo, git and server): confirms M2 and m2.
- Mutant in scratchpad/t46r1/copy (source copy): 65/65 pass, log mut1.log (M3).

## Evidence inspected
The diff `b273f6f..dfb222a` (src, schemas, web, tests, docs, skills). Surrounding code in followup.ts, server.ts, store.ts, QuestionDeck.tsx, Gate.tsx, App.tsx, Inbox.tsx, Report.tsx. `.local/evidence/2026-09-28-decisions/r0`: 1440-02-report.png and 1440-05-disagree.png (both at a070095), log.txt.

## Limitations
I did not drive the Viewer myself at phone width. The UI test was not rerun from the scratch copy, and I did not run the deck mutants.

## Verdict: FINDINGS
