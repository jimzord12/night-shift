# Night Shift design (agreed, not built)

Status: agreed with the owner on 2026-09-26 (decision D20). Nothing here is
built yet. Where this file and the older docs (`protocol.md`, `contract.md`,
`binding.md`, `practices/`, `templates/`) disagree, this file describes the
direction; the older docs describe what v6 ships. The file shapes below are
first drafts: expect field testing to change them.

## The problem

A developer already works with AI agents in their own way: their own
workflow, conventions and tracker (or none), and agents that can already run
unattended. What they lack:

1. After an unattended session, a way to understand what happened in 5 to 10
   minutes.
2. A comfortable way to answer the agents' questions, instead of reading the
   terminal and typing long replies.
3. A history of what the unattended sessions did.
4. A way to measure how well their agents perform fully unattended.

Night Shift solves those four and changes nothing else about how the
developer works. It adds files of a fixed shape, a tool that checks them, two
skills and a local app.

## Principles

- **No process imposed.** Nothing beyond the file shapes and the tool is
  required of an `Adopter`; everything else is optional advice.
- **Fixed frame, small vocabulary.** A night file always has the same frame;
  proof and notes inside it come from a small set of blocks. The constraint
  keeps output predictable, cheap to write and quick to read.
- **Claims and measurements stay apart.** Task outcomes are the agent's
  claim (except `not_started`, set by Close); metrics are measured by the
  tool from the harness.
- **Grows on request.** Agents and developers report what they missed; the
  vocabulary grows release by release, versioned like a library's API.
- **Claude Code first.** Other harnesses later.

## Terms (proposed; enter the glossary when built)

| Term | Meaning |
|---|---|
| Night | One unattended agent session, whenever it runs |
| Plan | The agent's promise at the start of a night: the tasks and what "done" means for each |
| Night file | The single record of one night: the plan's tasks with outcomes, questions, feedback, metrics |
| Follow-up file | What the developer hands to the next agent: unfinished tasks plus the decisions they made |
| Viewer | The local app that shows every night of every registered repository |
| Meter | The part of the tool that reads the harness's logs and writes the metrics |

Existing glossary terms change meaning too: `Outcome` gets six values
instead of four, a `Question` becomes an entry in the night file instead of
its own file, `Night Shift` means one unattended session at any hour, and
the `Owner` is any developer using Night Shift. The glossary is rewritten
when the design is built.

## The parts

```
 Developer's own workflow (tracker, prompts, notes: untouched)
        |
        v
 [1 Plan] --plan.json-->  [2 Work]  (agent works the developer's way)
    ^                        |                  | Claude Code session logs
    |                        v                  v
    |                   [3 Record]         [4 Meter]
    |                        | outcomes,        | duration, tokens,
    |                        | evidence,        | sub-agents, cost
    |                        | questions        |
    |                        +---> [5 Close] <--+
    |                                  | night.json (one per night)
    |                                  v
    +---- follow-up file <------- [6 Viewer] --> morning page, history
                                       |
                                       +--> feedback as GitHub issues
```

| Part | Run by | Takes in | Gives out |
|---|---|---|---|
| 1 Plan | Agent, skill `start-night-shift` | The developer's instructions; open follow-up files | `plan.json`, checked by the tool; the night is marked open |
| 2 Work | Agent, the developer's way | The plan | Code, commits, evidence files |
| 3 Record | Agent, one tool call per task | What it did | Each task's outcome, checks and evidence, right after the task; questions and feedback as they arise |
| 4 Meter | Tool, a Claude Code session-end hook, or crash recovery | Claude Code's session logs; the night file | The metrics, added to the night file (closing it first if it is still open) |
| 5 Close | Tool | Plan, records | `night.json`, validated, marked `complete` or `interrupted` |
| 6 Viewer | Local app | Every night file of every registered repository; the developer's clicks | Morning page, history; answers written into the night file; follow-up files; GitHub issues |

## Lifecycle of a night

- **Start.** The developer says "start night shift" (or runs
  `/start-night-shift`). The agent reads any open follow-up file, checks each
  open item against the real code (an item already fixed by other means is
  `skipped` with a one-line reason), writes the plan, and the tool opens the
  night, recording the harness session it runs in. The same start refreshes
  the history copies of earlier nights (see The files). The first night in
  a repository registers it with the local Night Shift install and adds
  `.night-shift/*` and `!.night-shift/history/` to `.gitignore` (git cannot
  re-include a folder inside an ignored one).
