# Git

Read this before committing, pushing, branching, integrating or tagging.

## Agents own routine Git

- The working agent commits, pushes, branches, merges authorised work into
  `main`, rebases and cleans up branches and worktrees **without asking**,
  and reports what it did.
- Judge a command by **what it could lose, not by its name**. `reset`,
  `branch -D`, `stash drop` and `worktree remove` are routine once nothing
  unique is lost; a harmless-looking command that destroys the only copy of
  work is not.
- Only an explicit owner instruction ("I will handle Git this session")
  suspends this, for that session.
- Routine Git never approves a pending product design; the owner still
  decides those ([owner.md](../owner.md)).

## Branches

- `main` is always releasable: the suite passes.
- Small, low-risk changes and docs go **straight to `main`** once they pass
  the required checks and the review gate (or record the small-change path
  in the commit, [review.md](review.md)).
- New features, migrations, significant changes and work of uncertain
  readiness go on a short-lived `<type>/<topic>` branch:
  `feat/search-filters`, `fix/cart-rounding`, `docs/checkout-guide`.
- **One topic per branch** (a night's branch excepted). A branch that
  grows a second topic is split.
- **A `Night` in this repository** puts all its tasks on one branch,
  `night/<yyyy-mm-dd>` (`night/2026-09-29`; a second night that day adds
  `-b`), and pushes that branch, never `main`. It creates the branch
  **before** `night-shift start`, because start commits the refreshed
  history to the branch checked out. The base is an up-to-date `main`, or
  the latest night's branch while that one is unmerged: the new night
  plans the old one's follow-up items, whose code is only there, and
  merging the later branch brings both.
- **The session after a night**, day or night, finds the night branch
  checked out with `.night-shift/history/` modified or new: the `Meter`
  (or recovery, after a crash) wrote it without committing. On the night
  branch it runs `git add -- .night-shift/history`, then
  `git commit --only -m "night-shift: history of <night id>" -- .night-shift/history`,
  commits or stashes any other work an interrupted night left, pushes the
  branch, and only then switches.
- A day session merges a night branch once the owner has opened the
  report of every night the branch brings in the `Viewer`, or said so,
  with the usual checks. A conflict inside `.night-shift/history/` takes
  either side, and an untracked file there that blocks the merge (left by
  a recovery after a crash) is deleted: the next start rewrites those
  files from the local night files (docs/design.md, D25).
- Parallel work: separate worktrees, one writer per checkout, each held by
  a named session or agent (the task's assignee).
- A child task reaching its feature branch is not the feature reaching
  `main`; record the intended target on the task.

## Integration

- **No pull requests by default.** Review and verification live on the task
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

- If CI is unavailable, the task stays in Ready, not Done, and its final
  summary says CI could not be checked. A failed run is investigated before
  anything is called done.
- Never bypass hooks or remote protections.

## Commits

- Stage the intended files explicitly and read the staged diff. Never sweep
  in unrelated work, secrets, personal data or local preference files.
- Small, coherent commits; each one builds.
- Conventional Commits, imperative, first line under 72 characters. The
  body says why and names the evidence.
- A commit that brings the work of a task from a GitHub issue to `main`
  (on the branch, so it survives a fast-forward, or the merge commit) has one
  `Closes #<n>` line per issue in its body
  ([task-flow.md](task-flow.md#github-issues)).

```text
feat: filter the catalogue by colour and size

Shoppers asked for it in every support thread this month.
Evidence: builds/tests-20260925-0312/ (suite passes), filters.png.
```

## Safety net: backup tags

Before any command that drops commits from a branch or deletes a branch
that is not fully merged (`reset --hard` to an older commit, a rebase that
drops commits, `branch -D`, a `--force-with-lease` push that replaces
commits), tag the old tip locally and say so in the report:

```sh
git tag backup/feat-search-20260925-2310 feat/search   # then reset, rebase or delete
```

The name is `backup/<branch>-<yyyymmdd-hhmm>`, with any `/` in the branch
name written as `-`.

- Merged is checked, not assumed: `git merge-base --is-ancestor <branch> main`.
- Backup tags stay local (never pushed) and are pruned after 30 days.
- Uncommitted work is stashed with a message before a reset or a branch
  switch that would lose it (`git stash push -m "before rebase onto main"`);
  a stash is dropped only after its changes are committed or known unwanted.
- Worktrees are added for parallel writers and removed, with
  `git worktree prune`, once their branch is merged or backed up.

## Protected refs

Agents may amend, rebase, reset and `--force-with-lease` a feature branch,
and delete ordinary tags and branches that are merged, or unmerged ones
once a backup tag holds their tip. Never:

- delete a branch while other agents work in parallel: an unmerged branch
  may be another agent's work in progress;
- rewrite or force-push published `main`;
- move or delete an `archive/*` tag (a snapshot before a large removal);
- move or delete a release tag (`v1`, `v2`, ...): a bad release takes the
  next number;
- run `git clean -x` or `-X`: they also wipe ignored folders that may hold
  data nothing else restores. Clear output folders by path.

Anything the owner file ([owner.md](../owner.md)) lists as needing an
explicit go stays with the owner, with the exact command shown first.
