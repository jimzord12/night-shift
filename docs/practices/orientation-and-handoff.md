# Orientation and handoff

Read this when starting or ending any session, day or night.

## A fresh session

1. Read the project's entry file (`AGENTS.md` or equivalent) and its owner
   file ([owner.md](owner.md)).
2. Read the **session-handoff card** first: the previous session's resume
   point, parked owner decisions and pitfalls.
3. Derive the state from the sources: the vision, relevant decisions and
   proposals, the task cards, Git state and the evidence for the revision
   you are looking at. The handoff card orients; the cards, Git and
   evidence are the authority when they disagree.
4. Give the four-line briefing, then continue within authorised scope.

Rules for orientation:

- **Read-only and repeatable.** No state changes, no saved status file, no
  background watcher. Unchanged inputs give the same report.
- **Approved design is not implemented behaviour.** Say which one you mean.
- **A historical check is not current proof.** A test that passed last week
  on another commit proves nothing about today's `main`.
- Flag missing or conflicting evidence; never invent certainty.
- If the board cannot be read, say so. Do not infer state from an old
  export.

## The four-line briefing

Use it on a fresh or resumed session and on any status request.

```text
Goal: Lighthouse sells more by making the catalogue easy to search.
Now:  Size and colour filters are live on main; csv-export is blocked on a date-format Question.
Next: Build search-speed (Night-ready, size S).
You:  Answer the date-format Question; I recommend ISO dates.
```

## Ending a session

Rewrite the session-handoff card before stopping
([templates/handoff-card.md](../../templates/handoff-card.md)); at night,
only one agent does this ([At night](#at-night)):

- **One card, rewritten in place.** Never a second one, never deleted, never
  moved. The board keeps its history.
- Keep the heading and intro, then a line
  `**Written:** <yyyy-mm-dd>, <what the session was> (<agent>)`.
- Hold only what no task card owns: where things stand across tasks, the
  next steps in order, parked owner decisions, machine facts (a tool that
  needs a fresh shell, a flaky service), pitfalls that cost time, and
  constraints in force.
- A task's own state goes in that card's `## Handoff` section.
- **Verify by reading it back.** Read the description after writing it and
  confirm the `**Written:**` line is yours ([board.md](board.md)).
- A local handoff file, if any, mirrors the card; it is never a second
  source.

An agent that stops without rewriting the card leaves the next session to
rebuild the state from the cards and Git: slower, but always possible.

## At night

Parallel builders never rewrite the one handoff card: the last writer would
win. Instead:

- Each builder, after posting its Outcome, writes its own card's
  `## Handoff` section.
- Only the Lead, or the last builder of the night once all others have
  finished, rewrites the session-handoff card, merging those sections.

The Morning Review shows Outcomes and Questions; the handoff card carries
what the next Day Shift needs beyond them.
