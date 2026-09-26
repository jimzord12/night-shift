# Glossary

The official terms of the Night Shift Protocol. Use them, never a synonym;
wrap them in backticks when talking to the owner. Agents keep this list
current without asking and name every added, renamed or dropped term in their
next report (docs/practices/glossary.md).

## Terms

| Term | Meaning | In code or files | Added |
|---|---|---|---|
| `Night Shift Repo` | This repository and everything it ships: the protocol, the contract, the app, the practices and the templates | github.com/jimzord12/night-shift | 2026-09-26, owner |
| `Adopter` | Another project that runs the `Night Shift Protocol`; what it holds is its `Binding` and its `.night-shift/` folder | an adopting project's `docs/night-shift.md` and `.night-shift/` | 2026-09-26, owner |
| `Night Shift Protocol` | The way of working: decide by day, agents build unattended at night, the owner reviews in the morning | docs/protocol.md | 2026-09-25 |
| `Owner` | The human who decides, designs and approves | protocol section 2 | 2026-09-25 |
| `Lead` | The agent in the day session that runs the `Day Shift` with the `Owner` | protocol section 2 | 2026-09-25 |
| `Builder` | An agent that takes one `Night-ready` card at night and carries it to an `Outcome` | protocol section 2 | 2026-09-25 |
| `Reviewer` | A fresh agent that reviews a `Builder`'s change | docs/practices/review.md | 2026-09-25 |
| `Day Shift` | A session where the `Owner` and the `Lead` decide and design and produce `Night-ready` cards | protocol section 3 | 2026-09-25 |
| `Night Shift` | Agents building `Night-ready` cards unattended | protocol section 6 | 2026-09-25 |
| `Morning Review` | The `Owner`'s pass over a shift in the app: `Outcome`s, open `Question`s, the `Buffer` | `night-shift serve` | 2026-09-25 |
| `Night-ready` | A card with nothing left to decide; carries the board label of that name and a `Card Header` | protocol section 4 | 2026-09-25 |
| `Card Header` | The line `night-shift: kind=… size=… touches=…` in a card's description | src/parse.ts | 2026-09-25 |
| `Buffer` | The `Night-ready` cards waiting for a `Night Shift`, read on a rev counter: idle, warming up, sweet spot, running hot, redline | `buffer` in project.json; `bufferZone` | 2026-09-25 |
| `Question` | A decision an agent needs from the `Owner`, as a file answered in the app; open until resolved | `.night-shift/questions/<id>.json` | 2026-09-25 |
| `Outcome` | What happened to one card in one shift (shipped, needs-eyes, blocked, skipped), posted as a card comment | `night-shift outcome/1` | 2026-09-25 |
| `Shift Id` | `<date the shift started>-night` or `-day` | contract | 2026-09-25 |
| `Binding` | A project's answers to the protocol's slots: board, test command, review gate, owner-reserved actions | docs/binding.md | 2026-09-25 |
| `Board Adapter` | The code that reads one kind of board for the app: Trello, Backlog.md, or a demo file | src/board/ (`trello`, `backlog`, `file`) | 2026-09-25 |
| `Owner File` | A project's shared, committed rules for working with its `Owner`: who decides what, how to report | `docs/owner.md` (templates/owner.md) | 2026-09-25 |
| `Owner Profile` | The `Owner`'s personal preferences, kept out of the repository; read before the first reply of a session | `.local/preferences/` (git-ignored) | 2026-09-25 |
| `Backup Tag` | A local tag on a branch's old tip, made before a command drops commits or deletes an unmerged branch, so nothing is lost for good | `backup/<branch>-<yyyymmdd-hhmm>` | 2026-09-25 |
| `Practice` | A default way of working in docs/practices/ that a `Binding` may override | docs/practices/ | 2026-09-25 |
| `Release` | A tagged version `vN` installed under `~/.night-shift/releases/` and run by the launcher | scripts/release.ts | 2026-09-25 |

## Words with two meanings

| Word | Say instead |
|---|---|
| "decision" for an open choice | `Question` (a decision is settled) |
| "owner" for the agent holding a card | "held by" (the `Owner` is the human) |
| "project" for this repository | `Night Shift Repo` ("project" is the `Adopter`, as in `project.json`) |
| "adopting project", "instance" | `Adopter` |
| "buffer" in code about bytes | only in code; in prose `Buffer` is the queue |

## Dropped

| Term | Dropped | Use instead |
|---|---|---|
| `Prep Session` | 2026-09-25, before first use | `Day Shift` |
| `Night Run` | 2026-09-25, before first use | `Night Shift` |
| `Decision` (for a question file) | 2026-09-25, owner | `Question` |
| fuel gauge | 2026-09-25, owner | the `Buffer`'s rev counter |
| `Night Shift project` | 2026-09-26, owner: "project" already means the `Adopter` (`project.json`) | `Night Shift Repo` |
| `Night Shift instance` | 2026-09-26, owner: nothing runs as a copy; the project uses the protocol | `Adopter` |
