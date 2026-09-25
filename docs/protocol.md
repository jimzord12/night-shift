# The Night Shift Protocol

Version 1 (trial). A way of working between one owner and a team of AI
agents: decide and design by day, let the agents build at night, review the
result in the morning. Project-neutral: everything a project decides for
itself (its board, its test command, its review gate) lives in that
project's **binding**, never here.

## 1. Why

The owner's attention is the scarcest resource; agent hours are cheap and
plentiful at night. So the owner spends attention only where it cannot be
delegated (product decisions, design taste, final approval) and hands the
agents work that needs nobody watching. Work that is not fully decided is
not handed over: an agent that guesses a decision at 3 a.m. costs more in the
morning than the night saved.

## 2. Roles

| Role | Who | Does |
|---|---|---|
| Owner | the human | decides, designs, approves; reads the morning review |
| Lead | the agent in the day session | runs the Day Shift with the owner, writes the cards |
| Builder | an agent at night | takes one card, builds, tests, gets it reviewed, integrates |
| Reviewer | a fresh agent | reviews a builder's change against the project's review gate |

## 3. The cycle

```text
Day Shift ──> Night-ready cards (the buffer) ──> Night Shift ──> Morning Review ──┐
    ^                                                                          │
    └────────────────────── answers, new ideas, approvals ─────────────────────┘
```

1. **Day Shift.** Owner and lead brainstorm, analyse, decide and design.
   Output: cards that meet the Night-ready contract (section 4), and answers
   to open questions.
2. **Night Shift.** Builders take Night-ready cards in the owner's order,
   one card per builder, and carry each to integrated or blocked. They never
   make a decision that belongs to the owner: they raise a question, block
   the card and move on (section 6).
3. **Morning Review.** The owner opens the Night Shift app, looks at what
   shipped (renders, before/after, links), answers the night's questions and
   approves or rejects design options. The next Day Shift starts from there.

## 4. The Night-ready contract

A card may carry the project's Night-ready label only when all of this holds:

| Field | Holds |
|---|---|
| Outcome | One sentence: what exists afterwards that does not exist now. |
| Decisions | Every product and design decision is made and written on the card. None is left for the night. |
| Acceptance | Checks a reviewer can verify: tests, a render, a pixel gate, a command's output. |
| Touches | The folders or files the work changes, in the card header (section 7). Two cards that touch the same place never run in parallel. |
| Kind | `build` (finished and integrated overnight) or `explore` (produces options for the owner to choose from in the morning; nothing is integrated). |
| Size | `S` (under an hour), `M` (a few hours), `L` (most of a night). Anything bigger is split. |
| Evidence | What the builder attaches for the morning: a render, a before/after pair, a test summary, a link. |
| Owner gates | None for `build`. For `explore`, "morning review". |

Design work is never `build` on its first night: taste is the owner's, so a
design card is `explore` until the owner has picked an option.

## 5. The buffer

The buffer is read like an engine's rev counter, not a fuel tank: more is
better only up to a point.

| Zone | Share of the scale (`buffer.max`, default 20) | Meaning |
|---|---|---|
| Idle | below `buffer.low` (default 5) | too few cards for a night: call a Day Shift |
| Warming up | up to 70% | room for more |
| Sweet spot | 70% to 80% (14 to 16 cards by default) | aim here: two to three nights of work, still fresh |
| Running hot | 80% to 90% | enough: finish before adding |
| Redline | 90% and above | too much queued: decisions go stale before the nights reach them |

- A night realistically clears 5 to 8 medium cards, so the sweet spot lasts
  two to three nights; the Day Shift is then not a daily obligation.
- The order of the buffer is the owner's: it is set in the Day Shift or by a
  `rank` question in the morning (section 8).

## 6. Night rules

1. Take the next Night-ready card in order; remove its Night-ready label and
   move it to the board's working stage before starting.
2. Run in parallel only cards whose Touches do not overlap, each in its own
   worktree or branch.
