# Backlog: how this repository tracks its work

<!-- Night Shift template: copy to backlog/README.md after `backlog init`,
copy templates/backlog/config.yml over backlog/config.yml, fill the
<slots>, delete this comment. -->

Backlog.md is the single tracker for <Project>'s work: every open item,
idea and known gap is a task here. This page holds **our conventions**; the tool's manual is `backlog --help` and
`backlog instructions overview`. The installed version's help wins over
newer upstream examples.

## Install

```sh
npm install --global backlog.md@1.52.0          # the tested version
backlog --version                                # 1.52.0
```

Never run an unqualified `npx backlog`: it can resolve to an unrelated
package. Upgrade deliberately, then update the version above.

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
  ("Export orders as CSV"). The CLI allocates the
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
| Done | Integrated, pushed, `<the test command>` passes, final summary written |

Ready is not Done (Night Shift practice `task-flow`).

## Labels

| Label | Use |
|---|---|
| `night-ready` | Nothing left to decide; its Description starts with the `Card Header` (`night-shift: kind=… size=… touches=…`). A night may take it |
| `blocked` | Keeps its status; the notes say the blocker and what unblocks it |
| `triage` | An observation not yet confirmed as a defect (type `spike`) |
| `external` | Limited by something outside this repository |
| `<area>`, `<area>` | The area it touches |

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

## The Night Shift app

`.night-shift/project.json` (git-ignored) points the app at this backlog:

```json
"board": { "type": "backlog", "readyLabel": "night-ready", "doneLists": ["Done"] }
```

Builders post each Outcome as a task comment and copy its evidence files
to `.night-shift/attachments/<task id>/` (`night-shift docs contract`).
