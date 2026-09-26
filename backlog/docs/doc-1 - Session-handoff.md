---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-25 18:26'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-25, Backlog.md adoption, Backlog.md board adapter, agent-context merge (claude)

## Where things stand
- v6 released and current (83f4694): the app reads Backlog.md boards
  (TASK-16, Done). This repository tracks its work in `backlog/`.
- Agent context: `docs/owner.md`, `.local/preferences/owner-profile.md`
  (local only), reviewer agents in `.claude/agents/`, practices upgraded.
- No task carries `night-ready` yet: nothing is decided enough for a night.

## Next, in order
1. With the owner: pick which of TASK-1..3 (outcome, ask/resolve, init
   helpers) become Night-ready, and write their card headers.
2. TASK-4: run a first real night and file the friction.

## Parked owner decisions
- The four `Idea:` tasks (TASK-12..15) wait for the owner.
- Whether `Adopter`s should get the upgraded templates re-copied
  (they do not update themselves).

## Machine facts
- Backlog.md 1.52.0 is installed globally. `backlog task create -s "<active
  status>"` needs `--plan`; `backlog doc update` takes no `--plain`.
- `.night-shift/project.json` (local) points the app at this backlog:
  `night-shift serve . --open`.
- No Playwright in this repo; the walk script in
  `.local/evidence/2026-09-25-backlog-adapter/walk.mjs` borrows a sibling
  checkout's install.

## Pitfalls
- The RTK shell hook can swallow command output; use `rtk proxy <cmd>` when
  a result looks empty.

## Constraints in force
- The protocol is a v1 trial; the contract stays `/1` (the backlog board was
  additive).
