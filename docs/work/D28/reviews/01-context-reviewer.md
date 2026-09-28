## Review round 1: D28 GitHub-issue intake (`7ccabb9..5a2aecc`, AGENTS.md and docs)

The principle comes through in the owning file. `docs/practices/task-flow.md` "GitHub issues" treats issues as an inbox and makes the task the record. It covers searching the board before creating a task, the `tracked` label, `Closes #<n>`, closing by hand, public names, and that intake is routine. The `tracked` and `proposal` labels exist on GitHub. `--ref` exists in the Backlog.md CLI. All seven files are LF. D28 is appended correctly with Why, Chosen and Rejected, and it replaces no older entry. `docs/owner.md` agrees with it. Two gaps would send agents wrong, so the verdict is FINDINGS.

### Material

1. **The `Night` carve-out exists in only one of the three places that state the rule.**
   - **Where:** `AGENTS.md:34-36`, `docs/practices/orientation-and-handoff.md:17-20` and `docs/practices/task-flow.md:51`.
   - **What is wrong:**
     - `AGENTS.md` and orientation step 4 both say intake happens before new work, with no exception.
     - The orientation practice opens "Read this when starting or ending any session, day or night" (line 3).
     - task-flow's own lead-in says "every session", then line 64 takes it back.
   - **Why it matters:** an agent starting a `Night` from `AGENTS.md` or the orientation practice would do intake. That writes to GitHub and the board, outside its `Plan`, against D28.
   - **Smallest fix:** say "day session" in all three places. Line 64 can then shrink to the reason ("a `Night` works only its `Plan`; the next day session does the intake, D28") or merge into the lead-in.

2. **The closing rule has a hole when a branch is fast-forwarded.**
   - **Where:** `docs/practices/git.md:84-87`.
   - **What is wrong:** the bullet puts `Closes #<n>` on "the merge commit, or the commit itself when it goes straight to `main`". The Integration section of the same file says "Prefer fast-forward or ordinary merges". A fast-forward has no merge commit, so an agent following the text has nowhere to put the line and the issue stays open.
   - **Why it matters:** GitHub closes the issue when any commit carrying the keyword reaches the default branch.
   - **Smallest fix:** "A commit that brings the task's work to `main` (on the branch, or the merge commit) has one `Closes #<n>` line per issue in its body." task-flow line 71 already reads that way.

### Minor

3. **An action step sits inside the read-only reading list.**
   - **Where:** `AGENTS.md:34-36`.
   - **What is wrong:** line 23 says "Orient in this order, read-only, then give the four-line briefing". The write step is buried inside step 3 of that list. It is sequenced correctly ("After the briefing"), but it reads as part of the read-only steps.
   - **Smallest fix:** move the sentence out of the list, either as a line after step 4 or appended to the lead-in: "…then give the four-line briefing; in a day session, before new work, turn each open issue without the `tracked` label into a task (docs/practices/task-flow.md)". The same applies, more weakly, to orientation step 4 sitting just above the "Read-only and repeatable" rule (line 24). A clause there such as "intake follows the briefing" would remove the apparent contradiction.

4. **Loose use of terms in D28.**
   - **Where:** `docs/decisions.md:400`.
   - **What is wrong:** "(feedback that `Adopter`s sent from the `Viewer`)". An `Adopter` is a repository. The glossary says the `Owner` sends `Feedback`, and task-flow line 47 gets it right. `Feedback` is also a glossary term and should be in backticks.
   - **Smallest fix:** "(`Feedback` an `Adopter`'s `Owner` sent from the `Viewer`)".

### Notes

5. **Who decides an issue closed "without code".** `docs/practices/task-flow.md:73-75`: "an issue answered without code" could let an agent close a feature request on its own judgement. Lines 66-68 do keep "whether it is built" with the owner, so this is only a question of whether to name the owner's decision in the closing line.
6. **Repeated command and pointer.** `gh issue list --state open` appears in `AGENTS.md`, orientation step 3 and the task-flow block, and the intake sentence is repeated as a pointer in two files. This follows the existing pattern of mirroring orientation in `AGENTS.md`, so it is acceptable once finding 1 makes the wording agree.
7. **Unverified filename in the design sentence.** The history-commit sentence at `docs/design.md:179-181` reads well. `history-commit.log` is not in `src/` at `5a2aecc`; it arrives with `259da84`, which is reviewed elsewhere.
8. **No terms or names to add.** No new glossary term is needed: "day session" and "intake" are ordinary words already used in `docs/decisions.md` and `docs/practices/git.md`. No real names appear in the diff.

Files reviewed: AGENTS.md, docs/practices/task-flow.md, docs/practices/orientation-and-handoff.md, docs/practices/git.md, docs/owner.md, docs/decisions.md, docs/glossary.md, backlog/README.md.

Verdict: FINDINGS

## Dispositions (lead)
- 1: fixed; "day session" in AGENTS.md, orientation step 4 and task-flow; a `Night` leaves intake to the next day session.
- 2: fixed; any commit reaching `main` carries `Closes #<n>`, one on the branch survives a fast-forward.
- 3: fixed; the intake sentence moved to AGENTS.md's lead-in; the read-only rule says intake comes after the briefing.
- 4: fixed.
- 5: fixed; "a task the owner cancelled".
- 6-8: no change.
