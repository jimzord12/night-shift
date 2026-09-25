# Binding template

Copy this into the project's own docs (for example `docs/night-shift.md`)
and fill every slot. The protocol (`night-shift docs protocol`) stays
generic; everything specific to the project lives here.

```markdown
# Night Shift binding: <project>

Follows the Night Shift Protocol <vN>.

| Slot | This project |
|---|---|
| Board and adapter | <board name and URL>; adapter `<trello|file>`; Night-ready label `<name>` |
| Stages | queued: <list>; working: <list>; blocked: <label or list>; done: <list> |
| Test command | `<command>` |
| Review gate | <who reviews, where the rules are> |
| Branch and integration | <what goes straight to main, what uses a branch> |
| Owner-reserved actions | <link to the list agents must never do> |
| Where evidence may go | <what may be uploaded to the board, what never> |
| End-of-night notification | <how the owner is told the night is over> |
| Worktrees | <where parallel builders work> |
| Practices overridden | <none, or each Night Shift practice replaced and the project doc that replaces it> |
```

Then create `<project>/.night-shift/project.json` (see
`night-shift docs contract`), add `.night-shift/` to the project's
`.gitignore`, and create the Night-ready label on the board.
