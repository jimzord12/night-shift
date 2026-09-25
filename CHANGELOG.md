# Changelog

One entry per release tag. `npm run release vN` cuts them; tags are never
moved.

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
