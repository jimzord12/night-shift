# AGENTS.md — night-shift

The Night Shift Protocol (`docs/protocol.md`), its contract
(`docs/contract.md`, `schemas/`), the default working practices
(`docs/practices/`), templates, and the local morning-review app. Public,
project-neutral: nothing here names a particular project, board or client.

## A fresh session

This repository is self-contained: everything needed to continue its work is
in it. Orient in this order, read-only, then give the four-line briefing
(Goal / Now / Next / You, docs/practices/orientation-and-handoff.md):

1. This file, then `docs/decisions.md` (why things are as they are; do not
   re-argue a decision without new facts) and `docs/glossary.md` (official
   terms; use them in backticks when talking to the owner).
2. `docs/backlog.md`: the single list of open work for this repository (it
   has no task board). Take an item, finish it, delete its line in the same
   commit.
3. `CHANGELOG.md`, `git log --oneline -15`, `git tag -l`, and
   `npm run release list` for what is released and installed.
4. Talk to the owner as docs/practices/owner.md describes: short, visual,
   lead with the answer, end with a Recap and one "Your next move".

## Layout

| Path | Role |
|---|---|
| `docs/protocol.md` | The protocol. Printed by `night-shift docs protocol` |
| `docs/contract.md`, `schemas/*.schema.json` | What agents write and the app reads |
| `docs/binding.md` | Template a project fills to adopt the protocol |
| `docs/practices/` | Default working practices a binding adopts or overrides; project-neutral, examples use the demo project |
| `docs/decisions.md` | Design decisions with their reasons (append-only) |
| `docs/backlog.md` | Open work for this repository |
| `docs/glossary.md` | Official terms |
| `CHANGELOG.md` | One entry per release tag |
| `templates/` | Copy-ready files for adopting projects: cards, glossary, bypass log, owner file, reviewer agents |
| `.claude/agents/code-reviewer.md` | This repository's own independent reviewer (reads docs/practices/review.md) |
| `src/cli.ts` | `night-shift serve / check / docs / --version` |
| `src/server.ts` | Hono app: JSON API plus the built web app; Host check, media rules |
| `src/store.ts` | `.night-shift/` folder: project, questions, answer writes (hash guard) |
| `src/overview.ts`, `src/parse.ts` | Queue and shifts from the board; card header and outcome parsers |
| `src/board/` | `BoardAdapter` and its implementations (`trello`, `file`) |
| `src/types.ts` | Shapes shared by server and web app, plus `isOpen` and `bufferZone` |
| `web/` | React + Tailwind + Vite UI; `web/dist` is built, ignored |
| `examples/demo/` | Fictional Lighthouse project on a `file` board; tests copy it |
| `tests/` | `node --test` suites |
| `scripts/release.ts` | Tag releases and the `night-shift` launcher |

## Commands

```sh
npm ci                                             # once
npm run check                                      # typecheck + tests + web build: the gate for every commit and release
node src/cli.ts serve examples/demo --port 4799    # try the app on a COPY of the demo (answers write into the files)
npm run dev                                        # UI with hot reload beside a running serve
npm run release v<N>                               # from a clean, pushed main; then `npm run release switch v<N>`
```

After a release, a running `night-shift serve` keeps the old version until it
is restarted.

## Working agreement

- Follow docs/practices/ for this repository too: task flow, evidence before
  done, the review gate (`.claude/agents/code-reviewer.md`, fresh every
  round), Git. Small verified changes go straight to `main`; routine Git and
  releases need no permission from the owner; report them afterwards.
- A visual change is not done until it has been seen: a screenshot of the
  running app (the demo copy with suitable data) or the owner's own look.
- Keep the protocol project-neutral. A project-specific need becomes a
  binding slot or an adapter, never a special case in the core. Before every
  push, search the diff for names of real projects, boards, people and
  clients; the repository is public.
- One writer per field: the app writes only `answer` in a question file.
- The contract is versioned by its `schema` values (`question/1`,
  `outcome/1`, …). A breaking change adds `/2` and keeps reading `/1`, or,
  while the only adopters are the owner's own projects, updates them in the
  same change and says so in CHANGELOG.md.
- Credentials stay on the server; the browser never sees them.
- Releases: tags `v1`, `v2`, … never moved; a bad release takes the next
  number. Every release gets a CHANGELOG.md entry.
- A new design decision gets a docs/decisions.md entry; a new term goes into
  docs/glossary.md.
- LF line endings; English everywhere.
