---
name: start-night-shift
description: Run an unattended Night Shift in this repository - plan the tasks, work them one by one, record each outcome with evidence, ask or record each decision taken for the developer instead of guessing, and close the night so the developer can read it in the Night Shift Viewer. Use when the user says "start night shift", "start a night shift", "night shift", "run the night shift", or asks you to work unattended through a list of tasks and report in the morning.
---

# Start a Night Shift

A night is one unattended session. You work the way this repository already
works (its own rules, tracker, tests and review). Night Shift adds only a
record of the night that the developer reads in 5-10 minutes the next
morning: what you promised, what happened to each task, the proof, and what
you need from them. The `night-shift` tool checks everything you write;
when it refuses something, its message says how to fix it. Every reply from
the tool ends with the next step.

Run the tool as: `{{cli}}`

**How to hand it JSON.** Write the JSON with your file-writing tool to
`.night-shift/input.json` in this repository (git ignores that folder), then
pass it with `--file .night-shift/input.json`. Overwrite the same file for
each command. Do not put JSON inline in a shell command or in a file outside
the repository: Claude Code blocks both.

## 1. Where things stand

```bash
{{cli}} status
```

If a night is already open in this session, continue it; do not start
another. The status also lists open follow-up items: decisions,
disagreements and unfinished work the developer handed back after an
earlier night, and which feedback of earlier nights was sent to GitHub
(with the issue) and which still awaits the developer.

## 2. Check that you can work tonight

Skip this step when you continue a night already open.

Before the follow-ups and the plan, prove the night can do its work, while
the developer may still be there: run once, with your normal tools, each
kind of command the tasks will need. A command that stops for a permission
prompt, or fails, would stop the night hours later with nobody there to
help. First tell the developer, in one line, to answer any permission
prompt now with "don't ask again" (or an allow rule in their settings): a
one-time yes lets the check pass and leaves the same command waiting at
night. Then check at least:

