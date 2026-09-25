# Night Shift

**Decide by day. Build by night. Review in the morning.**

A working protocol for one owner and a team of AI agents, plus the small local
app that makes the morning review take minutes instead of an hour of reading.

- **Day Shift**: owner and lead agent decide and design; the output is a buffer
  of 10 to 15 cards that are *Night-ready*: nothing left to decide.
- **Night Shift**: agents build those cards unattended, and raise a question
  instead of guessing when something is not decided.
- **Morning Review**: the owner opens the app: what shipped (renders,
  before/after sliders), the night's questions as a clickable deck, and how
  full the buffer still is.

The protocol is project-neutral. A project plugs in its own board, test
command and review rules through a short *binding*.

| Read | For |
|---|---|
| [docs/protocol.md](docs/protocol.md) | The protocol: roles, the cycle, the Night-ready contract, night rules |
| [docs/contract.md](docs/contract.md) | Exactly what agents write: `project.json`, question files, the card header, the outcome comment |
| [docs/binding.md](docs/binding.md) | How a project adopts it |

## Install

Needs Node 24 or newer.

```sh
git clone https://github.com/jimzord12/night-shift.git
cd night-shift
npm ci
npm run release install-launchers   # writes ~/.night-shift/bin/night-shift(.cmd); add that folder to PATH
```

Releases are git tags (`v1`, `v2`, …). The launcher runs the `current`
release from `~/.night-shift/releases/`:

```sh
npm run release v2          # from a clean, pushed main: check, export, install, build, tag, push
npm run release switch v1   # run an older one
npm run release list
```

## Use

```sh
night-shift serve ../my-project --open    # the morning review app on http://127.0.0.1:4747
night-shift check ../my-project --board   # validate questions, card headers and outcomes
night-shift docs protocol                  # the protocol text of the installed version
```

Try it without a board: `night-shift serve examples/demo --open` (a
fictional project on a `file` board). The demo's question files are tracked,
so answer them in a copy.

A Trello board needs `TRELLO_API_KEY` and `TRELLO_API_TOKEN` in the shell
that runs `serve`; they stay on the server and never reach the browser.

## Develop

```sh
npm run dev      # the UI with hot reload; start `node src/cli.ts serve <project>` beside it
npm run check    # typecheck, tests, web build: the release gate
```

The server is TypeScript that Node runs directly (no build step): Hono for
HTTP, Ajv for the JSON Schemas in `schemas/`. The UI is React, Tailwind and
Vite under `web/`. Board adapters live in `src/board/`; a new board is one
file implementing `BoardAdapter`.

MIT licence.
