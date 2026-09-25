# Practices

Default working practices for a project that runs the Night Shift Protocol.
The protocol says *when* agents work and what they hand the owner; these
say *how* the work is done so the night keeps the day's quality bar
(night rule 3 in [protocol.md](../protocol.md#6-night-rules)).

They are defaults, not law. A project adopts them as they are, or names
the ones it replaces in its binding's **Practices overridden** slot
([binding.md](../binding.md)); the project's own rule then wins. Nothing
here names a particular project: the examples use Lighthouse, the
fictional web shop in `examples/demo/`.

| Practice | One line | Read when |
|---|---|---|
| [task-flow.md](task-flow.md) | Five stages, two side states; the card is the task record | Creating, moving or closing a card |
| [orientation-and-handoff.md](orientation-and-handoff.md) | Derive state from sources; one handoff card, rewritten in place | Starting or ending any session |
| [review.md](review.md) | The independent review gate: fresh reviewer, eight lenses, verdicts, caps | Before integrating a change |
| [evidence.md](evidence.md) | Nothing is done without evidence; every run writes a new folder | Before calling anything done |
| [git.md](git.md) | Agents own routine Git; protected refs; commit style | Committing, branching, integrating, tagging |
| [glossary.md](glossary.md) | One official term per concept, kept by the agents | Writing to the owner or writing docs |
| [proposals.md](proposals.md) | How a rule change is proposed, tried and decided; friction notes | Changing how the team works |
| [bypass-log.md](bypass-log.md) | Going around shared code is allowed and logged | After working around a shared component |
| [owner.md](owner.md) | Who decides what; how to talk to the owner | Before replying to the owner |
| [idea-loop.md](idea-loop.md) | Idea agents in a closed review loop that only proposes | Running product or design idea work |
| [board.md](board.md) | Write discipline for any board adapter | Writing to the board |

Read them from this repository or on GitHub. `night-shift docs` prints only
the three protocol documents (`protocol`, `contract`, `binding`).

## Templates

`templates/` holds copy-ready files that go with these practices:

| File | Copy to |
|---|---|
| `templates/task-card.md` | the description of a new card |
| `templates/handoff-card.md` | the description of the one session-handoff card |
| `templates/glossary.md` | `docs/glossary.md` |
| `templates/bypass-log.md` | `docs/bypass-log.md` (or the project's own name) |
| `templates/owner.md` | `docs/owner.md`; fill every slot |
| `templates/agents/code-reviewer.md` | `.claude/agents/code-reviewer.md` |
| `templates/agents/research-reviewer.md` | `.claude/agents/research-reviewer.md` |
| `docs/practices/review.md` | `docs/review.md`; the code-reviewer agent reads it |
| `docs/practices/idea-loop.md` | `docs/idea-loop.md`; the research-reviewer agent reads it |

The two agent files are Claude Code subagent definitions. Copy them into the
project's `.claude/agents/` together with the practice file each one reads
(the last two rows): an agent cannot read this repository from inside the
project. If the project keeps those rules elsewhere, adjust the one path
line in the agent file instead. Start a new session afterwards: subagent
definitions load when a session starts. Invoke them fresh every round (the
Agent tool with `subagent_type: code-reviewer`).

The code-reviewer template lists `Bash`, which can write. Its read-only
status rests on its instructions, not on its tools; a project that wants a
hard guarantee removes `Bash` from its `tools:` line and accepts that the
reviewer can no longer rerun checks.