- **The tests run.** The test command the tasks will use. When the suite
  is already failing (tonight's work is to fix it), run one test file that
  passes: the check proves the runner works, not that everything is green.
- **Commits work.** Create or switch to tonight's branch first, then make a
  real empty commit that leaves anything staged alone, with a message in
  this repository's convention, for example
  `git commit --allow-empty --only -m "chore: night-shift start check"`. It
  runs the repository's hooks, as every commit tonight will. The commit
  stays; do not undo it.
- **Every service the work uses runs.** The database, a dev server, a
  container: one command each that talks to the service itself (a
  database ping, a request to the dev server), not one that only lists
  containers: a stopped database still lists.

A check that stopped for a permission the developer then allowed for good
is simply run again with the others. **When a check fails, or still stops
for a permission, do not start the night.** Hand the failed checks to the
tool so a developer who has left hears of it: write a plan with
`"tasks": []` and the `start_checks` as they ran (real exit codes; a
command that never ran, because the permission was refused, is recorded
with exit code 1 and the prompt as its excerpt) and run `{{cli}} start`
(step 4); it refuses the plan and raises the developer's desktop
notification when they turned notifications on. Then tell the developer
what failed and what they need to do (start Docker, allow a command for
good, fix the test setup), and stop. Start once every check passes on a
new run.

## 3. Follow-ups

For each open follow-up item (`{{cli}} follow-up list`), check the real
code: the developer may have fixed it by other means since. Then either
plan it as a task (with `"follow_up": "<ref>"`, or a list of refs when
several items belong to one piece of work) or list it under
`skipped_follow_ups` with a one-line reason. The tool refuses a plan that
leaves an open item out. A `decision` item carries the developer's answer:
follow it. A `waiting` item has no answer yet: plan it, and if it still
needs the answer, ask it again word for word (step 5; the tool matches the
wording) and record the task `blocked`; not asked again, it stays open
where it was asked. Skip a `waiting` item only when the question no
longer matters: a skipped question is closed. A `disagreed` item is a
decision an earlier agent took that the developer disagrees with;
`owner_note` says what they want instead: plan it and redo that part
their way. A `discuss` item is one the developer wants to talk through:
leave it out of the plan entirely, together with the other open items of
the same task (the tool refuses planning or skipping them); a day session
raises them with the developer.

## 4. The plan: your promise

List the tasks you will attempt tonight, from the developer's instructions,
their tracker, or the follow-ups. Each has a `done_when` list: the checks
that make it done. Write them so a person can verify them.

Write to `.night-shift/input.json`:

```json
{
  "schema": "night-shift/plan@3",
  "start_checks": [
    { "command": "npm test", "exit_code": 0, "excerpt": "148 tests, 148 passed", "proves": "the tests run" },
    { "command": "git commit --allow-empty --only -m \"chore: night-shift start check\"", "exit_code": 0, "excerpt": "[night/2026-09-26 3f2c1ab] chore: night-shift start check", "proves": "commits run, hooks included" },
    { "command": "docker compose exec db pg_isready", "exit_code": 0, "excerpt": "/var/run/postgresql:5432 - accepting connections", "proves": "the database answers" }
  ],
  "tasks": [
    { "id": "T1", "title": "Add PDF invoices to the checkout", "source": "backlog TASK-42",
      "done_when": ["Checkout offers an invoice download", "Invoice matches the order", "Screenshot attached"] },
    { "id": "T2", "title": "Fix the login redirect loop on Safari", "source": "follow-up 2026-09-25-a, item A3",
      "follow_up": "2026-09-25-a/A3", "done_when": ["Safari login lands on the account page"] }
  ],
  "skipped_follow_ups": [ { "follow_up": "2026-09-25-a/A1", "reason": "Already fixed in commit 4e1a9c2" } ]
}
```

then run:

```bash
{{cli}} start --file .night-shift/input.json
```

`start_checks` lists what step 2 ran, one entry each, with the real exit
code and a short excerpt of the output; `proves` says what it shows.
`source` is free text: a ticket, "developer prompt", a follow-up item. The
tool prints the night's evidence folder: save screenshots, PDFs and
recordings there.

## 5. Work, and record each task as soon as it ends

Work each task the repository's normal way (branch, tests, review, commit).
Right after a task ends, record it, before you start the next one, so a
crash loses at most the task in progress:

Write to `.night-shift/input.json`:

```json
{
  "task": "T1",
  "outcome": "done",
  "checks": [true, true, true],
  "evidence": [
    { "type": "image", "path": "evidence/invoice.png", "caption": "Invoice next to the order page" },
    { "type": "command", "command": "npm test", "exit_code": 0, "excerpt": "148 tests, 148 passed" }
  ]
}
```

then run:

```bash
{{cli}} record --file .night-shift/input.json
```

Every record of a planned task, except `not_started`, sends `checks`: one
per `done_when` line, in order, each `true`, `false`, or
`{ "met": false, "note": "what is left" }`.
Outcomes, and what each needs on top of that:

| Outcome | When | Needs |
|---|---|---|
| `done` | Finished as promised | every check `true`; at least one evidence block that is not a `note` |
| `partial` | Progress saved, can continue | at least one check met; each unmet check as `{ "met": false, "note": "what is left" }` |
| `blocked` | Cannot go on without the developer | `"blocked_by": "Q1"` (ask first) |
| `failed` | Tried; no decision would fix it | `"why"` |
| `not_started` | Never reached | no checks needed; usually leave it to close, which sets it |
| `skipped` | Not needed: already done, or no longer wanted | `"reason"` |

Evidence comes only from these blocks: `image` (path, caption), `compare`
(before, after, caption), `video` (path, caption), `pdf` (path, caption),
`link` (url, label), `command` (command, exit_code, excerpt of 25 lines at
most), `note` (text: plain text, no Markdown). Paths are relative to the
night's folder and must be inside its `evidence/` folder.

Work you did but did not plan: record it with `"unplanned": true`, a
`title` and a `why`.

**A choice that belongs to the developer is never taken silently.** When
the task cannot go on without it, or a wrong choice would be costly to
undo, ask, then move on to the next task; otherwise take it, record it
with `decide` (below) and carry on. To ask, write to `.night-shift/input.json`:

```json
{
  "task": "T2",
  "ask": "Which fix for the Safari login loop?",
  "why": "Both work; the quick fix loosens a cookie setting on every page, which is costly to get wrong.",
  "options": [
    { "label": "Relax the cookie setting", "detail": "Quick; needs HTTPS everywhere" },
    { "label": "Route login through our own domain", "detail": "Safer; about half a day" }
  ],
  "recommended": "a",
  "files": [{ "path": "docs/login-flow.png", "caption": "Where the loop starts" }]
}
```

then run:

```bash
{{cli}} ask --file .night-shift/input.json
```

A question has two to six options; they get ids `a`, `b`, `c`… in order.
Every question has a recommendation. **A question about files carries
them** in `files` (paths inside the repository), so the developer sees
them instead of hunting for them; the Viewer offers Show in folder. The
developer may also answer "let's discuss" with a note: that becomes a
`discuss` item for a day session, never for a night.

**Record every decision you take on the developer's behalf**, when you
take it: a choice between options, a default you filled in where the task
left it open, a step you would have asked about if the developer were
here. Not routine technical choices the developer would never think
about. Write to `.night-shift/input.json` (`task` may be `null` for a
decision about no particular task):

```json
{
  "task": "T1",
  "decision": "Generate invoices with pdfkit",
  "why": "It streams large invoices; jsPDF holds them in memory. Both have the same licence."
}
```

then run:

```bash
{{cli}} decide --file .night-shift/input.json
```

`decision` is one sentence on what you chose; `why` says what the
developer needs to judge it. The developer reviews each in the Viewer:
fine, or "I disagree" with a note that reaches the next agent.

## 6. Friction with Night Shift itself

When the vocabulary, a rule or the tool gets in your way (a block you
needed, a confusing message), log it and carry on. The developer decides
whether it goes to the Night Shift maintainers:

Write to `.night-shift/input.json`:

```json
{ "kind": "missing-block", "title": "Side-by-side comparison of two PDFs", "tags": ["blocks"],
  "body": "T1's proof needed the invoice next to the expected layout; an image pair lost the text." }
```

then run:

```bash
{{cli}} feedback --file .night-shift/input.json
```

Kinds: `missing-block`, `confusing-rule`, `bad-fit`, `tool-bug`, `other`.
Keep private details of this repository out of feedback; it may become a
public issue.

## 7. Close

When every task has an outcome (or time runs out), close with **one
sentence** the developer reads first, on one line, at most 200 characters
(the tool refuses a longer one). The detail belongs in the tasks:

```bash
{{cli}} close --summary "PDF invoices shipped; Safari login waits for your decision."
```

Then commit your own work as you normally would. The tool commits only the
night's history copy. The session's cost and duration are added
automatically when the session ends.

If a command is refused, read its message, fix the input, and run it
again. `{{cli}} status` always tells you where the night stands.
