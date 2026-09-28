# Decisions

Why this repository is the way it is. One entry per decision, newest last,
append-only: a changed mind is a new entry that names the one it replaces.
Each says what was decided, why, and what was rejected.

## D1  A protocol first, an app second (2026-09-25)

The Night Shift is a way of working (docs/protocol.md) that must work without
the app; the app only makes the Morning Review cheap. **Why:** the owner's
attention is the scarce resource, agent hours at night are plentiful; the
protocol is what makes unattended work safe (Night-ready contract, never guess
a decision). **Rejected:** a tool-first design where the rules live in code.

## D2  Project-neutral, public, its own repository (2026-09-25)

Everything project-specific lives in the adopting project's binding; this
repo names no real project, board or person, and examples use the fictional
Lighthouse shop. **Why:** the protocol is meant to be adopted across many
projects; coupling to the first adopter would make that impossible.

## D3  Local app, not hosted (2026-09-25)

`night-shift serve` runs on 127.0.0.1. **Why:** no hosting, login, deploys or
upkeep; a trial tool, not a product. **Rejected:** a hosted web app (days of
work plus maintenance) and throwaway HTML reports per night (no history, no
reusable widgets, no way to answer).

## D4  JSON files, not a database (2026-09-25)

The project's `.night-shift/` folder holds `project.json` and
`questions/<id>.json`. **Why:** agents write files natively (no database tool,
no permission prompt at 3 a.m.), files diff and validate against JSON Schema,
and a few hundred files load instantly. **Rejected:** SQLite now; it can come
later as an index while the files stay the source of truth.

## D5  One writer per field (2026-09-25)

In a question file the asker writes every field except `answer`; the app
writes only `answer`, and only over the exact version the owner saw (content
hash; 409 otherwise). **Why:** two writers on one file lose data silently.
Questions and answers share one file because they are one thing; the hash
guard covers the one realistic clash (an agent editing a question while the
owner answers it).

## D6  The board is the source of truth; files only for what nothing else holds (2026-09-25)

The queue (cards with the Night-ready label) and the Outcomes (structured
comments on cards) are read live from the board. **Why:** every file that
copies board state is a staleness risk. Questions stay files because no board
holds them. **Rejected:** `queue.json` and per-shift `shift.json` files; the
shift's headline and counts are computed.

## D7  Board adapters (2026-09-25)

`src/board/` hides each board behind four reads (cards, comments, attachments,
attachment). Trello is the first, a JSON `file` board serves demos and tests.
**Why:** the protocol must not depend on Trello.

## D8  "Question", not "decision" (2026-09-25)

**Why:** "decision" reads as settled and permanent; a question is open until
the owner answers it and the asker resolves it.

## D9  Five question kinds, images as a property (2026-09-25)

`confirm`, `one`, `many`, `rank`, `text`; any option may carry an `image` and
a `preview`; every question has a recommendation (preselected), "not now"
and an optional note. **Why:** covers every morning choice seen so far with
the fewest widgets; a picture choice is just options with images.

## D10  Releases are tags; a launcher runs the current one (2026-09-25)

`npm run release vN` checks, exports the tagged commit to
`~/.night-shift/releases/vN/`, builds it, tags and pushes; `night-shift` on
PATH runs `releases/current`. Tags `v1, v2, …` are never moved. **Why:** the
checkout can change while the owner runs a stable version; modelled on a
proven toolkit repo of the same owner.

## D11  Security for a public local app (2026-09-25, after the first review)

Requests whose Host is not 127.0.0.1/localhost at the served port get 403
(DNS rebinding); Trello ids from URLs must be 24 hex characters before any
signed request (credential misuse); credentials never reach the browser;
media is served inline only for images, video and PDF, HTML only with
`Content-Security-Policy: sandbox allow-scripts` (opaque origin), anything
else downloads. **Why:** the first independent review found these holes.

## D12  Visual first, game-like UI (2026-09-25)

