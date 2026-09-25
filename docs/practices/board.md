# Board discipline

Read this before writing to the board, through any adapter or script. The
board holds the task records and the Outcomes the Morning Review reads, so
a lost or duplicated write costs the owner's attention.

## Writes

- **Read every write back.** A 200 response is not the evidence; the read
  is. Check the card's list, description, labels and checklist state.
- **Uncertain create** (a timeout, an empty response): before retrying,
  list the cards and look for the name you tried to create. Reuse it;
  never create a second card.
- Resolve lists, labels and cards by name at run time. Never hard-code
  their ids in a card or a doc.
- The session-handoff card is rewritten in place, never recreated. After
  writing, read it back and confirm the `**Written:**` line is yours
  ([orientation-and-handoff.md](orientation-and-handoff.md)).
- A card moving to Done proves nothing by itself ([task-flow.md](task-flow.md)).

## Backlog.md boards

- Change tasks with the `backlog` CLI, never by hand-editing the Markdown:
  the CLI keeps the section markers the app and other agents read.
- Pin the CLI version the project tested (`npm install --global
  backlog.md@<version>`); never run an unqualified `npx backlog`, which can
  resolve to an unrelated package.
- Outcome evidence is copied into `.night-shift/attachments/<task id>/`;
  the owner opens it through the app. For evidence that must also open on a
  phone, commit it next to the work or link the CI run.
- Do not run `backlog cleanup` before the Morning Review: it moves Done
  tasks to `completed/`, which the app does not read, so their Outcomes
  disappear from the review.
- Keep the tool's automatic commits and remote operations off
  (`auto_commit: false`, `remote_operations: false` in `config.yml`): the
  agent commits task changes with the work they describe.

## Links

Links on cards must open on a phone: the owner may review on a phone.

| Use | Never |
|---|---|
| `https://github.com/example/lighthouse/commit/3f2a1c9` | `C:\work\lighthouse\builds\tests-0312\` |
| `https://github.com/example/lighthouse/blob/main/docs/work/csv-export/reviews/01.md` | `/home/agent/lighthouse/docs/...` |
| The CI run URL | "see the local build folder" |

Images the owner must see go up as card attachments, named in the Outcome's
`evidence:` lines ([contract.md](../contract.md)). Only material the binding
allows on the board: never private or personal data.

## Credentials

- Credentials live in environment variables the shell already has.
- Send them **in request headers only**, never in the URL: some services
  echo the URL back in error bodies.
- Never put them in a card, a commit, a log, a screenshot or the chat.
- **Never assign them to shell variables in a command that is logged.** An
  agent's tool calls are logged, and a shell that fails on the command may
  print the value. Let the adapter read the environment itself.
- If they are missing, ask the owner to check the environment; never ask
  for the values.
- A helper script redacts credentials from its own error output.
