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
  links, command output, short notes. When a choice is yours, it asks, or
  takes it and records it for you to review.
- **The Viewer**: one local page for all your repositories. Read the night,
  open the proof, answer the questions and review the agent's decisions with a
  click, hand the answers back to the next agent as a follow-up, and send
  friction you want fixed to the Night Shift maintainers.
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
git tag --sort=-v:refname | head -1  # the newest release, say v19
npm run release build v19            # builds it from its tag into ~/.night-shift/releases
npm run release install v19          # makes it the night-shift command, in ~/.night-shift/bin
```

Put `~/.night-shift/bin` on your PATH and open a new shell;
`night-shift --version` then names the release. `npm run release docs`
explains every step, and `night-shift docs` every command.

Then, in each repository you want to run nights in:

```sh
night-shift install   # the two skills, the session-end hook, the .gitignore lines
night-shift allow     # let agents run the tool without asking, for nights nobody watches
```

`allow` writes to your own `.claude/settings.local.json` (never committed):
the tool itself and edits inside `.night-shift/`. Anything else a night
needs, such as tests, git or a database, follows your own permissions.
The rules name the command as it is when you run `allow`, so run it again
if you move to another way of running it, and start night sessions at the
repository root, where the file lives.

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

`night-shift docs` lists every command and how a night goes.
`night-shift check` validates a repository's night files.

## Releases

Releases are git tags (`v1`, `v2`, …); the launcher runs the `current` one
from `~/.night-shift/releases/`:

```sh
npm run release build v19     # a published tag: build it; a new number: a candidate from a clean, pushed main
npm run release install v19   # run it (try a candidate before publishing it)
npm run release publish v19   # tag the commit the candidate was built from, and push the tag
npm run release list
npm run release docs          # the manual
npm run check:clean           # a fresh clone installs the newest release, in a clean container (Docker)
```

## Develop

```sh
npm ci           # once
npm run check    # typecheck, tests, web build: the release gate
npm run dev      # the Viewer with hot reload; start `node src/cli.ts view` beside it
```

The tool is TypeScript that Node runs directly (no build step): Hono for
HTTP, Ajv for the JSON Schemas in `schemas/`. The Viewer is React, Tailwind
and Vite under `web/`. The skills' sources are in `skills/`.

MIT licence.
