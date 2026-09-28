## Review round 2: D28 GitHub-issue intake (`47a3683..b9b4cff`, and the whole change `7ccabb9..b9b4cff`)

All five findings from round 1 are resolved. The five places that state the rule now agree: `AGENTS.md`, orientation-and-handoff.md, task-flow.md, git.md and D28.

- **Day session only.** Each of the five says intake happens in a "day session", after the briefing and before new work.
- **`Night`.** A `Night` leaves intake to the next day session. Orientation step 4 and the task-flow bullet both say so.
- **Closing.** git.md:84-87 and task-flow.md:71 both say "a commit that brings…", so a `Closes #<n>` on a branch commit also survives a fast-forward.
- **owner.md:49-50.** It lists intake and closing as things agents decide and do, which matches "Intake is routine".
- **Terms and hygiene.** D28 now uses `Feedback` an `Adopter`'s `Owner` as the glossary defines them. No real names are in the diff. All six files are LF (0 CR bytes, counted with `node`).

Three wording and formatting issues remain.

### Minor

1. **The colon in `AGENTS.md` now introduces the wrong sentence.** `AGENTS.md:23-26`: the lead-in ends with the intake sentence and a colon, so the numbered reading list reads as the intake steps. Smallest fix: move the intake sentence below step 4.
2. **One long line in orientation-and-handoff.md.** Line 25 is 99 characters; break it after "comes after the briefing."
3. **Wrap drift in D28.** `docs/decisions.md:400` runs to about 79 characters; re-wrap the paragraph.

### Notes

4. **D28 still says "the commit".** The practices now say "a commit"; D28 can match them.
5. **git.md wording.** "brings a task from a GitHub issue to `main`" would read better as "the task's work"; the parenthesis is heavy but correct.
6. **The `Night` exception now appears four times.** Acceptable; the task-flow bullet only adds the reason.
7. **Out of scope.** `skills/start-night-shift/SKILL.md`, `docs/design.md` and `src/` belong to 259da84, reviewed elsewhere.

Files reviewed: AGENTS.md, docs/practices/orientation-and-handoff.md, docs/practices/task-flow.md, docs/practices/git.md, docs/owner.md, docs/decisions.md, docs/work/D28/reviews/01-context-reviewer.md.

Verdict: PASS

## Dispositions (lead)
- 1-5: fixed after the pass (wording and wrapping only).
- 6, 7: no change.
