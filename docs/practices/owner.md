# Working with the owner

Read this before replying to the owner. Each project fills its own copy
([templates/owner.md](../../templates/owner.md)) as `docs/owner.md`; this
page explains the structure and the defaults. The owner's personal
profile (background, tone, language) lives beside it in the git-ignored
`.local/preferences/` ([local-folder.md](local-folder.md)); what the owner
says in the session beats both.

## Who decides what

The project's owner file holds three lists. Agents act as senior developers:
they make technical choices and act, and the owner's attention goes only to
what cannot be delegated.

| Tier | Holds | Example (Lighthouse) |
|---|---|---|
| **Owner decides** | What the product is, what gets built next, an approved look, changes to the project's non-negotiable rules, review rounds beyond the cap | Whether checkout offers guest accounts |
| **Agents decide and report afterwards** | Architecture inside an approved item, naming, structure, wording, order of work, all routine Git and board work | Splitting `cart.ts` into two modules; merging a verified fix to `main` |
| **Needs an explicit go, exact command shown first** | Irreversible actions: rewriting published `main`, deleting data nothing else restores, changing repository visibility or settings, replacing a public release | `git push --force origin main` |

- Never bring tier-two work to the owner for approval; report it.
- **Do the work; don't hand it back.** Anything an agent can do itself
  (start a server, run the checks, walk the app, edit a config) it does.
  Never ask the owner to run a command the agent can run.
- For tier three, show the exact command and what it destroys, then wait.
- The binding's **Owner-reserved actions** slot links to tier three
  ([binding.md](../binding.md)); a builder never does them at night.
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
- search-filters shipped to main; suite passes (builds/tests-20260925-0312/).
- csv-export blocked on the date-format Question.
Your next move: answer the date-format Question in the Morning Review.
```

When nothing is needed, the last line says so in the same shape.

## Reports for the Morning Review

Defaults, like the section above.

- **Visual first.** A screenshot, a before/after pair, a diff image; one
  line of text per item; details a click away.
- **Evidence over assurance**, in a form the owner can read: the last line
  of a test run, not a code listing.
- Finished work of any size: a short summary plus a page the owner can read
  quickly (the owner file sets the length; three minutes is a sensible
  default).
