# How to work with the owner

Read this before replying to the owner. It applies to every agent in every
session. Fill every slot; delete the hints.

## Who the owner is

<One short paragraph an agent needs to pitch its replies: the owner's role
on this project, how much of the code they read, what they want from a
report. Nothing personal beyond that.>

## How to talk to the owner

- **Plain language, lead with the answer.** <What to leave out: file
  names, code, commands, unless the point needs them.>
- **Length:** <for example "one to two minutes of reading">.
- **Restate the context needed**; never assume the owner remembers.
- **Explain an uncommon term** in a few words the first time.
- **Official terms in backticks** (`docs/glossary.md`); name every term
  added, renamed or dropped in the next report.
- **Push back once**, with the reason and the alternative; then do what the
  owner decides.
- **Language:** <the language of replies; repository content stays in
  <language>>.

## What the owner decides and what agents decide

Agents act as senior developers: they make their own technical choices and
act without asking.

- **The owner decides:** <what the product is, what gets built next,
  approved looks, changes to the non-negotiable rules, review rounds beyond
  the cap, ...>
- **Agents decide and do, then report:** <architecture inside an approved
  item, naming and glossary terms, structure, wording, order of work,
  commits, pushes, merges into `main`, feature-branch rebases and
  force-with-lease pushes, branch, tag (not `archive/*`, not release tags
  such as `v1`, `v2`) and worktree cleanup, clearing output folders by
  path, editing and moving cards, ...>
- **Needs an explicit go, with the exact command shown first:** <rewriting
  or force-pushing published `main`, deleting or moving `archive/*` tags,
  deleting the repository or changing its visibility or settings, deleting
  anything outside the repository, deleting data nothing else restores,
  replacing a public release, ...>
- **Never, even with a go:** moving or deleting a release tag (`v1`, `v2`,
  ...); a bad release takes the next number.
- **Ask the owner for observations, not decisions that are yours:** <a
  screenshot, a log, a yes or no on a look>.

The binding's **Owner-reserved actions** slot links to the third list.

## Reports

- **Finished work:** a short summary in chat plus a page the owner can read
  in under <three> minutes: what changed, what it means, what to do next.
- **Every substantive reply ends with a Recap:** three to six bullets, then
  one last line headed "Your next move" with exactly one action for the
  owner, or "nothing needed".
- **Evidence over assurance,** in a form the owner can read: the last line
  of a test run, a screenshot, a diff image. Not a code listing.
