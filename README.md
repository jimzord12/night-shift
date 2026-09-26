# Night Shift

**Your agents work unattended. Night Shift tells you, in five minutes the
next morning, what they did.**

You already run AI agents your own way: your rules, your tracker (or none),
your prompts. What goes missing is the morning: a terminal full of scrollback,
questions buried in it, no history, and no idea how well the agents do alone.

Night Shift adds a record of each unattended session, nothing more:

- **The plan**: at the start, the agent writes what it will do tonight and
  what "done" means for each task.
- **The night file**: after each task, it records the outcome (done, partial,
  blocked, failed, not started, skipped), the checks, and proof from a small
  fixed set of blocks: screenshots, before/after comparisons, videos, PDFs,
  links, command output, short notes. When it needs a decision, it asks
  instead of guessing.
- **The Viewer**: one local page for all your repositories. Read the night,
  open the proof, answer the questions with a click, hand the answers back
  to the next agent as a follow-up, and send friction you want fixed to the
  Night Shift maintainers.
- **The Meter**: duration, tokens, sub-agents and cost, read from Claude
  Code's own session logs, never claimed by the agent.

The `night-shift` tool checks everything the agent writes; a record that
breaks the rules (a task marked done with a check unmet, proof that does not
exist) is refused with a message that says how to fix it. Claude Code is the
first supported harness.

| Read | For |
|---|---|
| [docs/design.md](docs/design.md) | How it works: the files, the outcomes, the blocks, the life of a night |
| [docs/decisions.md](docs/decisions.md) | Why it is built this way |
| [docs/glossary.md](docs/glossary.md) | The official terms |
| [CHANGELOG.md](CHANGELOG.md) | What each release changed |

## Install

Needs Node 24 or newer and git.

```sh
git clone https://github.com/jimzord12/night-shift.git
cd night-shift
npm ci
npm run build                        # the Viewer
```

Then, in each repository you want to run nights in:

```sh
node <path to the clone>/src/cli.ts install   # the two skills, the session-end hook, the .gitignore lines
```

The installed skills and hook run the tool from your clone. Below,
`night-shift` stands for `node <path to the clone>/src/cli.ts`. Installing a
tagged release as a `night-shift` command on PATH works on the maintainer's
machine today (`npm run release`); making it work from a fresh clone is
open work.

## Use

In that repository, tell Claude Code **"start night shift"** and what to do
tonight. The agent plans, works, records and closes the night on its own.

In the morning:

```sh
night-shift view --open  # the Viewer on http://127.0.0.1:4747, every repository at once
```

After answering, **Create follow-up** hands your decisions and the unfinished
work to the next agent: the next night picks it up, or tell an agent by day
"work on the follow-up".

`night-shift --help` lists every command. `night-shift check` validates a
repository's night files.

## Releases

Releases are git tags (`v1`, `v2`, …); the launcher runs the `current` one
from `~/.night-shift/releases/`:

```sh
npm run release v8          # from a clean, pushed main: check, export, install, build, tag, push
npm run release switch v7   # run another one
npm run release list
```

## Develop

```sh
npm run check    # typecheck, tests, web build: the release gate
npm run dev      # the Viewer with hot reload; start `node src/cli.ts view` beside it
```

The tool is TypeScript that Node runs directly (no build step): Hono for
HTTP, Ajv for the JSON Schemas in `schemas/`. The Viewer is React, Tailwind
and Vite under `web/`. The skills' sources are in `skills/`.

MIT licence.
