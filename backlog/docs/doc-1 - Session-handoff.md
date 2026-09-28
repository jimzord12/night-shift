---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-28 07:10'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-28, after night 2026-09-28-a and the day session that followed it: v13 released and current (owner states, Next night tab)

## Where things stand
- v13 current (df40077) and switched to; `night-shift install .` re-run
  (no change). A running `night-shift view` shows v13 after a restart.
- Night 2026-09-28-a (TASK-24, TASK-37) and the day's TASK-38 are merged
  into `main` and Done. Branches `night/2026-09-28` and
  `feat/next-night-tab` are merged; delete them when convenient. A local
  backup tag `backup/feat-next-night-tab-20260928-1030` holds the tip
  before its last commit was replaced (it had a real repository's name
  in a task note); never push it, prune after 30 days.
- This session was the night's session too: the `Meter` writes its cost
  into `.night-shift/history/` when it ends, on `main` (checked out).
  The next session commits that with
  `git commit --only -m "night-shift: history of 2026-09-28-a" -- .night-shift/history`.
- TASK-24: one `Owner state` per night (Running, New, Needs answers,
  Ready to save, Waiting for an agent, Done), coloured by whose turn it
  is. TASK-38 (D26): a Next night tab listing every open follow-up item
  across repositories. Review reports in docs/work/TASK-24 and TASK-38.
- TASK-37: the Git Bash hook failure was the testing repository's own
  load-sensitive test; a limitation with a workaround. Night feedback F1
  (a failed history commit keeps only the hook's last line) waits for the
  owner in the Viewer.
- `npm run view` serves this checkout's Viewer on the real install at port
  4748 (the installed one stays on 4747). Evidence tools for the Viewer:
  `.local/evidence/2026-09-28-owner-states/` (`setup.ts` builds a
  synthetic night per state and item kind; `shots.mjs`, `shots-next.mjs`,
  `real-next.mjs` which blocks read marks on real data).

## Next, in order
1. D24 in order: TASK-25 (Inbox; also owns: the phone scroll target, the
   chip-row heading, Morning going stale when items are settled elsewhere,
   and a night whose items a running night took still showing Waiting for
   an agent), TASK-26 (report page; the truncated "Not started" in the
   phone grid), TASK-28 (save gate), TASK-33 (notification); TASK-29 carries
   the file-shape version change and the discuss clause of the owner state.
   D26 made the navigation Inbox, Next night and History.
2. The owner decides TASK-36 (multi-select), TASK-22 (preflight), TASK-21
   (install from a fresh clone), and whether F1 becomes a task.

## Watch out
- The public repository names no real project: check notes and reports
  before pushing (a real repository's name slipped into a task note on
  2026-09-28 and was removed before main).
- Releases: the branch and the tag must not share a name.
- Reviewer subagents must set NIGHT_SHIFT_ROOT in the same command as the
  CLI, or they write to the owner's real `~/.night-shift/`.
- In this shell, `cd <dir> && <cmd>` chains sometimes fail silently (the
  command rewrite hook); use `cd <dir>; <cmd>`.
- Deleting anything under `.local/` needs the owner's go (the permission
  settings block it).
- Open review notes: TASK-24 round 4 N1-N4 (App.tsx error state races);
  TASK-38 round 2 M1 (a crashed night hides its items until a reload),
  M2 (skipped_follow_ups and the sort untested).
