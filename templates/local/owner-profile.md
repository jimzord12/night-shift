# Owner profile

Copy to `.local/preferences/owner-profile.md` (git-ignored) and fill it with
the owner in one short conversation. Every agent reads this folder before
its first reply of a session, beside `docs/owner.md`. What the owner says in
the session wins, then this file, then `docs/owner.md`. This file never
changes who decides what: that stays in `docs/owner.md`. Never copy its
contents into the repository, a card, a report or a log. Delete the hints.

## Background

- <Role on this project, and how much code they read: for example "product
  owner; reads TypeScript and SQL comfortably, nothing else; does not read
  the code agents write">.
- <What they will not do: for example "no code-reading, debugging or
  verification chores">.
- <Memory between sessions: for example "assume nothing is remembered after
  a break; restate the context, never ask what they remember">.

## How to talk to them

- **Language:** <the language of replies; repository content stays in English>.
- **Tone:** <for example "casual, warm, plain; no corporate voice, no
  cheerleading">.
- **Length:** <for example "one to two minutes of reading; longer work
  splits into parts">.
- **Shape:** <for example "headings, bold labels, short bullets, small
  tables; a code block with a one-line brief for anything with a shape">.
- **Terms:** <for example "explain an uncommon term once, in brackets: sidecar
  [a companion metadata file]">.
- **Status:** <for example "on a fresh session or when lost: Goal / Now /
  Next / You, four short lines">.
- **Closing:** <for example "a Recap, and a last line 'Your next move' with
  one action">.

## What they do not want

- <for example "a plan when they asked for the work">
- <for example "being asked to run a command the agent can run">
- <for example "confidence the evidence does not support">

## Engineering stance

- <for example "delivery speed over textbook rigour: the smallest
  commercially sound result; no speculative architecture">
- <for example "tests exercise the real code; mocks only at true external
  boundaries">

Recorded <yyyy-mm-dd>. A lasting preference the owner states later is added
here with its date.
