---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-28 22:30'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-28, end of the long day session: v16 released and current

## Where things stand
- v16 current (a601390) and switched to; `night-shift install .` re-run
  (from the `ci` worktree, which was then taken off the Viewer with
  `night-shift forget`). A running `night-shift view` shows v16 after a
  restart. CHANGELOG.md lists what v16 carries (file shapes @2, let's
  discuss, the save gate, step track, keyboard morning, D29, D30).
- Done this session: TASK-11, 27, 28, 29, 30, 31, 32, 34, 35, 39, 41, 44,
  45, 47. Review reports in docs/work/TASK-<n>/reviews. TASK-34 took six
  rounds (the owner extended the cap to 8).
- TASK-33 (desktop notification) is Ready: it waits for the owner to run
  `night-shift notify test` and click the toast.
- TASK-46 (the decisions an agent took on the owner's behalf, first-class)
  needs a design decision first: where the owner marks a decision seen or
  disagrees, and whether unseen decisions keep a night in the owner's
  turn. Bring the owner the choices.
- TASK-40 collects the deferred Viewer polish from every review this
  session (focus leaving the deck, Esc twice drops a note, the focus ring
  on cream buttons, and more).
- Open GitHub issue #3 (multi-select) is tracked as TASK-36.

## Next, in order
1. The owner's look at v16 on real nights; fix what they find first.
2. TASK-33: the owner's notification test.
3. TASK-46: bring the owner the design choices.
4. The owner decides TASK-15, TASK-21, TASK-22, TASK-36.
5. TASK-40 polish, in small batches.

## Watch out
- The public repository names no real project: check notes and reports
  before pushing. Review reports carry local paths with the Windows user
  name and a sibling project's folder name (already in many reports on
  main); raise with the owner whether to filter them.
- After `git merge`, check `git merge-base --is-ancestor <branch> HEAD`
  before running gates or closing tasks; never pipe a merge through tail.
- `npm run test:ui` rebuilds web/dist: after a mutant run, rebuild before
  recording evidence from the built Viewer.
- `night-shift install .` from a worktree registers that worktree with the
  Viewer; `night-shift forget <path>` takes it off.
- Deleting anything under `.local/` needs the owner's go (the permission
  settings block it). The owner approved deleting
  `night-shift.worktrees/shapes/.local/evidence/2026-09-28-shapes/r6/show-in-folder.png`
  (a screen capture of another app); the settings still block it, so the
  owner deletes it by hand.
- Worktrees under `night-shift.worktrees/` (ci, shapes, explain, misc,
  notify) hold `.local/evidence` for this session's reviews; their
  branches are merged. The main checkout is still on `feat/save-gate`.
  Clean up with the owner's go (removing a worktree deletes its
  `.local/`).
- Reviewer subagents must set NIGHT_SHIFT_ROOT in the same command as the
  CLI, or they write to the owner's real `~/.night-shift/`.
- In this shell, heredocs with quotes and backslashes break: write scripts
  to the scratchpad or use the Edit tool.