- **During.** After each task the agent records its outcome and evidence at
  once, so a crash loses at most the task in progress. Every tool reply ends
  with the next step, so the agent stays on track even after the harness has
  compressed older context.
- **Normal end.** The agent adds the summary (questions and feedback were
  recorded as they arose); the tool closes the night as `complete`. When the
  session then ends, the Meter adds the metrics. They cover the whole
  session, including anything done in it after the close.
- **The session ends early** (context exhausted, the developer exits, the
  process is killed). The session-end hook closes the night as
  `interrupted`, with every outcome recorded so far, and adds the metrics.
- **Only the night's own session counts.** The session-end hook acts only
  when the ending session is the one the night recorded; any other session
  in the same repository leaves the night alone.
- **Hard crash** (no hook ran). The next night start or Viewer load finds a
  night that is still open, or closed without metrics, and checks whether
  its session is still running. If it is, the night is left alone; an open
  one shows as running and a second start in that repository is refused.
  If not, it runs
  the tool's close (for an open night) and the Meter, marking an open night
  `interrupted`. A session paused at a usage limit is still running: its
  night stays open until the session ends. A close run by the Viewer does
  not commit; the next start's history refresh does. The tool stays the
  only writer of `status` and `metrics`.
- **Interrupted nights** may have no `summary`; Close accepts that for
  `interrupted` and requires it for `complete`.
- **Unrecorded tasks.** Close marks every planned task without a record
  `not_started`. On an interrupted night the header says so, and the task
  in progress may hold unrecorded work.
- **No open night.** Recording without an open night is refused with "no
  open night; start one first", so a missed skill trigger fails loudly.

## Task outcomes

Six values, each with a rule the tool enforces.

| Outcome | Means | Rule |
|---|---|---|
| `done` | Finished as promised | Every `done_when` check met; at least one `evidence` block that is not a `note` |
| `partial` | Progress saved, can continue | At least one check met; each unmet check carries a `note` saying what is left |
| `blocked` | Cannot continue without the developer | `blocked_by` names a question |
| `failed` | Tried; no decision from the developer would fix it | `why` |
| `not_started` | Planned, never reached | None |
| `skipped` | Deliberately not done: already done elsewhere, or no longer needed | `reason` |

A task the agent did but did not plan is recorded with `"unplanned": true`
and a `why`.

## Blocks (version 1)

Proof and notes inside a task come only from these.

| Block | Shows | Fields |
|---|---|---|
| `image` | A screenshot | `path`, `caption` |
| `compare` | Before and after, side by side | `before`, `after`, `caption` |
| `video` | A short recording of a flow | `path`, `caption` |
| `pdf` | A generated document | `path`, `caption` |
| `link` | A pull request, preview deployment, ticket | `url`, `label` |
| `command` | Proof for work that cannot be seen: tests, builds | `command`, `exit_code`, `excerpt` (about 20 lines at most) |
| `note` | A short explanation | `text`, plain text with line breaks, no Markdown |

File paths must point to files that exist in the night's evidence folder.
Left out on purpose: diffs (link the commit), tables, charts, headings.

## The files

Everything lives in the `Adopter`'s `.night-shift/` folder, which git
ignores except `.night-shift/history/`. At close, the night file is copied
into `history/` and committed on the agent's branch, which reaches `main`
when the branch is merged. Metrics, answers and follow-up files arrive after
that commit, so every night start refreshes the history copies of earlier
nights and their follow-ups and commits them on its own branch. Evidence is
never committed: evidence paths in committed history resolve only on the
machine that ran the night. A merge conflict inside `history/` is resolved
by taking either side; the next start rewrites the file from local state.

### plan.json

The agent's promise. `source` is free text so it fits any workflow.

