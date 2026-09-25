# Idea loop

Read this before running product or design idea work with agents. Idea
agents propose; the owner decides. Nothing from an idea run is built,
approved or put on the roadmap without the owner.

## The pattern

| Role | Does | Tools |
|---|---|---|
| Lead | Runs the loop, gives snapshots, stores reports; integrates only after the owner has answered | full |
| Author agent | Proposes at most three ideas (or two or three design concepts with mock-ups) and revises them | read, web, write in the run folder |
| Research Reviewer | Checks that sources exist, are current and say what is claimed ([templates/agents/research-reviewer.md](../../templates/agents/research-reviewer.md)) | read-only, web |
| Quality Reviewer | Judges each idea against a fixed rubric the project writes once | read-only |

No agent in the loop has the Agent tool. They cannot start each other, so
every review round starts fresh, the caps live in one place (the Lead), and
the loop is visible in the run record.

## The loop

1. Open a branch or worktree and a run folder
   (`docs/work/idea-runs/<date>-<author>/run.md`): brief, rounds, verdicts,
   what reached the owner.
2. Brief the author: the date, the run folder, any owner steer ("repeat
   buyers", "a calmer checkout"), and the current card list so it does not
   duplicate work.
3. **Research gate:** a fresh Research Reviewer per round on the author's
   sources. FINDINGS go back to the same author (keep its id so it keeps its
   context), then review again.
4. **Quality gate:** a fresh Quality Reviewer per round, with all earlier
   reports and the author's replies. Reviewers start fresh on purpose:
   judges drift towards whatever they have already seen.
5. **Caps as in [review.md](review.md):** 5 rounds attended, 10 unattended,
   per gate. At the cap an item reaches the owner marked `unresolved` with
   the last reason; it is never dropped silently. An author may drop an
   item and say so in the run record.
6. **Edits after a PASS need a re-check.** A new or changed sourced claim
   goes back to the research gate; a change to what the owner decides on
   (scope, cost, risk) goes back to the quality gate; typos and layout get
   a Lead check, noted in the run record.
7. Every reviewer gets an exact snapshot (a commit or file hashes). Reports
   are stored as `docs/work/idea-runs/<run>/reviews/NN-<reviewer>.md`.
8. Passed ideas are written as proposals with `status: pending`
   ([proposals.md](proposals.md)) on the run's branch. The run's own files
   are covered by its gates; anything else it touches goes through the
   normal review.
9. **In a Night Shift nothing is integrated.** The run stays on its branch
   and its card reports `needs-eyes`. The proposals are merged only after
   the owner answers in the Morning Review.

Bar for every reviewer: decently strict, not perfectionist. Fail generic,
copied, broken or unsupported work; taste and polish are Notes.

## How it feeds the Day Shift

- Idea runs are good night work: an `explore` card
  (`night-shift: kind=explore size=L touches=docs/work/idea-runs`) whose
  Outcome is `needs-eyes`.
- In the Morning Review the owner sees each idea's one-line pitch or each
  concept's image, which items are `unresolved`, and the rounds each gate
  took. A `many` Question ("Which of these go to the Day Shift?") collects
  the answer.
- The answer maps to proposal states: build it -> `approved` and a card in
  the next Day Shift; later -> `deferred`; reject -> `rejected`; no answer
  -> no change, and the branch stays unmerged. Once the owner has answered,
  the Lead merges the run's branch with the updated states.
- Product ideas at most weekly; the owner's attention, not agent time, is
  the limit.
