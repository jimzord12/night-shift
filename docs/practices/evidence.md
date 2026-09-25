# Evidence

Read this before calling anything done.

## Evidence before done

A change is done when its checks pass, the evidence location is named, and
a visible change has a screenshot or render someone looked at. "It should
work" is not a state.

- The claim names the exact revision it was checked on.
- An old artefact is not current proof; a missing one is no proof at all.
- A reviewer never manufactures the author's missing evidence and calls it
  independent proof ([review.md](review.md)).

## What counts

| Evidence | Example |
|---|---|
| Suite output path | `builds/tests-20260925-0312/summary.txt`, exit 0 |
| Screenshot or render | `builds/shots-20260925-0320/checkout-declined.png` |
| Before/after or diff image | `before.png`, `after.png`, `diff.png` of the cart page |
| CI run, found by commit SHA | `gh run list --commit 3f2a1c9 --limit 1`, then `gh run watch <id> --exit-status` |
| A command and its result | `curl -s localhost:3000/api/orders.csv \| head -3` with the output |

Give the owner evidence they can read: the last line of a test run, a
screenshot, a diff image. Not a code listing. At night these become the
`evidence:` lines of the Outcome ([protocol.md](../protocol.md#9-outcomes)).

## New folder per run

- Every script, build and test run writes into a **new timestamped folder**
  (for example `builds/tests-<yyyymmdd-hhmm>/`) and **refuses to run if the
  folder exists**.
- Outputs are never overwritten. A deliverable is replaced only by a
  deliberate commit with a new version.
- The output folder is ignored by Git. Clear it by path when it is no
  longer needed, keeping evidence that active work still points to.
- Name artefacts honestly: `checkout-after-fix.png`, not `final.png`.

## Tests

- **A test that would pass with the feature deleted is not written.**
- For each changed test, know the behaviour it protects and that it would
  fail if that behaviour broke. A recorded failure before the fix is the
  best proof.
- Prefer one test through the real path (real database, real HTTP route)
  over several tests against a mock.
- Negative cases assert on the error message text, not only on "it threw".
- Never delete or neuter source in the working checkout to prove a test
  fails; use an isolated copy.