```json
{
  "schema": "night-shift/plan@1",
  "night": "2026-09-26-a",
  "started_at": "2026-09-26T23:10:00+03:00",
  "tasks": [
    {
      "id": "T1",
      "title": "Add PDF invoices to the checkout",
      "source": "backlog TASK-42",
      "done_when": ["Checkout offers an invoice download", "Invoice matches the order", "Screenshot attached"]
    },
    {
      "id": "T2",
      "title": "Fix the login redirect loop on Safari",
      "source": "follow-up 2026-09-25-a, item A3",
      "done_when": ["Safari login lands on the account page"]
    },
    {
      "id": "T3",
      "title": "Upgrade the framework to the next major version",
      "source": "developer prompt",
      "done_when": ["Build passes", "All tests pass"]
    }
  ]
}
```

### night.json

The single record of the night. Close copies the plan's tasks in, so the file
stands on its own in history. The agent writes `summary`, `tasks`,
`questions` and `feedback`; the tool writes `status` and `metrics`; the
Viewer writes only `questions[].answer`, `questions[].note` and
`feedback[].sent`. A metric Claude Code did not provide is `null` and shows
as "unknown".

```json
{
  "schema": "night-shift/night@1",
  "night": "2026-09-26-a",
  "status": "complete",
  "started_at": "2026-09-26T23:10:00+03:00",
  "ended_at": "2026-09-27T04:22:00+03:00",
  "summary": "PDF invoices shipped. Safari login blocked on your decision. Framework upgrade half done.",
  "tasks": [
    {
      "id": "T1", "title": "Add PDF invoices to the checkout", "source": "backlog TASK-42",
      "outcome": "done",
      "checks": [
        { "done_when": "Checkout offers an invoice download", "met": true },
        { "done_when": "Invoice matches the order", "met": true },
        { "done_when": "Screenshot attached", "met": true }
      ],
      "evidence": [
        { "type": "image", "path": "evidence/2026-09-26-a/invoice.png", "caption": "Invoice next to the order page" }
      ]
    },
    {
      "id": "T2", "title": "Fix the login redirect loop on Safari", "source": "follow-up 2026-09-25-a, item A3",
      "outcome": "blocked", "blocked_by": "Q1",
      "checks": [ { "done_when": "Safari login lands on the account page", "met": false } ]
    },
    {
      "id": "T3", "title": "Upgrade the framework to the next major version", "source": "developer prompt",
      "outcome": "partial",
      "checks": [
        { "done_when": "Build passes", "met": true },
        { "done_when": "All tests pass", "met": false, "note": "2 of 148 fail, both date formatting" }
      ]
    },
    {
      "id": "U1", "unplanned": true, "title": "Fix crash on an empty cart name",
      "outcome": "done", "why": "Found while testing T1; one-line fix",
      "evidence": [ { "type": "command", "command": "npm test", "exit_code": 0, "excerpt": "148 tests, 148 passed" } ]
    }
  ],
  "questions": [
    {
      "id": "Q1", "task": "T2",
      "ask": "Which fix for the Safari login loop?",
      "options": [
        { "id": "a", "label": "Relax the cookie setting (quick; needs HTTPS everywhere)" },
        { "id": "b", "label": "Route login through our own domain (safer; about half a day)" }
      ],
      "recommended": "a",
      "answer": null,
      "note": null
    }
  ],
  "feedback": [
    { "id": "F1", "kind": "missing-block", "title": "Side-by-side comparison of two PDFs", "tags": ["blocks"], "body": "T1's proof needed the invoice next to the expected layout; an image pair lost the text.", "sent": null }
  ],
  "metrics": {
    "source": "claude-code",
    "harness_version": "2.x",
    "duration_min": { "total": 312, "model": 176, "tools": 10 },
    "models": {
      "claude-opus": {
        "tokens": { "input": 4200000, "output": 380000, "reasoning": 96000, "cache_read": 51000000, "cache_write": 1900000 },
        "cost_usd": 18.40
      }
    },
    "sub_agents": [
      { "type": "general-purpose", "model": "claude-opus", "purpose": "Review round 1" }
    ],
    "lines": { "added": 1177, "removed": 118 }
  }
}
```

### Follow-up file

Made by the Viewer's "Create follow-up" button after the developer has
answered. It holds every task that was not `done` or `skipped`, plus the
developer's decisions and notes. The agent that picks it up, in a night
or by day, does the digging for context.

