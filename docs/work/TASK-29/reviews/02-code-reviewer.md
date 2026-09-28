# Review round 2: TASK-29 (with TASK-30, 39, 41, 44), file shapes v2

Snapshot: c2daac6..6d06ec1 (`feat/file-shapes` = 6d06ec10), focused on a4ea92e..6d06ec1. I exported it with `git archive` into scratch. The worktree now has uncommitted edits to `web/src/Report.tsx` and a `02-design-reviewer.md`; I did not review those.
Lead lenses: 3 data integrity, 4 contracts (plus 5 tests, as asked)
Coverage:
1. Wiring: the answer route reaches `followAnswer`, `start` stamps `plan.json`, the Report's `NeedsYou` reads the follow-up's discuss items, and the Inbox button now reads "Talk it through".
2. Correctness: an agent can supply an option id of `discuss` (m3).
3. Integrity: the round-1 fixes hold (`nightProblems`, several carried decisions, @2 stamps). The same defect as round-1 M1 remains on the question branch (M1). The m1 disposition's claim about older releases is wrong (m1).
4. Contracts: `text/plain` is served inline with `nosniff` and `sandbox`. Night evidence `.txt`/`.md` files are now shown inline too, which is safer than the old download. A BOM still overrides the forced utf-8. All @2 schemas are pure supersets, so stamping @2 cannot invalidate a file.
5. Tests: I ran 10 mutants. 7 are killed. The follow-up @2 stamp and the text/plain sandbox survive (m2).
6. Failure handling: a refused discuss save shows its reason, and the note gets focus.
7. Simplicity: fine. `Report.tsx` imports from `./Gate.tsx` on two separate lines (Note).
8. Docs: cli, glossary and AGENTS.md now say @2. `design.md:171` overstates what an older release does (m1).

## Findings
### M1 Material: a carried task that ends on a new question loses every decision it carried
Anchor: `src/followup.ts:25-31` (the `q` branch). The new comment at :33 says "Every decision the task carried keeps the developer's answer".
Scenario (reproduced, `cr2-shapes/probe-carry.ts`): T1 follows A1 ("Detailed") and A2 ("Cookie"). During the night it asks Q1 ("Which PDF library?") and ends blocked by Q1. The owner answers "pdfkit".
Expected: the next follow-up carries pdfkit, Detailed and Cookie.
Actual: `[["T1","decision","pdfkit"]]`. A1 and A2 are `carried` in the old follow-up, so no one reads them again. The same happens when Q1 is left unanswered (a single `waiting` item).
Impact: the loss round-1 M1 described, on the sibling branch. A task that follows a decision and then asks a further question is a common path. The code predates this change, but the fix touched this function and now claims the opposite.
Fix: compute `priors` before the branch. After the question's item, add one decision item per prior (without `left`). Add a test with a blocked-by-question outcome.

### m1 Minor: an older release still misreads a discuss answer in a `night@1` file
Anchor: `src/server.ts:222-246` (the answer route keeps the file's schema); `docs/design.md:171`; the m1 disposition on TASK-29.
Scenario (reproduced, `cr2-base/probe-old.ts`): c2daac6 runs and closes a night (`night@1`). The head Viewer saves `discuss` with a note. The c2daac6 Viewer's follow-up route returns 200 and writes a `follow-up@1` item `{kind:"decision", decision:"discuss", decision_label:"discuss"}`. The only sign is the Report's problem banner.
Impact: this needs two versions reading the same nights, which is this repo's own 4747/4748 setup. An old night would then act on "discuss" as a decision. The disposition says "refused … not misread", which is untrue.
Fix: when a discuss answer is saved on a closed night, stamp `NIGHT_SCHEMA` (not on a running one, or its older CLI could no longer record or close). Or state the limit in design.md and the CHANGELOG, and correct the disposition.

### m2 Minor: two fixes have no test that fails without them
Anchor: `src/followup.ts:101`, `src/server.ts:58`
Mutants: deleting `f.schema = FOLLOW_UP_SCHEMA` leaves 52/52 passing. Exempting `text/plain` from the `sandbox` CSP also leaves 52/52.
Impact: low. The old follow-up@1 schema already rejects `kind: discuss`, and text/plain with nosniff is inert.
Fix: after changing an answer on an @1 follow-up, assert that the schema is @2. Assert `content-security-policy: sandbox` on the `.md` response.

### m3 Minor: an agent's option id `discuss` collides with "let's discuss"
Anchor: `src/night.ts:293` (`id: o.id ?? …`)
Scenario: `ask` with `{id:"discuss", label:"Discuss with the team"}`. Choosing that option requires a note and becomes a `discuss` item, which no night works on.
Fix: `ask` refuses the reserved id.

### N1 Note
Deleting the `nosniff` header also survives the tests. This predates the change and applies to all media.

### N2 Note
The r3 screenshots and logs are from 16:37–16:38; 6d06ec1 was committed at 16:38:46. The logs match the committed behaviour (key 0 leaves the note empty, focus goes to the TEXTAREA, the note bottom sits above the footer, "1 point to talk through").

## Checks rerun
- `node --test "tests/*.test.ts"` on the exported snapshot, with TEMP pointing at the scratch folder: exit 0, 52/52 pass. Output: `…\scratchpad\cr2-shapes\out\baseline.txt`
- 10 mutants (A–J) via `…\scratchpad\cr2-shapes\mut.sh`. A, B, D, E, F, G and J are killed; C, H and I survive. Output: `…\cr2-shapes\out\mut-*.txt`
- `tsc --noEmit` for the root and for `web/tsconfig.json`: both exit 0 (`out\tsc-*.txt`).
- Probes: `…\cr2-shapes\probe-carry.ts` (M1) and `…\cr2-base\probe-old.ts` (m1), both exit 0.
- `npm run check`: I did not rerun it, because the web build writes into the checkout.

## Evidence inspected
- The diff a4ea92e..6d06ec1.
- At 6d06ec1: `src/followup.ts`, `src/server.ts:40-65,180-260,325-375`, `src/store.ts:105-170`, `src/night.ts:135-185,285-300`, the schema diff c2daac6..HEAD, `tests/shapes.test.ts`.
- At c2daac6: the server's follow-up route and `followup.ts`.
- The round-1 reports and the TASK-29 notes.
- `.local/evidence/2026-09-28-shapes/r3-{1440,390}/log.txt`, `r3/plans-report-390.png`, `r3-390/04-discuss-no-note-390.png`.

## Limitations
I did not open the Viewer in a browser; the design and visual reviewers cover that. I did not run the UI tests.

## Verdict: FINDINGS
