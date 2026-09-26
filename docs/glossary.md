# Glossary

The official terms of the `Night Shift Repo`. Use them, never a synonym;
wrap them in backticks when talking to the owner. Agents keep this list
current without asking and name every added, renamed or dropped term in their
next report (docs/practices/glossary.md). Terms from docs/design.md (D20)
name what v7 builds.

## Terms

| Term | Meaning | In code or files | Added |
|---|---|---|---|
| `Night Shift Repo` | This repository and everything it ships: the `night-shift` tool, the two skills, the `Viewer`, and its own practices | github.com/jimzord12/night-shift | 2026-09-26, owner |
| `Adopter` | A repository where Night Shift has been installed (`night-shift install`) | its `.night-shift/` folder | 2026-09-26, owner |
| `Owner` | The person using Night Shift: decides, answers the `Question`s, reads each `Night`; for this repository, its owner | `docs/owner.md` | 2026-09-25; redefined 2026-09-26, owner |
| `Lead` | The agent in the `Owner`'s session that runs the work and briefs subagents (`Reviewer`s, idea agents) | docs/practices/review.md, docs/practices/idea-loop.md | 2026-09-25; redefined 2026-09-26 |
| `Reviewer` | A fresh agent that reviews another agent's change | docs/practices/review.md, `.claude/agents/` | 2026-09-25 |
| `Night` | One unattended agent session, whenever it runs | a night id such as `2026-09-26-a` | 2026-09-26, owner |
| `Plan` | The agent's promise at the start of a `Night`: the tasks and what "done" means for each | `.night-shift/nights/<night id>/plan.json`, schema `night-shift/plan@1` | 2026-09-26, owner |
| `Night file` | The single record of one `Night`: the `Plan`'s tasks with their `Outcome`s, `Question`s, `Feedback`, metrics | `night.json`, schema `night-shift/night@1`; copies in `.night-shift/history/` | 2026-09-26, owner |
| `Outcome` | One of six values a task ends a `Night` with: `done`, `partial`, `blocked`, `failed`, `not_started`, `skipped` | `tasks[].outcome` in the `Night file` | 2026-09-25; redefined 2026-09-26, owner |
| `Block` | One item of the fixed vocabulary for evidence and notes in a `Night file`: `image`, `compare`, `video`, `pdf`, `link`, `command`, `note` | `type` of an `evidence[]` entry | 2026-09-26, owner |
| `Question` | An entry in the `Night file` that the `Owner` answers in the `Viewer` | `questions[]` in the `Night file` | 2026-09-25; redefined 2026-09-26, owner |
| `Feedback` | Friction with Night Shift an agent logs in the `Night file`; the `Owner` may send it to GitHub as an issue labelled `proposal` | `feedback[]` in the `Night file` | 2026-09-26, owner |
| `Follow-up file` | What the `Owner` hands to the next agent: unfinished tasks plus the `Owner`'s decisions | schema `night-shift/follow-up@1` | 2026-09-26, owner |
| `Viewer` | The local app that shows every `Night` of every registered repository | `web/` | 2026-09-26, owner |
| `Meter` | The part of the tool that reads the harness's logs and writes the metrics | docs/design.md, "Meter" | 2026-09-26, owner |
| `Owner File` | A repository's shared, committed rules for working with its `Owner`: who decides what, how to report | `docs/owner.md` | 2026-09-25 |
| `Owner Profile` | The `Owner`'s personal preferences, kept out of the repository; read before the first reply of a session | `.local/preferences/` (git-ignored) | 2026-09-25 |
| `Backup Tag` | A local tag on a branch's old tip, made before a command drops commits or deletes an unmerged branch, so nothing is lost for good | `backup/<branch>-<yyyymmdd-hhmm>` | 2026-09-25 |
| `Practice` | One of this repository's own ways of working | docs/practices/ | 2026-09-25; redefined 2026-09-26 |
| `Release` | A tagged version `vN` installed under `~/.night-shift/releases/` and run by the launcher | scripts/release.ts | 2026-09-25 |

## Words with two meanings

| Word | Say instead |
|---|---|
| "night shift" for one session | `Night`; Night Shift is the product |
| "decision" for an open choice | `Question` (a decision is settled) |
| "owner" for the agent holding a task | "assignee" (the `Owner` is the human) |
| "project" for this repository | `Night Shift Repo` ("project" is an `Adopter`) |
| "adopting project", "instance" | `Adopter` |

## Dropped

| Term | Dropped | Use instead |
|---|---|---|
| `Prep Session` | 2026-09-25, before first use | none, like `Day Shift` |
| `Night Run` | 2026-09-25, before first use | `Night` |
| `Decision` (for a question file) | 2026-09-25, owner | `Question` |
| fuel gauge | 2026-09-25, owner | none, like `Buffer` |
| `Night Shift project` | 2026-09-26, owner: "project" already means the `Adopter` | `Night Shift Repo` |
| `Night Shift instance` | 2026-09-26, owner: nothing runs as a copy | `Adopter` |
| `Night Shift Protocol` | 2026-09-26, owner (D20): no process is imposed; Night Shift is files of a fixed shape, a tool, two skills and the `Viewer` | none |
| `Day Shift` | 2026-09-26, owner (D20): how the `Owner` plans stays theirs | none |
| `Builder` | 2026-09-26, owner (D20): one agent runs a `Night` | "the agent" |
| `Morning Review` | 2026-09-26, owner (D20) | the `Viewer`'s morning page |
| `Night-ready` | 2026-09-26, owner (D20): Night Shift no longer reads a board | `Plan` |
| `Card Header` | 2026-09-26, owner (D20) | the `Plan`'s `done_when` |
| `Buffer` | 2026-09-26, owner (D20): no queue of cards to measure | none |
| `Shift Id` | 2026-09-26, owner (D20) | the night id (`2026-09-26-a`) |
| `Binding` | 2026-09-26, owner (D20): nothing is required of an `Adopter` beyond the file shapes and the tool | none |
| `Board Adapter` | 2026-09-26, owner (D20): Night Shift no longer reads a board | none |
| `Night Shift` (for a session) | 2026-09-26, owner (D20) | `Night` |
