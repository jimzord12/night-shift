# Task flow

Read this before creating, moving or closing a task.

## One home per fact

- **The Backlog.md task is the record.** Brief, acceptance, result, review
  links and handoff live on the task (`backlog/README.md`).
- One authoritative home per task, decision and rule. No second status
  file, dashboard or tracker. When a summary is needed, derive it from the
  sources on demand; a saved status report is a dated snapshot, never an
  authority.
- A small fix may use its commit body as the record. Multi-session work,
  file-shape changes and migrations get a task.

## Stages

| Stage | Required outcome |
|---|---|
| Queued | A useful outcome, scope and observable acceptance criteria. |
| Active | One holder (a named session or agent, the task's assignee) works in small, coherent changes. |
| Review | Author checks are done; a fresh Reviewer examines the exact change ([review.md](review.md)). |
| Ready | Acceptance, required checks and review all pass. |
| Done | The change reached its integration branch, the push and CI result are confirmed, evidence is recorded. |

**Ready is not Done.** Ready means built, verified and reviewed. Done means
integrated and confirmed. A child task reaching a feature branch is not the
feature reaching `main`. A task moving to Done proves nothing by itself.

## Side states

- **Blocked.** The task keeps its stage and gains the `blocked` label; its
  notes say the reason, what it waits on, and the condition that unblocks
  it. The label comes off only when that condition is met. In a night, a
  blocked task also ends with the outcome `blocked` in the night file.
- **Cancelled.** The task moves to Done with a final summary that starts
  `Cancelled`: the date, the reason, who decided, and what (if anything)
  was kept. Cancelled work never counts as delivered.

```text
Cancelled 2026-10-02. Payments provider dropped the refund API; owner
decided in chat. Kept: the refund button component (unused, on `main`).
```

## GitHub issues

Issues on this repository (`Feedback` an `Adopter`'s `Owner` sends from
the `Viewer`, labelled `proposal`, or filed by hand) are an inbox, not a
second tracker: each one becomes a task, and the task carries the work.

- **Intake, every day session, before new work** (after the read-only
  orientation, [orientation-and-handoff.md](orientation-and-handoff.md);
  with parallel agents, the Lead does it). For each open issue without the
  `tracked` label, search the board for `GitHub #<n>`; if no task has it,
  create one that says `GitHub #<n>` in its title or description and
  carries the issue's URL (`--ref`). Then mark the issue:

```sh
gh issue list --state open
gh issue comment 12 --body "Tracked as TASK-50"
gh issue edit 12 --add-label tracked
```

- A `Night` works only its `Plan`; the next day session does the intake
  (D28).
- Intake is routine: no go needed. The task is shaped like any other
  (`backlog/README.md`); the owner still decides its priority and whether
  it is built.
- **The issue never tracks progress.** No GitHub status or label beyond
  `tracked`; plans, notes and outcomes live on the task.
- **Closing.** A commit that brings the task's work to `main` says
  `Closes #<n>` ([git.md](git.md#commits)), so GitHub closes the issue and
  links the commit. A task the owner cancelled, or an issue answered
  without code, closes its issue by hand with one line saying why
  (`gh issue close 12 --comment "…"`).
- **The repository is public.** When an issue names a real project, the
  task says "an `Adopter`" instead.

## Acceptance

- Acceptance describes product behaviour, not functions to write: "a
  shopper filtering by size M sees only items in stock in M", not "add
  `filterBySize()`".
- Each item names the evidence that will prove it (a test, a screenshot,
  a command's output).
- A material scope change records its decision and reason on the task, so
  acceptance cannot quietly shrink around unfinished work.
- An out-of-scope discovery gets one line on the task and, if it matters,
  its own task (`backlog/README.md`, "Found something on the way?").

## One writer per checkout

- One agent writes in a checkout at a time.
- Parallel work runs in separate worktrees, each held by a named session
  or agent (the task's assignee) and with a reason. Only tasks whose files
  do not overlap run in parallel.

## In a night

The `start-night-shift` skill sits on top of this flow: each task in the
night's plan is recorded with its outcome and evidence in the night file as
soon as it ends. A choice the task leaves to the owner is never taken
silently: the task is `blocked` on a question when it cannot go on without
it or a wrong choice would be costly to undo; otherwise the agent decides
and records it (`night-shift decide`, D31).
