# Changelog

One entry per release tag. `npm run release vN` cuts them; tags are never
moved.

## v15 (25798b7), 2026-09-28

- `night-shift close`: when a repository's pre-commit hook refuses the
  history commit, the message keeps the hook's last lines (not only
  git's last one) and saves the full output as `history-commit.log`
  beside the night; a hook that fails silently says "(no output; exit
  N)". Hooks that print megabytes no longer kill the commit or report a
  commit that landed as refused (TASK-42, GitHub #5).
- `night-shift status`: says which feedback was sent to GitHub, with the
  issue, and which still awaits the developer, for the open night and
  earlier ones (TASK-43, GitHub #6). The start-night-shift skill says so.
- This repository: GitHub issues become tasks at the start of every day
  session and close with the commit that brings their work to `main`
  (D28).

## v14 (179e4d0), 2026-09-28

- Viewer: Morning is now the Inbox (D24, D27, TASK-25). It opens on
  three numbers (questions for you, nights that need you, items for the
  next night), a Start my morning button that walks every open question
  across nights, one card per night that is running or your turn with its
  next step (Answer N questions, Save for the next agent, Read the
  report), and a slim strip for nights waiting for an agent or settled.
  No night opens until you pick one.
- Viewer: a night opens on its own Night Report page with ← Inbox and its
  own address, so the browser's Back works (TASK-26). It leads with what
  needs you and what was saved for the next agent, then one row per task;
  duration, cost and sub-agents show only when measured.
- Viewer: the navigation is Inbox, Next night and History; the Questions
  and Trends tabs are gone.
- Viewer: before/after images and single images fit the task drawer
  (at most 60% of the window high); sections have clearer headings and
  borders.
- Viewer: a night that cannot be loaded says why on its page every time
  it is opened; one that fails in the background is named on the Inbox
  with a Reload button, and Start my morning counts only what it can show.

## v13 (df40077), 2026-09-28

- Viewer: every night shows one state, coloured by whose turn it is
  (D24, TASK-24): Running and Waiting for an agent in blue (with the
  days waited from two on), New in purple, Needs answers and Ready to
  save in amber, Done in green with a tick. It replaces the ending dot
  and the Needs you / Handed over / Nothing left pill on Morning, the
  report and History. How a night ended shows only as a grey "Stopped
  early: N tasks never started" when it cost work.
- Viewer: blocked tasks are amber, partial ones blue, failed ones red;
  unmet checks are grey.
- Viewer: Morning lists every night that is not Done and opens on the
  newest one that is your turn; its heading counts only those.
- Viewer: a night file that cannot be read shows a red "Cannot be read"
  badge, is not counted, leaves Morning once opened, and its error names
  the repository and clears when another night is picked.
- Viewer: a Next night tab lists every open follow-up item across
  repositories, grouped by the night it came from (D26, TASK-38); the
  count turns amber when an item needs your answer. On a phone the tab
  reads Next and the empty Trends tab is left off.
- `npm run view` serves the checkout's Viewer on port 4748.

## v12 (86182b2), 2026-09-27

- History: the timeline dots sit on the line and in front of the cards
  again (they were half hidden behind them).
- History: the repository after a night's title is a badge with a folder
  icon, so it stands out; long names are cut with an ellipsis and shown
  in full on hover.

## v11 (7889ba0), 2026-09-27

- `night-shift allow [repo]` (D23): lets agents run the tool and write
  under `.night-shift/` without permission prompts, for nights nobody
  watches. The rules go into your own `.claude/settings.local.json`,
  which is kept out of git; every other setting stays. `install` now
  points to it.

## v10 (55fd855), 2026-09-26

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
