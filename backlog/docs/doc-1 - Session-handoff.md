---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-28 23:59'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-28, end of the long day session: v18 released and current

## Where things stand
- v18 current (4fb504d) and switched to; `night-shift install .` re-run
  from the `ci` worktree (then `night-shift forget`). A running
  `night-shift view` needs a restart. v17 (a88f16c) brought file shapes
  @3 and agent decisions (TASK-46, D31); v16 cannot read @3 files, so
  every other repository needs `night-shift install .` before its first
  night on v17+.
- Done this session: TASK-11, 27-32, 34, 35, 39, 41, 44-48. Review
  reports in docs/work/TASK-<n>/reviews. TASK-46 took six context
  rounds (the owner allowed one past the cap); TASK-48 two.
- D31: an agent records each decision taken on the owner's behalf with
  `night-shift decide`; it asks only when the task cannot go on without
  it or a wrong choice would be costly to undo. The day skill asks.
- TASK-33 (desktop notification) is Ready: it waits for the owner to run
  `night-shift notify test` and click the toast.
- TASK-40 collects deferred Viewer polish (now also: the gate's Saved
  line below the fold with long cards).
- Open GitHub issue #3 (multi-select) is tracked as TASK-36.

## Next, in order
1. The owner's look at v18 on real nights (the decision cards, the gate);
   fix what they find first.
2. TASK-33: the owner's notification test.
3. The owner decides TASK-15, TASK-21, TASK-22, TASK-36.
4. TASK-40 polish, in small batches.

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
