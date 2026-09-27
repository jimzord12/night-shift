---
name: start-night-shift
description: Run an unattended Night Shift in this repository - plan the tasks, work them one by one, record each outcome with evidence, ask the developer instead of guessing, and close the night so the developer can read it in the Night Shift Viewer. Use when the user says "start night shift", "start a night shift", "night shift", "run the night shift", or asks you to work unattended through a list of tasks and report in the morning.
---

# Start a Night Shift

A night is one unattended session. You work the way this repository already
works (its own rules, tracker, tests and review). Night Shift adds only a
record of the night that the developer reads in 5-10 minutes the next
morning: what you promised, what happened to each task, the proof, and what
you need from them. The `night-shift` tool checks everything you write;
when it refuses something, its message says how to fix it. Every reply from
the tool ends with the next step.

Run the tool as: `night-shift`

**How to hand it JSON.** Write the JSON with your file-writing tool to
`.night-shift/input.json` in this repository (git ignores that folder), then
pass it with `--file .night-shift/input.json`. Overwrite the same file for
each command. Do not put JSON inline in a shell command or in a file outside
the repository: Claude Code blocks both.

## 1. Where things stand

```bash
night-shift status
```

If a night is already open in this session, continue it; do not start
another. The status also lists open follow-up items: decisions and
unfinished work the developer handed back after an earlier night.

## 2. Follow-ups first

For each open follow-up item (`night-shift follow-up list`), check the real
code: the developer may have fixed it by other means since. Then either
plan it as a task (with `"follow_up": "<ref>"`) or list it under
`skipped_follow_ups` with a one-line reason. The tool refuses a plan that
leaves an open item out. A `decision` item carries the developer's answer:
follow it. A `waiting` item has no answer yet: plan it, and if it still
needs the answer, ask again (step 4) and record the task `blocked`.

## 3. The plan: your promise

List the tasks you will attempt tonight, from the developer's instructions,
their tracker, or the follow-ups. Each has a `done_when` list: the checks
that make it done. Write them so a person can verify them.

Write to `.night-shift/input.json`:

```json
{
  "schema": "night-shift/plan@1",
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
night-shift start --file .night-shift/input.json
```

`source` is free text: a ticket, "developer prompt", a follow-up item. The
tool prints the night's evidence folder: save screenshots, PDFs and
recordings there.

## 4. Work, and record each task as soon as it ends

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
night-shift record --file .night-shift/input.json
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

**Never guess a decision that belongs to the developer.** Ask, then move on
to the next task:

Write to `.night-shift/input.json`:

```json
{
  "task": "T2",
  "ask": "Which fix for the Safari login loop?",
  "why": "Both work; they differ in effort and risk.",
  "options": [
    { "label": "Relax the cookie setting", "detail": "Quick; needs HTTPS everywhere" },
    { "label": "Route login through our own domain", "detail": "Safer; about half a day" }
  ],
  "recommended": "a"
}
```

then run:

```bash
night-shift ask --file .night-shift/input.json
```

A question has two to six options; they get ids `a`, `b`, `c`… in order.
Every question has a recommendation.

## 5. Friction with Night Shift itself

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
night-shift feedback --file .night-shift/input.json
```

Kinds: `missing-block`, `confusing-rule`, `bad-fit`, `tool-bug`, `other`.
Keep private details of this repository out of feedback; it may become a
public issue.

## 6. Close

When every task has an outcome (or time runs out), close with one or two
sentences the developer reads first:

```bash
night-shift close --summary "PDF invoices shipped. Safari login blocked on your decision."
```

Then commit your own work as you normally would. The tool commits only the
night's history copy. The session's cost and duration are added
automatically when the session ends.

If a command is refused, read its message, fix the input, and run it
again. `night-shift status` always tells you where the night stands.
