# Proposals, trials and friction

Read this before changing how the team works: a rule, a gate, a workflow.
Nothing that governs work is changed silently.

## Where proposals live

- `docs/proposals/<short-name>.md`; rejected ones move to
  `docs/proposals/rejected/`. Applied and rejected proposals are kept so
  their reasons stay available.
- A rough idea stays a line on the card until it is ready for a decision.
- Each decision-ready proposal opens with this metadata (read it only from
  the opening block):

```yaml
---
kind: proposal        # or "reference" for supporting material with no status
status: pending
revision: 1
---
```

- Body: the problem, the smallest suggested change, its consequence, a
  recommendation, and the decision requested. Append short dated entries
  for owner decisions, trial results and application evidence.

## States

| Status | Meaning | Who moves it on |
|---|---|---|
| `pending` | Ready for an owner decision (also a finished trial) | Owner approves, rejects, defers or authorises a trial |
| `trial` | A scoped experiment is authorised | Agent records the result and returns it to `pending` at the end point |
| `approved` | Owner accepted this revision; not yet in effect | Agent applies and verifies it |
| `applied` | In effect, evidence linked | Closed; a later change is a new proposal |
| `rejected` | Declined; file moved to `rejected/` with the reason | Closed unless the owner reopens it |
| `deferred` | Left for later | Back to `pending` on request or a recorded revisit condition |

- Usual path: `pending -> approved -> applied`. Experiment:
  `pending -> trial -> pending`.
- **Silence does not change status.** An agent records decisions; it never
  invents approval.
- Approval covers the stated revision. A material change needs a new
  revision and a new decision.
- Orientation surfaces `pending` proposals to the owner with a one-line
  recommendation and link, and distinguishes `approved`-but-unapplied work
  from running trials.

## Trials

- A trial has a **named scope and an end point** (a date or a number of
  tasks). Trial permission is not approval.
- At the end point the variation stops applying to new work; the baseline
  returns. Expiry never authorises deleting or rolling back files.
- **One process trial per task**, so its effect stays readable.
- A trial may stop early on harm. It cannot grant itself an exception to
  safety, privacy or verification rules.

## Friction observations

When the process gets in the way, write it down where the work is recorded
(the card, or the current proposal):

```text
Friction (csv-export): the review brief needed the migration hash and the
card had no place for it; one round lost. Suggest a "Snapshot" line in the
task-card template.
```

- Concrete: the task, what happened, the consequence, a suggested next step.
- Check for an existing entry first. No quota: record what is real.
- One serious gap can justify a proposal; small annoyances wait for a
  repeat.
- Keep working unless the gap blocks the task. Never redesign the process
  mid-task and never change an active rule silently.
- Friction with the protocol itself is proposed back to the Night Shift
  repository ([protocol.md](../protocol.md#12-changing-the-protocol)).
