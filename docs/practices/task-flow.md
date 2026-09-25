# Task flow

Read this before creating, moving or closing a card.

## One home per fact

- **The card is the task record.** Brief, acceptance, result, review links
  and handoff live on the card ([templates/task-card.md](../../templates/task-card.md)).
- One authoritative home per task, decision and rule. No second status
  file, dashboard or backlog. When a summary is needed, derive it from the
  sources on demand; a saved status report is a dated snapshot, never an
  authority.
- Task ids are short kebab-case slugs that start the card name:
  `csv-export: export orders as CSV`.
- A small fix may use its commit body as the record. Multi-session work,
  contract changes and migrations get a card.

## Stages

| Stage | Required outcome |
|---|---|
| Queued | A useful outcome, scope and observable acceptance criteria. A Queued card that meets the Night-ready contract carries the Night-ready label. |
| Active | One holder (a session or builder, named in the card's `Held by` field) works in small, coherent changes. |
| Review | Author checks are done; a fresh Reviewer examines the exact change ([review.md](review.md)). |
| Ready | Acceptance, required checks and review all pass. |
| Done | The change reached its integration branch, the push and CI result are confirmed, evidence is recorded. |

**Ready is not Done.** Ready means built, verified and reviewed. Done means
integrated and confirmed. A child task reaching a feature branch is not the
feature reaching `main`. A card moving to Done proves nothing by itself.

## Side states

- **Blocked.** The card keeps its stage, gains the blocked label and a
  `## Blocked` section: the reason, a link to what it waits on, and the
  condition that unblocks it. The label comes off only when that condition
  is met. At night, a blocked card also gets an Outcome with
  `status: blocked` ([protocol.md](../protocol.md#9-outcomes)).
- **Cancelled.** The card moves to Done with a `## Cancelled` section: the
  date, the reason, who decided, and what (if anything) was kept. Cancelled
  work never counts as delivered.

```markdown
## Cancelled
2026-10-02. Payments provider dropped the refund API; owner decided in the
Morning Review. Kept: the refund button component (unused, on `main`).
```

## Acceptance

- Acceptance describes product behaviour, not functions to write: "a
  shopper filtering by size M sees only items in stock in M", not "add
  `filterBySize()`".
- Each item names the evidence that will prove it (a test, a screenshot,
  a command's output).
- A material scope change records its decision and reason on the card, so
  acceptance cannot quietly shrink around unfinished work.
- An out-of-scope discovery gets one line on the card and, if it matters,
  its own Queued card.

## One writer per checkout

- One agent writes in a checkout at a time.
- Parallel work runs in separate worktrees, each held by a named session
  or builder (`Held by`) and with a reason. At night, only cards whose
  Touches do not overlap run in parallel
  ([night rules](../protocol.md#6-night-rules)).

## At night

The protocol's night rules sit on top of this flow: the builder removes the
Night-ready label and moves the card to Active before starting, carries it
to Done (`build`), leaves it for the owner as `needs-eyes` (`explore`:
nothing integrated), or blocks it, and posts one Outcome per card. A question the card does
not answer blocks the card; it is never guessed.
