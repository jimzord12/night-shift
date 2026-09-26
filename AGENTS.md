# AGENTS.md — night-shift

The `Night Shift Repo`: the Night Shift Protocol (`docs/protocol.md`), its contract
(`docs/contract.md`, `schemas/`), the default working practices
(`docs/practices/`), templates, and the local morning-review app. Public,
project-neutral: nothing here names a particular project, board or client.
A project that runs Night Shift is an `Adopter` (docs/glossary.md).

**Direction changed on 2026-09-26 (D20):** Night Shift is becoming files of
a fixed shape, a tool, two skills and a local app, with no protocol imposed.
The agreed design is `docs/design.md`; the protocol, contract, binding,
practices and templates below describe v6 as shipped, not the direction.
This repository still works by docs/practices/ until they are settled.

Agents here work as independent, dependable senior developers: they take
the technical and routine decisions themselves, carry work through to
integrated and verified, and report afterwards. What stays with the owner
is listed in one place, `docs/owner.md`; read it there, not from a summary.

## A fresh session

This repository is self-contained: everything needed to continue its work is
in it. Orient in this order, read-only, then give the four-line briefing
(Goal / Now / Next / You, docs/practices/orientation-and-handoff.md):

1. This file, `docs/owner.md`, and every file in `.local/preferences/` when
   it exists (the owner's private profile; never copy it into the repo).
2. `docs/decisions.md` (why things are as they are; do not re-argue a
   decision without new facts) and `docs/glossary.md` (official terms; use
   them in backticks when talking to the owner).
3. The work: `backlog/README.md` (our conventions), then
   `backlog task list --plain` and the session handoff,
   `backlog doc view doc-1 --plain`. Tasks, Git and evidence win when the
   handoff disagrees with them.
4. `CHANGELOG.md`, `git log --oneline -15`, `git tag -l`, and
   `npm run release list` for what is released and installed.

## Read when

| When | Read |
|---|---|
| Replying to the owner | `docs/owner.md`, `.local/preferences/` |
| Creating, taking or closing work | `backlog/README.md`, docs/practices/task-flow.md |
| Committing, branching, integrating, releasing | docs/practices/git.md |
| Before calling anything done | docs/practices/evidence.md, docs/practices/review.md |
| Changing what agents write or the app reads | `docs/contract.md`, `schemas/`, the contract versioning rule below |
| Adding or changing a board adapter | `src/board/adapter.ts`, docs/practices/board.md |
| Changing a practice or a template | docs/practices/README.md (which template goes with which practice) |
| Changing how agents behave here, beyond the small-change path (this file, `CLAUDE.md`, the owner file, practices, `backlog/README.md`, agent files) | `.claude/agents/context-maintainer.md`, `.claude/agents/context-reviewer.md` |
| Saving a draft or scratch proof | docs/practices/local-folder.md |
| Making a design decision | `docs/decisions.md` (append D<n+1>) |
| Ending a session | docs/practices/orientation-and-handoff.md: rewrite doc-1 in place |

## Layout

| Path | Role |
|---|---|
| `docs/design.md` | The agreed next design (D20); wins over the v6 docs on direction |
| `docs/protocol.md` | The protocol. Printed by `night-shift docs protocol` |
| `docs/contract.md`, `schemas/*.schema.json` | What agents write and the app reads |
| `docs/binding.md` | Template a project fills to adopt the protocol |
| `docs/practices/` | Default working practices a binding adopts or overrides; project-neutral, examples use the demo project |
| `docs/owner.md` | This repository's owner file: who decides what, how to report |
| `docs/decisions.md` | Design decisions with their reasons (append-only) |
| `docs/glossary.md` | Official terms |
| `backlog/` | Backlog.md: every open task, idea and known gap; `doc-1` is the session handoff |
| `CHANGELOG.md` | One entry per release tag |
| `templates/` | Copy-ready files for `Adopter`s: cards, glossary, bypass log, owner file, owner profile, Backlog.md starter, reviewer agents |
| `.claude/agents/` | This repository's subagents: `code-reviewer`, `design-reviewer`, `research-reviewer`, `context-reviewer`, `context-maintainer` |
| `.local/` | Git-ignored: owner profile, planning drafts, scratch evidence |
| `src/cli.ts` | `night-shift serve / check / docs / --version` |
| `src/server.ts` | Hono app: JSON API plus the built web app; Host check, media rules |
| `src/store.ts` | `.night-shift/` folder: project, questions, answer writes (hash guard) |
| `src/overview.ts`, `src/parse.ts` | Queue and shifts from the board; card header and outcome parsers |
| `src/board/` | `BoardAdapter` and its implementations (`trello`, `backlog`, `file`) |
| `src/types.ts` | Shapes shared by server and web app, plus `isOpen` and `bufferZone` |
| `web/` | React + Tailwind + Vite UI; `web/dist` is built, ignored |
| `examples/demo/`, `examples/backlog-demo/` | Fictional Lighthouse project on a `file` board and on a Backlog.md board; tests copy them |
| `tests/` | `node --test` suites |
| `scripts/release.ts` | Tag releases and the `night-shift` launcher |

## Commands

```sh
npm ci                                             # once
npm run check                                      # typecheck + tests + web build: the gate for every commit and release
node src/cli.ts serve examples/demo --port 4799    # try the app on a COPY of the demo (answers write into the files)
npm run dev                                        # UI with hot reload beside a running serve
npm run release v<N>                               # from a clean, pushed main; then `npm run release switch v<N>`
backlog task list --plain                          # the work (Backlog.md 1.52.0, installed globally)
```

After a release, a running `night-shift serve` keeps the old version until it
is restarted.

## Reviewers

Claude Code subagents in `.claude/agents/`, invoked fresh every round,
never a fork of the author:

- `code-reviewer`: the review gate for every non-trivial change; follows
  docs/practices/review.md.
- `design-reviewer`: every visible change to the app; looks at the
  screenshots against D12 and a fixed rubric.
- `research-reviewer`: web research a decision rests on; follows
  docs/practices/idea-loop.md.
- `context-reviewer`: every non-trivial change to the documentation agents
  read, whether made by `context-maintainer` or not; for a
  documentation-only change it replaces `code-reviewer`.

`context-maintainer` is the writer beside them: hand it feedback on how
agents behave here and it changes the guidance that owns that behaviour,
without committing.

The first three have generic versions for `Adopter`s in
`templates/agents/`; improve both together. The context pair is specific
to this repository.

## Working agreement

- Follow docs/practices/ for this repository too: task flow, evidence before
  done, the review gate (fresh every round, cap 5 attended, 10 unattended),
  Git. Small verified changes go straight to `main`; routine Git and
  releases need no permission from the owner; report them afterwards.
- **Judge a command by what it could lose, not by its name.** Before a
  branch loses commits, tag its old tip `backup/<branch>-<yyyymmdd-hhmm>`
  (docs/practices/git.md). Never `git clean -x` or `-X`: they wipe `.local/`.
- **Understand the seam before editing:** imports, call sites, wiring, the
  test or demo that covers it. Say what you found in a line, then act.
- **Do the work; don't hand it back.** Start the app, run the checks, take
  the screenshot yourself. Ask the owner only for decisions that are theirs
  and observations only they can make.
- A visual change is not done until it has been seen: a screenshot of the
  running app (a copy of a demo with suitable data) or the owner's own look.
- Tests exercise the real code: a test that passes with the feature deleted
  is not written; mocks only at true external boundaries.
- Keep the protocol project-neutral. A project-specific need becomes a
  binding slot or an adapter, never a special case in the core. Before every
  push, search the diff for names of real projects, boards, people and
  clients; the repository is public. Personal detail belongs in `.local/`.
- One writer per field: the app writes only `answer` in a question file.
- The contract is versioned by its `schema` values (`question/1`,
  `outcome/1`, …). A breaking change adds `/2` and keeps reading `/1`, or,
  while the only `Adopter`s are the owner's own projects, updates them in the
  same change and says so in CHANGELOG.md.
- Credentials stay on the server; the browser never sees them.
- Releases: tags `v1`, `v2`, … never moved; a bad release takes the next
  number. Every release gets a CHANGELOG.md entry.
- A new design decision gets a docs/decisions.md entry; a new term goes into
  docs/glossary.md, named in the next report to the owner.
- **This process is young.** When something is missing, unclear or keeps
  costing time, file it as a `spike` labelled `triage` with its consequence
  and a suggested next step; never change an active rule silently. Keep
  process work proportional: enough to support the next product task.
- LF line endings; English everywhere in the repository.