Night sky with twinkling stars, shooting stars and meteors; one question per
screen with the recommendation preselected; moon-like secondary buttons.
**Why:** the review must cost the owner little attention and can be fun;
walls of text were the failure this replaces.

## D13  Practices are defaults a binding may override (2026-09-25)

docs/practices/ carries generic working practices (task flow, handoff, review
gate, evidence, Git, glossary, proposals, bypass log, owner authority, idea
loop, board discipline) plus templates. **Why:** a project adopting the
protocol should get the day's quality bar for the night without writing it
from scratch; each project may still replace any of them.

## D14  The buffer is a rev counter, not a fuel gauge (2026-09-25)

Zones: idle below `buffer.low`, warming up, sweet spot at 70-80% of
`buffer.max` (default 20, so 14-16 cards), running hot, redline from 90%.
Replaces "aim for 10 to 15" and `buffer.target`. **Why:** the owner's
analogy: more cards is better only up to a point; an overloaded queue goes
stale before the nights clear it. The default max of 20 was the agent's
choice; projects tune it in `project.json`.

## D15  Media viewer for any asset (2026-09-25)

Options may carry `preview` (image, video, PDF, HTML page or URL), opened
full-screen from a round view button. **Why:** the owner needs to see a
design option in full, whatever its format, before choosing.

## D16  Backlog.md tracks this repository's work (2026-09-25)