3. Follow the project's own development and review rules to the letter. The
   night changes who is watching, not the quality bar. Those rules are the
   Night Shift practices
   (<https://github.com/jimzord12/night-shift/tree/main/docs/practices>)
   unless the binding overrides one.
4. **Never guess a decision.** When the card does not answer something the
   work depends on: write a question (section 8), mark the card blocked,
   and move to the next card.
5. Stop a card, not the night: a failing test that is not understood after
   honest effort, a review that keeps failing, or a missing permission
   blocks that card with an outcome saying why.
6. Never do anything the binding lists as owner-reserved, however obvious
   it looks at 3 a.m.
7. Before finishing, post one outcome per card touched (section 9) and run
   `night-shift check` on the project.

## 7. The card header

A line of a Night-ready card's description, by convention the first:

```text
night-shift: kind=build size=M touches=src/search,tests
```

`touches` is a comma-separated list of repository paths (folders or files),
with no spaces.
Missing fields are shown as unknown in the app; `night-shift check --board`
reports them.

## 8. Questions

A question is a file the lead or a builder writes and the owner answers in
the app: `.night-shift/questions/<id>.json` in the project (contract:
`night-shift docs contract`). Five kinds:

| Kind | The owner | Example |
|---|---|---|
| `confirm` | says yes or no | "Delete the legacy wrappers now?" |
| `one` | picks one option | "ISO dates or local dates in the export?" |
| `many` | picks several | "Which of these five sections stay?" |
| `rank` | orders the options | "Tonight's order" |
| `text` | writes a short answer | "What should the tagline say?" |

Any option may carry an image; when every option has one, the app shows
picture tiles. Every question states the asker's recommendation and why; the
app preselects it. The owner may also answer "not now" (deferred) and add a
note to any answer.

The file has one writer per field: the asker writes the question and later
`resolved`; the app writes only `answer`. Once the asker has acted on the
answer it fills `resolved` (when, and what it became), and the app shows the
question as done.

## 9. Outcomes

After each card, the builder posts one comment on the card, in this exact
shape (a code block is fine), and uploads any images it names as card
attachments:

```text
night-shift outcome/1
shift: 2026-09-25-night
status: shipped
review: PASS (2 rounds)
line: Checkout now says what went wrong and how to fix it.
commits: abc1234, def5678
evidence: compare before.png after.png | The declined-card screen, before and after
evidence: image mobile.png | The same screen on a phone
evidence: link https://github.com/o/r/actions/runs/1 | CI run
questions: 2026-09-25-night-03
```

- `status`: `shipped` (integrated), `needs-eyes` (done, but the owner must
  look before it counts: every `explore` card), `blocked` (stopped; `line`
  says why), `skipped` (not started; `line` says why).
- `shift`: `<date the shift started>-night` or `-day`.
- Only `shift`, `status` and `line` are required.
- Uploaded evidence goes to the board, an external service: only material
  the binding allows there (never private or personal data).

## 10. The Morning Review

The owner runs `night-shift serve <project>` and sees, in this order: the
last shift's outcomes as tiles (green shipped, amber needs-eyes, red
blocked), the open questions as a deck, and the buffer on its rev counter.
Older shifts stay one click away. The review is meant to cost the owner
little attention: visual first, one line of text per item, details on click.

## 11. Bindings

A project adopts the protocol by filling these slots in its own docs and in
`.night-shift/project.json`:

| Slot | Example |
|---|---|
| Board and adapter | a Trello board, or Backlog.md in the repository; label `Night-ready` |
| Working, blocked and done stages | lists Active, Done; label Blocked |
| Test command | `npm test` |
| Review gate | a fresh reviewer agent per the project's review rules |
| Branch and integration policy | small changes to `main`, the rest on branches |
| Owner-reserved actions | the project's list of what agents never do |
| Where evidence may go | screenshots of test data only |
| Notification at the end of a night | a push message |
| Practices overridden | none, or `review` replaced by the project's `docs/review.md` |

`night-shift docs binding` prints a template.

The protocol ships default working practices (task flow, orientation and
handoff, the review gate, evidence, Git, glossary, proposals, board
discipline) with copy-ready templates:
<https://github.com/jimzord12/night-shift/tree/main/docs/practices>. The
copy that matches an installed release lives under its tag, for example
`https://github.com/jimzord12/night-shift/tree/v1/docs/practices`. A
binding adopts them as they are or names the ones it overrides.

## 12. Changing the protocol

The protocol is versioned by the repository's release tags. A project's
binding names the version it follows. Friction found while using it is
recorded in the project and proposed back here; nothing in the protocol is
changed silently.
