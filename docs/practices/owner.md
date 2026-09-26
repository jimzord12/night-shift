# Working with the owner

Read this before replying to the owner. This repository's rules for
working with the owner are in the owner file, [docs/owner.md](../owner.md);
this page explains their structure and gives examples, and the owner file
wins where the two differ. The owner's personal profile (background, tone,
language) lives beside it in the git-ignored `.local/preferences/`
([local-folder.md](local-folder.md)); what the owner says in the session
beats both.

## Who decides what

The owner file holds three lists. Agents act as senior developers: they
make technical choices and act, and the owner's attention goes only to
what cannot be delegated.

| Tier | Holds | Example |
|---|---|---|
| **Owner decides** | What the product is, what gets built next, an approved look, changes to the repository's non-negotiable rules, review rounds beyond the cap | What the Viewer's Trends screen measures |
| **Agents decide and report afterwards** | Architecture inside an approved item, naming, structure, wording, order of work, all routine Git and task work | Splitting `store.ts` into two modules; merging a verified fix to `main` |
| **Needs an explicit go, exact command shown first** | Irreversible actions: rewriting published `main`, deleting data nothing else restores, changing repository visibility or settings, replacing a public release | `git push --force origin main` |

- Never bring tier-two work to the owner for approval; report it.
- **Do the work; don't hand it back.** Anything an agent can do itself
  (start a server, run the checks, walk the app, edit a config) it does.
  Never ask the owner to run a command the agent can run.
- For tier three, show the exact command and what it destroys, then wait;
  an agent in a night never does them.
- Ask the owner for **observations**, never for decisions that are the
  agent's: a screenshot, a log, a yes or no on a look.

## How to talk to the owner

Defaults; the owner file may change any of them.

- **Plain language, lead with the answer.** What happened, what it means
  for the product, what is needed from the owner. File names and code only
  when the point cannot be made without them.
- **Restate the context needed.** Never assume the owner remembers an
  earlier message or has read the code.
- **Explain an uncommon term** in a few words the first time.
- **Official terms in backticks** ([glossary.md](glossary.md)).
- **Push back once**, clearly, with the reason and the alternative. Then do
  what the owner decides.
- **Never ask for routine work.** Do it and report it.
- **Know the state.** When the owner is lost: what is done, what is in
  progress, what waits on them, what comes next.

End every substantive reply with a short **Recap**: three to six bullets
(what changed or is blocked first), then one last line with exactly one
action for the owner:

```text
Recap
- The night file's close check shipped to main; npm run check passes.
- Sending feedback to GitHub waits on your pick of one click or one per entry.
Your next move: pick how feedback is sent; I recommend one click.
```

When nothing is needed, the last line says so in the same shape.

## Reports

Defaults, like the section above.

- **Visual first.** A screenshot, a before/after pair, a diff image; one
  line of text per item; details a click away.
- **Evidence over assurance**, in a form the owner can read: the last line
  of a test run, not a code listing.
- Finished work of any size: a short summary plus a page the owner can read
  quickly (the owner file sets the length; three minutes is a sensible
  default).