```json
{
  "schema": "night-shift/follow-up@1",
  "id": "2026-09-26-a",
  "from_night": "2026-09-26-a",
  "created_at": "2026-09-27T08:40:00+03:00",
  "items": [
    {
      "id": "A1", "status": "open", "kind": "decision", "task": "T2",
      "title": "Fix the login redirect loop on Safari",
      "question": "Which fix for the Safari login loop?",
      "decision": "a", "decision_label": "Relax the cookie setting",
      "owner_note": "Fine, we already force HTTPS in production.",
      "done_when": ["Safari login lands on the account page"]
    },
    {
      "id": "A2", "status": "open", "kind": "unfinished", "task": "T3",
      "title": "Finish the framework upgrade",
      "left": ["All tests pass: 2 of 148 fail, both date formatting"],
      "done_when": ["All tests pass"]
    }
  ]
}
```

- Item kinds: `decision`, `unfinished`, and `waiting` (a question the
  developer did not answer; the next agent leaves that task alone and asks
  again instead of guessing).
- Item status: `open`, `done`, `skipped` (with a reason).
- The developer may fix things outside Night Shift, so statuses can go
  stale. The next plan therefore checks every open item against the code
  before turning it into a task, and cites it as the task's `source`.

## Skills

Action names, no ambiguity. Both trigger on plain words as well as the
slash command.

| Skill | Triggered by | Teaches |
|---|---|---|
| `start-night-shift` | "start night shift" | The whole night: follow-ups, plan, record per task, questions, feedback, close |
| `do-night-shift-follow-up` | "work on the follow-up" | Pick up a follow-up file by day, check items against the code, fix them, update their status |

No `/ns:ask` in version 1: outside a night the developer is at the terminal.

## Viewer

One local web app for every registered repository, opened with one command
from any folder. Screens:

1. **Morning:** every unread night, newest first. Header (complete or
   interrupted, duration, cost), summary, tasks with outcome (open one for
   its checks and proof), questions as cards (options, recommendation, a
   free note, the pick) with **Create follow-up**, and feedback with tick
   boxes and **Send to GitHub**.
2. **History:** one row per night: date, repository, outcome counts,
   duration, cost, status; a row opens that night.
3. **Trends:** empty until measurement is designed.

## Feedback to the Night Shift Repo

Agents log friction with Night Shift (a missing block, a confusing rule, a
field that did not fit) in the night file's `feedback` list and carry on.
In the morning the developer ticks the entries worth sending; the Viewer
files them as GitHub issues labelled `proposal` on the `Night Shift Repo`.
A person reads each entry first, because an agent inside private code must
not post to a public tracker unattended.

- `gh` installed and logged in: one click sends every ticked entry.
- Otherwise: an "Open on GitHub" button per entry with a pre-filled issue
  link, submitted from the browser. Labels stick only for people with rights
  on the repository.

Unsent entries stay in the night file as history.

## Meter

Read from Claude Code's own files when the session ends, verified against
real session logs on 2026-09-26:

- duration (total, model time, tool time);
- tokens per model: input, output, reasoning, cache read, cache write;
- cost in dollars per model, from Claude Code's cost record when present,
  otherwise calculated from tokens and a price table;
- sub-agents: one log and one description file each (type, model, purpose);
- lines added and removed; the Claude Code version.

Claude Code documents its log format as internal and subject to change.
Accepted risk: every metric is optional, a missing field shows as "unknown"
and never fails a night, and the recorded harness version ties a break to an
update. Rejected: headless mode (imposes how nights run) and OpenTelemetry
(needs an external collector).

## Still open

- **Measurement:** which trends matter (promised versus delivered, cost per
  finished task, …); needs weeks of real nights first.
- **Distribution:** a Claude Code plugin or files copied into each
  repository; how updates reach `Adopter`s.
- **Growing the shapes:** versioning, adding and retiring blocks.
- **The v6 model:** what happens to the protocol text, practices, templates,
  bindings, board adapters and existing `Adopter` set-ups.
- **Details for the build:** how a night's session is detected as still
  running, where the Viewer keeps its unread state, where the open-night
  marker and per-task records live before close, how follow-up files are
  named when one night gets more than one, and that a history commit takes
  only the history path, never the developer's staged work.
