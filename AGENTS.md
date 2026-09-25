# AGENTS.md — night-shift

The Night Shift Protocol (`docs/protocol.md`), its contract
(`docs/contract.md`, `schemas/`) and the local morning-review app. Public,
project-neutral: nothing here names a particular project, board or client.

## Layout

| Path | Role |
|---|---|
| `docs/protocol.md` | The protocol. Printed by `night-shift docs protocol` |
| `docs/contract.md`, `schemas/*.schema.json` | What agents write and the app reads |
| `docs/binding.md` | Template a project fills to adopt the protocol |
| `docs/practices/` | Default working practices a binding adopts or overrides; project-neutral, examples use the demo project |
| `templates/` | Copy-ready files for adopting projects: cards, glossary, bypass log, owner file, reviewer agents |
| `src/cli.ts` | `night-shift serve / check / docs / --version` |
| `src/server.ts` | Hono app: JSON API plus the built web app |
| `src/store.ts` | `.night-shift/` folder: project, questions, answer writes (hash guard) |
| `src/overview.ts`, `src/parse.ts` | Queue and shifts from the board; card header and outcome parsers |
| `src/board/` | `BoardAdapter` and its implementations (`trello`, `file`) |
| `src/types.ts` | Shapes shared by server and web app (types, plus one constant) |
| `web/` | React + Tailwind + Vite UI; `web/dist` is built, ignored |
| `examples/demo/` | Fictional project on a `file` board; tests copy it |
| `tests/` | `node --test` suites |
| `scripts/release.ts` | Tag releases and the `night-shift` launcher |

## Commands

```sh
npm run check        # typecheck + tests + web build; the gate for every commit and release
node src/cli.ts serve examples/demo --port 4799
```

## Rules

- Keep the protocol project-neutral. A project-specific need becomes a
  binding slot or an adapter, never a special case in the core.
- One writer per field: the app writes only `answer` in a question file.
- The contract is versioned by its `schema` values (`question/1`,
  `outcome/1`, …). A breaking change adds `/2` and keeps reading `/1`.
- Credentials stay on the server; the browser never sees them.
- Releases: tags `v1`, `v2`, … never moved; a bad release takes the next number.
- LF line endings; English everywhere.
