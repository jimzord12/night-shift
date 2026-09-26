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
