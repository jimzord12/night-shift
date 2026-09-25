# Git

Read this before committing, pushing, branching, integrating or tagging.

## Agents own routine Git

- The working agent commits, pushes, branches, merges authorised work into
  `main`, rebases and cleans up branches and worktrees **without asking**,
  and reports what it did.
- Only an explicit owner instruction ("I will handle Git this session")
  suspends this, for that session.
- Routine Git never approves a pending product design; the owner still
  decides those ([owner.md](owner.md)).

## Branches

- `main` is always releasable: the suite passes.
- Small, low-risk changes and docs go **straight to `main`** once they pass
  the required checks and the review gate (or record the small-change path
  in the commit, [review.md](review.md)).
- New features, migrations, significant changes and work of uncertain
  readiness go on a short-lived `<type>/<topic>` branch:
  `feat/search-filters`, `fix/cart-rounding`, `docs/checkout-guide`.
- **One topic per branch.** A branch that grows a second topic is split.
- Parallel work: separate worktrees, one writer per checkout, each held by
  a named session or builder (the card's `Held by`).
- A child task reaching its feature branch is not the feature reaching
  `main`; record the intended target on the card.

## Integration

- **No pull requests by default.** Review and verification live on the card
  and in the commits; a PR is not the review.
- Run the required checks and pass the review gate (or record the
  small-change path in the commit) before pushing to `main`.
- Fetch before integrating; preserve others' work. Prefer fast-forward or
  ordinary merges. Never force a push to resolve divergence.
- **Watch CI by commit SHA**, not by branch (a branch query can return the
  previous commit's run):

```sh
gh run list --commit 3f2a1c9 --limit 1     # repeat until the run is listed
gh run watch <run-id> --exit-status
```

- If CI is unavailable, the card stays in Ready, not Done, and its Outcome
  says CI could not be checked. A failed run is investigated before
  anything is called done.
- Never bypass hooks or remote protections.

## Commits

- Stage the intended files explicitly and read the staged diff. Never sweep
  in unrelated work, secrets, personal data or local preference files.
- Small, coherent commits; each one builds.
- Conventional Commits, imperative, first line under 72 characters. The
  body says why and names the evidence.

```text
feat: filter the catalogue by colour and size

Shoppers asked for it in every support thread this month.
Evidence: builds/tests-20260925-0312/ (suite passes), filters.png.
```

## Protected refs

Agents may amend, rebase, reset and `--force-with-lease` a feature branch,
and delete ordinary tags and branches that are merged, or abandoned ones
they created themselves. Never:

- delete a branch during a Night Shift while other builders run: an
  unmerged branch may be another builder's work in progress;
- rewrite or force-push published `main`;
- move or delete an `archive/*` tag (a snapshot before a large removal);
- move or delete a release tag (`v1`, `v2`, ...): a bad release takes the
  next number;
- run `git clean -x` or `-X`: they also wipe ignored folders that may hold
  data nothing else restores. Clear output folders by path.

Anything the project's owner file lists as needing an explicit go stays
with the owner, with the exact command shown first.