`backlog/` replaces the hand-kept `docs/backlog.md`. Its statuses mirror the
task-flow practice (Queued, Active, Review, Ready, Done), so this repository
runs on its own protocol. **Why:** the owner uses Backlog.md elsewhere and
wanted one tracker with ids, acceptance criteria and history instead of a
list whose lines are deleted when done. **Rejected:** a Trello board (a
second place to look, and credentials for a public repository's own work).

## D17  A Backlog.md board adapter (2026-09-25)

`board.type: "backlog"` reads a project's `backlog/` folder from disk. A
task is a card, the status is the list, a task comment is where an Outcome
goes, and evidence files live in `.night-shift/attachments/<task id>/`.
**Why:** a project that keeps its tasks in its repository should not need a
Trello board to run a Night Shift. Reading the files keeps the app free of
the CLI at serve time. **Rejected:** Outcomes in the implementation notes
(Backlog.md 1.52 has real comments, which match the Trello shape exactly);
evidence committed under `backlog/` (evidence is often large and local).

## D18  The `.local/` folder for private agent context (2026-09-25)

Each project may keep `.local/` (git-ignored): `preferences/` for the
owner's personal profile, `planning/<topic>/` for drafts not yet promoted,
`evidence/<yyyy-mm-dd>-<slug>/` for scratch proof. Agents read every file in
`.local/preferences/` before replying. **Why:** some preferences are
personal and the repository is public; drafts and scratch evidence need a
home that is not the tracker. Precedence: the owner's words in the session,
then `.local/preferences/`, then the shared owner file.

## D19  Agents judge risk by what can be lost, not by command name (2026-09-25)

Agents do all routine Git (commit, push, merge to `main`, stash, reset,
rebase, branch, tag and worktree clean-up) without asking. Before a command
that drops commits from a branch or deletes an unmerged branch, they tag the
old tip `backup/<branch>-<yyyymmdd-hhmm>`, so nothing is lost for good. Only
losing work for good, rewriting published `main` and changing the
repository itself stay with the owner. **Why:** the owner wants senior
developers who need no babysitting; a backup tag makes most "dangerous"
commands reversible, which is the real test.

## D20  Night Shift becomes files of a fixed shape, not a protocol (2026-09-26)

Night Shift no longer asks an `Adopter` to follow a protocol (`Night-ready`
cards, `Card Header`, `Binding`, practices) and no longer reads their board.
It adds files of a fixed shape, a tool that checks them, two skills and a
local app; the developer keeps their own workflow and tracker. One night is
one unattended session: the agent writes a plan (its promise), records each
task's outcome and evidence as it goes, and the tool closes one night file
per night and adds metrics measured from the harness. Answers flow back
through a follow-up file. The full agreed design is `docs/design.md`.
**Why:** the owner judged the rigid protocol would not survive real use;
the real pains are reading a night quickly, answering questions, history
and measuring unattended agents, and none of them needs a process imposed.
**Chosen:** a fixed JSON frame with a small block vocabulary inside it,
grown release by release on request, because data cannot escape the
vocabulary and the tool rejects anything else like a type error.
**Rejected:** pages written as TSX components (arbitrary code escapes the
vocabulary and cannot be validated); a page built freely from blocks (every night a different shape, so no
history or measurement); reading the board (not every developer has one).
Replaces D1 and D6; D7's board adapters and D13's practices become optional
at most, to be settled when the v6 model is retired; D5's question files and
D9's question kinds stay open until field testing.

## D21  v6 retired; v7 built as the D20 design, with the choices made unattended (2026-09-26)

The v6 protocol model is gone from the repository: the protocol, contract
and binding documents, the board adapters, the overview, the templates, the
old schemas and examples, and the Queue and buffer screens. The `Viewer`'s
look and its media viewer, compare slider and question deck stay. v7 is the
design in `docs/design.md`. The owner decided most of it card by card; the
choices below were made unattended and are open to review:

- **A `carried` item status.** A follow-up item a later night reached
  but did not finish is `carried`, with the reason, and the new night's
  own follow-up picks it up, keeping the developer's decision; an item
  the night never reached stays `open`. **Why:** without it an unfinished
  item would stay `open` in two follow-up files at once.
- **A plan must account for every open follow-up item.** Each is linked
  as a task (`follow_up`) or skipped with a reason (`skipped_follow_ups`);
  the tool refuses a plan that leaves one out. **Why:** otherwise stale
  items pile up silently and the developer's answers are never acted on.
- **Liveness is the recorded process id plus recent change.** A night counts
  as running while the harness process that started it is alive and its
  files or transcript changed within 24 hours; otherwise recovery closes it
  `interrupted`. **Why:** Claude Code gives tools `CLAUDE_PID`; a timestamp
  alone would close a long night or keep a dead one open.
- **Agents hand JSON through `.night-shift/input.json`.** The skills tell the
  agent to write the JSON with its file tool and pass `--file`. **Why:** the
  first live night showed Claude Code blocks JSON inline in a shell command
  and input redirection from files outside the repository.
- **Metrics are all optional.** Claude Code's session log is internal and
  changes; a value the tool cannot read is `null` and shown as unknown.
- **The install folder is `~/.night-shift/`** (registry, `Viewer` state,
  releases), overridable with `NIGHT_SHIFT_ROOT` for tests and scratch runs.
- **The history commit touches only `.night-shift/history`** (`git commit
  --only`), so an agent's staged work is never swept in, and the repository's
  own hooks still run.
- **The trial repository is a throwaway copy of a small web app**, driven by
  headless Claude Code sessions as the agent and by the maintainer as the
  developer; it is registered in the maintainer's own install. The earlier
  `Adopter` trial's night files were archived outside that repository and its
  Night Shift wiring removed.

**Rejected:** keeping the v6 screens behind a flag (two models to maintain
for no user); inline JSON with a documented permission rule (every `Adopter`
would need to change their permissions). Replaces D7, D13, D14 and D17;
D5 and D9 stay open (D20).

## D22  Morning is an inbox; how a night ended and what it needs are shown apart (2026-09-26)

Morning shows only the nights still unread or needing the developer: an
open question, or unfinished work and answers not yet handed over (closed,
something to hand over, no follow-up file). With none left it says "All
caught up"; every night stays one click away in History. The night's own
status reads **Closed** / **Stopped early** instead of Complete /
Interrupted, and the developer's side shows beside it as **Needs you**,
**Handed over** or **Nothing left**. **Why:** the owner opened Morning on
two finished nights and could not tell why they were shown, nor whether
"Complete" meant nothing was left for them. **Chosen:** one rule
(`inMorning`, `ownerSide` in `src/types.ts`) used by the server and the web
app alike; the list is fixed when the `Viewer` loads, so a night does not
vanish while the developer works on it, and its chip shows a tick once
settled. A question handed over unanswered keeps its night in Morning until
it is answered or a later night settles it. A night opened while it was
still running counts as unread again once it ends, so its ending is never
missed. **Rejected:** a dismiss button
(an unfinished night is settled by handing it over; the next agent then
skips what no longer matters, with a reason); keeping every unread night
only (a read night with open questions would disappear).

## D23  `night-shift allow` grants the tool, in the developer's own settings (2026-09-26)

A night nobody watches stalls on the first permission prompt; the v7 trial
lost a night to that (TASK-22). `night-shift allow` adds three rules to
`.claude/settings.local.json`: run the tool through Bash and PowerShell, and
edit files under `.night-shift/` (where agents write their JSON). It keeps
every other setting, adds a rule only once, refuses a file that is not JSON,
and adds that file to `.gitignore` unless git already ignores it.
**Why:** the owner asked for a Night Shift utility instead of editing
settings by hand in each repository. **Chosen:** a separate command that
`install` points to, because granting permissions is the developer's act and
should not happen as a side effect of installing. **Rejected:** writing the
rules into the shared `settings.json` (it would grant them to everyone who
clones the repository); allowing more than the tool (tests, git, databases
differ per repository and stay with the developer). TASK-22's wider
preflight stays open.

## D24  The Viewer is a guided journey: one state per night, colour by whose turn it is (2026-09-28)

The owner reviewed the whole journey as a new user who is lazy, forgetful
and reads nothing, and agreed a redesign with the agent. Not built yet; the
work is split into Backlog tasks. **Why:** Morning had no hierarchy, the
summary read as a wall of text, nothing followed the last answer, the chip
showed a tick beside an orange "Stopped early" dot, the owner could not
recall what a follow-up or hand-over is, and Trends was an empty tab.
**Chosen:**

- **One `Owner state` per night**, in order, with these labels
  everywhere (cards, report, step track, History): Running, New, Needs
  answers, Ready to save, Waiting for an agent (a `Follow-up file` exists
  and items are open; nudges after two days), Done (every item done,
  skipped or carried, or nothing was owed). A follow-up whose open items
  are all `discuss` is the owner's turn, not the agent's: it shows Needs
  answers (amber, a card), next step "work on the follow-up" in a
  terminal session. How a night ended shows only as a grey warning when
  it cost work ("Stopped early: 2 tasks never started").
- **What it replaces in D22:** the two axes on cards, and the
  `inMorning`/`ownerSide` rule for which nights are listed (a night
  Waiting for an agent now stays visible). **Kept from D22:** the list is
  fixed when the `Viewer` loads, a night opened while running is unread
  again once it ends, and a question saved unanswered keeps its night
  listed until it is answered or a later night settles it.
- **Colour means whose turn it is:** purple new, amber the owner's turn
  (the `blocked` outcome included), blue the agent's turn, green with a
  tick only when nothing is left, red only when something broke. One badge
  per card, never two dots.
- **`Inbox` of `Night Report` cards.** The Morning tab becomes `Inbox`:
  one card per night needing the owner, each with its state, a one-line
  result and one next-step button; settled nights drop to a slim strip and
  stay visible while Waiting for an agent. A time estimate on top ("about
  4 minutes: 3 questions, 2 saves") and **Start my morning**, one run
  through every open question across repositories. The navigation is Inbox
  and History; the Questions tab and the empty Trends tab go (TASK-15 keeps
  Trends' future).
- **The `Night Report` page** leads with what needs the owner, then what
  happened as one row per task; the summary becomes a one-sentence
  headline; outcome counts show only non-zero values on one line; the
  answers card shrinks to a row.
- **A step track** on every report and a small one on every card; the
  current step glows and animates on to the next. **One shared "How Night
  Shift works" explainer**, animated, for the first run and behind the "?"
  beside the few terms that need it. Not a per-night graph on its own tab:
  the next step belongs where the owner already looks.
- **Explicit gate:** the question deck ends on **Save for the next agent**
  (the word "hand over" misled: nothing runs until the owner starts an
  agent), then a confirmation that says so and gives the phrase to copy
  ("start night shift", or "work on the follow-up" by day). Until an agent
  picks the work up, a changed answer rewrites the follow-up; after that it
  is locked.
- **Questions:** a peer answer **"I'm not sure, let's discuss"** with a
  required note; it is saved as a `discuss` item that no unattended night
  acts on, and a day session raises it with the owner in the terminal
  first. The question's `why` shows up front. A question that points at
  files must carry them: shown in the Viewer, plus **Show in folder**
  (the local server opens the file manager; Windows first).
- **Nudges:** every state has one "Next:" line; the tool can raise a
  desktop notification when a night ends, linking to its report; the whole
  morning works from the keyboard; the header shows open GitHub proposals
  from `Feedback`.
- **File shapes:** three changes (a `discuss` follow-up item kind, file
  references on questions, a one-sentence limit on `summary`) land together
  as one versioned change under the AGENTS.md rule, not three. The summary
  limit applies to new nights only, so older night files stay valid.
- Laptop first; phone keeps working one card per row.

**Rejected:** a per-night animated graph on its own tab (the owner's first
idea; a forgetful user never visits it, and six steps in a row are a line,
not a graph); a docs page (this user will not open it); creating the
follow-up automatically on the last answer (the owner wants an explicit
gate); "?" popovers on every term (a word that needs one every visit is the
wrong word).

## D25  Night Shift develops itself: this repository is its own `Adopter` (2026-09-28)

The owner asked whether Night Shift could build Night Shift, and agreed.
`night-shift install .` and `night-shift allow .` ran here; the `Meter` hook
lives in the committed `.claude/settings.json` and the skills' installed
copies in `.claude/skills/`. **Why:** the owner reviews Night Shift's own
nights every morning, the most direct test of whether the `Viewer` and the
D24 journey work. **Chosen:** a night runs on the installed release, never
on the checkout, so a change that breaks the source mid-night cannot break
the recording of that night. A night works on `night/<yyyy-mm-dd>`, created
before `night-shift start` so the history commit that start makes lands
there; the next session commits the history the `Meter` rewrote at session
end, then leaves the branch (docs/practices/git.md); a day session merges
the branch after the owner has seen the report of every night it brings,
although small changes here otherwise go straight to `main`. A night never
cuts or switches a release, because switching changes the tool under the
running night. Night history is committed to this public repository with the
owner's answers and notes; the owner accepted that. **Rejected:** leaving
history out of this repository only (a special case in the tool for one
`Adopter`); nights committing straight to `main` (the owner wants to see the
work first).

## D26  A Next night tab lists what the next night will pick up (2026-09-28)

After previewing the first `Owner state`s, the owner asked for a tab that
shows at once what is scheduled for the next night in each repository.
**Why:** the `Viewer` showed which `Night`s were Waiting for an agent, but
not the open `Follow-up file` items themselves; the owner had to open each
night to find them. **Chosen:** a **Next night** tab beside `Morning`, with
a count of open items: per repository, every open item grouped by the night
it came from (a link back to that night), with its kind (your decision,
unfinished, or needs your answer), the decision, the owner's note and what
was left. It reads the follow-up files only; no file shape changes. This
amends D24's navigation of `Inbox` and History to three tabs. **Rejected:**
a "Next night" section at the top of the `Inbox`, which the agent
recommended to keep two tabs; the owner preferred a tab of its own.

## D27  The Inbox is an overview; a report is its own page (2026-09-28)

After using v13 the owner asked for the home page to be an overview of
everything, with bigger night cards and the details of a night only once
it is picked, a way back from a night, and clearer section boundaries.
**Why:** v13 still showed D22's chip row with the first night opened in
full below it, so "Open the last night" had no way back, and an empty
questions card took as much room as a full one. **Chosen:** the `Inbox`
is the home page: three actionable numbers (questions for you, nights
that need you, items for the next night), **Start my morning** across
every open question, one card per night that is Running or the owner's
turn, and a slim strip of the rest. A `Night Report` is a page of its
own with a way back, and every page has an address, so the browser's
Back works. Sections carry a small heading over a lightly bordered
block. The Questions tab goes now rather than after the gate (TASK-28),
because Start my morning and the numbers replace it; the navigation is
Inbox, Next night and History. **Rejected:** more numbers on the home
page (cost and duration totals stay in History, so the next step is not
lost in a wall of figures).

## D28  GitHub issues become tasks; the issue closes with the work (2026-09-28)

Issues #4, #5 and #6 (`Feedback` an `Adopter`'s `Owner` sent from the
`Viewer`) sat open with no task, and a session reported feedback as
awaiting the owner when the owner had already sent it as #5. **Why:**
sessions read only the board, so nothing ever looked at the issues.
**Chosen:** every day session, after the briefing and before new work,
turns each open issue without the `tracked` label into a task, comments
"Tracked as TASK-<id>" and adds the label; a commit that brings the work
to `main` says `Closes #<n>`. Intake and closing are routine; the owner
still decides priority. A `Night` skips intake: it works only its
`Plan`, and the next day session takes the issues in. **Rejected:**
issue statuses or labels such as "pending" or "read" (they drift from
the board, which already shows progress).

## D29  The Viewer accepts changes only from its own page (2026-09-28)

**Decision:** every request that changes something (every non-GET: an
answer, a save, a send, Show in folder) is refused when the browser marks
it as coming from another site: `Sec-Fetch-Site` other than
`same-origin` or `none`, or, without that header, an `Origin` that is not
the Viewer's own. Requests with neither header (the tool, tests) pass.
**Why:** D11's Host check stops DNS rebinding, not a page on another site
posting to `127.0.0.1`; such a page could write an answer or open a file
manager window (TASK-45). **Rejected:** a token in every request (more
moving parts for the same protection on a local tool).

## D30  An unanswered question stays where it was asked (2026-09-28)

**Decision:** a `waiting` follow-up item that a night took on stays `open`
when its task ends neither done nor skipped and the night did not ask the
same question again (word for word) for that task. The developer answers
it where it was asked; the next night plans or skips it again. **Why:**
marking it `carried` locked the question in the Viewer and no follow-up
repeated it, so nobody heard it again (TASK-47). **Rejected:** copying the
question into the new follow-up (answers are given on the night that asked
the question and flow into that night's follow-up; a copy elsewhere could
not be answered).

## D31  The decisions an agent takes for the owner are first-class (2026-09-28)

**Decision:** an agent records every decision it takes on the owner's
behalf with `night-shift decide` (the decision, why, the task) into the
night file's `agent_decisions`. The owner reviews them in Start my morning,
as cards after the questions: Enter keeps a decision ("Fine, keep it"), D
disagrees with a note. A disagreement becomes a `disagreed` follow-up item
the next agent is told about. Unreviewed decisions keep the night in the
owner's turn (Needs answers, amending D24), and the Inbox counts them.
They also show on the Night Report, per task and in their own section. A
choice that belongs to the owner is never taken silently: during a night
the agent asks when the task cannot go on without it or a wrong choice
would be costly to undo, and otherwise decides and records it (before, it
asked about every such choice, D1); a day session asks. Night and
follow-up files go to version 3. **Why:** the owner wants to see, reliably and in one
place, what an agent chose for them while reviewing work (TASK-46); both
choices (cards in the morning; the owner's turn until reviewed) are the
owner's. **Rejected:** reviewing them only on the Report (easy to miss);
letting unreviewed decisions leave the night in an agent's turn (the owner
called them very important).
