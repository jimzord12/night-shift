# Orientation and handoff

Read this when starting or ending any session, day or night.

## A fresh session

1. Read `AGENTS.md`, the owner file ([owner.md](../owner.md)) and every
   file in `.local/preferences/` when it exists
   ([local-folder.md](local-folder.md)).
2. Read the **session handoff** first (`backlog doc view doc-1 --plain`):
   the previous session's resume point, parked owner decisions and
   pitfalls.
3. Derive the state from the sources: the design, relevant decisions, the
   tasks, Git state and the evidence for the revision you are looking at.
   The handoff orients; tasks, Git and evidence are the authority when they
   disagree.
4. Give the four-line briefing, then continue within authorised scope.

Rules for orientation:

- **Read-only and repeatable.** No state changes, no saved status file, no
  background watcher. Unchanged inputs give the same report.
- **Approved design is not implemented behaviour.** Say which one you mean.
- **A historical check is not current proof.** A test that passed last week
  on another commit proves nothing about today's `main`.
- Flag missing or conflicting evidence; never invent certainty.
- If the tracker cannot be read, say so. Do not infer state from an old
  export.

## The four-line briefing

Use it on a fresh or resumed session and on any status request.

```text
Goal: A developer understands an unattended night in 5 to 10 minutes.
Now:  The tool records and closes nights on main; the Viewer's morning page waits on a layout question.
Next: Build the Viewer's Create follow-up button.
You:  Pick the question-card layout; I recommend one question per screen.
```

## Ending a session

Rewrite the session handoff, `doc-1`, before stopping
(`backlog doc update doc-1 --content "…"`, `backlog/README.md`); with
parallel agents, only one does this ([Parallel agents](#parallel-agents)):

- **One document, rewritten in place.** Never a second one, never deleted,
  never moved. Git keeps its history.
- Keep the heading and intro, then a line
  `**Written:** <yyyy-mm-dd>, <what the session was> (<agent>)`.
- Hold only what no task owns: where things stand across tasks, the next
  steps in order, parked owner decisions, machine facts (a tool that needs
  a fresh shell, a flaky service), pitfalls that cost time, and constraints
  in force.
- A task's own state goes in its implementation notes.
- **Verify by reading it back** (`backlog doc view doc-1 --plain`) and
  confirm the `**Written:**` line is yours.
- A local handoff file, if any, mirrors `doc-1`; it is never a second
  source.

An agent that stops without rewriting `doc-1` leaves the next session to
rebuild the state from the tasks and Git: slower, but always possible.

## Parallel agents

Parallel agents never rewrite `doc-1`: the last writer would win. Instead:

- Each agent writes only its own task's implementation notes.
- Only the Lead, or the last agent once all others have finished, rewrites
  `doc-1`, merging those notes.

In a night, the night file carries outcomes, evidence and questions for the
owner; `doc-1` carries what the next session needs beyond them.
