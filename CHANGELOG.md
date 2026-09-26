# Changelog

One entry per release tag. `npm run release vN` cuts them; tags are never
moved.

## v10, 2026-09-26

- Morning is an inbox (D22): only the nights still unread or needing you
  (an open question, or unfinished work or answers not yet handed over); otherwise
  "All caught up", with the last night and History one click away. A
  night opened while it ran comes back as new once it ends.
- How a night ended reads **Closed** / **Stopped early** (was Complete /
  Interrupted); beside it, your side: **Needs you**, **Handed over** or
  **Nothing left**, in Morning and on every History row.
- Inbox chips show the repository and a short date ("26 Sept (2nd)"),
  stacked on a phone so long repository names never hide the date.

## v9 (c0ceb52), 2026-09-26

- `night-shift forget <repo id or path>` takes a repository off the Viewer
  and drops its read marks; its own `.night-shift/` folder stays.

## v8 (e0fbd44), 2026-09-26

- Feedback issues read better on GitHub: the agent's words under a
  heading, then kind (with what it means), tags, night and version as a
  list. An open code block in the agent's text is closed; a long entry is
  cut to fit a GitHub link. Checked with a real test issue sent from the
  Viewer; the `proposal` label now exists on the repository.

## v7 (b680823), 2026-09-26

A new model (D20, D21): Night Shift no longer imposes a process. It adds
files of a fixed shape, a tool that checks them, two skills and the
`Viewer`.

- **Files:** a `Plan` (the agent's promise), a `Night file` per night (six
  outcomes, seven evidence blocks, questions, feedback, metrics) and a
  `Follow-up file` that carries the developer's answers to the next night.
  Schemas `night-shift/plan@1`, `night@1`, `follow-up@1`.
- **Skills:** `start-night-shift` and `do-night-shift-follow-up`, copied by
  `night-shift install` with the command filled in.
- **Tool:** `start`, `record`, `ask`, `feedback`, `close`, `follow-up`,
  `status`, `check`, `install`, `view`; a session-end hook (`meter`) adds
  duration, sub-agents, tokens and cost read from Claude Code's session
  log, and closes a night its session left open. Closed nights are copied
  to `.night-shift/history/` and committed on their own.
- **Viewer:** Morning (unread nights, counts, metrics, tasks with their
  evidence, questions, follow-up, feedback to GitHub issues), Questions,
  History; Trends is a placeholder. Works at phone width. An answer changed
  after the follow-up exists updates it, and is locked once an agent has
  worked on it.
- **Trial:** two headless Claude Code nights and one day follow-up on a
  throwaway app; fixes from it include JSON handed over through
  `.night-shift/input.json`, a schema guard on every write, and history
  copies that survive a repository's own formatter. Sample files in
  `examples/sample-repo/`.
- **Retired:** the v6 protocol, contract and binding, board adapters, the
  Queue and buffer screens, templates and the old schemas. The only earlier
  `Adopter` trial was archived and unwired.

## v6 (83f4694), 2026-09-25

- A Backlog.md board: `board.type: "backlog"` reads a project's `backlog/`
  folder; tasks are cards, statuses the lists, task comments carry
  Outcomes, evidence lives in `.night-shift/attachments/<task id>/` (D17).
  Demo: `examples/backlog-demo/`.
- This repository tracks its own work in Backlog.md; `docs/backlog.md` is
  gone (D16).
- Practices: new `local-folder.md` (the git-ignored `.local/` for the owner
  profile, drafts and scratch evidence, D18); Git judged by what could be
  lost, with backup tags (D19); stricter review depth; honesty rules for
  evidence; Backlog.md board discipline.
- Templates: an owner-profile, a Backlog.md starter (`config.yml`,
  `README.md`), a design-reviewer agent; the owner file and reviewer agents
  upgraded.
- Contract: `project.json` accepts the `backlog` board (additive; `/1`
  unchanged).

## v5 (89af26f), 2026-09-25

- The buffer is a tachometer: idle, warming up, a sweet spot at 70-80% of
  `buffer.max`, running hot, a pulsing redline from 90% (D14).
- The buffer card says what it counts: "N Night Shift tasks", the board's
  cards marked Night-ready, and names the zone with a hint.
- Contract: `project.json` `buffer.target` becomes `buffer.max` (default 20).

## v4 (53fb096), 2026-09-25

- Full-screen media viewer: images (fit or actual size), video, PDF, HTML
  pages and websites; options may carry `preview` (D15).
- docs/practices/ and templates/: default working practices and copy-ready
  templates (D13), reviewed and fixed.

## v3 (a872a94), 2026-09-25

- Fuel-gauge dial (later replaced by the tachometer), restacked Morning
  cards, more shooting stars and meteors.

## v2 (7771674), 2026-09-25

- Living night sky (canvas starfield), text 20% larger, clearer cards,
  animated "Start answering", moon-like deck buttons.

## v1 (2caba5b), 2026-09-25

- The protocol, the contract, the binding template.
- `night-shift serve / check / docs`; Trello and file board adapters; the
  morning review app (outcome tiles, evidence, question deck, queue, history).
- Security fixes from the first independent review (D11).
