# Backlog: how this repository tracks its work

Backlog.md is the single tracker for Night Shift's own work: every open
item, idea and known gap is a task here (D16). This page holds **our
conventions**; the tool's manual is `backlog --help` and
`backlog instructions overview`. The installed version's help wins over
newer upstream examples.

## Install

```sh
npm install --global backlog.md@1.52.0          # the tested version
backlog --version                                # 1.52.0
```

Never run an unqualified `npx backlog`: it can resolve to an unrelated
package. Upgrade deliberately, then update the version above and in
`docs/contract.md`.

## Before touching a task

1. Read `AGENTS.md`, then this page.
2. Search first: `backlog search "<words>" --plain`, then
   `backlog task list --plain`. Never file a duplicate.
3. Read the task and every doc it links: `backlog task view TASK-<n> --plain`.

## The rules

- **Use the CLI** for tasks, docs, milestones and metadata; never hand-edit
  their Markdown (the app and other agents read its section markers). Use
  `--help` for syntax and `--plain` for reading.
- **One reviewable outcome per task.** Title: a verb and a concrete result
  ("Run npm run check in CI on every push to main"). The CLI allocates the
  `TASK-<n>` id; never reuse one.
- **Description:** the problem, what triggers it, its impact and scope, and
  how sure we are (reproduced, read in the code, or assumed).
- **Acceptance criteria describe observable behaviour** and never get
  ticked before they are verified.
- **Short material lives on the task** (plan, notes, final summary). A
  separate doc under `backlog/docs/` only when it earns it (a design, a
  research write-up); link it with `--doc`.
- **Ideas the owner has not decided** are titled `Idea: …`, priority Low,
  and say "discuss with the owner before implementing". Creating a task
  never authorizes building it.

## Statuses (the task-flow practice)

| Status | Means |
|---|---|
| Queued | Waiting; ordered by priority, then `ordinal` |
| Active | One named holder (`-a @<agent>`) is working on it |
| Review | Built; the review gate is running |
| Ready | Passed review and checks; not yet on `main` with CI confirmed |
| Done | Integrated, pushed, `npm run check` passes, final summary written |

Ready is not Done (docs/practices/task-flow.md).

## Labels

| Label | Use |
|---|---|
| `night-ready` | Nothing left to decide; its Description starts with the `Card Header` (`night-shift: kind=… size=… touches=…`). A night may take it |
| `blocked` | Keeps its status; the notes say the blocker and what unblocks it |
| `triage` | An observation not yet confirmed as a defect (type `spike`) |
| `external` | Limited by something outside this repository |
| `app`, `cli`, `protocol`, `practices`, `templates`, `release`, `ci` | The area it touches |

Types: `bug` (a confirmed defect), `feature`, `enhancement`, `chore`,
`docs`, `spike` (find out, not build). Priority: High for correctness,
trust or the trial's real test; Medium for meaningful improvements; Low
for limited-impact clean-up and ideas. Priority is not a deadline.

## Working a task

```sh
backlog task edit TASK-7 -s Active -a @claude
backlog task edit TASK-7 --plan "1. … 2. …"
# build, check, review
backlog task edit TASK-7 --check-ac 1 --final-summary "What changed; checks and results; what remains unverified."
backlog task edit TASK-7 -s Done
```

- Commit task changes together with the work they describe. Automatic
  commits and remote operations stay off in `config.yml`.
- **Found something on the way?** A confirmed defect becomes a `bug`; an
  unsure observation becomes a `spike` labelled `triage`. Before calling a
  piece of work done, triage those or name the open ids to the owner.
- **Parallel agents:** one coordinator creates the tasks before handing
  them out; each task has one holder; branches can allocate the same id,
  so only the coordinator creates.

## Handoff

- **The session handoff** is one Backlog.md document, `doc-1` (shape:
  `templates/handoff-card.md`), rewritten in place at the end of every
  session with `backlog doc update doc-1 --content "…"`. Never a task:
  it would sit in the queue and could be moved by `backlog cleanup`.
- **A task's own handoff** goes in its implementation notes
  (`backlog task edit TASK-<n> --append-notes "…"`); parallel builders
  write only their own task's notes.

## This repository on its own protocol

The Night Shift app can show this backlog: create `.night-shift/project.json`
(git-ignored) with

```json
{ "schema": "project/1", "name": "Night Shift", "repo": "https://github.com/jimzord12/night-shift",
  "board": { "type": "backlog", "readyLabel": "night-ready", "doneLists": ["Done"] } }
```

then `night-shift serve . --open`. A night's builders post Outcomes as task
comments (`docs/contract.md`, "A Backlog.md board").

## Notes that are not bugs

- Screenshots taken through the browser automation tool at high DPI show a
  dark band across the top after scrolling; the page has content there
  (checked with `elementFromPoint`). It is the capture, not the app.
